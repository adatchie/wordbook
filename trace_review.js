const fs = require('fs');
const { webcrypto } = require('crypto');

const store = {};
global.localStorage = { getItem(k){return store[k]??null;}, setItem(k,v){store[k]=String(v);}, removeItem(k){delete store[k];} };
if(!global.TextEncoder)global.TextEncoder=require('util').TextEncoder;
global.crypto=webcrypto;
global.btoa=(str)=>Buffer.from(str,'binary').toString('base64');
if(!global.Blob)global.Blob=class Blob{constructor(parts){this.parts=parts;}};
if(!global.URL)global.URL=class URL{static createObjectURL(){return 'blob:mock';}static revokeObjectURL(){};}
else{URL.createObjectURL=()=>'blob:mock';URL.revokeObjectURL=()=>{};}
global.speechSynthesis={cancel(){},speak(u){if(u.onend)setTimeout(()=>u.onend(),0);}};
global.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};
function makeEl(id='',cls=''){
  const set=new Set(cls.split(' ').filter(Boolean));
  const classList={add(c){set.add(c);},remove(c){set.delete(c);},toggle(c,v){if(v===undefined){if(set.has(c)){set.delete(c);return false;}set.add(c);return true;}if(v)set.add(c);else set.delete(c);return v;}};
  const style={};
  const ctxProxy=new Proxy({},{get(_,p){return()=>{};},set(){return true;}});
  return{id,className:cls,classList,style,textContent:'',innerHTML:'',value:'',href:'',download:'',disabled:false,addEventListener(){},removeEventListener(){},click(){},focus(){},showModal(){},close(){},remove(){},appendChild(){},removeChild(){},setPointerCapture(){},getBoundingClientRect(){return{left:0,top:0,width:600,height:350};},getContext(){return ctxProxy;},toDataURL(){return 'data:image/png;base64,MOCK';}};
}
const elementsById={};
function getById(id,cls=''){if(!elementsById[id])elementsById[id]=makeEl(id,cls);return elementsById[id];}
const classMap={};
function ensureClass(cls,count=1){if(!classMap[cls])classMap[cls]=[];while(classMap[cls].length<count)classMap[cls].push(makeEl('',cls));return classMap[cls];}
ensureClass('screen',7);
global.document={readyState:'complete',body:{appendChild(){},removeChild(){}},addEventListener(){},removeEventListener(){},getElementById(id){return getById(id);},querySelector(sel){if(sel.startsWith('#'))return getById(sel.slice(1));if(sel.startsWith('.'))return(classMap[sel.slice(1)]||[makeEl('',sel.slice(1))])[0];return makeEl('',sel);},querySelectorAll(sel){if(sel==='.screen')return classMap['screen']||[];if(sel.startsWith('.'))return classMap[sel.slice(1)]||[];return[];},createElement(tag){return makeEl('',tag);},visibilityState:'visible'};
global.window={addEventListener(){},removeEventListener(){}};
global.fetch=(url)=>Promise.resolve({ok:true,status:200,async json(){return{words:JSON.parse(fs.readFileSync(fs.realpathSync(__dirname+'/web-prototype/words.json'),'utf8')).words};}});
require('./web-prototype/app.js');
const wait=(ms=10)=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  await new Promise(r=>setTimeout(r,50));
  const wb=global.window.__wordbook;
  const {engine}=wb;
  engine.settings.wordCount=3;
  engine.settings.manualPassLimit=10;
  engine.settings.manualPassCooldown=0;
  engine.startSession(2,3);
  const info0=engine.getCurrentInfo();
  console.log('q0', info0.word.word);
  engine.markIncorrect();
  console.log('state after markIncorrect', engine.session.state, 'missed', engine.session.missedWordIds);
  engine.markWrongAndNext();
  await wait();
  console.log('after wrong next: currentIndex', engine.session.currentIndex, 'missed', engine.session.missedWordIds, 'state', engine.session.state);
  const info1=engine.getCurrentInfo();
  console.log('q1', info1.word.word);
  engine.markCorrect(false);
  await wait();
  const info2=engine.getCurrentInfo();
  console.log('q2', info2.word.word);
  engine.markCorrect(false);
  await wait();
  console.log('after main done: state', engine.session?engine.session.state:'completed', 'missed', engine.session?engine.session.missedWordIds:'');
})();
