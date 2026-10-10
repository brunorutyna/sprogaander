const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:3});p.setDefaultTimeout(3000);
 const errs=[];p.on('pageerror',e=>errs.push('PAGEERR '+e.message+' '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error'&&!/ERR_|Failed to load/.test(m.text()))errs.push(m.text())});
 await p.goto('file://'+process.cwd()+'/index.html');await p.waitForTimeout(1600);
 const out=process.argv[2]||'/tmp/s';
 await p.screenshot({path:out+'1.png'});
 const key=async(k,n=1,d=200)=>{for(let i=0;i<n;i++){await p.keyboard.press(k);await p.waitForTimeout(d)}};
 await key('z');await p.waitForTimeout(300);await key('z');// NYT SPIL
 for(let i=0;i<24&&!(await p.$('#player-name'));i++)await key('z',1,220);
 await p.waitForTimeout(300);
 await p.waitForSelector('#player-name');await p.fill('#player-name','Bruno');await p.click('text=Det hedder jeg');await p.waitForTimeout(300);
 for(let i=0;i<6;i++)await key('z',1,260);
 await p.screenshot({path:out+'2.png'});
 console.log(await p.evaluate(()=>JSON.stringify({mode:GAME.mode,map:GAME.map&&GAME.map.id,name:S.name,SC,cw:cv.style.width})));
 // walk out
 await p.evaluate(()=>{GAME.mode='world';gotoMap('norrebro',9,6,'d')});await p.waitForTimeout(500);await p.screenshot({path:out+'3.png'});
 await p.evaluate(()=>{S.flags.fox=1;S.party=[newSpirit('ræv',8)];F.on=true;gotoMap('nyhavn',9,8,'d')});await p.waitForTimeout(700);await p.screenshot({path:out+'4.png'});
 await p.evaluate(()=>{gotoMap('osterbro',9,6,'d')});await p.waitForTimeout(700);await p.screenshot({path:out+'5.png'});
 await p.evaluate(()=>{setTimeout(()=>busy(()=>runBattle({kind:'wild',foes:[newFoe('datid1',8,'wild')]})),0)});await p.waitForTimeout(1800);await key('z');await p.waitForTimeout(400);await p.screenshot({path:out+'6.png'});
 console.log(errs.join('\n'));await b.close()})();
