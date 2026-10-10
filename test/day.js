const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:430,height:900},deviceScaleFactor:3});p.setDefaultTimeout(3000);
 const errs=[];p.on('pageerror',e=>errs.push('PAGEERR '+e.message));
 await p.goto('file://'+process.cwd()+'/index.html');await p.waitForTimeout(1200);
 const out=process.argv[2];let i=0;
 const shot=async()=>{await p.waitForTimeout(700);await p.evaluate(()=>{$('#place').hidden=true});const el=await p.$('#screen');await el.screenshot({path:out+'d'+(i++)+'.png'})};
 await p.evaluate(()=>{S=Object.assign(freshState(),{started:true,name:'Bruno',daynight:false,weatherOff:true});S.flags={fox:1,tut:1,kim1:1};S.party=[newSpirit('ræv',12)];GAME.mode='world'});
 for(const [m,x,y] of [['norrebro',9,6],['r1',9,6],['osterbro',9,7],['r2',9,8],['vesterbro',9,8],['r3',9,6],['christianshavn',9,8],['orestad',9,8],['nyhavn',9,7],['r6',9,8],['frederiksberg',9,8],['borgergade',9,12]]){await p.evaluate(([m,x,y])=>gotoMap(m,x,y,'d',{quiet:true}),[m,x,y]);await shot()}
 await p.evaluate(()=>{const o=MAPS.osterbro;gotoMap(buildInterior(o,0).id,4,4,'u',{quiet:true})});await shot();
 await p.evaluate(()=>{const o=MAPS.osterbro;gotoMap(buildInterior(o,2).id,4,8,'u',{quiet:true})});await shot();
 await p.evaluate(()=>{setTimeout(()=>busy(()=>runBattle({kind:'wild',foes:[newFoe('vejr1',8,'wild')]})),0)});await p.waitForTimeout(2200);await p.keyboard.press('z');await p.waitForTimeout(600);await p.keyboard.press('z');await p.waitForTimeout(500);const el=await p.$('#screen');await el.screenshot({path:out+'d'+(i++)+'.png'});
 console.log(errs.join('\n'));await b.close()})();
