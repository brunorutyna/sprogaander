/* ================= AUDIO: chiptune sequencer, sound effects, ambience ================= */
const AU={ctx:null,cur:null,curName:null,want:null,nextT:0,step:0,amb:null,ambKey:'',evT:0,override:null,overrideUntil:0};
function vol(k){const v=(S.vol||{})[k];return v==null?{music:.55,sfx:.8,amb:.55}[k]:v}
function auInit(){if(AU.ctx)return AU.ctx;try{const C=new (window.AudioContext||window.webkitAudioContext)();AU.ctx=C;
  AU.master=C.createGain();AU.master.connect(C.destination);
  const comp=C.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=3;comp.connect(AU.master);
  AU.music=C.createGain();AU.sfx=C.createGain();AU.ambG=C.createGain();[AU.music,AU.sfx,AU.ambG].forEach(g=>g.connect(comp));applyVolumes();
  const len=C.sampleRate*2,b=C.createBuffer(1,len,C.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;AU.noise=b;
  AU.waves={};for(const duty of[.125,.25,.5]){const n=32,re=new Float32Array(n),im=new Float32Array(n);for(let k=1;k<n;k++){im[k]=2/(k*Math.PI)*Math.sin(k*Math.PI*duty)}AU.waves[duty]=C.createPeriodicWave(re,im)}
  setInterval(schedule,25);}catch(e){}return AU.ctx}
function applyVolumes(){if(!AU.ctx)return;const on=S.sound!==false;AU.music.gain.value=on?vol('music')*.5:0;AU.sfx.gain.value=on?vol('sfx')*.6:0;AU.ambG.gain.value=on?vol('amb')*.5:0}
function audioWake(){const C=auInit();if(C&&C.state==='suspended')C.resume()}
const NOTE={C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11};
function freq(tok){const m=/^([A-G][#b]?)(\d)$/.exec(tok);if(!m)return 0;return 440*Math.pow(2,(NOTE[m[1]]+(+m[2]+1)*12-69)/12)}
/* ---- instruments ---- */
function tone(t,inst,f,dur,v,dest){const C=AU.ctx;const o=C.createOscillator(),g=C.createGain();
  if(inst==='tri')o.type='triangle';else if(inst==='sine')o.type='sine';else o.setPeriodicWave(AU.waves[inst==='p12'?.125:inst==='p25'?.25:.5]);
  o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.008);g.gain.setTargetAtTime(v*.6,t+.03,.08);g.gain.setTargetAtTime(0,t+Math.max(.03,dur-.03),.03);
  o.connect(g);g.connect(dest||AU.music);o.start(t);o.stop(t+dur+.2)}
function drum(t,k,v,dest){const C=AU.ctx;dest=dest||AU.music;
  if(k==='k'){const o=C.createOscillator(),g=C.createGain();o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(42,t+.12);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+.16);o.connect(g);g.connect(dest);o.start(t);o.stop(t+.2);return}
  const s=C.createBufferSource();s.buffer=AU.noise;const f=C.createBiquadFilter();const g=C.createGain();
  f.type='highpass';f.frequency.value=k==='h'?7000:1800;const L=k==='h'?.04:.13;g.gain.setValueAtTime(v*(k==='h'?.5:1),t);g.gain.exponentialRampToValueAtTime(.001,t+L);
  s.connect(f);f.connect(g);g.connect(dest);s.start(t,Math.random()*1.5);s.stop(t+L+.02)}
/* ---- songs: tokens per 8th note; '.' holds, '-' rests ---- */
const SONGS={
 title:{bpm:116,ch:[
  ['p25',.5,'G4 . B4 D5 G5 . F#5 E5 | D5 . . B4 C5 D5 E5 . | C5 . E5 G5 C6 . B5 A5 | G5 . . . F#5 . . . | G4 . B4 D5 G5 . A5 B5 | C6 . B5 A5 G5 . E5 . | F#5 . A5 . D6 . C6 B5 | A5 . . . . . - -'],
  ['tri',.8,'G2 . D3 . G2 . D3 . | G2 . D3 . G2 . B2 . | C3 . G3 . C3 . G3 . | E2 . B2 . D3 . . . | G2 . D3 . G2 . D3 . | C3 . G3 . E3 . C3 . | D3 . A3 . D3 . F#3 . | D3 . A2 . D3 . . .'],
  ['p12',.22,'B3 . . . D4 . . . | B3 . . . D4 . . . | E4 . . . G4 . . . | B3 . . . A3 . . . | B3 . . . D4 . . . | E4 . . . G4 . . . | F#4 . . . A4 . . . | F#4 . . . . . . .'],
  ['dr',.45,'k - h - s - h - | k - h - s - h k | k - h - s - h - | k - h - s - s s']]},
 town:{bpm:108,ch:[
  ['p25',.45,'E5 . G5 . A5 . G5 . | E5 . D5 . C5 . . . | D5 . E5 . G5 . E5 . | D5 . . . . . - - | E5 . G5 . A5 . C6 . | B5 . A5 . G5 . E5 . | F5 . E5 . D5 . B4 . | C5 . . . . . - -'],
  ['tri',.8,'C3 . G3 . C3 . G3 . | A2 . E3 . A2 . E3 . | F2 . C3 . F2 . C3 . | G2 . D3 . G2 . B2 . | C3 . G3 . C3 . G3 . | E3 . B3 . E3 . B3 . | F2 . C3 . G2 . D3 . | C3 . G2 . C3 . - -'],
  ['p12',.16,'G4 E4 G4 E4 G4 E4 G4 E4 | A4 E4 A4 E4 A4 E4 A4 E4 | A4 F4 A4 F4 A4 F4 A4 F4 | B4 G4 B4 G4 B4 G4 B4 G4 | G4 E4 G4 E4 G4 E4 G4 E4 | G4 E4 B4 E4 G4 E4 B4 E4 | A4 F4 A4 F4 B4 G4 B4 G4 | G4 E4 G4 E4 G4 . - -'],
  ['dr',.35,'k - h - s - h h']]},
 route:{bpm:132,ch:[
  ['p25',.45,'D5 . . A4 D5 E5 F#5 . | E5 . D5 . B4 . A4 . | G4 . B4 . D5 . G5 . | F#5 . E5 . D5 . E5 . | D5 . . A4 D5 E5 F#5 . | A5 . G5 . F#5 . E5 . | D5 . E5 . F#5 . G5 . | A5 . . . A4 . - -'],
  ['tri',.8,'D3 . A2 . D3 . A2 . | G2 . D3 . G2 . D3 . | E2 . B2 . E2 . B2 . | A2 . E3 . A2 . C#3 . | D3 . A2 . D3 . A2 . | F#2 . C#3 . F#2 . C#3 . | G2 . D3 . A2 . E3 . | A2 . E3 . A2 . - -'],
  ['p12',.15,'F#4 A4 D5 A4 F#4 A4 D5 A4 | G4 B4 D5 B4 G4 B4 D5 B4 | E4 G4 B4 G4 E4 G4 B4 G4 | E4 A4 C#5 A4 E4 A4 C#5 A4 | F#4 A4 D5 A4 F#4 A4 D5 A4 | F#4 A4 C#5 A4 F#4 A4 C#5 A4 | G4 B4 D5 B4 A4 C#5 E5 C#5 | A4 C#5 E5 C#5 A4 . - -'],
  ['dr',.4,'k h s h k k s h']]},
 hygge:{bpm:84,ch:[
  ['p12',.38,'A4 . C5 . F5 . . E5 | D5 . C5 . A4 . . . | Bb4 . D5 . G5 . . F5 | E5 . C5 . . . - - | A4 . C5 . F5 . . A5 | G5 . F5 . D5 . . . | C5 . Bb4 . A4 . G4 . | F4 . . . . . - -'],
  ['tri',.7,'F2 . C3 . A3 . C3 . | D3 . A3 . F3 . A3 . | Bb2 . F3 . D3 . F3 . | C3 . G3 . E3 . G3 . | F2 . C3 . A3 . C3 . | Bb2 . F3 . D3 . F3 . | C3 . G3 . C3 . E3 . | F2 . C3 . F3 . - -']]},
 wild:{bpm:152,ch:[
  ['p25',.45,'A4 . C5 . E5 . A5 . | G5 . E5 . C5 . D5 . | E5 . . D5 C5 . B4 . | A4 . . . E4 . G#4 . | A4 . C5 . E5 . A5 . | B5 . A5 . G5 . E5 . | F5 . E5 . D5 . C5 . | B4 . . . E5 . - -'],
  ['tri',.85,'A2 A2 A3 A2 A2 A2 A3 A2 | C3 C3 C4 C3 G2 G2 G3 G2 | F2 F2 F3 F2 F2 F2 F3 F2 | E2 E2 E3 E2 E2 E2 E3 E2 | A2 A2 A3 A2 A2 A2 A3 A2 | G2 G2 G3 G2 E2 E2 E3 E2 | D2 D2 D3 D2 F2 F2 F3 F2 | E2 E2 E3 E2 E2 E2 G#2 B2'],
  ['p12',.18,'E4 . . . E4 . . . | E4 . . . D4 . . . | C4 . . . C4 . . . | B3 . . . B3 . . . | E4 . . . E4 . . . | D4 . . . B3 . . . | A3 . . . A3 . . . | G#3 . . . B3 . . .'],
  ['dr',.5,'k h s h k k s h']]},
 trainer:{bpm:164,ch:[
  ['p25',.45,'E5 . B4 . E5 F#5 G5 . | F#5 . E5 . D5 . B4 . | C5 . E5 . G5 . A5 . | B5 . . . A5 G5 F#5 . | E5 . B4 . E5 F#5 G5 . | A5 . G5 . F#5 . D5 . | E5 . F#5 . G5 . A5 . | B5 . . . B4 . - -'],
  ['tri',.85,'E2 E2 E3 E2 E2 E2 E3 E2 | D2 D2 D3 D2 D2 D2 D3 D2 | C2 C2 C3 C2 C2 C2 C3 C2 | B1 B1 B2 B1 B1 B1 B2 B1 | E2 E2 E3 E2 E2 E2 E3 E2 | D2 D2 D3 D2 B1 B1 B2 B1 | C2 C2 C3 C2 D2 D2 D3 D2 | B1 B1 B2 B1 B1 B1 D#2 F#2'],
  ['p12',.18,'G4 . . . G4 . . . | F#4 . . . F#4 . . . | E4 . . . E4 . . . | D#4 . . . D#4 . . . | G4 . . . G4 . . . | F#4 . . . D#4 . . . | E4 . . . F#4 . . . | D#4 . . . F#4 . . .'],
  ['dr',.5,'k h s h k h s s']]},
 boss:{bpm:172,ch:[
  ['p25',.45,'D5 . D5 . F5 . D5 . | A5 . G5 . F5 . E5 . | F5 . F5 . A5 . F5 . | C6 . Bb5 . A5 . G5 . | D5 . D5 . F5 . D5 . | Bb5 . A5 . G5 . F5 . | E5 . G5 . Bb5 . A5 . | A5 . . . C#5 . E5 .'],
  ['tri',.9,'D2 D2 D3 D2 D2 D2 D3 D2 | D2 D2 D3 D2 C2 C2 C3 C2 | Bb1 Bb1 Bb2 Bb1 Bb1 Bb1 Bb2 Bb1 | F2 F2 F3 F2 C2 C2 C3 C2 | D2 D2 D3 D2 D2 D2 D3 D2 | G1 G1 G2 G1 G1 G1 G2 G1 | C2 C2 C3 C2 C2 C2 C3 C2 | A1 A1 A2 A1 A1 A1 C#2 E2'],
  ['p12',.2,'A4 . . . A4 . . . | F4 . . . E4 . . . | F4 . . . D4 . . . | A4 . . . G4 . . . | A4 . . . A4 . . . | D4 . . . D4 . . . | G4 . . . E4 . . . | E4 . . . C#4 . . .'],
  ['dr',.55,'k h s h k k s h | k h s h k s s s']]},
 victory:{bpm:132,ch:[
  ['p25',.45,'C5 E5 G5 C6 . . G5 . | A5 . F5 . G5 . E5 . | F5 . D5 . E5 . C5 . | D5 . B4 . C5 . . .'],
  ['tri',.8,'C3 . G3 . C3 . G3 . | F2 . C3 . C3 . G3 . | D3 . A3 . C3 . G3 . | G2 . D3 . C3 . . .'],
  ['p12',.18,'E4 . . . E4 . . . | C4 . . . E4 . . . | A3 . . . G3 . . . | B3 . . . E4 . . .'],
  ['dr',.35,'k - h - s - h -']]},
 evo:{bpm:120,ch:[
  ['p25',.4,'C5 E5 G5 C6 E6 C6 G5 E5 | D5 F5 A5 D6 F6 D6 A5 F5 | E5 G5 B5 E6 G6 E6 B5 G5 | F5 A5 C6 F6 . . . .'],
  ['tri',.8,'C3 . . . . . . . | D3 . . . . . . . | E3 . . . . . . . | F3 . . . . . . .']]},
 hall:{bpm:96,ch:[
  ['p12',.35,'A4 . . . C5 . . . | B4 . . . E4 . . . | A4 . . . C5 . . . | D5 . . . B4 . . . | F4 . . . A4 . . . | G4 . . . E4 . . . | F4 . . . D5 . . . | E5 . . . G#4 . . .'],
  ['tri',.8,'A2 . . . A2 . . . | E2 . . . E2 . . . | A2 . . . A2 . . . | G2 . . . G2 . . . | F2 . . . F2 . . . | C3 . . . C3 . . . | D3 . . . D3 . . . | E2 . . . E2 . . .'],
  ['dr',.25,'k - - - h - - - | k - - - h - h -']]}
};
function compile(song){if(song._c)return song._c;let len=0;const chans=song.ch.map(([inst,v,pat])=>{const toks=pat.replace(/\|/g,' ').trim().split(/\s+/);len=Math.max(len,toks.length);
  const ev=[];toks.forEach((t,i)=>{if(t==='.'){const last=ev[ev.length-1];if(last&&last.end===i)last.end=i+1;return}if(t==='-')return;ev.push({s:i,end:i+1,t})});return{inst,v,ev,n:toks.length}});
  song._c={len,chans};return song._c}
function playSong(name){if(!AU.ctx||AU.curName===name)return;const C=AU.ctx;
  if(AU.cur){const g=AU.cur.gain;g.gain.setTargetAtTime(0,C.currentTime,.18);const old=g;setTimeout(()=>{try{old.disconnect()}catch(e){}},1200)}
  AU.curName=name;if(!name){AU.cur=null;return}
  const s=SONGS[name.replace(/Night$/,'')];if(!s){AU.cur=null;return}
  const night=/Night$/.test(name);const g=C.createGain();g.gain.value=0;g.gain.setTargetAtTime(1,C.currentTime+.25,.2);g.connect(AU.music);
  AU.cur={s,c:compile(s),gain:g,night,bpm:s.bpm*(night?.82:1)};AU.step=0;AU.nextT=C.currentTime+.3}
function schedule(){const C=AU.ctx;if(!C||!AU.cur)return;const cur=AU.cur;const stepDur=60/cur.bpm/2;
  while(AU.nextT<C.currentTime+.15){const i=AU.step%cur.c.len;
    for(const ch of cur.c.chans){if(ch.inst==='dr'){if(cur.night)continue;const k=i%ch.n;const e=ch.ev.find(e=>e.s===k);if(e)for(const d of e.t)drum(AU.nextT,d,ch.v*.7,cur.gain);continue}
      const k=i%ch.n;const e=ch.ev.find(e=>e.s===k);if(!e)continue;const f=freq(e.t);if(!f)continue;
      const inst=cur.night&&ch.inst==='p25'?'tri':ch.inst;tone(AU.nextT,inst,f,(e.end-e.s)*stepDur*.95,ch.v*(cur.night?.7:1)*.32,cur.gain)}
    AU.nextT+=stepDur;AU.step++}}
/* ---- sound effects ---- */
function sfx(kind){const C=AU.ctx;if(!C||S.sound===false)return;const t=C.currentTime+.01;const T=(seq,inst,step,v)=>seq.forEach((n,i)=>{if(n)tone(t+i*step,inst,typeof n==='number'?n:freq(n),step*1.2,v,AU.sfx)});
  switch(kind){
   case'sel':tone(t,'p25',1320,.05,.12,AU.sfx);break;
   case'bump':tone(t,'tri',90,.08,.3,AU.sfx);break;
   case'ok':T(['C6','E6','G6','C7'],'p25',.055,.16);break;
   case'bad':T(['E4','C4','A3'],'p50',.08,.14);break;
   case'hit':drum(t,'s',.5,AU.sfx);tone(t,'p50',220,.12,.12,AU.sfx);tone(t+.04,'p50',150,.1,.1,AU.sfx);break;
   case'enc':T(['E5','D#5','E5','F#5','G5','A5','B5','E6'],'p25',.05,.15);break;
   case'heal':T(['C5','E5','G5','C6','.','G5','C6'],'p25',.12,.14);break;
   case'lvl':T(['G5','A5','B5','D6','G6'],'p25',.07,.15);break;
   case'catch':T(['C5','G5','C6','E6','G6','C7'],'p25',.08,.15);break;
   case'badge':T(['C5','C5','C5','E5','G5','.','E5','G5','C6'],'p25',.1,.16);T(['C3','.','.','C3','G3','.','C3','G3','C4'],'tri',.1,.3);break;
   case'run':T(['A5','E5','A4'],'p12',.05,.14);break;
   case'ball':T([600,900,1200],'p12',.04,.12);break;
   case'shake':tone(t,'tri',120,.08,.25,AU.sfx);break;
   case'door':drum(t,'h',.4,AU.sfx);tone(t,'tri',180,.06,.2,AU.sfx);break;
   case'step':break;
   default:tone(t,'p25',880,.06,.12,AU.sfx)}}
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
function crackle(){const C=AU.ctx,t=C.currentTime;drum(t,'h',.25,AU.amb.bus)}
function tick(){const C=AU.ctx;tone(C.currentTime,'tri',1900,.02,.03,AU.amb.bus)}

/* ---- driver: picks music + ambience from game state ---- */
const HARBOUR=/^(r3|r5|christianshavn|nyhavn)$/,LAKE=/^r2$/,CITY=/^(vesterbro|orestad|r7|borgergade)$/;
function audioTick(now){if(!AU.ctx||AU.ctx.state!=='running')return;applyVolumes();
  const tod=typeof timeOfDay==='function'?timeOfDay():{phase:'day'};const night=tod.phase==='night';
  let song=null;const m=GAME.map;
  if(GAME.mode==='title')song='title';else if(GAME.mode==='intro')song='hygge';else if(GAME.mode==='evo')song='evo';
  else if(GAME.mode==='battle'&&BT)song=BT.o.leader?'boss':BT.wild?'wild':'trainer';
  else if(m){if(m.outdoor)song=(m.town?'town':'route')+(night?'Night':'');else song=m.kind==='gym'||m.kind==='final'?'hall':'hygge'}
  if(AU.override&&now<AU.overrideUntil)song=AU.override;
  playSong(song);
  let place='none';if(GAME.mode==='world'&&m){if(m.outdoor)place=HARBOUR.test(m.id)?'harbour':LAKE.test(m.id)?'lake':CITY.test(m.id)?'city':'park';else place=m.kind==='hygge'||m.kind==='home'?'fire':'room'}
  const wx=m&&GAME.mode==='world'&&typeof weatherFor==='function'?weatherFor(m):'none';
  setAmb(place+'|'+(night?'n':'d')+'|'+wx);
  if(now>AU.evT){AU.evT=now+400;const r=Math.random();
    if(place==='harbour'&&!night&&r<.05)gull();
    if(place==='city'&&!night&&r<.025)bell();
    if((place==='park'||place==='lake')&&!night&&wx!=='rain'&&r<.12)bird();
    if((place==='park'||place==='lake')&&night&&r<.5)cricket();
    if(place==='fire'&&r<.35)crackle();
    if(place==='room'&&r<.3)tick();}
}
function victoryMusic(ms){AU.override='victory';AU.overrideUntil=performance.now()+(ms||5200)}
