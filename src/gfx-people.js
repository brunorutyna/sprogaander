/* ================= PEOPLE + FOX (vector, world units; feet at tile bottom) ================= */
const SKIN=['#f0c9a4','#d9a57c','#b07a52','#7c5236','#5a3a26'];
const LOOKS={
 hero:{hair:'#2b211c',style:'short',top:'#4f5a3a',coat:1,pants:'#24262e',shoes:'#ece8e0',skin:1,bag:'#d8c8a8',scarf:'#b8833a'},
 teacher:{hair:'#cfcac0',style:'long',top:'#d9772e',poncho:'#7a3fa0',pants:'#3a2a4a',shoes:'#5a3a28',skin:0,glasses:1},
 kim:{hair:'#d8b45a',style:'messy',top:'#1d1d24',logo:'#7dff6a',pants:'#3a4a6a',shoes:'#f2f2f2',skin:0},
 nurse:{hair:'#b3402e',style:'bun',top:'#26222c',apron:'#121014',pants:'#121014',shoes:'#2a2a2a',skin:0},
 clerk:{hair:'#3a2a20',style:'short',top:'#e8e2d2',vest:'#2f6a4a',pants:'#2a2a33',shoes:'#3a2a20',skin:2,beard:'#3a2a20'},
 skifter:{hair:'#1c1c22',style:'hood',top:'#16161c',logo:'#7dff6a',pants:'#16161c',shoes:'#e8e8e8',skin:2,buds:1},
 leader:{hair:'#2a2a33',style:'short',top:'#5a4a8a',coat:1,pants:'#2a2a33',shoes:'#2a2a33',skin:3},
 henning:{hair:'#9a9286',style:'bald',top:'#c9a13a',coat:1,pants:'#4a3a2a',shoes:'#3a2a20',skin:0,beard:'#b9b2a6',glasses:1},
 soren:{hair:'#5a3a22',style:'beanie',beanie:'#c84a3a',top:'#3a5a8a',overalls:1,pants:'#3a5a8a',shoes:'#2a2a2a',skin:1,beard:'#5a3a22'},
 marianne:{hair:'#ece8e0',style:'bun',top:'#2a3a5a',dress:1,pants:'#2a3a5a',shoes:'#1a1a1a',skin:0,pearls:1},
 bent:{hair:'#7a7268',style:'short',top:'#6a6e74',coat:1,tie:'#8a2a2a',pants:'#5a5e64',shoes:'#1a1a1a',skin:0,glasses:1},
 ib:{hair:'#e8e4dc',style:'cap',cap:'#1d2438',top:'#1d2438',coat:1,pants:'#1d2438',shoes:'#1a1a1a',skin:1,beard:'#e8e4dc'},
 bettina:{hair:'#141018',style:'bob',top:'#b0283a',dress:1,pants:'#b0283a',shoes:'#141018',skin:0,lips:1},
 magnus:{hair:'#c8a46a',style:'slick',top:'#121216',pants:'#2a2a33',shoes:'#f4f4f4',skin:0,buds:1},
 kurt:{hair:'#6a4a2a',style:'dreads',top:'#e85a9a',tie_dye:1,pants:'#6a5a3a',shoes:'#5a3a28',skin:2,beard:'#6a4a2a'},
 sofie:{hair:'#6a3a2a',style:'long',top:'#b8b0a0',pants:'#2a2a33',shoes:'#e8e8e8',skin:0,glasses:1},
 a:{hair:'#b8862e',style:'long',top:'#5a7aa8',pants:'#33405a',shoes:'#e8e8e8',skin:0},
 b:{hair:'#6a2e1e',style:'bun',top:'#a8506a',coat:1,pants:'#3a3040',shoes:'#3a2a20',skin:1},
 c:{hair:'#1e1e22',style:'short',top:'#5a8a5a',pants:'#4a3a2a',shoes:'#3a2a20',skin:4},
 d:{hair:'#e8d080',style:'messy',top:'#c86a3a',pants:'#2e3a58',shoes:'#e8e8e8',skin:0,scarf:'#3a5a8a'},
 e:{hair:'#9a9a9a',style:'bald',top:'#6a5a8a',coat:1,pants:'#3a3a48',shoes:'#3a2a20',skin:0,glasses:1,beard:'#b0b0b0'},
 f:{hair:'#2a1e18',style:'curly',top:'#e8e2d2',pants:'#2f5a5a',shoes:'#3a2a20',skin:3},
 g:{hair:'#c0602a',style:'long',top:'#3f8a8a',pants:'#2a2a33',shoes:'#e8e8e8',skin:0,scarf:'#d9a940'},
 h:{hair:'#3a2618',style:'bun',top:'#8a3a3a',coat:1,pants:'#4a4a58',shoes:'#3a2a20',skin:2}
};
function limb(x,X,Y,len,ang,w,col){x.save();x.translate(X,Y);x.rotate(ang);fillRR(x,-w/2,0,w,len,w/2,col);x.restore()}
/* draw a person standing on tile (X,Y) top-left; p = walk phase 0..1 */
function drawPerson(x,look,dir,X,Y,p,moving){
  const L=LOOKS[look]||LOOKS.a;const sk=SKIN[L.skin||0],skD=shade(sk,.82);
  const s=moving?Math.sin(p*Math.PI*2):0,bob=moving?Math.abs(Math.cos(p*Math.PI*2))*.5:0;
  const cx=X+8,feet=Y+15.2,side=dir==='l'||dir==='r',f=dir==='l'?-1:1;
  softShadow(x,cx,feet,4.6,1.5,.3);
  const top=L.top,topD=shade(top,.75),pants=L.pants,pantsD=shade(pants,.78);
  const hipY=feet-8-bob;
  x.save();
  if(side){x.translate(cx,0);x.scale(f,1);x.translate(-cx,0)}
  // legs
  if(!side){limb(x,cx-1.7,hipY,7.6+(s>0?-s*1.2:0),0,2.3,pantsD);limb(x,cx+1.7,hipY,7.6+(s<0?s*1.2:0),0,2.3,pants);
    fillRR(x,cx-3,feet-1.2-(s>0?s*1.2:0),2.6,1.4,.6,L.shoes);fillRR(x,cx+.4,feet-1.2-(s<0?-s*1.2:0),2.6,1.4,.6,L.shoes)}
  else{limb(x,cx,hipY,7.8,s*.5,2.3,pantsD);limb(x,cx,hipY,7.8,-s*.5,2.3,pants);
    const a1=s*.5,a2=-s*.5;fillRR(x,cx+Math.sin(-a1)*7.6-1,hipY+Math.cos(a1)*7.6-.8,3,1.4,.6,L.shoes);fillRR(x,cx+Math.sin(-a2)*7.6-1,hipY+Math.cos(a2)*7.6-.8,3,1.4,.6,L.shoes)}
  // back arm (side view)
  const shY=hipY-7.2;
  if(side)limb(x,cx,shY+.6,6.5,-s*.55,1.8,topD);
  // torso
  const tw=side?5.6:7.4,tl=L.coat||L.dress?9.5:8;
  x.fillStyle=lg(x,cx-tw/2,0,cx+tw/2,0,[[0,shade(top,1.08)],[.65,top],[1,topD]]);rr(x,cx-tw/2,shY,tw,tl,2.2);x.fill();
  if(L.dress){x.beginPath();x.moveTo(cx-tw/2,shY+5);x.lineTo(cx+tw/2,shY+5);x.lineTo(cx+tw/2+1.2,shY+11);x.lineTo(cx-tw/2-1.2,shY+11);x.fill()}
  if(L.poncho){x.fillStyle=L.poncho;x.beginPath();x.moveTo(cx-tw/2-1.4,shY+5.5);x.lineTo(cx,shY-.2);x.lineTo(cx+tw/2+1.4,shY+5.5);x.lineTo(cx,shY+7.5);x.fill();x.strokeStyle='#e8c04a';x.lineWidth=.45;x.beginPath();x.moveTo(cx-3.5,shY+4.2);x.lineTo(cx,shY+6);x.lineTo(cx+3.5,shY+4.2);x.stroke()}
  if(L.overalls&&!side){fillRR(x,cx-2.6,shY+2,5.2,6,1,shade(L.pants,1.1));x.fillStyle='#d9a940';circ(x,cx-1.8,shY+2.5,.4,'#d9a940');circ(x,cx+1.8,shY+2.5,.4,'#d9a940')}
  if(L.vest&&!side){x.fillStyle=L.vest;x.fillRect(cx-tw/2,shY+.8,2.2,tl-1);x.fillRect(cx+tw/2-2.2,shY+.8,2.2,tl-1)}
  if(L.apron&&dir!=='u'){fillRR(x,cx-(side?1.8:2.8),shY+3,side?4:5.6,7,.8,L.apron)}
  if(L.tie&&dir==='d'){x.fillStyle='#ece8e0';x.beginPath();x.moveTo(cx-1.4,shY);x.lineTo(cx,shY+2);x.lineTo(cx+1.4,shY);x.fill();x.fillStyle=L.tie;x.fillRect(cx-.5,shY+1,1,5)}
  if(L.logo&&dir==='d'){x.fillStyle=L.logo;x.font=`3px ${FONT_SIGN}`;x.textAlign='center';x.textBaseline='middle';x.fillText('S',cx,shY+3.6)}
  if(L.tie_dye&&dir!=='u'){for(const[c,r]of[['#f4d04a',2.6],['#5ad0e8',1.7],['#7a3fa0',.9]])circ(x,cx+(side?.5:0),shY+3.8,r,c)}
  if(L.bag&&(dir==='u'||side)){fillRR(x,cx-(side?3.6:2.6),shY+2.4,side?2.6:5.2,5,1,L.bag)}
  if(L.scarf){fillRR(x,cx-tw/2+.2,shY-.6,tw-.4,2,1,L.scarf);if(dir==='d')x.fillRect(cx+1,shY+1,1.4,3.4)}
  if(L.pearls&&dir==='d'){for(let k=-2;k<=2;k++)circ(x,cx+k*.9,shY+.9+Math.abs(k)*-.15+.4,.35,'#f4f0e6')}
  // arms (front)
  if(!side){limb(x,cx-tw/2-.4,shY+.8,6.4,.08+s*.18,1.8,shade(top,.92));limb(x,cx+tw/2+.4,shY+.8,6.4,-.08+s*.18,1.8,topD);
    circ(x,cx-tw/2-.9+s*-1,shY+7.4,.95,sk);circ(x,cx+tw/2+.9+s*-1,shY+7.4,.95,skD)}
  else{limb(x,cx,shY+.6,6.5,s*.55,1.8,shade(top,1.05));circ(x,cx-Math.sin(s*.55)*6.5,shY+.6+Math.cos(s*.55)*6.5,.95,sk)}
  // head
  const hy=shY-4.2,hr=3.4;
  x.fillStyle=sk;x.fillRect(cx-.9,shY-1.2,1.8,1.6);
  if(L.style==='long'||L.style==='dreads'){x.fillStyle=shade(L.hair,.85);rr(x,cx-hr-.6+(side?-1:0),hy-.5,hr*2+1.2,hr*2+(L.style==='dreads'?6:4.5),2);x.fill()}
  x.fillStyle=rg(x,cx,hy,0,hr+.5,[[0,shade(sk,1.06)],[1,skD]],cx-1,hy-1.2);x.beginPath();x.ellipse(cx+(side?.6:0),hy,hr-(side?.3:0),hr+.2,0,0,Math.PI*2);x.fill();
  const H=L.hair,HD=shade(H,.78);
  const hairCap=()=>{x.fillStyle=lg(x,0,hy-hr,0,hy,[[0,shade(H,1.15)],[1,H]]);x.beginPath();x.ellipse(cx,hy-1,hr+.35,hr*.75,0,Math.PI,0);x.fill()};
  if(dir==='u'){if(L.style!=='bald'){x.fillStyle=lg(x,0,hy-hr,0,hy+hr,[[0,shade(H,1.12)],[1,HD]]);x.beginPath();x.ellipse(cx,hy,hr+.35,hr+.4,0,0,Math.PI*2);x.fill()}else{x.fillStyle=HD;x.fillRect(cx-hr,hy+.5,hr*2,1.5)}
    if(L.style==='bun')circ(x,cx,hy-hr-.6,1.5,H);if(L.style==='hood'){x.fillStyle=top;x.beginPath();x.ellipse(cx,hy,hr+.9,hr+1,0,0,Math.PI*2);x.fill()}
    if(L.style==='beanie'){x.fillStyle=L.beanie;x.beginPath();x.ellipse(cx,hy-.8,hr+.5,hr,0,Math.PI,0);x.fill();x.fillRect(cx-hr-.5,hy-1,hr*2+1,1.4)}
    if(L.style==='cap'){x.fillStyle=L.cap;x.beginPath();x.ellipse(cx,hy-1.2,hr+.4,hr*.8,0,Math.PI,0);x.fill()}}
  else{
    if(L.style==='short'||L.style==='slick'||L.style==='messy'||L.style==='curly'){hairCap();if(!side){x.fillStyle=H;x.fillRect(cx-hr-.2,hy-1.5,1.1,2.2);x.fillRect(cx+hr-.9,hy-1.5,1.1,2.2)}else{x.fillStyle=H;x.beginPath();x.ellipse(cx-1.2,hy-.4,2.3,2.8,0,0,Math.PI*2);x.fill()}
      if(L.style==='messy'){for(let k=-2;k<=2;k++)circ(x,cx+k*1.4,hy-hr+.3+Math.abs(k)*.3,1,H)}
      if(L.style==='curly'){for(let k=-3;k<=3;k++)circ(x,cx+k*1.1,hy-hr+.6+Math.abs(k)*.35,1.15,H)}
      if(L.style==='slick'){x.strokeStyle=shade(H,1.3);x.lineWidth=.35;x.beginPath();x.moveTo(cx-2.5,hy-2.6);x.quadraticCurveTo(cx,hy-3.8,cx+2.8,hy-2.4);x.stroke()}}
    if(L.style==='long'||L.style==='bob'){hairCap();x.fillStyle=H;if(!side){x.fillRect(cx-hr-.4,hy-1.6,1.6,L.style==='bob'?4.4:6);x.fillRect(cx+hr-1.2,hy-1.6,1.6,L.style==='bob'?4.4:6)}else{x.beginPath();x.ellipse(cx-1.5,hy+.4,2.6,3.6,0,0,Math.PI*2);x.fill()}}
    if(L.style==='bun'){hairCap();circ(x,cx+(side?-2:0),hy-hr-.5,1.6,H)}
    if(L.style==='dreads'){hairCap();x.strokeStyle=H;x.lineWidth=.9;for(let k=-3;k<=3;k+=1.5){if(side&&k>0)continue;x.beginPath();x.moveTo(cx+k,hy-1);x.lineTo(cx+k*1.15,hy+4.5);x.stroke()}}
    if(L.style==='bald'){x.fillStyle=H;if(!side){x.fillRect(cx-hr,hy-.4,1,2);x.fillRect(cx+hr-1,hy-.4,1,2)}else x.fillRect(cx-1.5,hy-.6,1.4,2.2)}
    if(L.style==='hood'){x.fillStyle=top;x.beginPath();x.ellipse(cx,hy-.6,hr+1,hr+.8,0,Math.PI*1.02,-Math.PI*.02);x.fill();x.fillRect(cx-hr-1,hy-.6,1.2,4);if(!side)x.fillRect(cx+hr-.2,hy-.6,1.2,4)}
    if(L.style==='beanie'){x.fillStyle=L.beanie;x.beginPath();x.ellipse(cx,hy-1,hr+.5,hr*.95,0,Math.PI,0);x.fill();x.fillStyle=shade(L.beanie,.8);x.fillRect(cx-hr-.5,hy-1.4,hr*2+1,1.5)}
    if(L.style==='cap'){x.fillStyle=L.cap;x.beginPath();x.ellipse(cx,hy-1.3,hr+.4,hr*.8,0,Math.PI,0);x.fill();x.fillRect(cx-hr+(side?1:-.5),hy-1.6,hr*2+(side?2.4:1),1.1);x.fillStyle='#d9a940';x.fillRect(cx-.6,hy-2.8,1.2,.7)}
    if(L.beard){x.fillStyle=L.beard;x.beginPath();x.ellipse(cx+(side?1:0),hy+2,side?2.2:2.8,1.9,0,0,Math.PI);x.fill()}
    // face
    const eyeY=hy+.1;
    if(!side){circ(x,cx-1.3,eyeY,.42,INK);circ(x,cx+1.3,eyeY,.42,INK);x.fillStyle=rgba(skD,.9);x.fillRect(cx-.6,hy+1.8,1.2,.35);
      if(L.lips)x.fillStyle='#b0283a',x.fillRect(cx-.7,hy+1.75,1.4,.45);
      if(L.glasses){x.strokeStyle='#2a2430';x.lineWidth=.3;x.beginPath();x.arc(cx-1.3,eyeY,.9,0,Math.PI*2);x.moveTo(cx+2.2,eyeY);x.arc(cx+1.3,eyeY,.9,0,Math.PI*2);x.moveTo(cx-.4,eyeY);x.lineTo(cx+.4,eyeY);x.stroke()}
      if(L.buds){circ(x,cx-hr-.1,hy+.6,.45,'#fff');circ(x,cx+hr+.1,hy+.6,.45,'#fff')}}
    else{circ(x,cx+2,eyeY,.42,INK);x.fillStyle=skD;x.fillRect(cx+hr-.2,hy+.6,.7,.8);if(L.glasses){x.strokeStyle='#2a2430';x.lineWidth=.3;x.beginPath();x.arc(cx+2,eyeY,.9,0,Math.PI*2);x.stroke()}if(L.buds)circ(x,cx-.4,hy+.8,.45,'#fff')}
  }
  x.restore();
}
/* the fox: deadpan companion with a faint psychedelic tail */
function drawFox(x,dir,X,Y,p,moving,t){
  const cx=X+8,feet=Y+15,s=moving?Math.sin(p*Math.PI*2):0;const side=dir==='l'||dir==='r',f=dir==='l'?-1:1;
  const O='#d9732f',OD='#a8501f',OL='#f09a52',W='#f4eee2';
  softShadow(x,cx,feet,5,1.4,.28);
  x.save();if(side){x.translate(cx,0);x.scale(f,1);x.translate(-cx,0)}
  const tailHue=(t/40)%360;const tailGrad=(x0,y0,x1,y1)=>lg(x,x0,y0,x1,y1,[[0,O],[.6,hsl((20+Math.sin(t/900)*30+360)%360,70,52)],[.85,hsl((300+tailHue*.05)%360,55,58)],[1,W]]);
  if(side){
    const wag=Math.sin(t/260)*.25;x.save();x.translate(cx-4,feet-6);x.rotate(-.6+wag);x.fillStyle=tailGrad(0,0,-7,0);x.beginPath();x.ellipse(-3.5,0,4.6,2.2,0,0,Math.PI*2);x.fill();x.restore();
    for(const[ox,a]of[[-2.6,s],[2.6,-s]]){limb(x,cx+ox,feet-5,4.6,a*.45,1.3,OD)}
    x.fillStyle=lg(x,0,feet-9,0,feet-3,[[0,OL],[1,O]]);x.beginPath();x.ellipse(cx,feet-6,5.2,3,0,0,Math.PI*2);x.fill();ell(x,cx+1,feet-4.6,3,1.4,W);
    x.fillStyle=O;x.beginPath();x.ellipse(cx+4.6,feet-9.2,3,2.6,0,0,Math.PI*2);x.fill();
    x.beginPath();x.moveTo(cx+6.4,feet-9.6);x.lineTo(cx+9.6,feet-8.4);x.lineTo(cx+6.4,feet-7.4);x.fill();ell(x,cx+7.4,feet-7.9,1.6,.9,W);circ(x,cx+9.6,feet-8.4,.5,INK);
    for(const ex of[3.4,5.4]){x.fillStyle=ex<4?OD:O;x.beginPath();x.moveTo(cx+ex-1,feet-10.8);x.lineTo(cx+ex,feet-14.6);x.lineTo(cx+ex+1.2,feet-10.6);x.fill()}
    circ(x,cx+6.2,feet-9.8,.5,'#1a1a22');circ(x,cx+6.35,feet-9.95,.18,'#9ff')}
  else{
    const wag=Math.sin(t/260)*.3;
    if(dir==='d'){x.save();x.translate(cx+3,feet-5);x.rotate(-1.1+wag);x.fillStyle=tailGrad(0,0,0,-8);x.beginPath();x.ellipse(0,-4,2.2,4.6,0,0,Math.PI*2);x.fill();x.restore()}
    for(const ox of[-2,2])limb(x,cx+ox,feet-4.8,4.6,0,1.4,OD);
    x.fillStyle=lg(x,0,feet-10,0,feet-2,[[0,OL],[1,O]]);x.beginPath();x.ellipse(cx,feet-6,4,3.6,0,0,Math.PI*2);x.fill();if(dir==='d')ell(x,cx,feet-5.4,2.2,2.6,W);
    if(dir==='u'){x.save();x.translate(cx,feet-5);x.rotate(wag*.6);x.fillStyle=tailGrad(0,0,0,-9);x.beginPath();x.ellipse(0,-3.5,2.4,5,0,0,Math.PI*2);x.fill();x.restore()}
    x.fillStyle=O;x.beginPath();x.ellipse(cx,feet-10.5,3.6,3.1,0,0,Math.PI*2);x.fill();
    for(const s2 of[-1,1]){x.fillStyle=O;x.beginPath();x.moveTo(cx+s2*1.2,feet-12.6);x.lineTo(cx+s2*3.2,feet-16.4);x.lineTo(cx+s2*3.6,feet-11.6);x.fill();x.fillStyle='#3a2a2a';x.beginPath();x.moveTo(cx+s2*2.6,feet-15);x.lineTo(cx+s2*3.2,feet-16.4);x.lineTo(cx+s2*3.4,feet-14.6);x.fill()}
    if(dir==='d'){ell(x,cx,feet-9.2,2.2,1.6,W);circ(x,cx,feet-8.6,.55,INK);circ(x,cx-1.4,feet-10.9,.5,'#1a1a22');circ(x,cx+1.4,feet-10.9,.5,'#1a1a22');circ(x,cx-1.3,feet-11,.18,'#9ff');circ(x,cx+1.5,feet-11,.18,'#9ff')}}
  x.restore();
}
/* small portrait image for DOM use */
const PORTRAIT={};
function personImage(look,size){const k=look+size;if(PORTRAIT[k])return PORTRAIT[k];const d=Math.min(3,window.devicePixelRatio||1);const c=mkc(size*d,size*d),x=c.getContext('2d');const sc=size*d/26;x.setTransform(sc,0,0,sc,sc*5,sc*10);drawPerson(x,look,'d',0,0,0,false);PORTRAIT[k]=c;return c}
