// Browser-only checks: every remote request is blocked or fulfilled locally.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const config=require('../../quality.config.json');
const root=path.resolve(config.webRoot),errors=[],unexpected=[];let browser,server;
(async()=>{
 server=http.createServer((req,res)=>{let p;try{p=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400);return res.end()}
 const file=path.resolve(root,'.'+(p==='/'?'/index.html':p));if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end()}
 res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(file));});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true,chromiumSandbox:true,...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{})});
 for(const width of [360,390]){
 const context=await browser.newContext({viewport:{width,height:844},locale:'en-US',serviceWorkers:'block'});
 await context.route('**/*',async route=>{const u=new URL(route.request().url());
 if(u.hostname==='sdk.minepi.com')return route.fulfill({contentType:'text/javascript',body:'window.__authCalls=0;window.Pi={init:()=>{},authenticate:async()=>{window.__authCalls++;throw Error("Consent cancelled in isolated test")},createPayment:()=>{throw Error("Real payments forbidden in tests")}};'});
 if(u.origin!==origin){unexpected.push(u.origin);return route.abort()}
 if(u.pathname.startsWith('/api/'))return route.fulfill({status:u.pathname.includes('backend')&&['health','catalog'].includes(u.searchParams.get('op'))?200:401,contentType:'application/json',body:JSON.stringify(u.searchParams.get('op')==='health'?{ready:true,network:'mainnet',sdkSandbox:false,payments:false}:{apps:[],error:'Isolated unauthenticated test',success:false})});
 return route.continue();});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin+config.entry,{waitUntil:'networkidle'});assert.equal(await page.evaluate(()=>window.__authCalls),0,'Authentication must require an explicit user action');
 assert(await page.locator('body').innerText(),'Landing must contain content');
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'Horizontal overflow at '+width);
 const login=page.locator(config.loginSelector).first();assert(await login.isVisible(),'Login must be visible');await login.click();await page.waitForFunction(()=>window.__authCalls===1);
 assert.equal(await page.evaluate(()=>window.__authCalls),1);
 for(const route of ['/privacy.html','/terms.html']){const response=await context.request.get(origin+route);assert.equal(response.status(),200,route)}
 await context.close();console.log('PASS isolated Chromium '+width+': public landing, explicit consent, cancelled login, layout, privacy and terms');
 }
 assert.deepEqual(errors,[],'Unhandled browser errors');assert.deepEqual(unexpected,[],'Unexpected external dependencies');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r))});
