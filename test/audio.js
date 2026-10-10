const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+process.cwd()+'/index.html');await p.waitForTimeout(800);await p.keyboard.press('x');await p.waitForTimeout(1200);
 console.log(await p.evaluate(()=>JSON.stringify({state:AU.ctx&&AU.ctx.state,song:AU.curName,amb:AU.ambKey,step:AU.step})));
 await p.evaluate(()=>{S=Object.assign(freshState(),{started:true,name:'B'});S.flags={fox:1};GAME.mode='world';gotoMap('nyhavn',9,8,'d')});await p.waitForTimeout(1500);
 console.log(await p.evaluate(()=>JSON.stringify({song:AU.curName,amb:AU.ambKey,step:AU.step})));
 ['ok','bad','hit','heal','badge','catch'].forEach(k=>p.evaluate(k=>sfx(k),k));await p.waitForTimeout(500);
 console.log(errs.join('\n')||'no errors');await b.close()})();
