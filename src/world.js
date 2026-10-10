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
  if(d.id==='norrebro')m.gates.push({tiles:[[9,m.h-1],[10,m.h-1],[9,13],[10,13]],active:()=>!S.flags.fox,run:prologue});
  if(d.id==='borgergade'){for(const dr of m.doors)if(dr.k==='final')m.gates.push({tiles:[[dr.x,dr.y]],active:()=>S.badges.length<6,run:async()=>{const v=m.npcs.find(n=>n.id==='vagt');faceTo(v);await say(...v.lines[0],{who:'Vagten'})}})}
  MAPS[d.id]=m;return m;
}
function buildInterior(out,idx){
  const door=out.doors[idx];const id=door.k==='final'?'final':out.id+'#'+idx;
  if(MAPS[id])return MAPS[id];
  const rows=INT[door.k==='final'?'final':door.k];
  const g=rows.map(r=>r.split(''));
  const m={id,name:door.title||({home:'Fremlejen',hygge:'Bodegaen',kiosk:'Kiosken',house:out.name,gym:door.n?GYMS[door.n].venue:'',final:'Sprogskolen Ø'})[door.k],
    area:out.area,g,w:g[0].length,h:g.length,outdoor:false,parent:out.id,door,kind:door.k,signs:{},labels:[],doors:[],gates:[],npcs:[]};
  const add=n=>m.npcs.push(Object.assign({ox:0,oy:0,key:id+':'+(n.id||m.npcs.length)},n));
  if(door.k==='home')add({id:'sofie',x:5,y:3,d:'d',look:'sofie',name:'Sofie',home:true});
  if(door.k==='hygge'){add({id:'nurse',x:5,y:1,d:'d',look:'nurse',name:'Jette',heal:true});add({id:'guest',x:2,y:4,d:'r',look:['a','d','g','h'][out.area%4],lines:[tip(out.area)]})}
  if(door.k==='kiosk')add({id:'clerk',x:5,y:1,d:'d',look:'clerk',name:'Ekspedienten',shop:true});
  if(door.k==='house')(door.npcs||[]).forEach((n,k)=>add(Object.assign({id:'h'+k},n)));
  if(door.k==='gym'){const G=GYMS[door.n];
    add({id:'leader',x:4,y:2,d:'d',look:G.look,name:G.title+' '+G.leader,leader:door.n});const tt=['','Quizdeltager','Kunde','Gæst','Borger','Stamgæst','Single'][door.n];
    add({id:'t0',x:3,y:9,d:'r',look:G.tr[0].look,name:G.tr[0].name,trainer:Object.assign({title:tt,sight:4},G.tr[0])});
    add({id:'t1',x:6,y:6,d:'l',look:G.tr[1].look,name:G.tr[1].name,trainer:Object.assign({title:tt,sight:4},G.tr[1])});}
  if(door.k==='final'){FINAL.ex.forEach((e,k)=>{add({id:'ex'+k,x:e.x,y:e.y,d:e.d,look:e.look,name:e.name,trainer:Object.assign({},e)});
      const key=id+':ex'+k;m.gates.push({tiles:[[4,e.gateY],[5,e.gateY]],active:()=>!S.beaten[key],run:async()=>{const n=m.npcs.find(q=>q.key===key);faceTo(n);await trainerBattle(n)}})});
    add({id:'boss',x:4,y:2,d:'d',look:'magnus',name:'Magnus',boss:true,trainer:Object.assign({},FINAL.boss)});}
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
const P={x:4,y:5,dir:'d',moving:false,t0:0,fx:0,fy:0,lock:0,frame:0,bumpT:0,stepN:0,walkP:0};
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
function setStepPos(t){const[dx,dy]=DV[P.dir];P.fx=-dx*(1-t);P.fy=-dy*(1-t);if(F.moving){const fd=DV[F.dir];F.fx=-fd[0]*(1-t);F.fy=-fd[1]*(1-t)}P.walkP=(P.stepN%2)*.5+t*.5}
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
  const f=()=>{const t=(performance.now()-t0)/STEP;if(t>=1){n.ox=n.oy=0;n.walk=0;r();return}n.ox=-dx*(1-t);n.oy=-dy*(1-t);n.walkP=((n.x+n.y)%2)*.5+t*.5;requestAnimationFrame(f)};f()})}
function faceTo(n){if(!n)return;n.d=dirTo(n.x,n.y,P.x,P.y)}

/* ---- interaction ---- */
async function interact(){
  const m=GAME.map;const[dx,dy]=DV[P.dir];let x=P.x+dx,y=P.y+dy;
  let n=npcAt(m,x,y);const t=tileAt(m,x,y);
  if(!n&&t==='K')n=npcAt(m,x+dx,y+dy);
  if(n){faceTo(n);return talkTo(n)}
  if(F.on&&F.x===x&&F.y===y)return foxTalk();
  const sg=m.signs[x+','+y];if(sg)return say(...sg);
  if(t==='C')return boxPC();
  if(t==='t'&&m.kind==='gym')return gymBoard(m.door.n);
  if(t==='t'&&m.kind==='final')return say('Tavlen: "Prøven. Del 1: lytning. Del 2: grammatik. Del 3: samtale. Mobiltelefoner og ræve skal være slukket."','The board: "The Exam. Part 1: listening. Part 2: grammar. Part 3: conversation. Phones and foxes must be switched off."');
  if(t==='t')return say('Der står "Jeg har boet i Danmark i to år" på tavlen. Nogen har skrevet "desværre" under.','The board says "I have lived in Denmark for two years". Someone has written "unfortunately" underneath.');
  if(t==='I'&&m.kind==='gym')return say(`${GYMS[m.door.n].venue}. Pokalen er af plastik. Ingen har sagt det til ${GYMS[m.door.n].leader}.`,`${GYMS[m.door.n].venue}. The trophy is plastic. Nobody has told ${GYMS[m.door.n].leader}.`);
  if(t==='h')return say('Hylden er fuld af bøger. "Dansk grammatik for begyndere". "Dansk grammatik for fortvivlede".','The shelf is full of books. "Danish grammar for beginners". "Danish grammar for the desperate".');
  if(t==='Y'&&m.kind==='home')return say('Din seng. Den er ikke redt. Den er heller ikke din. Det er fremleje.','Your bed. It isn\'t made. It also isn\'t yours. It\'s a sublet.');
  if(t==='n')return say('Et bord med et stearinlys. Selvfølgelig.','A table with a candle. Of course.');
}
async function talkTo(n){
  const who=n.name||(n.trainer?((n.trainer.title?n.trainer.title+' ':'')+n.trainer.name):null);
  if(n.kurt)return kurtTalk(n);
  if(n.home)return homeRest(n);
  if(n.heal)return bodega(n);
  if(n.shop)return shop();
  if(n.leader)return leaderTalk(n);
  if(n.boss){if(S.beaten[n.key])return say('Vi tager det på dansk. Det er aftalt. Jeg hader det.','We\'ll do it in Danish. It\'s agreed. I hate it.',{who:'Magnus'});return bossBattle(n)}
  if(n.trainer){if(!S.beaten[n.key]){if(n.gate)return gateSkifter(n,n.gate);return trainerBattle(n)}return say(...(n.trainer.after||n.trainer.lose),{who})}
  if(n.quiz)return quizNpc(n);
  if(n.gift&&!S.flags[n.gift.flag]){await talk(n.lines,who);S.flags[n.gift.flag]=true;S.bag[n.gift.item]+=n.gift.n;sfx('heal');save();return say(`Du fik ${n.gift.n} ${itemName(n.gift.item,n.gift.n)}.`,`You got ${n.gift.n} × ${ITEMS[n.gift.item].en}.`)}
  if(n.lines)return talk(n.lines,who);
}
async function homeRest(n){
  if(!S.flags.fox)return talk([tl('Huslejen skal betales den første. Og du må ikke bruge min havremælk.','Rent is due on the first. And you may not use my oat milk.'),tl('Gå en tur. Du ser bleg ud. Alle udlændinge ser blege ud i oktober.','Go for a walk. You look pale. All foreigners look pale in October.')],'Sofie');
  const r=await ask('Du ser træt ud. Vil du sove lidt? Det er gratis. Det eneste, der er gratis her.','You look tired. Do you want to sleep a bit? It\'s free. The only free thing here.',undefined,'Sofie');
  if(r){healAll();sfx('heal');await say('Godmorgen. Du snorkede på dansk. Det er fremskridt.','Good morning. You snored in Danish. That\'s progress.',{who:'Sofie'})}
}
function healAll(){for(const s of S.party)s.hp=maxHp(s);save()}
async function bodega(n){
  const r=await ask('Velkommen på bodegaen. Skal dine ånder have en kop kaffe og en lille en?','Welcome to the bodega. Do your spirits need a cup of coffee and a little something?',undefined,'Jette');
  if(!r)return say('Nå. Du ved, hvor jeg er. Jeg er her altid.','Well. You know where I am. I\'m always here.',{who:'Jette'});
  await say('Kaffe. Rugbrød. Lidt snaps til de store.','Coffee. Rye bread. A bit of snaps for the big ones.',{who:'Jette'});healAll();sfx('heal');
  const out=mapById(GAME.map.parent);S.heal={map:out.id,x:GAME.map.door.x,y:GAME.map.door.y+1};save();
  await say('Så. De er friske igen. Det bliver ingenting. Det er på huset.','There. They\'re fresh again. That\'ll be nothing. It\'s on the house.',{who:'Jette'});
}
async function quizNpc(n){
  const who=n.name||'Quiz-nørden';
  const key='quiz:'+n.key;
  if(S.flags[key]===today())return say('Ét spørgsmål om dagen. Jeg har også et liv. Ikke et stort et.','One question a day. I have a life too. Not a big one.',{who});
  const ok=await ask('Hej. Jeg samler på rigtige svar. Svarer du rigtigt, får du hundrede kroner. Skal vi?','Hi. I collect correct answers. Answer correctly and you get a hundred kroner. Shall we?',undefined,who);
  if(!ok)return say('Okay. Jeg står her. Jeg står altid her.','Okay. I\'ll be here. I\'m always here.',{who});
  const area=GAME.map.area;
  const topics=n.topic?[n.topic]:Object.keys(TOPICS).filter(t=>TOPICS[t][1]<=area);
  const pool=BANK.filter(i=>topics.includes(i.topic)&&(i.npc||n.topic));
  const it=pool.length?pool[Math.floor(Math.random()*pool.length)]:pickItem(topics);
  const r=await challenge(it,{who,sub:'Et spørgsmål på gaden',look:n.look});
  S.flags[key]=today();
  if(r.ok){S.money+=100;sfx('heal');save();return say('Rigtigt. Her er hundrede kroner. Brug dem ikke i Nyhavn.','Correct. Here\'s a hundred kroner. Don\'t spend them in Nyhavn.',{who})}
  save();return say('Forkert. Men med selvtillid. Det tæller også. Ikke for penge, men.','Wrong. But with confidence. That counts too. Not for money, but.',{who});
}
async function gateSkifter(n,need){
  faceTo(n);
  if(S.badges.length<need){const G=GYMS[need];return say(`Sorry! Vejen er lukket. Du skal have ${G.badge} fra ${G.venue} først. Det er ikke mig, det er policy.`,`Sorry! The road is closed. You need ${G.badge} from ${G.venue} first. It's not me, it's policy.`,{who:'Skift-konsulenten'})}
  return trainerBattle(n);
}

/* ---- prologue ---- */
async function kurtTalk(n){
  if(S.flags.fox)return say('Vil du have en kombucha mere? … Nej? Klogt. Meget klogt.','Want another kombucha? … No? Wise. Very wise.',{who:'Kombucha-Kurt'});
  return prologue();
}
async function prologue(){
  const m=GAME.map;const kurt=m.npcs.find(n=>n.id==='kurt');faceTo(kurt);P.dir=dirTo(P.x,P.y,kurt.x,kurt.y);
  await talk([tl('Hej, ven! Du er ny her, ikke? Det kan man se. Du venter for grønt lys.','Hey, friend! You\'re new here, right? You can tell. You wait for the green light.'),
    tl('Vil du smage min kombucha? Den er hjemmelavet. Ingefær, citron og nogle svampe fra Dyrehaven. Helt naturligt.','Want to taste my kombucha? It\'s homemade. Ginger, lemon and some mushrooms from Dyrehaven. All natural.')],'Kombucha-Kurt');
  const yes=await ask('Tager du en flaske?','Will you take a bottle?',[['Ja tak',true],['Nej tak',false]]);
  if(!yes)await say('Den er gratis.','It\'s free.',{who:'Kombucha-Kurt'});
  await say(yes?'Du drikker. Den smager af kælder.':'Gratis er gratis. Du drikker. Den smager af kælder.',yes?'You drink. It tastes of basement.':'Free is free. You drink. It tastes of basement.');
  GAME.trip=performance.now();sfx('evo');await wait(1800);
  F.x=P.x+(P.x===9?-1:1);F.y=P.y;F.dir=P.x===9?'r':'l';F.on=true;GAME.heart=performance.now();
  await talk([tl('Hej. Bliv rolig. Jeg er en ræv, og jeg taler dansk. Det er ikke det mærkeligste, du kommer til at se i dag.','Hi. Stay calm. I\'m a fox and I speak Danish. It\'s not the strangest thing you\'ll see today.'),
    tl('Jeg er en sprogånd. Vi bor i sproget. Nu kan du se os. Tillykke. Eller undskyld.','I\'m a language spirit. We live in the language. Now you can see us. Congratulations. Or sorry.')],'Ræven');
  await say('Wow. Den var stærkere end sidste gang. Hav en god dag!','Wow. That was stronger than last time. Have a nice day!',{who:'Kombucha-Kurt'});
  kurt.hidden=true;
  const lone=m.npcs.find(n=>n.id==='leo');lone._show=true;lone.x=P.x;lone.y=P.y+2;lone.d='u';await walkNpc(lone,0,-1);P.dir='d';
  await talk([tl('Nå. Du kan også se dem.','Well. You can see them too.'),
    tl('Jeg hedder Lone. Jeg underviser i dansk på Sprogskolen Ø. Jeg har set ånder siden 1974. Lang historie.','I\'m Lone. I teach Danish at Sprogskolen Ø. I\'ve seen spirits since 1974. Long story.'),
    tl('Hver ånd er en del af dansk: et ord, en regel, en dårlig vane. Når du forstår en ånd, kan du fange den.','Each spirit is a piece of Danish: a word, a rule, a bad habit. When you understand a spirit, you can catch it.'),
    tl('Men ånderne er svage i år. Hver gang en dansker skifter til engelsk, bliver de lidt mindre. Og danskerne skifter meget.','But the spirits are weak this year. Every time a Dane switches to English, they get a bit smaller. And Danes switch a lot.'),
    tl('Tag de her lavalamper. Ånder elsker lavalamper. Og tag Åndebogen. Skriv alt ned.','Take these lava lamps. Spirits love lava lamps. And take the Åndebog. Write everything down.')],'Lone');
  S.flags.fox=true;S.party=[newSpirit('ræv',5)];S.seen.ræv=1;S.caught.ræv=1;S.bag.kugle+=5;
  sfx('badge');await say('Du fik Åndebogen og fem lavalamper.','You got the Åndebog and five lava lamps.');
  await talk([tl('Prøven er om seks uger. Indtil da: Gå til Quizbaren i Østerbro. Henning er den bedste lærer i byen. Han ved det bare ikke.','The Exam is in six weeks. Until then: go to Quizbaren in Østerbro. Henning is the best teacher in town. He just doesn\'t know it.')],'Lone');
  await walkNpc(lone,0,1);lone._show=false;
  await say('Jeg følger med dig. Tryk på RÆV, hvis du vil tale med mig. Jeg har mange meninger.','I\'m coming with you. Press FOX if you want to talk to me. I have many opinions.',{who:'Ræven'});
  const kim=m.npcs.find(n=>n.id==='kim1');kim._show=true;kim.x=P.x===9?10:9;kim.y=P.y+2;kim.d='u';
  await walkNpc(kim,0,-1);P.dir=dirTo(P.x,P.y,kim.x,kim.y);
  await trainerBattle(kim);
  kim._show=false;S.flags.kim1=true;F.on=true;save();
}

/* ---- fox ---- */
async function foxTalk(){
  if(!S.flags.fox)return;
  GAME.heart=performance.now();
  const g=S.flags.champion?tl('Du bestod. Ånderne er tilbage. Jeg tager en lur. Fang resten af Åndebogen, hvis du keder dig.','You passed. The spirits are back. I\'m taking a nap. Catch the rest of the Åndebog if you get bored.'):FOX_GOAL[Math.min(6,S.badges.length)];
  const n=dayN();
  const mood=n>=GOAL?tl(`${n} rigtige svar i dag. Dagens mål er nået. Jeg er næsten imponeret.`,`${n} correct answers today. Today's goal is reached. I'm almost impressed.`):tl(`I dag: ${n} af ${GOAL} rigtige svar. Jeg siger ikke noget. Jeg tænker det bare.`,`Today: ${n} of ${GOAL} correct answers. I'm not saying anything. I'm just thinking it.`);
  await say(...mood,{who:'Ræven'});
  await say(...g,{who:'Ræven'});
  const wk=weakItems();
  if(wk.length>=3){const r=await ask(`Jeg har fundet ${wk.length} spørgsmål, du har svaret forkert på. Skal vi øve dem? Det tager to minutter. Tre med dig.`,`I've found ${wk.length} questions you got wrong. Shall we practise them? It takes two minutes. Three with you.`,undefined,'Ræven');if(r)return practice(wk.slice(0,6),'Svære spørgsmål')}
  else await say(...tip(GAME.map.area),{who:'Ræven'});
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
  if(T.intro2)await say(...T.intro2,{who});
  const strong=n.boss||/^ex/.test(n.id);
  const res=await runBattle({kind:'trainer',trainer:T,who,look:n.look,leader:strong,foes:T.team.map(([sp,lv])=>newFoe(sp,lv,strong?'leader':'trainer')),tutorial:T.tutorial});
  if(res==='win'){S.beaten[n.key]=true;save();if(n.boss)await ending()}
  return res;
}
async function bossBattle(n){
  await talk([tl('{N}. Godt, at du kom. Magnus står deroppe.','{N}. Good that you came. Magnus is up there.'),tl('Jeg har sagt op. Jeg står bag dig. Ret langt bag dig.','I quit. I\'m right behind you. Quite far behind you.')],'Kim');
  return trainerBattle(n);
}
async function leaderTalk(n){
  const G=GYMS[n.leader];const who=G.title+' '+G.leader;
  if(S.badges.includes(n.leader))return say('Har du læst tavlen? Den hjælper. Det gør jeg ikke.','Have you read the board? It helps. I don\'t.',{who});
  await say(...G.intro,{who});
  const res=await runBattle({kind:'trainer',trainer:{name:G.leader,title:G.title,lose:G.win,prize:G.team[G.team.length-1][1]*60},who,look:n.look,leader:true,noEvo:true,foes:G.team.map(([sp,lv])=>newFoe(sp,lv,'leader'))});
  if(res!=='win')return;
  S.badges.push(n.leader);S.badges.sort();sfx('badge');
  const gifts=[null,['ordbog',3],['smorrebrod',2],['superkugle',3],['ordbog',3],['smorrebrod',3],['superkugle',5]][n.leader];
  S.bag[gifts[0]]+=gifts[1];save();
  await say(`Du fik ${G.badge}.`,`You got the ${G.badge}.`);
  await say(`Du fik også ${gifts[1]} ${itemName(gifts[0],gifts[1])}.`,`You also got ${gifts[1]} × ${ITEMS[gifts[0]].en}.`);
  for(const l of G.after||[])await say(...l,{who});
  await gymBoard(n.leader);
  if(FOX_AFTER[n.leader])await say(...FOX_AFTER[n.leader],{who:'Ræven'});
  await evolutions();
}
function gymBoard(n){
  if(!S.badges.includes(n))return say('Tavlen er tom. Vind mærket, så skriver nogen noget klogt på den.','The board is empty. Win the badge and someone will write something clever on it.');
  return panel('Tavlen · '+GYMS[n].badge,(b)=>{b.append(h('p',{class:'lede'},`${GYMS[n].leader} skrev det her på tavlen. Du finder det igen under TAVLER i menuen.`),
    h('div',{class:'tavle'},h('ul',null,...TAVLE[n-1].map(t=>h('li',{html:t})))))},'board');
}
async function ending(){
  await talk([tl('Skift 2.0 er aflyst. Appen virker ikke på dansk. Det var der ingen, der havde tænkt på.','Skift 2.0 is cancelled. The app doesn\'t work in Danish. Nobody had thought of that.')],'Ræven');
  await talk([tl('Du har bestået Prøven. Og du har reddet sproget. Det står ikke på beviset, men jeg ved det.','You passed the Exam. And you saved the language. It\'s not on the certificate, but I know.'),
    tl('Dansk lærer man hele livet. Det er ikke en trussel. Det er bare sandt.','You learn Danish your whole life. It\'s not a threat. It\'s just true.')],'Lone');
  await say('Jeg vil gerne have en lavalampe som tak. En stor en.','I\'d like a lava lamp as thanks. A big one.',{who:'Ræven'});
  S.flags.champion=true;sfx('badge');save();
  await say('SLUT. Tak fordi du spillede. Spillet fortsætter: der er stadig ånder at fange, og dansk at glemme.','THE END. Thanks for playing. The game continues: there are still spirits to catch, and Danish to forget.');
}

/* ---- whiteout ---- */
async function whiteout(){
  S.money=Math.floor(S.money/2);healAll();const hl=S.heal;
  GAME.mode='world';gotoMap(hl.map,hl.x,hl.y,'d');
  await say('Du besvimede. Du vågnede på en bodega. Nogen havde betalt din kaffe. Det var dig. Du mistede halvdelen af dine penge.','You fainted. You woke up in a bodega. Someone had paid for your coffee. It was you. You lost half your money.');
}
