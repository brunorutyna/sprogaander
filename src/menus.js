/* ================= ITEMS, MENUS, PANELS ================= */
const itemName=(k,n)=>n>1?ITEMS[k].pl:ITEMS[k].name.toLowerCase();
const ITEMS={
 kugle:{name:'Sprogkugle',pl:'sprogkugler',en:'language ball',price:60,da:'Fanger en vild ånd, hvis du svarer rigtigt.',enD:'Catches a wild spirit if you answer correctly.'},
 superkugle:{name:'Superkugle',pl:'superkugler',en:'super ball',price:150,need:3,da:'Som en sprogkugle, men meget bedre.',enD:'Like a language ball, but much better.'},
 rugbrod:{name:'Rugbrødsmad',pl:'rugbrødsmadder',en:'rye bread sandwich',price:40,heal:30,da:'Giver 30 HP.',enD:'Restores 30 HP.'},
 smorrebrod:{name:'Smørrebrød',pl:'stykker smørrebrød',en:'open sandwich',price:120,full:true,need:2,da:'Giver alle HP tilbage.',enD:'Restores all HP.'},
 ordbog:{name:'Ordbog',pl:'ordbøger',en:'dictionary',price:50,da:'Et hint i et spørgsmål.',enD:'One hint during a question.'}
};
async function startMenu(){
  const v=await menu([
    {label:'ÅNDEBOG',value:'dex',disabled:!S.flags.fox},{label:'ÅNDER',value:'party',disabled:!S.party.length},{label:'TASKE',value:'bag'},
    {label:'BRUNO',value:'card'},{label:'TAVLER',value:'boards'},{label:'INDSTIL.',value:'set'},{label:'GEM',value:'save'},{label:'LUK',value:null}],{cls:'start',startCloses:true});
  if(v==='dex')return dexPanel();if(v==='party')return partyPanel();if(v==='bag')return bagPanel();if(v==='card')return cardPanel();
  if(v==='boards')return boardsPanel();if(v==='set')return settingsPanel();if(v==='save'){save();toast('Spillet er gemt.')}
}
function typeChip(t){const T=TYPES[t];return h('span',{class:'type',style:`--tc:${T.c}`},T.n)}
function bar(f,cls){return h('i',{class:'bar '+(cls||'')},h('s',{style:`width:${Math.round(Math.max(0,Math.min(1,f))*100)}%`}))}

/* ---- Åndebog ---- */
function dexPanel(){return panel('Åndebogen',(b)=>{
  const seen=DEX.filter(d=>S.seen[d.id]).length,caught=DEX.filter(d=>S.caught[d.id]).length;
  b.append(h('p',{class:'lede'},`Set ${seen} · Fanget ${caught} af ${DEX.length}. Hver ånd er et emne fra dansktimerne. Tryk på en ånd for at øve emnet.`));
  const grid=h('div',{class:'dex'});b.append(grid);
  for(const d of DEX){const s=!!S.seen[d.id],c=!!S.caught[d.id];
    const btn=h('button',{class:'dx'+(c?' got':s?' seen':''),type:'button'},h('small',{class:'num'},'#'+String(d.no).padStart(3,'0')),
      s?spriteImg(spiritSprite(d),48):h('span',{class:'q'},'?'),h('b',null,s?d.name:'???'));
    btn.onclick=()=>dexEntry(d);grid.append(btn)}
})}
function dexEntry(d){return panel(S.seen[d.id]?d.name:'???',(b,close)=>{
  const seen=!!S.seen[d.id];const topic=d.fox?null:d.topic;
  const top=h('div',{class:'entry'});b.append(top);
  top.append(seen?spriteImg(spiritSprite(d),112,'px big'):h('div',{class:'big q'},'?'));
  const info=h('div',{class:'einfo'});top.append(info);
  info.append(h('div',null,h('small',{class:'num'},'#'+String(d.no).padStart(3,'0')),' ',typeChip(d.type),S.caught[d.id]?h('span',{class:'got'},' fanget'):null));
  if(d.fox){info.append(h('p',null,'Ordstillingens ånd. Den ved altid, at verbet står på plads nummer to.'),h('p',{class:'en'},'The spirit of word order. It always knows the verb goes in position two.'));
    info.append(h('p',{class:'mini'},'Hyggeræven udvikler sig ikke. Den er allerede perfekt.'))}
  else{const T=TOPICS[topic];info.append(h('h4',null,T[2]),h('p',null,T[3]),h('p',{class:'en'},T[4]));
    const m=mastery(topic);info.append(h('div',{class:'mast'},h('span',null,`Du kan emnet: ${Math.round(m*100)} %`),bar(m,m>=EVO_NEED?'ok':'')));
    if(d.evo)info.append(h('p',{class:'mini'},`Udvikler sig til ${S.seen[d.evo]?SP[d.evo].name:'???'} ved niveau ${d.evoLv}, når du kan emnet (60 %).`));
    if(d.stage)info.append(h('p',{class:'mini'},'Den udviklede form. Den vokser, når man kan emnet godt.'));
    const n=BANK.filter(i=>i.topic===topic).length;
    b.append(h('div',{class:'row'},h('button',{class:'btn pri',type:'button',on:{click:()=>{close();practice(pickN([topic],5),T[2])}}},`Øv emnet · 5 spørgsmål`),h('span',{class:'mini'},`${n} spørgsmål i alt. Rigtige svar giver også din første ånd erfaring.`)));}
})}
function pickN(topics,n){const out=[];for(let k=0;k<n;k++){const it=pickItem(topics);if(it&&!out.includes(it))out.push(it)}return out}
async function practice(items,label){
  let right=0;for(const it of items){const r=await challenge(it,{who:'Øvelse',sub:label+' · '+TOPICS[it.topic][2]});if(r.ok)right++}
  const lead=S.party[0];
  if(GAME.mode==='world')await say(`Du svarede rigtigt på ${right} af ${items.length}.`,`You got ${right} of ${items.length} right.`);
  if(lead&&right&&GAME.mode==='world'){await giveXp(lead,right*Math.max(3,Math.round(lead.lv*.8)));await evolutionsWorld()}
}
async function evolutionsWorld(){await evolutions()}

/* ---- party ---- */
function partyPanel(){return panel('Dine ånder',(b,close)=>{
  const draw=()=>{b.innerHTML='';
    S.party.forEach((s,k)=>{const d=SP[s.sp];const row=h('div',{class:'prow'});
      row.append(spriteImg(spiritSprite(d),56),h('div',{class:'pinfo'},
        h('div',null,h('b',null,d.name),' ',h('small',{class:'num'},'Nv.'+s.lv),' ',typeChip(d.type)),
        h('div',{class:'hpl'},h('span',null,'HP'),bar(s.hp/maxHp(s),s.hp/maxHp(s)<.25?'red':s.hp/maxHp(s)<.5?'yel':''),h('small',{class:'num'},` ${s.hp}/${maxHp(s)}`)),
        h('div',{class:'hpl xp'},h('span',null,'XP'),bar(s.xp/xpNeed(s.lv),'xp')),
        h('small',{class:'mini'},'Angreb: '+MOVES.filter(m=>s.lv>=m.lv).map(m=>m.n).join(', '))),
        h('div',{class:'pbtn'},k?h('button',{class:'btn',type:'button',on:{click:()=>{S.party.splice(k,1);S.party.unshift(s);save();draw()}}},'Først'):h('span',{class:'mini'},'Først i kamp'),
          s.hp<maxHp(s)&&S.bag.rugbrod?h('button',{class:'btn',type:'button',on:{click:()=>{S.bag.rugbrod--;s.hp=Math.min(maxHp(s),s.hp+30);sfx('heal');save();draw()}}},'Rugbrød'):null));
      b.append(row)});
    b.append(h('p',{class:'mini'},'Højst seks ånder på holdet. Resten bor i Åndekassen i Hyggestuen.'));};
  draw();
})}
/* ---- bag ---- */
function bagPanel(){return panel('Tasken',(b)=>{
  b.append(h('p',{class:'lede'},`Penge: ${S.money} kr. (${daNum(S.money)} kroner)`));
  for(const k in ITEMS){const I=ITEMS[k];b.append(h('div',{class:'irow'},h('b',null,I.name),h('span',{class:'num'},'×'+S.bag[k]),h('small',null,I.da+' · '+I.enD)))}
  b.append(h('p',{class:'mini'},'Brug rugbrød under ÅNDER, eller i kamp under TASKE.'));
})}
/* ---- trainer card ---- */
function cardPanel(){return panel(S.name||'Spiller',(b,close)=>{
  const caught=DEX.filter(d=>S.caught[d.id]).length;const n=dayN();
  b.append(h('div',{class:'card'},spriteImg(SPR.hero.d[0],64),h('div',null,h('b',null,S.name||'Spiller'),h('p',{class:'mini'},'Ny i København. Lærer dansk på Studieskolen.'),
    h('p',{class:'num'},`Penge ${S.money} kr · Åndebog ${caught}/${DEX.length}`))));
  b.append(h('h4',null,'Mærker'));
  const badges=h('div',{class:'badges'});for(let i=1;i<=6;i++){const G=GYMS[i];const got=S.badges.includes(i);
    badges.append(h('div',{class:'badge'+(got?' got':'')},h('i',{class:'medal',style:`--mc:${['#e07a3a','#3f78cf','#c99a1c','#4f9a48','#cf4a5e','#8f58c0'][i-1]}`}),h('b',null,got?G.badge:'???'),h('small',null,G.town)))}
  b.append(badges);
  b.append(h('h4',null,'Dagens mål'),h('div',{class:'mast'},h('span',{class:'num'},`${Math.min(n,GOAL)} / ${GOAL} rigtige svar i dag · ${S.streak} ${S.streak===1?'dag':'dage'} i træk`),bar(n/GOAL,n>=GOAL?'ok':'')));
  const wk=weakItems();
  b.append(h('div',{class:'row'},h('button',{class:'btn pri',type:'button',disabled:wk.length?false:'',on:{click:()=>{close();practice(wk.slice(0,8),'Svære spørgsmål')}}},`Øv svære spørgsmål (${wk.length})`)));
  b.append(h('h4',null,'Emner'));
  const tl2=h('div',{class:'topics'});for(const t in TOPICS){const m=mastery(t);tl2.append(h('div',{class:'trow'},h('span',null,TOPICS[t][2]),bar(m,m>=EVO_NEED?'ok':'')))}
  b.append(tl2);
})}
function boardsPanel(){return panel('Tavler',(b)=>{
  b.append(h('p',{class:'lede'},'Hver mester skriver på tavlen, når du vinder. Her er alt, du har lært.'));
  for(let i=1;i<=6;i++){const got=S.badges.includes(i);b.append(h('h4',null,`${GYMS[i].badge} · ${GYMS[i].town}`));
    b.append(got?h('div',{class:'tavle'},h('ul',null,...TAVLE[i-1].map(t=>h('li',{html:t})))):h('p',{class:'mini'},'Låst. Vind mærket for at se tavlen.'))}
},'board')}
function settingsPanel(){return panel('Indstillinger',(b)=>{
  const tog=(label,sub,key)=>{const t=h('button',{class:'tog',type:'button','aria-pressed':String(!!S[key]),'aria-label':label});t.onclick=()=>{S[key]=!S[key];if(key==='sound')applyVolumes();t.setAttribute('aria-pressed',String(S[key]));save()};
    return h('div',{class:'set'},h('p',null,label,h('small',null,sub)),t)};
  b.append(tog('Lyd','Lydeffekter og dansk oplæsning','sound'),tog('Langsom stemme','Den danske stemme taler langsommere','slow'),tog('Vis altid engelsk','Oversættelsen vises under hver replik','en'));
  b.append(tog('Dag og nat','Lyset følger dit ur','daynight'));
  const sl=(label,key)=>{const v=Math.round(((S.vol||{})[key]??.6)*100);const r=h('input',{type:'range',min:'0',max:'100',value:String(v),id:'vol-'+key,'aria-label':label});
    r.oninput=()=>{S.vol=Object.assign({},S.vol,{[key]:r.value/100});applyVolumes();if(key==='sfx')sfx('sel')};r.onchange=save;return h('label',{class:'set sl'},h('p',null,label),r)};
  b.append(sl('Musik','music'),sl('Lydeffekter','sfx'),sl('Stemning (bølger, måger, cykler)','amb'));
  b.append(h('p',{class:'mini'},daVoice?`Dansk stemme fundet: ${daVoice.name}.`:'Ingen dansk stemme på enheden. Lytte-spørgsmål viser teksten i stedet.'));
  b.append(h('p',{class:'mini'},'Taster: piletaster/WASD = gå · Z/mellemrum = A · X/Esc = B · Enter = START · Shift/E = SELECT'));
  const reset=h('button',{class:'btn ghost',type:'button'},'Slet spillet og start forfra');let armed=false;
  reset.onclick=()=>{if(!armed){armed=true;reset.textContent='Er du sikker? Tryk igen for at slette alt';reset.classList.add('warn');return}try{localStorage.removeItem(SAVE)}catch(e){}location.reload()};
  const exp=h('button',{class:'btn',type:'button'},'Kopiér gemt spil');const expMsg=h('p',{class:'mini'});
  exp.onclick=()=>{const code=exportCode();const ta=h('textarea',{id:'export-code',rows:'4',readonly:''},code);expMsg.replaceChildren(ta,h('span',null,'Indsæt koden under INDLÆS KODE på titelskærmen på din anden enhed.'));ta.select();
    try{navigator.clipboard.writeText(code).then(()=>toast('Koden er kopieret.'),()=>{})}catch(e){}};
  b.append(h('h4',null,'Flyt dit spil'),h('div',{class:'row'},exp),expMsg);
  b.append(h('div',{class:'row'},reset));
})}

/* ---- shop ---- */
function shop(){return panel('Kiosken',(b,close)=>{
  const line=h('div',{class:'line'},h('p',null,'Hej! Hvad skulle det være?'),h('small',{class:'en'},'Hi! What would you like?'));
  const money=h('p',{class:'num lede'});b.append(line,money);
  const list=h('div');b.append(list);
  const draw=()=>{money.textContent=`Du har ${S.money} kr.`;list.innerHTML='';
    for(const k in ITEMS){const I=ITEMS[k];if(I.need&&S.badges.length<I.need)continue;
      list.append(h('div',{class:'irow'},h('b',null,I.name),h('span',{class:'num'},I.price+' kr'),h('small',null,I.da+' · '+I.enD+` · du har ${S.bag[k]}`),
        h('button',{class:'btn',type:'button',on:{click:()=>{if(S.money<I.price){line.innerHTML='';line.append(h('p',null,'Du har desværre ikke penge nok.'),h('small',{class:'en'},'Sorry, you don\'t have enough money.'));sfx('bad');return}
          S.money-=I.price;S.bag[k]++;sfx('sel');save();line.innerHTML='';const da=`Det bliver ${daNum(I.price)} kroner. Tak!`;line.append(h('p',null,da),h('small',{class:'en'},`That'll be ${I.price} kroner. Thanks!`));speak(da);draw()}}},'Køb')))}};
  draw();
  b.append(h('div',{class:'row'},h('button',{class:'btn',type:'button',on:{click:close}},'Hav en god dag!')));
})}
/* ---- PC box ---- */
function boxPC(){return panel('Åndekassen',(b)=>{
  const draw=()=>{b.innerHTML='';b.append(h('p',{class:'lede'},'Flyt ånder mellem holdet (højst seks) og kassen.'));
    b.append(h('h4',null,`Holdet (${S.party.length}/6)`));
    S.party.forEach((s,k)=>b.append(h('div',{class:'irow'},spriteImg(spiritSprite(SP[s.sp]),36),h('b',null,nameOf(s)),h('span',{class:'num'},'Nv.'+s.lv),
      S.party.length>1&&!SP[s.sp].fox?h('button',{class:'btn',type:'button',on:{click:()=>{S.party.splice(k,1);S.box.push(s);save();draw()}}},'Til kassen'):h('span'))));
    b.append(h('h4',null,`Kassen (${S.box.length})`));
    if(!S.box.length)b.append(h('p',{class:'mini'},'Kassen er tom.'));
    S.box.forEach((s,k)=>b.append(h('div',{class:'irow'},spriteImg(spiritSprite(SP[s.sp]),36),h('b',null,nameOf(s)),h('span',{class:'num'},'Nv.'+s.lv),
      S.party.length<6?h('button',{class:'btn',type:'button',on:{click:()=>{S.box.splice(k,1);s.hp=maxHp(s);S.party.push(s);save();draw()}}},'Til holdet'):h('span'))));};
  draw();
})}
