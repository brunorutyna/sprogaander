const {chromium}=require('playwright');
(async()=>{
 const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:800},deviceScaleFactor:2});p.setDefaultTimeout(2500);
 const errs=[];p.on('pageerror',e=>errs.push('PAGEERR '+e.message+'\n'+e.stack));p.on('console',m=>{if((m.type()==='error')&&!/ERR_TUNNEL/.test(m.text()))errs.push(m.type()+': '+m.text())});
 await p.goto('file://'+process.cwd()+'/index.html');await p.waitForTimeout(800);
 const st=()=>p.evaluate(()=>({mode:GAME.mode,map:GAME.map&&GAME.map.id,x:P.x,y:P.y,modal:modal.length,sheet:!$('#sheet').hidden,menu:!!document.querySelector('.win.menu'),busy:GAME.busy,menuTxt:document.querySelector('.win.menu')?.innerText.slice(0,40)}));
 const key=async(k,n=1,d=150)=>{for(let i=0;i<n;i++){await p.keyboard.press(k);await p.waitForTimeout(d)}};
 const answer=async(right=true)=>{await p.waitForTimeout(400);const it=await p.evaluate(()=>window.__it);
   if(it.t==='mc'){const opts=await p.$$('.opt');for(const o of opts){const t=(await o.innerText()).replace(/^\d\s*/,'').trim();if((t===it.a)===right){await o.click();break}}}
   else if(it.t==='order'){for(const w of it.a.slice(it.fix)){const cs=await p.$$('.pool .chipw');for(const c of cs){if((await c.innerText()).trim()===w){await c.click();break}}}await p.click('text=Tjek')}
   else{await p.fill('#sheetIn input',right?it.a[0]:'xyz');await p.keyboard.press('Enter')}
   await p.waitForTimeout(250);await p.click('text=Videre ▶');await p.waitForTimeout(250);return it};
 const drive=async(max=200,right=()=>true)=>{for(let i=0;i<max;i++){const s=await st();
   if(s.sheet){if(await p.$('#sheetIn .opt, #sheetIn .pool, #sheetIn input')){await answer(right())}else{await key('Escape')}continue}
   if(s.menu){if(/KÆMP/.test(s.menuTxt)){await key('z');continue}
     if(/Hurtigsvar|Lytte|Sætning|Skrive/.test(s.menuTxt)){ // pick strongest available
       await p.evaluate(()=>{const bs=[...document.querySelectorAll('.win.menu .mi')];const ok=bs.filter(b=>!b.classList.contains('off'));ok[ok.length-1].dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}))});await p.waitForTimeout(200);continue}
     await key('z');continue}
   if(!s.modal&&!s.busy)return s;await key('z',1,120)}return st()};
 const gogo=async(fn)=>{await p.evaluate(fn);await p.waitForTimeout(250)};
 await p.evaluate(()=>{window.__log=[];const o=say;say=(a,b,c)=>{window.__log.push(String(a).slice(0,70));return o(a,b,c)}});
 await p.evaluate(()=>{S=Object.assign(freshState(),{started:true,name:'Bruno'});S.flags={fox:1,tut:1,kim1:1};S.party=[newSpirit('ræv',22),newSpirit('hej1',13)];S.caught.ræv=1;GAME.mode='world';
   const o=buildOutdoor(OUT[OUT_INDEX.osterbro]);const g=buildInterior(o,2);gotoMap(g.id,4,3,'u',{quiet:true});
   // master hilsner so Hejling can evolve
   for(const i of BANK)if(i.topic==='hej')S.stats[i.id]={box:4,seen:4,right:4,wrong:0}});
 await key('z');let s=await drive();console.log('gym done',JSON.stringify(s));
 console.log(await p.evaluate(()=>JSON.stringify({badges:S.badges,money:S.money,bag:S.bag,party:S.party.map(x=>[x.sp,x.lv])})));
 await p.screenshot({path:'/tmp/claude-0/-home-claude/96f873e2-b183-5b09-81db-580e3cc4ac3b/scratchpad/f_17afterGym.png'});
 // gate battle at Østerbro bottom
 await gogo(()=>{gotoMap('osterbro',9,16,'d')});await p.keyboard.down('ArrowDown');await p.waitForTimeout(400);await p.keyboard.up('ArrowDown');
 s=await drive();console.log('gate',JSON.stringify(s));
 await p.keyboard.down('ArrowDown');await p.waitForTimeout(500);await p.keyboard.up('ArrowDown');await p.waitForTimeout(400);
 console.log('passed gate?',JSON.stringify(await st()));
 // nurse
 await gogo(()=>{const o=MAPS.osterbro;const im=buildInterior(o,0);gotoMap(im.id,5,3,'u',{quiet:true});S.party[0].hp=3});
 await key('z');s=await drive();console.log('nurse hp',await p.evaluate(()=>S.party[0].hp+'/'+maxHp(S.party[0])+' heal='+JSON.stringify(S.heal)));
 // shop
 await gogo(()=>{const o=MAPS.osterbro;const im=buildInterior(o,1);gotoMap(im.id,5,3,'u',{quiet:true})});
 await key('z');await p.waitForTimeout(500);await p.click('.irow .btn >> nth=0');await p.waitForTimeout(300);await p.screenshot({path:'/tmp/claude-0/-home-claude/96f873e2-b183-5b09-81db-580e3cc4ac3b/scratchpad/f_18shop.png'});await key('Escape');
 console.log('bag after shop',await p.evaluate(()=>JSON.stringify(S.bag)+' '+S.money));
 // final hall
 await gogo(()=>{S.badges=[1,2,3,4,5,6];S.party=[newSpirit('ræv',40)];gotoMap('borgergade',9,12,'u')});
 await p.keyboard.down('ArrowUp');await p.waitForTimeout(300);await p.keyboard.up('ArrowUp');await p.waitForTimeout(500);
 console.log('in school?',JSON.stringify(await st()));
 for(let k=0;k<12;k++){await p.keyboard.down('ArrowUp');await p.waitForTimeout(220);await p.keyboard.up('ArrowUp');await p.waitForTimeout(150);s=await st();if(s.busy||s.modal){s=await drive(300)}}
 console.log('final pos',JSON.stringify(await st()));
 await key('z');s=await drive(400);
 console.log('after boss',await p.evaluate(()=>JSON.stringify({champ:S.flags.champion,beaten:Object.keys(S.beaten)})));
 console.log(await p.evaluate(()=>window.__log.slice(-60).join('\n')));
 console.log(errs.join('\n'));await b.close()})();
