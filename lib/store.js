import { randomUUID } from 'node:crypto';

function redisConfig() {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL ||
    process.env.STORAGE_REST_API_URL ||
    process.env.STORAGE_KV_REST_API_URL ||
    process.env.STORAGE_REDIS_REST_URL ||
    process.env.UPSTASH_REDIS_REST_KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_KV_REST_URL;

  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN ||
    process.env.STORAGE_REST_API_TOKEN ||
    process.env.STORAGE_KV_REST_API_TOKEN ||
    process.env.STORAGE_REDIS_REST_TOKEN ||
    process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN;

  if (!url || !token) {
    const error = new Error('Persistent storage is not configured');
    error.status = 503;
    throw error;
  }

  return { url: url.replace(/\/$/, ''), token };
}

async function command(args) {
  const { url, token } = redisConfig();
  const response = await fetch(url,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(args)});
  const data = await response.json();
  if (!response.ok || data?.error) { const error = new Error(data?.error || `Storage error ${response.status}`); error.status = 503; throw error; }
  return data.result;
}
export async function getJson(key){const raw=await command(['GET',key]);if(!raw)return null;try{return JSON.parse(raw)}catch{return null}}
export async function setJson(key,value){await command(['SET',key,JSON.stringify(value)]);return value}
export async function sadd(key,value){return command(['SADD',key,value])}
export async function smembers(key){return (await command(['SMEMBERS',key]))||[]}
export async function srem(key,value){return command(['SREM',key,value])}
const P='iiou-mainnet:';
export const iouKey=id=>`${P}iou:${id}`;
export const userIousKey=uid=>`${P}user:${uid}:ious`;
export const usernameKey=username=>`${P}username:${String(username).toLowerCase()}`;
export const pendingKey=username=>`${P}pending:${String(username).toLowerCase()}`;
const rateKey=(uid,bucket)=>`${P}rate:${bucket}:${uid}`;
const lockKey=id=>`${P}lock:iou:${id}`;
const metricsUniqueKey=day=>`${P}metrics:unique:${day}`;
const metricsEventsKey=day=>`${P}metrics:events:${day}`;
const metricsDedupeKey=id=>`${P}metrics:dedupe:${id}`;

export async function recordMetric(day,subject,event,dedupeId=''){
  const script=`if ARGV[3]~='' then local created=redis.call('SET',KEYS[3],'1','NX','EX',ARGV[4]); if not created then return 0 end end; redis.call('PFADD',KEYS[1],ARGV[1]); redis.call('EXPIRE',KEYS[1],ARGV[4]); redis.call('HINCRBY',KEYS[2],ARGV[2],1); redis.call('EXPIRE',KEYS[2],ARGV[4]); return 1`;
  return Number(await command(['EVAL',script,'3',metricsUniqueKey(day),metricsEventsKey(day),metricsDedupeKey(dedupeId||'none'),subject,event,dedupeId,'34560000']))===1;
}
export async function getMetricsReport(days){
  const count=Math.max(1,Math.min(90,Math.trunc(Number(days)||30))),keys=[],labels=[];
  for(let offset=0;offset<count;offset++){const date=new Date(Date.now()-offset*86400000).toISOString().slice(0,10);labels.push(date);keys.push(metricsUniqueKey(date),metricsEventsKey(date))}
  const script=`local out={}; for i=1,#KEYS,2 do table.insert(out,{unique=redis.call('PFCOUNT',KEYS[i]),events=redis.call('HGETALL',KEYS[i+1])}) end; return cjson.encode(out)`;
  const rows=JSON.parse(await command(['EVAL',script,String(keys.length),...keys]));
  return labels.map((day,index)=>{const pairs=rows[index]?.events||[],events={};for(let i=0;i<pairs.length;i+=2)events[pairs[i]]=Number(pairs[i+1])||0;return{day,uniqueUsers:Number(rows[index]?.unique)||0,events}});
}

export async function enforceRateLimit(uid,bucket,limit,windowSeconds){
  const key=rateKey(String(uid||'anonymous'),String(bucket||'api'));
  const count=Number(await command(['INCR',key]))||1;
  if(count===1)await command(['EXPIRE',key,String(windowSeconds)]);
  if(count>limit){
    const ttl=Number(await command(['TTL',key]));
    const error=new Error('Too many requests. Please try again shortly.');
    error.status=429;
    error.retryAfter=Number.isFinite(ttl)&&ttl>0?ttl:windowSeconds;
    throw error;
  }
  return {remaining:Math.max(0,limit-count)};
}

export async function withIouLock(id,fn){
  const key=lockKey(String(id));
  const token=randomUUID();
  const acquired=await command(['SET',key,token,'NX','EX','8']);
  if(acquired!=='OK'){
    const error=new Error('This IOU is being updated. Please retry in a moment.');
    error.status=409;
    throw error;
  }
  try{return await fn();}
  finally{
    try{await command(['EVAL',"if redis.call('get',KEYS[1]) == ARGV[1] then return redis.call('del',KEYS[1]) else return 0 end",'1',key,token])}catch{}
  }
}

export async function rememberUser(user){await setJson(usernameKey(user.username),{uid:user.uid,username:user.username,updatedAt:new Date().toISOString()})}
export async function getUserByUsername(username){return getJson(usernameKey(username))}
export async function saveIou(iou){await setJson(iouKey(iou.id),iou);await sadd(userIousKey(iou.creatorUid),iou.id);if(iou.counterpartyUid)await sadd(userIousKey(iou.counterpartyUid),iou.id);else await sadd(pendingKey(iou.counterpartyUsername),iou.id);return iou}
export async function getIou(id){return getJson(iouKey(id))}
export async function claimPendingIous(user){const ids=await smembers(pendingKey(user.username));for(const id of ids){const iou=await getIou(id);if(!iou||iou.counterpartyUid){await srem(pendingKey(user.username),id);continue}if(String(iou.counterpartyUsername).toLowerCase()!==String(user.username).toLowerCase())continue;iou.counterpartyUid=user.uid;iou.counterpartyUsername=user.username;iou.updatedAt=new Date().toISOString();await setJson(iouKey(id),iou);await sadd(userIousKey(user.uid),id);await srem(pendingKey(user.username),id)}}
export async function listIousFor(uid){const ids=await smembers(userIousKey(uid));const items=await Promise.all(ids.map(getIou));return items.filter(Boolean).sort((a,b)=>new Date(b.updatedAt||b.createdAt)-new Date(a.updatedAt||a.createdAt))}
