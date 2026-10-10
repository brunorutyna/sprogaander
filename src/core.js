/* ================= STATE ================= */
const SAVE='sprogaander.v1';
function load(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}}
function store(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function freshState(){return{v:1,started:false,map:'norrebro',x:4,y:5,dir:'d',inside:null,party:[],box:[],seen:{},caught:{},badges:[],money:300,
  bag:{kugle:0,superkugle:0,rugbrod:2,smorrebrod:0,ordbog:3},flags:{},beaten:{},heal:{map:'norrebro',x:4,y:5},stats:{},xp:0,
  day:{date:'',n:0,right:0,wrong:0},streak:0,lastGoal:'',sound:true,slow:false,en:false,time:0,uid:1,name:'',vol:{music:.55,sfx:.8,amb:.55},daynight:true}}
let S=Object.assign(freshState(),load(SAVE,{}));
function save(){S.savedAt=Date.now();store(SAVE,S)}
const today=()=>new Date().toLocaleDateString('sv-SE');
function dayN(){return S.day.date===today()?S.day.n:0}
const GOAL=15;

/* ================= ADAPTIVE PICKING (spaced repetition boxes 0–5) ================= */
const recent=[];
function allowed(topic){let s=0,n=0;for(const i of BANK)if(i.topic===topic){const st=S.stats[i.id];if(st){s+=st.box;n++}}const lv=n?(s/n)*Math.min(1,n/3):0;return lv>=2.6?3:lv>=1.1?2:1}
const fmtOf=i=>i.listen?'listen':i.t;
function poolFor(topics,fmt){return BANK.filter(i=>topics.includes(i.topic)&&(!fmt||fmtOf(i)===fmt))}
function pickItem(topics,fmt){
  let pool=poolFor(topics,fmt);if(!pool.length)return null;
  let c=pool.filter(i=>!recent.includes(i.id));if(!c.length)c=pool;
  const lv={};let tot=0;
  const ws=c.map(i=>{if(!(i.topic in lv))lv[i.topic]=allowed(i.topic);const st=S.stats[i.id];const box=st?st.box:0;
    let w=Math.pow(6-box,2);if(!st)w*=1.3;if(box>=4)w*=.4;if(i.d>lv[i.topic])w*=.07;tot+=w;return w});
  let r=Math.random()*tot;
  for(let k=0;k<c.length;k++){r-=ws[k];if(r<=0){recent.push(c[k].id);if(recent.length>14)recent.shift();return c[k]}}
  return c[c.length-1];
}
function hasFormat(topics,fmt){return poolFor(topics,fmt).length>0}
function record(item,ok){
  const st=S.stats[item.id]||(S.stats[item.id]={box:0,seen:0,right:0,wrong:0});
  st.seen++;st.last=Date.now();
  if(S.day.date!==today())S.day={date:today(),n:0,right:0,wrong:0};
  if(ok){st.right++;st.box=Math.min(5,st.box+1);S.xp+=item.d*2;S.day.n++;S.day.right++;
    if(S.day.n===GOAL){const y=new Date(Date.now()-864e5).toLocaleDateString('sv-SE');S.streak=S.lastGoal===y?S.streak+1:(S.lastGoal===today()?S.streak:1);S.lastGoal=today();setTimeout(()=>toast(`Dagens mål nået! ${S.streak} ${S.streak===1?'dag':'dage'} i træk`),400)}
  }else{st.wrong++;st.box=0;S.day.wrong++}
  save();
}
/* topic mastery 0..1: box points over (up to) 12 items × 4 */
function mastery(topic){const its=BANK.filter(i=>i.topic===topic);let s=0;for(const i of its){const st=S.stats[i.id];if(st)s+=Math.min(4,st.box)}return Math.min(1,s/(Math.min(its.length,12)*4))}
const EVO_NEED=.6;
function weakItems(){return BANK.filter(i=>{const st=S.stats[i.id];return st&&st.wrong>0&&st.box<3}).sort((a,b)=>S.stats[a.id].box-S.stats[b.id].box||S.stats[b.id].last-S.stats[a.id].last)}

/* ================= SPIRIT INSTANCES ================= */
function newSpirit(sp,lv){const s={uid:S.uid++,sp,lv,xp:0,hp:0};s.hp=maxHp(s);return s}
function maxHp(s){const d=SP[s.sp];return Math.floor((16+s.lv*3)*(d.stage?1.15:1)*(d.fox?1.12:1))}
const xpNeed=lv=>6*lv+4;
const MOVES=[
 {f:'mc',n:'Hurtigsvar',tag:'VÆLG',pow:10,lv:1,en:'choose'},
 {f:'listen',n:'Lytteøre',tag:'LYT',pow:12,lv:1,en:'listen'},
 {f:'order',n:'Sætningsbyg',tag:'BYG',pow:14,lv:6,en:'build'},
 {f:'type',n:'Skriveslag',tag:'SKRIV',pow:18,lv:10,en:'type'}];
const ENEMY_MOVE={ORD:'Ordrod',VERB:'Bøjningsbid',NAVN:'Kønsforvirring',BØJ:'Endelsesfælde',SNAK:'Engelsk-skift',TID:'Halv-syv-snyd'};

/* ================= AUDIO ================= */
let daVoice=null;
function loadVoices(){if(!('speechSynthesis' in window))return;try{const vs=speechSynthesis.getVoices();daVoice=vs.find(v=>/^da([-_]|$)/i.test(v.lang))||null}catch(e){}}
if('speechSynthesis' in window){loadVoices();try{speechSynthesis.onvoiceschanged=loadVoices}catch(e){}}
const plain=t=>String(t).replace(/<[^>]+>/g,'').replace(/[—"«»]/g,' ').replace(/\n/g,'. ');
function speak(t){if(!S.sound||!daVoice)return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(plain(t));u.lang='da-DK';u.voice=daVoice;u.rate=S.slow?.72:.92;speechSynthesis.speak(u)}catch(e){}}
/* Danish number words (for prices) */
function daNum(n){const u=['nul','en','to','tre','fire','fem','seks','syv','otte','ni','ti','elleve','tolv','tretten','fjorten','femten','seksten','sytten','atten','nitten'];
  const t={2:'tyve',3:'tredive',4:'fyrre',5:'halvtreds',6:'tres',7:'halvfjerds',8:'firs',9:'halvfems'};
  const lt=m=>m<20?u[m]:(m%10?(m%10===1?'en':u[m%10])+'og':'')+t[Math.floor(m/10)];
  if(n<100)return lt(n);if(n<1000){const hh=Math.floor(n/100),r=n%100;return(hh===1?'et':u[hh])+' hundrede'+(r?' og '+lt(r):'')}
  const th=Math.floor(n/1000),r=n%1000;return(th===1?'et':lt(th))+' tusind'+(r?(r<100?' og ':' ')+daNum(r):'')}
