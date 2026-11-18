# R3born Ep2 'Z' recreations (Nov 16) of the 3 best performers: money (30k), reveal (19k), pole (17.8k).
# Goal: best hook + best retention -> open-loop hook (question / pain moment) that the story pays off near the end,
# hook + straight cut, short dead-air-free scenes, and an ending that flows straight back into the hook (loop).
# Source: r3ep2.mp4 (arg 2; gitignored). Pre-graded (67) excerpts public/g67_<k>Z.mp4, videoStartSec relative to the excerpt start.
# Usage: python3 plan11.py <tx.json> <r3ep2.mp4> [--no-excerpts]
import ast, json, subprocess, sys
W = [w for s in json.load(open(sys.argv[1])) for w in s['w']]
SRC = sys.argv[2]
CR = {k: [tuple(c) for c in v['crops']] for t in ('r3b', 'r3g') for k, v in json.load(open(f'src/tracks/{t}/auto_edits.json')).items()}
FIX = {'neon': 'N3on', 'fuck': 'f***', 'fucking': 'f***ing', 'shitting': 'sh*tting', 'shit': 'sh*t', 'dumbass': 'dumba**'}
src8 = open('plan8.py').read(); ATW = ast.literal_eval(src8[src8.index('ATW = ') + 6: src8.index('\ndef crops')])
ATW.update({(252.3, 'cuz'): "'cause", (259.7, 'one'): 'in one'})
G67 = ("split[ga][gb];[gb]gblur=sigma=14[gg];[ga][gg]blend=all_mode=softlight:all_opacity=0.245,unsharp=5:5:1.74:5:5:0,"
       "eq=contrast=1.113:saturation=1.26:gamma=0.98,curves=all='0/0 0.25/0.21 0.75/0.81 1/1',unsharp=3:3:0.79,format=yuv420p")
def crops(k, a, b):
    c = [x for x in CR[k] if a - 0.01 <= x[0] < b]; prev = [x for x in CR[k] if x[0] <= a]
    first = prev[-1][1] if prev else (c[0][1] if c else 960)
    return [(a, first)] + [x for x in c if x[0] > a + 0.01]
# id: (excerpt key, excerpt start, excerpt end, [(scene, a, b, crop track)])
EDITS = {
 'r3moneyZ': ('money', 248.9, 267.0, [('hook', 258.20, 260.35, 'money'), ('c1', 249.08, 257.30, 'money'), ('c2', 258.20, 266.70, 'money')]),
 'r3revealZ': ('reveal', 720.9, 747.6, [('hook', 745.80, 747.40, 'wax'), ('c1', 721.45, 728.70, 'reveal'), ('c2', 730.15, 741.80, 'reveal')]),
 'r3poleZ': ('pole', 333.7, 356.0, [('hook', 353.20, 355.75, 'pole'), ('c1', 333.90, 340.40, 'pole'), ('c2', 349.34, 355.80, 'pole')]),
}
gen = json.load(open('src/edits.gen.json'))
for eid, (gk, e0, e1, plan) in EDITS.items():
    scenes = []
    for sid, a, b, ck in plan:
        cr = crops(ck, a, b); n = round((b - a) * 30); words = []
        for (ws, we, t) in W:
            if a - 0.05 <= ws < b - 0.05:
                k = (round(ws, 1), t.lower().strip(',.?!')); tt = ATW[k] if k in ATW else FIX.get(t.lower().strip(',.?!'), t.strip(',.'))
                if not tt: continue
                f0 = max(0, round((ws - a) * 30)); f1 = min(n, max(f0 + 4, round((we - a) * 30) + 3))
                words.append({'word': tt, 'startFrame': f0, 'endFrame': f1})
        for i in range(len(words) - 1): words[i]['endFrame'] = min(words[i]['endFrame'], words[i + 1]['startFrame'])
        scenes.append({'id': sid, 'videoStartSec': round(a - e0, 3), 'durationInFrames': n, 'cropX': cr[0][1], 'crops': [[round((s - a) * 30), x] for s, x in cr], 'words': words})
    gen[eid] = scenes
    print(eid, round(sum(s['durationInFrames'] for s in scenes) / 30, 1), 's |', ' / '.join(s['id'] + ': ' + ' '.join(w['word'] for w in s['words']) for s in scenes))
    if '--no-excerpts' not in sys.argv:
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{e0:.3f}', '-t', f'{e1 - e0:.3f}', '-i', SRC, '-vf', 'fps=30,scale=1920:1080,setsar=1,' + G67,
                        '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-g', '15', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
                        '-map_metadata', '-1', f'public/g67_{gk}Z.mp4'], check=True)
json.dump(gen, open('src/edits.gen.json', 'w'))
G, R = 'G', 'R'
def png(at, f, x=870, y=1290, size=200): return dict(at=at, kind='png', file=f, x=x, y=y, size=size)
def ov(at, f, dur=34): return dict(at=at, kind='ov', file=f, dur=dur)
def sfx(at, f, v=0.5): return dict(at=at, kind='sfx', file=f, v=v)
CFG = {
 'r3moneyZ': dict(top='She made HOW much in ONE night?!', hl={'HOW': '#FF2A2A', 'ONE': '#FF2A2A'}, music=['montagem_n', 25], ctaAt=['c2', 'One'],
   tints=[[['hook', 'money'], G], [['c1', 'stripper'], R], [['c2', 'three'], G], [['c2', 'strip'], R]], rizz=[['c2', 'three']],
   punch=[['hook', 'most'], ['hook', 'money'], ['hook', 'night'], ['c1', '17'], ['c1', 'clarify'], ['c1', 'stripper'], ['c1', 'stripper', 1],
          ['c2', 'money'], ['c2', 'night'], ['c2', 'three'], ['c2', 'grand'], ['c2', 'sorry']],
   blowouts=[['c2', 'three']], blackFlash=[['c1', 'stripper', 1]], streaks=[['c2', 'One']],
   extras=[sfx(['c1', 'stripper', 1], 's_huh.mp3', 0.5), png(['c1', 'stripper', 1], 'e_laugh.png', 260), ov(['c2', 'three'], 'cashfall.mp4', 52),
           sfx(['c2', 'three'], 's_ding.mp3', 0.4), sfx(['c2', 'sorry'], 's_awk.mp3', 0.45), png(['c2', 'sorry'], 'e_sob.png')]),
 'r3revealZ': dict(top='N3on vs Sarah… FINAL score', hl={'FINAL': '#FF2A2A'}, music=['suspense_n', 0], ctaAt=['c2', 'eyebrow'],
   tints=[[['hook', 'hot'], R], [['c2', '326'], G], [['c2', '389'], R], [['c2', 'calf'], R]], rizz=[['c2', '326']],
   punch=[['hook', 'f***ing'], ['hook', 'hot'], ['c1', 'won'], ['c1', 'phones'], ['c1', 'grand'], ['c1', 'total'], ['c2', '326'], ['c2', 'dumba**'],
          ['c2', '389'], ['c2', 'dumba**', 2], ['c2', 'eyebrow'], ['c2', 'calf']],
   blowouts=[['c2', '389']], blackFlash=[['c2', '389']], streaks=[['c2', 'eyebrow']],
   extras=[sfx(['c2', '326'], 's_correct.mp3', 0.4), sfx(['c2', '389'], 's_fahhh.mp3', 0.45), png(['c2', '389'], 'e_sob.png'),
           sfx(['c2', 'calf'], 's_awk.mp3', 0.45), png(['c2', 'calf'], 'e_laugh.png', 260)]),
 'r3poleZ': dict(top='N3on tried POLE dancing', hl={'POLE': '#FF2A2A'}, music=['phonk_n', 40], ctaAt=['c2', 'just'],
   tints=[[['hook', 'stop'], R], [['c1', 'stupid'], R], [['c1', 'spins'], G], [['c2', 'whoa'], R]], rizz=[['c1', 'spins']],
   punch=[['hook', 'whoa'], ['hook', 'stop'], ['hook', 'stop', 1], ['hook', 'stop', 2], ['c1', 'hard'], ['c1', 'stupid'], ['c1', 'stupid', 1], ['c1', 'great'],
          ['c1', 'spins'], ['c2', 'pole'], ['c2', 'whoa'], ['c2', 'stop'], ['c2', 'stop', 2]],
   blowouts=[['c2', 'whoa']], blackFlash=[['c2', 'stop', 2]], streaks=[['c2']],
   extras=[sfx(['c1', 'stupid', 1], 's_fahhh.mp3', 0.45), png(['c1', 'stupid', 1], 'e_sob.png'), sfx(['c1', 'great'], 's_huh.mp3', 0.5),
           png(['c1', 'great'], 'e_laugh.png', 260), ov(['c1', 'spins'], 'greenflash2.mp4'), sfx(['c1', 'spins'], 's_correct.mp3', 0.45),
           sfx(['c2', 'stop', 2], 's_awk.mp3', 0.45)]),
}
for eid, c in CFG.items():
    c.update(cta='*full episode on @HardScope*', track='none', calls=[], src=f'g67_{EDITS[eid][0]}Z.mp4', intro=True, hardcut=True, cutSfx='s_camflash.mp3')
    sc = {s['id']: s for s in gen[eid]}
    refs = [r for r, _ in c['tints']] + [c['ctaAt']] + [e['at'] for e in c['extras']] + sum((c[k] for k in ('rizz', 'punch', 'blowouts', 'blackFlash', 'streaks')), [])
    for r in refs:
        if len(r) == 1: assert r[0] in sc, (eid, r); continue
        ws = [w for w in sc[r[0]]['words'] if w['word'].lower().startswith(r[1].lower())]
        assert len(ws) > (r[2] if len(r) > 2 else 0), (eid, r, [w['word'] for w in sc[r[0]]['words']])
json.dump(CFG, open('src/r3z.cfg.json', 'w'), indent=1); print('cfg ok')
