module.exports=async({p,advance,tapActor,walkTo,st,SHOT})=>{
 let r=await advance(20);console.log('after intro',r,JSON.stringify(await st()));
 await tapActor('notes');await p.screenshot({path:SHOT+'/m2_notes.png'});
 r=await advance(14);await p.screenshot({path:SHOT+'/m3_fix.png'});
 r=await advance(40);console.log('->',r,JSON.stringify(await st()));await p.waitForTimeout(3500);
 r=await advance(10);await p.screenshot({path:SHOT+'/m4_pier.png'});console.log('pier',JSON.stringify(await st()));
 await tapActor('ilse');r=await advance(80);console.log('ilse done',JSON.stringify(await st()));await p.screenshot({path:SHOT+'/m5_lanterns.png'});
};
module.exports.town=true;
