/* ================= RENDERER: pixel buffer → integer-scaled display, lighting, weather, particles ================= */
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
const buf=mkc(LW,LH),bx=buf.getContext('2d');
const lc=mkc(LW*2,LH*2),lx=lc.getContext('2d');
let SC=3,DPR=1;
const PX='"Pixelify Sans", ui-monospace, monospace',PS='"Press Start 2P", "Pixelify Sans", monospace';
function fitScreen(){
  DPR=Math.max(1,Math.min(3,window.devicePixelRatio||1));
  const scr=document.getElementById('screen');const wrapW=document.getElementById('bezel').clientWidth-28;
  const padH=document.getElementById('pad').offsetHeight+document.querySelector('.brand').offsetHeight+70;
  const availH=Math.max(160,window.innerHeight-padH);
  const maxCss=Math.min(wrapW,availH*LW/LH,720);
  SC=Math.max(1,Math.floor(maxCss*DPR/LW));
  cv.width=LW*SC;cv.height=LH*SC;
  const cw=LW*SC/DPR,ch=LH*SC/DPR;scr.style.width=cw+'px';scr.style.height=ch+'px';cv.style.width=cw+'px';cv.style.height=ch+'px';
  document.documentElement.style.setProperty('--fs',Math.max(12,Math.min(19,cw/22))+'px');
}
addEventListener('resize',()=>{fitScreen()});
function dtext(s,x,y,size,col,align,font,outlineCol){ctx.font=`${Math.round(size*SC)}px ${font||PX}`;ctx.textBaseline='top';ctx.textAlign=align||'left';
  if(outlineCol){ctx.fillStyle=outlineCol;for(const[a,b]of[[-1,0],[1,0],[0,-1],[0,1],[1,1]])ctx.fillText(s,x*SC+a*SC*.5,y*SC+b*SC*.5)}
  ctx.fillStyle=col;ctx.fillText(s,x*SC,y*SC)}
function present(shx,shy){ctx.imageSmoothingEnabled=false;ctx.drawImage(buf,Math.round((shx||0)*SC),Math.round((shy||0)*SC),LW*SC,LH*SC)}

/* ---- time of day + weather ---- */
function timeOfDay(){const d=new Date();const hr=d.getHours()+d.getMinutes()/60;
  if(S.daynight===false)return{phase:'day',dark:0,tint:null,hr};
  const lerp=(a,b,t)=>a+(b-a)*Math.max(0,Math.min(1,t));
  if(hr>=7.5&&hr<17)return{phase:'day',dark:0,tint:null,hr};
  if(hr>=17&&hr<19.5){const t=(hr-17)/2.5;return{phase:'dusk',dark:lerp(0,.5,t),tint:`rgba(255,120,60,${lerp(.1,.18,t)})`,hr}}
  if(hr>=6&&hr<7.5){const t=(hr-6)/1.5;return{phase:'dawn',dark:lerp(.5,0,t),tint:`rgba(255,160,190,${lerp(.18,.06,t)})`,hr}}
  return{phase:'night',dark:.52,tint:'rgba(40,60,140,.12)',hr};}
const NUMW=['tolv','et','to','tre','fire','fem','seks','syv','otte','ni','ti','elleve','tolv'];
function klokkenDa(d){d=d||new Date();let h=d.getHours()%12,m=Math.round(d.getMinutes()/5)*5;if(m===60){m=0;h=(h+1)%12}const H=NUMW[h],N=NUMW[(h+1)%12];
  return({0:H,5:'fem minutter over '+H,10:'ti minutter over '+H,15:'kvart over '+H,20:'ti minutter i halv '+N,25:'fem minutter i halv '+N,30:'halv '+N,35:'fem minutter over halv '+N,40:'ti minutter over halv '+N,45:'kvart i '+N,50:'ti minutter i '+N,55:'fem minutter i '+N})[m]}
function weatherFor(m){if(!m||!m.outdoor)return'none';if(S.weatherOff)return'clear';const d=new Date();const key=d.toLocaleDateString('sv-SE')+':'+Math.floor(d.getHours()/3)+':'+m.area;
  let h=0;for(const ch of key)h=(h*31+ch.charCodeAt(0))>>>0;const r=hsh(h,7,3);
  const rain=m.area===5?.3:.14,wind=/r3|r4|r5|christianshavn|nyhavn/.test(m.id)?.22:.1,cloud=.25;
  if(r<rain)return'rain';if(r<rain+wind)return'wind';if(r<rain+wind+cloud)return'cloudy';return'clear'}
const WEATHER_DA={clear:['Solen skinner','The sun is shining'],cloudy:['Det er overskyet','It\'s cloudy'],rain:['Det regner','It\'s raining'],wind:['Det blæser','It\'s windy'],night:['Det er stjerneklart','The sky is full of stars']};
function weatherLine(m){const w=weatherFor(m);const tod=timeOfDay();const k=w==='clear'&&tod.phase==='night'?'night':w;return WEATHER_DA[k]||null}

/* ---- particles (world space unless .scr) ---- */
const PARTS=[];
function addP(p){if(PARTS.length<400)PARTS.push(Object.assign({life:1,age:0,vx:0,vy:0,g:0},p))}
function stepParts(dt){for(let i=PARTS.length-1;i>=0;i--){const p=PARTS[i];p.age+=dt;if(p.age>=p.life){PARTS.splice(i,1);continue}p.vy+=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt}}
function drawParts(camX,camY,layer){for(const p of PARTS){if((p.layer||'world')!==layer)continue;const t=p.age/p.life;const X=Math.round(p.scr?p.x:p.x-camX),Y=Math.round(p.scr?p.y:p.y-camY);
  if(X<-8||Y<-8||X>LW+8||Y>LH+8)continue;
  if(p.t==='dust'){bx.globalAlpha=1-t;R(bx,X,Y,2,1,'#e9d6a6');bx.globalAlpha=1}
  else if(p.t==='smoke'){bx.globalAlpha=.45*(1-t);const s=1+Math.floor(t*4);R(bx,X-s,Y-s,s*2,s*2,'#d8d4d0');bx.globalAlpha=1}
  else if(p.t==='leaf'){R(bx,X,Y,2,1,p.c||'#e0a040');if(Math.sin(p.age*9)>0)px(bx,X+1,Y+1,shade(p.c||'#e0a040',.7))}
  else if(p.t==='spark'){bx.globalAlpha=1-t;R(bx,X,Y,p.s||1,p.s||1,p.c||'#fff');bx.globalAlpha=1}
  else if(p.t==='rustle'){R(bx,X,Y,1,2,RAMP.tall[3])}
  else if(p.t==='splash'){bx.globalAlpha=1-t;px(bx,X-1,Y,'#cfe8ff');px(bx,X+1,Y,'#cfe8ff');px(bx,X,Y-1,'#ffffff');bx.globalAlpha=1}
  else if(p.t==='firefly'){const a=.5+.5*Math.sin(p.age*5+p.ph);bx.globalAlpha=a;px(bx,X,Y,'#f6ff9a');bx.globalAlpha=1}
  else if(p.t==='butterfly'){const f=Math.sin(p.age*14)>0;R(bx,X-(f?2:1),Y,f?2:1,2,p.c);R(bx,X+1,Y,f?2:1,2,p.c);px(bx,X,Y,INK)}
  else if(p.t==='gull'){const f=Math.floor(p.age*6)%2;bx.globalAlpha=.25;R(bx,X+6,Y+22,5,1,'#000');bx.globalAlpha=1;if(f){px(bx,X-2,Y,'#fff');px(bx,X-1,Y+1,'#fff');px(bx,X+1,Y+1,'#fff');px(bx,X+2,Y,'#fff')}else{px(bx,X-2,Y+2,'#fff');px(bx,X-1,Y+1,'#fff');px(bx,X+1,Y+1,'#fff');px(bx,X+2,Y+2,'#fff')}px(bx,X,Y+1,'#d8d8d8');px(bx,X+3,Y+(f?0:2),'#888')}
  else if(p.t==='glyph'){const a=1-Math.max(0,t-.7)/.3;bx.globalAlpha=a;pfDraw(bx,p.ch,X,Y,p.c||'#fff');bx.globalAlpha=1}
  else if(p.t==='ring'){bx.globalAlpha=1-t;bx.strokeStyle=p.c||'#fff';bx.lineWidth=1;bx.beginPath();bx.arc(X,Y,2+t*(p.r||20),0,Math.PI*2);bx.stroke();bx.globalAlpha=1}
  else if(p.t==='star'){bx.globalAlpha=1-t;px(bx,X,Y,'#fff6b0');px(bx,X-1,Y,'#f4d050');px(bx,X+1,Y,'#f4d050');px(bx,X,Y-1,'#f4d050');px(bx,X,Y+1,'#f4d050');bx.globalAlpha=1}
}}
let ambT=0;
function ambientParticles(m,camX,camY,dt,tod,wx){if(!m.outdoor)return;ambT+=dt;
  if(ambT<.05)return;ambT=0;
  const park=/norrebro|r1|r4|r6|frederiksberg|osterbro/.test(m.id),harbour=/r2|r3|r5|christianshavn|nyhavn/.test(m.id);
  if(m.chimneys)for(const c of m.chimneys)if(Math.random()<.18)addP({t:'smoke',x:c.x+Math.random()*2,y:c.y,vx:(wx==='wind'?14:3)+Math.random()*3,vy:-6-Math.random()*4,life:2.2});
  if(wx==='wind'&&Math.random()<.5)addP({t:'leaf',x:camX-4,y:camY+Math.random()*LH,vx:60+Math.random()*40,vy:(Math.random()-.5)*12,life:5,c:['#e0a040','#c8602a','#9ab04a'][Math.floor(Math.random()*3)]});
  if(park&&wx!=='rain'&&Math.random()<.04&&tod.phase!=='night')addP({t:'leaf',x:camX+Math.random()*LW,y:camY-4,vx:(Math.random()-.3)*10,vy:10+Math.random()*6,life:7,c:['#e0a040','#d06a2a','#9ab04a'][Math.floor(Math.random()*3)]});
  if(park&&tod.phase==='day'&&wx==='clear'&&Math.random()<.02)addP({t:'butterfly',x:camX+Math.random()*LW,y:camY+Math.random()*LH,vx:(Math.random()-.5)*18,vy:(Math.random()-.5)*8,life:6,c:['#f6f2e4','#f4d14a','#a6c8f0'][Math.floor(Math.random()*3)]});
  if(tod.phase==='night'&&wx!=='rain'&&Math.random()<.12&&m.grassTiles.length){const g=m.grassTiles[Math.floor(Math.random()*m.grassTiles.length)];addP({t:'firefly',x:g[0]*16+Math.random()*16,y:g[1]*16+Math.random()*10,vx:(Math.random()-.5)*5,vy:(Math.random()-.5)*5,life:4,ph:Math.random()*6})}
  if(harbour&&tod.phase!=='night'&&Math.random()<.012)addP({t:'gull',x:camX-10,y:camY+10+Math.random()*60,vx:28+Math.random()*16,vy:(Math.random()-.5)*4,life:12});
  if(wx==='rain')for(let k=0;k<3;k++)addP({t:'splash',x:camX+Math.random()*LW,y:camY+Math.random()*LH,life:.25});
}
/* rain streaks + cloud shadows, display space */
const RAIN=[];for(let i=0;i<110;i++)RAIN.push({x:Math.random(),y:Math.random(),s:.6+Math.random()*.6});
function drawWeather(wx,t,dt){
  if(wx==='cloudy'||wx==='rain'){ctx.save();for(let k=0;k<3;k++){const cx=((t/60000*(.6+k*.2)+k*.37)%1.4-.2)*cv.width,cy=(.2+k*.3)*cv.height;const g=ctx.createRadialGradient(cx,cy,0,cx,cy,cv.width*.35);g.addColorStop(0,'rgba(20,30,50,.16)');g.addColorStop(1,'rgba(20,30,50,0)');ctx.fillStyle=g;ctx.fillRect(0,0,cv.width,cv.height)}ctx.restore()}
  if(wx==='rain'){ctx.fillStyle='rgba(40,60,90,.16)';ctx.fillRect(0,0,cv.width,cv.height);ctx.strokeStyle='rgba(200,225,255,.55)';ctx.lineWidth=Math.max(1,SC*.4);ctx.beginPath();
    for(const d of RAIN){d.y+=dt*1.6*d.s;d.x+=dt*.25*d.s;if(d.y>1){d.y-=1;d.x=Math.random()}if(d.x>1)d.x-=1;const X=d.x*cv.width,Y=d.y*cv.height;ctx.moveTo(X,Y);ctx.lineTo(X-3*SC*.6,Y-9*SC*.6)}ctx.stroke()}
}
function drawLights(m,camX,camY,tod,t){
  if(!m.outdoor||tod.dark<=0.01){if(tod.tint){ctx.fillStyle=tod.tint;ctx.fillRect(0,0,cv.width,cv.height)}return}
  const k=2;lx.globalCompositeOperation='source-over';lx.clearRect(0,0,lc.width,lc.height);lx.fillStyle=`rgba(8,12,38,${tod.dark})`;lx.fillRect(0,0,lc.width,lc.height);
  lx.globalCompositeOperation='destination-out';
  const L=[];const flick=.92+.08*Math.sin(t/90);
  for(const l of m.lamps)L.push([l.x-camX,l.y-camY,46*flick,1]);
  for(const w of m.windows)L.push([w.x+w.w/2-camX,w.y+w.h/2-camY,16,.8]);
  for(const d of m.doorLights)L.push([d.x-camX,d.y-camY,20,.9]);
  L.push([(P.x+P.fx)*16+8-camX,(P.y+P.fy)*16+6-camY,30,.55]);
  for(const p of PARTS)if(p.t==='firefly')L.push([p.x-camX,p.y-camY,6,.7]);
  for(const[a,b,r,s]of L){if(a<-r||b<-r||a>LW+r||b>LH+r)continue;const g=lx.createRadialGradient(a*k,b*k,0,a*k,b*k,r*k);g.addColorStop(0,`rgba(0,0,0,${s})`);g.addColorStop(1,'rgba(0,0,0,0)');lx.fillStyle=g;lx.fillRect(a*k-r*k,b*k-r*k,r*k*2,r*k*2)}
  ctx.imageSmoothingEnabled=true;ctx.drawImage(lc,0,0,cv.width,cv.height);
  ctx.globalCompositeOperation='lighter';
  for(const[a,b,r,s]of L){if(r<20||a<-r||b<-r||a>LW+r||b>LH+r)continue;const g=ctx.createRadialGradient(a*SC,b*SC,0,a*SC,b*SC,r*SC*.8);g.addColorStop(0,`rgba(255,170,80,${.22*tod.dark*s})`);g.addColorStop(1,'rgba(255,170,80,0)');ctx.fillStyle=g;ctx.fillRect((a-r)*SC,(b-r)*SC,r*2*SC,r*2*SC)}
  ctx.globalCompositeOperation='source-over';
  if(tod.tint){ctx.fillStyle=tod.tint;ctx.fillRect(0,0,cv.width,cv.height)}
}

/* ---- world ---- */
function ensureArt(m){if(!m.cv)prerenderMap(m);return m}
function blitMapSlice(m,dy,camX,camY,top,bottom){ensureArt(m);const sx=m.mx*16+camX,s0=top?0:m.my*16,s1=bottom?m.cv.height:(m.my+m.h)*16;
  const destY=(s0-m.my*16)+dy-camY;bx.drawImage(m.cv,sx,s0,LW,s1-s0,0,destY,LW,s1-s0)}
let lastWx='clear';
function drawWorld(now,dt){
  const m=GAME.map;ensureArt(m);bx.fillStyle=m.outdoor?RAMP.tree[0]:'#120f18';bx.fillRect(0,0,LW,LH);
  const camX=Math.round((P.x+P.fx)*16-112),camY=Math.round((P.y+P.fy)*16-72);
  const tod=timeOfDay();const wx=weatherFor(m);lastWx=wx;const wind=wx==='wind'?1:wx==='rain'?.5:0;
  // map + seamless neighbours
  blitMapSlice(m,0,camX,camY,!m.prev,!m.next);
  if(m.outdoor&&m.prev&&camY<0){const pm=ensureArt(mapById(m.prev));blitMapSlice(pm,-pm.h*16,camX,camY,!pm.prev,false)}
  if(m.outdoor&&m.next&&camY+LH>m.h*16){const nm=ensureArt(mapById(m.next));blitMapSlice(nm,m.h*16,camX,camY,false,!nm.next)}
  // dynamic tiles
  const tx0=Math.floor(camX/16)-1,ty0=Math.floor(camY/16)-1;
  for(const[a,b]of m.waterTiles){if(a<tx0||b<ty0||a>tx0+17||b>ty0+12)continue;if(m.g[b][a]==='~')drawWaterFx(bx,a*16-camX,b*16-camY,a,b,now)}
  for(const[a,b]of m.grassTiles){if(a<tx0||b<ty0||a>tx0+17||b>ty0+12)continue;drawTallGrass(bx,a*16-camX,b*16-camY,a,b,now,wind,false)}
  // lit windows at night
  if(m.outdoor&&tod.dark>.2){for(const w of m.windows){if(hsh(w.x,w.y,Math.floor(now/60000))<.18)continue;bx.globalAlpha=Math.min(1,tod.dark*1.3);R(bx,w.x-camX,w.y-camY,w.w,w.h,'#f6c86a');R(bx,w.x-camX,w.y-camY,w.w,2,'#ffe6a8');bx.globalAlpha=1}}
  drawParts(camX,camY,'ground');
  // sprites
  const spr=[];
  for(const n of m.npcs)if(npcVisible(n)){const f=n.walk?n.frame:(n.idleT&&now-n.idleT<200?1:0);spr.push({x:n.x+n.ox,y:n.y+n.oy,img:SPR[n.look][n.d][f],tx:n.x,ty:n.y,n})}
  if(F.on&&!(F.x===P.x&&F.y===P.y&&!P.moving))spr.push({x:F.x+F.fx,y:F.y+F.fy,img:SPR.fox[F.dir][F.moving?P.frame:(Math.floor(now/600)%5===0?1:0)],tx:F.x,ty:F.y,fox:1});
  spr.push({x:P.x+P.fx,y:P.y+P.fy,img:SPR.hero[P.dir][P.moving?P.frame:0],tx:P.x,ty:P.y,me:1});
  spr.sort((a,b)=>a.y-b.y);
  for(const s of spr){const X=Math.round(s.x*16-camX),Y=Math.round(s.y*16-camY);
    bx.fillStyle='rgba(10,20,10,.28)';bx.beginPath();bx.ellipse(X+8,Y+15,5.5,2,0,0,Math.PI*2);bx.fill();
    bx.drawImage(s.img,X,Y-4);
    if(tileAt(m,s.tx,s.ty)===','&&Math.abs(s.x-s.tx)<.5&&Math.abs(s.y-s.ty)<.5)drawTallGrass(bx,s.tx*16-camX,s.ty*16-camY,s.tx,s.ty,now,wind,true);
    if(GAME.bubble&&s.n===GAME.bubble.n){R(bx,X+3,Y-16,11,11,INK);R(bx,X+4,Y-15,9,9,'#fff');R(bx,X+8,Y-14,2,5,'#d9483c');R(bx,X+8,Y-8,2,1,'#d9483c');px(bx,X+8,Y-5,INK)}
    if(s.fox&&GAME.heart&&now-GAME.heart<1300){const yy=Y-12-Math.min(4,(now-GAME.heart)/120);R(bx,X+4,yy,9,8,INK);R(bx,X+5,yy+1,7,6,'#fff');const hc='#e8455a';R(bx,X+6,yy+2,2,2,hc);R(bx,X+9,yy+2,2,2,hc);R(bx,X+6,yy+3,5,1,hc);R(bx,X+7,yy+4,3,1,hc);px(bx,X+8,yy+5,hc)}}
  stepParts(dt);ambientParticles(m,camX,camY,dt,tod,wx);drawParts(camX,camY,'world');
  if(now-GAME.fade<240){bx.fillStyle=`rgba(10,8,16,${1-(now-GAME.fade)/240})`;bx.fillRect(0,0,LW,LH)}
  present();
  drawLights(m,camX,camY,tod,now);
  if(m.outdoor)drawWeather(wx,now,dt);
}

/* ---- battle ---- */
const SKY={day:['#7ec4f0','#bfe4f8'],dusk:['#f08a5a','#f8c890'],dawn:['#c8a0d8','#f8d0c0'],night:['#141c44','#3a4a7a']};
const BG_CACHE={};
function battleBg(area,phase,indoor){const key=area+phase+(indoor?'i':'');if(BG_CACHE[key])return BG_CACHE[key];
  const c=mkc(LW,LH),x=c.getContext('2d');
  if(indoor){R(x,0,0,LW,LH,'#e8dcc0');for(let k=0;k<LW;k+=16)R(x,k,0,1,92,'#d8c8a4');R(x,0,84,LW,8,RAMP.wood[1]);R(x,0,92,LW,68,'#d9cba8');for(let k=92;k<LH;k+=10)R(x,0,k,LW,1,'#c8b890');BG_CACHE[key]=c;return c}
  const sk=SKY[phase]||SKY.day;const g=x.createLinearGradient(0,0,0,90);g.addColorStop(0,sk[0]);g.addColorStop(1,sk[1]);x.fillStyle=g;x.fillRect(0,0,LW,92);
  if(phase==='night'){for(let k=0;k<40;k++)px(x,Math.floor(hsh(k,1,2)*LW),Math.floor(hsh(2,k,1)*60),hsh(k,k,3)<.3?'#ffffff':'#a8b8e8')}
  else{x.fillStyle='rgba(255,255,255,.7)';for(let k=0;k<4;k++){const cx=hsh(k,area,1)*LW,cy=10+hsh(area,k,2)*30;x.beginPath();x.ellipse(cx,cy,18,5,0,0,Math.PI*2);x.ellipse(cx+10,cy-3,10,5,0,0,Math.PI*2);x.fill()}}
  // skyline
  const far=phase==='night'?'#2a3258':phase==='dusk'?'#a85a58':'#8fb0c8',near=phase==='night'?'#1c2240':phase==='dusk'?'#7a3e48':'#6f92ac';
  for(let i=0;i<LW;i+=6){const hh=8+Math.floor(hsh(i,area,4)*14);R(x,i,92-hh,6,hh,far)}
  const spires=[[30,30],[96,40],[170,26],[214,34]];for(const[sx,sh]of spires){R(x,sx,92-sh,5,sh,near);R(x,sx+1,92-sh-8,3,8,near);R(x,sx+2,92-sh-14,1,6,near)}
  for(let i=0;i<LW;i+=10){const hh=6+Math.floor(hsh(area,i,9)*10);R(x,i,92-hh,10,hh,near);if(phase==='night')for(let k=0;k<3;k++)if(hsh(i,k,area)<.4)px(x,i+2+k*3,92-hh+3,'#f6c86a')}
  // ground by area
  const grd={1:RAMP.grass,2:RAMP.grass,3:RAMP.cob,4:RAMP.grass,5:RAMP.cob,6:RAMP.grass,7:RAMP.cob}[area]||RAMP.grass;
  R(x,0,92,LW,68,grd[2]);for(let k=0;k<260;k++)px(x,Math.floor(hsh(k,area,5)*LW),92+Math.floor(hsh(area,k,6)*68),k%2?grd[1]:grd[3]);R(x,0,92,LW,2,grd[1]);
  const plat=(cx,cy,rx,ry)=>{x.fillStyle=grd[0];x.beginPath();x.ellipse(cx,cy+2,rx,ry,0,0,Math.PI*2);x.fill();x.fillStyle=grd[3];x.beginPath();x.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);x.fill();x.fillStyle=grd[2];x.beginPath();x.ellipse(cx,cy+1,rx-4,ry-2,0,0,Math.PI*2);x.fill()};
  plat(180,78,44,10);plat(58,114,50,11);
  BG_CACHE[key]=c;return c}
function hudBox(x0,y0,w,hh){R(bx,x0+1,y0,w-2,hh,INK);R(bx,x0,y0+1,w,hh-2,INK);R(bx,x0+1,y0+1,w-2,hh-2,'#fbf7e8');R(bx,x0+2,y0+hh-3,w-4,1,'#e2d8bc')}
function hpBar(x0,y0,w,f){R(bx,x0-1,y0-1,w+2,5,INK);R(bx,x0,y0,w,3,'#3a3640');const c=f<.25?'#e2483c':f<.5?'#f0b030':'#4cc06a';R(bx,x0,y0,Math.max(0,Math.round(w*f)),3,c);R(bx,x0,y0,Math.max(0,Math.round(w*f)),1,shade(c,1.3))}
function drawBattle(now,dt){
  const a=BT.anim,foe=BT.foe,me=BT.me;const tod=timeOfDay();
  bx.drawImage(battleBg(GAME.map?GAME.map.area:1,tod.phase,GAME.map&&!GAME.map.outdoor),0,0);
  const intro=Math.min(1,(now-BT.t0)/700);
  let shx=0,shy=0;if(a.shake&&now-a.shake<350){const k=1-(now-a.shake)/350;shx=(Math.random()-.5)*5*k;shy=(Math.random()-.5)*4*k}
  // trainer silhouette slides out during intro
  if(BT.look&&now-BT.t0<1400){const t=Math.min(1,Math.max(0,(now-BT.t0-700)/600));const img=SPR[BT.look].d[0];bx.drawImage(img,0,0,16,20,196+t*60,28,32,40)}
  if(foe){const sp=SP[foe.sp];let fx=148+(1-intro)*120,fy=14+Math.round(Math.sin(now/420)*1);
    let show=true;if(a.foeHit&&now-a.foeHit<500)show=Math.floor((now-a.foeHit)/70)%2===0;
    if(a.foeGone){const t=Math.min(1,(now-a.foeGone)/450);fy+=t*30;bx.globalAlpha=1-t}
    if(a.ball){show=false;const t=now-a.ball;const p=Math.min(1,t/450);const bxp=40+(176-40)*p,byp=120-Math.sin(p*Math.PI)*80+(70-120)*p;const wob=p<1&&!a.caught?0:(a.caught?0:Math.sin(t/80)*(Math.floor((t-450)/420)%2?2:0));
      const X=Math.round(p<1?bxp:176+wob),Y=Math.round(p<1?byp:70);R(bx,X-4,Y-4,8,8,INK);R(bx,X-3,Y-3,6,3,'#e2483c');R(bx,X-3,Y,6,3,'#f8f4ea');R(bx,X-1,Y-1,2,2,'#fff');R(bx,X-3,Y-1,6,1,INK)}
    if(show){bx.fillStyle='rgba(0,0,0,.18)';bx.beginPath();bx.ellipse(fx+32,77,22,4,0,0,Math.PI*2);bx.fill();bx.drawImage(spiritSprite(sp),Math.round(fx),Math.round(fy));
      if(a.foeFlash&&now-a.foeFlash<120){bx.globalCompositeOperation='source-atop';}}
    bx.globalAlpha=1;
    hudBox(6,8,104,30);
    const T=TYPES[sp.type];
    if(S.caught[foe.sp]&&BT.wild){R(bx,98,12,7,7,INK);R(bx,99,13,5,2,'#e2483c');R(bx,99,16,5,2,'#fff')}
    R(bx,10,24,22,8,T.c);R(bx,10,24,22,1,shade(T.c,1.3));hpBar(46,27,58,Math.max(0,BT.disp.foe/getMax(foe)));
  }
  if(me){const sp=SP[me.sp];const tin=a.meIn?Math.min(1,(now-a.meIn)/400):intro;let mx=26-(1-tin)*110,my=52+Math.round(Math.sin(now/380+1)*1);
    let show=true;if(a.meHit&&now-a.meHit<500)show=Math.floor((now-a.meHit)/70)%2===0;
    if(show&&me.hp>0)bx.drawImage(spiritSprite(sp,true),Math.round(mx),Math.round(my));
    hudBox(130,62,104,40);const T=TYPES[sp.type];R(bx,134,78,22,8,T.c);R(bx,134,78,22,1,shade(T.c,1.3));hpBar(170,81,58,Math.max(0,BT.disp.me/maxHp(me)));
    R(bx,136,98,94,2,'#3a3640');R(bx,136,98,Math.round(94*Math.min(1,me.xp/xpNeed(me.lv))),2,'#4a8ae0')}
  stepParts(dt);drawParts(0,0,'battle');
  if(intro<1){bx.fillStyle='#0a0810';for(let k=0;k<10;k++){const w=(1-intro)*LW;bx.fillRect(k%2?LW-w:0,k*16,w,16)}}
  present(shx,shy);
  if(tod.phase==='night'&&GAME.map&&GAME.map.outdoor){ctx.fillStyle='rgba(20,30,80,.18)';ctx.fillRect(0,0,cv.width,cv.height)}
  // HUD text at display resolution
  if(foe){const sp=SP[foe.sp];dtext(sp.name,10,10,9,INK);dtext('Nv.'+foe.lv,106,11,7.5,INK,'right');dtext(TYPES[sp.type].n,21,24.5,6,'#fff','center');dtext('HP',35,25,6,INK)}
  if(me){const sp=SP[me.sp];dtext(sp.name,134,64,9,INK);dtext('Nv.'+me.lv,230,65,7.5,INK,'right');dtext(TYPES[sp.type].n,145,78.5,6,'#fff','center');dtext('HP',159,79,6,INK);
    dtext(`${Math.max(0,Math.round(BT.disp.me))}/${maxHp(me)}`,230,87,7,INK,'right')}
}
/* battle FX hooks used by battle.js */
function fxAttack(fromMe,typeCol,text){const sx=fromMe?58:180,sy=fromMe?84:44,ex=fromMe?180:58,ey=fromMe?44:84;
  const chars=(text||'ÆØÅ').toUpperCase().replace(/[^A-ZÆØÅ0-9]/g,'').slice(0,8)||'ÆØÅ';
  [...chars].forEach((ch,i)=>addP({layer:'battle',t:'glyph',ch,x:sx,y:sy,vx:(ex-sx)/.45,vy:(ey-sy)/.45-30+i*6,g:120,life:.45+i*.03,c:'#fff8d8',scr:1}));
  setTimeout(()=>{for(let k=0;k<26;k++){const an=Math.random()*Math.PI*2,sp=30+Math.random()*70;addP({layer:'battle',t:'spark',x:ex,y:ey,vx:Math.cos(an)*sp,vy:Math.sin(an)*sp,life:.5,c:k%3?typeCol:'#ffffff',s:k%4?1:2,scr:1})}
    addP({layer:'battle',t:'ring',x:ex,y:ey,r:26,life:.4,c:'#ffffff',scr:1});if(BT)BT.anim.shake=performance.now()},430)}
function fxHitMe(typeCol){for(let k=0;k<3;k++)addP({layer:'battle',t:'ring',x:58,y:84,r:30+k*8,life:.5+k*.1,c:typeCol,scr:1});for(let k=0;k<18;k++){const an=Math.random()*Math.PI*2;addP({layer:'battle',t:'spark',x:58,y:84,vx:Math.cos(an)*60,vy:Math.sin(an)*60,life:.45,c:typeCol,scr:1})}if(BT)BT.anim.shake=performance.now()}
function fxStars(x,y,n){for(let k=0;k<(n||14);k++){const an=Math.random()*Math.PI*2,sp=20+Math.random()*50;addP({layer:'battle',t:'star',x,y,vx:Math.cos(an)*sp,vy:Math.sin(an)*sp-20,g:40,life:.9,scr:1})}}
function fxLevel(){for(let k=0;k<20;k++)addP({layer:'battle',t:'star',x:36+Math.random()*44,y:112,vx:0,vy:-30-Math.random()*40,life:1.1,scr:1})}

/* ---- evolution ---- */
function drawEvo(now,dt){const e=GAME.evo;R(bx,0,0,LW,LH,'#0e0c1a');if(!e){present();return}
  const t=now-e.t0;bx.save();bx.translate(LW/2,LH/2-6);for(let k=0;k<12;k++){bx.rotate(Math.PI/6+t/4000);bx.fillStyle=k%2?'rgba(255,240,180,.08)':'rgba(180,220,255,.06)';bx.beginPath();bx.moveTo(0,0);bx.lineTo(200,-18);bx.lineTo(200,18);bx.fill()}bx.restore();
  const per=Math.max(60,280-t/7);const showTo=e.done||Math.floor(t/per)%2===1;const img=spiritSprite(showTo?e.to:e.from);
  if(!e.done){const c=mkc(64,64),x=c.getContext('2d');x.drawImage(img,0,0);x.globalCompositeOperation='source-in';x.fillStyle='#ffffff';x.fillRect(0,0,64,64);bx.drawImage(c,88,42)}else bx.drawImage(img,88,42);
  if(Math.random()<.4)addP({layer:'battle',t:'star',x:120+(Math.random()-.5)*80,y:74+(Math.random()-.5)*60,vx:0,vy:-12,life:.8,scr:1});
  stepParts(dt);drawParts(0,0,'battle');present()}

/* ---- title + intro ---- */
let titleCv=null;
function drawTitle(now,dt){const tod=timeOfDay();const ph=tod.phase;
  const sk=SKY[ph]||SKY.day;const g=bx.createLinearGradient(0,0,0,LH);g.addColorStop(0,sk[0]);g.addColorStop(1,sk[1]);bx.fillStyle=g;bx.fillRect(0,0,LW,LH);
  if(ph==='night')for(let k=0;k<50;k++){if(Math.sin(now/400+k)>-.3)px(bx,Math.floor(hsh(k,3,1)*LW),Math.floor(hsh(1,k,3)*90),'#ffffff')}
  for(let k=0;k<4;k++){const cx=((now/40000*(k+1)*.4+k*.3)%1.3-.15)*LW;bx.fillStyle='rgba(255,255,255,.55)';bx.beginPath();bx.ellipse(cx,20+k*14,20,5,0,0,Math.PI*2);bx.ellipse(cx+12,17+k*14,12,5,0,0,Math.PI*2);bx.fill()}
  // nyhavn-like row of houses
  const cols=PLASTER;for(let i=0;i<10;i++){const w=24,hh=34+Math.floor(hsh(i,4,4)*12),x0=i*24,y0=118-hh;const P=cols[i%6];R(bx,x0,y0,w,hh,P[2]);R(bx,x0,y0,w,2,P[3]);R(bx,x0+w-1,y0,1,hh,P[0]);
    bx.fillStyle=i%2?RAMP.tile[2]:RAMP.copper[2];bx.beginPath();bx.moveTo(x0,y0);bx.lineTo(x0+w/2,y0-10);bx.lineTo(x0+w,y0);bx.fill();
    for(let r=0;r<3;r++)for(let q=0;q<2;q++){const wx=x0+4+q*10,wy=y0+6+r*10;if(wy+7>118)continue;R(bx,wx,wy,6,7,ph==='night'&&hsh(i,r,q)<.6?'#f6c86a':RAMP.glass[2]);R(bx,wx,wy,6,1,'#f2ede0')}}
  R(bx,0,118,LW,42,RAMP.water[1]);for(let k=0;k<30;k++){const xx=(Math.floor(hsh(k,2,2)*LW)+Math.floor(now/90))%LW;R(bx,xx,122+Math.floor(hsh(2,k,2)*36),4,1,RAMP.water[2])}
  for(let i=0;i<10;i++){const P=PLASTER[i%6];bx.globalAlpha=.35;R(bx,i*24,119,24,12,P[1]);bx.globalAlpha=1}
  R(bx,0,116,LW,3,RAMP.stone[2]);R(bx,0,116,LW,1,RAMP.stone[3]);
  // boat
  const bxp=((now/80)%320)-40;R(bx,bxp,128,30,5,'#8a3a2a');R(bx,bxp+2,126,26,2,'#f2ede0');R(bx,bxp+12,112,2,14,'#5a3a22');
  const bob=Math.round(Math.sin(now/300)*1.5);bx.drawImage(spiritSprite(SP.ræv),88,62+bob);
  stepParts(dt);present();
  dtext('SPROGÅNDER',120,14,15,'#ffd84a','center',PS,INK);dtext('GUL UDGAVE',120,36,7,'#ffffff','center',PS,INK);
  if(Math.floor(now/550)%2&&!topModal())dtext('TRYK PÅ A',120,146,7,'#ffffff','center',PS,INK);
  if(tod.dark>.01){ctx.fillStyle=`rgba(8,12,38,${tod.dark*.35})`;ctx.fillRect(0,0,cv.width,cv.height)}
}
function drawIntro(now,dt){const g=bx.createLinearGradient(0,0,0,LH);g.addColorStop(0,'#2a2438');g.addColorStop(1,'#0e0c18');bx.fillStyle=g;bx.fillRect(0,0,LW,LH);
  bx.fillStyle='rgba(255,220,160,.12)';bx.beginPath();bx.ellipse(120,96,46,10,0,0,Math.PI*2);bx.fill();
  const img=SPR[GAME.introLook||'teacher'].d[Math.floor(now/500)%4===0?1:0];bx.drawImage(img,0,0,16,20,96,32,48,60);
  if(GAME.introFox)bx.drawImage(spiritSprite(SP.ræv),150,40);present()}

let lastT=0;
function loop(now){const dt=Math.min(.1,(now-(lastT||now))/1000);lastT=now;
  if(GAME.mode==='world')S.time+=dt;
  updateWorld(now);
  if(GAME.mode==='title')drawTitle(now,dt);else if(GAME.mode==='intro')drawIntro(now,dt);else if(GAME.mode==='evo')drawEvo(now,dt);
  else if(GAME.mode==='battle'&&BT)drawBattle(now,dt);else if(GAME.map)drawWorld(now,dt);
  if(typeof audioTick==='function')audioTick(now);
  requestAnimationFrame(loop)}
