const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const source=html.slice(html.indexOf('function calculateEqualShares'),html.indexOf("let lastCalculatedRows"));
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


test('specific username errors identify the name to correct',()=>{
 assert.throws(()=>calculate('30','Alice,Bob,Me'),/@Me:.*3–32/);
 assert.throws(()=>calculate('30','alice,Alice'),/@Alice:.*more than once/);
 assert.throws(()=>calculate('30','alice,owner'),/@owner:.*own username/);
 assert.throws(()=>calculate('30','alice,b!b'),/@b!b:.*only letters/);
 assert.equal(calculate('20','Alice,Bob'),'Alice 10.0000000\nBob 10.0000000');
});
test('calculation summary matches rows and cannot remain stale',()=>{
 const elements=new Map();const $=id=>{if(!elements.has(id))elements.set(id,{value:'',textContent:'',hidden:true,events:{},addEventListener(type,fn){this.events[type]=fn},focus(){}});return elements.get(id)};
 const script=html.slice(html.indexOf('function parseSplitRows'),html.indexOf('function showSplitLinks'));
 vm.runInNewContext(script,{$,s:{user:{username:'owner'}}});
 $('splitTotal').value='20';$('splitNames').value='Alice,Bob';$('calculateSplit').onclick();
 assert.equal($('splitRows').value,'Alice 10.0000000\nBob 10.0000000');assert.equal($('splitSummary').hidden,false);assert.match($('splitSummary').textContent,/2 private shares.*20.0000000 Pi/);
 $('splitTotal').value='30';$('splitTotal').events.input();assert.equal($('splitSummary').hidden,true);assert.equal($('splitRows').value,'');
 $('calculateSplit').onclick();$('splitRows').value='Alice 12\nBob 18';$('splitRows').events.input();assert.equal($('splitSummary').hidden,true);$('splitNames').events.input();assert.equal($('splitRows').value,'Alice 12\nBob 18');
 $('splitNames').value='Alice,Bob,Me';$('calculateSplit').onclick();assert.match($('splitError').textContent,/@Me/);assert.equal($('splitSummary').hidden,true);
 $('splitForm').events.reset();assert.equal($('splitError').textContent,'');
});
