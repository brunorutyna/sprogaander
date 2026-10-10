// Headless play-through helper: phone viewport, auto-answers challenges correctly
const {chromium}=require('playwright');
const SHOT=process.env.SHOT||'/tmp';
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
 p.setDefaultTimeout(4000);const errs=[];p.on('pageerror',e=>errs.push('PAGEERR '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto('http://localhost:8765/index.html');await p.waitForTimeout(1500);
 await p.screenshot({path:SHOT+'/m0_title.png'});
 await p.click('text=Start');await p.waitForTimeout(300);await p.fill('.inp','Bruno');await p.click('#panel >> text=Start');
 await p.waitForTimeout(1600);await p.screenshot({path:SHOT+'/m1_train.png'});
 // solve helper: answer whatever is on the panel
 const solve=async()=>p.evaluate(()=>{const cls=document.getElementById('panel').className;return cls});
 const advance=async(n)=>{for(let i=0;i<n;i++){const cls=await p.evaluate(()=>document.getElementById('panel').className);
   if(cls.startsWith('say')){await p.evaluate(()=>document.getElementById('panel').click());await p.waitForTimeout(320);continue}
   if(cls==='chal'){await answer();continue}
   return cls}};
 const answer=async()=>{const info=await p.evaluate(()=>{const id=window.__cur;return id});
   // use the exposed current challenge
   const c=await p.evaluate(()=>window.__chal);
   if(!c){await p.waitForTimeout(200);return}
   if(c.kind==='pick'||(c.kind==='fix'&&c.c.opts)||c.kind==='listen'){const want=c.kind==='listen'?c.c.opts[c.c.a]:c.c.opts[c.c.a].replace('{N}','Bruno');await p.waitForTimeout(400);await p.click(`.opt:text-is("${want}")`)}
   else if(c.kind==='build'||c.kind==='fix'){const toks=c.c.words.split(' ').filter(t=>!/^[.,!?]$/.test(t));for(let i=0;i<toks.length;i++){const t=i===0?(await p.evaluate(w=>{const e=lookup(w);return e&&e.k==='name'?w:w.toLowerCase()},toks[0])):toks[i];await p.click(`.pool .chip:text-is("${t}")`)}await p.click('text=Tjek')}
   else if(c.kind==='gaps'){const ans=[...c.c.text.matchAll(/\[([^|\]]+)/g)].map(m=>m[1]);for(let i=0;i<ans.length;i++){await p.locator('.gap').nth(i).locator(`.chip:text-is("${ans[i]}")`).click()}await p.click('text=Tjek')}
   else if(c.kind==='type'){await p.fill('.inp',c.c.a[0]);await p.click('text=Tjek')}
   else if(c.kind==='free'){await p.fill('.inp',c.c.model);await p.click('text=Send')}
   await p.waitForTimeout(300);await p.click('text=Videre');await p.waitForTimeout(300)};
 module.exports={};
 const walkTo=async(x)=>{await p.evaluate(x=>{walkTo(x,null)},x);await p.waitForTimeout(200);for(let i=0;i<60;i++){if(!(await p.evaluate(()=>P.moving||P.tx!=null)))break;await p.waitForTimeout(100)}};
 const tapActor=async(id)=>{console.log('tap',id,JSON.stringify(await st()));await p.evaluate(id=>{const a=actorsOf().find(a=>a.id===id)||spotsOf().find(s=>s.id===id);const kind=a.run&&actorsOf().includes(a)?'actor':'spot';walkTo(a.x+(P.x<a.x?-12:12),()=>interact({kind,o:a}))},id);for(let i=0;i<120;i++){await p.waitForTimeout(100);if(await p.evaluate(()=>GAME.busy))break}await p.waitForTimeout(400)};
 const st=()=>p.evaluate(()=>({scene:GAME.scene,busy:GAME.busy,panel:document.getElementById('panel').className,x:Math.round(P.x),flags:Object.keys(FL).join(',')}));
 globalThis.T={p,advance,tapActor,walkTo,st,errs,SHOT,b};
 await require(process.argv[2])(globalThis.T);
 console.log(errs.length?errs.join('\n'):'no errors');await b.close()})();
