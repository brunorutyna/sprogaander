module.exports=async({p,advance,tapActor,st})=>{await advance(20);
 await p.evaluate(()=>{window.__log=[];const o=step;step=async function(s){window.__log.push(JSON.stringify(s).slice(0,60));try{return await o(s)}catch(e){window.__log.push('ERR '+e.message);throw e}}});
 await tapActor('notes');for(let i=0;i<8;i++){const r=await advance(1);console.log(i,r,await p.evaluate(()=>document.getElementById('panel').className))}
 console.log(await p.evaluate(()=>window.__log.join('\n')))};
