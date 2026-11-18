# R3born Ep2 batch 4 (Nov 15, user picks #1 #2 #6 #8 #9): hook + straight cut, resource songs/effects, grade 67 on the footage only
# (club excerpt = [333.5-339.5] + [415.75-430.25] concatenated, so its c1 has its own offset)
# (pre-graded excerpts public/g67_<k>.mp4, gitignored; videoStartSec is relative to the excerpt start OFF). Run after plan8 + planX.
import ast, json, sys
W = [w for s in json.load(open(sys.argv[1])) for w in s['w']]
A = json.load(open('src/tracks/r3f/auto_edits.json'))
CR = {k: [tuple(c) for c in v['crops']] for k, v in A.items()}
FIX = {'neon': 'N3on', 'fuck': 'f***', 'fucking': 'f***ing', 'shitting': 'sh*tting', 'shit': 'sh*t', 'dumbass': 'dumba**'}
src8 = open('plan8.py').read(); ATW = ast.literal_eval(src8[src8.index('ATW = ') + 6: src8.index('\ndef crops')])
ATW.update({(200.5, 'cuz'): "'cause", (186.3, 'never'): 'Never-ending', (186.9, '-ending'): '', (419.3, 'to'): 'at', (419.5, 'ask'): 'a**',
            (418.1, 'the'): 'at the', (720.2, 'in'): 'on', (714.0, 'set'): 'at', (716.9, 'spider'): 'Spider-Man', (717.1, '-man'): '',
            (717.6, 'doop'): 'doop-de-doop', (718.3, '-de'): '', (718.4, '-doop'): ''})
def crops(k, a, b):
    c = [x for x in CR[k] if a - 0.01 <= x[0] < b]; prev = [x for x in CR[k] if x[0] <= a]
    first = prev[-1][1] if prev else (c[0][1] if c else 960)
    return [(a, first)] + [x for x in c if x[0] > a + 0.01]
# id: (graded excerpt key, excerpt start OFF, [(scene, a, b, crop key)])
EDITS = {
 'r3lat': ('lat', 112.5, [('hook', 147.45, 149.60, 'lat'), ('c1', 112.75, 117.40, 'lat'), ('c2', 145.50, 160.75, 'lat')]),
 'r3club': ('club', 409.75, [('hook', 418.00, 421.60, 'club2'), ('c1', 333.90, 338.90, 'club', 333.5), ('c2', 416.25, 429.95, 'club2')]),
 'r3impossible': ('imp', 171, [('hook', 200.45, 202.65, 'impossible'), ('c1', 171.20, 177.00, 'impossible'), ('c2', 183.50, 188.00, 'impossible'),
                               ('c3', 198.40, 202.65, 'impossible'), ('c4', 208.40, 212.25, 'impossible')]),
 'r3excited': ('exc', 230, [('hook', 244.15, 245.90, 'excited'), ('c1', 230.30, 232.75, 'excited'), ('c1b', 236.55, 237.45, 'excited'),
                            ('c2', 241.00, 245.90, 'excited'), ('c3', 247.30, 257.30, 'excited')]),
 'r3best': ('best', 701.5, [('hook', 719.85, 720.80, 'best'), ('c1', 701.80, 722.05, 'best')]),
}
gen = json.load(open('src/edits.gen.json'))
for eid, (gk, off, plan) in EDITS.items():
    scenes = []
    for sid, a, b, ck, *so in plan:
        cr = crops(ck, a, b); n = round((b - a) * 30); words = []
        for (ws, we, t) in W:
            if a - 0.05 <= ws < b - 0.05:
                k = (round(ws, 1), t.lower().strip(',.?!')); tt = ATW[k] if k in ATW else FIX.get(t.lower().strip(',.?!'), t.strip(',.'))
                if not tt: continue
                f0 = max(0, round((ws - a) * 30)); f1 = min(n, max(f0 + 4, round((we - a) * 30) + 3))
                words.append({'word': tt, 'startFrame': f0, 'endFrame': f1})
        for i in range(len(words) - 1): words[i]['endFrame'] = min(words[i]['endFrame'], words[i + 1]['startFrame'])
        scenes.append({'id': sid, 'videoStartSec': round(a - (so[0] if so else off), 3), 'durationInFrames': n, 'cropX': cr[0][1], 'crops': [[round((s - a) * 30), x] for s, x in cr], 'words': words})
    gen[eid] = scenes
    print(eid, round(sum(s['durationInFrames'] for s in scenes) / 30, 1), 's |', ' / '.join(s['id'] + ': ' + ' '.join(w['word'] for w in s['words']) for s in scenes))
json.dump(gen, open('src/edits.gen.json', 'w'))
G, R = 'G', 'R'
def png(at, f, x=870, y=1290, size=200): return dict(at=at, kind='png', file=f, x=x, y=y, size=size)
def ov(at, f, dur=34): return dict(at=at, kind='ov', file=f, dur=dur)
def sfx(at, f, v=0.5): return dict(at=at, kind='sfx', file=f, v=v)
CFG = {
 'r3lat': dict(top="N3on doesn't know what a LAT is", hl={'LAT': '#FF2A2A'}, music=['brevis_n', 4], ctaAt=['c2', 'inhale'],
   tints=[[['hook', 'f***'], R], [['c1', 'lost'], R], [['c2', 'lats'], G], [['c2', 'fire'], R]], rizz=[['c2', 'lats']],
   punch=[['hook', 'lat'], ['c1', 'following'], ['c1', 'lost'], ['c2', 'lats'], ['c2', 'f***'], ['c2', 'lat', 1], ['c2', 'abs'], ['c2', 'fire'], ['c2', 'sh*t']],
   blowouts=[['c2', 'fire']], blackFlash=[['c2', 'sh*t']], streaks=[['c2']],
   extras=[sfx(['c1', 'lost'], 's_awk.mp3', 0.45), ov(['c2', 'lats'], 'greenflash2.mp4'), sfx(['c2', 'lat', 1], 's_huh.mp3', 0.5), png(['c2', 'lat', 1], 'e_laugh.png', 260),
           sfx(['c2', 'sh*t'], 's_fahhh.mp3', 0.45), png(['c2', 'sh*t'], 'e_sob.png')]),
 'r3club': dict(top='N3on admitted what he REALLY looks at', hl={'REALLY': '#FF2A2A'}, music=['empire_n', 20], ctaAt=['c2', 'salute'],
   tints=[[['hook', 'a**'], R], [['c1', 'stupid'], R], [['c2', 'a**'], R], [['c2', 'salute'], G]], rizz=[['c2', 'salute']],
   punch=[['hook', 'strip'], ['hook', 'a**'], ['c1', 'hard'], ['c1', 'stupid'], ['c1', 'pole'], ['c2', 'strip'], ['c2', 'a**'], ['c2', 'technique'], ['c2', 'salute'], ['c2', 'brother']],
   blowouts=[['c2', 'a**']], blackFlash=[['c1']], streaks=[['c2']],
   extras=[sfx(['c1', 'stupid', 1], 's_huh.mp3', 0.5), png(['c1', 'stupid', 1], 'e_sob.png'), sfx(['c2', 'a**'], 's_awk.mp3', 0.45), png(['c2', 'a**'], 'e_laugh.png', 260),
           ov(['c2', 'salute'], 'greenflash2.mp4'), sfx(['c2', 'salute'], 's_correct.mp3', 0.45)]),
 'r3impossible': dict(top='Pilates is LITERALLY impossible?', hl={'LITERALLY': '#FF2A2A'}, music=['sentamento_n', 55], ctaAt=['c3', 'respect'],
   tints=[[['hook', 'impossible'], R], [['c1', 'f***'], R], [['c3', 'respect'], G], [['c4', 'embarrassing'], R]], rizz=[['c3', 'respect']],
   punch=[['hook', 'literally'], ['hook', 'impossible'], ['c1', 'ball'], ['c1', 'f***'], ['c1', 'hard'], ['c2', 'never'], ['c3', 'respect'], ['c3', 'impossible'], ['c4', 'calories'], ['c4', 'embarrassing']],
   blowouts=[['c4', 'embarrassing']], blackFlash=[['c1', 'hard']], streaks=[['c2'], ['c4']],
   extras=[sfx(['c1', 'hard'], 's_fahhh.mp3', 0.45), png(['c1', 'hard'], 'e_sob.png'), ov(['c3', 'respect'], 'greenflash2.mp4'),
           sfx(['c4', 'embarrassing'], 's_huh.mp3', 0.5), png(['c4', 'embarrassing'], 'e_laugh.png', 260)]),
 'r3excited': dict(top="He's more excited for THIS than Pilates", hl={'THIS': '#FF2A2A'}, music=['funkabn_n', 4], ctaAt=['c3', '17'],
   tints=[[['hook', 'excited'], G], [['c1', 'strippers'], G], [['c1', 'no'], R], [['c3', 'stripper', 1], R]], rizz=[['c1', 'strippers']],
   punch=[['hook', 'excited'], ['hook', 'pilates'], ['c1', 'money'], ['c1', 'strippers'], ['c1', 'thrown'], ['c2', 'level'], ['c2', 'excited'], ['c3', '17'], ['c3', 'clarify'], ['c3', 'stripper', 1]],
   blowouts=[['c3', 'stripper', 1]], blackFlash=[['c3']], streaks=[['c1b'], ['c2']],
   extras=[ov(['c1', 'money'], 'cashfall.mp4', 52), sfx(['c1', 'money'], 's_ding.mp3', 0.4), sfx(['c2', 'excited'], 's_huh.mp3', 0.5), png(['c2', 'pilates'], 'e_laugh.png', 260),
           sfx(['c3', 'stripper', 1], 's_wow.mp3', 0.45), png(['c3', 'stripper', 1], 'e_sob.png')]),
 'r3best': dict(top='Where was N3on BEST all day?', hl={'BEST': '#FF2A2A'}, music=['suspense_n', 0], ctaAt=['c1', 'yeah'],
   tints=[[['hook', 'stripper'], R], [['c1', 'fun'], G], [['c1', 'bad'], R], [['c1', 'stripper'], R]], rizz=[['c1', 'fun']],
   punch=[['hook', 'better'], ['hook', 'stripper'], ['c1', 'calories'], ['c1', 'fun'], ['c1', 'best'], ['c1', 'bad'], ['c1', 'spider'], ['c1', 'better'], ['c1', 'stripper'], ['c1', 'won']],
   blowouts=[['c1', 'stripper']], blackFlash=[['c1', 'won']], streaks=[['c1', 'well']],
   extras=[ov(['c1', 'best'], 'greenflash2.mp4'), sfx(['c1', 'best'], 's_correct.mp3', 0.45), sfx(['c1', 'bad'], 's_awk.mp3', 0.45), png(['c1', 'bad'], 'e_sob.png'),
           sfx(['c1', 'stripper'], 's_huh.mp3', 0.5), png(['c1', 'stripper'], 'e_laugh.png', 260), sfx(['c1', 'won'], 's_ding.mp3', 0.4)]),
}
for eid, c in CFG.items():
    c.update(cta='*full episode on @HardScope*', track='none', calls=[], src=f'g67_{EDITS[eid][0]}.mp4', intro=True, hardcut=True, cutSfx='s_camflash.mp3')
    sc = {s['id']: s for s in gen[eid]}
    refs = [r for r, _ in c['tints']] + [c['ctaAt']] + [e['at'] for e in c['extras']] + sum((c[k] for k in ('rizz', 'punch', 'blowouts', 'blackFlash', 'streaks')), [])
    for r in refs:
        if len(r) == 1: assert r[0] in sc, (eid, r); continue
        ws = [w for w in sc[r[0]]['words'] if w['word'].lower().startswith(r[1].lower())]
        assert len(ws) > (r[2] if len(r) > 2 else 0), (eid, r, [w['word'] for w in sc[r[0]]['words']])
json.dump(CFG, open('src/r3f.cfg.json', 'w'), indent=1); print('cfg ok')
