/* ================= SPIRITS: procedural 64×64 creature art with spherical shading ================= */
const GLYPH={spm:'?',køn:'EN',tal:'90',inv1:'V2',inv2:'DA',konj:'MEN',modal:'KAN',pron:'DEM',poss:'SIN',datid:'GIK',hej:'HEJ',adv:'IKKE',tidsudtryk:'OM',adj:'+E',hjem:'ST',familie:'MOR',job1:'JOB'};
function planOf(name){const n=name.toLowerCase();
  if(/ræv|mus|rotte|kat|bjørn|lam|tiger|jaguar|okse|fant|basse|taur|lus$/.test(n))return'quad';
  if(/ørn|fugl|måge|falk|svane|krage|ugle|ælling/.test(n))return'bird';
  if(/snog|slange|drake|drage/.test(n))return'serpent';
  if(/sky|flue/.test(n))return'floaty';
  if(/kok|kaptajn|trold|dæmon|mand|tudse|krabbe/.test(n))return'biped';
  return null}
const SPIRIT_CACHE={};
function spiritSprite(sp,back){
  const key=sp.id+(back?'b':'f');if(SPIRIT_CACHE[key])return SPIRIT_CACHE[key];
  const S=64,c=mkc(S,S),x=c.getContext('2d');
  const r=rng(sp.seed||7);const st=sp.stage;
  const line=LINES.find(l=>l[0]===sp.topic)||null;
  let plan=sp.fox?'quad':(line?(planOf(line[1])||planOf(line[2])):null)||['blob','biped','floaty','quad'][Math.floor(r()*4)];
  const base=sp.fox?'#e8843a':hueShift(TYPES[sp.type].c,(r()-.5)*56,.95+r()*.2);
  const RP=rampOf(base);const bel=sp.fox?'#f6efe2':mix(RP[3],'#fff8e8',.6);const BR=rampOf(bel);
  const acc=sp.fox?'#2a2430':hueShift(base,150+r()*60,1.1);const AR=rampOf(acc);
  const L=[-.55,-.62,.56];
  const E=(cx,cy,rx,ry,ramp,opt={})=>{for(let j=Math.floor(-ry);j<=Math.ceil(ry);j++)for(let i=Math.floor(-rx);i<=Math.ceil(rx);i++){const nx=i/rx,ny=j/ry;const d=nx*nx+ny*ny;if(d>1)continue;
      const nz=Math.sqrt(1-d);let dot=nx*L[0]+ny*L[1]+nz*L[2];if(opt.flat)dot=.4;
      const idx=dot>.86?4:dot>.58?3:dot>.18?2:dot>-.2?1:0;const col=ramp[Math.min(idx,ramp.length-1)];
      x.fillStyle=col;x.fillRect(Math.round(cx+i),Math.round(cy+j),1,1)}};
  const grow=st?1.18:1;const cute=st?0:1;
  const k=v=>v*grow;
  const fx={ear:Math.floor(r()*5),eyes:Math.floor(r()*4),mouth:Math.floor(r()*4),tail:Math.floor(r()*3),stripes:r()<.45,spots:r()<.35,cheeks:r()<.55};
  if(sp.fox){fx.ear=1;fx.tail=2;fx.eyes=0;fx.mouth=0;fx.stripes=false;fx.spots=false;fx.cheeks=false}
  const gy=58; // ground line
  let head={x:32,y:24,rx:10,ry:9},body={x:32,y:42,rx:13,ry:12};
  const tailFn=()=>{if(fx.tail===1){E(32+k(15),gy-k(16),k(4),k(7),RP)}if(fx.tail===2){E(32+k(16),gy-k(20),k(6),k(9),RP);E(32+k(18),gy-k(28),k(4),k(4),sp.fox?BR:AR)}};
  // ---- body plans ----
  if(plan==='quad'){body={x:32,y:gy-k(15),rx:k(16),ry:k(10)};head={x:32,y:gy-k(27)+cute*2,rx:k(10)+cute*2,ry:k(9)+cute};
    tailFn();E(body.x-k(11),gy-k(4),k(3.5),k(5),RP);E(body.x+k(11),gy-k(4),k(3.5),k(5),RP);E(body.x,body.y,body.rx,body.ry,RP);
    if(!back)E(body.x,body.y+k(3),k(8),k(6),BR);E(body.x-k(6),gy-k(3),k(3.5),k(4),RP);E(body.x+k(6),gy-k(3),k(3.5),k(4),RP)}
  else if(plan==='bird'){body={x:32,y:gy-k(14),rx:k(12),ry:k(12)};head={x:32,y:gy-k(30)+cute*2,rx:k(9)+cute*2,ry:k(8)+cute*2};
    E(32-k(14),body.y-k(2),k(6),k(11),RP);E(32+k(14),body.y-k(2),k(6),k(11),RP);if(st){E(32-k(19),body.y-k(8),k(5),k(8),RP);E(32+k(19),body.y-k(8),k(5),k(8),RP)}
    E(32,gy-k(3),k(7),k(3),RP);E(body.x,body.y,body.rx,body.ry,RP);if(!back)E(body.x,body.y+k(2),k(7),k(8),BR);
    R(x,27,gy-2,2,3,'#e8a030');R(x,35,gy-2,2,3,'#e8a030');R(x,25,gy,5,1,'#e8a030');R(x,33,gy,5,1,'#e8a030')}
  else if(plan==='serpent'){head={x:36,y:gy-k(34)+cute*3,rx:k(9)+cute*2,ry:k(8)+cute*2};
    E(32,gy-k(5),k(18),k(6),RP);E(30,gy-k(13),k(14),k(6),RP);E(33,gy-k(21),k(9),k(6),RP);
    if(!back){for(let j=0;j<3;j++)E(32-j,gy-k(5+j*8),k(8-j*2),k(2),BR,{flat:true})}
    if(st){E(18,gy-k(30),k(9),k(6),AR);E(46,gy-k(30),k(9),k(6),AR)}}
  else if(plan==='floaty'){body={x:32,y:gy-k(22),rx:k(15),ry:k(12)};head={x:32,y:gy-k(26),rx:k(12),ry:k(10)};
    x.fillStyle='rgba(0,0,0,.18)';x.beginPath();x.ellipse(32,gy,12,2.5,0,0,Math.PI*2);x.fill();
    if(/flue|falk/.test((line||[''])[1]+(line||['',''])[2])){E(32-k(14),body.y-k(10),k(7),k(5),rampOf('#dff2ff'));E(32+k(14),body.y-k(10),k(7),k(5),rampOf('#dff2ff'))}
    E(body.x,body.y,body.rx,body.ry,RP);E(body.x-k(10),body.y-k(8),k(7),k(6),RP);E(body.x+k(10),body.y-k(8),k(7),k(6),RP);E(body.x,body.y-k(12),k(8),k(6),RP);
    if(!back)E(body.x,body.y+k(4),k(9),k(5),BR)}
  else if(plan==='biped'){body={x:32,y:gy-k(14),rx:k(11),ry:k(12)};head={x:32,y:gy-k(31)+cute*3,rx:k(11)+cute*2,ry:k(10)+cute};
    tailFn();E(32-k(6),gy-k(2),k(5),k(3),RP);E(32+k(6),gy-k(2),k(5),k(3),RP);E(body.x,body.y,body.rx,body.ry,RP);if(!back)E(body.x,body.y+k(2),k(7),k(8),BR);
    E(32-k(13),body.y-k(2),k(4),k(7),RP);E(32+k(13),body.y-k(2),k(4),k(7),RP)}
  else{body={x:32,y:gy-k(14),rx:k(15),ry:k(14)};head={x:32,y:gy-k(18),rx:k(14),ry:k(12)};
    tailFn();E(32-k(8),gy-k(1),k(5),k(3),RP);E(32+k(8),gy-k(1),k(5),k(3),RP);E(body.x,body.y,body.rx,body.ry,RP);if(!back)E(body.x,body.y+k(5),k(9),k(6),BR)}
  // ears / horns
  const earX=Math.max(5,head.rx-3);
  const ears=()=>{for(const s of[-1,1]){const ex=head.x+s*earX,ey=head.y-head.ry+2;
    if(fx.ear===0)E(ex,ey-3,3,4,RP);
    if(fx.ear===1){for(let j=0;j<9;j++){const w=Math.max(1,Math.round((9-j)*.55));x.fillStyle=j<3&&sp.fox?'#3a2a30':j<2?RP[1]:RP[2+(s<0?1:0)];x.fillRect(Math.round(ex-w/2+s*j*.25),Math.round(ey-j),w,1)}}
    if(fx.ear===2)E(ex+s,ey-1,4,3,RP);
    if(fx.ear===3){for(let j=0;j<8;j++){x.fillStyle=j>5?AR[3]:AR[2];x.fillRect(Math.round(ex+s*j*.6),Math.round(ey-j),2,1)}}
    if(fx.ear===4){R(x,ex,ey-6,1,6,RP[1]);E(ex,ey-7,2,2,AR)}}};
  if(plan!=='bird')ears();
  if(st&&!sp.fox){for(const s of[-1,1]){for(let j=0;j<7;j++){x.fillStyle=j>4?AR[4]:AR[2];x.fillRect(Math.round(head.x+s*(3+j*.7)),Math.round(head.y-head.ry-j+1),2,1)}}}
  // head
  E(head.x,head.y,head.rx,head.ry,RP);
  if(sp.fox&&!back){E(head.x,head.y+4,7,4,BR)}
  // markings
  if(fx.stripes){x.fillStyle=RP[1];for(let k2=-1;k2<=1;k2++)x.fillRect(Math.round(head.x+k2*4),Math.round(head.y-head.ry+1),2,4)}
  if(fx.spots&&!back){x.fillStyle=RP[3];for(let k2=0;k2<4;k2++){const a=body.x-body.rx+3+Math.floor(r()*body.rx*1.6),b=body.y-body.ry/2+Math.floor(r()*body.ry);x.fillRect(a,b,2,2)}}
  if(back){x.fillStyle=RP[1];for(let k2=0;k2<3;k2++)x.fillRect(Math.round(head.x-6+k2*5),Math.round(head.y-2),3,2)}
  // face
  if(!back){const ey=Math.round(head.y-1+(cute?1:0)),ex=Math.round(Math.max(4,head.rx*.48));
    for(const s of[-1,1]){const cx=head.x+s*ex;
      if(fx.eyes===0||fx.eyes===3){const er=cute?3.2:2.6;E(cx,ey,er,er+.6,['#ffffff','#ffffff','#ffffff','#ffffff','#ffffff'],{flat:true});x.fillStyle=sp.fox?'#2a4a3a':INK;x.fillRect(Math.round(cx-1+(s>0?0:0)),ey-1,2,3+(cute?1:0));x.fillStyle='#ffffff';x.fillRect(Math.round(cx-1),ey-1,1,1);
        if(fx.eyes===3&&st){x.fillStyle=RP[1];x.fillRect(Math.round(cx-3),ey-4,6,1)}}
      if(fx.eyes===1){x.fillStyle=INK;x.fillRect(Math.round(cx-2),ey,4,1);x.fillRect(Math.round(cx-3),ey+1,1,1);x.fillRect(Math.round(cx+2),ey+1,1,1)}
      if(fx.eyes===2){x.fillStyle='#ffffff';x.fillRect(Math.round(cx-2),ey-1,4,3);x.fillStyle=INK;x.fillRect(Math.round(cx-1),ey,2,2);x.fillStyle=RP[1];x.fillRect(Math.round(cx-2),ey-2,4,1)}}
    const my=Math.round(head.y+head.ry*.45);
    if(plan==='bird'){x.fillStyle='#f0a030';x.fillRect(30,my-3,5,2);x.fillStyle='#c87a20';x.fillRect(31,my-1,3,1);px(x,32,my,'#c87a20')}
    else if(fx.mouth===0){x.fillStyle=INK;x.fillRect(31,my,3,1);px(x,30,my-1,INK);px(x,34,my-1,INK)}
    else if(fx.mouth===1){x.fillStyle=INK;x.fillRect(30,my-1,5,3);x.fillStyle='#e8606a';x.fillRect(31,my,3,2)}
    else if(fx.mouth===2){x.fillStyle=INK;x.fillRect(30,my,5,1);px(x,31,my+1,'#ffffff');px(x,33,my+1,'#ffffff')}
    else{x.fillStyle=INK;x.fillRect(31,my,2,1)}
    if(fx.cheeks){x.fillStyle='rgba(240,110,120,.55)';x.fillRect(Math.round(head.x-ex-4),ey+3,3,2);x.fillRect(Math.round(head.x+ex+2),ey+3,3,2)}
    if(sp.fox){x.fillStyle=INK;x.fillRect(31,Math.round(head.y+3),3,2)}
    // topic glyph on belly
    const gl=GLYPH[sp.topic];if(gl&&plan!=='serpent'){const w=pfWidth(gl);const gx=Math.round(body.x-w/2),gyy=Math.round(body.y+(plan==='floaty'?2:1));
      x.fillStyle=st?RAMP.gold[3]:BR[0];pfDraw(x,gl,gx,gyy,st?RAMP.gold[2]:mix(BR[0],RP[1],.5))}
  }
  // accessories by topic
  const T=sp.topic;
  if(T==='mark'){R(x,head.x-7,head.y-head.ry-7,14,6,'#f8f6f0');E(head.x-5,head.y-head.ry-7,4,3,rampOf('#f4f2ea'));E(head.x+5,head.y-head.ry-7,4,3,rampOf('#f4f2ea'));E(head.x,head.y-head.ry-9,5,4,rampOf('#f4f2ea'));R(x,head.x-7,head.y-head.ry-2,14,2,'#d8d4c8')}
  if(T==='hygge'&&!back){R(x,head.x-9,head.y+head.ry-2,18,4,'#c84040');for(let k2=0;k2<18;k2+=4)R(x,head.x-9+k2,head.y+head.ry-2,2,4,'#f4efe4');R(x,head.x+5,head.y+head.ry+1,4,7,'#c84040')}
  if(T==='cykel'){E(head.x,head.y-head.ry+2,head.rx-1,5,rampOf('#3a8ad8'));R(x,head.x-head.rx+2,head.y-head.ry+5,(head.rx-2)*2,1,'#1a3a6a')}
  if(T==='krop'&&!back){R(x,head.x+3,head.y-3,6,3,'#f4d4b0');px(x,head.x+5,head.y-2,'#d8a880');px(x,head.x+7,head.y-2,'#d8a880')}
  if(T==='kommune'&&!back){x.fillStyle=INK;x.fillRect(head.x-8,head.y-1,7,1);x.fillRect(head.x+1,head.y-1,7,1);x.fillRect(head.x-1,head.y-1,2,1)}
  if(T==='vejr'){for(let k2=0;k2<4;k2++){R(x,10+k2*12,gy-4-((k2*7)%10),1,3,'#8ccbee')}}
  if(T==='tid'&&!back){E(body.x,body.y,5,5,rampOf('#f4efe0'),{flat:true});x.fillStyle=INK;x.fillRect(body.x,body.y-3,1,4);x.fillRect(body.x,body.y,3,1)}
  if(T==='mad'){R(x,head.x-6,head.y-head.ry-3,12,4,'#6a3a1e');R(x,head.x-6,head.y-head.ry-3,12,1,'#8a5a2e');for(let k2=0;k2<4;k2++)px(x,head.x-5+k2*3,head.y-head.ry-1,'#c8a060')}
  if(st&&!sp.fox){E(body.x,body.y+body.ry-2,2,1.5,rampOf(RAMP.gold[2]))}
  outline(c,INK,true);
  SPIRIT_CACHE[key]=c;return c;
}
