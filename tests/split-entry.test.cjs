const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const source=html.slice(html.indexOf('function calculateEqualShares'),html.indexOf("$('calculateSplit').onclick"));
const calculate=vm.runInNewContext(source+';calculateEqualShares',{s:{user:{username:'owner'}}});
test('equal shares preserve seven-decimal total and allow reviewed amounts',()=>{
 assert.equal(calculate('10','alice bob carol'),'alice 3.3333334\nbob 3.3333333\ncarol 3.3333333');
 assert.equal(calculate('0.0000002','alice,bob'),'alice 0.0000001\nbob 0.0000001');
 assert.equal(calculate('200000','alice;bob'),'alice 100000.0000000\nbob 100000.0000000');
});
test('invalid or duplicate participants and own username are rejected',()=>{
 for(const names of ['alice','alice Alice','alice owner','alice !bad'])
  assert.throws(()=>calculate('10',names));
 for(const amount of ['-1','1e2','Infinity','0.0000001','200001'])
  assert.throws(()=>calculate(amount,'alice bob'));
});
