/* ================= PEOPLE + FOX (16×20, 4 directions × 3 frames) ================= */
const LOOKS={
 hero:{hair:'#3a2a20',style:'cap',cap:'#d9452e',shirt:'#e8603a',pants:'#2f4f86',shoes:'#f2f2f2',skin:0,bag:'#3a6a3a'},
 teacher:{hair:'#d9d4c8',style:'bun',shirt:'#3f7a5a',coat:1,pants:'#3a3a48',shoes:'#5a3a28',skin:2,glasses:1},
 kim:{hair:'#d88a32',style:'spiky',shirt:'#3a7ad8',pants:'#2a2a33',shoes:'#e8e8e8',skin:2},
 nurse:{hair:'#ea8aa8',style:'bun',shirt:'#f8f3f6',pants:'#f8f3f6',shoes:'#f0f0f0',skin:2,nurse:1},
 clerk:{hair:'#5a3a28',style:'short',shirt:'#f2efe6',apron:'#3f8a4a',pants:'#2a2a33',shoes:'#3a2a20',skin:0},
 skifter:{hair:'#1c1c22',style:'hood',shirt:'#26262e',pants:'#26262e',shoes:'#c8402e',skin:1,mark:1,shades:1},
 leader:{hair:'#2a2a33',style:'short',shirt:'#e4ae3a',coat:1,pants:'#3a3a48',shoes:'#2a2a33',skin:3},
 a:{hair:'#b8862e',style:'long',shirt:'#5a9ad8',pants:'#33405a',shoes:'#e8e8e8',skin:2},
 b:{hair:'#6a2e1e',style:'long',shirt:'#c8559a',pants:'#3a3040',shoes:'#3a2a20',skin:0},
 c:{hair:'#1e1e22',style:'short',shirt:'#78b858',pants:'#4a3a2a',shoes:'#3a2a20',skin:3},
 d:{hair:'#e8d080',style:'spiky',shirt:'#e07a3a',pants:'#2e3a58',shoes:'#e8e8e8',skin:2},
 e:{hair:'#9a9a9a',style:'bald',shirt:'#8a6ac0',pants:'#3a3a48',shoes:'#3a2a20',skin:0,glasses:1},
 f:{hair:'#3a2a20',style:'short',shirt:'#f4f1e6',pants:'#2f6a5a',shoes:'#3a2a20',skin:1},
 g:{hair:'#d06a3a',style:'long',shirt:'#3fa0a0',pants:'#2a2a33',shoes:'#e8e8e8',skin:2},
 h:{hair:'#4a3020',style:'bun',shirt:'#c84040',pants:'#4a4a58',shoes:'#3a2a20',skin:1}
};
function person(look,dir,frame){
  const L=LOOKS[look],c=mkc(16,20),x=c.getContext('2d');const SK=RAMP.skin[L.skin||0];
  const sh=L.shirt,shD=shade(sh,.75),shL=shade(sh,1.18),pa=L.pants,paD=shade(pa,.72),hr=L.hair,hrD=shade(hr,.7),hrL=shade(hr,1.3);
  const bob=frame?1:0;const Y=v=>v+bob*0; // keep body still; legs animate
  const side=dir==='l'||dir==='r';
  // legs
  if(!side){const lu=frame===1?1:0,ru=frame===2?1:0;
    R(x,5,15-lu,3,4,pa);R(x,8,15-ru,3,4,pa);R(x,10,15-ru,1,4,paD);R(x,7,15,1,3,paD);
    R(x,5,19-lu,3,1,L.shoes);R(x,8,19-ru,3,1,L.shoes);if(lu)R(x,5,18,3,1,shade(L.shoes,.7));if(ru)R(x,8,18,3,1,shade(L.shoes,.7))}
  else{if(frame===0){R(x,6,15,4,4,pa);R(x,9,15,1,4,paD);R(x,6,19,5,1,L.shoes)}
    else{const a=frame===1;R(x,a?5:8,15,3,4,pa);R(x,a?8:5,15,3,3,paD);R(x,a?4:8,19,4,1,L.shoes);R(x,a?8:5,18,3,1,shade(L.shoes,.7))}}
  // torso
  if(!side){R(x,4,10,8,6,sh);R(x,10,10,2,6,shD);R(x,4,10,8,1,shL);if(L.coat){R(x,4,10,8,7,sh);R(x,10,10,2,7,shD);R(x,7,11,2,5,shade(sh,1.25))}
    if(L.apron&&dir==='d'){R(x,5,11,6,5,L.apron);R(x,5,11,6,1,shade(L.apron,1.2))}
    if(L.mark&&dir==='d'){R(x,7,11,2,3,'#d9483c');px(x,6,11,'#d9483c');px(x,9,13,'#d9483c')}
    if(L.nurse&&dir==='d'){R(x,7,11,2,3,'#e04a4a');R(x,6,12,4,1,'#e04a4a')}
    if(L.bag&&dir==='u'){R(x,5,10,6,5,L.bag);R(x,5,10,6,1,shade(L.bag,1.3))}
    const sw=frame===1?1:frame===2?-1:0;
    R(x,3,11+(sw>0?1:0),1,4,sh);R(x,12,11+(sw<0?1:0),1,4,shD);px(x,3,15+(sw>0?1:0),SK[2]);px(x,12,15+(sw<0?1:0),SK[1])}
  else{R(x,5,10,6,6,sh);R(x,5,10,6,1,shL);R(x,9,10,2,6,shD);if(L.coat)R(x,5,10,6,7,sh);if(L.bag)R(x,4,10,2,5,L.bag);
    const sw=frame===1?-1:frame===2?1:0;R(x,7+sw,11,2,4,shD);R(x,7+sw,15,2,1,SK[2])}
  // head
  const hx=side?5:4,hw=side?7:8;R(x,hx,3,hw,7,SK[2]);R(x,hx+1,2,hw-2,1,SK[2]);R(x,hx+1,10,hw-2,1,SK[1]);R(x,hx+hw-1,4,1,6,SK[1]);
  if(!side){px(x,3,6,SK[2]);px(x,12,6,SK[1])}
  // hair
  const st=L.style;
  if(dir==='u'){R(x,4,1,8,8,hr);R(x,4,1,8,2,hrL);R(x,10,3,2,6,hrD);if(st==='long'||st==='bun')R(x,4,8,8,3,hr);if(st==='bun'){R(x,6,0,4,2,hr);R(x,6,0,2,1,hrL)}}
  else if(!side){if(st!=='bald'){R(x,4,1,8,3,hr);R(x,5,1,4,1,hrL);R(x,4,4,1,2,hr);R(x,11,4,1,2,hrD);px(x,5,4,hr);px(x,10,4,hr);if(st==='spiky'){px(x,4,0,hr);px(x,7,0,hr);px(x,10,0,hr)}}
    else{R(x,4,3,1,3,hr);R(x,11,3,1,3,hr)}
    if(st==='long'){R(x,3,4,2,6,hr);R(x,11,4,2,6,hrD)}
    if(st==='bun'){R(x,6,0,4,2,hr);px(x,6,0,hrL)}
    if(st==='hood'){R(x,3,1,10,3,sh);R(x,3,4,1,6,sh);R(x,12,4,1,6,shD)}
    if(L.cap){R(x,4,1,8,3,L.cap);R(x,4,1,8,1,shade(L.cap,1.25));R(x,4,4,8,1,shade(L.cap,.7))}
    // face
    R(x,6,6,1,2,INK);R(x,9,6,1,2,INK);px(x,6,6,'#5a5a6a');
    if(L.glasses){R(x,5,6,3,1,'#2a2a33');R(x,8,6,3,1,'#2a2a33')}
    if(L.shades){R(x,5,6,6,2,'#14141a');px(x,6,6,'#5a6a8a')}
    px(x,7,9,SK[1]);px(x,8,9,SK[1]);px(x,5,8,mix(SK[2],'#e88080',.35));px(x,10,8,mix(SK[2],'#e88080',.35));
    if(L.nurse){R(x,5,0,6,2,'#ffffff');R(x,7,0,2,2,'#e04a4a')}}
  else{if(st!=='bald'){R(x,5,1,7,3,hr);R(x,5,1,4,1,hrL);R(x,4,3,4,4,hr);R(x,4,6,2,1,hrD)}else R(x,5,3,3,3,hr);
    if(st==='long'){R(x,3,4,4,7,hr);R(x,3,8,2,3,hrD)}
    if(st==='bun'){R(x,3,1,3,3,hr)}
    if(st==='spiky'){px(x,6,0,hr);px(x,9,0,hr);px(x,4,2,hr)}
    if(st==='hood'){R(x,4,1,8,3,sh);R(x,4,3,4,7,sh)}
    if(L.cap){R(x,5,1,7,3,L.cap);R(x,10,3,4,1,shade(L.cap,.75))}
    R(x,10,6,1,2,INK);px(x,12,7,SK[1]);px(x,9,9,SK[1]);
    if(L.glasses)R(x,9,6,3,1,'#2a2a33');if(L.shades)R(x,9,6,3,2,'#14141a');
    if(L.nurse){R(x,6,0,5,2,'#ffffff')}}
  outline(c,INK,true);
  if(dir==='l')return flipH(c);
  return c;
}
function foxSprite(dir,frame){
  const c=mkc(16,20),x=c.getContext('2d');const O=['#8e4219','#c4602a','#e8843a','#f6ad6a'],Wt=['#cfc6b6','#f4eee4','#ffffff'];
  const oy=4;
  if(dir==='d'||dir==='u'){
    const t=frame===1?-1:frame===2?1:0;
    R(x,10+t,oy+2,4,6,O[2]);R(x,11+t,oy+1,3,3,O[3]);R(x,11+t,oy,3,2,Wt[1]);
    R(x,4,oy+8,8,6,O[2]);R(x,9,oy+8,3,6,O[1]);
    R(x,5,oy+13,2,frame===1?1:2,O[0]);R(x,9,oy+13,2,frame===2?1:2,O[0]);
    R(x,3,oy+2,10,7,O[2]);R(x,3,oy+2,10,2,O[3]);R(x,11,oy+3,2,6,O[1]);
    R(x,3,oy-1,3,4,O[2]);R(x,10,oy-1,3,4,O[1]);R(x,4,oy,1,2,O[0]);R(x,11,oy,1,2,O[0]);
    if(dir==='d'){R(x,5,oy+6,6,4,Wt[1]);R(x,6,oy+9,4,1,Wt[0]);R(x,7,oy+6,2,1,INK);R(x,5,oy+4,1,2,INK);R(x,10,oy+4,1,2,INK);px(x,5,oy+4,'#4a4a5a');R(x,6,oy+10,4,4,Wt[1])}
    else{R(x,4,oy+3,8,5,O[2]);R(x,4,oy+3,8,1,O[3])}
  }else{
    const step=frame;const a=step===1,b=step===2;
    R(x,0,oy+5,5,4,O[2]);R(x,0,oy+4,3,2,O[3]);R(x,0,oy+3,2,2,Wt[1]);
    R(x,3,oy+7,8,5,O[2]);R(x,3,oy+7,8,1,O[3]);R(x,4,oy+10,6,2,Wt[1]);
    R(x,4,oy+12,2,a?1:2,O[0]);R(x,8,oy+12,2,b?1:2,O[0]);R(x,5+(a?1:0),oy+12,1,2,O[1]);
    R(x,9,oy+2,6,6,O[2]);R(x,9,oy+2,6,2,O[3]);R(x,10,oy-1,2,3,O[2]);R(x,13,oy-1,2,3,O[1]);px(x,10,oy,O[0]);
    R(x,13,oy+5,3,3,Wt[1]);px(x,15,oy+5,INK);R(x,12,oy+3,1,2,INK);R(x,9,oy+6,3,2,Wt[1]);
  }
  outline(c,INK,true);
  if(dir==='l')return flipH(c);
  return c;
}
const SPR={};
function buildSprites(){for(const k in LOOKS){SPR[k]={};for(const d of'udlr')SPR[k][d]=[0,1,2].map(f=>person(k,d,f))}
  SPR.fox={};for(const d of'udlr')SPR.fox[d]=[0,1,2].map(f=>foxSprite(d,f));}
