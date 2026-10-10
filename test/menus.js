const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
p.setDefaultTimeout(3000);const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/index.html');await p.waitForTimeout(500);
await p.evaluate(()=>{S=Object.assign(freshState(),{started:true,name:'Anna'});S.flags={fox:1,tut:1,kim1:1};S.party=[newSpirit('ræv',12),newSpirit('hej1',8)];S.seen={ræv:1,hej1:1};S.caught={ræv:1,hej1:1};GAME.mode='world';gotoMap('norrebro',9,8,'d',{quiet:true})});
await p.waitForTimeout(400);
const st=()=>p.evaluate(()=>({busy:GAME.busy,sheet:!$('#sheet').hidden,title:document.querySelector('#sheetIn h2')?.innerText,panels:PANELS.length,pos:P.x+','+P.y}));
const key=async(k,d=600)=>{await p.keyboard.press(k);await p.waitForTimeout(d)};
const walk=async()=>{const a=await p.evaluate(()=>P.y);await p.keyboard.down('ArrowUp');await p.waitForTimeout(500);await p.keyboard.up('ArrowUp');await p.waitForTimeout(300);return a!==await p.evaluate(()=>P.y)};
// 1: Åndebog → spirit → back → back → walk
await key('Enter');console.log('menu label:',await p.evaluate(()=>document.querySelector('.win.menu').innerText.replace(/\n/g,' ')));
await key('z');await p.waitForTimeout(300);console.log('dex',JSON.stringify(await st()));
await p.click('.dx.got >> nth=1');await p.waitForTimeout(600);console.log('entry',JSON.stringify(await st()));
await key('Escape');console.log('back',JSON.stringify(await st()));
await key('Escape');console.log('closed',JSON.stringify(await st()));
console.log('can walk after dex:',await walk());
// 2: Ånder panel close via ✕
await key('Enter');await key('ArrowRight');await key('z');console.log('party',JSON.stringify(await st()));await p.click('.xbtn');await p.waitForTimeout(300);console.log('can walk after party:',await walk());
// 3: practice from dex entry
await key('Enter');await key('z');await p.click('.dx.got >> nth=1');await p.waitForTimeout(700);await p.click('text=Øv emnet');await p.waitForTimeout(500);
console.log('practice',JSON.stringify(await st()));
for(let i=0;i<40;i++){const s=await st();if(!s.busy)break;
  if(s.sheet){if(await p.$('#sheetIn .opt')){await p.click('#sheetIn .opt >> nth=0')}else if(await p.$('#sheetIn input')){await p.fill('#sheetIn input','x');await p.keyboard.press('Enter')}else if(await p.$('#sheetIn .pool .chipw')){const cs=await p.$$('#sheetIn .pool .chipw');for(const c of cs)await c.click();await p.click('text=Tjek').catch(()=>{})}
    await p.waitForTimeout(250);await p.click('text=Videre ▶').catch(()=>{});await p.waitForTimeout(250)}else await key('z',200)}
console.log('after practice',JSON.stringify(await st()),'can walk:',await walk());
console.log(errs.join('\n')||'no errors');await b.close()})();
