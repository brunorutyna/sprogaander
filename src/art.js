/* ================= ART: layered side-view scenes + characters =================
   World units: scene height = 100. Feet stand on FLOOR. Layers are pre-painted once
   at device resolution and slid at their own parallax speed (no per-frame repaint).   */
const FLOOR=82;
function rng(seed){let s=(seed*2654435761)>>>0||1;return()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296}}
function hexRGB(h){h=h.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');const n=parseInt(h,16);return[(n>>16)&255,(n>>8)&255,n&255]}
function mix(a,b,t){const A=hexRGB(a),B=hexRGB(b);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('')}
function rgba(h,a){const[r,g,b]=hexRGB(h);return`rgba(${r},${g},${b},${a})`}
function lg(x,x0,y0,x1,y1,st){const g=x.createLinearGradient(x0,y0,x1,y1);for(const[o,c]of st)g.addColorStop(o,c);return g}
function rg(x,cx,cy,r0,r1,st,fx,fy){const g=x.createRadialGradient(fx??cx,fy??cy,r0,cx,cy,r1);for(const[o,c]of st)g.addColorStop(o,c);return g}
function rr(x,X,Y,w,h,r){r=Math.min(r,w/2,h/2);x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+w,Y,X+w,Y+h,r);x.arcTo(X+w,Y+h,X,Y+h,r);x.arcTo(X,Y+h,X,Y,r);x.arcTo(X,Y,X+w,Y,r);x.closePath()}
function fr(x,X,Y,w,h,r,c){x.fillStyle=c;rr(x,X,Y,w,h,r);x.fill()}
function circ(x,X,Y,r,c){x.fillStyle=c;x.beginPath();x.arc(X,Y,r,0,Math.PI*2);x.fill()}
function ell(x,X,Y,a,b,c){x.fillStyle=c;x.beginPath();x.ellipse(X,Y,a,b,0,0,Math.PI*2);x.fill()}
function poly(x,pts,c){x.fillStyle=c;x.beginPath();x.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)x.lineTo(pts[i],pts[i+1]);x.closePath();x.fill()}
function mkCanvas(w,h){const c=document.createElement('canvas');c.width=Math.max(1,Math.ceil(w));c.height=Math.max(1,Math.ceil(h));return c}
/* smooth ridge silhouette down to the bottom */
function ridge(x,seed,x0,x1,base,amp,step,col,bottom){const r=rng(seed);x.fillStyle=col;x.beginPath();x.moveTo(x0,bottom);let y=base;
  const pts=[];for(let X=x0;X<=x1+step;X+=step){y=base-amp*(.35+.65*r());pts.push([X,y])}
  x.lineTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++){const[a,b]=pts[i-1],[c,d]=pts[i];x.quadraticCurveTo(a,b,(a+c)/2,(b+d)/2)}x.lineTo(x1+step,bottom);x.closePath();x.fill()}
/* soft glow sprite cache */
const GLOWS={};function glow(col){if(GLOWS[col])return GLOWS[col];const c=mkCanvas(128,128),x=c.getContext('2d');x.fillStyle=rg(x,64,64,0,64,[[0,rgba(col,1)],[.25,rgba(col,.45)],[1,rgba(col,0)]]);x.fillRect(0,0,128,128);return GLOWS[col]=c}
function drawGlow(x,X,Y,r,col,a){x.globalAlpha=a;x.drawImage(glow(col),X-r,Y-r,r*2,r*2);x.globalAlpha=1}

/* ============================================================ SCENE ART */
const ART={
/* ---------------------------------------------------------------- NIGHT TRAIN */
train:{bg:'#0b0f1e',amb:'#1c2f48',rim:'#ffb46a',
  layers:[
    {par:1,paint(x,W){
      // wall
      x.fillStyle=lg(x,0,0,0,80,[[0,'#16202f'],[.5,'#1f3044'],[1,'#22283a']]);x.fillRect(-2,0,W+4,80);
      // ceiling + luggage racks
      x.fillStyle=lg(x,0,0,0,12,[[0,'#0c111b'],[1,'#18212f']]);x.fillRect(-2,0,W+4,12);
      for(const[a,b]of[[6,48],[52,92],[96,144]]){x.fillStyle='#2b3647';x.fillRect(a,14,b-a,.8);for(let X=a;X<b;X+=3){x.fillRect(X,14,.4,3)}x.fillRect(a,17,b-a,.6)}
      // windows (cut out later)
      // wainscot
      x.fillStyle=lg(x,0,56,0,80,[[0,'#3a1f2c'],[1,'#26141d']]);x.fillRect(-2,58,W+4,22);x.fillStyle='rgba(255,190,140,.10)';x.fillRect(-2,58,W+4,.5);
      // floor
      x.fillStyle=lg(x,0,80,0,100,[[0,'#161219'],[1,'#0b0a0e']]);x.fillRect(-2,80,W+4,20);
      x.fillStyle=lg(x,0,82,0,100,[[0,'#5a2a37'],[1,'#2a1219']]);x.beginPath();x.moveTo(-2,84);x.lineTo(W+2,84);x.lineTo(W+2,100);x.lineTo(-2,100);x.fill();
      x.fillStyle='rgba(255,200,150,.08)';for(let X=0;X<W;X+=6)x.fillRect(X,84,.25,16);
      // seats (velvet), backs facing both ways
      const seat=(X,flip)=>{x.save();x.translate(X,0);if(flip)x.scale(-1,1);
        x.fillStyle=lg(x,0,46,0,80,[[0,'#7a3346'],[1,'#3d1622']]);rr(x,-1,48,9,30,3);x.fill();
        x.fillStyle='rgba(255,190,150,.18)';rr(x,-1,48,9,2.5,1.5);x.fill();
        x.fillStyle='#d9cbb5';rr(x,0,49,7,5,1.5);x.fill();// headrest cloth
        x.fillStyle=lg(x,0,68,0,78,[[0,'#6a2b3c'],[1,'#2e1119']]);rr(x,-1,68,16,9,2.5);x.fill();x.restore()};
      for(const[a,b]of[[8,38],[52,78],[100,128]]){seat(a,false);seat(b+8,true)}
      // table under window 2
      x.fillStyle='#3a2a22';rr(x,74,63,20,2.2,.8);x.fill();x.fillStyle='#2a1d17';x.fillRect(82,65,2,13);
      // speaker grille
      circ(x,118,22,2.6,'#2a3445');x.fillStyle='#11161f';for(let k=-2;k<=2;k++)x.fillRect(116+k*.9+1.4,20.5,.35,3);
      // ceiling lamps
      for(const X of[30,74,118]){x.fillStyle='#3a4152';rr(x,X-5,10,10,2,.8);x.fill();x.fillStyle='#ffe2b0';rr(x,X-4,11.4,8,1.2,.6);x.fill()}
      // window holes
      x.globalCompositeOperation='destination-out';for(const[a,b]of[[12,44],[56,92],[104,136]]){rr(x,a,24,b-a,26,4);x.fill()}x.globalCompositeOperation='source-over';
      // window frames
      for(const[a,b]of[[12,44],[56,92],[104,136]]){x.strokeStyle='#3c4b5c';x.lineWidth=1.3;rr(x,a,24,b-a,26,4);x.stroke();x.strokeStyle='rgba(255,200,150,.15)';x.lineWidth=.4;rr(x,a+.9,24.9,b-a-1.8,24.2,3.3);x.stroke();
        x.fillStyle='#3c4b5c';x.fillRect((a+b)/2-.4,24,.8,26)}
    }},
    {par:1.3,paint(x,W){x.fillStyle='rgba(6,6,12,.92)';for(const X of[-6,70,150]){rr(x,X,74,16,30,4);x.fill()}}}
  ],
  back(x,t,cam,vw){ // drawn behind the windows (the outside world)
    x.fillStyle=lg(x,0,24,0,50,[[0,'#0a1024'],[.7,'#1b2446'],[1,'#3a2e4e']]);x.fillRect(cam-2,20,vw+4,34);
    const sp=t/1000;
    // far city lights
    for(let i=0;i<70;i++){const r=rng(i+3);const X=cam+((r()*400-sp*6)%400+400)%400*vw/400*1.2-vw*.1,Y=40+r()*8;circ(x,X,Y,.25+r()*.25,rgba(r()<.5?'#ffcf8a':'#9ed0ff',.5+r()*.4))}
    // hills
    x.fillStyle='#0d1328';x.beginPath();x.moveTo(cam-2,50);for(let X=-2;X<=vw+2;X+=4){const wx=X+sp*10;x.lineTo(cam+X,44-3*Math.sin(wx*.05)-1.5*Math.sin(wx*.13))}x.lineTo(cam+vw+2,50);x.fill();
    // passing poles
    for(let i=0;i<3;i++){const X=cam+vw+20-((sp*55+i*70)%(vw+60));x.fillStyle='rgba(5,6,12,.95)';x.fillRect(X,22,1.6,30);x.fillRect(X-4,26,9,.6)}
  },
  dyn(x,t,cam,vw){for(const X of[30,74,118]){drawGlow(x,X,14,22,'#ffb46a',.35);drawGlow(x,X,70,26,'#ff9a5a',.12)}
    if(!FL.noteDone){fr(x,80,61.6,9,1.6,.4,'#e9dfc8');x.fillStyle='#b5463c';x.fillRect(80,61.6,.6,1.6);drawGlow(x,84,62,6,'#ffe6b0',.25)}}
},
/* ---------------------------------------------------------------- PIER */
pier:{bg:'#120d2e',amb:'#4a2d6a',rim:'#ff9f7a',horizon:60,moon:{u:.62,y:24,r:13},
  lanterns:[164,176,188,228,240,252],
  layers:[
    {par:.03,paint(x,W){
      x.fillStyle=lg(x,0,0,0,62,[[0,'#120d2e'],[.38,'#3b1f5e'],[.66,'#8a3f78'],[.9,'#f08a6a'],[1,'#ffc49a']]);x.fillRect(0,0,W,62);
      const r=rng(7);for(let i=0;i<160;i++){const X=r()*W,Y=r()*44;circ(x,X,Y,.1+r()*.22,`rgba(255,240,255,${(.25+r()*.6)*(1-Y/50)})`)}
      const m=ART.pier.moon,MX=W*m.u,MY=m.y,R=m.r;
      x.drawImage(glow('#ffd6e8'),MX-R*4,MY-R*4,R*8,R*8);
      x.save();x.translate(MX,MY);x.rotate(-.32);x.strokeStyle='rgba(255,228,240,.32)';x.lineWidth=1.4;x.beginPath();x.ellipse(0,0,R*1.9,R*.42,0,Math.PI,Math.PI*2);x.stroke();x.restore();
      x.fillStyle=rg(x,MX,MY,0,R,[[0,'#fff6ee'],[.7,'#f7dcea'],[1,'#e9bcd8']],MX-R*.35,MY-R*.4);x.beginPath();x.arc(MX,MY,R,0,Math.PI*2);x.fill();
      for(let i=0;i<7;i++){circ(x,MX+(r()-.5)*R*1.3,MY+(r()-.5)*R*1.3,R*(.08+r()*.14),'rgba(190,140,180,.12)')}
      x.save();x.translate(MX,MY);x.rotate(-.32);x.strokeStyle='rgba(255,236,246,.5)';x.lineWidth=1.4;x.beginPath();x.ellipse(0,0,R*1.9,R*.42,0,0,Math.PI);x.stroke();x.restore();
      x.fillStyle=rg(x,W*.5,62,0,W*.6,[[0,'rgba(255,190,150,.35)'],[1,'rgba(255,190,150,0)']]);x.fillRect(0,30,W,32);
    }},
    {par:.1,paint(x,W){ridge(x,11,-5,W+5,60,5,9,'#6a3c78',61);ridge(x,12,-5,W+5,60.4,2.6,6,'#83467e',61);
      // lighthouse on an islet
      const X=W*.22;x.fillStyle='#4a2c5c';x.beginPath();x.moveTo(X-.55,58.6);x.lineTo(X-.32,54.4);x.lineTo(X+.32,54.4);x.lineTo(X+.55,58.6);x.fill();x.fillStyle='#ffe7b8';x.fillRect(X-.3,53.8,.6,.6);x.drawImage(glow('#ffd59a'),X-3,51,6,6)}},
    {par:.32,paint(x,W){
      // sea
      x.fillStyle=lg(x,0,60,0,100,[[0,'#e7928a'],[.12,'#a4507a'],[.45,'#4a2a66'],[1,'#160f30']]);x.fillRect(0,60,W,40);
      x.fillStyle='rgba(255,220,200,.35)';x.fillRect(0,60,W,.35);
      // far cliffs + Halvby lights at the right
      const c0=W*.78;x.fillStyle='#2c1a40';x.beginPath();x.moveTo(c0,61);x.quadraticCurveTo(c0+8,44,c0+22,40);x.lineTo(W+2,36);x.lineTo(W+2,61);x.fill();
      const r=rng(4);for(let i=0;i<26;i++){const X=c0+14+r()*(W-c0-14),Y=37+r()*14;if(Y<40+(X-c0-14)*-.1)continue;x.fillStyle=rgba('#ffcf8a',.5+r()*.5);x.fillRect(X,Y,.6,.8)}
      for(let i=0;i<9;i++){const X=c0+16+i*3.6,h=6+r()*7;x.fillStyle='#3a2450';x.fillRect(X,40-h*.5,2.6,h*.5+2)}
    }},
    {par:1,paint(x,W){
      const D='#6d4a5e',T='#b9837b';
      // deck
      x.fillStyle=lg(x,0,79,0,87,[[0,T],[.25,D],[1,'#2f1d2c']]);x.fillRect(-4,79,258,8);
      x.fillStyle='rgba(30,15,30,.55)';for(let X=-4;X<254;X+=2.4)x.fillRect(X,79,.18,2.2);
      x.fillStyle='rgba(255,210,180,.35)';x.fillRect(-4,79,258,.3);
      // posts + reflections
      for(let X=2;X<254;X+=9){x.fillStyle='#251626';x.fillRect(X,86,1.6,10);x.fillStyle='rgba(20,10,25,.4)';x.fillRect(X+.1,96,1.4,4)}
      // bollards & rope
      for(const X of[20,118,240]){fr(x,X-1.5,76,3,3.4,1.2,'#2a1a2a');x.fillStyle='rgba(255,200,170,.3)';x.fillRect(X-1.3,76.2,2.6,.4)}
      x.strokeStyle='#8b6a55';x.lineWidth=.5;x.beginPath();x.moveTo(240,78);x.quadraticCurveTo(236,88,226,86);x.stroke();
      // lantern posts
      for(const X of ART.pier.lanterns){x.fillStyle='#24172b';x.fillRect(X-.45,57,.9,22);fr(x,X-2,52.5,4,5,.8,'#2e1e34');x.fillStyle='#1a1222';x.fillRect(X-1.3,53.4,2.6,3.4);fr(x,X-2.4,51.7,4.8,1.2,.5,'#3a2840')}
      // bench
      x.fillStyle='#3e2a3a';rr(x,89,72,15,1.6,.5);x.fill();rr(x,89,67,15,1.4,.5);x.fill();x.fillRect(90,72,1,7);x.fillRect(102,72,1,7);x.fillStyle='rgba(255,200,170,.25)';x.fillRect(89,72,15,.3);
      fr(x,94,67.2,5,1,.2,'#c9b48a');
      // rocks + stairs to the town
      x.fillStyle=lg(x,250,30,300,100,[[0,'#3b2550'],[1,'#1a1028']]);x.beginPath();x.moveTo(250,100);x.lineTo(252,82);x.quadraticCurveTo(258,60,270,50);x.quadraticCurveTo(284,38,W+4,30);x.lineTo(W+4,100);x.fill();
      x.fillStyle='rgba(255,170,150,.18)';x.beginPath();x.moveTo(252,82);x.quadraticCurveTo(258,60,270,50);x.quadraticCurveTo(284,38,W+4,30);x.lineTo(W+4,31.2);x.quadraticCurveTo(284,39.4,270.6,51);x.quadraticCurveTo(259,61,253,82);x.fill();
      for(let i=0;i<14;i++){const X=262+i*2.6,Y=81-i*3;x.fillStyle='#5a3b5e';x.fillRect(X,Y,4,1.2);x.fillStyle='rgba(255,200,180,.3)';x.fillRect(X,Y,4,.25)}
      x.fillStyle='#24172b';x.fillRect(296,30,.8,10);x.drawImage(glow('#ffcf8a'),291,24,10,10);
      const r=rng(9);for(let i=0;i<30;i++){const X=254+r()*46,Y=40+r()*50;x.fillStyle=rgba('#7a8a6a',.5);x.fillRect(X,Y,.25,-1-r()*1.5)}
    }},
    {par:1.35,paint(x,W){x.fillStyle='rgba(8,5,16,.92)';for(const X of[-10,150,330]){x.beginPath();x.ellipse(X,104,22,9,0,0,Math.PI*2);x.fill()}
      x.strokeStyle='rgba(8,5,16,.9)';x.lineWidth=.5;for(let i=0;i<16;i++){const X=4+i*1.3;x.beginPath();x.moveTo(X,100);x.quadraticCurveTo(X+1,92,X+2.5+Math.sin(i)*2,86+i%4);x.stroke()}}}
  ],
  back(x,t,cam,vw){const P=ART.pier;const s=t/1000;
    // moon reflection column (screen-locked to the sky layer)
    const skyW=vw+(SCENES.pier.w-vw)*.03;const mx=cam+(skyW*P.moon.u-cam*.03);
    for(let i=0;i<22;i++){const Y=61+i*1.6,w=(2+i*.35)*(0.6+.4*Math.sin(s*1.3+i*.9));x.fillStyle=`rgba(255,226,236,${.5-i*.018})`;x.fillRect(mx-w/2+Math.sin(s*.8+i)*.6,Y,w,.32)}
    // sea shimmer
    for(let i=0;i<70;i++){const r=rng(i+40);const X=cam*.32+((r()*1000+s*.6*(r()-.5))%(vw*1.6)),Y=62+r()*18;const a=.1+.18*(.5+.5*Math.sin(s*(.7+r())+i));x.fillStyle=`rgba(255,200,220,${a})`;x.fillRect(X,Y,1+r()*2.5,.22)}
  },
  dyn(x,t,cam,vw){const P=ART.pier;const s=t/1000;
    // lanterns
    P.lanterns.forEach((X,i)=>{if((FL.lamps||0)>i){x.fillStyle='#ffe2a6';x.fillRect(X-1.3,53.4,2.6,3.4);drawGlow(x,X,55,14,'#ffb466',.75);drawGlow(x,X,80,10,'#ff9a5a',.25)}});
    // boat
    const by=88+Math.sin(s*1.1)*.5,bx=232;x.save();x.translate(bx,by);x.rotate(Math.sin(s*.9)*.02);
    x.fillStyle='#2a1a33';x.beginPath();x.moveTo(-14,0);x.lineTo(14,0);x.quadraticCurveTo(12,5,6,6);x.lineTo(-10,6);x.quadraticCurveTo(-14,4,-14,0);x.fill();
    x.fillStyle='#b8473c';x.fillRect(-14,-.2,28,1);fr(x,-4,-7,9,7,1,'#e0d2c0');x.fillStyle='#ffd58a';x.fillRect(-2.5,-5.5,2.4,2.2);x.fillRect(1,-5.5,2.4,2.2);
    x.fillStyle='#2a1a33';x.fillRect(7,-14,.7,14);x.restore();drawGlow(x,bx,by-4,9,'#ffc879',.35);
    for(let i=0;i<4;i++){x.fillStyle=`rgba(255,210,170,${.12-i*.025})`;x.fillRect(bx-12+Math.sin(s+i)*.8,by+7+i*1.5,22-i*3,.3)}
    // drifting motes
    for(let i=0;i<24;i++){const r=rng(i+90);const X=cam+((r()*vw+s*(1+r()*2))%vw),Y=50+r()*30+Math.sin(s*.6+i)*2;drawGlow(x,X,Y,1.4,'#ffd9a8',.35+.25*Math.sin(s+i))}
  }
},
/* ---------------------------------------------------------------- HALVBY */
town:{bg:'#0f2f3f',amb:'#2f5f6a',rim:'#ffb27a',
  houses:null,
  layers:[
    {par:.03,paint(x,W){x.fillStyle=lg(x,0,0,0,74,[[0,'#0f2a3c'],[.42,'#2f6f7a'],[.72,'#e9a37c'],[1,'#ffd9a8']]);x.fillRect(0,0,W,74);
      const SX=W*.58;x.drawImage(glow('#ffd59a'),SX-50,20,100,100);circ(x,SX,62,13,'#ffd99e');circ(x,SX,62,11.5,'#ffe6b8');
      const r=rng(3);for(let i=0;i<7;i++){const X=r()*W,Y=12+r()*20,w=14+r()*20;x.fillStyle='rgba(255,220,200,.18)';x.beginPath();x.ellipse(X,Y,w,1.6+r(),0,0,Math.PI*2);x.fill()}}},
    {par:.14,paint(x,W){const r=rng(21);let X=-4;while(X<W+4){const w=4+r()*7,h=14+r()*22,lean=(r()-.5)*3;x.fillStyle=rgba('#3d6f80',.85);x.beginPath();x.moveTo(X,74);x.lineTo(X+lean,74-h);
        if(r()<.35){x.quadraticCurveTo(X+lean+w/2,74-h-w*.9,X+lean+w,74-h)}else{x.lineTo(X+lean+w/2,74-h-2-r()*4);x.lineTo(X+lean+w,74-h)}x.lineTo(X+w,74);x.fill();
        if(r()<.5){x.fillStyle=rgba('#ffd28a',.6);x.fillRect(X+w/2+lean*.5,74-h*.6,.5,.7)}X+=w+r()*3}
      x.fillStyle=lg(x,0,56,0,76,[[0,'rgba(255,214,170,0)'],[1,'rgba(255,214,170,.35)']]);x.fillRect(0,56,W,20)}},
    {par:.42,paint(x,W){const r=rng(5);let X=-6;while(X<W+6){const w=12+r()*14,h=18+r()*12;const top=78-h;x.fillStyle='#2a4a58';x.fillRect(X,top,w,h);
        x.beginPath();x.moveTo(X-.6,top);x.lineTo(X+w/2,top-6-r()*5);x.lineTo(X+w+.6,top);x.fill();
        if(r()<.6){x.fillRect(X+w*.7,top-8,1.6,6)}
        for(let k=0;k<3;k++)if(r()<.45){x.fillStyle=rgba('#ffcf8a',.7);x.fillRect(X+2+r()*(w-4),top+3+r()*(h-8),1,1.4);x.fillStyle='#2a4a58'}
        X+=w+.5}}},
    {par:1,paint(x,W){paintTown(x,W)}},
    {par:1.3,paint(x,W){x.fillStyle='rgba(6,10,14,.9)';for(const X of[70,250,470]){x.fillRect(X,20,1.6,90);x.beginPath();x.ellipse(X+.8,20,3,1.6,0,0,Math.PI*2);x.fill()}
      for(const X of[-8,180,400]){x.beginPath();x.ellipse(X,106,16,12,0,0,Math.PI*2);x.fill();for(let k=0;k<6;k++){x.beginPath();x.ellipse(X-8+k*3,96-k%2*3,1.6,5,(k-3)*.25,0,Math.PI*2);x.fill()}}}}
  ],
  back(x,t,cam,vw){const s=t/1000;
    // drifting paper lanterns in the sky
    for(let i=0;i<9;i++){const r=rng(i+200);const X=cam+((r()*vw*1.5+s*(.6+r()*.8))%(vw+20))-10,Y=8+r()*30+Math.sin(s*.4+i)*1.5;drawGlow(x,X,Y,4,'#ffb36a',.45);fr(x,X-.8,Y-1.1,1.6,2.2,.6,'#ffcf8a')}
  },
  dyn(x,t,cam,vw){const s=t/1000;
    for(const X of TOWN_LAMPS){drawGlow(x,X,31,16,'#ffb466',.55);drawGlow(x,X,82,14,'#ffa060',.18)}
    for(const sg of TOWN_SIGNS){if(FL['sign_'+sg.id]){drawGlow(x,sg.x,sg.y,sg.w*.9,sg.col,.45);x.fillStyle='#1d1622';rr(x,sg.x-sg.w/2,sg.y-3.2,sg.w,6.4,1);x.fill();
        x.font=`700 3.6px ${FONT_SIGN}`;x.textAlign='center';x.textBaseline='middle';x.shadowColor=sg.col;x.shadowBlur=6;x.fillStyle=sg.col;x.fillText(sg.t,sg.x,sg.y+.2);x.shadowBlur=0;
        if(sg.wares)for(let k=0;k<sg.wares.length;k++){x.font='3.4px sans-serif';x.fillText(sg.wares[k],sg.x-6+k*6,sg.dy)}}
      else{fr(x,sg.x-sg.w/2,sg.y-3.2,sg.w,6.4,1,'#2a2430');x.strokeStyle='rgba(255,255,255,.12)';x.lineWidth=.3;rr(x,sg.x-sg.w/2,sg.y-3.2,sg.w,6.4,1);x.stroke()}}
    // petals
    for(let i=0;i<16;i++){const r=rng(i+300);const X=cam+((r()*vw+s*(3+r()*3))%vw),Y=((r()*100+s*(4+r()*3))%95);x.fillStyle=rgba(['#ffd2d8','#ffe3b5','#f6c3a0'][i%3],.7);x.save();x.translate(X,Y);x.rotate(s*2+i);x.fillRect(-.5,-.25,1,.5);x.restore()}
  }
},
/* ---------------------------------------------------------------- CAFÉ */
cafe:{bg:'#2a1712',amb:'#6a3a2a',rim:'#ffc27a',
  layers:[
    {par:1,paint(x,W){
      x.fillStyle=lg(x,0,0,0,80,[[0,'#3a1d16'],[.4,'#7a3f2e'],[1,'#5a2c22']]);x.fillRect(-2,0,W+4,80);
      // windows to the street
      for(const[a,b]of[[8,34],[100,126]]){x.fillStyle=lg(x,0,22,0,52,[[0,'#2f6f7a'],[.6,'#e9a37c'],[1,'#ffd9a8']]);rr(x,a,22,b-a,30,2);x.fill();
        const r=rng(a);for(let X=a;X<b;X+=4+r()*3){const h=8+r()*12;x.fillStyle='#2a4a58';x.fillRect(X,52-h,3.4,h)}
        x.strokeStyle='#2a1610';x.lineWidth=1.2;rr(x,a,22,b-a,30,2);x.stroke();x.fillStyle='#2a1610';x.fillRect((a+b)/2-.4,22,.8,30);x.fillRect(a,36,b-a,.8)}
      // shelves
      for(const Y of[30,40]){x.fillStyle='#3b2216';x.fillRect(42,Y,50,1.2);const r=rng(Y);for(let X=44;X<90;X+=4+r()*3){const h=3+r()*4;fr(x,X,Y-h,2.6,h,.6,['#c9a46a','#6a8a5a','#d9d0c0','#9a5a4a'][Math.floor(r()*4)])}}
      // wood panel
      x.fillStyle=lg(x,0,58,0,80,[[0,'#4a2a1a'],[1,'#2e1910']]);x.fillRect(-2,58,W+4,22);x.fillStyle='rgba(255,210,160,.12)';x.fillRect(-2,58,W+4,.4);for(let X=0;X<W;X+=6){x.fillStyle='rgba(0,0,0,.18)';x.fillRect(X,58,.3,22)}
      // floor checker
      for(let Y=80;Y<100;Y+=4)for(let X=-2+((Y/4)%2)*4;X<W+4;X+=8){x.fillStyle='#3a2419';x.fillRect(X,Y,4,4)}x.fillStyle='rgba(0,0,0,.25)';x.fillRect(-2,80,W+4,20);
      x.fillStyle='#24140e';x.fillRect(-2,80,W+4,0);
      // counter
      x.fillStyle=lg(x,0,62,0,82,[[0,'#6a3e26'],[1,'#3a2014']]);x.fillRect(78,64,44,18);x.fillStyle='#c9a06a';x.fillRect(76,62.4,48,1.8);
      fr(x,100,52,10,10,1.2,'#b7b9be');fr(x,101,50,8,2.4,.8,'#8a8c90');x.fillStyle='#2a2a2e';x.fillRect(103,58,4,1);for(const X of[84,88,114])fr(x,X,59.6,2.4,2.8,.6,'#efe6d6');
      // record player
      x.fillStyle='#3a2216';x.fillRect(40,64,14,16);x.fillStyle='#24140e';x.fillRect(39,62.6,16,1.6);circ(x,46,62,.1,'#000');ell(x,46,62,5.4,1.2,'#141014');ell(x,46,62,1.4,.4,'#c9473c');
      // pendant lamps cords
      for(const X of[24,62,100]){x.fillStyle='#1c100c';x.fillRect(X-.15,0,.3,16);x.beginPath();x.moveTo(X-3.4,20);x.lineTo(X-1.2,15.6);x.lineTo(X+1.2,15.6);x.lineTo(X+3.4,20);x.fill()}
      // table + chairs
      fr(x,16,66,14,1.4,.6,'#6a3e26');x.fillStyle='#4a2a1a';x.fillRect(22.3,67,1.4,13);
      for(const X of[12,32]){x.fillStyle='#3a2014';x.fillRect(X,70,.8,10);x.fillRect(X+3,70,.8,10);fr(x,X,69.4,4,1,.4,'#4a2a1a')}
      // guitar on stand
      x.save();x.translate(64,72);x.rotate(-.12);ell(x,0,4,3.2,4,'#b8743a');ell(x,0,-.4,2.4,2.8,'#b8743a');circ(x,0,2.4,1,'#2a1610');x.fillStyle='#3a2216';x.fillRect(-.4,-13,.8,12);x.restore();
    }},
    {par:1.3,paint(x,W){x.fillStyle='rgba(10,6,4,.92)';for(const X of[-6,128]){fr(x,X,82,12,20,2,'rgba(10,6,4,.92)');for(let k=0;k<7;k++){x.beginPath();x.ellipse(X+6+(k-3)*2.2,80-k%3*4,1.8,6,(k-3)*.3,0,Math.PI*2);x.fill()}}}}
  ],
  dyn(x,t,cam,vw){for(const X of[24,62,100]){x.fillStyle='#ffe0a8';x.beginPath();x.ellipse(X,20,3.2,.8,0,0,Math.PI*2);x.fill();drawGlow(x,X,22,24,'#ffb466',.42)}
    const s=t/1000;x.save();x.translate(46,62);x.rotate(s*3.5);x.fillStyle='rgba(255,255,255,.12)';x.fillRect(-4.6,-.15,3,.3);x.restore()}
}
};
const FONT_SIGN="'Unbounded','Righteous',sans-serif";
const TOWN_LAMPS=[40,186,262,350];
const TOWN_SIGNS=[
  {id:'bageri',x:72,y:40,w:22,t:'BAGERI',col:'#ffcf7a',wares:['🍞','🥐','🍰'],dy:68},
  {id:'apotek',x:112,y:40,w:22,t:'APOTEK',col:'#7dffb0'},
  {id:'blomster',x:152,y:40,w:30,t:'BLOMSTERHANDLER',col:'#ff9bd2',wares:['🌷','🌸','🪴'],dy:68},
  {id:'cykel',x:226,y:40,w:28,t:'CYKELHANDLER',col:'#7fd8ff'},
  {id:'cafe',x:300,y:40,w:20,t:'CAFÉ',col:'#ffb07a'}];
function paintTown(x,W){
  const cols=['#d9a35f','#c8705f','#5f9e94','#8fb08a','#9a86b8','#d7b98a','#b3666b','#6f8fb8'];
  const r=rng(77);
  // sidewalk + street
  x.fillStyle='#8a7d78';x.fillRect(-4,79,W+8,3.4);x.fillStyle='rgba(255,230,200,.35)';x.fillRect(-4,79,W+8,.3);
  x.fillStyle=lg(x,0,82,0,100,[[0,'#5a4a50'],[1,'#2c2228']]);x.fillRect(-4,82.4,W+8,18);
  for(let row=0;row<7;row++){const Y=83.5+row*row*.42+row*1.6,h=1+row*.35,w=2.2+row*.7;for(let X=-4+(row%2)*w/2;X<W+4;X+=w+.4){x.fillStyle=`rgba(${row%2?'255,230,210':'0,0,0'},${.05+.02*r()})`;rr(x,X,Y,w,h,h/2);x.fill()}}
  // houses
  const spots=[[-4,30],[26,32],[58,28],[86,30],[116,30],[146,32],[178,26],[204,30],[234,30],[264,26],[286,30],[316,28],[344,30]];
  for(const[X,w]of spots){const h=48+r()*16,top=79-h,c=cols[Math.floor(r()*cols.length)],lean=(r()-.5)*.06;
    x.save();x.translate(X+w/2,79);x.transform(1,0,lean,1,0,0);x.translate(-(X+w/2),-79);
    x.fillStyle=lg(x,X,0,X+w,0,[[0,mix(c,'#ffe6c8',.12)],[1,mix(c,'#1a2a3a',.25)]]);x.fillRect(X,top,w,h);
    // stepped gable (Danish) or plain roof
    x.fillStyle='#3a2a36';if(r()<.55){const st=4,sw=w/(st*2+1);for(let k=0;k<=st;k++){x.fillStyle=mix(c,'#2a1a2a',.15);x.fillRect(X+k*sw,top-k*2.6,w-k*2*sw,2.7)}}
    else{x.beginPath();x.moveTo(X-1,top+.5);x.lineTo(X+w/2,top-10-r()*4);x.lineTo(X+w+1,top+.5);x.fill();x.fillStyle='rgba(255,200,170,.18)';x.beginPath();x.moveTo(X-1,top+.5);x.lineTo(X+w/2,top-10);x.lineTo(X+w/2,top-9);x.lineTo(X,top+.5);x.fill()}
    // windows
    const rows=Math.floor((h-24)/10);for(let ry=0;ry<rows;ry++)for(let cx=0;cx<3;cx++){const wx=X+4+cx*(w-8)/3+((w-8)/3-4)/2,wy=top+6+ry*10;const lit=r()<.42;
      x.fillStyle=lit?'#ffcf7a':'#24323e';fr(x,wx,wy,4,6.4,.8,lit?'#ffcf7a':'#24323e');if(lit){x.fillStyle='rgba(255,240,200,.6)';x.fillRect(wx+.6,wy+.6,2.8,1.2)}
      x.strokeStyle='rgba(255,250,240,.55)';x.lineWidth=.35;rr(x,wx,wy,4,6.4,.8);x.stroke();x.fillStyle='rgba(255,250,240,.45)';x.fillRect(wx+1.85,wy,.3,6.4)}
    x.restore()}
  // shop fronts at street level
  for(const sg of TOWN_SIGNS){if(sg.id==='cafe')continue;const X=sg.x-11;fr(x,X,60,22,19,1,'#1f2a33');x.fillStyle=lg(x,0,60,0,79,[[0,'rgba(255,214,160,.28)'],[1,'rgba(255,214,160,.06)']]);rr(x,X+1,61,13,17,.6);x.fill();
    fr(x,X+15,63,6,16,.6,'#3a2a22');circ(x,X+16.3,71,.35,'#e8c58a')}
  // café: awning + tables
  const cx=300;fr(x,cx-14,56,28,23,1,'#2a1d1c');x.fillStyle=lg(x,0,58,0,79,[[0,'rgba(255,200,130,.55)'],[1,'rgba(255,170,100,.2)']]);rr(x,cx-12,58,15,20,.6);x.fill();fr(x,cx+5,60,7,19,.6,'#4a2a1e');
  for(let k=0;k<8;k++){x.fillStyle=k%2?'#efe2cf':'#c4473c';x.beginPath();x.moveTo(cx-16+k*4,50);x.lineTo(cx-12+k*4,50);x.lineTo(cx-12+k*4,55);x.quadraticCurveTo(cx-14+k*4,57,cx-16+k*4,55);x.fill()}
  for(const X of[cx-24,cx+20]){fr(x,X-3,71,6,.9,.4,'#2a1d1c');x.fillStyle='#2a1d1c';x.fillRect(X-.3,71,.6,8)}
  // bench by the florist
  x.fillStyle='#3a2a2a';rr(x,143,73,16,1.4,.5);x.fill();rr(x,143,68.4,16,1.3,.5);x.fill();x.fillRect(144,73,1,6);x.fillRect(157,73,1,6);
  // Jonas's bike
  x.save();x.translate(236,72);x.strokeStyle='#1d2a33';x.lineWidth=.55;for(const X of[-4.5,4.5]){x.beginPath();x.arc(X,3.5,3.4,0,Math.PI*2);x.stroke()}
  x.strokeStyle='#d24c3c';x.lineWidth=.7;x.beginPath();x.moveTo(-4.5,3.5);x.lineTo(-1,-1.5);x.lineTo(3.5,-1.5);x.lineTo(4.5,3.5);x.moveTo(-1,-1.5);x.lineTo(0,3.5);x.lineTo(-4.5,3.5);x.moveTo(3.5,-1.5);x.lineTo(3,-3);x.stroke();x.restore();
  // station at the end
  const S0=372;x.fillStyle=lg(x,0,16,0,79,[[0,'#6f6a78'],[1,'#3f3a48']]);x.fillRect(S0,18,W-S0+6,61);x.fillStyle='#3a3442';x.beginPath();x.moveTo(S0-2,19);x.lineTo(S0+24,6);x.lineTo(W+8,19);x.fill();
  x.fillStyle='#1c1822';x.beginPath();x.moveTo(S0+10,79);x.lineTo(S0+10,54);x.arc(S0+20,54,10,Math.PI,0);x.lineTo(S0+30,79);x.fill();
  circ(x,S0+20,30,6,'#e9e2d2');circ(x,S0+20,30,5.2,'#f6f0e2');for(let k=0;k<12;k++){const a=k/12*Math.PI*2;x.fillStyle='#3a3442';x.fillRect(S0+20+Math.cos(a)*4.3-.2,30+Math.sin(a)*4.3-.2,.4,.4)}
  fr(x,S0+8,42,24,5,1,'#2a2430');
  // lamp posts
  for(const X of TOWN_LAMPS){x.fillStyle='#1d262c';x.fillRect(X-.5,31,1,48);fr(x,X-1.6,77,3.2,2,.6,'#1d262c');fr(x,X-2.4,28.4,4.8,3.2,1,'#2a343a');x.fillStyle='#ffd99a';x.fillRect(X-1.6,29.4,3.2,1.6)}
}

/* ============================================================ CHARACTERS */
const LOOK={
  du:   {h:30,coat:'#2b3a55',coat2:'#1d283d',scarf:'#e3a83b',skin:'#e0b48e',hair:'#2a1d16',hairStyle:'short',legs:'#1b1d26',bag:true},
  ilse: {h:27,coat:'#e8b43a',coat2:'#b8862a',skin:'#e6c0a0',hair:'#cfcbc6',hairStyle:'hat',hat:'#e8b43a',legs:'#2a2a32',lantern:true},
  holger:{h:31,w:1.25,coat:'#5f7a3a',coat2:'#3e5226',skin:'#d8a580',hair:'#b9b2a8',hairStyle:'cap',hat:'#4a3a2a',beard:'#c9c1b6',legs:'#3a3226'},
  jonas:{h:29,coat:'#3a7fb0',coat2:'#2a5a80',skin:'#c88e6a',hair:'#1a1410',hairStyle:'helmet',hat:'#f0f0ea',legs:'#232a33'},
  sif:  {h:28,coat:'#7a2e3a',coat2:'#5a1f2a',skin:'#f0c8a8',hair:'#b5502a',hairStyle:'long',legs:'#2a2026',scarf:'#e9d8b8'}
};
function drawChar(x,id,X,Y,o){o=o||{};if(id==='ravn')return drawRaven(x,X,Y,o);const L=LOOK[id];if(!L)return;const A=o.amb||'#304050',rim=o.rim||'#ffb27a';
  const H=L.h,wd=(L.w||1);const ph=o.walk||0,mv=o.moving;const bob=mv?Math.abs(Math.sin(ph*Math.PI))*.7:Math.sin((o.t||0)/700)*.18;
  const c=k=>mix(L[k],A,.22);
  x.save();x.translate(X,Y);if(o.face<0)x.scale(-1,1);
  // shadow
  x.fillStyle='rgba(0,0,0,.28)';x.beginPath();x.ellipse(0,0,5*wd,1.1,0,0,Math.PI*2);x.fill();
  const sit=o.sit;const legH=sit?0:H*.36,hip=-legH-(sit?6:0);
  // legs
  if(!sit){const sw=mv?Math.sin(ph*Math.PI*2)*2.2:0;for(const[s,d]of[[-1,sw],[1,-sw]]){x.save();x.translate(s*1.3*wd,hip);x.rotate(d*.09);fr(x,-1.05,0,2.1,legH+.4,1,s<0?mix(L.legs,'#000',.2):L.legs);fr(x,-1.2,legH-.6,3,1.2,.6,'#1a1418');x.restore()}}
  else{fr(x,-3*wd,hip+2.2,8*wd,2.4,1.1,L.legs);fr(x,3.6*wd,hip+2.2,2.2,7.8,1,L.legs);fr(x,3.4*wd,hip+9,3.4,1.2,.6,'#1a1418')}
  // body / coat
  const bh=H*.42,bt=hip-bh+bob*.5;
  x.fillStyle=lg(x,-4*wd,0,4*wd,0,[[0,c('coat')],[.7,c('coat')],[1,c('coat2')]]);x.beginPath();x.moveTo(-3.2*wd,bt+1.6);x.quadraticCurveTo(-3.6*wd,bt,-1.6*wd,bt-.3);x.lineTo(1.6*wd,bt-.3);x.quadraticCurveTo(3.6*wd,bt,3.2*wd,bt+1.6);x.lineTo(3.9*wd,hip+(sit?1:2.2));x.lineTo(-3.9*wd,hip+(sit?1:2.2));x.closePath();x.fill();
  // rim light on the lit side
  x.fillStyle=rgba(rim,.32);x.beginPath();x.moveTo(3.2*wd,bt+1.6);x.lineTo(3.9*wd,hip+2.2);x.lineTo(3.2*wd,hip+2.2);x.lineTo(2.6*wd,bt+1.8);x.fill();
  if(L.bag){x.strokeStyle=mix('#3a2a1a',A,.2);x.lineWidth=.6;x.beginPath();x.moveTo(-2.4,bt+.3);x.lineTo(2.6,hip-1);x.stroke()}
  // arm
  const as=mv?Math.sin(ph*Math.PI*2)*.25:0;x.save();x.translate(-.4*wd,bt+1.4);x.rotate(.08-as);fr(x,-1,0,2,bh*.82,1,c('coat2'));circ(x,0,bh*.82,1,mix(L.skin,A,.2));x.restore();
  if(L.lantern){x.save();x.translate(2.6,hip-1.4);x.fillStyle='#3a2a2a';x.fillRect(-.15,-2,.3,2);fr(x,-1.3,0,2.6,3,.5,'#3a2a2a');x.fillStyle='#ffe2a6';x.fillRect(-.9,.5,1.8,2);x.restore();drawGlow(x,2.6,hip+.2,7,'#ffc070',.55)}
  // scarf
  if(L.scarf){fr(x,-2.4*wd,bt-.8,4.8*wd,1.9,.9,c('scarf'));if(!o.sit)fr(x,1*wd,bt+.6,1.4,4,.6,c('scarf'))}
  // head
  const hy=bt-3.6+(o.talk?Math.sin((o.t||0)/90)*.15:0);
  circ(x,.4,hy,2.9,mix(L.skin,A,.18));
  x.fillStyle=rgba(rim,.25);x.beginPath();x.arc(.4,hy,2.9,-1.2,1.1);x.arc(.1,hy,2.5,1.1,-1.2,true);x.fill();
  // eyes (simple)
  circ(x,1.9,hy-.2,.33,'#1a1418');
  // hair styles
  const hc=mix(L.hair,A,.2);
  if(L.hairStyle==='short'){x.fillStyle=hc;x.beginPath();x.arc(.2,hy-.4,3.05,Math.PI*.95,Math.PI*2.05);x.quadraticCurveTo(2.2,hy-2.2,-1,hy-1.4);x.closePath();x.fill()}
  if(L.hairStyle==='long'){x.fillStyle=hc;x.beginPath();x.arc(.2,hy-.4,3.2,Math.PI*.9,Math.PI*2.02);x.quadraticCurveTo(1.6,hy-1.6,-1,hy-1);x.lineTo(-2.6,hy+5.5);x.quadraticCurveTo(-3.6,hy+2,-3,hy);x.fill()}
  if(L.hairStyle==='hat'){x.fillStyle=hc;x.beginPath();x.arc(-1.8,hy+.4,1.4,0,Math.PI*2);x.fill();x.fillStyle=mix(L.hat,A,.15);x.beginPath();x.moveTo(-4.4,hy-.6);x.quadraticCurveTo(.4,hy-1.6,4.8,hy+.4);x.lineTo(3.4,hy-1.2);x.quadraticCurveTo(.6,hy-5.4,-2.6,hy-1.8);x.closePath();x.fill()}
  if(L.hairStyle==='cap'){x.fillStyle=mix(L.hat,A,.15);x.beginPath();x.arc(.3,hy-.8,3.1,Math.PI,Math.PI*2);x.fill();fr(x,.3,hy-1.3,4.4,.9,.45,mix(L.hat,A,.25))}
  if(L.hairStyle==='helmet'){x.fillStyle=mix(L.hat,A,.15);x.beginPath();x.arc(.3,hy-.6,3.3,Math.PI*.98,Math.PI*2.02);x.fill();x.fillStyle=rgba('#3a7fb0',.8);x.fillRect(-1.6,hy-3.3,1.2,2.4)}
  if(L.beard){x.fillStyle=mix(L.beard,A,.2);x.beginPath();x.moveTo(-.6,hy+.6);x.quadraticCurveTo(1,hy+4.4,3.2,hy+.6);x.lineTo(3.2,hy+.2);x.quadraticCurveTo(1.4,hy+1.4,-.6,hy+.2);x.fill()}
  x.restore()}
function drawRaven(x,X,Y,o){const t=(o.t||0)/1000;const hop=o.talk?Math.abs(Math.sin(t*5))*.4:0;x.save();x.translate(X,Y-hop);if(o.face<0)x.scale(-1,1);
  x.fillStyle='#15121c';x.beginPath();x.ellipse(0,-2.6,3,2,-.25,0,Math.PI*2);x.fill();x.beginPath();x.moveTo(-2.2,-2);x.lineTo(-5.6,-.4);x.lineTo(-2,-1.2);x.fill();
  circ(x,2.4,-4.6,1.5,'#15121c');x.beginPath();x.moveTo(3.6,-4.9);x.lineTo(5.6,-4.4);x.lineTo(3.6,-4);x.fill();circ(x,2.9,-5,.3,'#e8d7ff');
  x.fillStyle='rgba(185,167,255,.35)';x.beginPath();x.ellipse(-.4,-3.2,2.2,.8,-.3,0,Math.PI*2);x.fill();
  x.strokeStyle='#15121c';x.lineWidth=.35;x.beginPath();x.moveTo(-.4,-.8);x.lineTo(-.6,0);x.moveTo(.6,-.8);x.lineTo(.6,0);x.stroke();x.restore()}
