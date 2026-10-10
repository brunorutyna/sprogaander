/* ================= MAP ART: prerendered ground, buildings, props; dynamic grass & water ================= */
const SOLID=new Set('T~RrgaBbWwovFSLcXH#KhnqCYZtI'.split(''));
const ROOFS=new Set('Rrga'.split('')),WALLS=new Set('BWbwovD'.split(''));
const MX=8,MY=6; // forest margin (tiles) around outdoor maps
function isWaterCh(c){return c==='~'}
function groundOf(c){if(c==null)return'grass';if(c===':')return'path';if(c==='='||c==='c')return'cob';if(c==='~')return'water';if(c==='-')return'water';if(c==='P')return'wood';
  if('_KhnqCYmt#'.includes(c))return'floor';if(c==='G'||c==='I')return'gym';if(c==='Z')return'void';return'grass'}

/* ---- ground painters (x = ctx, X/Y = pixel origin, s = seed 0..1) ---- */
function gGrass(x,X,Y,tx,ty,dark){const G=dark?RAMP.tall:RAMP.grass;R(x,X,Y,16,16,G[2]);
  for(let k=0;k<7;k++){const a=Math.floor(hsh(tx,ty,k)*16),b=Math.floor(hsh(ty,tx,k+9)*15);px(x,X+a,Y+b,G[1]);if(b>0)px(x,X+a,Y+b-1,G[3])}
  if(!dark&&hsh(tx,ty,77)<.07){const a=2+Math.floor(hsh(tx,ty,78)*11),b=2+Math.floor(hsh(tx,ty,79)*11);const fc=['#f6f2e4','#f4d14a','#e57aa0'][Math.floor(hsh(tx,ty,80)*3)];px(x,X+a,Y+b,fc);px(x,X+a+1,Y+b+1,G[1])}}
function gPath(x,X,Y,tx,ty){const P=RAMP.path;R(x,X,Y,16,16,P[2]);for(let k=0;k<9;k++){const a=Math.floor(hsh(tx,ty,k)*15),b=Math.floor(hsh(ty,tx,k+3)*15);px(x,X+a,Y+b,k%3?P[1]:P[3])}
  if(hsh(tx,ty,55)<.25){const a=3+Math.floor(hsh(tx,ty,56)*9),b=3+Math.floor(hsh(tx,ty,57)*9);R(x,X+a,Y+b,2,1,RAMP.stone[3]);px(x,X+a,Y+b+1,RAMP.stone[1])}}
function gCob(x,X,Y,tx,ty){const C=RAMP.cob;R(x,X,Y,16,16,mix(C[0],C[1],.5));
  for(let r=0;r<4;r++){const off=((ty*4+r)%2)*2;for(let c=-1;c<4;c++){const sx=X+c*4+off,sy=Y+r*4;if(sx>=X+16||sx+3<=X)continue;const col=[C[2],C[2],C[3],C[1]][Math.floor(hsh(tx*4+c,ty*4+r,3)*4)];
    const x0=Math.max(sx,X),x1=Math.min(sx+3,X+16);R(x,x0,sy,x1-x0,3,col);if(sx>=X)px(x,sx,sy,shade(col,1.15))}}}
function gWater(x,X,Y,tx,ty){const W=RAMP.water;R(x,X,Y,16,16,W[1]);for(let k=0;k<3;k++){const a=Math.floor(hsh(tx,ty,k)*12),b=Math.floor(hsh(ty,tx,k+5)*14);R(x,X+a,Y+b,4,1,W[2])}if(hsh(tx,ty,9)<.5)R(x,X+Math.floor(hsh(tx,ty,10)*10),Y+Math.floor(hsh(tx,ty,11)*14),3,1,W[3])}
function gWood(x,X,Y,tx,ty,vertical){const Wd=RAMP.wood;R(x,X,Y,16,16,Wd[2]);
  if(vertical){for(let k=0;k<4;k++){R(x,X+k*4+3,Y,1,16,Wd[1]);R(x,X+k*4,Y,1,16,Wd[3])}for(let k=0;k<4;k++)px(x,X+k*4+1,Y+(ty%2?3:11),Wd[0])}
  else{for(let k=0;k<4;k++){R(x,X,Y+k*4+3,16,1,Wd[1]);R(x,X,Y+k*4,16,1,Wd[3])}for(let k=0;k<4;k++)px(x,X+(tx%2?3:11),Y+k*4+1,Wd[0])}}
function gFloor(x,X,Y,tx,ty){const F=RAMP.floor;R(x,X,Y,16,16,F[2]);for(let k=0;k<2;k++){R(x,X,Y+k*8+7,16,1,F[1]);R(x,X,Y+k*8,16,1,F[3])}
  const off=(ty%2)*6;R(x,X+((5+off)%16),Y,1,7,F[1]);R(x,X+((11+off)%16),Y+8,1,7,F[1]);for(let k=0;k<3;k++)R(x,X+Math.floor(hsh(tx,ty,k)*13),Y+2+k*5,3,1,mix(F[2],F[1],.5))}
function gGym(x,X,Y,tx,ty){const a='#e9e2d0',b='#d3c8ad';R(x,X,Y,16,16,a);R(x,X,Y,8,8,b);R(x,X+8,Y+8,8,8,b);R(x,X,Y,16,1,'#f6f1e4');R(x,X,Y,1,16,'#f6f1e4');px(x,X+3,Y+3,'#ffffff');px(x,X+11,Y+11,'#ffffff')}

/* edge blending between ground types */
function fringe(x,X,Y,tx,ty,side,col,col2){for(let k=0;k<16;k++){const d=1+Math.floor(hsh(tx*31+k,ty*17,side)*2.4);
  if(side==='u')R(x,X+k,Y,1,d,col);if(side==='d')R(x,X+k,Y+16-d,1,d,col);if(side==='l')R(x,X,Y+k,d,1,col);if(side==='r')R(x,X+16-d,Y+k,d,1,col);
  if(col2&&hsh(k,tx,ty)<.3){if(side==='u')px(x,X+k,Y+d,col2);if(side==='d')px(x,X+k,Y+15-d,col2);if(side==='l')px(x,X+d,Y+k,col2);if(side==='r')px(x,X+15-d,Y+k,col2)}}}
function shore(x,X,Y,side){const S=RAMP.stone,W=RAMP.water;
  if(side==='u'){R(x,X,Y,16,3,S[2]);R(x,X,Y,16,1,S[3]);R(x,X,Y+3,16,1,S[0]);for(let k=0;k<16;k+=3)px(x,X+k,Y+4,W[4])}
  if(side==='d'){R(x,X,Y+14,16,2,S[1]);R(x,X,Y+13,16,1,W[3])}
  if(side==='l'){R(x,X,Y,2,16,S[2]);R(x,X+2,Y,1,16,S[0]);for(let k=1;k<16;k+=3)px(x,X+3,Y+k,W[4])}
  if(side==='r'){R(x,X+14,Y,2,16,S[2]);R(x,X+13,Y,1,16,S[0]);for(let k=1;k<16;k+=3)px(x,X+12,Y+k,W[4])}}

/* ---- props ---- */
function drawTree(x,X,Y,tx,ty){const T=RAMP.tree;const v=hsh(tx,ty,1);
  x.fillStyle='rgba(16,40,20,.35)';x.beginPath();x.ellipse(X+8,Y+14,7,2.5,0,0,Math.PI*2);x.fill();
  R(x,X+6,Y+9,4,6,RAMP.wood[1]);R(x,X+6,Y+9,1,6,RAMP.wood[2]);R(x,X+9,Y+9,1,6,RAMP.wood[0]);
  const blobs=[[8,3,7.5],[4,6,5],[12,6,5],[8,8,6]];
  const E=(cx,cy,r,col)=>{x.fillStyle=col;for(let j=-r;j<=r;j++){const w=Math.floor(Math.sqrt(r*r-j*j));x.fillRect(Math.round(X+cx-w),Math.round(Y+cy+j),w*2+1,1)}};
  for(const[a,b,r]of blobs)E(a,b-2,r+.4,T[0]);
  for(const[a,b,r]of blobs)E(a,b-2,r-.6,v<.5?T[2]:T[1]);
  E(6,0,4.2,T[3]);E(10,4,3,T[2]);E(5,-1,2.2,T[4]);
  for(let k=0;k<10;k++){const a=Math.floor(hsh(tx,ty,k+20)*14)+1,b=Math.floor(hsh(ty,tx,k+40)*12)-4;px(x,X+a,Y+b,k%2?T[3]:T[1])}
  R(x,X+3,Y+8,10,1,T[1]);}
function drawHedge(x,X,Y,g,tx,ty){const T=RAMP.tree;const L=g(tx-1,ty)==='H',Rr=g(tx+1,ty)==='H',U=g(tx,ty-1)==='H',D=g(tx,ty+1)==='H';
  R(x,X+(L?0:1),Y+(U?0:2),16-(L?0:1)-(Rr?0:1),14-(U?0:2)+(D?2:0),T[1]);R(x,X+(L?0:2),Y+(U?0:3),16-(L?0:2)-(Rr?0:2),6,T[2]);
  for(let k=0;k<9;k++)px(x,X+1+Math.floor(hsh(tx,ty,k)*14),Y+3+Math.floor(hsh(ty,tx,k)*9),k%2?T[3]:T[0]);
  if(!D)R(x,X+1,Y+14,14,2,'rgba(16,40,20,.35)')}
function drawFence(x,X,Y){const c='#f2ecdc',s='#b7ad94';R(x,X,Y+6,16,2,c);R(x,X,Y+11,16,2,c);for(const a of[1,6,11]){R(x,X+a,Y+3,3,11,c);px(x,X+a+1,Y+2,c);R(x,X+a+2,Y+3,1,11,s)}R(x,X,Y+14,16,1,'rgba(16,40,20,.3)')}
function drawFlowers(x,X,Y,tx,ty){const cols=['#e8455a','#f4d14a','#f6f2e4','#c46ae0','#ff9a3c'];
  for(let k=0;k<7;k++){const a=1+Math.floor(hsh(tx,ty,k)*12),b=2+Math.floor(hsh(ty,tx,k)*11),c=cols[Math.floor(hsh(tx+k,ty,3)*5)];
    px(x,X+a+1,Y+b+2,RAMP.grass[0]);px(x,X+a+1,Y+b+1,RAMP.tree[2]);R(x,X+a,Y+b,3,1,c);px(x,X+a+1,Y+b-1,c);px(x,X+a+1,Y+b,'#f8e070')}}
function drawSign(x,X,Y){const W=RAMP.wood;R(x,X+7,Y+8,2,8,W[1]);R(x,X+2,Y+2,12,8,W[2]);R(x,X+2,Y+2,12,1,W[3]);R(x,X+2,Y+9,12,1,W[0]);R(x,X+4,Y+4,8,1,W[1]);R(x,X+4,Y+6,6,1,W[1]);R(x,X+5,Y+15,6,1,'rgba(16,40,20,.3)')}
function drawLamp(x,X,Y){x.fillStyle='rgba(16,30,20,.3)';x.fillRect(X+5,Y+14,7,2);R(x,X+7,Y-6,2,21,'#25262e');R(x,X+6,Y+13,4,2,'#25262e');R(x,X+8,Y-6,1,21,'#4a4c58');
  R(x,X+4,Y-12,8,7,'#25262e');R(x,X+5,Y-11,6,5,'#f9e3a0');R(x,X+5,Y-11,2,5,'#fff5d0');R(x,X+3,Y-14,10,2,RAMP.copper[1]);R(x,X+6,Y-16,4,2,RAMP.copper[2]);px(x,X+7,Y-17,RAMP.copper[3])}
function drawBikes(x,X,Y,tx,ty){const fr=['#d84a3a','#3a7ad8','#2e8a5a','#e0a030'];for(let b=0;b<2;b++){const ox=X+(b?8:0),oy=Y+(b?5:2),c=fr[Math.floor(hsh(tx,ty,b)*4)];
  for(const wx of[ox+1,ox+6]){x.strokeStyle=INK;x.lineWidth=1;x.beginPath();x.arc(wx+.5,oy+8.5,2.6,0,Math.PI*2);x.stroke()}
  R(x,ox+2,oy+6,5,1,c);R(x,ox+4,oy+4,1,3,c);R(x,ox+3,oy+3,2,1,INK);R(x,ox+6,oy+4,1,3,c);R(x,ox+6,oy+3,2,1,'#c8c8c8')}}
function drawStatue(x,X,Y){const S=RAMP.stone,C=RAMP.copper;R(x,X+2,Y+10,12,6,S[1]);R(x,X+2,Y+10,12,1,S[3]);R(x,X+3,Y+11,10,1,S[2]);
  R(x,X+5,Y+1,6,9,C[2]);R(x,X+6,Y-3,4,4,C[2]);R(x,X+6,Y-3,2,2,C[3]);R(x,X+9,Y+2,2,7,C[1]);R(x,X+3,Y+6,4,2,C[1]);R(x,X+4,Y+4,3,2,'#e8e2cc')}
/* interior props */
function drawWallTile(x,X,Y,front){const W=RAMP.wall;if(!front){R(x,X,Y,16,16,'#3a3140');R(x,X,Y+14,16,2,'#2a2330');return}
  R(x,X,Y,16,16,W[2]);for(let k=0;k<16;k+=4)R(x,X+k,Y,1,9,W[1]);R(x,X,Y,16,2,'#5a4a3c');R(x,X,Y+9,16,7,RAMP.wood[2]);R(x,X,Y+9,16,1,RAMP.wood[3]);R(x,X,Y+15,16,1,RAMP.wood[0]);for(let k=2;k<16;k+=5)R(x,X+k,Y+11,1,3,RAMP.wood[1])}
function drawCounter(x,X,Y){const W=RAMP.wood;R(x,X,Y+1,16,14,W[1]);R(x,X,Y+1,16,4,W[3]);R(x,X,Y+4,16,1,W[0]);R(x,X+2,Y+7,12,6,W[2]);R(x,X,Y+15,16,1,'rgba(0,0,0,.25)')}
function drawShelf(x,X,Y,tx,ty){const W=RAMP.wood;R(x,X+1,Y-4,14,19,W[0]);R(x,X+2,Y-3,12,17,W[1]);const bc=['#c84a3a','#3a6ac8','#e0b030','#3a9a5a','#9a5ac8','#e07a3a'];
  for(const sy of[-3,3,9]){let cx=X+2;while(cx<X+13){const w=1+Math.floor(hsh(cx,sy,ty)*2),hh=4+Math.floor(hsh(sy,cx,tx)*2);R(x,cx,Y+sy+(5-hh),w,hh,bc[Math.floor(hsh(cx,tx,sy)*6)]);cx+=w+(hsh(cx,ty,1)<.2?1:0)}R(x,X+2,Y+sy+5,12,1,W[3])}}
function drawTable(x,X,Y){R(x,X+2,Y+12,12,3,'rgba(0,0,0,.2)');R(x,X+3,Y+9,2,5,RAMP.wood[0]);R(x,X+11,Y+9,2,5,RAMP.wood[0]);R(x,X+1,Y+3,14,7,'#f4efe2');R(x,X+1,Y+8,14,2,'#d8cfbc');R(x,X+1,Y+3,14,1,'#ffffff');for(let k=2;k<14;k+=3)px(x,X+k,Y+9,'#c84a3a');R(x,X+5,Y+4,3,3,'#ffffff');R(x,X+6,Y+5,1,1,'#7a4a2a');R(x,X+10,Y+5,2,2,'#e8a040')}
function drawPlant(x,X,Y){R(x,X+3,Y+14,10,2,'rgba(0,0,0,.2)');R(x,X+4,Y+9,8,6,'#b6533a');R(x,X+4,Y+9,8,1,'#d8704e');const T=RAMP.tree;
  for(const[a,b,c]of[[8,2,2],[5,4,1],[11,4,1],[7,-2,3],[9,6,1],[4,0,2],[12,1,2]]){R(x,X+a-1,Y+b,3,4,T[c]);px(x,X+a,Y+b-1,T[c+1]||T[4])}}
function drawPC(x,X,Y){R(x,X+1,Y+13,14,3,'rgba(0,0,0,.25)');R(x,X+2,Y,12,11,'#4a4f5c');R(x,X+3,Y+1,10,8,'#16261e');R(x,X+4,Y+2,8,6,'#3fd08a');R(x,X+5,Y+3,4,1,'#c8ffe0');R(x,X+5,Y+5,6,1,'#9af0c4');R(x,X+1,Y+11,14,4,'#6a7080');R(x,X+3,Y+12,10,1,'#4a4f5c')}
function drawBed(x,X,Y){R(x,X+1,Y-2,14,18,RAMP.wood[1]);R(x,X+2,Y-1,12,5,'#f8f4ea');R(x,X+2,Y+4,12,11,'#4a7ac8');R(x,X+2,Y+4,12,2,'#6a9ae0');for(let k=4;k<14;k+=4)R(x,X+k,Y+7,1,7,'#3a62a8')}
function drawMat(x,X,Y){R(x,X,Y,16,16,RAMP.floor[2]);R(x,X+1,Y+3,14,11,'#a83a3a');R(x,X+2,Y+4,12,9,'#c8504a');R(x,X+3,Y+6,10,1,'#f0c060');R(x,X+3,Y+10,10,1,'#f0c060')}
function drawBoard(x,X,Y){drawWallTile(x,X,Y,true);R(x,X+1,Y+1,14,9,'#5a3a22');R(x,X+2,Y+2,12,7,'#2f5a42');pfDraw(x,'ÆØÅ',X+3,Y+3,'#eef3e8')}
function drawTrophy(x,X,Y){const S=RAMP.stone,G=RAMP.gold;R(x,X+4,Y+4,8,12,S[2]);R(x,X+4,Y+4,8,1,S[3]);R(x,X+11,Y+4,1,12,S[0]);R(x,X+5,Y-3,6,5,G[2]);R(x,X+5,Y-3,2,4,G[3]);R(x,X+4,Y-3,1,2,G[1]);R(x,X+11,Y-3,1,2,G[1]);R(x,X+7,Y+2,2,2,G[1])}

/* ---- buildings ---- */
function findBuildings(m){const seen=new Set(),out=[];const g=m.g;
  for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){const c=g[y][x];if(!(ROOFS.has(c)||WALLS.has(c))||seen.has(x+','+y))continue;
    const q=[[x,y]];seen.add(x+','+y);let x0=x,x1=x,y0=y,y1=y;const cells=[];
    while(q.length){const[a,b]=q.pop();cells.push([a,b]);x0=Math.min(x0,a);x1=Math.max(x1,a);y0=Math.min(y0,b);y1=Math.max(y1,b);
      for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const A=a+dx,B=b+dy;if(A<0||B<0||A>=m.w||B>=m.h)continue;const cc=g[B][A];if((ROOFS.has(cc)||WALLS.has(cc))&&!seen.has(A+','+B)){seen.add(A+','+B);q.push([A,B])}}}
    let wallTop=y1;for(let r=y0;r<=y1;r++){if(!ROOFS.has(g[r][x0])&&!ROOFS.has(g[r][x1])){wallTop=r;break}}
    out.push({x0,x1,y0,y1,wallTop,roof:g[y0][x0],wall:g[y1][x0]==='D'?g[y1][x0+1]:g[y1][x0]})}
  return out}
function drawBuilding(x,m,b,O){const ox=O.x,oy=O.y;const X0=ox+b.x0*16,X1=ox+(b.x1+1)*16,Yr=oy+b.y0*16,Yw=oy+b.wallTop*16,Yb=oy+(b.y1+1)*16;
  const seed=hsh(b.x0,b.y0,m.id.length);
  // ground shadow
  x.fillStyle='rgba(18,28,24,.28)';x.fillRect(X1,Yr+8,5,Yb-Yr-6);x.fillRect(X0+4,Yb,X1-X0+1,3);
  // walls
  const glassy=(b.wall==='o'||b.wall==='v')&&m.id==='orestad';
  let P;if(b.wall==='B'||b.wall==='W')P=RAMP.brick;else if(glassy)P=RAMP.glass;else if(b.wall==='o'||b.wall==='v')P=PLASTER[2];else P=PLASTER[m.id==='nyhavn'||m.id==='christianshavn'?Math.floor(seed*5):[0,4,1][Math.floor(seed*3)]];
  const top=Yw-2;R(x,X0,top,X1-X0,Yb-top,P[2]);
  if(P===RAMP.brick){const mort=mix(P[3],'#eadfcf',.55);for(let yy=top;yy<Yb;yy+=4){R(x,X0,yy+3,X1-X0,1,mort);const off=((yy-top)/4)%2?4:0;for(let xx=X0+off;xx<X1;xx+=8){R(x,xx,yy,1,3,mort);const v=hsh(xx,yy,3);if(v<.3)R(x,xx+1,yy,7,3,P[1]);else if(v>.85)R(x,xx+1,yy,7,3,P[3])}}}
  else if(glassy){for(let xx=X0;xx<X1;xx+=8){R(x,xx,top,1,Yb-top,'#c9d6e0');}for(let yy=top;yy<Yb;yy+=8)R(x,X0,yy,X1-X0,1,'#c9d6e0');for(let k=0;k<(X1-X0);k+=12){x.fillStyle='rgba(255,255,255,.22)';for(let j=0;j<Yb-top;j++)x.fillRect(X0+k+j*.5,top+j,3,1)}}
  else{for(let k=0;k<(X1-X0)*(Yb-top)/24;k++)px(x,X0+Math.floor(hsh(k,b.x0,1)*(X1-X0)),top+Math.floor(hsh(b.y0,k,2)*(Yb-top)),hsh(k,k,3)<.5?P[1]:P[3])}
  R(x,X0,top,X1-X0,2,P[3]);R(x,X0,top+2,X1-X0,1,P[1]);R(x,X0,Yb-3,X1-X0,3,RAMP.stone[1]);R(x,X0,Yb-3,X1-X0,1,RAMP.stone[2]);
  R(x,X0,top,1,Yb-top,P[3]);R(x,X1-1,top,1,Yb-top,P[0]);
  // windows & doors
  for(let ty=b.wallTop;ty<=b.y1;ty++)for(let tx=b.x0;tx<=b.x1;tx++){const c=m.g[ty][tx],X=ox+tx*16,Y=oy+ty*16;
    if(c==='W'||c==='w'||c==='v'){if(glassy){m.windows.push({x:X+2-ox,y:Y+1-oy,w:12,h:12});continue}
      const wy=Y+(ty===b.wallTop?1:2);R(x,X+3,wy,10,11,'#f2ede0');R(x,X+4,wy+1,8,9,RAMP.glass[1]);R(x,X+4,wy+1,8,4,RAMP.glass[2]);R(x,X+4,wy+1,3,2,RAMP.glass[3]);R(x,X+7,wy+1,1,9,'#f2ede0');R(x,X+4,wy+5,8,1,'#f2ede0');R(x,X+2,wy+11,12,2,RAMP.stone[2]);R(x,X+2,wy+12,12,1,RAMP.stone[0]);
      if(m.id==='nyhavn'||hsh(tx,ty,4)<.25){for(let k=0;k<5;k++)px(x,X+3+k*2,wy+10,['#e8455a','#f4d14a','#e8455a','#f6f2e4','#c46ae0'][k]);}
      m.windows.push({x:X+4-ox,y:wy+1-oy,w:8,h:9})}
    if(c==='D'){const dr=m.doors.find(d=>d.x===tx&&d.y===ty);const k=dr?dr.k:'house';
      const col=k==='hygge'?'#c23a3a':k==='kiosk'?'#3a8a5a':k==='gym'?'#2f3448':k==='final'?'#5a2e1e':RAMP.wood[1];
      R(x,X+2,Y+2,12,14,'#f2ede0');R(x,X+3,Y+3,10,13,col);R(x,X+3,Y+3,10,1,shade(col,1.3));R(x,X+4,Y+5,3,4,shade(col,.8));R(x,X+9,Y+5,3,4,shade(col,.8));R(x,X+4,Y+10,3,4,shade(col,.8));R(x,X+9,Y+10,3,4,shade(col,.8));px(x,X+11,Y+10,RAMP.gold[3]);
      if(k==='hygge'){R(x,X+6,Y+5,4,3,'#f8b0b0');px(x,X+6,Y+5,col);px(x,X+9,Y+5,col);px(x,X+7,Y+8,'#f8b0b0');px(x,X+8,Y+8,'#f8b0b0')}
      if(k==='gym'){R(x,X+7,Y+3,2,13,RAMP.gold[2]);R(x,X+5,Y+7,6,2,RAMP.gold[3])}
      if(k==='kiosk'){R(x,X+4,Y+5,8,6,RAMP.glass[2]);R(x,X+4,Y+5,3,2,RAMP.glass[3])}
      R(x,X+1,Y+15,14,1,RAMP.stone[2]);m.doorLights.push({x:X+8-ox,y:Y+2-oy})}}
  // kiosk awning
  const dk=m.doors.find(d=>d.y===b.y1&&d.x>=b.x0&&d.x<=b.x1);
  if(dk&&dk.k==='kiosk'){for(let xx=X0-1;xx<X1+1;xx++){const st=Math.floor((xx-X0)/4)%2;R(x,xx,Yw-1,1,5,st?'#f6f2e6':'#3a9a5a')}for(let xx=X0-1;xx<X1+1;xx+=4){R(x,xx,Yw+4,2,1,'#3a9a5a')}}
  // roof
  const rx0=X0-2,rx1=X1+2,ry0=Yr-3,ry1=Yw+1;const rw=rx1-rx0,rh=ry1-ry0;
  const RS={R:RAMP.copper,r:RAMP.tile,g:RAMP.slate,a:RAMP.flat}[b.roof]||RAMP.tile;
  R(x,rx0,ry0,rw,rh,RS[2]);
  if(b.roof==='R'){for(let xx=rx0+2;xx<rx1;xx+=4){R(x,xx,ry0+2,1,rh-3,RS[1]);R(x,xx+1,ry0+2,1,rh-3,RS[3])}for(let k=0;k<rw*rh/30;k++)px(x,rx0+Math.floor(hsh(k,b.x0,5)*rw),ry0+Math.floor(hsh(b.y0,k,6)*rh),RS[hsh(k,1,1)<.5?3:1])}
  if(b.roof==='r'){for(let yy=ry0+2;yy<ry1;yy+=4){R(x,rx0,yy+3,rw,1,RS[1]);for(let xx=rx0+((yy-ry0)/4%2?2:0);xx<rx1;xx+=4){px(x,xx,yy+2,RS[1]);R(x,xx+1,yy,2,1,RS[3])}}}
  if(b.roof==='g'){for(let yy=ry0+2;yy<ry1;yy+=3)for(let xx=rx0;xx<rx1;xx+=6)R(x,xx+((yy/3)%2?3:0),yy,4,1,RS[1]);R(x,rx0,ry0,rw,2,RAMP.gold[2]);R(x,rx0,ry1-2,rw,2,RAMP.gold[1]);
    const n=(m.doors.find(d=>d.k==='gym')||{}).n||1;const bc=['#e07a3a','#3f78cf','#c99a1c','#4f9a48','#cf4a5e','#8f58c0'][n-1];const cx=Math.round((rx0+rx1)/2),cy=Math.round((ry0+ry1)/2);
    x.fillStyle=RAMP.gold[3];x.beginPath();x.arc(cx,cy,6,0,Math.PI*2);x.fill();x.fillStyle=bc;x.beginPath();x.arc(cx,cy,4.5,0,Math.PI*2);x.fill();pfDraw(x,String(n),cx-1,cy-2,'#fff')}
  if(b.roof==='a'){R(x,rx0,ry0,rw,2,RS[3]);R(x,rx0,ry1-2,rw,2,RS[0]);for(let k=0;k<rw/14;k++){const ax=rx0+4+k*14;if(hsh(k,b.x0,9)<.5){R(x,ax,ry0+5,8,6,RAMP.glass[1]);R(x,ax,ry0+5,8,1,RAMP.glass[3]);R(x,ax+3,ry0+5,1,6,RAMP.glass[0])}else{R(x,ax,ry0+6,6,5,'#c8ccd0');R(x,ax+1,ry0+7,4,3,'#8a9096')}}}
  if(b.roof!=='a'){R(x,rx0,ry0,rw,2,RS[3]);R(x,rx0+1,ry0,rw-2,1,RS[4]||shade(RS[3],1.2))}
  R(x,rx0,ry1-1,rw,1,RS[0]);R(x,rx0,ry1,rw,2,'rgba(0,0,0,.28)');R(x,rx0,ry0,1,rh,RS[3]);R(x,rx1-1,ry0,1,rh,RS[0]);
  // dormers on big roofs
  if(rw>140&&b.roof!=='a'){for(let xx=rx0+12;xx<rx1-20;xx+=28){R(x,xx,ry0+6,12,10,RS[3]);R(x,xx+1,ry0+5,10,1,RS[4]||'#fff');R(x,xx+3,ry0+8,6,6,RAMP.glass[1]);R(x,xx+3,ry0+8,6,2,RAMP.glass[3]);m.windows.push({x:xx+3-ox,y:ry0+8-oy,w:6,h:6})}}
  // chimney
  if((b.roof==='R'||b.roof==='r')&&rw<140&&seed<.75){const cx=rx0+Math.floor(rw*(.62+seed*.2)),cy=ry0-4;R(x,cx,cy,6,9,RAMP.brick[2]);R(x,cx,cy,6,2,RAMP.brick[3]);R(x,cx-1,cy,8,1,RAMP.stone[2]);R(x,cx+5,cy+2,1,7,RAMP.brick[0]);m.chimneys.push({x:cx+3-ox,y:cy-oy})}
  // sign
  for(const[lx,ly,lw,lt]of m.labels){if(lx<b.x0-1||lx>b.x1+1||ly<b.y0-1||ly>b.y1)continue;
    const tw=pfWidth(lt)+(lt==='HYGGE'?7:0);const cx=ox+Math.round((lx+lw/2)*16),sy=Yw-8;const bx=cx-Math.ceil(tw/2)-3;
    R(x,bx,sy,tw+6,9,'#2a2230');R(x,bx+1,sy+1,tw+4,7,'#3b3044');R(x,bx,sy+9,tw+6,1,'rgba(0,0,0,.35)');
    let tx2=bx+3;if(lt==='HYGGE'){const hc='#ff6b7a';R(x,tx2,sy+3,2,2,hc);R(x,tx2+3,sy+3,2,2,hc);R(x,tx2,sy+4,5,1,hc);R(x,tx2+1,sy+5,3,1,hc);px(x,tx2+2,sy+6,hc);tx2+=7}
    pfDraw(x,lt,tx2,sy+2,lt.startsWith('HAL')?RAMP.gold[3]:'#f6efd8')}
}

/* ---- full map prerender ---- */
function prerenderMap(m){
  const mx=m.outdoor?MX:0,my=m.outdoor?MY:0;
  const W=(m.w+mx*2)*16,H=(m.h+my*2)*16;const c=mkc(W,H),x=c.getContext('2d');
  m.cv=c;m.mx=mx;m.my=my;m.windows=[];m.doorLights=[];m.chimneys=[];m.waterTiles=[];m.grassTiles=[];m.lamps=[];
  const O={x:mx*16,y:my*16};
  const g=(tx,ty)=>{if(tx>=0&&ty>=0&&tx<m.w&&ty<m.h)return m.g[ty][tx];if(!m.outdoor)return'Z';if(tx<0||tx>=m.w)return'T';if(ty<0)return m.prev?':':'T';return m.next?':':'T'};
  const gOut=(tx,ty)=>{if(tx>=0&&ty>=0&&tx<m.w&&ty<m.h)return m.g[ty][tx];if(!m.outdoor)return'Z';if(tx<0||tx>=m.w)return'T';if((ty<0&&!m.prev)||(ty>=m.h&&!m.next))return'T';return null};
  if(!m.outdoor){R(x,0,0,W,H,'#120f18')}
  // ground
  for(let ty=-my;ty<m.h+my;ty++)for(let tx=-mx;tx<m.w+mx;tx++){const ch=gOut(tx,ty);if(ch==null)continue;const X=O.x+tx*16,Y=O.y+ty*16;const gt=groundOf(ch);
    if(gt==='grass')gGrass(x,X,Y,tx,ty,ch===',');else if(gt==='path')gPath(x,X,Y,tx,ty);else if(gt==='cob')gCob(x,X,Y,tx,ty);else if(gt==='water')gWater(x,X,Y,tx,ty);
    else if(gt==='wood')gWood(x,X,Y,tx,ty,false);else if(gt==='floor')gFloor(x,X,Y,tx,ty);else if(gt==='gym')gGym(x,X,Y,tx,ty);else if(gt==='void')R(x,X,Y,16,16,'#120f18');
    if(ch==='~'||ch==='-')m.waterTiles.push([tx,ty]);if(ch===',')m.grassTiles.push([tx,ty]);}
  // blending
  for(let ty=-my;ty<m.h+my;ty++)for(let tx=-mx;tx<m.w+mx;tx++){const ch=gOut(tx,ty);if(ch==null)continue;const X=O.x+tx*16,Y=O.y+ty*16;const gt=groundOf(ch);
    const nb={u:groundOf(g(tx,ty-1)),d:groundOf(g(tx,ty+1)),l:groundOf(g(tx-1,ty)),r:groundOf(g(tx+1,ty))};
    if(gt==='path'||gt==='cob'){for(const s in nb)if(nb[s]==='grass')fringe(x,X,Y,tx,ty,s,RAMP.grass[2],RAMP.grass[3])}
    if(gt==='water'&&ch==='~'){for(const s in nb)if(nb[s]!=='water'&&nb[s]!=='wood')shore(x,X,Y,s)}
    if(gt==='floor'&&ch!=='#'&&g(tx,ty-1)==='#')R(x,X,Y,16,3,'rgba(40,24,16,.28)')}
  // bridge planks over water
  for(let ty=0;ty<m.h;ty++)for(let tx=0;tx<m.w;tx++)if(m.g[ty][tx]==='-'){const X=O.x+tx*16,Y=O.y+ty*16;gWood(x,X,Y,tx,ty,true);
    if(g(tx-1,ty)==='~'){R(x,X,Y,2,16,RAMP.wood[0]);R(x,X,Y,1,16,RAMP.wood[3]);for(let k=0;k<16;k+=8)R(x,X,Y+k,3,3,RAMP.wood[0])}
    if(g(tx+1,ty)==='~'){R(x,X+14,Y,2,16,RAMP.wood[0]);R(x,X+15,Y,1,16,RAMP.wood[1]);for(let k=0;k<16;k+=8)R(x,X+13,Y+k,3,3,RAMP.wood[0])}}
  for(let ty=0;ty<m.h;ty++)for(let tx=0;tx<m.w;tx++)if(m.g[ty][tx]==='P'&&g(tx,ty+1)==='~'){const X=O.x+tx*16,Y=O.y+ty*16;R(x,X,Y+14,16,2,RAMP.wood[0]);if(tx%2===0)R(x,X+2,Y+14,3,4,RAMP.wood[0])}
  // props + buildings sorted by bottom row
  const items=[];
  for(const b of findBuildings(m))items.push({y:b.y1+.5,f:()=>drawBuilding(x,m,b,O)});
  for(let ty=-my;ty<m.h+my;ty++)for(let tx=-mx;tx<m.w+mx;tx++){const ch=gOut(tx,ty);if(ch==null)continue;const X=O.x+tx*16,Y=O.y+ty*16;
    const f={T:()=>drawTree(x,X,Y,tx,ty),H:()=>drawHedge(x,X,Y,g,tx,ty),F:()=>drawFence(x,X,Y),f:()=>drawFlowers(x,X,Y,tx,ty),S:()=>drawSign(x,X,Y),L:()=>drawLamp(x,X,Y),c:()=>drawBikes(x,X,Y,tx,ty),X:()=>drawStatue(x,X,Y),
      '#':()=>drawWallTile(x,X,Y,!!g(tx,ty+1)&&g(tx,ty+1)!=='#'&&g(tx,ty+1)!=='Z'),K:()=>drawCounter(x,X,Y),h:()=>drawShelf(x,X,Y,tx,ty),n:()=>drawTable(x,X,Y),q:()=>drawPlant(x,X,Y),C:()=>drawPC(x,X,Y),Y:()=>drawBed(x,X,Y),m:()=>drawMat(x,X,Y),t:()=>drawBoard(x,X,Y),I:()=>drawTrophy(x,X,Y)}[ch];
    if(f)items.push({y:ty+(ch==='#'?0:.6),f});
    if(ch==='L')m.lamps.push({x:tx*16+8,y:ty*16-8});}
  items.sort((a,b)=>a.y-b.y);for(const it of items)it.f();
  return c;
}

/* ---- dynamic tiles drawn every frame ---- */
function drawTallGrass(x,X,Y,tx,ty,t,wind,front){const T=RAMP.tall;
  for(let k=0;k<6;k++){const bx=1+Math.floor(hsh(tx,ty,k)*13),h0=6+Math.floor(hsh(ty,tx,k)*5);const by=(front?16:10+Math.floor(hsh(tx,k,ty)*6));
    if(front&&k%2)continue;
    const sw=Math.sin(t/650+tx*.9+ty*1.7+k)*(1.2+wind*2.2);
    for(let j=0;j<h0;j++){const o=Math.round(sw*(j/h0));const col=j>h0-3?T[3]:j>h0/2?T[2]:T[1];px(x,X+bx+o,Y+by-j,col);if(j<h0-2)px(x,X+bx+1+o,Y+by-j,j>h0/2?T[2]:T[1])}}}
function drawWaterFx(x,X,Y,tx,ty,t){const W=RAMP.water;const ph=(t/900+hsh(tx,ty,1)*6)%6;
  const s=Math.sin(t/700+tx*.8+ty*.5);const off=Math.round(s*2);R(x,X+4+off,Y+5,4,1,W[2]);R(x,X+9-off,Y+11,3,1,W[2]);
  if(ph<.5){const a=Math.floor(hsh(tx,ty,Math.floor(t/3000))*13),b=Math.floor(hsh(ty,tx,Math.floor(t/3000))*13);px(x,X+a,Y+b,W[4]);px(x,X+a+1,Y+b,W[3])}}
