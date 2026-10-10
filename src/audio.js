/* ================= AUDIO: psychedelic/prog sequencer (organ, fuzz, flute, sitar, bells), effects, ambience ================= */
const AU={ctx:null,cur:null,curName:null,nextT:0,step:0,amb:null,ambKey:'',evT:0,override:null,overrideUntil:0};
function vol(k){const v=(S.vol||{})[k];return v==null?{music:.55,sfx:.8,amb:.55}[k]:v}
function auInit(){if(AU.ctx)return AU.ctx;try{const C=new (window.AudioContext||window.webkitAudioContext)();AU.ctx=C;
  AU.master=C.createGain();AU.master.connect(C.destination);
  const comp=C.createDynamicsCompressor();comp.threshold.value=-16;comp.ratio.value=3;comp.knee.value=12;comp.connect(AU.master);
  AU.music=C.createGain();AU.sfx=C.createGain();AU.ambG=C.createGain();[AU.music,AU.sfx,AU.ambG].forEach(g=>g.connect(comp));
  // shared effects: tape-ish delay + plate reverb
  AU.rev=C.createConvolver();const len=C.sampleRate*2.8,ir=C.createBuffer(2,len,C.sampleRate);for(let ch=0;ch<2;ch++){const d=ir.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6)}AU.rev.buffer=ir;
  AU.revIn=C.createGain();AU.revIn.gain.value=.32;AU.revIn.connect(AU.rev);AU.rev.connect(AU.music);
  AU.dly=C.createDelay(2);AU.dlyFb=C.createGain();AU.dlyFb.gain.value=.36;const dlp=C.createBiquadFilter();dlp.type='lowpass';dlp.frequency.value=2200;
  AU.dlyIn=C.createGain();AU.dlyIn.gain.value=.22;AU.dlyIn.connect(AU.dly);AU.dly.connect(dlp);dlp.connect(AU.dlyFb);AU.dlyFb.connect(AU.dly);dlp.connect(AU.music);dlp.connect(AU.revIn);
  applyVolumes();
  const nl=C.sampleRate*2,b=C.createBuffer(1,nl,C.sampleRate),nd=b.getChannelData(0);for(let i=0;i<nl;i++)nd[i]=Math.random()*2-1;AU.noise=b;
  const mk=(harm)=>{const n=harm.length+1,re=new Float32Array(n),im=new Float32Array(n);harm.forEach((v,i)=>im[i+1]=v);return C.createPeriodicWave(re,im)};
  AU.organWave=mk([1,.75,.45,.32,.0,.18,0,.12]);AU.pulse25=(()=>{const n=32,re=new Float32Array(n),im=new Float32Array(n);for(let k=1;k<n;k++)im[k]=2/(k*Math.PI)*Math.sin(k*Math.PI*.25);return C.createPeriodicWave(re,im)})();
  setInterval(schedule,25);}catch(e){}return AU.ctx}
function applyVolumes(){if(!AU.ctx)return;const on=S.sound!==false;AU.music.gain.value=on?vol('music')*.55:0;AU.sfx.gain.value=on?vol('sfx')*.6:0;AU.ambG.gain.value=on?vol('amb')*.55:0}
function audioWake(){const C=auInit();if(C&&C.state==='suspended')C.resume()}
const NOTE={C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11};
function freq(tok){const m=/^([A-G][#b]?)(\d)$/.exec(tok);if(!m)return 0;return 440*Math.pow(2,(NOTE[m[1]]+(+m[2]+1)*12-69)/12)}
/* ---- instruments ---- */
function env(g,t,v,a,dur,rel){g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.setTargetAtTime(v*.7,t+a,.12);g.gain.setTargetAtTime(0,t+Math.max(a,dur),rel||.06)}
function voice(t,inst,f,dur,v,out,sends){const C=AU.ctx;const g=C.createGain();g.connect(out);
  if(sends){if(sends.d){const s=C.createGain();s.gain.value=sends.d;g.connect(s);s.connect(AU.dlyIn)}if(sends.r){const s=C.createGain();s.gain.value=sends.r;g.connect(s);s.connect(AU.revIn)}}
  const stop=t+dur+1.2;const osc=(type,fr,det)=>{const o=C.createOscillator();if(type==='organ')o.setPeriodicWave(AU.organWave);else if(type==='p25')o.setPeriodicWave(AU.pulse25);else o.type=type;o.frequency.setValueAtTime(fr,t);if(det)o.detune.value=det;o.start(t);o.stop(stop);return o};
  if(inst==='organ'){const o=osc('organ',f);const vib=C.createOscillator(),vg=C.createGain();vib.frequency.value=6.2;vg.gain.value=5;vib.connect(vg);vg.connect(o.detune);vib.start(t);vib.stop(stop);o.connect(g);env(g,t,v*.5,.02,dur,.08)}
  else if(inst==='saw'){const f1=C.createBiquadFilter();f1.type='lowpass';f1.Q.value=6;f1.frequency.setValueAtTime(320,t);f1.frequency.exponentialRampToValueAtTime(2600,t+.04);f1.frequency.exponentialRampToValueAtTime(700,t+Math.max(.1,dur));
    const ws=C.createWaveShaper();const cur=new Float32Array(256);for(let i=0;i<256;i++){const x=i/128-1;cur[i]=Math.tanh(x*2.6)}ws.curve=cur;
    for(const d of[-9,9]){const o=osc('sawtooth',f,d);o.connect(f1)}f1.connect(ws);ws.connect(g);env(g,t,v*.32,.008,dur,.05)}
  else if(inst==='sub'){const o=osc('sine',f),o2=osc('triangle',f*2);const g2=C.createGain();g2.gain.value=.25;o2.connect(g2);g2.connect(g);o.connect(g);env(g,t,v*.9,.01,dur,.06)}
  else if(inst==='flute'){const o=osc('sine',f);const vib=C.createOscillator(),vg=C.createGain();vib.frequency.value=5.2;vg.gain.setValueAtTime(0,t);vg.gain.linearRampToValueAtTime(9,t+.25);vib.connect(vg);vg.connect(o.detune);vib.start(t);vib.stop(stop);
    const n=C.createBufferSource();n.buffer=AU.noise;const bp=C.createBiquadFilter();bp.type='bandpass';bp.frequency.value=f*2;bp.Q.value=2;const ng=C.createGain();ng.gain.value=.08;n.connect(bp);bp.connect(ng);ng.connect(g);n.start(t,Math.random());n.stop(stop);
    o.connect(g);env(g,t,v*.5,.06,dur,.12)}
  else if(inst==='sitar'){const o=osc('sawtooth',f*1.03);o.frequency.exponentialRampToValueAtTime(f,t+.06);const pk=C.createBiquadFilter();pk.type='peaking';pk.frequency.value=1600;pk.Q.value=9;pk.gain.value=14;const lp=C.createBiquadFilter();lp.type='lowpass';lp.frequency.value=3800;o.connect(pk);pk.connect(lp);lp.connect(g);
    g.gain.setValueAtTime(v*.28,t);g.gain.exponentialRampToValueAtTime(.001,t+Math.min(1.4,dur+.6))}
  else if(inst==='bell'){const o=osc('sine',f),o2=osc('sine',f*2.76);const g2=C.createGain();g2.gain.setValueAtTime(.3,t);g2.gain.exponentialRampToValueAtTime(.001,t+.5);o2.connect(g2);g2.connect(g);o.connect(g);g.gain.setValueAtTime(v*.42,t);g.gain.exponentialRampToValueAtTime(.001,t+Math.max(.5,dur*1.6))}
  else if(inst==='pad'){for(const d of[-11,0,11]){const o=osc('triangle',f,d);o.connect(g)}const lp=C.createBiquadFilter();env(g,t,v*.22,.35,dur,.5)}
  else{const o=osc('p25',f);o.connect(g);env(g,t,v*.3,.01,dur,.05)}}
function drum(t,k,v,out){const C=AU.ctx;out=out||AU.music;
  if(k==='k'){const o=C.createOscillator(),g=C.createGain();o.frequency.setValueAtTime(130,t);o.frequency.exponentialRampToValueAtTime(40,t+.14);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+.22);o.connect(g);g.connect(out);o.start(t);o.stop(t+.25);return}
  if(k==='t'){const o=C.createOscillator(),g=C.createGain();o.frequency.setValueAtTime(190,t);o.frequency.exponentialRampToValueAtTime(90,t+.18);g.gain.setValueAtTime(v*.7,t);g.gain.exponentialRampToValueAtTime(.001,t+.3);o.connect(g);g.connect(out);o.start(t);o.stop(t+.32);return}
  const s=C.createBufferSource();s.buffer=AU.noise;const f=C.createBiquadFilter();const g=C.createGain();
  if(k==='s'){f.type='bandpass';f.frequency.value=1900;f.Q.value=.8;const o=C.createOscillator(),og=C.createGain();o.frequency.value=190;og.gain.setValueAtTime(v*.4,t);og.gain.exponentialRampToValueAtTime(.001,t+.08);o.connect(og);og.connect(out);o.start(t);o.stop(t+.1);
    const rs=C.createGain();rs.gain.value=.4;g.connect(rs);rs.connect(AU.revIn)}
  else{f.type='highpass';f.frequency.value=7200}
  const L=k==='s'?.16:k==='o'?.28:.045;g.gain.setValueAtTime(v*(k==='s'?.9:.45),t);g.gain.exponentialRampToValueAtTime(.001,t+L);
  s.connect(f);f.connect(g);g.connect(out);s.start(t,Math.random()*1.5);s.stop(t+L+.02)}
/* ---- songs: one token per eighth note; '.' holds, '-' rests; channels may loop at different lengths (polymeter) ---- */
const SONGS={
 title:{bpm:104,ch:[
  ['organ',.5,'E4 . . . . . | E4 . . . . . | G4 . . . . . | F#4 . . E4 . .',{r:.4}],
  ['organ',.45,'B3 . . . . . | C#4 . . . . . | B3 . . . . . | A3 . . G3 . .',{r:.4}],
  ['organ',.4,'G3 . . . . . | A3 . . . . . | E3 . . . . . | D3 . . C3 . .',{r:.4}],
  ['sub',.8,'E2 . . B2 . . | A2 . . E2 . . | E2 . . B2 . . | D2 . . C2 . .'],
  ['flute',.6,'B4 . . D5 E5 . | F#5 . . E5 . . | G5 . F#5 E5 D5 . | E5 . . . . . | B4 . . D5 E5 . | A5 . . G5 F#5 . | E5 . D5 B4 . . | A4 . . B4 . .',{d:.5,r:.4}],
  ['sitar',.35,'E4 B4 E5 B4 G4 B4',{d:.3}],
  ['dr',.35,'k - h t - h']]},
 town:{bpm:92,ch:[
  ['organ',.42,'- A3 - A3 - A3 - A3 | - G3 - G3 - G3 - G3 | - A3 - A3 - A3 - A3 | - B3 - B3 - C4 - C4',{r:.25}],
  ['organ',.38,'- F#4 - F#4 - F#4 - F#4 | - E4 - E4 - E4 - E4 | - F#4 - F#4 - F#4 - F#4 | - D4 - D4 - E4 - E4',{r:.25}],
  ['sub',.85,'D2 . D3 . A2 . C3 . | C2 . C3 . G2 . B2 . | D2 . D3 . A2 . F#2 . | G2 . G2 . C3 . B2 .'],
  ['flute',.55,'A4 . D5 . E5 F#5 . E5 | D5 . C5 . A4 . . . | A4 . D5 . E5 F#5 A5 . | G5 . E5 . C5 . D5 . | F#5 . . E5 D5 . C5 . | D5 . . . A4 . . . | E5 . F#5 G5 A5 . G5 F#5 | E5 . C5 . D5 . . .',{d:.45,r:.3}],
  ['dr',.4,'k - h - s - h k | - k h - s - h -']]},
 route:{bpm:132,ch:[
  ['saw',.5,'A3 A3 C4 A3 D4 A3 E4 | A3 A3 C4 A3 G3 A3 F#3',{r:.15}],
  ['sub',.85,'A1 . A2 . A1 G1 A1 | A1 . A2 . A1 E2 G2'],
  ['organ',.5,'E5 . . D5 . C5 . | D5 . . . . . . | E5 . G5 . A5 . . | G5 . F#5 . E5 . . | C5 . . B4 . A4 . | B4 . . . . . . | A4 . . . . . . | - - - - - - -',{d:.35,r:.3}],
  ['dr',.5,'k - h s - k h']]},
 hygge:{bpm:80,ch:[
  ['organ',.3,'E4 . . . . . . . | D4 . . . . . . . | E4 . . . . . . . | D4 . . . C4 . . .',{r:.5}],
  ['organ',.28,'C4 . . . . . . . | B3 . . . . . . . | A3 . . . . . . . | B3 . . . A3 . . .',{r:.5}],
  ['organ',.26,'A3 . . . . . . . | G3 . . . . . . . | F3 . . . . . . . | G3 . . . F3 . . .',{r:.5}],
  ['sub',.7,'F2 . . . C3 . . . | F2 . . . D3 . . . | F2 . . . C3 . . . | G2 . . . C3 . . .'],
  ['bell',.6,'A4 . C5 . E5 . D5 . | B4 . . . G4 . . . | A4 . C5 . G5 . F5 . | E5 . D5 . C5 . . .',{d:.5,r:.5}],
  ['dr',.25,'h - - h - - h -']]},
 wild:{bpm:150,ch:[
  ['saw',.55,'E3 . E3 F3 E3 . G3 . F3 E3 | E3 . E3 F3 E3 . A3 . G3 F3'],
  ['sub',.9,'E2 E2 . E2 . E2 E2 . E2 . | E2 E2 . E2 . E2 E2 . F2 .'],
  ['organ',.5,'B4 . . C5 B4 . . . A4 . | G4 . . A4 . F4 . E4 . . | B4 . . C5 D5 . E5 . D5 C5 | B4 . . . . . . . - -',{d:.3,r:.25}],
  ['dr',.55,'k - h s - k k h s h']]},
 trainer:{bpm:158,ch:[
  ['saw',.55,'B2 B2 D3 B2 E3 B2 F#3 | B2 B2 D3 B2 A2 B2 C#3'],
  ['sub',.9,'B1 . B1 . B1 F#1 B1 | B1 . B1 . A1 . F#1'],
  ['organ',.5,'F#4 . . A4 . B4 . | D5 . C#5 . B4 . . | A4 . . F#4 . E4 . | F#4 . . . . . . | B4 . . D5 . E5 . | F#5 . E5 . D5 . . | C#5 . . A4 . B4 . | B4 . . . . - -',{d:.3,r:.25}],
  ['dr',.55,'k h s h k s h']]},
 boss:{bpm:170,ch:[
  ['saw',.55,'D3 D3 F3 D3 G3 D3 A3 | D3 D3 C3 D3 Bb2 A2'],
  ['sub',.95,'D2 . D2 . D2 . D2 | D2 . C2 . Bb1 A1'],
  ['saw',.4,'A4 . . D5 . E5 F5 | E5 . D5 . C5 . | A4 . . F5 . G5 A5 | C6 . Bb5 . A5 .',{d:.3,r:.2}],
  ['organ',.4,'D4 . . . . . . | C4 . . . . .',{r:.3}],
  ['dr',.6,'k h s h k k s | k h s h s s']]},
 victory:{bpm:120,ch:[
  ['bell',.6,'G4 B4 D5 G5 . F#5 . . | E5 . C#5 . D5 . . . | A4 C#5 E5 A5 . G5 . . | F#5 . D5 . G5 . . .',{d:.4,r:.4}],
  ['sub',.8,'G2 . . . G2 . . . | A2 . . . A2 . . . | E2 . . . A2 . . . | D2 . . . G2 . . .'],
  ['organ',.35,'B3 . . . . . . . | C#4 . . . . . . . | A3 . . . . . . . | D4 . . . B3 . . .',{r:.4}],
  ['dr',.35,'k - h - s - h -']]},
 evo:{bpm:116,ch:[
  ['bell',.5,'C5 E5 F#5 B5 C6 B5 F#5 E5 | D5 F#5 A5 C#6 D6 C#6 A5 F#5 | E5 G#5 B5 D#6 E6 D#6 B5 G#5 | F#5 A#5 C#6 F6 F#6 . . .',{d:.5,r:.5}],
  ['pad',.6,'C3 . . . . . . . | D3 . . . . . . . | E3 . . . . . . . | F#3 . . . . . . .',{r:.5}]]},
 hall:{bpm:88,ch:[
  ['pad',.5,'A2 . . . . . . . | Bb2 . . . . . . . | A2 . . . . . . . | G2 . . . Bb2 . . .',{r:.5}],
  ['sitar',.4,'A4 - - E5 - - - - | Bb4 - - - F5 - - - | A4 - - C5 - - E5 - | D5 - - - Bb4 - - -',{d:.5,r:.4}],
  ['dr',.25,'h - - - h - - - | k - - - h - h -']]}
};
function compile(song){if(song._c)return song._c;let len=0;const chans=song.ch.map(([inst,v,pat,sends])=>{const toks=pat.replace(/\|/g,' ').trim().split(/\s+/);len=Math.max(len,toks.length);
  const ev=[];toks.forEach((t,i)=>{if(t==='.'){const last=ev[ev.length-1];if(last&&last.end===i)last.end=i+1;return}if(t==='-')return;ev.push({s:i,end:i+1,t})});return{inst,v,ev,n:toks.length,sends}});
  song._c={len,chans};return song._c}
function playSong(name){if(!AU.ctx||AU.curName===name)return;const C=AU.ctx;
  if(AU.cur){const g=AU.cur.gain;g.gain.setTargetAtTime(0,C.currentTime,.25);const old=g;setTimeout(()=>{try{old.disconnect()}catch(e){}},2500)}
  AU.curName=name;if(!name){AU.cur=null;return}
  const s=SONGS[name.replace(/Night$/,'')];if(!s){AU.cur=null;return}
  const night=/Night$/.test(name);const g=C.createGain();g.gain.value=0;g.gain.setTargetAtTime(1,C.currentTime+.3,.3);g.connect(AU.music);
  AU.cur={s,c:compile(s),gain:g,night,bpm:s.bpm*(night?.84:1)};AU.step=0;AU.nextT=C.currentTime+.35}
function schedule(){const C=AU.ctx;if(!C||!AU.cur)return;const cur=AU.cur;const stepDur=60/cur.bpm/2;
  AU.dly.delayTime.setTargetAtTime(stepDur*3,C.currentTime,.1);
  while(AU.nextT<C.currentTime+.15){const i=AU.step;
    for(const ch of cur.c.chans){const k=i%ch.n;const e=ch.ev.find(e=>e.s===k);if(!e)continue;
      if(ch.inst==='dr'){if(cur.night)continue;for(const d of e.t)drum(AU.nextT,d,ch.v*.75,cur.gain);continue}
      const f=freq(e.t);if(!f)continue;let inst=ch.inst;if(cur.night){if(inst==='flute'||inst==='saw')inst='bell'}
      voice(AU.nextT,inst,f,(e.end-e.s)*stepDur*.95,ch.v*(cur.night?.7:1),cur.gain,ch.sends)}
    AU.nextT+=stepDur;AU.step++}}
/* ---- sound effects ---- */
function sfx(kind){const C=AU.ctx;if(!C||S.sound===false)return;const t=C.currentTime+.01;
  const seq=(notes,inst,step,v,sends)=>notes.forEach((n,i)=>{if(n&&n!=='.')voice(t+i*step,inst,typeof n==='number'?n:freq(n),step*1.3,v,AU.sfx,sends)});
  switch(kind){
   case'sel':voice(t,'bell',1568,.05,.18,AU.sfx);break;
   case'bump':voice(t,'sub',70,.08,.5,AU.sfx);break;
   case'ok':seq(['E5','G#5','B5','E6'],'bell',.06,.45,{r:.3});break;
   case'bad':seq(['E3','Bb2'],'saw',.11,.5);break;
   case'hit':drum(t,'s',.9,AU.sfx);drum(t,'k',.8,AU.sfx);break;
   case'enc':seq(['E4','F4','E4','Bb4','A4','E5'],'saw',.07,.45,{d:.3});drum(t,'k',.7,AU.sfx);break;
   case'heal':seq(['F4','A4','C5','E5','.','C5','F5'],'bell',.12,.5,{r:.4});break;
   case'lvl':seq(['C5','E5','G5','B5','D6'],'bell',.08,.5,{r:.3});break;
   case'catch':seq(['C5','G5','C6','E6','G6','C7'],'bell',.09,.5,{d:.4,r:.4});break;
   case'badge':seq(['G4','B4','D5','F#5','A5','.','G5'],'organ',.12,.6,{r:.5});seq(['G2','.','.','D3','.','.','G2'],'sub',.12,.7);break;
   case'run':seq(['A5','E5','A4'],'bell',.05,.35);break;
   case'ball':seq([600,900,1350],'bell',.05,.35,{r:.3});break;
   case'shake':voice(t,'sub',110,.1,.5,AU.sfx);break;
   case'door':voice(t,'sub',150,.08,.4,AU.sfx);drum(t,'h',.4,AU.sfx);break;
   case'evo':seq(['C4','E4','G4','B4','D5','F#5','A5','C6'],'bell',.12,.45,{d:.6,r:.6});break;
   default:voice(t,'bell',880,.06,.2,AU.sfx)}}
/* ---- ambience ---- */
function noiseLoop(type,fq,gainV,lfo){const C=AU.ctx;const s=C.createBufferSource();s.buffer=AU.noise;s.loop=true;const f=C.createBiquadFilter();f.type=type;f.frequency.value=fq;f.Q.value=.6;
  const g=C.createGain();g.gain.value=gainV;s.connect(f);f.connect(g);
  if(lfo){const o=C.createOscillator(),og=C.createGain();o.frequency.value=lfo;og.gain.value=gainV*.8;o.connect(og);og.connect(g.gain);o.start()}
  s.start();return{s,g}}
function setAmb(key){if(!AU.ctx||AU.ambKey===key)return;const C=AU.ctx;AU.ambKey=key;
  if(AU.amb){const old=AU.amb;old.bus.gain.setTargetAtTime(0,C.currentTime,.4);setTimeout(()=>{old.nodes.forEach(n=>{try{n.s.stop()}catch(e){}});try{old.bus.disconnect()}catch(e){}},2000)}
  const bus=C.createGain();bus.gain.value=0;bus.gain.setTargetAtTime(1,C.currentTime,.6);bus.connect(AU.ambG);const nodes=[];
  const add=n=>{n.g.disconnect();n.g.connect(bus);nodes.push(n)};
  const[place,tod,wx]=key.split('|');
  if(place==='harbour')add(noiseLoop('lowpass',420,.22,.13));
  if(place==='lake')add(noiseLoop('lowpass',320,.12,.1));
  if(place==='city')add(noiseLoop('lowpass',170,.2,0));
  if(place==='park'||place==='lake')add(noiseLoop('bandpass',520,.05,.06));
  if(place==='fire')add(noiseLoop('lowpass',260,.08,0));
  if(wx==='rain')add(noiseLoop('highpass',1200,.16,0));
  if(wx==='wind')add(noiseLoop('bandpass',380,.2,.08));
  AU.amb={bus,nodes,place,tod,wx};}
function gull(){const C=AU.ctx,t=C.currentTime;for(let k=0;k<2+Math.floor(Math.random()*2);k++){const o=C.createOscillator(),g=C.createGain(),tt=t+k*.32;o.type='sawtooth';const f=C.createBiquadFilter();f.type='bandpass';f.frequency.value=1600;f.Q.value=3;
  o.frequency.setValueAtTime(1500,tt);o.frequency.linearRampToValueAtTime(1050,tt+.22);g.gain.setValueAtTime(0,tt);g.gain.linearRampToValueAtTime(.06,tt+.03);g.gain.linearRampToValueAtTime(0,tt+.25);o.connect(f);f.connect(g);g.connect(AU.amb.bus);o.start(tt);o.stop(tt+.3)}}
function bell(){const C=AU.ctx,t=C.currentTime;for(let r=0;r<2;r++)for(const[fq,v]of[[2600,.05],[3780,.03],[5200,.015]]){const o=C.createOscillator(),g=C.createGain();o.type='sine';o.frequency.value=fq;const tt=t+r*.16;g.gain.setValueAtTime(v,tt);g.gain.exponentialRampToValueAtTime(.0005,tt+.9);o.connect(g);g.connect(AU.amb.bus);o.start(tt);o.stop(tt+1)}}
function bird(){const C=AU.ctx,t=C.currentTime;const n=2+Math.floor(Math.random()*4),base=2800+Math.random()*1800;for(let k=0;k<n;k++){const o=C.createOscillator(),g=C.createGain(),tt=t+k*.11;o.type='sine';o.frequency.setValueAtTime(base,tt);o.frequency.exponentialRampToValueAtTime(base*(1.2+Math.random()*.4),tt+.07);g.gain.setValueAtTime(0,tt);g.gain.linearRampToValueAtTime(.03,tt+.01);g.gain.linearRampToValueAtTime(0,tt+.08);o.connect(g);g.connect(AU.amb.bus);o.start(tt);o.stop(tt+.1)}}
function cricket(){const C=AU.ctx,t=C.currentTime;for(let k=0;k<3;k++){const o=C.createOscillator(),g=C.createGain(),tt=t+k*.05;o.type='sine';o.frequency.value=4400;g.gain.setValueAtTime(0,tt);g.gain.linearRampToValueAtTime(.012,tt+.01);g.gain.linearRampToValueAtTime(0,tt+.035);o.connect(g);g.connect(AU.amb.bus);o.start(tt);o.stop(tt+.05)}}
function crackle(){drum(AU.ctx.currentTime,'h',.25,AU.amb.bus)}
function glass(){const C=AU.ctx,t=C.currentTime;for(const fq of[3100,4650]){const o=C.createOscillator(),g=C.createGain();o.type='sine';o.frequency.value=fq*(1+Math.random()*.05);g.gain.setValueAtTime(.02,t);g.gain.exponentialRampToValueAtTime(.0005,t+.6);o.connect(g);g.connect(AU.amb.bus);o.start(t);o.stop(t+.7)}}

/* ---- driver ---- */
const HARBOUR=/^(r3|r5|christianshavn|nyhavn)$/,LAKE=/^r2$/,CITY=/^(vesterbro|orestad|r7|borgergade)$/;
function audioTick(now){if(!AU.ctx||AU.ctx.state!=='running')return;applyVolumes();
  const tod=typeof timeOfDay==='function'?timeOfDay():{phase:'day'};const night=tod.phase==='night';
  let song=null;const m=GAME.map;
  if(GAME.mode==='title')song='title';else if(GAME.mode==='intro')song='hygge';else if(GAME.mode==='evo')song='evo';
  else if(GAME.mode==='battle'&&BT)song=BT.o.leader?'boss':BT.wild?'wild':'trainer';
  else if(m){if(m.outdoor)song=(m.town?'town':'route')+(night?'Night':'');else song=m.kind==='gym'||m.kind==='final'?'hall':'hygge'}
  if(GAME.trip&&now-GAME.trip<7000)song='title';
  if(AU.override&&now<AU.overrideUntil)song=AU.override;
  playSong(song);
  let place='none';if(GAME.mode==='world'&&m){if(m.outdoor)place=HARBOUR.test(m.id)?'harbour':LAKE.test(m.id)?'lake':CITY.test(m.id)?'city':'park';else place=m.kind==='hygge'?'fire':m.kind==='home'?'room':'room'}
  const wx=m&&GAME.mode==='world'&&typeof weatherFor==='function'?weatherFor(m):'none';
  setAmb(place+'|'+(night?'n':'d')+'|'+wx);
  if(now>AU.evT&&AU.amb){AU.evT=now+400;const r=Math.random();
    if(place==='harbour'&&!night&&r<.05)gull();
    if(place==='city'&&!night&&r<.025)bell();
    if((place==='park'||place==='lake')&&!night&&wx!=='rain'&&r<.12)bird();
    if((place==='park'||place==='lake')&&night&&r<.5)cricket();
    if(place==='fire'&&r<.3)crackle();if(place==='fire'&&r>.96)glass();}
}
function victoryMusic(ms){AU.override='victory';AU.overrideUntil=performance.now()+(ms||6000)}
