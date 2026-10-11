#!/usr/bin/env python3
"""Generate per-character Danish voice files from tools/manifest.json using Piper.
Each line: audio/l/<id>.ogg (normal) and audio/l/<id>s.ogg (slow). Words: audio/w/<id>.ogg"""
import json, os, sys, subprocess, wave, io, tempfile
from piper import PiperVoice
from piper.config import SynthesisConfig
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL=sys.argv[1]
voice=PiperVoice.load(MODEL)
SR=voice.config.sample_rate
FX={'room':'aecho=0.8:0.6:35:0.10','radio':'highpass=f=380,lowpass=f=3300,acompressor=threshold=0.1:ratio=4,aecho=0.8:0.7:70:0.22',
    'old':'vibrato=f=5.2:d=0.05,lowpass=f=6500','raven':'highpass=f=180,aecho=0.8:0.5:22:0.18,treble=g=3',
    'deep':'bass=g=4,lowpass=f=5200','young':'treble=g=2','warm':'bass=g=2,lowpass=f=7600','word':'anull'}
WORD_LS=1.12
def synth(text,ls,path):
    with wave.open(path,'wb') as w:
        voice.synthesize_wav(text,w,syn_config=SynthesisConfig(length_scale=ls,noise_scale=0.6,noise_w_scale=0.75))
def render(item,slow,out):
    v=item['v'];ls=(WORD_LS if item['who']=='word' else v['ls'])*(1.5 if slow else 1.0)
    with tempfile.NamedTemporaryFile(suffix='.wav',delete=False) as t: tmp=t.name
    synth(item['text']+('.' if item['who']=='word' else ''),ls,tmp)
    p=v['p'];f=f"asetrate={SR}*{p},aresample={SR},atempo={1/p:.4f},{FX.get(v.get('fx','word'),'anull')},loudnorm=I=-18:TP=-2,apad=pad_dur=0.15"
    subprocess.run(['ffmpeg','-loglevel','error','-y','-i',tmp,'-af',f,'-ac','1','-c:a','libopus','-b:a','28k',out],check=True)
    os.unlink(tmp)
items=json.load(open(os.path.join(ROOT,'tools','manifest.json')))
os.makedirs(os.path.join(ROOT,'audio','l'),exist_ok=True);os.makedirs(os.path.join(ROOT,'audio','w'),exist_ok=True)
part=int(sys.argv[2]) if len(sys.argv)>2 else 0;parts=int(sys.argv[3]) if len(sys.argv)>3 else 1
n=0
for i,it in enumerate(items):
    if i%parts!=part: continue
    if it['who']=='word':
        out=os.path.join(ROOT,'audio','w',it['id'][1:]+'.ogg')
        if not os.path.exists(out): render(it,False,out); n+=1
    else:
        for slow in (False,True):
            out=os.path.join(ROOT,'audio','l',it['id']+('s' if slow else '')+'.ogg')
            if not os.path.exists(out): render(it,slow,out); n+=1
print('generated',n)
