/* ================= BATTLE ================= */
let BT=null;
const nameOf=s=>SP[s.sp].name;
const getMax=s=>s.max||maxHp(s);
function firstAlive(){return S.party.find(s=>s.hp>0)}
async function runBattle(o){
  const prevMode=GAME.mode;GAME.mode='battle';$('#place').hidden=true;
  BT={o,foes:o.foes,fi:0,foe:o.foes[0],me:firstAlive()||S.party[0],t0:performance.now(),anim:{},disp:{},told:{},wild:o.kind==='wild',look:o.look,phase:'intro'};
  BT.disp.me=BT.me.hp;BT.disp.foe=BT.foe.hp;
  sfx('enc');await wait(700);BT.phase='fight';
  for(const f of BT.foes)S.seen[f.sp]=1;
  if(BT.wild){await say(`En vild ${nameOf(BT.foe)} dukkede op.`,`A wild ${nameOf(BT.foe)} appeared.`);if(Math.random()<.3)await say(...WILD_QUIPS[Math.floor(Math.random()*WILD_QUIPS.length)])}
  else{await say(`${o.who} vil kæmpe!`,`${o.who} wants to fight!`);await say(`${o.trainer.name} sender ${nameOf(BT.foe)} ud!`,`${o.trainer.name} sends out ${nameOf(BT.foe)}!`)}
  BT.anim.meIn=performance.now();
  await say(`Kom så, ${nameOf(BT.me)}!`,`Go, ${nameOf(BT.me)}!`);
  if(!S.flags.tut){S.flags.tut=1;save();
    await say('Sådan her: Vælg KÆMP og et angreb. Du rammer ved at svare rigtigt på et spørgsmål om modstanderens emne.','Here\'s how: choose FIGHT and a move. You hit by answering a question on the opponent\'s topic correctly.',{who:'Ræven'});
    await say('Svarer du forkert, rammer du ikke. Og så bliver du slået. Ligesom i virkeligheden. At skrive svaret giver de hårdeste slag.','Answer wrong and you miss. And then you get hit. Just like real life. Typing the answer hits hardest.',{who:'Ræven'});
  }
  let result=null;
  while(!result){
    const me=BT.me,foe=BT.foe;
    await say(`Hvad skal ${nameOf(me)} gøre?`,`What will ${nameOf(me)} do?`,{keep:true,instant:true,nospeak:true});
    const act=await menu([{label:'KÆMP',value:'fight'},{label:'ÅNDER',value:'party'},{label:'TASKE',value:'bag'},{label:'FLYGT',value:'run'}],{cols:2,cls:'bmenu',noCancel:true});
    hideDlg();
    if(act==='fight'){
      const r=await chooseMove();if(!r)continue;
      result=await doAttack(r);
    }else if(act==='party'){
      const s=await pickSpirit('Hvem skal kæmpe?',x=>x!==BT.me&&x.hp>0);if(!s)continue;
      await say(`Kom tilbage, ${nameOf(BT.me)}!`,`Come back, ${nameOf(BT.me)}!`);BT.me=s;BT.disp.me=s.hp;BT.anim.meIn=performance.now();
      await say(`Kom så, ${nameOf(s)}!`,`Go, ${nameOf(s)}!`);result=await enemyTurn(false);
    }else if(act==='bag'){
      const r=await useBagInBattle();if(r==='cancel')continue;if(r==='caught'){result='caught';break}
      result=await enemyTurn(r==='miss');
    }else if(act==='run'){
      if(!BT.wild){await say('Du kan ikke flygte fra en kamp mod en træner!','You can\'t run from a trainer battle!');continue}
      sfx('run');await say('Du slap væk!','You got away safely!');result='run';
    }
  }
  if(result==='lose'){
    if(o.tutorial){await say('Jeg er træt. Det var din første kamp. Vi taler ikke om den.','I\'m tired. It was your first fight. We don\'t talk about it.',{who:'Ræven'});healAll();await say(...o.trainer.after,{who:o.who})}
    else{await say('Du har ikke flere ånder, der kan kæmpe!','You have no more spirits that can fight!');BT=null;await whiteout();return 'lose'}
  }
  if(result==='win'||result==='caught')victoryMusic();
  if(result==='win'&&!BT.wild){
    await say(...o.trainer.lose,{who:o.who});
    const prize=o.trainer.prize||o.foes.reduce((a,f)=>Math.max(a,f.lv),0)*25;S.money+=prize;
    await say(`Du fik ${prize} kr. for at vinde.`,`You got ${prize} kr. for winning.`);
  }
  BT=null;GAME.mode='world';if(!o.noEvo)await evolutions();save();return result;
}
/* questions come from the foe's topic; if that topic has no items in a format, use topics of the same type you have reached */
function topicsFor(foe,f){const d=SP[foe.sp];if(!f||hasFormat(d.topics,f))return{topics:d.topics,wide:false};
  const reach=Math.max(TOPICS[d.topics[0]]?TOPICS[d.topics[0]][1]:1,S.badges.length+1);
  const same=Object.keys(TOPICS).filter(t=>TOPICS[t][0]===d.type&&TOPICS[t][1]<=reach&&hasFormat([t],f));
  return same.length?{topics:same,wide:true}:{topics:d.topics,wide:false}}
function movesFor(me,foe){
  return MOVES.map(m=>{const tf=topicsFor(foe,m.f);return{...m,wide:tf.wide,ok:me.lv>=m.lv&&hasFormat(tf.topics,m.f)}});
}
async function chooseMove(){
  const ms=movesFor(BT.me,BT.foe);
  await say(`Emne: ${TOPICS[SP[BT.foe.sp].topic]?.[2]||'Ordstilling'}. Vælg et angreb.`,`Topic: ${TOPICS[SP[BT.foe.sp].topic]?.[4]||'Word order'} Pick a move.`,{keep:true,instant:true,nospeak:true});
  const v=await menu(ms.map(m=>({label:m.n,sub:m.ok?`${m.tag} · ${m.pow}${m.wide?' · '+SP[BT.foe.sp].type:''}`:(BT.me.lv<m.lv?`NV. ${m.lv}`:'—'),value:m,disabled:!m.ok})),{cols:2,cls:'bmenu moves'});
  hideDlg();return v;
}
function dmgCalc(me,foe,pow,crit){const mult=typeMult(SP[me.sp].type,SP[foe.sp].type);
  const d=pow*(1+me.lv/8)*(SP[me.sp].stage?1.12:1)*mult*(.9+Math.random()*.15)*(crit?1.5:1);return{d:Math.max(1,Math.round(d)),mult}}
async function doAttack(mv){
  const me=BT.me,foe=BT.foe;
  const it=pickItem(topicsFor(foe,mv.f).topics,mv.f)||pickItem(SP[foe.sp].topics);
  await say(`${nameOf(me)} bruger ${mv.n}!`,`${nameOf(me)} uses ${mv.n}!`,{instant:true,nospeak:true});
  const r=await challenge(it,{who:(BT.wild?'Vilde ':'')+nameOf(foe),sub:`${TOPICS[it.topic][2]} · ${mv.tag} ${mv.pow}`,spirit:SP[foe.sp],theirs:{hp:foe.hp,max:getMax(foe)}});
  if(!r.ok){await say('Forkert svar. Angrebet ramte luft.','Wrong answer. The attack hit thin air.');return enemyTurn(true)}
  const crit=r.typed?Math.random()<.4:mv.f==='order'?Math.random()<.15:false;
  const{d,mult}=dmgCalc(me,foe,mv.pow,crit);
  {const ans=it.t==='order'?it.a.join(''):it.t==='type'?it.a[0]:String(it.a);fxAttack(true,TYPES[SP[me.sp].type].c,ans.length<14?ans:ans.split(' ')[0])}
  await wait(450);sfx('hit');BT.anim.foeHit=performance.now();await wait(300);
  foe.hp=Math.max(0,foe.hp-d);await tweenHp('foe',foe.hp);
  if(crit)await say('Fuldtræffer!','A critical hit!');
  if(mult>1)await say('Det er supereffektivt!','It\'s super effective!');
  if(mult<1)await say('Det er ikke særlig effektivt …','It\'s not very effective…');
  if(foe.hp<=0)return foeFainted();
  return enemyTurn(false);
}
async function enemyTurn(punish){
  const me=BT.me,foe=BT.foe;
  const mv=ENEMY_MOVE[SP[foe.sp].type];
  await say(`${BT.wild?'Vilde ':''}${nameOf(foe)} bruger ${mv}!`,`${BT.wild?'Wild ':''}${nameOf(foe)} uses ${mv}!`,{instant:true,nospeak:true});
  const mult=typeMult(SP[foe.sp].type,SP[me.sp].type);
  const d=Math.max(1,Math.round((3+foe.lv*.95)*mult*(.85+Math.random()*.15)*(punish?1.4:1)*(BT.o.leader?1.08:1)));
  fxHitMe(TYPES[SP[foe.sp].type].c);sfx('hit');BT.anim.meHit=performance.now();await wait(380);
  me.hp=Math.max(0,me.hp-d);await tweenHp('me',me.hp);
  if(punish)await say('Et hårdt slag. Forkerte svar koster. Ligesom husleje.','A hard hit. Wrong answers cost. Like rent.');
  else if(mult>1)await say('Det er supereffektivt!','It\'s super effective!');
  if(me.hp<=0){await say(`${nameOf(me)} besvimede!`,`${nameOf(me)} fainted!`);
    if(!firstAlive())return 'lose';
    const s=await pickSpirit('Hvem skal kæmpe nu?',x=>x.hp>0,true);BT.me=s;BT.disp.me=s.hp;BT.anim.meIn=performance.now();
    await say(`Kom så, ${nameOf(s)}!`,`Go, ${nameOf(s)}!`);}
  return null;
}
function tweenHp(who,to){return new Promise(r=>{const f=()=>{const d=BT.disp[who];if(Math.abs(d-to)<.6){BT.disp[who]=to;r();return}BT.disp[who]+=(to-d)*.18+(to>d?.3:-.3);requestAnimationFrame(f)};f()})}
async function foeFainted(){
  const foe=BT.foe;BT.anim.foeGone=performance.now();
  await say(`${BT.wild?'Vilde ':''}${nameOf(foe)} besvimede!`,`${BT.wild?'Wild ':''}${nameOf(foe)} fainted!`);
  const gain=Math.round(foe.lv*(BT.wild?6:9)*(SP[foe.sp].stage?1.2:1));
  await giveXp(BT.me,gain);
  BT.fi++;
  if(BT.fi<BT.foes.length){BT.foe=BT.foes[BT.fi];BT.disp.foe=BT.foe.hp;BT.anim={};
    await say(`${BT.o.trainer.name} sender ${nameOf(BT.foe)} ud!`,`${BT.o.trainer.name} sends out ${nameOf(BT.foe)}!`);return null}
  return 'win';
}
async function giveXp(s,gain,quiet){
  s.xp+=gain;if(!quiet)await say(`${nameOf(s)} fik ${gain} erfaringspoint.`,`${nameOf(s)} gained ${gain} experience points.`,{instant:true});
  while(s.xp>=xpNeed(s.lv)&&s.lv<60){s.xp-=xpNeed(s.lv);const old=maxHp(s);s.lv++;s.hp+=maxHp(s)-old;sfx('lvl');if(BT&&s===BT.me)fxLevel();
    await say(`${nameOf(s)} steg til niveau ${s.lv}!`,`${nameOf(s)} grew to level ${s.lv}!`);
    const nm=MOVES.find(m=>m.lv===s.lv);if(nm)await say(`${nameOf(s)} kan nu bruge ${nm.n}! (${nm.tag})`,`${nameOf(s)} can now use ${nm.n}! (${nm.en} questions)`)}
  save();
}
async function pickSpirit(title,filter,must){
  const items=S.party.map(s=>({label:`${nameOf(s)}`,sub:`Nv.${s.lv} · ${s.hp}/${maxHp(s)}`,value:s,disabled:!filter(s)}));
  return menu(items,{title,cls:'party',noCancel:!!must});
}
async function useBagInBattle(){
  const opts=['kugle','superkugle','kaffe','rugbrod','smorrebrod'].filter(k=>S.bag[k]>0).map(k=>({label:ITEMS[k].name,sub:'×'+S.bag[k],value:k}));
  if(!opts.length){await say('Tasken er tom.','The bag is empty.');return 'cancel'}
  const k=await menu(opts,{title:'TASKE',cls:'party'});if(!k)return 'cancel';
  if(k==='kugle'||k==='superkugle'){
    if(!BT.wild){await say('Du kan ikke fange en andens ånd!','You can\'t catch someone else\'s spirit!');return 'cancel'}
    S.bag[k]--;save();return catchFlow(k==='superkugle');
  }
  const s=await pickSpirit('Hvem?',x=>x.hp>0&&x.hp<maxHp(x));if(!s)return 'cancel';
  S.bag[k]--;const before=s.hp;s.hp=ITEMS[k].full?maxHp(s):Math.min(maxHp(s),s.hp+ITEMS[k].heal);sfx('heal');if(s===BT.me)await tweenHp('me',s.hp);save();
  await say(`${nameOf(s)} spiste en ${ITEMS[k].name.toLowerCase()} og fik ${s.hp-before} HP.`,`${nameOf(s)} ate a ${ITEMS[k].en} and recovered ${s.hp-before} HP.`);
  return 'ok';
}
async function catchFlow(sup){
  const foe=BT.foe;sfx('ball');
  await say(`Du tænder en ${sup?'superlampe':'lavalampe'}. Ånden kigger. Svar på dens spørgsmål, så hopper den ind.`,`You switch on a ${sup?'super lamp':'lava lamp'}. The spirit looks. Answer its question and it jumps in.`);
  const it=pickItem(SP[foe.sp].topics);
  const r=await challenge(it,{who:'Fang '+nameOf(foe),sub:TOPICS[it.topic][2]+' · fangst',spirit:SP[foe.sp],theirs:{hp:foe.hp,max:getMax(foe)}});
  if(!r.ok){await say('Ånden kiggede væk. Lampen gik ud.','The spirit looked away. The lamp went out.');return 'miss'}
  const p=Math.min(.97,Math.max(.3,.3+.65*(1-foe.hp/getMax(foe))+(r.typed?.15:0)+(sup?.25:0)));
  BT.anim.ball=performance.now();
  const ok=Math.random()<p;const shakes=ok?3:Math.floor(Math.random()*3);
  await wait(450);for(let k=0;k<shakes;k++){await wait(420);sfx('shake')}
  await wait(300);
  if(!ok){BT.anim.ball=null;await say(`Pis. ${nameOf(foe)} slap ud af lampen.`,`Damn. ${nameOf(foe)} escaped from the lamp.`);return 'ok'}
  sfx('catch');BT.anim.caught=true;fxStars(176,70,22);
  await say(`Fanget. ${nameOf(foe)} bor nu i din lavalampe. Den betaler ikke husleje.`,`Caught. ${nameOf(foe)} now lives in your lava lamp. It doesn\'t pay rent.`);
  const first=!S.caught[foe.sp];S.caught[foe.sp]=1;
  const mine=newSpirit(foe.sp,foe.lv);mine.hp=Math.max(1,foe.hp);
  if(S.party.length<6)S.party.push(mine);else{S.box.push(mine);await say(`Holdet er fuldt. ${nameOf(foe)} blev sendt til Åndekassen på bodegaen.`,`Your team is full. ${nameOf(foe)} was sent to the Spirit Box at the bodega.`)}
  if(first)await say(`${nameOf(foe)} er skrevet ind i Åndebogen.`,`${nameOf(foe)} has been added to the Åndebog.`);
  await giveXp(BT.me,Math.round(foe.lv*4));
  save();return 'caught';
}
async function evolutions(){
  for(const s of S.party){const d=SP[s.sp];if(!d.evo||s.lv<d.evoLv)continue;
    const mst=mastery(d.topic);
    if(mst>=EVO_NEED){
      const pm=GAME.mode;GAME.mode='evo';GAME.evo={from:d,to:SP[d.evo],t0:performance.now()};
      await say(`Hvad? ${d.name} er begyndt at træne. Meget.`,`What? ${d.name} has started working out. A lot.`);
      await wait(1600);GAME.evo.done=true;sfx('badge');
      const old=maxHp(s);s.sp=d.evo;s.hp+=maxHp(s)-old;S.seen[s.sp]=1;S.caught[s.sp]=1;
      await say(`${d.name} blev til ${SP[d.evo].name}. Den sprang ikke ben-dagen over. Den sprang alt andet over.`,`${d.name} became ${SP[d.evo].name}. It didn\'t skip leg day. It skipped everything else.`);
      await say(`Du kan emnet «${TOPICS[d.topic][2]}» så godt, at ånden fik muskler af det.`,`You know "${TOPICS[d.topic][2]}" so well that the spirit got muscles from it.`);
      GAME.mode=pm;GAME.evo=null;save();
    }else if(S.flags['evotold:'+s.uid]!==s.lv){S.flags['evotold:'+s.uid]=s.lv;
      await say(`${d.name} vil gerne udvikle sig … men først skal du kunne emnet "${TOPICS[d.topic][2]}" bedre. (${Math.round(mst*100)} % af 60 %)`,`${d.name} wants to evolve… but first you need to know "${TOPICS[d.topic][2]}" better. (${Math.round(mst*100)}% of 60%) Practise it in the Åndebog.`)}
  }
}
