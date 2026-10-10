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
  const keep={sound:S.sound,slow:S.slow,en:S.en,vol:S.vol,daynight:S.daynight,stats:S.stats,xp:S.xp,day:S.day,streak:S.streak,lastGoal:S.lastGoal};S=Object.assign(freshState(),keep);for(const k in MAPS)delete MAPS[k];CHUNKS.clear();
  GAME.mode='intro';GAME.introLook=null;GAME.introT=performance.now();
  await talk([tl('København. Oktober. Det regner.','Copenhagen. October. It\'s raining.'),
    tl('Du er lige flyttet hertil. Du har et job, der starter om seks uger, en fremlejet seng og ingen anelse om, hvordan man udtaler "rødgrød med fløde".','You have just moved here. You have a job that starts in six weeks, a sublet bed and no idea how to pronounce "rødgrød med fløde".')]);
  GAME.introLook='sofie';
  await talk([tl('Hej. Du må være den nye. Hvad hed du nu?','Hi. You must be the new one. What was your name again?')],'Sofie');
  S.name=await askName();
  await talk([tl('{N}. Okay. Huslejen er ni tusind om måneden. Plus el. Plus vand. Plus varme. Velkommen.','{N}. Okay. The rent is nine thousand a month. Plus electricity. Plus water. Plus heating. Welcome.'),
    tl('Og gå en tur. Du ser bleg ud. Alle udlændinge ser blege ud i oktober.','And go for a walk. You look pale. All foreigners look pale in October.')],'Sofie');
  S.started=true;GAME.mode='world';const out=buildOutdoor(OUT[0]);const home=buildInterior(out,0);gotoMap(home.id,2,2,'d',{quiet:true});
  await say('Gå med D-pad eller piletasterne. A = tal og vælg. MENU = menu.','Walk with the D-pad or arrow keys. A = talk and choose. MENU = menu.');
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
  bindPad();fitScreen();
  $('#screen').addEventListener('pointerdown',e=>{audioWake();if(GAME.mode==='title'&&!topModal()&&!sheetOpen()){e.preventDefault();press('a')}});
  addEventListener('pointerdown',()=>audioWake(),{once:false,passive:true});
  addEventListener('keydown',()=>audioWake(),{passive:true});
  const go=()=>{fitScreen();requestAnimationFrame(loop)};
  if(document.fonts&&document.fonts.load){Promise.race([Promise.all([document.fonts.load('24px "Pixelify Sans"'),document.fonts.load('24px "Press Start 2P"')]),wait(1500)]).then(go,go)}else go();
  document.addEventListener('visibilitychange',()=>{if(document.hidden){save();if(AU.ctx)AU.ctx.suspend()}else if(AU.ctx)AU.ctx.resume()});
}
boot();
