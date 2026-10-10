/* ================= WORLD ART (vector): ground, props, buildings; chunk cache; animated tiles =================
   World units: 1 tile = 16 units. Everything here draws in world units; the caller sets the transform. */
const SOLID=new Set('T~RrgaBbWwovFSLcXH#KhnqCYZtI'.split(''));
const ROOFS=new Set('Rrga'.split('')),WALLS=new Set('BWbwovD'.split(''));
const MX=8,MY=6; // forest margin around outdoor maps (tiles)
const AUTUMN=['#c9862f','#b8602c','#d6a63e','#9a7a2e'];
/* tile lookup that knows about margins and neighbours: returns null where a neighbour map should be drawn instead */
function tAt(m,tx,ty){if(tx>=0&&ty>=0&&tx<m.w&&ty<m.h)return m.g[ty][tx];if(!m.outdoor)return'Z';if(tx<0||tx>=m.w)return'T';if((ty<0&&!m.prev)||(ty>=m.h&&!m.next))return'T';return null}
function tAtN(m,tx,ty){const c=tAt(m,tx,ty);if(c!=null)return c;return ty<0?':':':'} // for neighbour-aware blending only
const isGrassy=c=>c!=null&&'.,TfSLXFH'.includes(c);
const isPath=c=>c===':';const isCob=c=>c==='='||c==='c';const isWater=c=>c==='~';

/* ---------- ground ---------- */
function drawGround(x,m,x0,y0,x1,y1){
  // base grass everywhere outdoors, dark void indoors
  if(m.outdoor){x.fillStyle=PAL.grass;x.fillRect(x0*16,y0*16,(x1-x0+1)*16,(y1-y0+1)*16)}
  else{x.fillStyle='#14111a';x.fillRect(x0*16,y0*16,(x1-x0+1)*16,(y1-y0+1)*16)}
  for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++){const c=tAt(m,tx,ty);if(c==null)continue;const X=tx*16,Y=ty*16;
    if(isGrassy(c)||ROOFS.has(c)||WALLS.has(c)){ // grass texture
      for(let k=0;k<5;k++){const a=hsh(tx,ty,k)*16,b=hsh(ty,tx,k+7)*16;x.strokeStyle=k%2?PAL.grass2:PAL.grassLt;x.lineWidth=.55;x.beginPath();x.moveTo(X+a,Y+b);x.lineTo(X+a+(hsh(k,tx,ty)-.5)*1.4,Y+b-2.2);x.stroke()}
      if(c==='.'&&hsh(tx,ty,77)<.08){const a=3+hsh(tx,ty,78)*10,b=3+hsh(tx,ty,79)*10;circ(x,X+a,Y+b,.8,['#f3efe2','#f2cd4c','#d9809e'][Math.floor(hsh(tx,ty,80)*3)])}}
    if(c===','){x.fillStyle=PAL.tall;rr(x,X-1,Y-1,18,18,5);x.fill()}
  }
  // paths: rounded union
  for(const[col,grow,rad]of[[PAL.pathDk,1.4,6],[PAL.path,.4,6]])for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++){const c=tAt(m,tx,ty);if(!isPath(c))continue;
    x.fillStyle=col;rr(x,tx*16-grow,ty*16-grow,16+grow*2,16+grow*2,rad);x.fill()}
  for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++){if(!isPath(tAt(m,tx,ty)))continue;const X=tx*16,Y=ty*16;
    for(let k=0;k<4;k++){ell(x,X+2+hsh(tx,ty,k)*12,Y+2+hsh(ty,tx,k)*12,.8+hsh(k,tx,ty)*.6,.5+hsh(tx,k,ty)*.4,k%2?'#c2a679':'#e3cfa6')}}
  // cobbles
  for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++){const c=tAt(m,tx,ty);if(!isCob(c))continue;const X=tx*16,Y=ty*16;
    x.fillStyle=PAL.cobDk;x.fillRect(X-.3,Y-.3,16.6,16.6);
    for(let r=0;r<4;r++)for(let q=-1;q<4;q++){const sx=X+q*4.2+((ty*4+r)%2)*2.1+.4,sy=Y+r*4+.4;if(sx>X+16||sx+3.5<X)continue;const v=hsh(tx*4+q,ty*4+r,3);
      const col=v<.33?PAL.cob:v<.66?mix(PAL.cob,PAL.cobLt,.5):mix(PAL.cob,PAL.cobDk,.3);x.save();x.beginPath();x.rect(X,Y,16,16);x.clip();fillRR(x,sx,sy,3.5,3.2,1.1,col);x.fillStyle='rgba(255,255,255,.18)';x.fillRect(sx+.6,sy+.4,2.2,.5);x.restore()}}
  // water with stone quays
  for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++){const c=tAt(m,tx,ty);if(!(isWater(c)||c==='-'))continue;const X=tx*16,Y=ty*16;
    x.fillStyle=PAL.stoneLt;x.fillRect(X-2,Y-2,20,20)}
  for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++){const c=tAt(m,tx,ty);if(!(isWater(c)||c==='-'))continue;const X=tx*16,Y=ty*16;
    x.fillStyle=PAL.stone;x.fillRect(X-1,Y-1,18,18)}
  for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++){const c=tAt(m,tx,ty);if(!(isWater(c)||c==='-'))continue;const X=tx*16,Y=ty*16;
    x.fillStyle=lg(x,X,Y,X,Y+16,[[0,PAL.water],[1,PAL.waterDk]]);x.fillRect(X-.05,Y-.05,16.1,16.1);
    const up=tAtN(m,tx,ty-1);if(!(isWater(up)||up==='-'||up==='P')){x.fillStyle='rgba(10,30,50,.35)';x.fillRect(X,Y,16,3)}
    for(let k=0;k<3;k++){x.strokeStyle='rgba(160,200,225,.35)';x.lineWidth=.5;x.beginPath();const a=hsh(tx,ty,k)*12,b=3+hsh(ty,tx,k)*12;x.moveTo(X+a,Y+b);x.quadraticCurveTo(X+a+2,Y+b-.8,X+a+4,Y+b);x.stroke()}}
  // piers + bridges
  for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++){const c=tAt(m,tx,ty);if(c!=='P'&&c!=='-')continue;const X=tx*16,Y=ty*16;
    if(c==='P'){x.fillStyle=PAL.woodDk;x.fillRect(X,Y,16,16.4);for(let k=0;k<4;k++){x.fillStyle=k%2?PAL.wood:mix(PAL.wood,PAL.woodLt,.4);x.fillRect(X,Y+k*4+.3,16,3.4)}
      if(isWater(tAtN(m,tx,ty+1))){x.fillStyle='rgba(10,20,30,.4)';x.fillRect(X,Y+16,16,2);if(tx%2===0){x.fillStyle=PAL.woodDk;x.fillRect(X+3,Y+15,2,3)}}}
    else{x.fillStyle=PAL.woodDk;x.fillRect(X,Y,16,16);for(let k=0;k<4;k++){x.fillStyle=k%2?PAL.wood:mix(PAL.wood,PAL.woodLt,.4);x.fillRect(X+k*4+.3,Y,3.4,16)}
      for(const s of[-1,1]){const nb=tAtN(m,tx+s,ty);if(isWater(nb)){const rx=s<0?X:X+14.6;x.fillStyle=PAL.woodDk;x.fillRect(rx,Y,1.4,16);for(let k=2;k<16;k+=7){x.fillStyle=PAL.woodDk;x.fillRect(rx-.3,Y+k,2,2)}}}}}
  // interiors
  for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++){const c=tAt(m,tx,ty);const X=tx*16,Y=ty*16;
    if('_KhnqCYmtI'.includes(c)&&c!=='I'){x.fillStyle=PAL.floorDk;x.fillRect(X,Y,16,16);for(let k=0;k<4;k++){const off=((ty*4+k)%3)*5;x.fillStyle=k%2?PAL.floor:mix(PAL.floor,PAL.floorLt,.35);x.fillRect(X,Y+k*4+.25,16,3.5);x.fillStyle=PAL.floorDk;x.fillRect(X+((off+7)%16),Y+k*4,.4,4)}}
    if(c==='G'||c==='I'){x.fillStyle=((tx+ty)%2)?'#d8d2c4':'#ebe6da';x.fillRect(X,Y,16,16);x.fillStyle='rgba(255,255,255,.25)';x.fillRect(X,Y,16,1)}
    if(c==='#'){const below=tAt(m,tx,ty+1);const front=below&&below!=='#'&&below!=='Z';
      if(front){x.fillStyle=lg(x,X,Y,X,Y+16,[[0,'#cdb894'],[.55,'#e2d2b2'],[.56,PAL.woodDk],[1,PAL.wood]]);x.fillRect(X,Y,16,16);for(let k=2;k<16;k+=4){x.fillStyle='rgba(120,90,60,.12)';x.fillRect(X+k,Y,1.2,8.8)}x.fillStyle='rgba(0,0,0,.25)';x.fillRect(X,Y+15,16,1)}
      else{x.fillStyle='#2a2330';x.fillRect(X,Y,16,16);x.fillStyle='#3a3142';x.fillRect(X,Y,16,1.5)}}
    if(c!=='#'&&c!=='Z'&&!m.outdoor&&tAt(m,tx,ty-1)==='#'){x.fillStyle='rgba(30,18,10,.28)';x.fillRect(X,Y,16,3)}}
}

/* ---------- props ---------- */
// Trees are cached as sprites per (colour, sparkle) variant at the current scale: big speed-up for chunk builds.
const TREE_SPR=new Map();let TREE_SC=0;
function pTree(x,X,Y,tx,ty){const sc=x.getTransform().a;if(sc!==TREE_SC){TREE_SPR.clear();TREE_SC=sc}
  const au=hsh(tx,ty,5)<.28;const ci=au?Math.floor(hsh(tx,ty,6)*4):Math.floor(hsh(tx,ty,7)*6),vi=Math.floor(hsh(tx,ty,9)*3);const key=(au?'a':'g')+ci+':'+vi;
  let c=TREE_SPR.get(key);
  if(!c){const W=24,H=28;c=mkc(Math.ceil(W*sc),Math.ceil(H*sc));const y=c.getContext('2d');y.setTransform(sc,0,0,sc,3*sc,9*sc);
    const base=au?AUTUMN[ci]:mix(PAL.tree,PAL.treeLt,ci/6*.4);pTreeRaw(y,0,0,vi*7+1,vi*3+2,base);TREE_SPR.set(key,c)}
  const T=x.getTransform();x.setTransform(1,0,0,1,0,0);x.drawImage(c,Math.round(T.a*(X-3)+T.e),Math.round(T.d*(Y-9)+T.f));x.setTransform(T)}
function pTreeRaw(x,X,Y,tx,ty,base){
  softShadow(x,X+9,Y+14.5,8,3);x.fillStyle=PAL.woodDk;rr(x,X+6.5,Y+8,3,7.5,1);x.fill();
  const blobs=[[8,1,7.2],[3.5,5,5],[12.5,5,5],[8,7,5.8],[5.5,-2,4.2],[11,-1.5,4]];
  for(const[a,b,r]of blobs){ell(x,X+a+.6,Y+b+.8,r,r*.95,shade(base,.62))}
  for(const[a,b,r]of blobs){x.fillStyle=rg(x,X+a,Y+b,0,r,[[0,shade(base,1.25)],[.6,base],[1,shade(base,.8)]],X+a-r*.4,Y+b-r*.45);x.beginPath();x.ellipse(X+a,Y+b,r,r*.95,0,0,Math.PI*2);x.fill()}
  for(let k=0;k<7;k++)circ(x,X+2+hsh(tx,ty,k+20)*12,Y-3+hsh(ty,tx,k+40)*10,.7,rgba(shade(base,1.45),.7))}
function pHedge(x,X,Y,m,tx,ty){const L=tAt(m,tx-1,ty)==='H',Rr=tAt(m,tx+1,ty)==='H',D=tAt(m,tx,ty+1)==='H';
  if(!D)softShadow(x,X+8,Y+15.5,8,1.8,.25);x.fillStyle=lg(x,X,Y,X,Y+16,[[0,PAL.treeLt],[.5,PAL.tree],[1,PAL.treeDk]]);rr(x,X-(L?1:-.5),Y+1,16+(L?1:-.5)+(Rr?1:-.5),14+(D?2:0),L&&Rr?0:5);x.fill();
  for(let k=0;k<8;k++)circ(x,X+1+hsh(tx,ty,k)*14,Y+2+hsh(ty,tx,k)*11,.8,k%2?'rgba(140,190,110,.6)':'rgba(20,50,25,.4)')}
function pFence(x,X,Y){x.fillStyle='#ece5d4';x.fillRect(X,Y+6,16,1.6);x.fillRect(X,Y+11,16,1.6);for(const a of[1.5,6.5,11.5]){x.beginPath();x.moveTo(X+a,Y+14);x.lineTo(X+a,Y+4);x.lineTo(X+a+1.5,Y+2.5);x.lineTo(X+a+3,Y+4);x.lineTo(X+a+3,Y+14);x.fill()}x.fillStyle='rgba(0,0,0,.15)';x.fillRect(X,Y+14,16,1)}
function pFlowers(x,X,Y,tx,ty){const cols=['#d9485f','#f0c64a','#f3efe2','#a46ad6','#f08a3c'];for(let k=0;k<8;k++){const a=2+hsh(tx,ty,k)*12,b=3+hsh(ty,tx,k)*11;ell(x,X+a,Y+b+1.4,1.6,.8,'#3f6e3a');const c=cols[Math.floor(hsh(tx+k,ty,3)*5)];for(let p=0;p<5;p++){const an=p/5*Math.PI*2;circ(x,X+a+Math.cos(an)*.9,Y+b+Math.sin(an)*.9,.75,c)}circ(x,X+a,Y+b,.5,'#f6dc6a')}}
function pSign(x,X,Y){softShadow(x,X+8,Y+15,5,1.4,.25);x.fillStyle=PAL.woodDk;x.fillRect(X+7.2,Y+7,1.6,8);fillRR(x,X+2,Y+2,12,7.5,1.5,PAL.wood);x.fillStyle=PAL.woodLt;x.fillRect(X+3,Y+3,10,.6);x.fillStyle='rgba(60,35,20,.6)';x.fillRect(X+4,Y+5,8,.6);x.fillRect(X+4,Y+7,6,.6)}
function pLamp(x,X,Y){softShadow(x,X+8,Y+15,3.5,1.2,.3);x.fillStyle='#2b2a30';x.fillRect(X+7.3,Y-8,1.4,23);rr(x,X+5.5,Y+13,5,2,.8);x.fill();
  x.fillStyle='#2b2a30';x.beginPath();x.moveTo(X+4,Y-12);x.lineTo(X+12,Y-12);x.lineTo(X+11,Y-7);x.lineTo(X+5,Y-7);x.closePath();x.fill();
  x.fillStyle=lg(x,X,Y-12,X,Y-7,[[0,'#fff1c4'],[1,'#f2c46a']]);x.fillRect(X+5.6,Y-11.2,4.8,3.6);x.fillStyle=PAL.copperDk;x.beginPath();x.moveTo(X+3.5,Y-12);x.lineTo(X+8,Y-15.5);x.lineTo(X+12.5,Y-12);x.fill();circ(x,X+8,Y-16,.8,PAL.copper)}
function pBikes(x,X,Y,tx,ty){const fr=['#c84a3a','#3a6ab8','#2e7a5a','#d39a30','#2b2b33'];for(let b=0;b<2;b++){const ox=X+(b?8:.5),oy=Y+(b?6:2),c=fr[Math.floor(hsh(tx,ty,b)*5)];
  x.strokeStyle='#1d1d22';x.lineWidth=.6;for(const wx of[ox+2,ox+7]){x.beginPath();x.arc(wx,oy+7,2.3,0,Math.PI*2);x.stroke()}
  x.strokeStyle=c;x.lineWidth=.8;x.beginPath();x.moveTo(ox+2,oy+7);x.lineTo(ox+4,oy+4);x.lineTo(ox+6.5,oy+4);x.lineTo(ox+7,oy+7);x.moveTo(ox+4,oy+4);x.lineTo(ox+4.5,oy+7);x.lineTo(ox+7,oy+7);x.stroke();
  x.fillStyle='#1d1d22';x.fillRect(ox+3.2,oy+3,2,.8);x.fillRect(ox+6,oy+3.2,1.6,.5)}}
function pStatue(x,X,Y){softShadow(x,X+8,Y+15,7,2,.3);x.fillStyle=lg(x,X,Y+9,X,Y+16,[[0,PAL.stoneLt],[1,PAL.stoneDk]]);rr(x,X+2,Y+9,12,7,1);x.fill();
  const c=PAL.copper;ell(x,X+8,Y+6,3.5,4,c);circ(x,X+8,Y,2.4,shade(c,1.15));x.fillStyle=PAL.copperDk;x.fillRect(X+5,Y+7,6,2.5);fillRR(x,X+9.5,Y+3,3.5,2.5,.6,'#ece4d0')}
function pCounter(x,X,Y){x.fillStyle=lg(x,X,Y,X,Y+16,[[0,PAL.woodLt],[.3,PAL.wood],[1,PAL.woodDk]]);x.fillRect(X,Y+1,16,14);x.fillStyle='rgba(255,255,255,.2)';x.fillRect(X,Y+1,16,1);x.fillStyle='rgba(0,0,0,.2)';x.fillRect(X,Y+15,16,1.5)}
function pShelf(x,X,Y,tx,ty){x.fillStyle=PAL.woodDk;x.fillRect(X+1,Y-5,14,20);const bc=['#9a3b32','#3a5a8a','#c9973a','#3f7a52','#7a4a8a','#b8662f','#e6dcc6'];
  for(const sy of[-4,2.5,9]){let cx=X+2;while(cx<X+13.5){const w=.9+hsh(cx,sy,ty)*1.4,hh=3.5+hsh(sy,cx,tx)*1.8;x.fillStyle=bc[Math.floor(hsh(cx,tx,sy)*7)];x.fillRect(cx,Y+sy+(5.6-hh),w,hh);cx+=w+.25}x.fillStyle=PAL.wood;x.fillRect(X+1.5,Y+sy+5.6,13,.8)}}
function pTable(x,X,Y){softShadow(x,X+8,Y+13,7,2,.22);ell(x,X+8,Y+7,7,4.5,'#efe8da');ell(x,X+8,Y+6.4,7,4.2,'#f7f2e6');circ(x,X+6,Y+6,1.2,'#fff');circ(x,X+6,Y+6,.6,'#6a4028');x.fillStyle='#f2e6c8';x.fillRect(X+10,Y+3.5,1.2,3);ell(x,X+10.6,Y+3,.6,1,'#ffcf6a')}
function pPlant(x,X,Y){softShadow(x,X+8,Y+15,4,1.2,.25);x.fillStyle=lg(x,X+4,0,X+12,0,[[0,'#c9724f'],[1,'#8a4630']]);x.beginPath();x.moveTo(X+4,Y+9);x.lineTo(X+12,Y+9);x.lineTo(X+11,Y+15);x.lineTo(X+5,Y+15);x.fill();
  for(const[a,b,r,an]of[[8,2,4.5,0],[4.5,4,3.5,-.6],[11.5,4,3.5,.6],[8,-2,3.5,0]]){ell(x,X+a,Y+b,r*.55,r,an>0?PAL.tree:PAL.treeLt,an)}}
function pPC(x,X,Y,t){softShadow(x,X+8,Y+15,6,1.5,.3);fillRR(x,X+2,Y-3,12,17,2,'#3b2a3f');fillRR(x,X+4,Y-1,8,9,1.5,'#14101a');
  const g=rg(x,X+8,Y+3.5,0,5,[[0,'#ff7ad9'],[.5,'#9a4ad8'],[1,'#2a1a3a']]);fillRR(x,X+4.4,Y-.6,7.2,8.2,1.4,g);circ(x,X+7,Y+2,1.4,'rgba(255,200,120,.85)');circ(x,X+9.4,Y+5,1,'rgba(255,200,120,.75)');
  x.fillStyle='#d9a940';x.fillRect(X+3,Y+10,10,1);for(let k=0;k<3;k++)circ(x,X+5+k*3,Y+12.3,.8,['#e05a5a','#5ae0a0','#5aa0e0'][k])}
function pBed(x,X,Y){x.fillStyle=PAL.woodDk;rr(x,X+1,Y-3,14,19,1.5);x.fill();fillRR(x,X+2,Y-2,12,4.5,1.5,'#f2ede2');x.fillStyle=lg(x,X,Y+3,X,Y+15,[[0,'#5a6a8a'],[1,'#3a4660']]);rr(x,X+2,Y+2.5,12,12.5,1.2);x.fill();x.strokeStyle='rgba(255,255,255,.15)';x.lineWidth=.5;for(let k=4;k<14;k+=3){x.beginPath();x.moveTo(X+k,Y+3);x.lineTo(X+k,Y+14);x.stroke()}}
function pMat(x,X,Y){fillRR(x,X+1,Y+3,14,10,2,'#7a2e3a');x.strokeStyle='#d9a940';x.lineWidth=.6;rr(x,X+2.5,Y+4.5,11,7,1.5);x.stroke()}
function pBoard(x,X,Y){fillRR(x,X+1,Y+1,14,9,1,PAL.woodDk);fillRR(x,X+1.8,Y+1.8,12.4,7.4,.6,'#2f4a3a');x.fillStyle='#e9efe4';x.font=`4px ${FONT_SIGN}`;x.textAlign='center';x.textBaseline='middle';x.fillText('ÆØÅ',X+8,Y+5.8)}
function pTrophy(x,X,Y){softShadow(x,X+8,Y+15,4,1.2,.3);x.fillStyle=lg(x,X+4,0,X+12,0,[[0,PAL.stoneLt],[1,PAL.stoneDk]]);x.fillRect(X+4.5,Y+5,7,10);x.fillStyle=lg(x,X+4,0,X+12,0,[[0,PAL.goldLt],[1,'#a87a20']]);x.beginPath();x.moveTo(X+4.5,Y-3);x.lineTo(X+11.5,Y-3);x.quadraticCurveTo(X+11,Y+2.5,X+8,Y+3);x.quadraticCurveTo(X+5,Y+2.5,X+4.5,Y-3);x.fill();x.fillRect(X+7.3,Y+2.5,1.4,2.5)}

/* ---------- buildings ---------- */
function findBuildings(m){const seen=new Set(),out=[];const g=m.g;
  for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){const c=g[y][x];if(!(ROOFS.has(c)||WALLS.has(c))||seen.has(x+','+y))continue;
    const q=[[x,y]];seen.add(x+','+y);let x0=x,x1=x,y0=y,y1=y;
    while(q.length){const[a,b]=q.pop();x0=Math.min(x0,a);x1=Math.max(x1,a);y0=Math.min(y0,b);y1=Math.max(y1,b);
      for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const A=a+dx,B=b+dy;if(A<0||B<0||A>=m.w||B>=m.h)continue;const cc=g[B][A];if((ROOFS.has(cc)||WALLS.has(cc))&&!seen.has(A+','+B)){seen.add(A+','+B);q.push([A,B])}}}
    let wallTop=y1;for(let r=y0;r<=y1;r++){if(!ROOFS.has(g[r][x0])&&!ROOFS.has(g[r][x1])){wallTop=r;break}}
    let wall=g[y1][x0];if(wall==='D')wall=g[y1][x0+1];
    out.push({x0,x1,y0,y1,wallTop,roof:g[y0][x0],wall,seed:hsh(x0,y0,m.id.length)})}
  return out}
function prepMap(m){if(m.prepped)return;m.prepped=true;m.buildings=findBuildings(m);m.windows=[];m.doorLights=[];m.chimneys=[];m.signGlow=[];m.lamps=[];m.grassTiles=[];m.waterTiles=[];
  for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){const c=m.g[y][x];if(c===',')m.grassTiles.push([x,y]);if(c==='~')m.waterTiles.push([x,y]);if(c==='L')m.lamps.push({x:x*16+8,y:y*16-9});if(c==='C')m.lamps.push({x:x*16+8,y:y*16+3,c:'#ff7ad9',r:26})}
  for(const b of m.buildings){const X0=b.x0*16,X1=(b.x1+1)*16,Yw=b.wallTop*16;const glassy=(b.wall==='o'||b.wall==='v')&&m.id==='orestad';
    for(let ty=b.wallTop;ty<=b.y1;ty++)for(let tx=b.x0;tx<=b.x1;tx++){const c=m.g[ty][tx];const X=tx*16,Y=ty*16;
      if(glassy&&(c==='o'||c==='v'))m.windows.push({x:X+1.5,y:Y+1,w:13,h:13,soft:1});
      else if(c==='W'||c==='w'||c==='v'){const wy=Y+(ty===b.wallTop?1.5:2.5);m.windows.push({x:X+4,y:wy+1,w:8,h:8.5})}
      if(c==='D')m.doorLights.push({x:X+8,y:Y+1})}
    if((b.roof==='R'||b.roof==='r')&&(X1-X0)<150&&b.seed<.75){const cx=X0-2+(X1-X0+4)*(.6+b.seed*.22);m.chimneys.push({x:cx+2.5,y:b.y0*16-8})}
    for(const[lx,ly,lw,lt,col]of m.labels){if(lx<b.x0-1||lx>b.x1+1||ly<b.y0-1||ly>b.y1)continue;const cx=(lx+lw/2)*16;m.signGlow.push({x:cx,y:Yw-5,w:lt.length*4.4+8,c:col||'#ffcf6a'})}}
}
function drawBuilding(x,m,b){
  const X0=b.x0*16,X1=(b.x1+1)*16,Yr=b.y0*16,Yw=b.wallTop*16,Yb=(b.y1+1)*16,W=X1-X0;
  // shadow on the ground
  x.fillStyle='rgba(16,14,24,.26)';x.beginPath();x.moveTo(X1,Yr+6);x.lineTo(X1+6,Yr+10);x.lineTo(X1+6,Yb+3);x.lineTo(X0+5,Yb+3);x.lineTo(X0+3,Yb);x.lineTo(X1,Yb);x.fill();
  const glassy=(b.wall==='o'||b.wall==='v')&&m.id==='orestad';
  let base;if(b.wall==='B'||b.wall==='W')base=PAL.brick;else if(glassy)base=PAL.glass;else if(b.wall==='o'||b.wall==='v')base=PLASTER[2];else base=PLASTER[Math.floor(b.seed*PLASTER.length)];
  const top=Yw-2;
  x.fillStyle=lg(x,X0,top,X0,Yb,[[0,shade(base,1.06)],[1,shade(base,.86)]]);x.fillRect(X0,top,W,Yb-top);
  if(base===PAL.brick){x.save();x.beginPath();x.rect(X0,top,W,Yb-top);x.clip();
    for(let yy=top,r=0;yy<Yb;yy+=3.2,r++){x.fillStyle=rgba(PAL.mortar,.55);x.fillRect(X0,yy+2.6,W,.6);for(let xx=X0+(r%2?3.5:0);xx<X1;xx+=7){x.fillRect(xx,yy,.6,2.6);const v=hsh(xx*3,yy*3,1);if(v<.25){x.fillStyle=rgba(PAL.brickDk,.5);x.fillRect(xx+.6,yy,6.4,2.6)}else if(v>.85){x.fillStyle=rgba(PAL.brickLt,.5);x.fillRect(xx+.6,yy,6.4,2.6)}x.fillStyle=rgba(PAL.mortar,.55)}}x.restore()}
  else if(glassy){x.fillStyle=lg(x,X0,top,X1,Yb,[[0,'#8fb8d4'],[.5,'#5a84a6'],[1,'#3a5d7a']]);x.fillRect(X0,top,W,Yb-top);x.strokeStyle='rgba(220,235,245,.6)';x.lineWidth=.5;for(let xx=X0;xx<=X1;xx+=8){x.beginPath();x.moveTo(xx,top);x.lineTo(xx,Yb);x.stroke()}for(let yy=top;yy<Yb;yy+=8){x.beginPath();x.moveTo(X0,yy);x.lineTo(X1,yy);x.stroke()}
    x.save();x.beginPath();x.rect(X0,top,W,Yb-top);x.clip();x.fillStyle='rgba(255,255,255,.16)';for(let k=-20;k<W;k+=26){x.beginPath();x.moveTo(X0+k,Yb);x.lineTo(X0+k+10,top);x.lineTo(X0+k+16,top);x.lineTo(X0+k+6,Yb);x.fill()}x.restore()}
  else{for(let k=0;k<W*(Yb-top)/30;k++){x.fillStyle=k%2?'rgba(255,255,255,.08)':'rgba(0,0,0,.06)';x.fillRect(X0+hsh(k,b.x0,1)*W,top+hsh(b.y0,k,2)*(Yb-top),.8,.8)}}
  x.fillStyle=rgba(shade(base,1.3),.9);x.fillRect(X0,top,W,1.2);x.fillStyle='rgba(0,0,0,.18)';x.fillRect(X0,top+1.2,W,.6);
  x.fillStyle=lg(x,0,Yb-3,0,Yb,[[0,PAL.stoneLt],[1,PAL.stoneDk]]);x.fillRect(X0,Yb-2.6,W,2.6);
  // windows + doors
  for(let ty=b.wallTop;ty<=b.y1;ty++)for(let tx=b.x0;tx<=b.x1;tx++){const c=m.g[ty][tx];const X=tx*16,Y=ty*16;
    if((c==='W'||c==='w'||c==='v')&&!glassy){const wy=Y+(ty===b.wallTop?1.5:2.5);
      fillRR(x,X+3,wy,10,10.5,.6,'#efe9dc');x.fillStyle=lg(x,X+4,wy+1,X+12,wy+10,[[0,PAL.glassLt],[.45,PAL.glass],[1,PAL.glassDk]]);x.fillRect(X+4,wy+1,8,8.5);
      x.fillStyle='rgba(255,255,255,.28)';x.beginPath();x.moveTo(X+4,wy+5);x.lineTo(X+8,wy+1);x.lineTo(X+9.5,wy+1);x.lineTo(X+4,wy+6.5);x.fill();
      x.fillStyle='#efe9dc';x.fillRect(X+7.6,wy+1,.8,8.5);x.fillRect(X+4,wy+4.8,8,.8);fillRR(x,X+2.4,wy+10,11.2,1.6,.4,PAL.stoneLt);
      if(m.id==='nyhavn'||hsh(tx,ty,4)<.22){for(let k=0;k<5;k++)circ(x,X+4+k*2,wy+9.6,.9,['#d9485f','#f0c64a','#d9485f','#f3efe2','#a46ad6'][k])}}
    if(c==='D'){const dr=m.doors.find(d=>d.x===tx&&d.y===ty);const k=dr?dr.k:'house';
      const col={hygge:'#7a2630',kiosk:'#2f6a4a',gym:'#2a2d3a',final:'#4a2a1e',home:PAL.woodDk,house:PAL.wood}[k]||PAL.wood;
      fillRR(x,X+2,Y+1.5,12,14.5,1,'#ece5d6');x.fillStyle=lg(x,X+3,0,X+13,0,[[0,shade(col,1.15)],[1,shade(col,.8)]]);rr(x,X+3,Y+2.5,10,13.5,.8);x.fill();
      x.strokeStyle='rgba(0,0,0,.25)';x.lineWidth=.5;rr(x,X+4.2,Y+4,3.3,4.5,.4);x.stroke();rr(x,X+8.5,Y+4,3.3,4.5,.4);x.stroke();rr(x,X+4.2,Y+9.5,3.3,5,.4);x.stroke();rr(x,X+8.5,Y+9.5,3.3,5,.4);x.stroke();
      circ(x,X+11.3,Y+10,.6,PAL.goldLt);fillRR(x,X+1,Y+15.2,14,1.6,.4,PAL.stone);
      if(k==='kiosk'||k==='hygge'){x.fillStyle='rgba(255,220,150,.75)';x.fillRect(X+4.2,Y+4,7.6,4.5)}}}
  // kiosk awning
  const dk=m.doors.find(d=>d.y===b.y1&&d.x>=b.x0&&d.x<=b.x1);
  if(dk&&dk.k==='kiosk'){const ay=Yw-1;for(let xx=X0-1,i=0;xx<X1+1;xx+=4,i++){x.fillStyle=i%2?'#f2ede2':'#2f7a50';x.fillRect(xx,ay,4,4.5);x.beginPath();x.arc(xx+2,ay+4.5,2,0,Math.PI);x.fill()}}
  // roof
  const rx0=X0-2.5,rx1=X1+2.5,ry0=Yr-3,ry1=Yw+1.2,rw=rx1-rx0,rh=ry1-ry0;
  const RS={R:[PAL.copper,PAL.copperDk,PAL.copperLt],r:[PAL.tile,PAL.tileDk,PAL.tileLt],g:[PAL.slate,PAL.slateDk,PAL.slateLt],a:[PAL.flat,PAL.flatDk,PAL.flatLt]}[b.roof]||[PAL.tile,PAL.tileDk,PAL.tileLt];
  x.fillStyle='rgba(0,0,0,.3)';x.fillRect(rx0+1,ry1,rw-2,2);
  x.fillStyle=lg(x,0,ry0,0,ry1,[[0,RS[2]],[.25,RS[0]],[1,RS[1]]]);rr(x,rx0,ry0,rw,rh,1.5);x.fill();
  x.save();rr(x,rx0,ry0,rw,rh,1.5);x.clip();
  if(b.roof==='R'){for(let xx=rx0+2;xx<rx1;xx+=3.4){x.fillStyle='rgba(20,60,50,.35)';x.fillRect(xx,ry0,.5,rh);x.fillStyle='rgba(200,240,225,.22)';x.fillRect(xx+.5,ry0,.4,rh)}for(let k=0;k<rw*rh/40;k++){x.fillStyle='rgba(160,215,195,.25)';x.fillRect(rx0+hsh(k,b.x0,5)*rw,ry0+hsh(b.y0,k,6)*rh,1.2,.6)}}
  if(b.roof==='r'){for(let yy=ry0+2.5,r=0;yy<ry1;yy+=3,r++){for(let xx=rx0+(r%2?1.5:0);xx<rx1;xx+=3){x.fillStyle='rgba(60,15,10,.35)';x.beginPath();x.arc(xx+1.5,yy+2.2,1.5,0,Math.PI);x.fill();x.fillStyle='rgba(255,200,170,.12)';x.fillRect(xx+.6,yy,1.8,.5)}}}
  if(b.roof==='g'){for(let yy=ry0+2,r=0;yy<ry1;yy+=2.6,r++)for(let xx=rx0+(r%2?2:0);xx<rx1;xx+=4){x.fillStyle='rgba(255,255,255,.07)';x.fillRect(xx,yy,3.4,.5);x.fillStyle='rgba(0,0,0,.2)';x.fillRect(xx+3.4,yy,.5,2.3)}}
  if(b.roof==='a'){for(let k=0;k<rw*rh/14;k++){x.fillStyle=k%2?'rgba(255,255,255,.07)':'rgba(0,0,0,.08)';x.fillRect(rx0+hsh(k,b.x0,9)*rw,ry0+hsh(b.x0,k,9)*rh,.7,.7)}
    for(let k=0;k<Math.floor(rw/16);k++){const ax=rx0+4+k*16;if(hsh(k,b.x0,9)<.55){x.fillStyle=lg(x,ax,ry0+4,ax+10,ry0+12,[[0,'#3c5a7a'],[1,'#1f3248']]);x.fillRect(ax,ry0+4,10,8);x.strokeStyle='rgba(180,210,235,.5)';x.lineWidth=.3;for(let q=1;q<4;q++){x.beginPath();x.moveTo(ax+q*2.5,ry0+4);x.lineTo(ax+q*2.5,ry0+12);x.stroke()}}else{fillRR(x,ax,ry0+5,7,5,.8,'#c8ccd0');circ(x,ax+3.5,ry0+7.5,1.6,'#8a9096')}}}
  x.restore();
  x.fillStyle=rgba(RS[2],.9);x.fillRect(rx0+1,ry0,rw-2,1.3);x.fillStyle='rgba(0,0,0,.25)';x.fillRect(rx0,ry1-1,rw,1);
  if(b.roof==='g'){x.fillStyle=PAL.gold;x.fillRect(rx0,ry0,rw,1.1);x.fillRect(rx0,ry1-1.2,rw,1.2)}
  // dormers
  if(rw>150&&b.roof!=='a'){for(let xx=rx0+14;xx<rx1-22;xx+=30){fillRR(x,xx,ry0+5,13,10,1.2,RS[2]);x.fillStyle=lg(x,xx,ry0+7,xx,ry0+14,[[0,PAL.glassLt],[1,PAL.glassDk]]);x.fillRect(xx+3,ry0+7.5,7,6);m._dorm=true}}
  // chimney
  if((b.roof==='R'||b.roof==='r')&&W<150&&b.seed<.75){const cx=rx0+rw*(.6+b.seed*.22),cy=ry0-6;x.fillStyle=lg(x,cx,0,cx+5,0,[[0,PAL.brickLt],[1,PAL.brickDk]]);x.fillRect(cx,cy,5,9);fillRR(x,cx-.8,cy-1,6.6,1.6,.4,PAL.stone)}
  // signboards
  for(const[lx,ly,lw,lt,col]of m.labels){if(lx<b.x0-1||lx>b.x1+1||ly<b.y0-1||ly>b.y1)continue;
    x.font=`4.4px ${FONT_SIGN}`;const tw=x.measureText(lt).width;const cx=(lx+lw/2)*16,sy=Yw-8.5;
    x.fillStyle='rgba(0,0,0,.35)';rr(x,cx-tw/2-3.2,sy+.8,tw+6.4,7.4,1.4);x.fill();fillRR(x,cx-tw/2-3.2,sy,tw+6.4,7.4,1.4,'#211b26');
    x.strokeStyle=rgba(col||'#ffcf6a',.55);x.lineWidth=.35;rr(x,cx-tw/2-2.6,sy+.6,tw+5.2,6.2,1.1);x.stroke();
    x.fillStyle=col||'#ffcf6a';x.textAlign='center';x.textBaseline='middle';x.fillText(lt,cx,sy+3.9)}
}

/* ---------- region renderer (used by chunks) ---------- */
function drawRegion(x,m,x0,y0,x1,y1){
  prepMap(m);
  drawGround(x,m,x0-1,y0-1,x1+1,y1+1);
  const items=[];
  for(const b of m.buildings){if(b.x1+1<x0-1||b.x0-1>x1+1||b.y1+1<y0-1||b.y0-1>y1+1)continue;items.push({y:b.y1+.5,f:()=>drawBuilding(x,m,b)})}
  for(let ty=y0-1;ty<=y1+2;ty++)for(let tx=x0-1;tx<=x1+1;tx++){const c=tAt(m,tx,ty);if(c==null)continue;const X=tx*16,Y=ty*16;
    const f={T:()=>pTree(x,X,Y,tx,ty),H:()=>pHedge(x,X,Y,m,tx,ty),F:()=>pFence(x,X,Y),f:()=>pFlowers(x,X,Y,tx,ty),S:()=>pSign(x,X,Y),L:()=>pLamp(x,X,Y),c:()=>pBikes(x,X,Y,tx,ty),X:()=>pStatue(x,X,Y),
      K:()=>pCounter(x,X,Y),h:()=>pShelf(x,X,Y,tx,ty),n:()=>pTable(x,X,Y),q:()=>pPlant(x,X,Y),C:()=>pPC(x,X,Y),Y:()=>pBed(x,X,Y),m:()=>pMat(x,X,Y),t:()=>pBoard(x,X,Y),I:()=>pTrophy(x,X,Y)}[c];
    if(f)items.push({y:ty+.6,f})}
  items.sort((a,b)=>a.y-b.y);for(const it of items)it.f();
}

/* ---------- chunk cache ---------- */
// Chunks are rendered at exactly the screen scale and snapped to whole device pixels:
// chunk (cx,cy) covers device columns [floor(cx*128*s), floor((cx+1)*128*s)), so neighbouring
// chunks tile with no overlap, no gaps and no resampling when blitted (no seams, no shimmer).
const CHK=8;let CHUNKS=new Map(),CH_SCALE=0,CH_MAX=40;
const chEdge=(c,s)=>Math.floor(c*CHK*16*s);
function chunkKey(m,cx,cy){return m.id+':'+cx+':'+cy}
function getChunk(m,cx,cy,scale,make){
  if(scale!==CH_SCALE){CHUNKS.clear();CH_SCALE=scale;const px=CHK*16*scale;CH_MAX=Math.max(24,Math.min(60,Math.floor(140e6/(px*px*4))))}
  const k=chunkKey(m,cx,cy);let c=CHUNKS.get(k);if(c){CHUNKS.delete(k);CHUNKS.set(k,c);return c}
  if(!make)return null;
  const X0=chEdge(cx,scale),Y0=chEdge(cy,scale);c=mkc(chEdge(cx+1,scale)-X0,chEdge(cy+1,scale)-Y0);c.X0=X0;c.Y0=Y0;const x=c.getContext('2d');
  x.setTransform(scale,0,0,scale,-X0,-Y0);
  drawRegion(x,m,cx*CHK,cy*CHK,cx*CHK+CHK-1,cy*CHK+CHK-1);
  CHUNKS.set(k,c);while(CHUNKS.size>CH_MAX){CHUNKS.delete(CHUNKS.keys().next().value)}
  return c}
function chunkRange(m){const top=m.outdoor?(m.prev?0:-MY):0,bot=m.outdoor?(m.next?m.h:m.h+MY):m.h,left=m.outdoor?-MX:0,right=m.outdoor?m.w+MX:m.w;
  return{cy0:Math.floor(top/CHK),cy1:Math.floor((bot-1)/CHK),cx0:Math.floor(left/CHK),cx1:Math.floor((right-1)/CHK),top,bot}}

/* ---------- animated tiles (per frame, world units) ---------- */
function drawTallGrass(x,X,Y,tx,ty,t,wind,front){
  for(let k=0;k<7;k++){if(front&&k%2)continue;const bx=X+1.5+hsh(tx,ty,k)*13,by=Y+(front?16:9+hsh(tx,k,ty)*7),h0=5+hsh(ty,tx,k)*4;
    const sw=Math.sin(t/700+tx*.9+ty*1.7+k)*(.9+wind*2);
    x.strokeStyle=k%3?PAL.tall:PAL.tallLt;x.lineWidth=1.1;x.lineCap='round';x.beginPath();x.moveTo(bx,by);x.quadraticCurveTo(bx+sw*.4,by-h0*.6,bx+sw,by-h0);x.stroke()}}
function drawWaterFx(x,X,Y,tx,ty,t){const s=Math.sin(t/900+tx*.7+ty*.5);x.strokeStyle='rgba(190,225,245,.35)';x.lineWidth=.5;x.beginPath();x.moveTo(X+3+s*2,Y+6);x.quadraticCurveTo(X+5+s*2,Y+5.2,X+7+s*2,Y+6);x.moveTo(X+9-s*2,Y+12);x.quadraticCurveTo(X+11-s*2,Y+11.2,X+13-s*2,Y+12);x.stroke();
  const ph=(t/1100+hsh(tx,ty,1)*6)%6;if(ph<.35){circ(x,X+hsh(tx,ty,Math.floor(t/3000))*14+1,Y+hsh(ty,tx,Math.floor(t/3000))*14+1,.7,'rgba(255,255,255,.8)')}}
