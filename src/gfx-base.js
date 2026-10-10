/* ================= GRAPHICS BASE: palette ramps, helpers, pixel font ================= */
const LW=240,LH=160,TS=16;
const INK='#1d1a24';
const RAMP={
 grass:['#3d7a3a','#56a047','#72bb53','#9bd46a'],
 tall:['#245c30','#367d3b','#4f9c45','#79c25a'],
 path:['#a8845a','#c9a46e','#ddbd86','#efd7a4'],
 cob:['#625d5a','#837c76','#a29b92','#c4bdb2'],
 water:['#1d4a82','#2c6aab','#4a90cc','#8ccbee','#e4f6ff'],
 wood:['#4f321f','#74492b','#9a6639','#c08d55'],
 brick:['#5f241c','#8a3828','#ad4c35','#cb6b4e'],
 copper:['#244f48','#357466','#4f9a87','#7fc4ae'],
 tile:['#5e2520','#8c3b2c','#b3563c','#d77d5a'],
 slate:['#22252f','#353a48','#4d5466','#717b92'],
 flat:['#40454c','#5e656e','#7f8790','#a8afb7'],
 glass:['#223e5c','#335f86','#5f95bd','#aedaf0'],
 tree:['#183f28','#255c34','#377b40','#529b4c','#7fc165'],
 stone:['#46444a','#67646a','#8d8a8c','#b8b4b0'],
 floor:['#6d4426','#8e5d33','#ad7a45','#cc9c62'],
 wall:['#9d8a6c','#c3ad86','#ddcaa2','#f1e5c6'],
 gold:['#7a5414','#b07e1e','#e0aa34','#f8d873'],
 skin:[['#8a5a3c','#b07850','#d9a07a','#f0c4a0'],['#5a3624','#7a4a30','#9c6440','#bd8458'],['#9a6a48','#c4906a','#e6b892','#f8d8bc'],['#3e2618','#583624','#764a32','#946448']],
};
const PLASTER=[['#8f6c1e','#c19232','#e6be56','#f6dc8c'],['#874a38','#bb6a52','#de8d72','#f3b59c'],['#365679','#557ca6','#80a5cd','#b2cee8'],['#3a7462','#5a9a82','#82bfa5','#b4dfcc'],['#7d6a3c','#ad9458','#d3bb7c','#ecdcaa'],['#868480','#b6b3aa','#dcd8cc','#f4f1e8']];
function mkc(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
function R(x,X,y,w,hh,col){x.fillStyle=col;x.fillRect(X,y,w,hh)}
function px(x,X,y,col){x.fillStyle=col;x.fillRect(X,y,1,1)}
function hsh(a,b,c){let h=(a*374761393+b*668265263+(c||0)*2147483647)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967296}
function rng(seed){let a=seed>>>0||1;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function hex2rgb(h){return[1,3,5].map(i=>parseInt(h.slice(i,i+2),16))}
function rgb2hex(a){return'#'+a.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('')}
function mix(a,b,t){const A=hex2rgb(a),B=hex2rgb(b);return rgb2hex(A.map((v,i)=>v+(B[i]-v)*t))}
function shade(hex,f){return f>1?mix(hex,'#ffffff',f-1):mix(hex,'#000000',1-f)}
function hueShift(hex,deg,sat){let[r,g,b]=hex2rgb(hex).map(v=>v/255);const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let hh=0,s=0,l=(mx+mn)/2;
  if(mx!==mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);hh=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;hh*=60}
  hh=(hh+deg+360)%360;if(sat)s=Math.max(0,Math.min(1,s*sat));const f=n=>{const k=(n+hh/30)%12,a=s*Math.min(l,1-l);return l-a*Math.max(-1,Math.min(k-3,9-k,1))};
  return rgb2hex([f(0),f(8),f(4)].map(v=>v*255))}
/* 4-tone ramp with hue shifting: shadows cooler, highlights warmer */
function rampOf(base){return[hueShift(shade(base,.55),-14,1.1),hueShift(shade(base,.78),-6),base,hueShift(shade(base,1.32),10,.95),hueShift(shade(base,1.62),16,.8)]}
/* auto outline: transparent pixels next to opaque ones get a darkened neighbour colour */
function outline(c,col,selective){const x=c.getContext('2d'),w=c.width,hh=c.height,d=x.getImageData(0,0,w,hh),p=d.data,o=new Uint8ClampedArray(p);
  const ink=hex2rgb(col||INK);
  for(let j=0;j<hh;j++)for(let i=0;i<w;i++){const k=(j*w+i)*4;if(p[k+3]>0)continue;
    let n=-1;for(const[a,b]of[[0,1],[0,-1],[1,0],[-1,0]]){const I=i+a,J=j+b;if(I>=0&&J>=0&&I<w&&J<hh&&p[(J*w+I)*4+3]>0){n=(J*w+I)*4;break}}
    if(n<0)continue;
    if(selective){o[k]=p[n]*.32+ink[0]*.5;o[k+1]=p[n+1]*.32+ink[1]*.5;o[k+2]=p[n+2]*.32+ink[2]*.5}else{o[k]=ink[0];o[k+1]=ink[1];o[k+2]=ink[2]}o[k+3]=255}
  d.data.set(o);x.putImageData(d,0,0);return c}
function flipH(c){const o=mkc(c.width,c.height),x=o.getContext('2d');x.translate(c.width,0);x.scale(-1,1);x.drawImage(c,0,0);return o}

/* 3×5 pixel font for signs */
const PF={A:'010101111101101',B:'110101110101110',C:'011100100100011',D:'110101101101110',E:'111100110100111',F:'111100110100100',G:'011100101101011',H:'101101111101101',I:'111010010010111',J:'001001001101010',K:'101101110101101',L:'100100100100111',M:'101111111101101',N:'110101101101101',O:'010101101101010',P:'110101110100100',Q:'010101101110011',R:'110101110101101',S:'011100010001110',T:'111010010010010',U:'101101101101111',V:'101101101101010',W:'101101111111101',X:'101101010101101',Y:'101101010010010',Z:'111001010100111',
 Æ:'011110111110111',Ø:'011101111101110',Å:'010000010101111','0':'010101101101010','1':'010110010010111','2':'110001010100111','3':'110001010001110','4':'101101111001001','5':'111100110001110','6':'011100110101010','7':'111001010010010','8':'010101010101010','9':'010101011001110',' ':'000000000000000','.':'000000000000010','·':'000000010000000','!':'010010010000010','?':'110001010000010','-':'000000111000000'};
function pfWidth(s){return s.length*4-1}
function pfDraw(x,s,X,Y,col){x.fillStyle=col;let cx=X;for(const ch of s.toUpperCase()){const g=PF[ch]||PF[' '];for(let k=0;k<15;k++)if(g[k]==='1')x.fillRect(cx+k%3,Y+Math.floor(k/3),1,1);cx+=4}}
