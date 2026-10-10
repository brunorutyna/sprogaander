/* ================= WORLD ================= */
const GAME={mode:'title',map:null,busy:false,steps:0,bubble:null,fade:0};
const MAPS={};
const OUT_INDEX={};
OUT.forEach((d,i)=>OUT_INDEX[d.id]=i);
function buildOutdoor(d){
  if(MAPS[d.id])return MAPS[d.id];
  const i=OUT_INDEX[d.id];
  const rows=[d.top===false?EDGE_SHUT:EDGE_OPEN,...wrap(d.rows),d.bottom===false?EDGE_SHUT:EDGE_OPEN];
  rows.forEach((r,k)=>{if(r.length!==20)console.error('row width',d.id,k,r.length,r)});
  const g=rows.map(r=>r.split(''));
  const m={id:d.id,name:d.name,area:d.area,g,w:20,h:rows.length,outdoor:true,def:d,town:!!d.town,lv:d.lv||null,
    prev:i>0?OUT[i-1].id:null,next:i<OUT.length-1?OUT[i+1].id:null,signs:d.signs||{},labels:d.labels||[],doors:[],gates:[],
    npcs:(d.npcs||[]).map(n=>Object.assign({},n,{key:d.id+':'+n.id,ox:0,oy:0}))};
  let k=0;for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++)if(g[y][x]==='D'){m.doors.push(Object.assign({x,y,idx:k},(d.doors||[])[k]||{k:'house',npcs:[]}));k++}
  for(const n of m.npcs){if(n.gate){const need=n.gate;m.gates.push({tiles:[[9,m.h-1],[10,m.h-1]],active:()=>!S.beaten[n.key],run:()=>gateSkifter(n,need)})}}
  if(d.id==='norrebro')m.gates.push({tiles:[[9,m.h-1],[10,m.h-1],[9,13],[10,13]],active:()=>!S.flags.fox,run:leoScene});
  if(d.id==='borgergade'){for(const dr of m.doors)if(dr.k==='final')m.gates.push({tiles:[[dr.x,dr.y]],active:()=>S.badges.length<6,run:async()=>{const v=m.npcs.find(n=>n.id==='vagt');faceTo(v);await say(...v.lines[0],{who:'Vagten'})}})}
  MAPS[d.id]=m;return m;
}
function buildInterior(out,idx){
  const door=out.doors[idx];const id=door.k==='final'?'final':out.id+'#'+idx;
  if(MAPS[id])return MAPS[id];
  const rows=INT[door.k==='final'?'final':door.k];
  const g=rows.map(r=>r.split(''));
  const m={id,name:door.title||({home:'Hjemme',hygge:'Hyggestuen',kiosk:'Kiosken',house:out.name,gym:'Hal '+door.n,final:'Studieskolen'})[door.k],
    area:out.area,g,w:g[0].length,h:g.length,outdoor:false,parent:out.id,door,kind:door.k,signs:{},labels:[],doors:[],gates:[],npcs:[]};
  const add=n=>m.npcs.push(Object.assign({ox:0,oy:0,key:id+':'+(n.id||m.npcs.length)},n));
  if(door.k==='home')add({id:'sofie',x:5,y:3,d:'d',look:'b',name:'Sofie',home:true});
  if(door.k==='hygge'){add({id:'nurse',x:5,y:1,d:'d',look:'nurse',name:'Hygge-Hanne',heal:true});add({id:'guest',x:2,y:4,d:'r',look:['a','d','g','h'][out.area%4],lines:[tip(out.area)]})}
  if(door.k==='kiosk')add({id:'clerk',x:5,y:1,d:'d',look:'clerk',name:'Ekspedienten',shop:true});
  if(door.k==='house')(door.npcs||[]).forEach((n,k)=>add(Object.assign({id:'h'+k},n)));
  if(door.k==='gym'){const G=GYMS[door.n];
    add({id:'leader',x:4,y:2,d:'d',look:G.look,name:'Mester '+G.leader,leader:door.n});
    add({id:'t0',x:3,y:9,d:'r',look:G.tr[0].look,name:G.tr[0].name,trainer:Object.assign({title:'Elev',sight:4},G.tr[0])});
    add({id:'t1',x:6,y:6,d:'l',look:G.tr[1].look,name:G.tr[1].name,trainer:Object.assign({title:'Elev',sight:4},G.tr[1])});}
  if(door.k==='final'){FINAL.ex.forEach((e,k)=>{add({id:'ex'+k,x:e.x,y:e.y,d:e.d,look:e.look,name:e.name,trainer:Object.assign({},e)});
      const key=id+':ex'+k;m.gates.push({tiles:[[4,e.gateY],[5,e.gateY]],active:()=>!S.beaten[key],run:async()=>{const n=m.npcs.find(q=>q.key===key);faceTo(n);await trainerBattle(n)}})});
    add({id:'boss',x:4,y:2,d:'d',look:'leader',name:'Chefen',boss:true,trainer:Object.assign({},FINAL.boss)});}
  for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++)if(g[y][x]==='m'){m.exit=m.exit||{x,y}}
  MAPS[id]=m;return m;
}
function tip(area){const a=Math.min(6,Math.max(1,area));const L=TAVLE[a-1];const t=L[Math.floor(Math.random()*L.length)];return tl('Husk: '+t,'Remember: '+t)}
function mapById(id){
  if(MAPS[id])return MAPS[id];
  if(id==='final')return buildInterior(buildOutdoor(OUT[OUT_INDEX.borgergade]),2);
  const[o,i]=id.split('#');const out=buildOutdoor(OUT[OUT_INDEX[o]]);return i!=null?buildInterior(out,+i):out;
}

/* ---- player + fox ---- */
const P={x:4,y:5,dir:'d',moving:false,t0:0,fx:0,fy:0,lock:0,frame:0,bumpT:0,stepN:0};
const F={x:4,y:5,dir:'d',fx:0,fy:0,on:false,moving:false};
const STEP=170;
const DV={u:[0,-1],d:[0,1],l:[-1,0],r:[1,0]};
const OPP={u:'d',d:'u',l:'r',r:'l'};
function tileAt(m,x,y){if(x<0||y<0||x>=m.w||y>=m.h)return null;return m.g[y][x]}
function npcVisible(n){if(n.id==='kim1'||n.id==='leo')return !!n._show;if(n.hidden)return false;if(n.gate&&S.beaten[n.key])return false;return true}
function npcAt(m,x,y){return m.npcs.find(n=>npcVisible(n)&&n.x===x&&n.y===y)}
function blocked(m,x,y){const t=tileAt(m,x,y);if(t==null)return true;if(SOLID.has(t))return true;if(npcAt(m,x,y))return true;return false}

function gotoMap(id,x,y,dir,opt={}){
  const m=mapById(id);GAME.map=m;P.x=x;P.y=y;P.dir=dir||P.dir;P.moving=false;P.fx=P.fy=0;
  S.map=id;S.x=x;S.y=y;S.dir=P.dir;
  const[bx,by]=DV[OPP[P.dir]];const fx=x+bx,fy=y+by;
  if(!blocked(m,fx,fy)&&tileAt(m,fx,fy)!=='m'){F.x=fx;F.y=fy}else{F.x=x;F.y=y}F.dir=P.dir;F.fx=F.fy=0;F.moving=false;F.on=!!S.flags.fox;
  if(!opt.nofade)GAME.fade=performance.now();
  if(m.outdoor&&!opt.quiet)showPlace(m);
  save();
}
let placeT=0;function showPlace(m){const e=$('#place');e.innerHTML='';const w=weatherLine(m);
  e.append(h('b',null,m.name),h('small',null,'Klokken er '+klokkenDa()+(w?' · '+w[0]:'')));
  e.title=(w?w[1]:'');e.hidden=false;clearTimeout(placeT);placeT=setTimeout(()=>e.hidden=true,3200)}

function canAct(){return GAME.mode==='world'&&!GAME.busy&&!topModal()&&!sheetOpen()}
async function busy(fn){GAME.busy=true;try{await fn()}catch(e){console.error(e)}finally{GAME.busy=false}}

function worldPress(k){
  if(GAME.mode==='title'){titlePress(k);return}
  if(!canAct())return;
  if(k==='a')busy(interact);
  else if(k==='start')busy(startMenu);
  else if(k==='select'&&S.flags.fox)busy(foxTalk);
}
function setStepPos(t){const[dx,dy]=DV[P.dir];P.fx=-dx*(1-t);P.fy=-dy*(1-t);if(F.moving){const fd=DV[F.dir];F.fx=-fd[0]*(1-t);F.fy=-fd[1]*(1-t)}P.frame=t>.2&&t<.75?(P.stepN%2?1:2):0}
function updateWorld(now){
  if(GAME.mode!=='world')return;
  if(P.moving){const t=(now-P.t0)/STEP;
    if(t>=1){const carry=Math.min(STEP*.5,now-(P.t0+STEP));P.moving=false;F.moving=false;P.fx=P.fy=0;F.fx=F.fy=0;P.frame=0;
      const ev=stepDone();
      if(!ev&&canAct()){const d=curHeld();if(d&&d===P.dir){tryMove(d,now-carry);if(P.moving)setStepPos((now-P.t0)/STEP)}}}
    else setStepPos(t)}
  if(!P.moving&&canAct()){const d=curHeld();if(d){if(P.dir!==d){P.dir=d;P.lock=now+80}else if(now>=P.lock)tryMove(d,now)}}
}
function tryMove(d,now){
  let m=GAME.map;const[dx,dy]=DV[d];let nx=P.x+dx,ny=P.y+dy;
  if(m.outdoor&&(ny<0||ny>=m.h)){const to=ny<0?m.prev:m.next;if(!to)return;
    const tm=mapById(to);const oldY=P.y;GAME.map=tm;
    const newOld=ny<0?tm.h:-1;P.y=newOld;nx=P.x;ny=ny<0?tm.h-1:0;
    if(F.on){F.dir=d;F.x=P.x;F.y=newOld;F.moving=true}
    P.dir=d;P.x=nx;P.y=ny;P.moving=true;P.t0=now;P.stepN++;S.map=tm.id;S.x=nx;S.y=ny;showPlace(tm);save();return}
  const gate=m.gates.find(g=>g.active()&&g.tiles.some(([gx,gy])=>gx===nx&&gy===ny));
  if(gate){busy(gate.run);return}
  if(blocked(m,nx,ny)){if(now-P.bumpT>350){sfx('bump');P.bumpT=now}return}
  if(F.on){F.dir=(F.x===P.x&&F.y===P.y)?d:dirTo(F.x,F.y,P.x,P.y);F.x=P.x;F.y=P.y;F.moving=true}
  const prevT=tileAt(m,P.x,P.y);
  if(prevT===':'||prevT==='=')addP({t:'dust',x:P.x*16+8-dx*3,y:P.y*16+14,vx:-dx*8,vy:-4,life:.35});
  P.x=nx;P.y=ny;P.moving=true;P.t0=now;P.stepN++;
}
function dirTo(ax,ay,bx,by){return bx>ax?'r':bx<ax?'l':by>ay?'d':'u'}
function stepDone(){
  const m=GAME.map;GAME.steps++;S.x=P.x;S.y=P.y;S.dir=P.dir;if(GAME.steps%25===0)save();
  const t=tileAt(m,P.x,P.y);
  if(t===','){for(let k=0;k<4;k++)addP({t:'rustle',x:P.x*16+4+Math.random()*8,y:P.y*16+6,vx:(Math.random()-.5)*30,vy:-20-Math.random()*20,g:120,life:.4})}
  if(t==='D'){const dr=m.doors.find(q=>q.x===P.x&&q.y===P.y);if(dr){sfx('door');const im=buildInterior(m,dr.idx);gotoMap(im.id,im.exit.x,im.exit.y-1,'u',{quiet:true});return true}}
  if(t==='m'&&!m.outdoor){const out=mapById(m.parent);const dr=m.door;sfx('door');gotoMap(out.id,dr.x,dr.y+1,'d');return true}
  for(const n of m.npcs){if(!n.trainer||!n.trainer.sight||!npcVisible(n)||S.beaten[n.key])continue;
    const[dx,dy]=DV[n.d];for(let s=1;s<=n.trainer.sight;s++){const x=n.x+dx*s,y=n.y+dy*s;if(x===P.x&&y===P.y){busy(()=>spotted(n));return true}if(blocked(m,x,y))break}}
  if(t===','&&m.lv&&S.flags.fox&&Math.random()<.085){busy(wildEncounter);return true}
  return false;
}
async function spotted(n){
  GAME.bubble={n,t:performance.now()};sfx('enc');await wait(650);GAME.bubble=null;
  const m=GAME.map;const[dx,dy]=DV[n.d];
  while(Math.abs(n.x-P.x)+Math.abs(n.y-P.y)>1){await walkNpc(n,dx,dy)}
  P.dir=OPP[n.d];
  await trainerBattle(n);
}
function walkNpc(n,dx,dy){return new Promise(r=>{const t0=performance.now();n.x+=dx;n.y+=dy;n.walk=1;
  const f=()=>{const t=(performance.now()-t0)/STEP;if(t>=1){n.ox=n.oy=0;n.walk=0;r();return}n.ox=-dx*(1-t);n.oy=-dy*(1-t);n.frame=t>.2&&t<.75?(n.x+n.y)%2?1:2:0;requestAnimationFrame(f)};f()})}
function faceTo(n){if(!n)return;n.d=dirTo(n.x,n.y,P.x,P.y)}

/* ---- interaction ---- */
async function interact(){
  const m=GAME.map;const[dx,dy]=DV[P.dir];let x=P.x+dx,y=P.y+dy;
  let n=npcAt(m,x,y);const t=tileAt(m,x,y);
  if(!n&&t==='K')n=npcAt(m,x+dx,y+dy);
  if(n){faceTo(n);return talkTo(n)}
  if(F.on&&F.x===x&&F.y===y)return foxTalk();
  const sg=m.signs[x+','+y];if(sg&&t==='S')return say(...sg);
  if(sg)return say(...sg);
  if(t==='C')return boxPC();
  if(t==='t'&&m.kind==='gym')return gymBoard(m.door.n);
  if(t==='t'&&m.kind==='final')return say('Tavlen: "Prøven har tre dele: lytning, grammatik og samtale. Til sidst: Chefen."','The board: "The Exam has three parts: listening, grammar and conversation. Finally: the Boss."');
  if(t==='t')return say('Der står "Jeg har boet i Danmark i to år" på tavlen.','The board says "I have lived in Denmark for two years".');
  if(t==='I'&&m.kind==='gym')return say(`Mester ${GYMS[m.door.n].leader}s hal. Vindere: {N}?`,`Master ${GYMS[m.door.n].leader}'s hall. Winners: {N}?`);
  if(t==='h')return say('Hylden er fuld af bøger på dansk. "Danske verber for begyndere" …','The shelf is full of Danish books. "Danish verbs for beginners"…');
  if(t==='Y'&&m.kind==='home')return say('Din seng. Den er ikke redt.','Your bed. It isn\'t made.');
}
async function talkTo(n){
  const who=n.name||(n.trainer?(n.trainer.title+' '+n.trainer.name):null);
  if(n.home)return homeRest(n);
  if(n.heal)return nurse(n);
  if(n.shop)return shop();
  if(n.leader)return leaderTalk(n);
  if(n.boss){if(S.beaten[n.key])return say('Vi fortsætter på dansk. Det er en aftale.','We\'ll continue in Danish. It\'s a deal.',{who:'Chefen'});return trainerBattle(n)}
  if(n.trainer){if(!S.beaten[n.key]){if(n.gate)return gateSkifter(n,n.gate);return trainerBattle(n)}return say(...(n.trainer.after||n.trainer.lose),{who})}
  if(n.quiz)return quizNpc(n);
  if(n.gift&&!S.flags[n.gift.flag]){await talk(n.lines,who);S.flags[n.gift.flag]=true;S.bag[n.gift.item]+=n.gift.n;sfx('heal');save();return say(`Du fik ${n.gift.n} ${itemName(n.gift.item,n.gift.n)}!`,`You got ${n.gift.n} × ${ITEMS[n.gift.item].en}!`)}
  if(n.lines)return talk(n.lines,who);
}
async function homeRest(n){
  if(!S.flags.fox)return say('Godmorgen, {N}! Lone var her. Hun venter på dig nede på gaden.','Good morning, {N}! Leo was here. He\'s waiting for you down on the street.',{who:'Sofie'});
  const r=await ask('Du ser træt ud, {N}. Skal I hvile jer lidt?','You look tired, {N}. Do you want to rest a bit?',undefined,'Sofie');
  if(r){healAll();sfx('heal');await say('Så. Nu er I friske igen. Hyg jer derude!','There. Now you\'re all fresh again. Have fun out there!',{who:'Sofie'})}
}
function healAll(){for(const s of S.party)s.hp=maxHp(s);save()}
async function nurse(n){
  const r=await ask('Velkommen til Hyggestuen! Skal jeg passe på dine sprogånder?','Welcome to the Hyggestue! Shall I look after your language spirits?',undefined,'Hygge-Hanne');
  if(!r)return say('Okay. Hyg dig derude!','Okay. Have a nice time out there!',{who:'Hygge-Hanne'});
  await say('Et øjeblik …','One moment…',{who:'Hygge-Hanne'});healAll();sfx('heal');
  const out=mapById(GAME.map.parent);S.heal={map:out.id,x:GAME.map.door.x,y:GAME.map.door.y+1};save();
  await say('Så! Dine ånder er friske igen. Kom snart igen!','There! Your spirits are fresh again. Come again soon!',{who:'Hygge-Hanne'});
}
async function quizNpc(n){
  const who=n.name||'Spørgelysten';
  if(n.lines)await talk(n.lines,who);
  const key='quiz:'+n.key;
  if(S.flags[key]===today())return say('Tak for i dag! Kom tilbage i morgen, så har jeg et nyt spørgsmål.','Thanks for today! Come back tomorrow and I\'ll have a new question.',{who});
  const ok=await ask('Må jeg stille dig et spørgsmål? Svarer du rigtigt, får du hundrede kroner.','May I ask you a question? If you answer correctly, you get a hundred kroner.',undefined,who);
  if(!ok)return say('Okay. En anden gang!','Okay. Another time!',{who});
  const area=GAME.map.area;
  const topics=n.topic?[n.topic]:Object.keys(TOPICS).filter(t=>TOPICS[t][1]<=area);
  const pool=BANK.filter(i=>topics.includes(i.topic)&&(i.npc||n.topic));
  const it=pool.length?pool[Math.floor(Math.random()*pool.length)]:pickItem(topics);
  const r=await challenge(it,{who,sub:'Spørgsmål på gaden',sprite:SPR[n.look]?.d[0]});
  S.flags[key]=today();
  if(r.ok){S.money+=100;sfx('heal');save();return say('Rigtigt! Her er hundrede kroner.','Correct! Here are a hundred kroner.',{who})}
  save();return say('Ikke helt. Men det var et godt forsøg! Kom igen i morgen.','Not quite. But it was a good try! Come back tomorrow.',{who});
}
async function gateSkifter(n,need){
  faceTo(n);
  if(S.badges.length<need){const G=GYMS[need];return say(`Sorry, we only speak English here! Øh … du skal have Mester ${G.leader}s mærke, før du kan komme forbi.`,`Sorry, we only speak English here! Uh… you need Master ${G.leader}'s badge before you can get past.`,{who:'Skifterbanden'})}
  return trainerBattle(n);
}

/* ---- story: Leo + fox + Kim ---- */
async function leoScene(){
  const m=GAME.map;const leo=m.npcs.find(n=>n.id==='leo');
  await say('Vent, {N}! Stop!','Wait, {N}! Stop!',{who:'Lone'});
  leo._show=true;leo.x=P.x;leo.y=P.y+2;leo.d='u';await walkNpc(leo,0,-1);P.dir='d';
  await talk([tl('Der bor vilde sprogånder i det høje græs. Du må ikke gå derud alene!','Wild language spirits live in the tall grass. You can\'t go out there alone!')],'Lone');
  F.x=P.x+(P.x===9?-1:1);F.y=P.y;F.dir=P.x===9?'r':'l';F.on=true;sfx('enc');GAME.heart=performance.now();
  await talk([tl('Hov! Hvad er det? En Hyggeræv! Den kan lide dig.','Whoa! What\'s that? A Hyggeræv! It likes you.'),
    tl('Hyggeræven er ordstillingens ånd. Den ved altid, hvor verbet skal stå: på plads nummer to!','The Hyggeræv is the spirit of word order. It always knows where the verb goes: in position two!'),
    tl('Den vil ikke ind i en sprogkugle. Den vil gå ved siden af dig.','It won\'t go into a language ball. It wants to walk beside you.')],'Lone');
  S.flags.fox=true;S.party=[newSpirit('ræv',5)];S.seen.ræv=1;S.caught.ræv=1;S.bag.kugle+=5;
  await talk([tl('Tag også Åndebogen og fem sprogkugler. Fang ånderne, og lær dansk!','Take the Åndebog and five language balls too. Catch the spirits, and learn Danish!')],'Lone');
  sfx('badge');await say('Du fik Åndebogen og fem sprogkugler!','You got the Åndebog and five language balls!');
  await talk([tl('Her i København er der seks mestre. Når du har alle seks mærker, kan du tage Prøven på Studieskolen i Borgergade.','There are six masters here in Copenhagen. When you have all six badges, you can take the Exam at Studieskolen in Borgergade.'),
    tl('Tryk på SELECT for at tale med ræven. Den giver gode råd. Held og lykke!','Press SELECT to talk to the fox. It gives good advice. Good luck!')],'Lone');
  await walkNpc(leo,0,1);leo._show=false;
  const kim=m.npcs.find(n=>n.id==='kim1');kim._show=true;kim.x=P.x===9?10:9;kim.y=P.y+2;kim.d='u';
  await walkNpc(kim,0,-1);kim.x=kim.x;P.dir=dirTo(P.x,P.y,kim.x,kim.y);
  await trainerBattle(kim);
  kim._show=false;S.flags.kim1=true;F.on=true;save();
}

/* ---- fox ---- */
async function foxTalk(){
  if(!S.flags.fox)return;
  GAME.heart=performance.now();
  const g=S.flags.champion?tl('Du bestod Prøven! Nu kan du fange alle ånderne i Åndebogen.','You passed the Exam! Now you can catch all the spirits in the Åndebog.'):FOX_GOAL[Math.min(6,S.badges.length)];
  const n=dayN();
  const mood=n>=GOAL?tl(`Ræven er glad! I dag har du svaret rigtigt ${n} gange. Dagens mål er nået.`,`The fox is happy! You've answered correctly ${n} times today. Today's goal is reached.`):tl(`Ræven kigger på dig. I dag: ${n} af ${GOAL} rigtige svar.`,`The fox looks at you. Today: ${n} of ${GOAL} correct answers.`);
  await say(...mood,{who:'Hyggeræven'});
  await say(...g,{who:'Hyggeræven'});
  const wk=weakItems();
  if(wk.length>=3){const r=await ask(`Ræven har fundet ${wk.length} svære spørgsmål. Vil du øve dem nu?`,`The fox has found ${wk.length} tricky questions. Do you want to practise them now?`,undefined,'Hyggeræven');if(r)return practice(wk.slice(0,6),'Svære spørgsmål')}
  else await say(...tip(GAME.map.area),{who:'Hyggeræven'});
}

/* ---- wild encounters ---- */
function wildPick(m){
  const area=m.area;
  let topics=Object.keys(TOPICS).filter(t=>area>=7||TOPICS[t][1]===area);
  if(area<7&&area>1&&Math.random()<.22){const old=Object.keys(TOPICS).filter(t=>TOPICS[t][1]<area);
    const w=old.map(t=>1.2-mastery(t));let r=Math.random()*w.reduce((a,b)=>a+b,0);for(let k=0;k<old.length;k++){r-=w[k];if(r<=0){topics=[old[k]];break}}}
  const t=topics[Math.floor(Math.random()*topics.length)];
  const lv=m.lv[0]+Math.floor(Math.random()*(m.lv[1]-m.lv[0]+1));
  const evolved=lv>=SP[t+'1'].evoLv&&Math.random()<.35;
  return {sp:t+(evolved?'2':'1'),lv};
}
async function wildEncounter(){
  const{sp,lv}=wildPick(GAME.map);
  const foe=newFoe(sp,lv,'wild');
  await runBattle({kind:'wild',foes:[foe]});
}
function newFoe(sp,lv,kind){const s={uid:0,sp,lv,xp:0};s.max=Math.floor(maxHp(s)*(kind==='wild'?.85:kind==='leader'?1.15:1));s.hp=s.max;return s}
async function trainerBattle(n){
  const T=n.trainer;const who=(T.title?T.title+' ':'')+T.name;
  await say(...T.intro,{who});
  const strong=n.boss||/^ex/.test(n.id);
  const res=await runBattle({kind:'trainer',trainer:T,who,look:n.look,leader:strong,foes:T.team.map(([sp,lv])=>newFoe(sp,lv,strong?'leader':'trainer')),tutorial:T.tutorial});
  if(res==='win'){S.beaten[n.key]=true;save();if(n.boss)await ending()}
  return res;
}
async function leaderTalk(n){
  const G=GYMS[n.leader];const who='Mester '+G.leader;
  if(S.badges.includes(n.leader))return say('Har du læst tavlen? Den hjælper dig på vejen.','Have you read the board? It will help you on your way.',{who});
  await say(...G.intro,{who});
  const res=await runBattle({kind:'trainer',trainer:{name:G.leader,title:'Mester',lose:G.win,prize:G.team[G.team.length-1][1]*60},who,look:n.look,leader:true,noEvo:true,foes:G.team.map(([sp,lv])=>newFoe(sp,lv,'leader'))});
  if(res!=='win')return;
  S.badges.push(n.leader);S.badges.sort();sfx('badge');
  const gifts=[null,['ordbog',3],['smorrebrod',2],['superkugle',3],['ordbog',3],['smorrebrod',3],['superkugle',5]][n.leader];
  S.bag[gifts[0]]+=gifts[1];save();
  await say(`Du fik ${G.badge}!`,`You got the ${G.badge}!`);
  await say(`${G.leader} giver dig også ${gifts[1]} ${itemName(gifts[0],gifts[1])}.`,`${G.leader} also gives you ${gifts[1]} × ${ITEMS[gifts[0]].en}.`,{who});
  await gymBoard(n.leader);
  await evolutions();
}
function gymBoard(n){
  if(!S.badges.includes(n))return say('Tavlen er tom. Vind mærket, så skriver mesteren på den.','The board is empty. Win the badge and the master will write on it.');
  return panel('Tavlen · '+GYMS[n].badge,(b)=>{b.append(h('p',{class:'lede'},`Mester ${GYMS[n].leader} skrev det her på tavlen til dig. Du kan altid finde det igen under TAVLER i menuen.`),
    h('div',{class:'tavle'},h('ul',null,...TAVLE[n-1].map(t=>h('li',{html:t})))))},'board');
}
async function ending(){
  await talk([tl('Tillykke, {N}! Du har bestået Prøven!','Congratulations, {N}! You have passed the Exam!'),
    tl('Men husk: dansk lærer man hele livet. Fang alle ånderne i Åndebogen, og øv dig lidt hver dag.','But remember: you learn Danish your whole life. Catch all the spirits in the Åndebog, and practise a little every day.')],'Lone');
  S.flags.champion=true;sfx('badge');save();
  await say('SLUT · tak fordi du spillede. Spillet fortsætter: der er stadig ånder at fange.','THE END · thanks for playing. The game continues: there are still spirits to catch.');
}

/* ---- whiteout ---- */
async function whiteout(){
  S.money=Math.floor(S.money/2);healAll();const hl=S.heal;
  GAME.mode='world';gotoMap(hl.map,hl.x,hl.y,'d');
  await say('Du løb tilbage for at hvile dig. Du mistede halvdelen af dine penge.','You hurried back to rest. You lost half of your money.');
}
