/* ================= TITLE, NEW GAME, BOOT ================= */
let titleBusy=false;
async function titlePress(k){if(titleBusy||(k!=='a'&&k!=='start'))return;titleBusy=true;audioWake();sfx('sel');
  try{
    if(S.started){const v=await menu([{label:'FORTSÆT',sub:S.name||'',value:'go'},{label:'NYT SPIL',value:'new'},{label:'INDLÆS KODE',value:'imp'}],{cls:'title'});
      if(v==='go'){GAME.mode='world';gotoMap(S.map,S.x,S.y,S.dir);return}
      if(v==='imp'){await importPanel();return}
      if(v==='new'){const ok=await ask('Vil du slette dit gamle spil og starte forfra?','Do you want to delete your old game and start over?',[['Nej',false],['Ja, slet det',true]]);if(!ok)return;await newGame()}
    }else{const v=await menu([{label:'NYT SPIL',value:'new'},{label:'INDLÆS KODE',value:'imp'}],{cls:'title'});if(v==='imp'){await importPanel();return}if(v==='new')await newGame()}
  }finally{titleBusy=false}}
function askName(){return new Promise(res=>{const p=openSheet('panel');
  p.append(h('div',{class:'phead'},h('h2',null,'Hvad hedder du?')));
  p.append(h('p',{class:'lede'},'Skriv dit navn. Det står i dialogerne i spillet. (Type your name.)'));
  const inp=h('input',{id:'player-name',type:'text',maxlength:'12',autocomplete:'off',spellcheck:'false','aria-label':'Dit navn'});
  const ok=h('button',{class:'btn pri',type:'button'},'Det hedder jeg');
  const done=()=>{const v=inp.value.trim().replace(/[<>{}]/g,'').slice(0,12);if(!v){inp.focus();return}closeSheet();res(v)};
  ok.onclick=done;inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();done()}});
  p.append(h('div',{class:'typebox'},inp,ok));setTimeout(()=>inp.focus(),80);sheetKeyFn=null})}
async function newGame(){
  const keep={sound:S.sound,slow:S.slow,en:S.en,vol:S.vol,daynight:S.daynight};S=Object.assign(freshState(),keep);for(const k in MAPS)delete MAPS[k];
  GAME.mode='intro';GAME.introLook='teacher';GAME.introFox=false;
  await talk([tl('Hej! Velkommen til sprogåndernes verden!','Hi! Welcome to the world of language spirits!'),
    tl('Jeg hedder Lone. Jeg er dansklærer på Studieskolen.','My name is Lone. I\'m a Danish teacher at Studieskolen.'),
    tl('I København bor der sprogånder. Nogle er små og søde. Andre er … uregelmæssige.','Language spirits live in Copenhagen. Some are small and sweet. Others are… irregular.'),
    tl('Hver ånd er et stykke dansk: et ord, en regel, en vane. Når du forstår en ånd, kan du fange den.','Each spirit is a piece of Danish: a word, a rule, a habit. When you understand a spirit, you can catch it.'),
    tl('Men først: hvad hedder du?','But first: what\'s your name?')],'Lone');
  GAME.introLook='hero';S.name=await askName();
  await talk([tl('{N}! Sikke et godt navn. Du er lige flyttet til Nørrebro, ikke?','{N}! What a good name. You\'ve just moved to Nørrebro, right?'),
    tl('Din danske historie begynder nu. Vi ses ude på gaden!','Your Danish story begins now. See you out on the street!')],'Lone');
  S.started=true;GAME.mode='world';const out=buildOutdoor(OUT[0]);const home=buildInterior(out,0);gotoMap(home.id,2,2,'d',{quiet:true});
  await say('Tip: gå med piletasterne eller D-pad. A = tal og vælg. START = menu. SELECT = ræven.','Tip: walk with the arrow keys or the D-pad. A = talk and choose. START = menu. SELECT = the fox.');
}
/* ---- save code export / import (move progress between devices) ---- */
function exportCode(){try{return btoa(unescape(encodeURIComponent(JSON.stringify(S))))}catch(e){return''}}
function importCode(code){try{const o=JSON.parse(decodeURIComponent(escape(atob(code.trim()))));if(!o||typeof o!=='object'||!('party' in o))return false;
  if(!o.name)o.name='Bruno';S=Object.assign(freshState(),o);for(const k in MAPS)delete MAPS[k];save();return true}catch(e){return false}}
function importPanel(){return panel('Indlæs gemt spil',(b,close)=>{
  b.append(h('p',{class:'lede'},'Indsæt koden fra INDSTILLINGER → "Kopiér gemt spil" på din anden enhed. (Paste the save code from your other device.)'));
  const ta=h('textarea',{id:'import-code',rows:'5','aria-label':'Kode'});const msg=h('p',{class:'mini'});
  const go=h('button',{class:'btn pri',type:'button'},'Indlæs');go.onclick=()=>{if(importCode(ta.value)){msg.textContent='Indlæst! Tryk FORTSÆT.';close();toast('Spillet er indlæst.')}else msg.textContent='Koden virker ikke. Tjek at du har kopieret det hele.'};
  b.append(ta,h('div',{class:'row'},go),msg)})}

/* ================= BOOT ================= */
function boot(){
  buildSprites();bindPad();fitScreen();
  $('#screen').addEventListener('pointerdown',e=>{audioWake();if(GAME.mode==='title'&&!topModal()&&!sheetOpen()){e.preventDefault();press('a')}});
  addEventListener('pointerdown',()=>audioWake(),{once:false,passive:true});
  addEventListener('keydown',()=>audioWake(),{passive:true});
  const go=()=>{fitScreen();requestAnimationFrame(loop)};
  if(document.fonts&&document.fonts.load){Promise.race([Promise.all([document.fonts.load('24px "Pixelify Sans"'),document.fonts.load('24px "Press Start 2P"')]),wait(1500)]).then(go,go)}else go();
  document.addEventListener('visibilitychange',()=>{if(document.hidden){save();if(AU.ctx)AU.ctx.suspend()}else if(AU.ctx)AU.ctx.resume()});
}
boot();
