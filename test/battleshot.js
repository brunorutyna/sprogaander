const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/index.html');await p.waitForTimeout(500);
await p.evaluate(()=>{S=Object.assign(freshState(),{started:true,name:'B'});S.flags={fox:1,tut:1,kim1:1};S.party=[newSpirit('hej2',22)];GAME.mode='world';gotoMap('norrebro',9,8,'d',{quiet:true})});
await p.waitForTimeout(800);await p.screenshot({path:'/tmp/claude-0/-home-claude-sprogaander/96f873e2-b183-5b09-81db-580e3cc4ac3b/scratchpad/w_world.png'});
await p.evaluate(()=>{setTimeout(()=>runBattle({kind:'wild',foes:[newFoe('slang2',18,'wild')]}),0)});await p.waitForTimeout(2500);await p.screenshot({path:'/tmp/claude-0/-home-claude-sprogaander/96f873e2-b183-5b09-81db-580e3cc4ac3b/scratchpad/w_battle.png'});
console.log(errs.join('\n')||'no errors');await b.close()})();
