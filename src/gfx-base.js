/* ================= GRAPHICS BASE: colour, noise, shape helpers (vector, resolution-independent) ================= */
const INK='#1b1622';
const FONT_UI='"IBM Plex Mono", ui-monospace, Menlo, monospace';
const FONT_SIGN='"Righteous", "IBM Plex Mono", system-ui, sans-serif';
const PAL={
 grass:'#6f9a4c',grass2:'#5d8a40',grassLt:'#8db35e',tall:'#4f7d3a',tallLt:'#78a64e',
 path:'#d3b98c',pathDk:'#b79a6c',cob:'#9c958c',cobDk:'#6f6862',cobLt:'#bab2a6',
 water:'#3d6f95',waterDk:'#2b5274',waterLt:'#79a9c8',foam:'#e6f2f6',
 wood:'#8a5f3c',woodDk:'#5f4029',woodLt:'#b0835a',
 brick:'#a9533c',brickDk:'#7c3a2a',brickLt:'#c4704f',mortar:'#d9c8b0',
 copper:'#5f9c8a',copperDk:'#3f7465',copperLt:'#8cc2ae',
 tile:'#a8483a',tileDk:'#7a3026',tileLt:'#c76b55',
 slate:'#3a3d4d',slateDk:'#272a36',slateLt:'#575c72',
 flat:'#6c727b',flatDk:'#4c5158',flatLt:'#9097a0',
 glass:'#5c87a8',glassDk:'#3a5d7a',glassLt:'#a9d0e6',
 tree:'#3f6e3a',treeDk:'#294d2b',treeLt:'#6b9a50',
 stone:'#8d8780',stoneDk:'#615b56',stoneLt:'#b8b1a8',
 floor:'#a8794e',floorDk:'#865c38',floorLt:'#c39466',
 wall:'#d8c7a6',wallDk:'#b39f7c',gold:'#d9a940',goldLt:'#f4d683',
};
const PLASTER=['#d9a84a','#c97a5c','#7d9fbf','#7fae94','#d8c08a','#d6d0c4','#b9705a'];
function mkc(w,h){const c=document.createElement('canvas');c.width=Math.max(1,Math.ceil(w));c.height=Math.max(1,Math.ceil(h));return c}
function hsh(a,b,c){let h=(a*374761393+b*668265263+(c||0)*2147483647)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967296}
function rng(seed){let a=seed>>>0||1;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function hex2rgb(h){return[1,3,5].map(i=>parseInt(h.slice(i,i+2),16))}
function rgb2hex(a){return'#'+a.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('')}
function mix(a,b,t){const A=hex2rgb(a),B=hex2rgb(b);return rgb2hex(A.map((v,i)=>v+(B[i]-v)*t))}
function shade(hex,f){return f>1?mix(hex,'#ffffff',Math.min(1,f-1)):mix(hex,'#000000',1-f)}
function rgba(hex,a){const[r,g,b]=hex2rgb(hex);return`rgba(${r},${g},${b},${a})`}
function hueShift(hex,deg,sat,lit){let[r,g,b]=hex2rgb(hex).map(v=>v/255);const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let hh=0,s=0,l=(mx+mn)/2;
  if(mx!==mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);hh=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;hh*=60}
  hh=((hh+deg)%360+360)%360;if(sat)s=Math.max(0,Math.min(1,s*sat));if(lit)l=Math.max(0,Math.min(1,l*lit));
  const f=n=>{const k=(n+hh/30)%12,a=s*Math.min(l,1-l);return l-a*Math.max(-1,Math.min(k-3,9-k,1))};return rgb2hex([f(0),f(8),f(4)].map(v=>v*255))}
function hsl(h,s,l,a){return a==null?`hsl(${h},${s}%,${l}%)`:`hsla(${h},${s}%,${l}%,${a})`}
/* shape helpers (all in current transform units) */
function rr(x,X,Y,w,h,r){x.beginPath();if(x.roundRect)x.roundRect(X,Y,w,h,r);else{x.moveTo(X+r,Y);x.arcTo(X+w,Y,X+w,Y+h,r);x.arcTo(X+w,Y+h,X,Y+h,r);x.arcTo(X,Y+h,X,Y,r);x.arcTo(X,Y,X+w,Y,r);x.closePath()}}
function fillRR(x,X,Y,w,h,r,c){rr(x,X,Y,w,h,r);x.fillStyle=c;x.fill()}
function circ(x,X,Y,r,c){x.beginPath();x.arc(X,Y,Math.max(.01,r),0,Math.PI*2);x.fillStyle=c;x.fill()}
function ell(x,X,Y,rx,ry,c,rot){x.beginPath();x.ellipse(X,Y,Math.max(.01,rx),Math.max(.01,ry),rot||0,0,Math.PI*2);x.fillStyle=c;x.fill()}
function lg(x,x0,y0,x1,y1,stops){const g=x.createLinearGradient(x0,y0,x1,y1);stops.forEach(([o,c])=>g.addColorStop(o,c));return g}
function rg(x,X,Y,r0,r1,stops,fx,fy){const g=x.createRadialGradient(fx==null?X:fx,fy==null?Y:fy,r0,X,Y,r1);stops.forEach(([o,c])=>g.addColorStop(o,c));return g}
function softShadow(x,X,Y,rx,ry,a){ell(x,X,Y,rx,ry,`rgba(12,10,20,${a==null?.28:a})`)}
