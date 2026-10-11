module.exports=async({p,advance,tapActor})=>{
 await p.waitForTimeout(800);
 // every lexicon entry renders without "null"
 const bad=await p.evaluate(()=>{const out=[];for(const k in LEX){gloss(k);const t=document.getElementById('gloss').innerText;if(/\bnull\b|undefined/.test(t))out.push(k)}for(const c of CHUNKS){gloss(c.w,c);const t=document.getElementById('gloss').innerText;if(/\bnull\b|undefined/.test(t))out.push(c.w)}document.getElementById('gloss').hidden=true;return out});
 console.log('gloss null/undefined:',bad.length,bad.slice(0,5));
 // audio decodes
 console.log('decode:',await p.evaluate(async()=>{await PACK.ready;const b=await clipBuffer('l/'+lineId('ilse','Nå. Så kom der endelig en.'));const w=await clipBuffer('w/'+wordId('spændende'));return [!!b&&b.duration.toFixed(2),!!w&&w.duration.toFixed(2)]}));
 // tapping the panel near the button does not advance
 const r=await p.evaluate(async()=>{const pr=say('ilse','Nå. Så kom der endelig en.',{e:'x'});await sleep(400);const before=document.querySelector('#panel .line').innerText;document.getElementById('pbody').click();document.getElementById('panel').click();await sleep(300);const still=document.querySelector('#panel .line')?.innerText===before;
   const tb=[...document.querySelectorAll('#panel .tb')].find(b=>b.textContent==='🐢');tb.click();const on=tb.classList.contains('on');document.querySelector('#panel .next').click();await pr;return{still,turtleOn:on}});
 console.log('no stray advance / turtle:',JSON.stringify(r));
 // enklere swaps English
 const en=await p.evaluate(async()=>{const o=SCRIPTS.pier_story[1][2];const pr=say('ilse',SCRIPTS.pier_story[1][1],o);await sleep(300);const b=[...document.querySelectorAll('#panel .tb')];b.find(x=>x.textContent==='EN').click();const e1=document.querySelector('#panel .en').textContent;b.find(x=>x.textContent==='enklere').click();await sleep(100);const e2=document.querySelector('#panel .en').textContent;document.querySelector('#panel .next').click();await pr;return[e1,e2]});
 console.log('EN normal/simpler:',JSON.stringify(en));
};
