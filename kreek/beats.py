"""Place a clip's v2 beats (pop-ups, freeze, cutaways, chip, drop) on the OUTPUT timeline from SOURCE-time anchors, so they stay
on the right word after segments are re-cut (kreek/snap_segs.py). Anchors:
  ('w', seg_id, 'word', n)  -> start of the n-th (0-based) occurrence of that word inside the segment
  ('s', seg_id, offset)      -> segment start + offset seconds (negative = from the segment end)
Usage: python3 kreek/beats.py <clip.cfg.json> <words.json> <beats.json>
beats.json: {"pops": [[anchor, text], ...], "freeze": [anchor, text], "react": [[anchor, anchor], ...], "chip": [anchor, text], "drop": anchor,
             "fix": {...optional word fixes...}}"""
import json, re, sys

cfg_f, words_f, beats_f = sys.argv[1:4]
C = json.load(open(cfg_f)); W = json.load(open(words_f)); B = json.load(open(beats_f))
starts, o = {}, 0.0
for sid, a, b in C['seg']:
    starts[sid] = (o, a, b); o += b - a
norm = lambda t: re.sub(r'[^a-z0-9\']', '', t.lower())
def T(x):
    if x[0] == 's':
        st, a, b = starts[x[1]]
        return round(st + (x[2] if x[2] >= 0 else (b - a) + x[2]), 3)
    st, a, b = starts[x[1]]
    hits = [w for w in W if a - 0.05 <= w[0] < b - 0.05 and norm(w[2]) == norm(x[2])]
    if len(hits) <= x[3]: raise SystemExit(f'word {x[2]!r} #{x[3]} not found in {x[1]}')
    return round(st + hits[x[3]][0] - a, 3)
v2 = C.setdefault('v2', {})
v2['pops'] = [[T(a), t] for a, t in B.get('pops', [])]
v2['freeze'] = [T(B['freeze'][0]), B['freeze'][1]]
v2['react'] = [[T(a), T(b)] for a, b in B.get('react', [])]
v2['chip'] = [T(B['chip'][0]), B['chip'][1]]
v2['drop'] = T(B['drop'])
if 'fix' in B: C['fix'] = {**C.get('fix', {}), **B['fix']}
if 'meme' in B: v2['meme'] = {k: [T(x) for x in v] for k, v in B['meme'].items()}
json.dump(C, open(cfg_f, 'w'), indent=1)
print(C['name'], 'dur', round(o, 2), json.dumps(v2, ensure_ascii=False)[:600])
