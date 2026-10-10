const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:780},deviceScaleFactor:3});p.setDefaultTimeout(4000);
 const errs=[];p.on('pageerror',e=>errs.push('PAGEERR '+e.message+' '+(e.stack||'').split('\n').slice(1,3).join(' ')));
 await p.goto('file://'+process.cwd()+'/index.html');await p.waitForTimeout(1000);
 const out=process.argv[2];let i=0;const shot=async()=>{await p.evaluate(()=>{$('#place').hidden=true});await p.screenshot({path:out+'w'+(i++)+'.png'})};
 await p.evaluate(()=>{S=Object.assign(freshState(),{started:true,name:'Bruno',daynight:false,weatherOff:true});S.flags={fox:1,tut:1,kim1:1};S.party=[newSpirit('ræv',30),newSpirit('poss2',30)];GAME.mode='world'});
 for(const [m,x,y] of [['osterbro',9,7],['vesterbro',9,8],['christianshavn',9,8],['orestad',9,8],['nyhavn',9,7],['borgergade',9,12]]){await p.evaluate(([m,x,y])=>gotoMap(m,x,y,'d',{quiet:true}),[m,x,y]);await p.waitForTimeout(900);await shot()}
 await p.evaluate(()=>{S.daynight=true;S.weatherOff=false;gotoMap('nyhavn',9,7,'d',{quiet:true})});await p.waitForTimeout(900);await shot();
 // battle with swole enemy
 await p.evaluate(()=>{setTimeout(()=>busy(()=>runBattle({kind:'trainer',trainer:FINAL.boss,who:'Magnus',look:'magnus',leader:true,foes:[newFoe('datid2',30,'leader')]})),0)});await p.waitForTimeout(2500);await p.keyboard.press('z');await p.waitForTimeout(500);await p.keyboard.press('z');await p.waitForTimeout(600);await shot();
 // evo scene
 await p.evaluate(()=>{BT=null;GAME.mode='evo';GAME.evo={from:SP.adj1,to:SP.adj2,t0:performance.now()}});await p.waitForTimeout(900);await shot();
 await p.evaluate(()=>{GAME.evo.done=true});await p.waitForTimeout(300);await shot();
 // dex panel
 await p.evaluate(()=>{GAME.mode='world';hideDlg();modal.length=0;closeSheet();S.seen={};DEX.forEach((d,k)=>{if(k<20)S.seen[d.id]=1;if(k<8)S.caught[d.id]=1});setTimeout(dexPanel,0)});await p.waitForTimeout(800);await shot();
 console.log(errs.join('\n'));await b.close()})();
