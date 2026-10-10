const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true});
 const cdp=await p.context().newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:+(process.env.THR||4)});
 p.on('pageerror',e=>console.log('ERR',e.message));
 await p.goto('file://'+process.cwd()+'/index.html');await p.waitForTimeout(800);
 await p.evaluate(()=>{S=Object.assign(freshState(),{started:true,name:'B'});S.flags={fox:1,tut:1,kim1:1};S.party=[newSpirit('ræv',22)];GAME.mode='world';ENC_OFF=1;
   window.__st={miss:0,made:0,frames:[],fits:0};
   const og=getChunk;getChunk=function(m,cx,cy,s,make){const had=CHUNKS.has(m.id+':'+cx+':'+cy);const r=og.apply(this,arguments);if(make&&!had)__st.made++;return r};
   const of=fillRectProbe=null;
   const odm=drawMapChunks;drawMapChunks=function(){const before=__st.made;return odm.apply(this,arguments)};
   const ow=drawWorld;drawWorld=function(n,d){const t=performance.now();ow(n,d);__st.frames.push(performance.now()-t)};
   const ofs=fitScreen;fitScreen=function(){__st.fits++;return ofs()};
   gotoMap('norrebro',9,8,'d',{quiet:true});window.__raf=0;window.__modes={};const L=loop;(function c(){__raf++;__modes[GAME.mode]=(__modes[GAME.mode]||0)+1;requestAnimationFrame(c)})()});
 const walk=async(k,ms)=>{await p.keyboard.down(k);await p.waitForTimeout(ms);await p.keyboard.up(k)};
 for(let i=0;i<3;i++){await walk('ArrowDown',2500);await walk('ArrowRight',800);await walk('ArrowUp',2500);await walk('ArrowLeft',800)}
 const r=await p.evaluate(()=>{const f=__st.frames.slice().sort((a,b)=>a-b);return{n:f.length,med:f[f.length>>1],p95:f[Math.floor(f.length*.95)],max:f[f.length-1],made:__st.made,fits:__st.fits,map:GAME.map.id,size:CHUNKS.size,K,raf:__raf,slow:__st.frames.filter(x=>x>30).length,modes:__modes,busy:GAME.busy,modal:modal.length,pos:[P.x,P.y]}});
 console.log(JSON.stringify(r));await b.close()})();
