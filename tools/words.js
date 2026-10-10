// Lists every Danish word form used in the story (for lexicon coverage)
const fs=require('fs');global.FL={};eval(fs.readFileSync(__dirname+'/../src/story.js','utf8').replace(/^const /gm,'global.'));
const out=new Map();const add=(t,src)=>{if(!t||typeof t!=='string')return;for(const w of t.replace(/\{N\}/g,'').toLowerCase().match(/[a-zæøåé]+/g)||[]){out.set(w,(out.get(w)||0)+1)}};
const walk=(x)=>{if(Array.isArray(x)){if(typeof x[0]==='string'&&typeof x[1]==='string'&&CHARS[x[0]]){add(x[1]);if(x[2]){add(x[2].s)}return}x.forEach(walk);return}
  if(x&&typeof x==='object'){for(const k of Object.keys(x)){if(['e','id','hint'].includes(k))continue;const v=x[k];if(typeof v==='string'){if(k!=='set'&&k!=='run'&&k!=='go'&&k!=='once'&&k!=='sign'&&k!=='if')add(v.replace(/[\[\]|]/g,' '))}else walk(v)}}};
walk(SCRIPTS);
if(process.argv[2]==='json'){console.log(JSON.stringify([...out.keys()].sort()))}else console.log([...out.entries()].sort().map(([w,n])=>w).join(' ')+'\n'+out.size);
