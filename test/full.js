const ch1=require('./ch1.js');
module.exports=async(T)=>{const{p,advance,tapActor,walkTo,st,SHOT}=T;await ch1(T);
 await walkTo(292);await p.waitForTimeout(2500);let r=await advance(30);console.log('town',r,JSON.stringify(await st()));await p.screenshot({path:SHOT+'/m6_town.png'});
 for(const id of['s_bageri','s_apotek','holger','jonas','sif']){await tapActor(id);r=await advance(40);console.log(id,r,JSON.stringify(await st()));if(id==='s_bageri')await p.screenshot({path:SHOT+'/m7_sign.png'})}
 await p.screenshot({path:SHOT+'/m8_signs.png'});
 await tapActor('ravn');r=await advance(30);console.log('ravn',JSON.stringify(await st()));
 await tapActor('s_cafe_door');await p.waitForTimeout(1500);r=await advance(10);console.log('cafe',JSON.stringify(await st()));await p.screenshot({path:SHOT+'/m9_cafe.png'});
 await tapActor('sif');
 // capture a build challenge on screen
 for(let i=0;i<60;i++){const cls=await p.evaluate(()=>document.getElementById('panel').className);if(cls==='chal'){await p.screenshot({path:SHOT+'/m10_build.png'});break}await p.evaluate(()=>(document.querySelector('#panel .next')||document.getElementById('panel')).click());await p.waitForTimeout(320)}
 r=await advance(80);await p.waitForTimeout(800);await p.screenshot({path:SHOT+'/m11_end.png'});console.log('end',JSON.stringify(await st()),await p.evaluate(()=>GAME.mode));
};
