#!/bin/bash
# build + render the BYB redemption viral clip once .work/byb2/redemption.mp4 exists
set -e; cd /home/user/clipper
W=.work/tl/src/redemption.words.json; S=.work/byb2/redemption.mp4; C=.work/byb2/tl_redeem2.cfg.json
#python3 kreek/finish_cuts.py $S $C
python3 kreek/beats.py $C $W .work/byb2/tl_redeem2.beats.json > /dev/null
python3 kreek/prep_v2.py $S $W $C
python3 - <<'PY'
import json
f='src/kreek/v2/tl_redeem2.json'; P=json.load(open(f))
cut={c['id']:c for c in P['cuts']}
# drop the blank tokens from fix ("thousand"/"dollars" folded into "$20,000")
P['words']=[w for w in P['words'] if w['t'].strip()]; P['hl']=P['hl']+['$20000']
def wt(s):
    return [w for w in P['words'] if s in w['t'].lower()][0]['a']
P['money']=[[round(wt('20,000'),2),2.0],[round(cut['s4']['a']+3.2,2),2.2]]
P['cta']=[round(cut['s2']['a']+0.8,2),"*comment what you'd buy with $20K 👇*"]
P['callout']=[[round(cut['s4']['a']+0.2,2),'*TREVOR LAWRENCE*',990,700]]
json.dump(P,open(f,'w'),indent=1,ensure_ascii=False)
print(P['dur'],P['money'],P['imgpops'],P['cta'])
PY
python3 kreek/music_gain.py src/kreek/v2/tl_redeem2.json public/kreek/v2/tl_redeem2_src.mp4 public/tl/music/gigachad.wav
python3 - <<'PY'
p='src/byb/TrevClip.tsx'; t=open(p).read()
if 'tl_redeem2' not in t:
    t=t.replace("import gd_special from '../kreek/v2/gd_special.json';","import gd_special from '../kreek/v2/gd_special.json';\nimport tl_redeem2 from '../kreek/v2/tl_redeem2.json';",1)
    t=t.replace("wow_mount, gd_special} as unknown","wow_mount, gd_special, tl_redeem2} as unknown",1)
open(p,'w').write(t)
PY
