/* ================= BOOT: title, name, continue ================= */
function titleScreen(){GAME.mode='title';setPanel('title');pbody.innerHTML='';const has=!!(S.name&&S.flags&&Object.keys(S.flags).length);
  const t=$('#title');t.hidden=false;t.innerHTML='';
  t.append(h('div',{class:'tin'},h('h1',null,'Mellemrum'),h('p',{class:'sub'},'et sprogeventyr på dansk'),
    h('div',{class:'tbtns'},has?h('button',{class:'btn pri',type:'button',on:{click:()=>start(false)}},'Fortsæt'):null,
      h('button',{class:'btn'+(has?'':' pri'),type:'button',on:{click:()=>start(true)}},has?'Nyt spil':'Start')),
    h('p',{class:'tnote'},'Brug høretelefoner. Tryk på et ord for at se, hvad det betyder.')))}
async function start(fresh){audioWake();sfx('sel');$('#title').hidden=true;
  if(fresh){const keep={seen:S.seen,tapped:S.tapped,items:S.items,free:S.free,vol:S.vol,textSize:S.textSize};S=Object.assign(freshSave(),keep);FL=S.flags;
    S.name=await askName();save();GAME.mode='play';GAME.scene=null;await goScene('train')}
  else{GAME.mode='play';const sc=S.scene||'train';GAME.scene=null;await goScene(sc,{at:S.x});idlePanel()}}
function askName(){return new Promise(res=>{setPanel('chal');pbody.innerHTML='';const inp=h('input',{class:'inp',type:'text',maxlength:16,placeholder:'Dit navn',value:S.name||''});
  const go=()=>{const v=inp.value.trim();if(!v)return inp.focus();sfx('ok');res(v.charAt(0).toUpperCase()+v.slice(1))};
  pbody.append(h('div',{class:'q'},'Hvad hedder du?'),h('div',{class:'irow'},inp),h('div',{class:'prow end'},h('button',{class:'btn pri',type:'button',on:{click:go}},'Start')));inp.addEventListener('keydown',e=>{if(e.key==='Enter')go()});setTimeout(()=>inp.focus(),50)})}
// save position now and then
setInterval(()=>{if(GAME.mode==='play'&&S){S.x=P.x;save()}},4000);
addEventListener('pagehide',()=>{if(S){S.x=P.x;save()}});
load();applyTextSize();titleScreen();requestAnimationFrame(loop);
// keyboard: space/enter advances dialogue
addEventListener('keydown',e=>{if((e.key===' '||e.key==='Enter')&&panel.classList.contains('say')&&!e.target.closest('input,textarea')){e.preventDefault();panel.click()}});
