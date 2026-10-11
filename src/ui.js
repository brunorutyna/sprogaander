/* ================= UI: dialogue panel, glosses, challenges, menus ================= */
const $=s=>document.querySelector(s);
const panel=$('#panel'),pbody=$('#pbody');
function h(tag,attrs,...kids){const e=document.createElement(tag);if(attrs)for(const k in attrs){const v=attrs[k];if(v==null||v===false)continue;if(k==='on'){for(const ev in v)e.addEventListener(ev,v[ev])}else if(k==='class')e.className=v;else if(k==='html')e.innerHTML=v;else e.setAttribute(k,v===true?'':v)}
  for(const c of kids.flat()){if(c==null||c===false)continue;e.append(c.nodeType?c:document.createTextNode(c))}return e}
const nameOf=t=>t.replace(/\{N\}/g,S.name||'du');

/* ---------------------------------------------------------------- voice */
const VO={src:null,raf:0,token:0};
/* audio clips live in two packed bundles (audio/l.ogg, audio/w.ogg) + index.json; played through Web Audio */
const PACK={idx:null,bin:{},dec:{},ready:null,wready:null};
PACK.ready=(async()=>{try{PACK.idx=await (await fetch('audio/index.json')).json();PACK.bin.l=await (await fetch('audio/l.ogg')).arrayBuffer();
  PACK.wready=fetch('audio/w.ogg').then(r=>r.arrayBuffer()).then(b=>PACK.bin.w=b).catch(()=>{})}catch(e){console.warn('audio pack',e)}})();
async function clipBuffer(key){if(PACK.dec[key])return PACK.dec[key];await Promise.race([PACK.ready,sleep(15000)]);if(key[0]==='w'&&PACK.wready)await Promise.race([PACK.wready,sleep(15000)]);
  const e=PACK.idx&&PACK.idx[key];const C=auInit();if(!e||!PACK.bin[e[0]]||!C)return null;
  try{const buf=await C.decodeAudioData(PACK.bin[e[0]].slice(e[1],e[1]+e[2]));return PACK.dec[key]=buf}catch(err){console.warn('decode',key,err);return null}}
function voiceOut(){const C=AU.ctx;if(!VO.gain){VO.gain=C.createGain();VO.gain.connect(C.destination)}VO.gain.gain.value=Math.min(1,S.vol.voice??1);return VO.gain}
async function playClip(key,onTime){const my=++VO.token;stopVoice(true);audioWake();const buf=await clipBuffer(key);if(my!==VO.token)return'cancel';if(!buf)return null;
  const C=AU.ctx;const src=C.createBufferSource();src.buffer=buf;src.connect(voiceOut());const t0=C.currentTime+.03;src.start(t0);VO.src=src;
  return new Promise(res=>{const dur=buf.duration-.15;const tick=()=>{if(my!==VO.token)return res('cancel');const k=(C.currentTime-t0)/dur;if(onTime)onTime(k);if(C.currentTime-t0>=buf.duration)return res('ok');VO.raf=requestAnimationFrame(tick)};tick();src.onended=()=>{if(onTime)onTime(1.01);res('ok')}})}
async function playLine(who,text,slow,onTime){if(who==='du'||!text)return;const r=await playClip('l/'+lineId(who,text)+(slow?'s':''),onTime);if(r===null)return fakeTime(text,onTime)}
function fakeTime(text,onTime){const my=VO.token;const dur=Math.max(900,text.length*62);const t0=performance.now();return new Promise(r=>{const tick=()=>{if(my!==VO.token)return r();const k=(performance.now()-t0)/dur;if(onTime)onTime(k);if(k>=1)return r();VO.raf=requestAnimationFrame(tick)};tick()})}
function stopVoice(keepToken){if(!keepToken)VO.token++;if(VO.src){try{VO.src.stop()}catch(e){}VO.src=null}if(VO.raf)cancelAnimationFrame(VO.raf)}
function playWord(w){playClip('w/'+wordId(w))}

/* ---------------------------------------------------------------- tokenised, tappable Danish text */
function tokens(text){const out=[];const re=/([A-Za-zÆØÅæøåÉé]+)|([^A-Za-zÆØÅæøåÉé]+)/g;let m;while((m=re.exec(text)))out.push(m[1]?{w:m[1]}:{p:m[2]});return out}
function richText(text,opt={}){const toks=tokens(text);const words=toks.map((t,i)=>t.w?i:-1).filter(i=>i>=0);const wrap=h('span',{class:'rt'});const spans=[];
  // chunk detection on the word sequence
  const lw=words.map(i=>toks[i].w.toLowerCase());const chunkAt={};for(let k=0;k<lw.length;k++){for(const c of CHUNKS){if(c.toks.every((t,j)=>lw[k+j]===t)){chunkAt[k]={c,n:c.toks.length};break}}}
  let k=0;for(let i=0;i<toks.length;i++){const t=toks[i];if(!t.w){wrap.append(t.p);continue}
    const ch=chunkAt[k];if(ch&&!opt.noChunk){const grp=h('span',{class:'chunk',title:ch.c.w});grp.addEventListener('click',e=>{e.stopPropagation();gloss(ch.c.w,ch.c)});
      let n=ch.n;let j=i;while(n>0&&j<toks.length){const tt=toks[j];if(tt.w){const s=wordSpan(tt.w,true);grp.append(s);spans.push(s);n--;k++}else grp.append(tt.p);j++}i=j-1;wrap.append(grp);continue}
    const s=wordSpan(t.w);wrap.append(s);spans.push(s);k++}
  wrap._spans=spans;return wrap}
function wordSpan(w,inChunk){const e=lookup(w);const lw=w.toLowerCase();const seen=S.seen[lw]||0;const s=h('span',{class:'w'+(e?'':' nog')+(seen<2&&e&&!['pron','konj','prep','art'].includes(e.k)?' new':'')},w);
  if(!inChunk)s.addEventListener('click',ev=>{ev.stopPropagation();gloss(w)});else s.addEventListener('click',ev=>{ev.stopPropagation();gloss(w)});return s}
function markSeen(text){for(const t of tokens(text))if(t.w){const k=t.w.toLowerCase();S.seen[k]=(S.seen[k]||0)+1}}

/* ---------------------------------------------------------------- gloss card */
function gloss(w,chunk){const e=chunk||lookup(w);stopVoice();const lw=w.toLowerCase();S.tapped[chunk?chunk.w:lw]=(S.tapped[chunk?chunk.w:lw]||0)+1;save();
  const card=$('#gloss');card.innerHTML='';card.hidden=false;playWord(chunk?chunk.w:lw);
  if(!e){card.append(h('div',{class:'gw'},h('b',null,w)),h('p',{class:'gd'},'Det ord kender jeg ikke endnu.'));return}
  const isWrong=e.k==='fejl';
  card.append(...[h('div',{class:'gtop'},e.p?h('span',{class:'gpic'},e.p):null,h('div',null,h('b',{class:'gword'+(isWrong?' bad':'')},chunk?chunk.w:(e.w===lw?w:lw)),
      chunk||e.w===lw?null:h('small',{class:'glemma'},'grundform: '+e.w),h('small',{class:'gkind'},KIND_DA[e.k]||'')),
    h('button',{class:'ib',type:'button','aria-label':'Hør ordet',on:{click:()=>playWord(chunk?chunk.w:lw)}},'🔊')),
    h('p',{class:'gd'},richText(e.d,{noChunk:true})),
    e.g?h('p',{class:'gg'},e.g):null,
    h('details',{class:'gen'},h('summary',null,'engelsk'),h('span',null,e.en)),
    h('button',{class:'gclose',type:'button',on:{click:()=>card.hidden=true}},'OK')].filter(Boolean))}
document.addEventListener('pointerdown',e=>{const c=$('#gloss');if(!c.hidden&&!c.contains(e.target)&&!e.target.closest('.w,.chunk'))c.hidden=true},true);

/* ---------------------------------------------------------------- dialogue */
function setPanel(cls){panel.className=cls||''}
function speakerTag(who){const c=CHARS[who];if(!c||!c.name)return null;return h('div',{class:'who',style:`--c:${c.col}`},c.name)}
function say(who,text,o={}){text=nameOf(text);markSeen(text);GAME.lastLine={who,text};if(o.show)showWords(who,o.show);
  return new Promise(res=>{let simple=false,slow=false;GAME.talker=who;setPanel('say'+(who==='fort'?' narr':''));pbody.innerHTML='';
    const txtBox=h('div',{class:'line'});const enBox=h('p',{class:'en',hidden:true},o.e||'');const setEn=()=>{enBox.textContent=(simple&&o.s?(o.se||o.e):o.e)||''};
    const render=()=>{txtBox.innerHTML='';const t=simple&&o.s?o.s:text;const rt=richText(t);txtBox.append(rt);return rt};
    let rt=render();
    const hi=k=>{const n=rt._spans.length;if(!n)return;const lens=rt._spans.map(s=>s.textContent.length+1);const tot=lens.reduce((a,b)=>a+b,0);let acc=0;const pos=Math.max(0,Math.min(1,k))*tot;
      rt._spans.forEach((s,i)=>{acc+=lens[i];s.classList.toggle('on',acc-lens[i]<=pos&&pos<acc&&k<1);s.classList.toggle('said',acc<=pos)})};
    const speak=()=>{const t=simple&&o.s?o.s:text;rt.classList.remove('done');return playLine(who,t,slow,hi).then(()=>{rt._spans.forEach(s=>{s.classList.remove('on');s.classList.add('said')})})};
    const tools=h('div',{class:'tools'});
    if(who!=='du'){tools.append(h('button',{class:'tb',type:'button',title:'Hør igen',on:{click:e=>{e.stopPropagation();speak()}}},'↻'),
      h('button',{class:'tb',type:'button',title:'Langsomt',on:{click:e=>{e.stopPropagation();slow=!slow;e.currentTarget.classList.toggle('on',slow);speak()}}},'🐢'));
      if(o.s)tools.append(h('button',{class:'tb wide',type:'button',on:{click:e=>{e.stopPropagation();simple=!simple;e.currentTarget.classList.toggle('on',simple);rt=render();setEn();speak()}}},'enklere'));}
    if(o.e)tools.append(h('button',{class:'tb wide',type:'button',on:{click:e=>{e.stopPropagation();enBox.hidden=!enBox.hidden;e.currentTarget.classList.toggle('on',!enBox.hidden)}}},'EN'));
    const next=h('button',{class:'next',type:'button','aria-label':'Videre'},'›');
    pbody.append(speakerTag(who)||'',txtBox,enBox,h('div',{class:'prow'},tools,next));
    let done=false;const fin=()=>{if(done)return;done=true;stopVoice();GAME.talker=null;res()};
    next.addEventListener('click',e=>{e.stopPropagation();sfx('page');fin()});
    speak();})}
function idlePanel(){if(GAME.mode!=='play')return;setPanel('idle');pbody.innerHTML='';const sc=SCENES[GAME.scene];
  pbody.append(h('div',{class:'place'},sc.name),S.hint?h('p',{class:'hint'},richText(S.hint)):h('p',{class:'hint dim'},'Tryk et sted for at gå. Tryk på folk og ting.'),
    h('div',{class:'prow'},h('div',{class:'tools'},h('button',{class:'tb wide',type:'button',on:{click:notebook}},'📓 Notesbog'),h('button',{class:'tb',type:'button','aria-label':'Menu',on:{click:menu}},'⚙'))))}
let placeT=null;function showPlace(){const p=$('#place');p.textContent=SCENES[GAME.scene].name;p.hidden=false;p.classList.remove('out');clearTimeout(placeT);placeT=setTimeout(()=>p.classList.add('out'),2200)}

/* ---------------------------------------------------------------- challenges */
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const norm=s=>s.toLowerCase().replace(/[.,!?»«"]/g,'').replace(/\s+/g,' ').trim();
function record(id,ok){const it=S.items[id]||(S.items[id]={ok:0,bad:0});if(ok)it.ok++;else it.bad++;it.last=Date.now();save()}
function feedback(ok,c,extra){const box=h('div',{class:'fb '+(ok?'ok':'bad')},h('b',null,ok?['Rigtigt.','Præcis.','Godt.','Ja.'][Math.floor(Math.random()*4)]:'Ikke helt.'),c.why?h('p',null,richText(c.why)):null,
  c.e?h('details',{class:'gen'},h('summary',null,'engelsk'),h('span',null,c.e)):null,extra||null);return box}
function cont(label){return new Promise(r=>{const b=h('button',{class:'btn pri',type:'button',on:{click:()=>{sfx('page');r()}}},label||'Videre');pbody.append(h('div',{class:'prow end'},b));b.focus()})}
async function challenge(kind,c){GAME.talker=null;window.__chal={kind,c};setPanel('chal');const fn={pick:chPick,build:chBuild,fix:c.opts?chFixPick:chBuild,gaps:chGaps,type:chType,listen:chListen,free:chFree}[kind];const r=await fn(c,kind);setPanel('say');return r}
function ctxLine(){const last=GAME.lastLine;if(!last||last.who==='du')return null;return h('div',{class:'ctx'},h('button',{class:'tb',type:'button',on:{click:()=>playLine(last.who,last.text,false)}},'↻'),richText(last.text))}
async function chPick(c){let tries=0;
  for(;;){pbody.innerHTML='';pbody.append(ctxLine()||'',h('div',{class:'q'},'Vælg det rigtige svar'));const opts=shuffle(c.opts.map((t,i)=>({t:nameOf(t),i})));const list=h('div',{class:'opts'});pbody.append(list);
    const pick=await new Promise(res=>{for(const o of opts)list.append(h('button',{class:'opt',type:'button',on:{click:()=>res(o)}},o.t))});
    const ok=pick.i===c.a;record(c.id,ok&&tries===0);[...list.children].forEach(b=>{b.disabled=true;if(b.textContent===nameOf(c.opts[c.a])&&ok)b.classList.add('right');if(b.textContent===pick.t&&!ok)b.classList.add('wrong')});
    sfx(ok?'ok':'bad');
    if(ok){pbody.append(feedback(true,c));await cont();return true}
    if(c.react&&c.react[pick.i]){await runSteps(c.react[pick.i]);setPanel('chal')}else{pbody.append(feedback(false,c));await cont('Prøv igen')}
    tries++;if(tries>=2){pbody.innerHTML='';pbody.append(h('div',{class:'q'},'Det rigtige svar:'),h('div',{class:'solution'},richText(nameOf(c.opts[c.a]))),feedback(true,c));await cont();return false}}}
async function chFixPick(c){let tries=0;for(;;){pbody.innerHTML='';pbody.append(h('div',{class:'q'},'Ret sætningen'),h('div',{class:'broken'},richText(c.broken)),h('div',{class:'q'},'Hvilken er rigtig?'));
    const list=h('div',{class:'opts'});pbody.append(list);const pick=await new Promise(r=>{for(const o of shuffle(c.opts.map((t,i)=>({t,i}))))list.append(h('button',{class:'opt',type:'button',on:{click:()=>r(o)}},o.t))});
    const ok=pick.i===c.a;record(c.id,ok&&tries===0);sfx(ok?'ok':'bad');[...list.children].forEach(b=>{b.disabled=true;if(b.textContent===pick.t)b.classList.add(ok?'right':'wrong')});
    if(ok){pbody.append(feedback(true,c));await cont();return true}tries++;pbody.append(feedback(false,c));
    if(tries>=2){pbody.append(h('div',{class:'solution'},richText(c.opts[c.a])));await cont();return false}await cont('Prøv igen')}}
async function chBuild(c,kind){const target=c.words.split(' ').filter(t=>!/^[.,!?]$/.test(t));const lowerFirst=t=>{const e=lookup(t);return e&&e.k==='name'?t:t.toLowerCase()};
  const tgt=target.map((t,i)=>i===0?lowerFirst(t):t);let pool=shuffle(tgt.concat(c.extra||[]).map((t,i)=>({t,i})));let ans=[];let tries=0;
  const full=c.words.replace(/ ([.,!?])/g,'$1');
  return new Promise(res=>{const paint=(state)=>{pbody.innerHTML='';if(kind!=='fix')pbody.append(ctxLine()||'');
      if(kind==='fix'&&c.broken)pbody.append(h('div',{class:'q'},'Ret sætningen'),h('div',{class:'broken'},richText(c.broken)));else pbody.append(h('div',{class:'q'},'Byg sætningen'));
      const slot=h('div',{class:'slot'+(state==='bad'?' shake':'')});ans.forEach((o,k)=>slot.append(h('button',{class:'chip in'+(state==='bad'&&k===firstBad()?' wrong':''),type:'button',on:{click:()=>{ans.splice(k,1);pool.push(o);paint()}}},o.t)));
      if(!ans.length)slot.append(h('span',{class:'ph'},'Tryk på ordene i rigtig rækkefølge'));
      const pl=h('div',{class:'pool'});pool.forEach((o,k)=>pl.append(h('button',{class:'chip',type:'button',on:{click:()=>{sfx('sel');pool.splice(k,1);ans.push(o);paint()}}},o.t)));
      pbody.append(slot,pl,h('div',{class:'prow end'},h('button',{class:'btn',type:'button',on:{click:()=>{pool=pool.concat(ans);ans=[];paint()}}},'Ryd'),h('button',{class:'btn pri',type:'button',disabled:ans.length?false:true,on:{click:check}},'Tjek')));
      if(state==='bad')pbody.append(feedback(false,c))};
    const firstBad=()=>{for(let k=0;k<ans.length;k++)if(norm(ans[k].t)!==norm(tgt[k]||''))return k;return ans.length};
    const check=async()=>{const got=ans.map(o=>o.t).join(' ');const alts=[c.words].concat(c.alt||[]).map(norm);const ok=alts.includes(norm(got));
      if(ok){record(c.id,tries===0);sfx('ok');pbody.innerHTML='';pbody.append(h('div',{class:'q'},'Rigtigt'),h('div',{class:'solution'},richText(full)),feedback(true,c));await cont();return res(true)}
      tries++;sfx('bad');if(tries>=3){record(c.id,false);pbody.innerHTML='';pbody.append(h('div',{class:'q'},'Sådan skal den være:'),h('div',{class:'solution'},richText(full)),feedback(true,c));await cont();return res(false)}
      paint('bad')};
    const pickFix=async()=>{const opts=shuffle(c.opts.map((t,i)=>({t,i})));const list=h('div',{class:'opts'});pbody.append(list);
      const pick=await new Promise(r=>{for(const o of opts)list.append(h('button',{class:'opt',type:'button',on:{click:()=>r(o)}},o.t))});const ok=pick.i===c.a;record(c.id,ok&&tries===0);sfx(ok?'ok':'bad');
      if(ok){pbody.append(feedback(true,c));await cont();return res(true)}tries++;pbody.append(feedback(false,c));await cont(tries>=2?'Videre':'Prøv igen');if(tries>=2)return res(false);paint()};
    paint()})}
async function chGaps(c){const parts=[];const re=/\[([^\]]+)\]/g;let last=0,m;while((m=re.exec(c.text))){parts.push({t:c.text.slice(last,m.index)});const o=m[1].split('|');parts.push({gap:true,a:o[0],o:shuffle(o),v:null});last=re.lastIndex}parts.push({t:c.text.slice(last)});
  let tries=0;return new Promise(res=>{const paint=(bad)=>{pbody.innerHTML='';pbody.append(ctxLine()||'',h('div',{class:'q'},'Vælg de rigtige former'));const box=h('div',{class:'gaps'});
      for(const p of parts){if(!p.gap){box.append(richText(p.t));continue}const g=h('span',{class:'gap'+(bad&&p.v!==p.a?' wrong':'')});for(const o of p.o)g.append(h('button',{class:'chip sm'+(p.v===o?' sel':''),type:'button',on:{click:()=>{p.v=o;sfx('sel');paint()}}},o));box.append(g)}
      pbody.append(box,h('div',{class:'prow end'},h('button',{class:'btn pri',type:'button',disabled:parts.every(p=>!p.gap||p.v)?false:true,on:{click:check}},'Tjek')));if(bad)pbody.append(feedback(false,c))};
    const check=async()=>{const ok=parts.every(p=>!p.gap||p.v===p.a);if(ok||tries>=1){record(c.id,ok&&tries===0);sfx(ok?'ok':'bad');pbody.innerHTML='';const full=parts.map(p=>p.gap?p.a:p.t).join('');pbody.append(h('div',{class:'q'},ok?'Rigtigt':'Sådan skal den være:'),h('div',{class:'solution'},richText(full)),feedback(true,c));await cont();return res(ok)}
      tries++;sfx('bad');paint(true)};paint()})}
function micButton(input){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR)return null;
  const b=h('button',{class:'tb mic',type:'button','aria-label':'Tal'},'🎙');b.addEventListener('click',()=>{try{const r=new SR();r.lang='da-DK';r.interimResults=true;r.maxAlternatives=1;b.classList.add('on');
    r.onresult=e=>{input.value=[...e.results].map(x=>x[0].transcript).join(' ')};r.onend=()=>b.classList.remove('on');r.onerror=()=>b.classList.remove('on');r.start()}catch(e){b.classList.remove('on')}});return b}
async function chType(c){let tries=0;return new Promise(res=>{const paint=(bad)=>{pbody.innerHTML='';const inp=h('input',{class:'inp',type:'text',autocomplete:'off',autocapitalize:'off',spellcheck:'false',placeholder:'Skriv her …'});
    const hint=h('p',{class:'hint dim',hidden:true},c.hint||'');
    pbody.append(h('div',{class:'q'},richText(c.q)),h('div',{class:'irow'},inp,micButton(inp)),hint,h('div',{class:'prow end'},c.hint?h('button',{class:'btn',type:'button',on:{click:()=>hint.hidden=false}},'Hjælp'):null,h('button',{class:'btn pri',type:'button',on:{click:()=>check(inp.value)}},'Tjek')));
    if(bad)pbody.append(feedback(false,c));inp.addEventListener('keydown',e=>{if(e.key==='Enter')check(inp.value)});setTimeout(()=>inp.focus(),60)};
    const check=async v=>{if(!v.trim())return;const ok=c.a.map(norm).includes(norm(v));if(ok||tries>=2){record(c.id,ok&&tries===0);sfx(ok?'ok':'bad');pbody.innerHTML='';pbody.append(h('div',{class:'q'},ok?'Rigtigt':'Svaret er:'),h('div',{class:'solution'},richText(c.a[0])),feedback(true,c));await cont();return res(ok)}
      tries++;sfx('bad');paint(true)};paint()})}
async function chListen(c){const[who,text,o]=c.line;const L=nameOf(text);let tries=0;GAME.lastLine={who,text:L};
  return new Promise(res=>{let slow=false;const paint=(bad)=>{pbody.innerHTML='';
      const turtle=h('button',{class:'tb'+(slow?' on':''),type:'button',title:'Langsomt',on:{click:()=>{slow=!slow;turtle.classList.toggle('on',slow);playLine(who,L,slow)}}},'🐢');
      const pl=h('div',{class:'listen'},h('button',{class:'big',type:'button',on:{click:()=>playLine(who,L,slow)}},'🔊 Lyt'),turtle);
      const list=h('div',{class:'opts'});
      pbody.append(speakerTag(who)||'',pl,h('p',{class:'hint dim'},'Svarene siger det samme med andre ord.'),h('div',{class:'q'},richText(c.q)),list);
      for(const op of shuffle(c.opts.map((t,i)=>({t,i}))))list.append(h('button',{class:'opt',type:'button',on:{click:()=>pick(op)}},op.t));
      if(bad)pbody.append(h('p',{class:'hint'},'Ikke helt. Lyt én gang til – nu langsomt.'))};
    const pick=async(op)=>{const ok=op.i===c.a;sfx(ok?'ok':'bad');if(!ok&&tries<1){tries++;slow=true;paint(true);playLine(who,L,true);return}record(c.id,ok&&tries===0);
      pbody.innerHTML='';pbody.append(...[speakerTag(who),h('div',{class:'line'},richText(L)),o&&o.e?h('details',{class:'gen'},h('summary',null,'engelsk'),h('span',null,o.e)):null,
        h('div',{class:'fb '+(ok?'ok':'bad')},h('b',null,ok?'Rigtigt.':'Svaret var: '+c.opts[c.a]))].filter(Boolean));markSeen(L);await cont();res(ok)};
    paint();setTimeout(()=>playLine(who,L,false),300)})}
async function chFree(c){return new Promise(res=>{const paint=(msg)=>{pbody.innerHTML='';const inp=h('textarea',{class:'inp',rows:2,autocapitalize:'sentences',spellcheck:'false',placeholder:c.hint||''});
    pbody.append(h('div',{class:'q'},richText(c.q)),h('div',{class:'irow'},inp,micButton(inp)),msg?h('div',{class:'fb bad'},h('p',null,richText(msg))):'',
      h('div',{class:'prow end'},h('button',{class:'btn',type:'button',on:{click:()=>{inp.value=c.model}}},'Eksempel'),h('button',{class:'btn pri',type:'button',on:{click:()=>check(inp.value)}},'Send')));setTimeout(()=>inp.focus(),60)};
    let warned=false;const check=async v=>{v=v.trim();if(v.split(/\s+/).length<3)return paint('Skriv mindst tre ord.');const n=norm(v);
      if(!warned&&c.check==='fritid'&&/^i min fritid jeg\b/.test(n)){warned=true;return paint('Næsten! Når sætningen starter med »I min fritid«, kommer verbet før »jeg«: I min fritid læser jeg …')}
      if(!warned&&c.check==='traet'&&!/træt af/.test(n)){warned=true;return paint('Prøv at bruge udtrykket »træt af«: Jeg er træt af …')}
      S.free.push({id:c.id,t:v,at:Date.now()});record(c.id,true);sfx('ok');pbody.innerHTML='';pbody.append(h('div',{class:'q'},'Din sætning'),h('div',{class:'solution'},richText(v)),h('p',{class:'hint dim'},'Eksempel: ',richText(c.model)));await cont();res(true)};paint()})}

/* ---------------------------------------------------------------- notebook + menu + chapter end */
function sheet(title,build){const s=$('#sheet');s.hidden=false;const inner=h('div',{class:'sin'});s.innerHTML='';s.append(inner);const close=()=>{s.hidden=true;s.innerHTML=''};
  inner.append(h('div',{class:'shead'},h('h2',null,title),h('button',{class:'tb',type:'button','aria-label':'Luk',on:{click:close}},'✕')));const b=h('div',{class:'sbody'});inner.append(b);build(b,close)}
function notebook(){sheet('Notesbog',(b)=>{let tab='ord';const draw=()=>{b.innerHTML='';const tabs=h('div',{class:'tabs'});for(const[k,l]of[['ord','Ord'],['udtryk','Udtryk'],['fejl','Øv igen'],['mine','Mine sætninger']])tabs.append(h('button',{class:'tab'+(tab===k?' on':''),type:'button',on:{click:()=>{tab=k;draw()}}},l));b.append(tabs);
    if(tab==='ord'){const ws=Object.keys(S.seen).map(w=>lookup(w)).filter(e=>e&&!['pron','konj','prep','art','int','fejl'].includes(e.k));const uniq=[...new Set(ws)].sort((a,b2)=>(S.tapped[b2.w]||0)-(S.tapped[a.w]||0)||a.w.localeCompare(b2.w,'da'));
      b.append(h('p',{class:'hint dim'},`Du har mødt ${uniq.length} ord. Tryk på et ord for at se det igen.`));const g=h('div',{class:'wgrid'});for(const e of uniq)g.append(h('button',{class:'wcard',type:'button',on:{click:()=>gloss(e.w)}},e.p?h('span',null,e.p):'',h('b',null,e.w),h('small',null,e.d.slice(0,46)+(e.d.length>46?'…':''))));b.append(g)}
    if(tab==='udtryk'){const seenC=CHUNKS.filter(c=>c.toks.every(t=>S.seen[t]));b.append(h('p',{class:'hint dim'},'Faste udtryk (chunks) skal man lære som én enhed.'));for(const c of seenC)b.append(h('button',{class:'wcard row',type:'button',on:{click:()=>gloss(c.w,c)}},h('b',null,c.w),h('small',null,c.d)))}
    if(tab==='fejl'){const bad=Object.entries(S.items).filter(([k,v])=>v.bad>0);b.append(h('p',{class:'hint dim'},bad.length?'Øvelser, du havde svært ved. Prøv dem igen.':'Ingen fejl endnu. Flot.'));for(const[k]of bad){const c=findChallenge(k);if(!c)continue;b.append(h('button',{class:'wcard row',type:'button',on:{click:async()=>{$('#sheet').hidden=true;const prev=GAME.busy;GAME.busy=true;await challenge(c.kind,c.c);GAME.busy=prev;idlePanel()}}},h('b',null,c.c.broken||c.c.words||c.c.q||c.c.text||c.c.opts[c.c.a]),h('small',null,`${S.items[k].bad} fejl`)))}}
    if(tab==='mine'){b.append(h('p',{class:'hint dim'},'Det, du selv har skrevet.'));for(const f of S.free.slice().reverse())b.append(h('div',{class:'wcard row'},richText(f.t)))}};draw()})}
function findChallenge(id){let found=null;const walk=x=>{if(found)return;if(Array.isArray(x))return x.forEach(walk);if(x&&typeof x==='object'){for(const k of['pick','build','fix','gaps','type','listen','free'])if(x[k]&&x[k].id===id){found={kind:k,c:x[k]};return}for(const k in x)if(typeof x[k]==='object')walk(x[k])}};walk(SCRIPTS);return found}
function menu(){sheet('Indstillinger',(b,close)=>{const sl=(k,l)=>{const i=h('input',{type:'range',min:0,max:1,step:.05,value:S.vol[k]??.5});i.addEventListener('input',()=>{S.vol[k]=+i.value;applyVolumes();save()});return h('label',{class:'set'},h('span',null,l),i)};
  b.append(sl('voice','Stemmer'),sl('music','Musik'),sl('amb','Lyde'),sl('sfx','Effekter'));
  const ts=h('input',{type:'range',min:.9,max:1.3,step:.05,value:S.textSize||1});ts.addEventListener('input',()=>{S.textSize=+ts.value;applyTextSize();save()});b.append(h('label',{class:'set'},h('span',null,'Tekststørrelse'),ts));
  b.append(h('div',{class:'prow'},h('button',{class:'btn',type:'button',on:{click:()=>{if(confirm('Starte forfra? Dine ord i notesbogen bliver gemt.')){const keep={seen:S.seen,tapped:S.tapped,items:S.items,free:S.free,vol:S.vol,name:S.name};S=Object.assign(freshSave(),keep);FL=S.flags;save();location.reload()}}}},'Start forfra')))})}
function applyTextSize(){document.documentElement.style.setProperty('--ts',S.textSize||1)}
async function chapterEnd(n){GAME.mode='end';const words=new Set(Object.keys(S.seen).map(w=>lookup(w)).filter(e=>e&&!['pron','konj','prep','art','int','fejl','num','name'].includes(e.k)).map(e=>e.w)).size;
  const items=Object.values(S.items);const ok=items.filter(i=>i.ok>0).length;
  const card=$('#endcard');card.hidden=false;card.innerHTML='';
  await new Promise(r=>{card.append(h('div',{class:'ein'},h('small',null,'Kapitel '+n),h('h1',null,'Slut på kapitlet'),h('p',null,'Du har mødt ',h('b',null,words),' ord og klaret ',h('b',null,ok),' øvelser.'),
    h('p',{class:'dim'},'Næste kapitel er på vej. Indtil da kan du gå rundt i Halvby, øve dine fejl i notesbogen og lytte til replikkerne igen.'),h('button',{class:'btn pri',type:'button',on:{click:()=>{card.hidden=true;r()}}},'Fortsæt')))});
  GAME.mode='play'}
