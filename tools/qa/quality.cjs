const {spawnSync}=require('node:child_process'),fs=require('node:fs'),path=require('node:path');
const config=require('../../quality.config.json');const env={...process.env};
// CI and local verification must never inherit production credentials.
for(const key of ['PI_API_KEY','DATABASE_URL','UPSTASH_REDIS_REST_URL','UPSTASH_REDIS_REST_TOKEN','CLOUDFLARE_API_TOKEN','VERCEL_TOKEN','ARENA_METRICS_KEY'])delete env[key];
env.NODE_PATH=[path.resolve('tools/qa/node_modules'),process.env.NODE_PATH].filter(Boolean).join(path.delimiter);
if(config.redis&&!process.argv.includes('--browser')){const result=spawnSync('which',['redis-server'],{encoding:'utf8'});env.REDIS_TEST_SERVER=process.env.REDIS_TEST_SERVER||result.stdout.trim();if(!env.REDIS_TEST_SERVER||!fs.existsSync(env.REDIS_TEST_SERVER))throw Error('Local redis-server required. No integration test may be skipped.');}
const commands=process.argv.includes('--browser')?['node tools/qa/browser-smoke.cjs'] : config.commands;
for(const command of commands){console.log('VERIFY',command);const r=spawnSync(command,{shell:true,stdio:'inherit',env});if(r.status!==0)process.exit(r.status||1)}
