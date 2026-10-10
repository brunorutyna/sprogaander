/* ================= RENDERER: smooth vector world at native resolution ================= */
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
const lc=mkc(4,4),lx=lc.getContext('2d');
let DPR=1,CW=360,CH=480,TILE=44,K=1; // CW/CH css px; TILE css px per tile; K device px per world unit
let lastFs='';
function fitScreen(){
  const scr=document.getElementById('screen');const r=scr.getBoundingClientRect();
  // 2x is visually indistinguishable on phones and draws 2.25x fewer pixels than 3x
  DPR=Math.min(2,window.devicePixelRatio||1);CW=Math.max(200,r.width);CH=Math.max(200,r.height);
  const w=Math.round(CW*DPR),h=Math.round(CH*DPR);
  if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h;lc.width=Math.ceil(w/2);lc.height=Math.ceil(h/2)}
  TILE=Math.max(38,Math.min(76,Math.min(CW/8.2,CH/10)));K=TILE*DPR/16;
  const fs=Math.max(14,Math.min(19,CW/24))+'px';if(fs!==lastFs){lastFs=fs;document.documentElement.style.setProperty('--fs',fs)}
}
// Resizing a canvas wipes it; doing that inside the observer callback shows a blank frame
// (e.g. whenever the phone's address bar slides). Defer to the next animation frame, which redraws immediately.
let needFit=false;
try{new ResizeObserver(()=>{needFit=true}).observe(document.getElementById('screen'))}catch(e){addEventListener('resize',()=>{needFit=true})}
const chunkScale=()=>K;
/* soft light sprites (cheap to stamp vs. building gradients every frame) */
const LIGHT_SPR=(()=>{const c=mkc(128,128),x=c.getContext('2d');const g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(.5,'rgba(0,0,0,.5)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,128,128);return c})();
const GLOW_SPR={};function glowSpr(col){let c=GLOW_SPR[col];if(c)return c;c=mkc(128,128);const x=c.getContext('2d');const g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,rgba(col,1));g.addColorStop(1,rgba(col,0));x.fillStyle=g;x.fillRect(0,0,128,128);return GLOW_SPR[col]=c}
const CLOUD_SPR=(()=>{const c=mkc(128,128),x=c.getContext('2d');const g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(20,24,40,.15)');g.addColorStop(1,'rgba(20,24,40,0)');x.fillStyle=g;x.fillRect(0,0,128,128);return c})();

/* ---- time of day + weather ---- */
function timeOfDay(){const d=new Date();const hr=d.getHours()+d.getMinutes()/60;
  if(S.daynight===false)return{phase:'day',dark:0,tint:null,hr};
  const lerp=(a,b,t)=>a+(b-a)*Math.max(0,Math.min(1,t));
  if(hr>=7.5&&hr<17)return{phase:'day',dark:0,tint:null,hr};
  if(hr>=17&&hr<19.5){const t=(hr-17)/2.5;return{phase:'dusk',dark:lerp(0,.45,t),tint:`rgba(255,120,70,${lerp(.08,.16,t)})`,hr}}
  if(hr>=6&&hr<7.5){const t=(hr-6)/1.5;return{phase:'dawn',dark:lerp(.45,0,t),tint:`rgba(255,160,190,${lerp(.14,.04,t)})`,hr}}
  return{phase:'night',dark:.55,tint:'rgba(40,50,130,.10)',hr};}
const NUMW=['tolv','et','to','tre','fire','fem','seks','syv','otte','ni','ti','elleve','tolv'];
function klokkenDa(d){d=d||new Date();let h=d.getHours()%12,m=Math.round(d.getMinutes()/5)*5;if(m===60){m=0;h=(h+1)%12}const H=NUMW[h],N=NUMW[(h+1)%12];
  return({0:H,5:'fem minutter over '+H,10:'ti minutter over '+H,15:'kvart over '+H,20:'ti minutter i halv '+N,25:'fem minutter i halv '+N,30:'halv '+N,35:'fem minutter over halv '+N,40:'ti minutter over halv '+N,45:'kvart i '+N,50:'ti minutter i '+N,55:'fem minutter i '+N})[m]}
function weatherFor(m){if(!m||!m.outdoor)return'none';if(S.weatherOff)return'clear';const d=new Date();const key=d.toLocaleDateString('sv-SE')+':'+Math.floor(d.getHours()/3)+':'+m.area;
  let h=0;for(const ch of key)h=(h*31+ch.charCodeAt(0))>>>0;const r=hsh(h,7,3);
  const rain=m.area===5?.32:.16,wind=/r3|r4|r5|christianshavn|nyhavn/.test(m.id)?.22:.1,cloud=.25;
  if(r<rain)return'rain';if(r<rain+wind)return'wind';if(r<rain+wind+cloud)return'cloudy';return'clear'}
const WEATHER_DA={clear:['Solen skinner','The sun is shining'],cloudy:['Det er overskyet','It\'s cloudy'],rain:['Det regner','It\'s raining'],wind:['Det blæser','It\'s windy'],night:['Det er stjerneklart','The sky is full of stars']};
function weatherLine(m){const w=weatherFor(m);const tod=timeOfDay();const k=w==='clear'&&tod.phase==='night'?'night':w;return WEATHER_DA[k]||null}

/* ---- particles: world units ('world'/'ground') or css px ('battle') ---- */
const PARTS=[];
function addP(p){if(PARTS.length<500)PARTS.push(Object.assign({life:1,age:0,vx:0,vy:0,g:0,layer:'world'},p))}
function stepParts(dt){for(let i=PARTS.length-1;i>=0;i--){const p=PARTS[i];p.age+=dt;if(p.age>=p.life){PARTS.splice(i,1);continue}p.vy+=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt}}
function drawParts(x,layer,u){u=u||1;for(const p of PARTS){if(p.layer!==layer)continue;const t=p.age/p.life;
  if(p.t==='dust'){circ(x,p.x,p.y,(1+t*1.6)*u,`rgba(230,215,180,${.5*(1-t)})`)}
  else if(p.t==='smoke'){circ(x,p.x,p.y,(1.4+t*3)*u,`rgba(220,218,214,${.35*(1-t)})`)}
  else if(p.t==='leaf'){x.save();x.translate(p.x,p.y);x.rotate(p.age*3);ell(x,0,0,1.4*u,.7*u,p.c||'#d39a3a');x.restore()}
  else if(p.t==='spark'){circ(x,p.x,p.y,(p.s||1.6)*u*(1-t*.6),p.c||'#fff')}
  else if(p.t==='rustle'){ell(x,p.x,p.y,.5*u,1.1*u,PAL.tallLt)}
  else if(p.t==='splash'){x.strokeStyle=`rgba(210,230,255,${.6*(1-t)})`;x.lineWidth=.4*u;x.beginPath();x.ellipse(p.x,p.y,(1+t*3)*u,(.4+t)*u,0,0,Math.PI*2);x.stroke()}
  else if(p.t==='firefly'){const a=.5+.5*Math.sin(p.age*5+p.ph);circ(x,p.x,p.y,.9*u,`rgba(240,255,150,${a})`);circ(x,p.x,p.y,2.4*u,`rgba(240,255,150,${a*.2})`)}
  else if(p.t==='butterfly'){const f=Math.abs(Math.sin(p.age*14));x.fillStyle=p.c;x.beginPath();x.ellipse(p.x-f*1.2*u,p.y,f*1.2*u+.2,.9*u,0,0,Math.PI*2);x.ellipse(p.x+f*1.2*u,p.y,f*1.2*u+.2,.9*u,0,0,Math.PI*2);x.fill()}
  else if(p.t==='gull'){const f=Math.sin(p.age*7);x.strokeStyle='#f4f4f0';x.lineWidth=.8*u;x.lineCap='round';x.beginPath();x.moveTo(p.x-3*u,p.y-f*1.2*u);x.quadraticCurveTo(p.x-1.2*u,p.y-1.5*u,p.x,p.y);x.quadraticCurveTo(p.x+1.2*u,p.y-1.5*u,p.x+3*u,p.y-f*1.2*u);x.stroke();ell(x,p.x+4*u,p.y+14*u,2.5*u,.6*u,'rgba(0,0,0,.15)')}
  else if(p.t==='glyph'){x.globalAlpha=1-Math.max(0,t-.7)/.3;x.font=`700 ${(p.sz||16)}px ${FONT_SIGN}`;x.textAlign='center';x.textBaseline='middle';x.fillStyle=p.c||'#fff';x.shadowColor=p.glow||'#ff7ad9';x.shadowBlur=10;x.fillText(p.ch,p.x,p.y);x.shadowBlur=0;x.globalAlpha=1}
  else if(p.t==='ring'){x.strokeStyle=p.c||'#fff';x.globalAlpha=1-t;x.lineWidth=3*(1-t)+1;x.beginPath();x.arc(p.x,p.y,4+t*(p.r||40),0,Math.PI*2);x.stroke();x.globalAlpha=1}
  else if(p.t==='star'){x.globalAlpha=1-t;x.fillStyle=p.c||'#fff1a8';x.beginPath();const r=(p.s||5)*(1-t*.5);for(let k=0;k<8;k++){const a=k*Math.PI/4,rr2=k%2?r*.35:r;x.lineTo(p.x+Math.cos(a)*rr2,p.y+Math.sin(a)*rr2)}x.fill();x.globalAlpha=1}
}}
let ambT=0;
function ambientParticles(m,cx,cy,vw,vh,dt,tod,wx){if(!m.outdoor)return;ambT+=dt;if(ambT<.05)return;ambT=0;
  const park=/norrebro|r1|r4|r6|frederiksberg|osterbro/.test(m.id),harbour=/r2|r3|r5|christianshavn|nyhavn/.test(m.id);const L=cx-vw/2,Tp=cy-vh/2;
  for(const c of m.chimneys||[])if(Math.random()<.2)addP({t:'smoke',x:c.x+Math.random()*2,y:c.y,vx:(wx==='wind'?14:3)+Math.random()*3,vy:-6-Math.random()*4,life:2.4,layer:'world'});
  if(wx==='wind'&&Math.random()<.45)addP({t:'leaf',x:L-4,y:Tp+Math.random()*vh,vx:55+Math.random()*40,vy:(Math.random()-.5)*12,life:6,c:AUTUMN[Math.floor(Math.random()*4)]});
  if(park&&wx!=='rain'&&Math.random()<.05&&tod.phase!=='night')addP({t:'leaf',x:L+Math.random()*vw,y:Tp-4,vx:(Math.random()-.3)*10,vy:9+Math.random()*6,life:8,c:AUTUMN[Math.floor(Math.random()*4)]});
  if(park&&tod.phase==='day'&&wx==='clear'&&Math.random()<.02)addP({t:'butterfly',x:L+Math.random()*vw,y:Tp+Math.random()*vh,vx:(Math.random()-.5)*16,vy:(Math.random()-.5)*8,life:6,c:['#f6f2e4','#f4d14a','#a6c8f0'][Math.floor(Math.random()*3)]});
  if(tod.phase==='night'&&wx!=='rain'&&Math.random()<.12&&m.grassTiles&&m.grassTiles.length){const g=m.grassTiles[Math.floor(Math.random()*m.grassTiles.length)];addP({t:'firefly',x:g[0]*16+Math.random()*16,y:g[1]*16+Math.random()*10,vx:(Math.random()-.5)*5,vy:(Math.random()-.5)*5,life:4,ph:Math.random()*6})}
  if(harbour&&tod.phase!=='night'&&Math.random()<.012)addP({t:'gull',x:L-10,y:Tp+10+Math.random()*vh*.5,vx:26+Math.random()*16,vy:(Math.random()-.5)*4,life:14});
  if(wx==='rain')for(let k=0;k<3;k++)addP({t:'splash',x:L+Math.random()*vw,y:Tp+Math.random()*vh,life:.3,layer:'ground'});
}
const RAIN=[];for(let i=0;i<140;i++)RAIN.push({x:Math.random(),y:Math.random(),s:.6+Math.random()*.6});
function drawWeather(wx,t,dt){
  if(wx==='cloudy'||wx==='rain'){for(let k=0;k<3;k++){const cx=((t/70000*(.6+k*.2)+k*.37)%1.4-.2)*cv.width,cy=(.2+k*.3)*cv.height;const r=cv.width*.4;ctx.drawImage(CLOUD_SPR,cx-r,cy-r,r*2,r*2)}}
  if(wx==='rain'){ctx.fillStyle='rgba(40,55,80,.14)';ctx.fillRect(0,0,cv.width,cv.height);ctx.strokeStyle='rgba(200,222,255,.45)';ctx.lineWidth=Math.max(1,DPR*.9);ctx.beginPath();
    for(const d of RAIN){d.y+=dt*1.5*d.s;d.x+=dt*.22*d.s;if(d.y>1){d.y-=1;d.x=Math.random()}if(d.x>1)d.x-=1;const X=d.x*cv.width,Y=d.y*cv.height;ctx.moveTo(X,Y);ctx.lineTo(X-4*DPR,Y-13*DPR)}ctx.stroke()}
}
function drawLights(m,toScr,tod,camL){
  if(!m.outdoor||tod.dark<=.01){if(tod.tint&&m.outdoor){ctx.fillStyle=tod.tint;ctx.fillRect(0,0,cv.width,cv.height)}return}
  const sc=.5;lx.setTransform(1,0,0,1,0,0);lx.globalCompositeOperation='source-over';lx.clearRect(0,0,lc.width,lc.height);lx.fillStyle=`rgba(8,10,34,${tod.dark})`;lx.fillRect(0,0,lc.width,lc.height);
  lx.globalCompositeOperation='destination-out';const L=[];
  for(const l of m.lamps)L.push([l.x,l.y,l.r||52,1,l.c]);
  for(const w of m.windows)L.push([w.x+w.w/2,w.y+w.h/2,w.soft?20:15,.75]);
  for(const d of m.doorLights)L.push([d.x,d.y,18,.8]);
  for(const g of m.signGlow)L.push([g.x,g.y,22,.9,g.c]);
  L.push([(P.x+P.fx)*16+8,(P.y+P.fy)*16+4,34,.5]);
  for(const p of PARTS)if(p.t==='firefly')L.push([p.x,p.y,7,.7]);
  const vis=[];for(const l of L){const[sx,sy]=toScr(l[0],l[1]);const r=l[2]*K;if(sx<-r||sy<-r||sx>cv.width+r||sy>cv.height+r)continue;vis.push([sx,sy,r,l[3],l[4]])}
  for(const[sx,sy,r,s]of vis){lx.globalAlpha=s;lx.drawImage(LIGHT_SPR,(sx-r)*sc,(sy-r)*sc,r*2*sc,r*2*sc)}
  lx.globalAlpha=1;lx.globalCompositeOperation='source-over';
  ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=true;ctx.drawImage(lc,0,0,cv.width,cv.height);
  ctx.globalCompositeOperation='lighter';
  for(const[sx,sy,r,s,c]of vis){if(r<16*K)continue;const rr2=r*.85;ctx.globalAlpha=Math.min(1,.24*tod.dark*s);ctx.drawImage(glowSpr(c||'#ffaa50'),sx-rr2,sy-rr2,rr2*2,rr2*2)}
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  if(tod.tint){ctx.fillStyle=tod.tint;ctx.fillRect(0,0,cv.width,cv.height)}
}

/* ---- world ---- */
// Blit pre-rendered chunks 1:1 in device pixels. oyD = device-pixel vertical offset of map M; (ox,oy) camera.
function drawMapChunks(M,oyD,ox,oy){const R=chunkRange(M);const s=K;
  const spanT=Math.floor(R.top*16*s),spanB=Math.floor(R.bot*16*s);
  const L=-ox,T=-oy-oyD,Rr=L+cv.width,B=T+cv.height; // visible device rect in M's own pixel space
  for(let cy=R.cy0;cy<=R.cy1;cy++){const y0=chEdge(cy,s),y1=chEdge(cy+1,s);if(y1<=T||y0>=B)continue;
    const a=Math.max(y0,spanT),b=Math.min(y1,spanB);if(b<=a)continue;
    for(let cx=R.cx0;cx<=R.cx1;cx++){const x0=chEdge(cx,s),x1=chEdge(cx+1,s);if(x1<=L||x0>=Rr)continue;
      const c=getChunk(M,cx,cy,s,true);
      ctx.drawImage(c,0,a-y0,c.width,b-a,x0+ox,a+oyD+oy,c.width,b-a)}}}
// When idle, render one missing chunk around the view (one chunk ring of margin) so walking never waits.
function prewarm(M){const R=chunkRange(M);const s=K,sz=CHK*16*s;const pcx=Math.floor((P.x*16+8)*s/sz),pcy=Math.floor((P.y*16+8)*s/sz);
  const rx=Math.ceil(cv.width/sz/2)+1,ry=Math.ceil(cv.height/sz/2)+1;
  if((2*rx+1)*(2*ry+1)>CH_MAX-4)return;
  for(let d=0;d<=Math.max(rx,ry);d++)for(let dy=-Math.min(d,ry);dy<=Math.min(d,ry);dy++)for(let dx=-Math.min(d,rx);dx<=Math.min(d,rx);dx++){
    if(Math.max(Math.abs(dx),Math.abs(dy))!==d)continue;const cx=pcx+dx,cy=pcy+dy;if(cx<R.cx0||cx>R.cx1||cy<R.cy0||cy>R.cy1)continue;
    if(!getChunk(M,cx,cy,s,false)){getChunk(M,cx,cy,s,true);return true}}
  return false}
let lastWarm=0;
function drawWorld(now,dt){
  const m=GAME.map;prepMap(m);
  const tod=timeOfDay();const wx=weatherFor(m);const wind=wx==='wind'?1:wx==='rain'?.5:0;
  const vw=cv.width/K,vh=cv.height/K;
  const camX=(P.x+P.fx)*16+8,camY=(P.y+P.fy)*16+4;
  const ox=Math.round(cv.width/2-camX*K),oyy=Math.round(cv.height/2-camY*K);const camL=-ox/K,camT=-oyy/K;
  ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=m.outdoor?PAL.treeDk:'#0e0c14';ctx.fillRect(0,0,cv.width,cv.height);
  ctx.imageSmoothingEnabled=false;let warm=performance.now();
  drawMapChunks(m,0,ox,oyy);
  if(m.outdoor&&m.prev&&camT<0){const pm=mapById(m.prev);prepMap(pm);drawMapChunks(pm,-Math.floor(pm.h*16*K),ox,oyy)}
  if(m.outdoor&&m.next&&camT+vh>m.h*16){const nm=mapById(m.next);prepMap(nm);drawMapChunks(nm,Math.floor(m.h*16*K),ox,oyy)}
  warm=performance.now()-warm;
  ctx.setTransform(K,0,0,K,ox,oyy);ctx.imageSmoothingEnabled=true;
  const inView=(a,b)=>a*16>camL-24&&a*16<camL+vw+8&&b*16>camT-24&&b*16<camT+vh+24;
  for(const[a,b]of m.waterTiles)if(inView(a,b))drawWaterFx(ctx,a*16,b*16,a,b,now);
  for(const[a,b]of m.grassTiles)if(inView(a,b))drawTallGrass(ctx,a*16,b*16,a,b,now,wind,false);
  if(m.outdoor&&tod.dark>.15){for(const w of m.windows){if(!inView(w.x/16,w.y/16))continue;if(hsh(w.x,w.y,Math.floor(now/90000))<.18)continue;x_glow(w,Math.min(1,tod.dark*1.4))}}
  drawParts(ctx,'ground');
  // sprites
  const spr=[];
  for(const n of m.npcs)if(npcVisible(n))spr.push({y:n.y+n.oy,draw:()=>drawPerson(ctx,n.look,n.d,(n.x+n.ox)*16,(n.y+n.oy)*16,n.walkP||0,!!n.walk),tx:n.x,ty:n.y,X:(n.x+n.ox)*16,Y:(n.y+n.oy)*16,n});
  const foxOff=6*Math.max(0,1-Math.abs((F.x+F.fx)-(P.x+P.fx)));// continuous, so the fox never jumps when you turn into it
  if(F.on&&!(F.x===P.x&&F.y===P.y&&!P.moving))spr.push({y:F.y+F.fy,draw:()=>drawFox(ctx,F.dir,(F.x+F.fx)*16+foxOff,(F.y+F.fy)*16,P.walkP,F.moving,now),tx:F.x,ty:F.y,X:(F.x+F.fx)*16,Y:(F.y+F.fy)*16,fox:1});
  spr.push({y:P.y+P.fy,draw:()=>drawPerson(ctx,'hero',P.dir,(P.x+P.fx)*16,(P.y+P.fy)*16,P.walkP,P.moving),tx:P.x,ty:P.y,X:(P.x+P.fx)*16,Y:(P.y+P.fy)*16});
  spr.sort((a,b)=>a.y-b.y);
  for(const s of spr){s.draw();
    if(tileAt(m,s.tx,s.ty)===','&&Math.abs(s.X-s.tx*16)<8&&Math.abs(s.Y-s.ty*16)<8)drawTallGrass(ctx,s.tx*16,s.ty*16,s.tx,s.ty,now,wind,true);
    if(GAME.bubble&&s.n===GAME.bubble.n)bubble(s.X+8,s.Y-14,'!','#e84a5a');
    if(s.fox&&GAME.heart&&now-GAME.heart<1300)bubble(s.X+8,s.Y-12-Math.min(3,(now-GAME.heart)/150),'♥','#e84a5a')}
  stepParts(dt);ambientParticles(m,camL+vw/2,camT+vh/2,vw,vh,dt,tod,wx);drawParts(ctx,'world');
  const toScr=(wx2,wy2)=>[wx2*K+ox,wy2*K+oyy];
  drawLights(m,toScr,tod);
  ctx.setTransform(1,0,0,1,0,0);
  if(m.outdoor)drawWeather(wx,now,dt);
  if(GAME.trip&&now-GAME.trip<7000)drawTrip(now-GAME.trip);
  if(now-GAME.fade<260){ctx.fillStyle=`rgba(10,8,16,${1-(now-GAME.fade)/260})`;ctx.fillRect(0,0,cv.width,cv.height)}
  // one chunk per idle frame; while walking at most one every 300ms so steps stay smooth
  if(warm<3&&(!P.moving||now-lastWarm>300)&&prewarm(m))lastWarm=now;
}
function x_glow(w,a){ctx.fillStyle=`rgba(255,196,110,${.85*a})`;ctx.fillRect(w.x,w.y,w.w,w.h);ctx.fillStyle=`rgba(255,235,190,${.6*a})`;ctx.fillRect(w.x,w.y,w.w,w.h*.25)}
function bubble(X,Y,ch,col){fillRR(ctx,X-4.5,Y-5,9,8.5,2.5,'#fbf7ee');ctx.fillStyle='#fbf7ee';ctx.beginPath();ctx.moveTo(X-1.5,Y+3.4);ctx.lineTo(X,Y+5.4);ctx.lineTo(X+1.5,Y+3.4);ctx.fill();
  ctx.fillStyle=col;ctx.font=`700 7px ${FONT_UI}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(ch,X,Y-.6)}
/* the kombucha moment: colour waves and a kaleidoscope, fading out */
function drawTrip(ms){ms=Math.max(0,ms);const t=ms/1000;const a=t<1?t:t>5?Math.max(0,(7-t)/2):1;const W=cv.width,H=cv.height;
  ctx.save();ctx.globalCompositeOperation='overlay';
  for(let k=0;k<6;k++){const r=((t*.35+k/6)%1)*Math.hypot(W,H)*.7;ctx.strokeStyle=hsl((t*90+k*60)%360,90,60,.55*a);ctx.lineWidth=40*DPR;ctx.beginPath();ctx.arc(W/2,H/2,r,0,Math.PI*2);ctx.stroke()}
  ctx.globalCompositeOperation='color';ctx.fillStyle=hsl((t*70)%360,80,50,.35*a);ctx.fillRect(0,0,W,H);
  ctx.globalCompositeOperation='screen';ctx.translate(W/2,H/2);for(let k=0;k<12;k++){ctx.rotate(Math.PI/6+t*.15);ctx.fillStyle=hsl((k*30+t*100)%360,90,60,.10*a);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(W,-60*DPR);ctx.lineTo(W,60*DPR);ctx.fill()}
  ctx.restore()}

/* ---- battle (css px) ---- */
const SKY={day:['#7fb4d8','#d6e7ee'],dusk:['#d9735a','#f2c294'],dawn:['#b496c8','#f4cdbc'],night:['#0f1430','#2e3a68']};
function battleLayout(){const W=CW,H=CH;const fs=Math.min(W*.44,H*.34),ms=Math.min(W*.5,H*.36);
  return{W,H,ex:W*.70,ey:H*.38,es:fs,mx:W*.28,my:H*.70,ms,hudW:Math.min(230,W*.52)}}
function drawBattle(now,dt){
  const a=BT.anim,foe=BT.foe,me=BT.me;const tod=timeOfDay();const L=battleLayout();BT.L=L;const{W,H}=L;
  ctx.setTransform(DPR,0,0,DPR,0,0);
  let shx=0,shy=0;if(a.shake&&now-a.shake<380){const k=1-(now-a.shake)/380;shx=(Math.random()-.5)*10*k;shy=(Math.random()-.5)*8*k}
  ctx.save();ctx.translate(shx,shy);
  const indoor=GAME.map&&!GAME.map.outdoor;const sk=SKY[tod.phase]||SKY.day;
  if(indoor){ctx.fillStyle=lg(ctx,0,0,0,H,[[0,'#2a2030'],[.55,'#4a3640'],[.56,'#6a4a36'],[1,'#3a281c']]);ctx.fillRect(-20,-20,W+40,H+40);for(let k=0;k<6;k++){ctx.fillStyle=rg(ctx,W*(k+.5)/6,H*.12,0,W*.18,[[0,'rgba(255,200,120,.22)'],[1,'rgba(255,200,120,0)']]);ctx.fillRect(0,0,W,H*.6)}}
  else{ctx.fillStyle=lg(ctx,0,0,0,H*.55,[[0,sk[0]],[1,sk[1]]]);ctx.fillRect(-20,-20,W+40,H*.55+20);
    if(tod.phase==='night')for(let k=0;k<70;k++){circ(ctx,hsh(k,1,2)*W,hsh(2,k,1)*H*.42,(hsh(k,k,3)<.2?1.3:.7),`rgba(255,255,255,${.4+.6*Math.abs(Math.sin(now/900+k))})`)}
    // psychedelic sun rays, slow
    ctx.save();ctx.translate(W*.7,H*.22);ctx.rotate(now/9000);for(let k=0;k<16;k++){ctx.rotate(Math.PI/8);ctx.fillStyle=hsl((k*24+now/60)%360,80,70,tod.phase==='night'?.05:.08);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(W*1.2,-W*.08);ctx.lineTo(W*1.2,W*.08);ctx.fill()}ctx.restore();
    // skyline
    const far=tod.phase==='night'?'#232a52':mix(sk[1],'#5a6a7a',.45),near=tod.phase==='night'?'#171c38':mix(sk[1],'#3a4656',.6);const hb=H*.53;
    ctx.fillStyle=far;for(let i=0;i<W;i+=W/26){const hh=H*(.04+hsh(i|0,3,4)*.06);ctx.fillRect(i,hb-hh,W/26+1,hh)}
    ctx.fillStyle=near;for(const[sx,sh]of[[.08,.16],[.3,.22],[.56,.14],[.86,.2]]){const X=W*sx,hh=H*sh;ctx.fillRect(X,hb-hh*.6,W*.035,hh*.6);ctx.beginPath();ctx.moveTo(X-W*.004,hb-hh*.6);ctx.lineTo(X+W*.0175,hb-hh);ctx.lineTo(X+W*.039,hb-hh*.6);ctx.fill()}
    for(let i=0;i<W;i+=W/14){const hh=H*(.03+hsh(i|0,9,9)*.05);ctx.fillRect(i,hb-hh,W/14+1,hh);if(tod.phase==='night')for(let q=0;q<3;q++)if(hsh(i|0,q,5)<.5)ctx.fillStyle='#f2c46a',ctx.fillRect(i+4+q*8,hb-hh+5,3,3),ctx.fillStyle=near}
    const area=GAME.map?GAME.map.area:1;const gc={1:'#5f8a46',2:'#6a8a4a',3:'#7a7772',4:'#6a8a46',5:'#6f6c68',6:'#5f8a46',7:'#7a7772'}[area]||'#5f8a46';
    ctx.fillStyle=lg(ctx,0,hb,0,H,[[0,shade(gc,1.1)],[1,shade(gc,.7)]]);ctx.fillRect(-20,hb,W+40,H-hb+20)}
  const plat=(x,y,rx,ry)=>{ell(ctx,x,y+ry*.25,rx,ry,'rgba(0,0,0,.25)');ctx.fillStyle=rg(ctx,x,y,0,rx,[[0,'rgba(255,255,255,.28)'],[1,'rgba(255,255,255,.04)']]);ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill()};
  plat(L.ex,L.ey,L.es*.55,L.es*.12);plat(L.mx,L.my,L.ms*.6,L.ms*.13);
  const intro=Math.min(1,(now-BT.t0)/650);
  if(BT.look&&now-BT.t0<1500){const t=Math.min(1,Math.max(0,(now-BT.t0-700)/700));ctx.save();ctx.globalAlpha=1-t;ctx.translate(L.ex-L.es*.1+t*W*.3,L.ey-L.es*.95);ctx.scale(L.es/26,L.es/26);drawPerson(ctx,BT.look,'d',0,0,0,false);ctx.restore()}
  if(foe){const sp=SP[foe.sp];let fx=L.ex+(1-intro)*W*.6,fy=L.ey;let show=true,alpha=1;
    if(a.foeHit&&now-a.foeHit<500)show=Math.floor((now-a.foeHit)/80)%2===0;
    if(a.foeGone){const t=Math.min(1,(now-a.foeGone)/500);fy+=t*L.es*.3;alpha=1-t}
    if(a.ball){show=false;drawLampFx(now,L)}
    if(show){ctx.globalAlpha=alpha;drawSpirit(ctx,sp,fx,fy,L.es,{t:now});ctx.globalAlpha=1}
    hudBox(12,12,L.hudW,58,sp,foe.lv,BT.disp.foe/getMax(foe),null,S.caught[foe.sp]&&BT.wild)}
  if(me){const sp=SP[me.sp];const tin=a.meIn?Math.min(1,(now-a.meIn)/420):intro;let show=true;if(a.meHit&&now-a.meHit<500)show=Math.floor((now-a.meHit)/80)%2===0;
    if(show&&me.hp>0)drawSpirit(ctx,sp,L.mx-(1-tin)*W*.6,L.my,L.ms,{t:now+900,flip:true});
    hudBox(W-L.hudW-12,L.my-L.ms*.95,L.hudW,70,sp,me.lv,BT.disp.me/maxHp(me),[Math.max(0,Math.round(BT.disp.me)),maxHp(me)],false,Math.min(1,me.xp/xpNeed(me.lv)))}
  stepParts(dt);drawParts(ctx,'battle');
  ctx.restore();
  if(intro<1){ctx.save();ctx.translate(W/2,H/2);for(let k=0;k<12;k++){ctx.rotate(Math.PI/6+(1-intro)*2);ctx.fillStyle=hsl(k*30,80,50,(1-intro));ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(W,-W*.3*(1-intro)-2);ctx.lineTo(W,W*.3*(1-intro)+2);ctx.fill()}ctx.restore();ctx.fillStyle=`rgba(10,8,16,${(1-intro)*.85})`;ctx.fillRect(0,0,W,H)}
}
function hudBox(X,Y,w,hh,sp,lv,f,nums,caught,xp){
  fillRR(ctx,X+2,Y+3,w,hh,10,'rgba(0,0,0,.25)');fillRR(ctx,X,Y,w,hh,10,'rgba(22,18,30,.88)');ctx.strokeStyle='rgba(255,255,255,.14)';ctx.lineWidth=1;rr(ctx,X+.5,Y+.5,w-1,hh-1,10);ctx.stroke();
  ctx.fillStyle='#f1ead8';ctx.font=`600 15px ${FONT_UI}`;ctx.textAlign='left';ctx.textBaseline='top';ctx.fillText(sp.name,X+12,Y+9,w-80);
  ctx.font=`500 12px ${FONT_UI}`;ctx.textAlign='right';ctx.fillStyle='#b9b0c8';ctx.fillText('Nv. '+lv,X+w-12,Y+11);
  const T=TYPES[sp.type];fillRR(ctx,X+12,Y+31,40,15,7,T.c);ctx.fillStyle='#fff';ctx.font=`600 9.5px ${FONT_UI}`;ctx.textAlign='center';ctx.fillText(T.n,X+32,Y+34);
  if(caught){circ(ctx,X+w-18,Y+38,5,'#ff7ad9');circ(ctx,X+w-18,Y+38,2,'#ffe2f6')}
  const bx0=X+60,bw=w-72-(caught?14:0);fillRR(ctx,bx0,Y+34,bw,9,4.5,'rgba(255,255,255,.1)');const c=f<.25?'#ef5a4a':f<.5?'#f2b43c':'#5ad07a';
  if(f>0)fillRR(ctx,bx0,Y+34,Math.max(9,bw*Math.max(0,Math.min(1,f))),9,4.5,lg(ctx,bx0,0,bx0+bw,0,[[0,shade(c,1.2)],[1,c]]));
  if(nums){ctx.font=`500 12px ${FONT_UI}`;ctx.textAlign='right';ctx.fillStyle='#d9d0e6';ctx.fillText(`${nums[0]}/${nums[1]}`,X+w-12,Y+48)}
  if(xp!=null){fillRR(ctx,X+12,Y+hh-9,w-90,3,1.5,'rgba(255,255,255,.1)');fillRR(ctx,X+12,Y+hh-9,Math.max(3,(w-90)*xp),3,1.5,'#7a9aff')}}
function drawLampFx(now,L){const t=now-BT.anim.ball;const p=Math.min(1,t/480);const x0=L.mx,y0=L.my-L.ms*.6;
  const X=p<1?x0+(L.ex-x0)*p:L.ex+(BT.anim.caught?0:Math.sin(t/90)*(Math.floor((t-480)/420)%2?6:0)),Y=p<1?y0+(L.ey-L.es*.3-y0)*p-Math.sin(p*Math.PI)*L.es*.9:L.ey-L.es*.25;
  const s=L.es*.18;ctx.save();ctx.translate(X,Y);if(p<1)ctx.rotate(p*8);
  ctx.fillStyle='#3a2a3f';ctx.fillRect(-s*.35,s*.55,s*.7,s*.25);ctx.beginPath();ctx.moveTo(-s*.42,s*.55);ctx.lineTo(-s*.25,-s*.6);ctx.lineTo(s*.25,-s*.6);ctx.lineTo(s*.42,s*.55);ctx.closePath();
  ctx.fillStyle=lg(ctx,0,-s*.6,0,s*.55,[[0,'#ff7ad9'],[.5,'#ff9a3a'],[1,'#7a3fd0']]);ctx.fill();
  for(let k=0;k<3;k++)circ(ctx,Math.sin(now/300+k*2)*s*.15,-s*.3+k*s*.3+Math.sin(now/400+k)*s*.1,s*.12,'rgba(255,230,140,.9)');
  ctx.fillStyle='#3a2a3f';ctx.fillRect(-s*.18,-s*.75,s*.36,s*.18);ctx.restore();
  ctx.fillStyle=rg(ctx,X,Y,0,s*2,[[0,'rgba(255,140,220,.35)'],[1,'rgba(255,140,220,0)']]);ctx.fillRect(X-s*2,Y-s*2,s*4,s*4)}
/* battle FX hooks */
function fxAttack(fromMe,typeCol,text){const L=BT&&BT.L||battleLayout();const sx=fromMe?L.mx:L.ex,sy=(fromMe?L.my-L.ms*.5:L.ey-L.es*.5),ex=fromMe?L.ex:L.mx,ey=fromMe?L.ey-L.es*.5:L.my-L.ms*.5;
  const chars=(text||'ÆØÅ').toUpperCase().replace(/[^A-ZÆØÅ0-9]/g,'').slice(0,8)||'ÆØÅ';
  [...chars].forEach((ch,i)=>addP({layer:'battle',t:'glyph',ch,x:sx,y:sy,vx:(ex-sx)/.45,vy:(ey-sy)/.45-120+i*20,g:500,life:.45+i*.03,c:'#fff8e8',glow:typeCol,sz:22}));
  setTimeout(()=>{for(let k=0;k<34;k++){const an=Math.random()*Math.PI*2,sp=80+Math.random()*220;addP({layer:'battle',t:'spark',x:ex,y:ey,vx:Math.cos(an)*sp,vy:Math.sin(an)*sp,life:.55,c:k%3?typeCol:hsl(Math.random()*360,90,70),s:2+Math.random()*2.5})}
    addP({layer:'battle',t:'ring',x:ex,y:ey,r:70,life:.45,c:'#ffffff'});if(BT)BT.anim.shake=performance.now()},430)}
function fxHitMe(typeCol){const L=BT&&BT.L||battleLayout();const x0=L.mx,y0=L.my-L.ms*.5;for(let k=0;k<3;k++)addP({layer:'battle',t:'ring',x:x0,y:y0,r:70+k*20,life:.5+k*.1,c:typeCol});for(let k=0;k<22;k++){const an=Math.random()*Math.PI*2;addP({layer:'battle',t:'spark',x:x0,y:y0,vx:Math.cos(an)*160,vy:Math.sin(an)*160,life:.45,c:typeCol,s:2.5})}if(BT)BT.anim.shake=performance.now()}
function fxStars(){const L=BT&&BT.L||battleLayout();for(let k=0;k<24;k++){const an=Math.random()*Math.PI*2,sp=60+Math.random()*120;addP({layer:'battle',t:'star',x:L.ex,y:L.ey-L.es*.3,vx:Math.cos(an)*sp,vy:Math.sin(an)*sp-40,g:120,life:1,s:6,c:hsl(Math.random()*360,90,75)})}}
function fxLevel(){const L=BT&&BT.L||battleLayout();for(let k=0;k<22;k++)addP({layer:'battle',t:'star',x:L.mx+(Math.random()-.5)*L.ms*.6,y:L.my,vx:0,vy:-80-Math.random()*80,life:1.1,s:5})}

/* ---- evolution ---- */
const EVO_CV=mkc(8,8);
function drawEvo(now,dt){const e=GAME.evo;ctx.setTransform(DPR,0,0,DPR,0,0);const W=CW,H=CH;ctx.fillStyle='#0d0a14';ctx.fillRect(0,0,W,H);if(!e)return;
  const t=now-e.t0;ctx.save();ctx.translate(W/2,H*.42);for(let k=0;k<18;k++){ctx.rotate(Math.PI/9+t/5000);ctx.fillStyle=hsl((k*20+t/12)%360,90,60,.12);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(W,-30);ctx.lineTo(W,30);ctx.fill()}ctx.restore();
  const per=Math.max(70,300-t/7);const showTo=e.done||Math.floor(t/per)%2===1;const sp=showTo?e.to:e.from;const sz=Math.min(W*.6,H*.42);
  if(!e.done){if(EVO_CV.width!==Math.ceil(W*DPR)){EVO_CV.width=Math.ceil(W*DPR);EVO_CV.height=Math.ceil(H*DPR)}const x=EVO_CV.getContext('2d');x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,EVO_CV.width,EVO_CV.height);x.setTransform(DPR,0,0,DPR,0,0);drawSpirit(x,sp,W/2,H*.62,sz,{t:now,noAura:true});x.setTransform(1,0,0,1,0,0);x.globalCompositeOperation='source-in';x.fillStyle='#fff';x.fillRect(0,0,EVO_CV.width,EVO_CV.height);x.globalCompositeOperation='source-over';ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(EVO_CV,0,0);ctx.setTransform(DPR,0,0,DPR,0,0)}
  else drawSpirit(ctx,sp,W/2,H*.62,sz,{t:now});
  if(Math.random()<.5)addP({layer:'battle',t:'star',x:W/2+(Math.random()-.5)*sz,y:H*.45+(Math.random()-.5)*sz*.6,vx:0,vy:-30,life:.9,s:5,c:hsl(Math.random()*360,90,75)});
  stepParts(dt);drawParts(ctx,'battle')}

/* ---- title + intro ---- */
function drawTitle(now,dt){ctx.setTransform(DPR,0,0,DPR,0,0);const W=CW,H=CH;const tod=timeOfDay();const sk=SKY[tod.phase]||SKY.day;
  ctx.fillStyle=lg(ctx,0,0,0,H,[[0,tod.phase==='night'?'#0c0f26':sk[0]],[.62,tod.phase==='night'?'#3a2a58':sk[1]],[1,'#1b1622']]);ctx.fillRect(0,0,W,H);
  if(tod.phase==='night')for(let k=0;k<90;k++)circ(ctx,hsh(k,3,1)*W,hsh(1,k,3)*H*.5,hsh(k,k,2)<.15?1.4:.8,`rgba(255,255,255,${.35+.65*Math.abs(Math.sin(now/1100+k))})`);
  // psychedelic sun/moon rings
  const sx=W*.72,sy=H*.24;for(let k=7;k>0;k--)circ(ctx,sx,sy,k*W*.035+Math.sin(now/700+k)*2,hsl((k*40+now/40)%360,80,62,.16));circ(ctx,sx,sy,W*.06,tod.phase==='night'?'#f4ecd2':'#ffe2a0');
  // Nyhavn facades
  const base=H*.66;const n=Math.ceil(W/46)+1;for(let i=0;i<n;i++){const w=46,hh=H*(.16+hsh(i,4,4)*.07),X=i*w,Y=base-hh;const c=PLASTER[i%PLASTER.length];
    ctx.fillStyle=lg(ctx,X,Y,X+w,Y,[[0,shade(c,1.05)],[1,shade(c,.82)]]);ctx.fillRect(X,Y,w+1,hh);ctx.fillStyle=i%2?PAL.tile:PAL.copper;ctx.beginPath();ctx.moveTo(X-1,Y);ctx.lineTo(X+w/2,Y-w*.42);ctx.lineTo(X+w+1,Y);ctx.fill();
    for(let r=0;r<3;r++)for(let q=0;q<2;q++){const wx=X+9+q*17,wy=Y+10+r*(hh/3.4);if(wy+12>base)continue;const lit=tod.phase!=='day'&&hsh(i,r,q)<.6;fillRR(ctx,wx,wy,11,13,1.5,lit?'#ffc870':'#9fc4dc');ctx.fillStyle='#f2ede2';ctx.fillRect(wx+5,wy,1,13)}}
  ctx.fillStyle=lg(ctx,0,base,0,H,[[0,'#2c5274'],[1,'#121a2a']]);ctx.fillRect(0,base,W,H-base);ctx.fillStyle=PAL.stoneLt;ctx.fillRect(0,base-3,W,4);
  for(let k=0;k<40;k++){const xx=(hsh(k,2,2)*W+now/30*(1+k%3))%W,yy=base+8+hsh(2,k,2)*(H-base-10);ctx.fillStyle=hsl((k*30+now/30)%360,70,70,.25);ctx.fillRect(xx,yy,14+k%4*6,2)}
  // fox on the quay
  {const fsc=Math.min(W,H)/80;ctx.save();ctx.translate(W/2-8*fsc,base-15.2*fsc);ctx.scale(fsc,fsc);drawFox(ctx,'d',0,0,0,false,now);ctx.restore()}
  // title
  const ts=Math.min(W*.13,64);ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`${ts}px ${FONT_SIGN}`;
  const tg=lg(ctx,W*.15,0,W*.85,0,[[0,hsl((now/30)%360,85,62)],[.5,hsl((now/30+90)%360,85,66)],[1,hsl((now/30+180)%360,85,62)]]);
  ctx.shadowColor='rgba(0,0,0,.6)';ctx.shadowBlur=18;ctx.fillStyle=tg;ctx.fillText('SPROGÅNDER',W/2,H*.12);ctx.shadowBlur=0;
  ctx.font=`500 ${Math.max(13,ts*.27)}px ${FONT_UI}`;ctx.fillStyle='rgba(255,248,230,.92)';ctx.fillText('Dansk. Med bivirkninger.',W/2,H*.12+ts*.72);
  if(Math.floor(now/650)%2&&!topModal())ctx.fillText('Tryk på A',W/2,H*.93);
}
function drawIntro(now,dt){ctx.setTransform(DPR,0,0,DPR,0,0);const W=CW,H=CH;ctx.fillStyle=lg(ctx,0,0,0,H,[[0,'#151826'],[1,'#07070c']]);ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='rgba(180,200,230,.35)';ctx.lineWidth=1;ctx.beginPath();for(const d of RAIN){const X=((d.x+now/9000*d.s)%1)*W,Y=((d.y+now/700*d.s)%1)*H;ctx.moveTo(X,Y);ctx.lineTo(X-3,Y-12)}ctx.stroke();
  for(let k=0;k<5;k++){fillRR(ctx,W*(.1+k*.18),H*.28,W*.08,H*.1,3,`rgba(255,196,110,${.15+.1*Math.sin(now/900+k)})`)}
  if(GAME.introLook){const sc=Math.min(W,H)/34;ctx.save();ctx.translate(W/2-8*sc,H*.66-15*sc);ctx.scale(sc,sc);drawPerson(ctx,GAME.introLook,'d',0,0,0,false);ctx.restore()}}

let lastT=0;
function loop(now){if(needFit){needFit=false;fitScreen()}const dt=Math.min(.1,(now-(lastT||now))/1000);lastT=now;
  if(GAME.mode==='world')S.time+=dt;
  updateWorld(now);
  if(GAME.mode==='title')drawTitle(now,dt);else if(GAME.mode==='intro')drawIntro(now,dt);else if(GAME.mode==='evo')drawEvo(now,dt);
  else if(GAME.mode==='battle'&&BT)drawBattle(now,dt);else if(GAME.map)drawWorld(now,dt);
  if(typeof audioTick==='function')audioTick(now);
  requestAnimationFrame(loop)}
