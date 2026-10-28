import { randomUUID } from 'node:crypto';
import { AsyncLocalStorage } from 'node:async_hooks';
const iouSnapshots=new WeakMap(),iouWrites=new AsyncLocalStorage();

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
export async function getJson(key){const raw=await command(['GET',key]);if(raw===null)return null;try{return JSON.parse(raw)}catch{throw Object.assign(new Error('Stored data requires review; no record has been overwritten'),{status:503})}}
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

// BEGIN MINIMAL ATTENDANCE
export async function recordMetric(day,subject,event,dedupeId='',value=0){
  if(event!=='login'||!subject||!/^\d{4}-\d{2}-\d{2}$/.test(day))return false;
  const prefix="iiou-mainnet:metrics:";
  const script=`
local count=redis.call('HINCRBY',KEYS[1],'login',1)
if count==1 then redis.call('EXPIRE',KEYS[1],ARGV[3]) end
if redis.call('SADD',KEYS[2],ARGV[1])==1 then
 redis.call('EXPIRE',KEYS[2],ARGV[3])
 local first=redis.call('GET',KEYS[4])
 if not first then redis.call('SET',KEYS[4],ARGV[2],'EX',ARGV[3])
 elseif first<ARGV[2] then redis.call('HINCRBY',KEYS[3],'returning',1); redis.call('EXPIRE',KEYS[4],ARGV[3]) end
 redis.call('SET',KEYS[5],ARGV[2],'NX','EX',ARGV[3])
 redis.call('HSETNX',KEYS[3],'startedAt',ARGV[4]); redis.call('EXPIRE',KEYS[3],ARGV[3])
end
return 1`;
  return Number(await command(['EVAL',script,5,prefix+'events:'+day,prefix+'login-users-v1:'+day,prefix+'login-summary-v1:'+day,prefix+"login-first-seen-v1:"+subject,prefix+'login-tracking-start-v1',subject,day,34560000,new Date().toISOString()]))===1;
}
// END MINIMAL ATTENDANCE
// BEGIN MINIMAL REPORT
export async function getMetricsReport(days){
  const count=Math.max(1,Math.min(90,Math.trunc(Number(days)||30))),prefix="iiou-mainnet:metrics:",labels=[],keys=[];
  for(let offset=0;offset<count;offset++){const day=new Date(Date.now()-offset*86400000).toISOString().slice(0,10);labels.push(day);keys.push(prefix+'events:'+day,prefix+'login-users-v1:'+day,prefix+'login-summary-v1:'+day,prefix+'unique:'+day,prefix+'returning-users:'+day)}
  keys.push(prefix+'login-tracking-start-v1');
  const script=`local out={};local start=redis.call('GET',KEYS[#KEYS]);for i=1,#KEYS-1,5 do local users=redis.call('SCARD',KEYS[i+1]);local modern=users>0;local returning=cjson.null;if modern then returning=tonumber(redis.call('HGET',KEYS[i+2],'returning') or '0') end;table.insert(out,{users=modern and users or redis.call('PFCOUNT',KEYS[i+3]),logins=tonumber(redis.call('HGET',KEYS[i],'login') or '0'),returning=returning,modern=modern,transition=(start==ARGV[(i+4)/5]),startedAt=redis.call('HGET',KEYS[i+2],'startedAt') or cjson.null}) end;return cjson.encode(out)`;
  const raw=JSON.parse(await command(['EVAL',script,keys.length,...keys,...labels]));
  return labels.map((day,i)=>{const r=raw[i]||{};return {day,uniqueUsers:Number(r.users)||0,returningUsers:r.returning===null?null:Number(r.returning)||0,events:{login:Number(r.logins)||0},tracking:r.modern?'login-only':'legacy-activity',trackingStartedAt:r.startedAt||null,transitionDay:day==="2026-10-20",dataPartial:day==='2026-10-20'}});
}
// END MINIMAL REPORT

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
  try{return await iouWrites.run({key,token},fn);}
  finally{
    try{await command(['EVAL',"if redis.call('get',KEYS[1]) == ARGV[1] then return redis.call('del',KEYS[1]) else return 0 end",'1',key,token])}catch{}
  }
}

export async function rememberUser(user){await setJson(usernameKey(user.username),{uid:user.uid,username:user.username,updatedAt:new Date().toISOString()})}
export async function getUserByUsername(username){return getJson(usernameKey(username))}
export async function saveIou(iou, nextCycle = null) {
  const before = iouSnapshots.get(iou);
  if(before && before.id !== iou.id) throw new Error('IOU identity changed');
  if(!iou.id || !iou.creatorUid || !iou.counterpartyUsername) throw new Error('Incomplete IOU identity');
  if(nextCycle && (nextCycle.id === iou.id || iou.status !== 'settled' ||
      iou.recurrenceGeneratedId !== nextCycle.id ||
      nextCycle.creatorUid !== iou.creatorUid || nextCycle.counterpartyUid !== iou.counterpartyUid ||
      nextCycle.counterpartyUsername !== iou.counterpartyUsername)) throw new Error('Invalid recurring cycle');
  const destination = record => record.counterpartyUid
    ? userIousKey(record.counterpartyUid) : pendingKey(record.counterpartyUsername);
  const previous = before ? JSON.parse(before.raw) : null;
  const keys = [iouKey(iou.id), userIousKey(iou.creatorUid), destination(iou),
    pendingKey(previous?.counterpartyUsername || iou.counterpartyUsername)];
  if(nextCycle) keys.push(iouKey(nextCycle.id),userIousKey(nextCycle.creatorUid),destination(nextCycle));
  const lock=iouWrites.getStore();
  if(lock)keys.push(lock.key);
  const script = `
local hasNext=ARGV[8]=='next'
local hasLock=ARGV[9]~=''
-- Validate every type before writing: Lua runtime errors do not roll back Redis writes.
for i,key in ipairs(KEYS) do
 local kind=redis.call('TYPE',key).ok
 if i==1 or (hasNext and i==5) or (hasLock and i==#KEYS) then
  if kind~='none' and kind~='string' then return -1 end
 elseif kind~='none' and kind~='set' then return -1 end
end
if hasLock and redis.call('GET',KEYS[#KEYS])~=ARGV[9] then return -3 end
local current=redis.call('GET',KEYS[1])
if ARGV[1]=='missing' then
 if current then return 0 end
elseif current~=ARGV[2] then return 0 end
if hasNext and redis.call('EXISTS',KEYS[5])==1 then return -2 end
redis.call('SET',KEYS[1],ARGV[3])
redis.call('SADD',KEYS[2],ARGV[4])
redis.call('SADD',KEYS[3],ARGV[4])
if ARGV[5]=='claim' then redis.call('SREM',KEYS[4],ARGV[4]) end
if hasNext then
 redis.call('SET',KEYS[5],ARGV[6])
 redis.call('SADD',KEYS[6],ARGV[7])
 redis.call('SADD',KEYS[7],ARGV[7])
end
return 1`;
  const raw=JSON.stringify(iou),nextRaw=nextCycle?JSON.stringify(nextCycle):'';
  const result=Number(await command(['EVAL',script,keys.length,...keys,
    before?'present':'missing',before?.raw || '',raw,iou.id,
    previous && !previous.counterpartyUid && iou.counterpartyUid?'claim':'keep',nextRaw,nextCycle?.id || '',nextCycle?'next':'single',lock?.token || '']));
  if(result===-1) throw Object.assign(new Error('Stored IOU indexes require review'),{status:503});
  if(result!==1) throw Object.assign(new Error('IOU changed in another request. Reload before trying again.'),{status:409});
  iouSnapshots.set(iou,{id:iou.id,raw});
  if(nextCycle) iouSnapshots.set(nextCycle,{id:nextCycle.id,raw:nextRaw});
  return iou;
}

export async function getIou(id) {
  const raw=await command(['GET',iouKey(id)]);
  if(raw===null) return null;
  let iou;
  try { iou=JSON.parse(raw); } catch {}
  if(!iou || typeof iou!=='object' || Array.isArray(iou) || iou.id!==id) {
    throw Object.assign(new Error('Stored IOU requires review; no record has been overwritten'),{status:503});
  }
  iouSnapshots.set(iou,{id,raw});
  return iou;
}

export async function claimPendingIous(user){const ids=await smembers(pendingKey(user.username));for(const id of ids){const iou=await getIou(id);if(!iou||iou.counterpartyUid){await srem(pendingKey(user.username),id);continue}if(String(iou.counterpartyUsername).toLowerCase()!==String(user.username).toLowerCase())continue;iou.counterpartyUid=user.uid;iou.counterpartyUsername=user.username;iou.updatedAt=new Date().toISOString();await saveIou(iou)}}
export async function listIousFor(uid){const ids=await smembers(userIousKey(uid));const items=await Promise.all(ids.map(getIou));return items.filter(Boolean).sort((a,b)=>new Date(b.updatedAt||b.createdAt)-new Date(a.updatedAt||a.createdAt))}

