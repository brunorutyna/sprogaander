#!/usr/bin/env python3
"""Pack audio/l/*.ogg and audio/w/*.ogg into two binary bundles + an index (few files = fast, artifact-friendly)."""
import os,json
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
idx={}
for kind in ('l','w'):
    d=os.path.join(ROOT,'audio',kind);off=0
    with open(os.path.join(ROOT,'audio',kind+'.ogg'),'wb') as out:
        for f in sorted(os.listdir(d)):
            if not f.endswith('.ogg'):continue
            b=open(os.path.join(d,f),'rb').read();out.write(b);idx[kind+'/'+f[:-4]]=[kind,off,len(b)];off+=len(b)
json.dump(idx,open(os.path.join(ROOT,'audio','index.json'),'w'),separators=(',',':'))
print(len(idx),'clips')
