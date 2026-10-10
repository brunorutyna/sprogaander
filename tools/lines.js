// Builds the voice manifest: every voiced line (+ simpler variant) and every word form / chunk.
const fs=require('fs');const src=f=>fs.readFileSync(__dirname+'/../src/'+f,'utf8').replace(/^const /gm,'global.').replace(/^function (\w+)/gm,'global.$1=function');
global.FL={};eval(src('lex.js'));eval(src('story.js'));eval(src('hash.js'));
const out=[];const seen=new Set();
const add=(who,text)=>{if(!text||who==='du'||!CHARS[who])return;const id=lineId(who,text);if(seen.has(id))return;seen.add(id);out.push({id,who,text,v:CHARS[who].voice})};
const walk=x=>{if(Array.isArray(x)){if(typeof x[0]==='string'&&typeof x[1]==='string'&&CHARS[x[0]]){add(x[0],x[1]);if(x[2]&&x[2].s)add(x[0],x[2].s);return}x.forEach(walk);return}
  if(x&&typeof x==='object')for(const k in x)if(typeof x[k]==='object')walk(x[k])};
walk(SCRIPTS);
const words=new Set();const addw=t=>{for(const w of (t||'').toLowerCase().match(/[a-zæøåé]+/g)||[])if(FORMS[w])words.add(w)};
const walkw=x=>{if(typeof x==='string')addw(x.replace(/\{N\}/g,''));else if(Array.isArray(x))x.forEach(walkw);else if(x&&typeof x==='object')for(const k in x)if(k!=='e'&&k!=='id')walkw(x[k])};
walkw(SCRIPTS);for(const c of CHUNKS)words.add(c.w);for(const k in LEX)words.add(k);
const W=[...words].map(w=>({id:'w'+wordId(w),who:'word',text:w,v:{p:1,ls:1.05,fx:'word'}}));
fs.writeFileSync(__dirname+'/manifest.json',JSON.stringify(out.concat(W)));console.log('lines',out.length,'words',W.length);
