/* ================= ENGINE: state, scenes, camera, input, script runner ================= */
const SAVE_KEY='mellemrum.v1';
let S=null,FL={};
function freshSave(){return{v:1,name:'',scene:'train',x:null,flags:{},seen:{},tapped:{},items:{},free:[],vol:{music:.5,voice:1,amb:.5,sfx:.7},textSize:1,hint:''}}
function save(){try{S.flags=FL;localStorage.setItem(SAVE_KEY,JSON.stringify(S))}catch(e){}}
function load(){try{const j=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');if(j&&j.v===1){S=Object.assign(freshSave(),j);FL=S.flags;return true}}catch(e){}S=freshSave();FL=S.flags;return false}

const GAME={mode:'title',scene:null,busy:false,talker:null,shows:[],t:0};
const P={x:40,tx:null,face:1,walk:0,moving:false,after:null};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

/* ---------------------------------------------------------------- canvas + layers */
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
let DPR=1,CW=360,CHh=400,KD=4,KC=4,VW=80,LAYERS=[],OVER=null,needFit=true,builtFor='';
function fit(){const st=document.getElementById('stage');const r=st.getBoundingClientRect();
  DPR=Math.min(2,window.devicePixelRatio||1);CW=Math.max(200,r.width);CHh=Math.max(160,r.height);
  const w=Math.round(CW*DPR),h=Math.round(CHh*DPR);if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h}
  KD=h/100;KC=CHh/100;VW=w/KD;buildLayers(true)}
try{new ResizeObserver(()=>{needFit=true}).observe(document.getElementById('stage'))}catch(e){addEventListener('resize',()=>{needFit=true})}
function sceneW(){const sc=SCENES[GAME.scene];return sc?sc.w:VW}
function buildLayers(force){const id=GAME.scene;if(!id)return;const key=id+':'+cv.width+'x'+cv.height;if(!force&&key===builtFor)return;builtFor=key;
  const A=ART[SCENES[id].art],W=Math.max(sceneW(),VW);
  LAYERS=A.layers.map(L=>{const LW=VW+(W-VW)*L.par;const c=mkCanvas(LW*KD,cv.height);const x=c.getContext('2d');x.setTransform(KD,0,0,KD,0,0);L.paint(x,LW);return{par:L.par,c}});
  // vignette + film grain (static, never animated)
  OVER=mkCanvas(cv.width,cv.height);const o=OVER.getContext('2d');
  o.fillStyle=rg(o,cv.width/2,cv.height*.45,cv.height*.35,Math.max(cv.width,cv.height)*.85,[[0,'rgba(0,0,0,0)'],[1,'rgba(4,2,10,.55)']]);o.fillRect(0,0,cv.width,cv.height);
  const g=mkCanvas(160,160),gx=g.getContext('2d'),id2=gx.createImageData(160,160);for(let i=0;i<id2.data.length;i+=4){const v=Math.random()*255;id2.data[i]=id2.data[i+1]=id2.data[i+2]=v;id2.data[i+3]=10}gx.putImageData(id2,0,0);
  o.fillStyle=o.createPattern(g,'repeat');o.fillRect(0,0,cv.width,cv.height)}

/* ---------------------------------------------------------------- scene state */
let CAM=0;
function actorsOf(){const sc=SCENES[GAME.scene];return(sc.actors||[]).filter(a=>vis(a))}
function spotsOf(){const sc=SCENES[GAME.scene];return(sc.spots||[]).filter(a=>vis(a))}
function vis(a){if(a.hideIf&&FL[a.hideIf])return false;if(a.when&&!FL[a.when])return false;return true}
function actorY(a){return a.perch?28.6:a.sit?79:FLOOR}
async function goScene(id,o={}){
  if(GAME.scene){await fade(true,o.fade)}
  GAME.scene=id;S.scene=id;const sc=SCENES[id];P.x=o.at!=null?o.at:sc.spawn;P.tx=null;P.moving=false;P.face=P.x>sc.w/2?-1:1;S.x=P.x;GAME.shows=[];
  buildLayers(true);CAM=camTarget();save();showPlace();
  await fade(false,o.fade);
  if(sc.onEnter){GAME.busy=true;await run(sc.onEnter);GAME.busy=false;idlePanel()}}
function camTarget(){const W=sceneW();if(W<=VW)return-(VW-W)/2;return Math.max(0,Math.min(W-VW,P.x-VW/2))}
async function fade(out,kind){const f=document.getElementById('fade');f.className=kind==='white'?'white':'';
  if(out){f.hidden=false;await sleep(20);f.style.opacity=1;await sleep(kind==='white'?1400:450)}else{f.style.opacity=0;await sleep(kind==='white'?1200:450);f.hidden=true}}

/* ---------------------------------------------------------------- input: tap to walk / interact */
function toWorld(e){const r=cv.getBoundingClientRect();return{x:CAM+(e.clientX-r.left)/KC,y:(e.clientY-r.top)/KC}}
cv.addEventListener('pointerdown',e=>{audioWake();if(GAME.mode!=='play'||GAME.busy)return;const p=toWorld(e);
  // actors
  let best=null,bd=1e9;
  for(const a of actorsOf()){const ay=actorY(a),h=a.perch?8:32;if(Math.abs(p.x-a.x)<7&&p.y>ay-h-4&&p.y<ay+4){const d=Math.abs(p.x-a.x);if(d<bd){bd=d;best={kind:'actor',o:a}}}}
  for(const s of spotsOf()){const d=Math.hypot(p.x-s.x,(p.y-s.y)*.8);if(d<8&&d<bd){bd=d;best={kind:'spot',o:s}}}
  const sc=SCENES[GAME.scene];
  for(const x2 of sc.exits||[]){if(Math.abs(p.x-x2.x)<9&&!best){best={kind:'exit',o:x2}}}
  sfx('sel');
  if(best){const o=best.o;let tx=o.x;if(best.kind==='actor'){tx=P.x<o.x?o.x-12:o.x+12;if(o.perch)tx=P.x<o.x?o.x-6:o.x+6}if(best.kind==='spot')tx=o.x+(P.x<o.x?-4:4);
    walkTo(tx,()=>interact(best))}
  else walkTo(p.x,null)});
function walkTo(x,after){const W=sceneW();P.tx=Math.max(3,Math.min(W-3,x));P.after=after;if(Math.abs(P.tx-P.x)<.5){P.tx=null;if(after)after()}}
async function interact(b){if(GAME.busy)return;GAME.busy=true;const o=b.o;
  try{if(b.kind==='actor'){P.face=o.x>P.x?1:-1;o._face=o.x>P.x?-1:1;await run(o.run)}
    else if(b.kind==='spot'){P.face=o.x>P.x?1:-1;await run(o.run)}
    else if(b.kind==='exit')await tryExit(o)}
  finally{GAME.busy=false;if(GAME.mode==='play')idlePanel()}}
async function tryExit(x2){if(x2.when&&!FL[x2.when]){if(x2.locked)await run(x2.locked);P.x+=x2.x<10?6:-6;return}
  await goScene(x2.to,{at:x2.at})}
addEventListener('keydown',e=>{if(GAME.mode!=='play'||GAME.busy)return;if(e.key==='ArrowLeft'){walkTo(P.x-12)}if(e.key==='ArrowRight'){walkTo(P.x+12)}});

/* ---------------------------------------------------------------- script runner */
async function run(id){const steps=SCRIPTS[id];if(!steps){console.warn('no script',id);return}const r=await runSteps(steps);return r==='stop'?'stop':undefined}
async function runSteps(steps){for(const st of steps){const r=await step(st);if(r==='skip')return;if(r==='stop')return'stop'}}
async function step(st){
  if(Array.isArray(st)){if(typeof st[0]==='string'&&CHARS[st[0]])return say(st[0],st[1],st[2]||{});return runSteps(st)}
  if(st.once){if(FL['_'+st.once])return'skip';FL['_'+st.once]=1;save();return}
  if('if' in st){const ok=typeof st.if==='function'?st.if():!!FL[st.if];return runSteps(ok?(st.then||[]):(st.else||[]))}
  if(st.set){FL[st.set]=1;save();return}
  if(st.run)return run(st.run);
  if(st.go){await goScene(st.go,{fade:st.fade,at:st.at});return'stop'}
  if(st.wait)return sleep(st.wait);
  if(st.chime){sfx('chime');return sleep(600)}
  if(st.hint){S.hint=typeof st.hint==='function'?st.hint():st.hint;save();return}
  if(st.sign){FL['sign_'+st.sign]=1;save();sfx('sign');return sleep(700)}
  if(st.chapterEnd){await chapterEnd(st.chapterEnd);return}
  for(const k of['pick','build','fix','gaps','type','listen','free'])if(st[k]){const ok=await challenge(k,st[k]);
    if(st[k].lamp){FL.lamps=Math.max(FL.lamps||0,st[k].lamp);save();sfx('lamp');await sleep(500)}return}
}

/* ---------------------------------------------------------------- world update + draw */
let lastT=0;
function speakerPos(who){if(who==='fort'||who==='du')return{x:P.x,y:FLOOR-34};const a=(SCENES[GAME.scene].actors||[]).find(a=>a.id===who);if(a)return{x:a.x,y:actorY(a)-(a.perch?10:34)};
  const s=(SCENES[GAME.scene].spots||[]).find(s=>s.id==='speaker');if(s)return{x:s.x,y:s.y+6};return{x:P.x,y:40}}
function update(dt){
  if(P.tx!=null){const d=P.tx-P.x;const sp=30*dt;if(Math.abs(d)<=sp){P.x=P.tx;P.tx=null;P.moving=false;const f=P.after;P.after=null;if(f)f()}else{P.x+=Math.sign(d)*sp;P.face=Math.sign(d);P.moving=true;P.walk+=dt*1.7}}
  else P.moving=false;
  // walking past an exit
  if(!GAME.busy&&P.moving){for(const x2 of SCENES[GAME.scene].exits||[]){const pastL=x2.x<10&&P.x<=x2.x,pastR=x2.x>10&&P.x>=x2.x;if(pastL||pastR){P.tx=null;P.moving=false;interact({kind:'exit',o:x2});break}}}
  const tgt=camTarget();CAM+=(tgt-CAM)*Math.min(1,dt*5);if(Math.abs(tgt-CAM)<.01)CAM=tgt}
function draw(now){
  const sc=SCENES[GAME.scene],A=ART[sc.art];ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=A.bg;ctx.fillRect(0,0,cv.width,cv.height);
  const camPx=CAM*KD;const world=()=>ctx.setTransform(KD,0,0,KD,-Math.round(camPx),0);
  let backDone=false;const doBack=()=>{if(backDone)return;backDone=true;if(A.back){world();A.back(ctx,now,CAM,VW);ctx.setTransform(1,0,0,1,0,0)}};
  for(const L of LAYERS){if(L.par>1)continue;if(L.par>=1)doBack();ctx.drawImage(L.c,-Math.round(camPx*L.par),0)}
  doBack();world();
  if(A.dyn)A.dyn(ctx,now,CAM,VW);
  // markers (behind characters)
  if(!GAME.busy&&GAME.mode==='play'){const pulse=.5+.5*Math.sin(now/600);
    for(const s of spotsOf())marker(s.x,s.y,pulse,Math.abs(P.x-s.x)<16?s.label:null);
    for(const a of actorsOf()){const y=actorY(a)-(a.perch?11:36);marker(a.x,y,pulse,Math.abs(P.x-a.x)<18?CHARS[a.id].name:null,true)}
    for(const x2 of sc.exits||[])if(!x2.when||FL[x2.when])exitMarker(x2,now)}
  // characters sorted (actors then player)
  const amb=A.amb,rim=A.rim;
  for(const a of actorsOf()){const f=a._face||a.face;drawChar(ctx,a.id,a.x,actorY(a),{face:f,t:now,sit:a.sit,talk:GAME.talker===a.id,amb,rim})}
  if(sc.art!=='none')drawChar(ctx,'du',P.x,FLOOR,{face:P.face,walk:P.walk,moving:P.moving,t:now,amb,rim,talk:GAME.talker==='du'});
  drawShows(now);
  ctx.setTransform(1,0,0,1,0,0);
  for(const L of LAYERS){if(L.par<=1)continue;ctx.drawImage(L.c,-Math.round(camPx*L.par),0)}
  if(OVER)ctx.drawImage(OVER,0,0)}
function marker(x,y,p,label,small){ctx.strokeStyle=`rgba(255,240,220,${.35+.35*p})`;ctx.lineWidth=.35;ctx.beginPath();ctx.arc(x,y,(small?1.3:1.8)+p*.6,0,Math.PI*2);ctx.stroke();circ(ctx,x,y,.45,'rgba(255,245,230,.9)');
  if(label){ctx.font=`600 2.9px ${FONT_UI}`;const w=ctx.measureText(label).width+3.2;fr(ctx,x-w/2,y-7.4,w,4.2,2.1,'rgba(14,10,20,.78)');ctx.fillStyle='#f6eee2';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label,x,y-5.25)}}
function exitMarker(x2,now){const s=Math.sin(now/400)*.6;const dir=x2.x<10?-1:1;const X=x2.x+(dir<0?2:-2)+s*dir,Y=FLOOR-8;ctx.strokeStyle='rgba(255,240,220,.7)';ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(X-dir*1.2,Y-1.8);ctx.lineTo(X+dir*.6,Y);ctx.lineTo(X-dir*1.2,Y+1.8);ctx.stroke();
  if(Math.abs(P.x-x2.x)<22){ctx.font=`600 2.6px ${FONT_UI}`;ctx.fillStyle='rgba(255,240,220,.85)';ctx.textAlign=dir<0?'left':'right';ctx.textBaseline='middle';ctx.fillText(x2.label,X+(dir<0?-1:1),Y-5)}}
/* words shown as pictures above the speaker */
function showWords(who,words){const pos=speakerPos(who);words.forEach((w,i)=>{const e=lookup(w)||LEX[w];if(!e||!e.p)return;GAME.shows.push({w,p:e.p,x:pos.x+(i-(words.length-1)/2)*11,y:pos.y-4,t0:performance.now()+i*450})})}
function drawShows(now){GAME.shows=GAME.shows.filter(s=>now-s.t0<4200);for(const s of GAME.shows){const k=(now-s.t0)/4200;if(k<0)continue;const a=k<.1?k/.1:k>.8?(1-k)/.2:1;const y=s.y-k*3;
  ctx.globalAlpha=a;drawGlow(ctx,s.x,y,7,'#fff2d8',.5);ctx.globalAlpha=a;ctx.font='5.2px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(s.p,s.x,y);
  ctx.font=`600 2.6px ${FONT_UI}`;const w=ctx.measureText(s.w).width+2.4;fr(ctx,s.x-w/2,y+3.6,w,3.4,1.7,'rgba(14,10,20,.75)');ctx.fillStyle='#fff3dc';ctx.fillText(s.w,s.x,y+5.35);ctx.globalAlpha=1}}
function loop(now){const dt=Math.min(.05,(now-(lastT||now))/1000);lastT=now;
  if(needFit){needFit=false;fit()}
  if(GAME.mode==='play'&&GAME.scene){update(dt);draw(now)}else if(GAME.mode==='title')drawTitle(now);
  audioTick(now);requestAnimationFrame(loop)}
const FONT_UI="'IBM Plex Sans','Atkinson Hyperlegible',system-ui,sans-serif";
/* title backdrop: the pier art, slowly panning */
function drawTitle(now){if(GAME.scene!=='pier'){GAME.scene='pier';buildLayers(true)}const W=SCENES.pier.w;CAM=(Math.sin(now/9000)*.5+.5)*Math.max(0,W-VW)*.5;
  const A=ART.pier;ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=A.bg;ctx.fillRect(0,0,cv.width,cv.height);const camPx=CAM*KD;
  for(const L of LAYERS){if(L.par>=1)break;ctx.drawImage(L.c,-Math.round(camPx*L.par),0)}ctx.setTransform(KD,0,0,KD,-Math.round(camPx),0);A.back(ctx,now,CAM,VW);ctx.setTransform(1,0,0,1,0,0);
  for(const L of LAYERS){if(L.par<1)continue;ctx.drawImage(L.c,-Math.round(camPx*L.par),0)}ctx.setTransform(KD,0,0,KD,-Math.round(camPx),0);A.dyn(ctx,now,CAM,VW);ctx.setTransform(1,0,0,1,0,0);if(OVER)ctx.drawImage(OVER,0,0)}
