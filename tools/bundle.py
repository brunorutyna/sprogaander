#!/usr/bin/env python3
"""Single-file page for the claude.ai artifact (audio stays in audio/*.ogg + index.json beside it)."""
import re,os,sys
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
s=open(os.path.join(ROOT,'index.html')).read()
s=s.split('<head>',1)[1].replace('</head>','').replace('<body>','').replace('</body>','').replace('</html>','')
s=re.sub(r'<meta charset="utf-8">\n<meta name="viewport"[^>]*>\n','',s)
s=s.replace('<link rel="stylesheet" href="style.css">','<style>'+open(os.path.join(ROOT,'style.css')).read()+'</style>')
s=re.sub(r'<script src="(src/[^"]+)"></script>',lambda m:'<script>'+open(os.path.join(ROOT,m.group(1))).read().replace('</script','<\\/script')+'</script>',s)
out=sys.argv[1];open(out,'w').write(s.strip()+'\n');print(out,len(s))
