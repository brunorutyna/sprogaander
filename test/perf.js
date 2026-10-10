module.exports=async({p})=>{const cdp=await p.context().newCDPSession(p);
 await p.evaluate(()=>{S.name='B';GAME.mode='play';FL.pierDone=1;FL._town_in=1;GAME.scene=null;goScene('town')});await p.waitForTimeout(2500);
 for(const thr of[1,4]){await cdp.send('Emulation.setCPUThrottlingRate',{rate:thr});
  const r=await p.evaluate(async()=>{let n=0,worst=0,last=performance.now();const t0=last;walkTo(380);await new Promise(res=>{const f=()=>{const now=performance.now();worst=Math.max(worst,now-last);last=now;n++;if(now-t0<5000)requestAnimationFrame(f);else res()};requestAnimationFrame(f)});return{fps:(n/5).toFixed(1),worst:worst.toFixed(0)}});
  console.log('throttle',thr,JSON.stringify(r));await p.evaluate(()=>{P.x=20;walkTo(20)})}};
