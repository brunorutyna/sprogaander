/* ================= SPIRITS: psychedelic vector creatures; evolved forms have clearly been to the gym ================= */
const GLYPH={spm:'?',køn:'EN',tal:'90',inv1:'V2',inv2:'DA',konj:'MEN',modal:'KAN',pron:'DEM',poss:'SIN',datid:'GIK',hej:'HEJ',adv:'IKKE',tidsudtryk:'OM',adj:'+E',hjem:'ST.TH',familie:'MOR',job1:'JOB',slang:'PIS',kommune:'CPR',tid:'½7',mad:'RUG',cykel:'BIKE',butik:'KR.',kvarter:'NABO',hygge:'SKÅL',gaet:'JOB?',chunk:'NÅ',empati:'ÅH',mark:'KOK',datid2:'GIK',historie:'FØRST',vejr:'REGN',krop:'AV',ord:'V2'};
function planOf(name){const n=name.toLowerCase();
  if(/ræv|mus|rotte|kat|lam|lus$|okse|taur/.test(n))return'quad';
  if(/ørn|fugl|måge|falk|svane|krage|ugle|ælling|flue/.test(n))return'bird';
  if(/snog|slange/.test(n))return'serpent';
  if(/sky|ling$/.test(n)&&/sky/.test(n))return'floaty';
  return null}
const TRAITS={};
function traitsOf(sp){if(TRAITS[sp.id])return TRAITS[sp.id];const r=rng(sp.seed||7);
  const line=LINES.find(l=>l[0]===sp.topic);
  let plan=sp.fox?'quad':line?(planOf(line[1])||['blob','floaty','biped','quad','bird','blob'][Math.floor(r()*6)]):'blob';
  const typeHue=parseInt(hueShift(TYPES[sp.type].c,0).slice(1),16);// unused, keep deterministic
  const baseHex=sp.fox?'#d9732f':hueShift(TYPES[sp.type].c,(r()-.5)*70,1.15);
  const T={plan,base:baseHex,h2:Math.floor(r()*360),eyes:['wide','sleepy','spiral','many','wide','sleepy'][Math.floor(r()*6)],
    top:['mushroom','petals','antenna','horns','none','mushroom','petals'][Math.floor(r()*7)],pat:['rings','spiral','dots','stripes'][Math.floor(r()*4)],
    drips:r()<.35,mouth:Math.floor(r()*3),shades:r()<.45,band:['#d9485f','#f2f2f2','#f0c64a','#5ad0e8'][Math.floor(r()*4)],glyph:GLYPH[sp.topic]||''};
  if(sp.fox)Object.assign(T,{eyes:'fox',top:'none',pat:'none',drips:false,glyph:''});
  TRAITS[sp.id]=T;return T}
/* main entry: draws with feet at (X,Y); size ≈ height in current units */
function drawSpirit(x,sp,X,Y,size,o={}){const T=traitsOf(sp);const t=o.t||0;const hueT=Math.sin(t/1400)*25;
  x.save();x.translate(X,Y);x.scale((o.flip?-1:1)*size/100,size/100);x.translate(-50,-96);
  if(o.silhouette){x.globalCompositeOperation='source-over'}
  // aura
  if(!o.noAura){const a=rg(x,50,60,4,52,[[0,hsl((T.h2+hueT*3+360)%360,90,70,.32)],[.6,hsl((T.h2+120+hueT*3)%360,90,60,.1)],[1,hsl(T.h2,80,50,0)]]);x.fillStyle=a;x.fillRect(-10,0,120,100)}
  ell(x,50,95,sp.stage?30:24,4.5,'rgba(10,8,18,.32)');
  if(sp.stage)drawSwole(x,sp,T,t,hueT);else drawBase(x,sp,T,t,hueT);
  x.restore();
}
function bodyGrad(x,cx,cy,rx,ry,base,warm){const L=hueShift(base,10,.95,1.35),D=hueShift(base,-22,1.1,.62);return rg(x,cx,cy,0,Math.max(rx,ry)*1.05,[[0,L],[.55,base],[1,D]],cx-rx*.38,cy-ry*.45)}
function blob(x,cx,cy,rx,ry,base,rot){x.fillStyle=bodyGrad(x,cx,cy,rx,ry,base);x.beginPath();x.ellipse(cx,cy,rx,ry,rot||0,0,Math.PI*2);x.fill();x.strokeStyle=rgba(hueShift(base,-25,1.1,.4),.55);x.lineWidth=1.2;x.stroke()}
function pattern(x,T,cx,cy,rx,ry,hueT){x.save();x.beginPath();x.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);x.clip();
  const H=(T.h2+hueT*2+360)%360;
  if(T.pat==='rings'){for(let k=5;k>0;k--){x.fillStyle=hsl((H+k*48)%360,80,k%2?62:48,.85);x.beginPath();x.ellipse(cx,cy+ry*.15,rx*k/5,ry*k/5,0,0,Math.PI*2);x.fill()}}
  if(T.pat==='spiral'){x.fillStyle=hsl(H,60,85,.6);x.fillRect(cx-rx,cy-ry,rx*2,ry*2);x.strokeStyle=hsl((H+180)%360,80,45,.9);x.lineWidth=1.8;x.beginPath();for(let a=0;a<Math.PI*7;a+=.15){const r=a*Math.max(rx,ry)/22;x.lineTo(cx+Math.cos(a+hueT/10)*r,cy+Math.sin(a+hueT/10)*r*ry/rx)}x.stroke()}
  if(T.pat==='dots'){x.fillStyle=hsl(H,50,88,.7);x.fillRect(cx-rx,cy-ry,rx*2,ry*2);for(let k=0;k<14;k++){const a=k*2.4,r=(k/14)*Math.max(rx,ry);circ(x,cx+Math.cos(a)*r,cy+Math.sin(a)*r*ry/rx,2+k%3,hsl((H+k*30)%360,85,55))}}
  if(T.pat==='stripes'){for(let k=-6;k<6;k++){x.fillStyle=hsl((H+k*35+720)%360,80,58,.9);x.beginPath();x.moveTo(cx-rx,cy+k*5);for(let i=0;i<=8;i++)x.lineTo(cx-rx+i*rx/4,cy+k*5+Math.sin(i+hueT/8)*2.4);x.lineTo(cx+rx,cy+k*5+3.4);for(let i=8;i>=0;i--)x.lineTo(cx-rx+i*rx/4,cy+k*5+3.4+Math.sin(i+hueT/8)*2.4);x.fill()}}
  x.restore()}
function eye(x,cx,cy,r,T,hueT,style){
  if(style==='sleepy'){ell(x,cx,cy,r,r*.9,'#fff');const g=rg(x,cx,cy+r*.15,0,r*.75,[[0,'#111'],[.35,hsl((T.h2+180+hueT*4)%360,90,55)],[.7,hsl((T.h2+60+hueT*4)%360,90,60)],[1,hsl((T.h2+hueT*4)%360,90,45)]]);x.fillStyle=g;x.beginPath();x.arc(cx,cy+r*.15,r*.72,0,Math.PI*2);x.fill();
    x.fillStyle=hueShift(T.base,0,1,.85);x.beginPath();x.ellipse(cx,cy-r*.15,r*1.12,r*.62,0,Math.PI,0);x.fill();x.fillRect(cx-r*1.12,cy-r*.2,r*2.24,r*.32);return}
  ell(x,cx,cy,r,r*1.05,'#fff');
  if(style==='spiral'){x.strokeStyle=hsl((T.h2+hueT*6)%360,90,40);x.lineWidth=r*.16;x.beginPath();for(let a=0;a<Math.PI*5;a+=.2){const rr2=a*r*.13;x.lineTo(cx+Math.cos(a+hueT/5)*rr2,cy+Math.sin(a+hueT/5)*rr2)}x.stroke();return}
  const g=rg(x,cx,cy,0,r*.72,[[0,'#0d0b12'],[.32,'#0d0b12'],[.36,hsl((T.h2+200+hueT*4)%360,90,58)],[.7,hsl((T.h2+80+hueT*4)%360,90,58)],[1,hsl((T.h2+hueT*4)%360,85,40)]]);x.fillStyle=g;x.beginPath();x.arc(cx,cy+r*.08,r*.72,0,Math.PI*2);x.fill();
  circ(x,cx-r*.3,cy-r*.3,r*.22,'#fff');circ(x,cx+r*.25,cy+r*.25,r*.1,'rgba(255,255,255,.7)')}
function face(x,T,hx,hy,hr,hueT,cute){
  const st=T.eyes;
  if(st==='fox'){for(const s of[-1,1]){ell(x,hx+s*hr*.42,hy,hr*.2,hr*.24,'#13202a');circ(x,hx+s*hr*.42-1,hy-1.4,hr*.07,'#bff')}ell(x,hx,hy+hr*.5,hr*.4,hr*.28,'#f4eee2');circ(x,hx,hy+hr*.42,hr*.1,INK);return}
  if(st==='many'){const pos=[[-.48,-.05,.26],[.48,-.05,.26],[0,-.45,.2],[-.2,.3,.14],[.25,.32,.12]];for(const[a,b,r]of pos)eye(x,hx+a*hr,hy+b*hr,hr*r,T,hueT,'wide')}
  else{for(const s of[-1,1])eye(x,hx+s*hr*.42,hy-hr*.05,hr*(cute?.3:.25),T,hueT,st);if(T.top!=='mushroom'&&T.top!=='petals'&&st!=='sleepy')eye(x,hx,hy-hr*.6,hr*.13,T,hueT,'wide')}
  const my=hy+hr*.5;x.strokeStyle='#1b1622';x.lineWidth=1.3;x.lineCap='round';
  if(T.mouth===0){x.beginPath();x.arc(hx,my-2,hr*.22,.25,Math.PI-.25);x.stroke()}
  else if(T.mouth===1){x.fillStyle='#1b1622';x.beginPath();x.ellipse(hx,my,hr*.18,hr*.13,0,0,Math.PI*2);x.fill();ell(x,hx,my+hr*.06,hr*.1,hr*.06,'#e8607a')}
  else{x.beginPath();x.moveTo(hx-hr*.18,my);x.quadraticCurveTo(hx,my+hr*.1,hx+hr*.22,my-hr*.06);x.stroke()}}
function topper(x,T,hx,hy,hr,hueT,small){const H=(T.h2+hueT*2+360)%360;
  if(T.top==='mushroom'){x.fillStyle='#efe6d4';x.fillRect(hx-hr*.18,hy-hr*1.05,hr*.36,hr*.4);x.fillStyle=lg(x,0,hy-hr*1.9,0,hy-hr*.9,[[0,'#ff5a4a'],[1,'#b0201a']]);x.beginPath();x.ellipse(hx,hy-hr*1.05,hr*1.05,hr*.75,0,Math.PI,0);x.fill();for(const[a,b,r]of[[-.5,-1.35,.14],[.1,-1.62,.12],[.55,-1.3,.12],[-.1,-1.25,.09]])circ(x,hx+a*hr,hy+b*hr,hr*r,'#fff6ea')}
  if(T.top==='petals'){for(let k=0;k<8;k++){const a=k/8*Math.PI*2+hueT/40;x.save();x.translate(hx+Math.cos(a)*hr*.95,hy+Math.sin(a)*hr*.95);x.rotate(a);x.fillStyle=hsl((H+k*45)%360,85,62);x.beginPath();x.ellipse(0,0,hr*.42,hr*.22,0,0,Math.PI*2);x.fill();x.restore()}}
  if(T.top==='antenna'){x.strokeStyle=hueShift(T.base,-20,1,.6);x.lineWidth=1.4;for(const s of[-1,1]){x.beginPath();x.moveTo(hx+s*hr*.35,hy-hr*.8);x.quadraticCurveTo(hx+s*hr*.9,hy-hr*1.4,hx+s*hr*.6,hy-hr*1.8);x.stroke();circ(x,hx+s*hr*.6,hy-hr*1.85,hr*.2,hsl((H+(s>0?120:0))%360,95,65));circ(x,hx+s*hr*.6-1,hy-hr*1.92,hr*.07,'#fff')}}
  if(T.top==='horns'){for(const s of[-1,1]){x.fillStyle=lg(x,0,hy-hr*1.6,0,hy-hr*.6,[[0,'#f2ead8'],[1,'#a89878']]);x.beginPath();x.moveTo(hx+s*hr*.35,hy-hr*.7);x.quadraticCurveTo(hx+s*hr*1.2,hy-hr*1.1,hx+s*hr*.95,hy-hr*1.75);x.quadraticCurveTo(hx+s*hr*.85,hy-hr*1.1,hx+s*hr*.7,hy-hr*.65);x.fill()}}}
function ears(x,T,hx,hy,hr,base,fox){for(const s of[-1,1]){x.fillStyle=bodyGrad(x,hx+s*hr*.6,hy-hr,hr*.4,hr*.6,base);x.beginPath();x.moveTo(hx+s*hr*.2,hy-hr*.7);x.lineTo(hx+s*hr*.75,hy-hr*1.65);x.lineTo(hx+s*hr*.95,hy-hr*.35);x.fill();
  x.fillStyle=fox?'#2a1e22':hueShift(base,30,1,1.3);x.beginPath();x.moveTo(hx+s*hr*.45,hy-hr*.9);x.lineTo(hx+s*hr*.75,hy-hr*1.6);x.lineTo(hx+s*hr*.82,hy-hr*.75);x.fill()}}
function glyphText(x,txt,cx,cy,sz,col){if(!txt)return;x.font=`${sz}px ${FONT_SIGN}`;x.textAlign='center';x.textBaseline='middle';x.fillStyle=col;x.fillText(txt,cx,cy)}
function drawBase(x,sp,T,t,hueT){const b=T.base,P=T.plan,bob=Math.sin(t/500)*1.2;
  if(P==='quad'){const tw=Math.sin(t/300)*.15;x.save();x.translate(76,66);x.rotate(-.7+tw);x.fillStyle=sp.fox?lg(x,0,0,0,-36,[[0,b],[.6,hsl((20+hueT*2+360)%360,75,55)],[.85,hsl((300+hueT*3+360)%360,60,62)],[1,'#f6f0e4']]):bodyGrad(x,0,-14,8,16,b);x.beginPath();x.ellipse(0,-14,sp.fox?10:6,sp.fox?20:14,0,0,Math.PI*2);x.fill();x.restore();
    for(const lx of[30,42,58,70])blob(x,lx,88,5,8,hueShift(b,-10,1,.85));blob(x,50,72+bob*.3,30,17,b);
    if(sp.fox)ell(x,50,78,15,9,'#f4eee2');else pattern(x,T,50,76,15,9,hueT);
    const hx=50,hy=46+bob,hr=19;ears(x,T,hx,hy,hr,b,sp.fox);blob(x,hx,hy,hr,hr*.9,b);if(!sp.fox)topper(x,T,hx,hy,hr,hueT);face(x,T,hx,hy+2,hr,hueT,1)}
  else if(P==='bird'){const fl=Math.sin(t/220)*.25;for(const s of[-1,1]){x.save();x.translate(50+s*20,62);x.rotate(s*(.5+fl));x.fillStyle=lg(x,0,-16,0,16,[[0,hsl((T.h2+hueT*3)%360,85,62)],[.5,b],[1,hsl((T.h2+150+hueT*3)%360,85,55)]]);x.beginPath();x.ellipse(0,0,9,20,0,0,Math.PI*2);x.fill();x.restore()}
    blob(x,50,68+bob*.4,22,24,b);pattern(x,T,50,72,12,13,hueT);x.strokeStyle='#e8a030';x.lineWidth=2;x.beginPath();x.moveTo(44,90);x.lineTo(42,96);x.moveTo(56,90);x.lineTo(58,96);x.stroke();
    const hx=50,hy=38+bob,hr=16;blob(x,hx,hy,hr,hr*.92,b);topper(x,T,hx,hy,hr,hueT);face(x,T,hx,hy-1,hr,hueT,1);
    x.fillStyle='#f0a030';x.beginPath();x.moveTo(hx-4,hy+5);x.lineTo(hx+4,hy+5);x.lineTo(hx,hy+11);x.fill()}
  else if(P==='serpent'){for(const[cx,cy,rx,ry]of[[50,88,32,8],[48,77,26,8],[52,66,19,7.5]]){blob(x,cx,cy,rx,ry,b);x.save();x.beginPath();x.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);x.clip();for(let k=-4;k<5;k++)ell(x,cx+k*7,cy+ry*.5,2.4,1.6,hsl((T.h2+k*40+hueT*3+360)%360,85,60));x.restore()}
    blob(x,56,52,8,12,b);const hx=58,hy=36+bob,hr=16;blob(x,hx,hy,hr,hr*.85,b);topper(x,T,hx,hy,hr,hueT);face(x,T,hx,hy,hr,hueT,1);
    x.strokeStyle='#e8405a';x.lineWidth=1.4;x.beginPath();x.moveTo(hx,hy+12);x.lineTo(hx+2,hy+18);x.moveTo(hx+2,hy+18);x.lineTo(hx,hy+21);x.moveTo(hx+2,hy+18);x.lineTo(hx+4,hy+21);x.stroke()}
  else if(P==='floaty'){const fy=Math.sin(t/600)*3-8;x.save();x.translate(0,fy);
    if(T.drips||true){for(let k=0;k<5;k++){const dx=28+k*11,dl=8+((k*7)%5)*3+Math.sin(t/400+k)*2;x.fillStyle=bodyGrad(x,dx,82,4,dl,b);x.beginPath();x.ellipse(dx,80+dl/2,3.6,dl/2+2,0,0,Math.PI*2);x.fill()}}
    blob(x,50,62,30,24,b);blob(x,36,46,13,11,b);blob(x,62,44,14,12,b);pattern(x,T,50,68,14,10,hueT);
    topper(x,T,50,44,18,hueT);face(x,T,50,56,22,hueT,1);x.restore()}
  else if(P==='biped'){for(const s of[-1,1])blob(x,50+s*9,90,7,5,hueShift(b,-10,1,.85));blob(x,50,72+bob*.3,20,21,b);pattern(x,T,50,76,11,12,hueT);
    for(const s of[-1,1]){x.save();x.translate(50+s*19,62);x.rotate(s*(.4+Math.sin(t/400+s)*.15));blob(x,0,8,5,10,b);x.restore()}
    const hx=50,hy=40+bob,hr=18;if(T.top==='none'||T.top==='horns')ears(x,T,hx,hy,hr,b);blob(x,hx,hy,hr,hr*.9,b);topper(x,T,hx,hy,hr,hueT);face(x,T,hx,hy+1,hr,hueT,1)}
  else{for(const s of[-1,1])blob(x,50+s*12,92,8,4.5,hueShift(b,-10,1,.85));
    if(T.drips){for(let k=0;k<4;k++){const dx=32+k*12,dl=6+((k*5)%4)*3;x.fillStyle=bodyGrad(x,dx,86,4,dl,b);x.beginPath();x.ellipse(dx,84+dl/2,3.4,dl/2+2,0,0,Math.PI*2);x.fill()}}
    blob(x,50,64+bob*.5,30,28,b);pattern(x,T,50,74,14,11,hueT);topper(x,T,50,48,24,hueT);face(x,T,50,54+bob*.5,26,hueT,1)}
  if(T.glyph&&P!=='serpent'){glyphText(x,T.glyph,50,P==='floaty'?60:P==='bird'?72:P==='quad'?76:78,T.glyph.length>3?7:9,'rgba(255,255,255,.92)')}
}
function drawSwole(x,sp,T,t,hueT){const b=mix(T.base,'#c9773a',.12),P=T.plan;const flex=Math.sin(t/650)*.06;const bob=Math.sin(t/700)*1;
  const dk=hueShift(b,-22,1.1,.55),vein=hueShift(b,-30,1.2,.45);
  // lower body by species
  if(P==='serpent'){for(const[cx,cy,rx,ry]of[[50,90,34,7],[50,80,28,7]])blob(x,cx,cy,rx,ry,b)}
  else if(P==='floaty'){for(let k=0;k<5;k++){const dx=34+k*8,dl=10+((k*7)%5)*2+Math.sin(t/400+k)*2;x.fillStyle=bodyGrad(x,dx,84,3,dl,b);x.beginPath();x.ellipse(dx,82+dl/2,3,dl/2+2,0,0,Math.PI*2);x.fill()}}
  else{for(const s of[-1,1]){blob(x,50+s*8,86,6,9,b);ell(x,50+s*8,95,7,2.6,'#1b1622')}fillRR(x,38,76,24,7,3,'#1b1622')}
  if(P==='bird'){for(const s of[-1,1]){x.save();x.translate(50+s*22,50);x.rotate(s*.9);x.fillStyle=lg(x,0,-16,0,16,[[0,hsl((T.h2+hueT*3)%360,85,62)],[1,b]]);x.beginPath();x.ellipse(0,0,7,18,0,0,Math.PI*2);x.fill();x.restore()}}
  if(P==='quad'||P==='biped'){x.save();x.translate(70,70);x.rotate(-.9);blob(x,0,-10,5,12,b);x.restore()}
  // torso (V shape)
  x.fillStyle=bodyGrad(x,50,58,34,26,b);x.beginPath();x.moveTo(18,50);x.quadraticCurveTo(50,38,82,50);x.quadraticCurveTo(80,66,66,82);x.lineTo(34,82);x.quadraticCurveTo(20,66,18,50);x.fill();x.strokeStyle=rgba(dk,.6);x.lineWidth=1.2;x.stroke();
  // pecs + abs
  for(const s of[-1,1]){x.fillStyle=bodyGrad(x,50+s*10,56,12,8,b);x.beginPath();x.ellipse(50+s*10,56,12,7.5,s*.12,0,Math.PI*2);x.fill();x.strokeStyle=rgba(dk,.55);x.lineWidth=1;x.beginPath();x.ellipse(50+s*10,57,11,6.5,s*.12,.2,Math.PI-.2);x.stroke()}
  for(let r=0;r<3;r++)for(const s of[-1,1]){fillRR(x,50+(s<0?-9:1),65+r*5.5,8,4.6,2,hueShift(b,8,.95,1.12));x.strokeStyle=rgba(dk,.4);x.lineWidth=.7;rr(x,50+(s<0?-9:1),65+r*5.5,8,4.6,2);x.stroke()}
  // arms: double biceps
  for(const s of[-1,1]){const sx=50+s*30;blob(x,sx,50,10,9,b);
    x.save();x.translate(sx,48);x.rotate(s*(-.35-flex));blob(x,s*10,-2,11,7.5,b);blob(x,s*11,-6,7,7,hueShift(b,6,1,1.08));
    x.strokeStyle=vein;x.lineWidth=.8;x.beginPath();x.moveTo(s*5,-3);x.quadraticCurveTo(s*9,-8,s*14,-4);x.quadraticCurveTo(s*16,-1,s*19,-3);x.stroke();
    x.translate(s*19,-4);x.rotate(s*(.28+flex));blob(x,0,-10,5.5,10,b);circ(x,0,-21,6,hueShift(b,0,1,1.05));x.strokeStyle=rgba(dk,.6);x.lineWidth=.8;x.beginPath();x.moveTo(-2,-23);x.lineTo(2,-23);x.moveTo(-2,-20.5);x.lineTo(2,-20.5);x.stroke();
    x.strokeStyle=vein;x.beginPath();x.moveTo(-1,-3);x.quadraticCurveTo(2,-9,0,-15);x.stroke();x.restore()}
  // gold chain + medallion
  x.strokeStyle='#e8bc4a';x.lineWidth=1.6;x.setLineDash([2.2,1.1]);x.beginPath();x.moveTo(37,47);x.quadraticCurveTo(50,66,63,47);x.stroke();x.setLineDash([]);
  const mg=rg(x,50,62,0,8,[[0,'#fff3b8'],[.5,'#e8bc4a'],[1,'#9a6e18']],47,59);x.fillStyle=mg;x.beginPath();x.arc(50,62,7.5,0,Math.PI*2);x.fill();x.strokeStyle='#7a5410';x.lineWidth=.8;x.stroke();
  glyphText(x,T.glyph||'Ø',50,62.4,T.glyph.length>3?3.6:T.glyph.length>2?4.4:5.6,'#5a3c08');
  // head (small, determined)
  const hx=50,hy=30+bob,hr=12;
  if(P==='quad'||sp.fox)ears(x,T,hx,hy,hr,b);
  blob(x,hx,hy,hr,hr*.92,b);if(P!=='quad')topper(x,T,hx,hy,hr,hueT);
  if(P==='bird'){x.fillStyle='#f0a030';x.beginPath();x.moveTo(hx-3,hy+4);x.lineTo(hx+3,hy+4);x.lineTo(hx,hy+9);x.fill()}
  fillRR(x,hx-hr+.5,hy-hr*.55,hr*2-1,3.4,1.5,T.band);x.fillStyle='rgba(0,0,0,.15)';x.fillRect(hx-hr+.5,hy-hr*.55+2.4,hr*2-1,1);
  if(T.shades){fillRR(x,hx-9,hy-2.6,8,4.4,1.8,'#111');fillRR(x,hx+1,hy-2.6,8,4.4,1.8,'#111');x.fillRect(hx-1,hy-1.8,2,1);x.fillStyle='rgba(255,255,255,.55)';x.fillRect(hx-7.5,hy-1.8,2.5,.9);x.fillRect(hx+2.5,hy-1.8,2.5,.9)}
  else{for(const s of[-1,1]){ell(x,hx+s*4.6,hy,2.2,2,'#fff');circ(x,hx+s*4.4,hy+.3,1.2,'#14101a');x.strokeStyle='#1b1622';x.lineWidth=1.3;x.beginPath();x.moveTo(hx+s*7.4,hy-3.6);x.lineTo(hx+s*2,hy-2);x.stroke()}}
  x.fillStyle='#1b1622';x.beginPath();x.moveTo(hx-4.5,hy+4.5);x.quadraticCurveTo(hx,hy+8.5,hx+4.5,hy+4.5);x.closePath();x.fill();x.fillStyle='#fff';x.fillRect(hx-3.4,hy+4.6,6.8,1.3);
  // sweat
  const sw=(t/900)%1;x.fillStyle='rgba(140,210,255,.85)';x.beginPath();x.ellipse(hx+hr+1,hy-2+sw*6,1.2,1.8,0,0,Math.PI*2);x.fill();
}
/* cached raster for DOM (Åndebog, menus) */
const SPIRIT_IMG={};
function spiritImage(sp,cssSize){const d=Math.min(3,window.devicePixelRatio||1);const k=sp.id+':'+cssSize+':'+d;if(SPIRIT_IMG[k])return SPIRIT_IMG[k];
  const c=mkc(cssSize*d,cssSize*d),x=c.getContext('2d');x.scale(d,d);drawSpirit(x,sp,cssSize/2,cssSize*.98,cssSize*.95,{t:0,noAura:false});SPIRIT_IMG[k]=c;return c}
