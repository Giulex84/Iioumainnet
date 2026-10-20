const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{startRedis}=require('./redis-helper.cjs');
(async()=>{const redis=await startRedis();if(!redis)throw Error('Attendance tests require REDIS_TEST_SERVER');try{
const file=fs.existsSync('lib/store.ts')?'lib/store.ts':'lib/store.js',source=fs.readFileSync(file,'utf8');
const code=['ATTENDANCE','REPORT'].map(name=>source.match(new RegExp('// BEGIN MINIMAL '+name+'([\\s\\S]*?)// END MINIMAL '+name))[1].replace(/export /g,'')).join('\n');
const store=vm.runInNewContext(code+';({recordMetric,getMetricsReport})',{command:redis.command,Date,Math});
const day=new Date().toISOString().slice(0,10),oldDay=new Date(Date.now()-86400000).toISOString().slice(0,10),prefix=source.match(/const prefix=("[^"]+")/)[1];
const p=JSON.parse(prefix),first=p+(file.endsWith('.ts')?'first-seen:':'login-first-seen-v1:');
await redis.command(['SET',first+'known',oldDay]);
await redis.command(['HSET',p+'events:'+oldDay,'login',7,'daily_completed',4]);await redis.command(['PFADD',p+'unique:'+oldDay,'old-user']);
await Promise.all(Array.from({length:10},()=>store.recordMetric(day,'new','login')));await store.recordMetric(day,'known','login');
const before=await redis.command(['DBSIZE']);assert.equal(await store.recordMetric(day,'ignored','daily_completed','receipt',55),false);assert.equal(await redis.command(['DBSIZE']),before);
let rows=await store.getMetricsReport(2),row=rows.find(r=>r.day===day);assert.equal(row.uniqueUsers,2);assert.equal(row.returningUsers,1);assert.equal(row.events.login,11);assert.equal(row.tracking,'login-only');
const old=rows.find(r=>r.day===oldDay);assert.equal(old.events.login,7);assert.equal(old.uniqueUsers,1);assert.equal(await redis.command(['HGET',p+'events:'+oldDay,'daily_completed']),'4','history is preserved');assert.equal(old.tracking,'legacy-activity');
assert.equal(await redis.command(['GET',first+'known']),oldDay);assert((await redis.command(['TTL',p+'login-users-v1:'+day]))>0);
const profile='game-data:unchanged';await redis.command(['SET',profile,'keep']);await store.recordMetric(day,'known','login');assert.equal(await redis.command(['GET',profile]),'keep');
await store.recordMetric(oldDay,'cohort','login');await store.recordMetric(day,'cohort','login');row=(await store.getMetricsReport(2)).find(r=>r.day===day);assert.equal(row.returningUsers,2);assert.equal(row.uniqueUsers,3);
await store.recordMetric(oldDay,'known','login');assert.equal(await redis.command(['GET',first+'known']),oldDay,'older observations never move first-seen forward');
console.log('Attendance: concurrent login counts, exact daily dedupe, returning users, ignored events, retention and preserved history passed.');
}finally{await redis.stop()}})().catch(e=>{console.error(e);process.exitCode=1});
