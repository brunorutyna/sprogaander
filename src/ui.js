/* ================= DOM HELPERS ================= */
const $=s=>document.querySelector(s);
function h(tag,attrs,...kids){const e=document.createElement(tag);if(attrs)for(const k in attrs){if(k==='on')for(const ev in attrs.on)e.addEventListener(ev,attrs.on[ev]);else if(k==='html')e.innerHTML=attrs[k];else if(attrs[k]!==false&&attrs[k]!=null)e.setAttribute(k,attrs[k])}for(const c of kids.flat()){if(c==null||c===false)continue;e.append(c.nodeType?c:document.createTextNode(c))}return e}
const ICON={spk:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 9a4 4 0 010 6"/></svg>'};
let toastT;function toast(t){const e=$('#toast');e.textContent=t;e.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>e.hidden=true,2600)}
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
const norm=s=>s.toLowerCase().replace(/é/g,'e').replace(/["„“”']/g,'').replace(/[.?!,]+$/,'').replace(/\s+/g,' ').trim();
function lev(a,b){const m=a.length,n=b.length;if(Math.abs(m-n)>1)return 2;const d=Array.from({length:m+1},(_,i)=>[i]);for(let j=1;j<=n;j++)d[0][j]=j;for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[m][n]}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function spriteImg(c,size,cls){const e=mkc(c.width,c.height);e.getContext('2d').drawImage(c,0,0);e.className=cls||'img';e.style.width=size+'px';e.style.height=size+'px';return e}
const spiritEl=(sp,size,cls)=>spriteImg(spiritImage(sp,size),size,cls);const personEl=(look,size,cls)=>spriteImg(personImage(look,size),size,cls);

/* ================= INPUT ================= */
const held={u:0,d:0,l:0,r:0};let heldOrder=[];
const modal=[];
function topModal(){return modal[modal.length-1]}
function sheetOpen(){return !$('#sheet').hidden}
let sheetKeyFn=null;
function press(k){
  if(sheetOpen()){if(sheetKeyFn)sheetKeyFn(k);return}
  const m=topModal();if(m){m.key(k);return}
  if(typeof worldPress==='function')worldPress(k);
}
function setHeld(d,v){held[d]=v;heldOrder=heldOrder.filter(x=>x!==d);if(v)heldOrder.push(d)}
function curHeld(){return heldOrder[heldOrder.length-1]||null}
const KEYMAP={ArrowUp:'u',ArrowDown:'d',ArrowLeft:'l',ArrowRight:'r',w:'u',s:'d',a:'l',d:'r',W:'u',S:'d',A:'l',D:'r',z:'a',Z:'a',' ':'a',x:'b',X:'b',Escape:'b',Backspace:'b',Enter:'enter',Shift:'select',q:'b',e:'select'};
addEventListener('keydown',e=>{
  if(e.target&&(e.target.tagName==='INPUT'))return;
  if(sheetOpen()&&e.key!=='Escape'&&!/^Arrow/.test(e.key)&&!/^[1-9]$/.test(e.key)&&e.key!=='Enter'&&e.key!==' ')return;
  let k=KEYMAP[e.key];if(/^[1-9]$/.test(e.key)&&sheetOpen())k=e.key;
  if(!k)return;e.preventDefault();
  if(k==='enter')k=(!sheetOpen()&&!topModal()&&GAME.mode==='world')?'start':'a';
  if('udlr'.includes(k)&&k.length===1){if(!held[k]){setHeld(k,1);press(k)}return}
  if(!e.repeat)press(k);
});
addEventListener('keyup',e=>{const k=KEYMAP[e.key];if(k&&'udlr'.includes(k)&&k.length===1)setHeld(k,0)});
addEventListener('blur',()=>{for(const k of'udlr')setHeld(k,0)});
function bindPad(){
  const pad=$('#dpad');let pid=null,cur=null;
  const dirAt=(e)=>{const r=pad.getBoundingClientRect();const dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);if(Math.hypot(dx,dy)<10)return cur;return Math.abs(dx)>Math.abs(dy)?(dx>0?'r':'l'):(dy>0?'d':'u')};
  const set=d=>{if(d===cur)return;if(cur)setHeld(cur,0);cur=d;pad.dataset.dir=d||'';if(d){setHeld(d,1);press(d)}};
  pad.addEventListener('pointerdown',e=>{e.preventDefault();pid=e.pointerId;try{pad.setPointerCapture(pid)}catch(_){}set(dirAt(e));audioWake()});
  pad.addEventListener('pointermove',e=>{if(e.pointerId===pid)set(dirAt(e))});
  const up=e=>{if(e.pointerId===pid){pid=null;set(null)}};pad.addEventListener('pointerup',up);pad.addEventListener('pointercancel',up);
  document.querySelectorAll('[data-k]').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();b.classList.add('dn');audioWake();try{navigator.vibrate&&navigator.vibrate(8)}catch(_){}press(b.dataset.k)}));
  document.querySelectorAll('[data-k]').forEach(b=>{const u=()=>b.classList.remove('dn');b.addEventListener('pointerup',u);b.addEventListener('pointerleave',u)});
}

/* ================= DIALOGUE ================= */
const dlg=()=>$('#dlg');
let typing=null;
const nm=s=>String(s==null?'':s).replace(/\{N\}/g,S.name||'Bruno');
function say(da,en,opt={}){da=nm(da);en=nm(en);return new Promise(res=>{
  const box=dlg();box.hidden=false;box.innerHTML='';
  const showEn=S.en;
  const txt=h('p',{class:'da'});const enP=h('p',{class:'en',hidden:showEn?false:''},en||'');
  const tools=h('div',{class:'tools'});
  if(en){const b=h('button',{class:'chip',type:'button','aria-label':'Vis engelsk'},'EN');b.addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault();enP.hidden=!enP.hidden;b.classList.toggle('on',!enP.hidden)});if(showEn)b.classList.add('on');tools.append(b)}
  if(daVoice&&S.sound&&!opt.nospeak){const b=h('button',{class:'chip',type:'button','aria-label':'Læs højt',html:ICON.spk});b.addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault();speak(da)});tools.append(b)}
  if(opt.who)box.append(h('div',{class:'who'},opt.who));
  box.append(tools,txt,enP,h('i',{class:'more',hidden:''}));
  const html=String(da).replace(/\n/g,'<br>');
  let done=false,full=false;
  const finishType=()=>{full=true;clearInterval(typing);txt.innerHTML=html;box.querySelector('.more').hidden=!!opt.keep};
  if(/[<]/.test(html)||opt.instant){finishType()}else{let i=0;const plainT=String(da);txt.textContent='';
    typing=setInterval(()=>{i+=2;txt.innerHTML=plainT.slice(0,i).replace(/\n/g,'<br>');if(i>=plainT.length)finishType()},16)}
  if(opt.keep){/* caller resolves after typing */const chk=setInterval(()=>{if(full){clearInterval(chk);res()}},20);
    const m={key:k=>{if(!full&&(k==='a'||k==='b'))finishType()}};modal.push(m);box._m=m;return}
  const m={key:k=>{if(k!=='a'&&k!=='b')return;if(!full){finishType();return}if(done)return;done=true;modal.splice(modal.indexOf(m),1);sfx('sel');if(!opt.stay)box.hidden=true;res()}};
  modal.push(m);
  box.onpointerdown=e=>{e.preventDefault();m.key('a')};
})}
function dropKeep(){const box=dlg();if(box._m){const i=modal.indexOf(box._m);if(i>=0)modal.splice(i,1);box._m=null}}
function hideDlg(){dropKeep();dlg().hidden=true}
async function talk(lines,who){for(const[da,en]of lines)await say(da,en,{who})}

/* generic list menu in the screen; resolves value or null on B */
function menu(items,opt={}){return new Promise(res=>{
  const w=h('div',{class:'win menu '+(opt.cls||'')});
  if(opt.title)w.append(h('div',{class:'mt'},opt.title));
  const list=h('div',{class:'ml'+(opt.cols===2?' two':'')});w.append(list);
  let i=Math.max(0,items.findIndex(x=>!x.disabled));
  const btns=items.map((it,k)=>{const b=h('button',{class:'mi',type:'button'},h('span',{class:'cur'},'▶'),h('span',{class:'lab'},it.label),it.sub?h('span',{class:'sub'},it.sub):null);
    if(it.disabled)b.classList.add('off');
    b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(it.disabled){sfx('bump');return}i=k;paint();choose()});list.append(b);return b});
  function paint(){btns.forEach((b,k)=>b.classList.toggle('on',k===i));const it=items[i];if(opt.onMove)opt.onMove(it,i)}
  function choose(){const it=items[i];if(!it||it.disabled){sfx('bump');return}sfx('sel');close(it.value===undefined?i:it.value)}
  function close(v){modal.splice(modal.indexOf(m),1);w.remove();res(v)}
  const step=(dx,dy)=>{const cols=opt.cols||1;let n=i;for(let t=0;t<items.length;t++){n=cols===2?(dx?(n%2?n-1:n+1):(n+dy*2+items.length)%items.length):(n+dy+items.length)%items.length;if(n<0||n>=items.length)break;if(!items[n].disabled)break}if(n>=0&&n<items.length&&!items[n].disabled){i=n;paint()}};
  const m={key:k=>{if(k==='u')step(0,-1);else if(k==='d')step(0,1);else if(k==='l'||k==='r'){if(opt.cols===2)step(1,0)}else if(k==='a')choose();else if(k==='b'&&!opt.noCancel){sfx('sel');close(null)}else if(k==='start'&&opt.startCloses)close(null)}};
  modal.push(m);$('#screen').append(w);paint();
})}
async function ask(da,en,opts=[['Ja',true],['Nej',false]],who){await say(da,en,{keep:true,who});const v=await menu(opts.map(([l,v])=>({label:l,value:v})),{cls:'yn',noCancel:false});hideDlg();return v===null?opts[opts.length-1][1]:v}

/* ================= SHEET (challenges + panels) ================= */
function openSheet(cls){const s=$('#sheet');s.hidden=false;s.className=cls||'';const p=$('#sheetIn');p.innerHTML='';p.scrollTop=0;openedAt=performance.now();return p}
let openedAt=0;
['click','pointerup','pointerdown'].forEach(ev=>$('#sheet').addEventListener(ev,e=>{if(performance.now()-openedAt<380){e.stopPropagation();e.preventDefault()}},true));
function closeSheet(){$('#sheet').hidden=true;sheetKeyFn=null}

/* ctx: {who, sub, sprite, mine:{name,hp,max}, theirs:{name,hp,max}, label} → Promise<{ok,typed}> */
function challenge(it,ctx={}){window.__it=it;return new Promise(res=>{
  const p=openSheet('chal');
  const head=h('div',{class:'shead'});
  if(ctx.spirit)head.append(spiritEl(ctx.spirit,64,'img spr'));else if(ctx.look)head.append(personEl(ctx.look,64,'img spr'));
  head.append(h('div',{class:'st'},h('div',{class:'eyebrow'},ctx.sub||TOPICS[it.topic][2]),h('h3',null,ctx.who||'Spørgsmål'),
    ctx.theirs?hpLine(ctx.theirs):null));
  p.append(head);
  const dlgQ=/^—\s/.test(it.q)&&!it.q.includes('…');
  let line=null;
  if(dlgQ){line=it.q.replace(/^—\s*/,'');setTimeout(()=>speak(line),200)}
  if(line)p.append(h('div',{class:'line'},h('p',null,line),daVoice&&S.sound?spkBtn(line):null));
  const INST={mc:['Vælg','choose the right answer'],listen:['Lyt','listen, then choose'],order:['Byg sætningen','tap the pieces in order'],type:['Skriv','type the answer']};
  const ik=it.listen?'listen':it.t;
  p.append(h('p',{class:'inst'},h('b',null,INST[ik][0]),' · '+INST[ik][1]+(ctx.label?' · '+ctx.label:'')));
  const promptEl=h('div',{class:'prompt'},h('span',null,dlgQ?'Hvad svarer du?':it.q));
  if(it.listen&&daVoice)promptEl.append(spkBtn(it.sayAs?it.say:it.say));
  p.append(promptEl);
  if(it.listen&&!daVoice)p.append(h('div',{class:'transcript'},`«${it.say}»`,h('small',null,'Ingen dansk stemme på enheden. Læs teksten højt for dig selv.')));
  const area=h('div');p.append(area);
  const fbBox=h('div');p.append(fbBox);
  const hintBtn=h('button',{class:'btn ghost',type:'button',disabled:S.bag.ordbog<1?'':false},`Ordbog (${S.bag.ordbog})`);
  const nextBtn=h('button',{class:'btn pri',type:'button',hidden:''},'Videre ▶');
  p.append(h('div',{class:'foot'},hintBtn,h('span',{class:'sp'}),nextBtn));
  let done=false,isTyped=false;
  function finish(ok,near){if(done)return;done=true;record(it,ok);sfx(ok?'ok':'bad');hintBtn.hidden=true;
    const praise=['Rigtigt!','Flot!','Godt klaret!','Præcis!','Sådan!'];
    const ansTxt=it.t==='order'?it.a.join(' '):it.t==='type'?it.a[0]:it.a;
    fbBox.append(h('div',{class:'fb '+(ok?'ok':'no')},h('h4',null,ok?praise[Math.floor(Math.random()*praise.length)]:(near?'Næsten! Se stavningen.':'Ikke helt.')),
      !ok?h('p',{class:'ans'},'Svar: '+ansTxt):null,
      it.listen&&daVoice?h('p',{class:'ans dim'},'«'+it.say+'»'):null,
      h('p',{class:'x'},it.x)));
    const fs=fullSentence(it);if(fs)setTimeout(()=>speak(fs),250);
    nextBtn.hidden=false;
    nextBtn.onclick=()=>{closeSheet();res({ok,typed:isTyped&&ok})};
    sheetKeyFn=k=>{if(k==='a')nextBtn.click()};
    setTimeout(()=>fbBox.scrollIntoView({block:'nearest',behavior:'smooth'}),30);
  }
  const useHint=()=>{if(S.bag.ordbog<1)return false;S.bag.ordbog--;save();hintBtn.textContent=`Ordbog (${S.bag.ordbog})`;hintBtn.disabled=true;return true};
  if(it.t==='mc'){
    const opts=shuffle([it.a,...it.w]);const btns=[];
    const box=h('div',{class:'opts'});
    opts.forEach((o,i)=>{const b=h('button',{class:'opt',type:'button'},h('kbd',null,String(i+1)),h('span',null,o));
      b.onclick=()=>{if(done)return;btns.forEach(x=>{x.disabled=true;if(x._v===it.a)x.classList.add('ok')});if(o!==it.a)b.classList.add('no');finish(o===it.a)};
      b._v=o;btns.push(b);box.append(b)});
    area.append(box);
    sheetKeyFn=k=>{const n=parseInt(k,10);if(n>=1&&n<=btns.length&&!done)btns[n-1].click()};
    hintBtn.onclick=()=>{if(!useHint())return;let k=0;for(const b of shuffle(btns)){if(b._v!==it.a&&k<Math.max(1,btns.length-2)){b.disabled=true;b.classList.add('gone');k++}}};
    if(it.listen)setTimeout(()=>speak(it.say),300);
  }else if(it.t==='order'){
    const slots=h('div',{class:'slots'}),pool=h('div',{class:'pool'});
    const fixed=it.a.slice(0,it.fix),rest=it.a.slice(it.fix);
    let placed=[];let poolItems=shuffle(rest.map((w,i)=>({w,i})));
    if(poolItems.length>1&&poolItems.every((q,k)=>q.i===k))poolItems.reverse();
    const check=h('button',{class:'btn pri',type:'button',disabled:''},'Tjek');
    function paint(){slots.innerHTML='';pool.innerHTML='';
      fixed.forEach(w=>slots.append(h('span',{class:'chipw fixed'},w)));
      placed.forEach((q,k)=>slots.append(h('button',{class:'chipw placed',type:'button',on:{click:()=>{if(done)return;placed.splice(k,1);poolItems.push(q);paint()}}},q.w)));
      poolItems.forEach((q,k)=>pool.append(h('button',{class:'chipw',type:'button',on:{click:()=>{if(done)return;poolItems.splice(k,1);placed.push(q);paint()}}},q.w)));
      check.disabled=poolItems.length>0||done;}
    paint();
    check.onclick=()=>{const got=[...fixed,...placed.map(q=>q.w)].join(' ');check.hidden=true;slots.classList.add('locked');finish(norm(got)===norm(it.a.join(' ')))};
    area.append(slots,pool,check);
    sheetKeyFn=k=>{if(k==='a'&&!check.disabled)check.click()};
    hintBtn.onclick=()=>{if(!useHint())return;let k=0;while(k<placed.length&&placed[k].w===rest[k])k++;
      poolItems.push(...placed.splice(k));for(let t=0;t<2;t++){const nx=poolItems.findIndex(q=>q.w===rest[k+t]);if(nx>=0)placed.push(...poolItems.splice(nx,1))}paint()};
  }else{
    isTyped=true;
    const inp=h('input',{id:'ans-'+it.id,type:'text',autocomplete:'off',autocapitalize:'off',autocorrect:'off',spellcheck:'false',enterkeyhint:'done','aria-label':'Dit svar'});
    const go=h('button',{class:'btn pri',type:'button'},'Tjek');
    const keys=h('div',{class:'keys'},...['æ','ø','å','é'].map(ch=>h('button',{type:'button',on:{click:()=>{const s=inp.selectionStart??inp.value.length,e=inp.selectionEnd??s;inp.value=inp.value.slice(0,s)+ch+inp.value.slice(e);inp.focus();inp.setSelectionRange(s+1,s+1)}}},ch)));
    area.append(h('div',{class:'typebox'},inp,go),keys);
    const submit=()=>{if(done||!inp.value.trim())return;const v=norm(inp.value);const ok=it.a.some(a=>norm(a)===v);
      const near=!ok&&it.a.some(a=>lev(norm(a),v)===1&&v.length>3);inp.disabled=true;go.hidden=true;keys.hidden=true;finish(ok,near)};
    go.onclick=submit;inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();e.stopPropagation();submit()}});
    setTimeout(()=>inp.focus({preventScroll:true}),80);
    hintBtn.onclick=()=>{if(!useHint())return;const a=it.a[0];inp.value=a.slice(0,Math.max(1,Math.ceil(a.length/2)));inp.focus()};
    sheetKeyFn=null;
  }
})}
function spkBtn(text){return h('button',{class:'spk',type:'button','aria-label':'Lyt',html:ICON.spk,on:{click:()=>speak(text)}})}
function hpLine(o){const f=Math.max(0,o.hp/o.max);return h('div',{class:'hpl'},h('span',null,'HP'),h('i',null,h('s',{style:`width:${f*100}%`,class:f<.25?'red':f<.5?'yel':''})))}
function fullSentence(it){
  if(it.listen||it.t==='type')return '';
  if(it.t==='order')return it.a.join(' ');
  if(it.ea)return '';
  const ans=it.a;
  if(it.q.split('…').length===2)return it.q.replace(/^\(.*?\)\s*/,'').replace(/^—\s*/,'').replace(/\s*\([^)]*\)\s*$/,'').replace('…',ans);
  return /\s/.test(ans)?ans:'';
}

/* panel wrapper: returns a promise resolved when closed */
// Panels stack: opening one from another (e.g. Åndebog → a spirit) and closing it returns to the one below.
// Every panel's promise resolves when it closes, so whoever awaited the menu gets control back.
const PANELS=[];let afterPanels=null;
function renderPanel(e){const p=openSheet('panel '+(e.cls||''));
  p.append(h('div',{class:'phead'},h('h2',null,e.title),h('button',{class:'xbtn',type:'button','aria-label':'Luk',on:{click:e.close}},'✕')));
  const body=h('div',{class:'pbody'});p.append(body);e.build(body,e.close);sheetKeyFn=k=>{if(k==='b')e.close()}}
function panel(title,build,cls){return new Promise(res=>{const e={title,build,cls,res};
  e.close=()=>{const i=PANELS.indexOf(e);if(i<0)return;const gone=PANELS.splice(i);closeSheet();
    for(const g of gone)g.res();if(PANELS.length&&!afterPanels)renderPanel(PANELS[PANELS.length-1])};
  PANELS.push(e);renderPanel(e)})}
// Close every open panel, then run fn once the menu has unwound (keeps the world locked meanwhile).
function thenAfterPanels(fn){afterPanels=fn;const all=PANELS.splice(0);closeSheet();for(const g of all)g.res()}
async function runAfterPanels(){while(afterPanels){const f=afterPanels;afterPanels=null;await f()}}
