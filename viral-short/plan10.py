# R3born Ep2 batch 5 (Nov 15, user picks #16 #12 #13 #11): fresh 'Y' versions of already-edited moments — new hook line, new structure,
# different song + effects than the X versions: hook + straight cut, resource songs/effects, grade 67 on the footage only
# (club excerpt = [333.5-339.5] + [415.75-430.25] concatenated, so its c1 has its own offset)
# (pre-graded excerpts public/g67_<k>.mp4, gitignored; videoStartSec is relative to the excerpt start OFF). Run after plan8 + planX.
import ast, json, sys
W = [w for s in json.load(open(sys.argv[1])) for w in s['w']]
A = json.load(open('src/tracks/r3g/auto_edits.json'))
CR = {k: [tuple(c) for c in v['crops']] for k, v in A.items()}
FIX = {'neon': 'N3on', 'fuck': 'f***', 'fucking': 'f***ing', 'shitting': 'sh*tting', 'shit': 'sh*t', 'dumbass': 'dumba**'}
src8 = open('plan8.py').read(); ATW = ast.literal_eval(src8[src8.index('ATW = ') + 6: src8.index('\ndef crops')])
ATW.update({(200.5, 'cuz'): "'cause", (186.3, 'never'): 'Never-ending', (186.9, '-ending'): '', (419.3, 'to'): 'at', (419.5, 'ask'): 'a**',
            (418.1, 'the'): 'at the', (720.2, 'in'): 'on', (714.0, 'set'): 'at', (716.9, 'spider'): 'Spider-Man', (717.1, '-man'): '',
            (717.6, 'doop'): 'doop-de-doop', (718.3, '-de'): '', (718.4, '-doop'): '', (698.8, 'burn'): 'burned'})
def crops(k, a, b):
    c = [x for x in CR[k] if a - 0.01 <= x[0] < b]; prev = [x for x in CR[k] if x[0] <= a]
    first = prev[-1][1] if prev else (c[0][1] if c else 960)
    return [(a, first)] + [x for x in c if x[0] > a + 0.01]
EDITS = {
 'r3moneyY': ('money', 248.5, [('hook', 261.40, 262.95, 'money'), ('c1', 249.05, 257.30, 'money'), ('c2', 258.20, 268.95, 'money')]),
 'r3poleY': ('pole', 330.5, [('hook', 336.40, 337.55, 'pole'), ('c1', 331.05, 340.90, 'pole'), ('c2', 349.25, 356.60, 'pole')]),
 'r3handY': ('hand', 379, [('hook', 400.00, 402.45, 'hand'), ('c1', 379.60, 388.95, 'hand'), ('c2', 397.85, 402.45, 'hand')]),
 'r3cheatY': ('cheat', 638.5, [('hook', 697.75, 700.40, 'cheat'), ('c1', 639.45, 642.95, 'cheat'), ('c2', 650.05, 652.00, 'cheat'),
                               ('c3', 684.75, 694.95, 'cheat'), ('c4', 697.75, 701.80, 'cheat')]),
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
 'r3moneyY': dict(top='Her best night on the pole? $3,000', hl={'$3,000': '#58EE28'}, music=['sentamento_n', 55], ctaAt=['c2', 'one', 1],
   tints=[[['hook', 'three'], G], [['c1', 'stripper'], R], [['c2', 'three'], G], [['c2', 'strip'], R]], rizz=[['c2', 'three']],
   punch=[['hook', 'three'], ['hook', 'grand'], ['c1', '17'], ['c1', 'clarify'], ['c1', 'stripper'], ['c1', 'stripper', 1], ['c2', 'most'], ['c2', 'night'], ['c2', 'three'], ['c2', 'sorry'], ['c2', 'great']],
   blowouts=[['c2', 'three']], blackFlash=[['c1', 'stripper', 1]], streaks=[['c2', 'one', 1]],
   extras=[sfx(['c1', 'stripper', 1], 's_huh.mp3', 0.5), png(['c1', 'stripper', 1], 'e_laugh.png', 260), ov(['c2', 'three'], 'cashfall.mp4', 52),
           sfx(['c2', 'three'], 's_ding.mp3', 0.4), sfx(['c2', 'sorry'], 's_awk.mp3', 0.45), png(['c2', 'sorry'], 'e_sob.png')]),
 'r3poleY': dict(top='The pole DESTROYED N3on', hl={'DESTROYED': '#FF2A2A'}, music=['montagem_n', 25], ctaAt=['c2', 'your'],
   tints=[[['hook', 'stupid'], R], [['c1', 'manly'], R], [['c1', 'spins'], G], [['c2', 'whoa'], R]], rizz=[['c1', 'spins']],
   punch=[['hook', 'stupid'], ['hook', 'stupid', 1], ['c1', 'manly'], ['c1', 'window'], ['c1', 'hard'], ['c1', 'stupid', 1], ['c1', 'pole'], ['c1', 'spins'], ['c2', 'pole'], ['c2', 'whoa'], ['c2', 'stop'], ['c2', 'stop', 2]],
   blowouts=[['c2', 'whoa']], blackFlash=[['c2', 'stop', 2]], streaks=[['c2']],
   extras=[sfx(['c1', 'window'], 's_huh.mp3', 0.5), png(['c1', 'window'], 'e_laugh.png', 260), sfx(['c1', 'stupid', 1], 's_fahhh.mp3', 0.45), png(['c1', 'stupid', 1], 'e_sob.png'),
           ov(['c1', 'spins'], 'greenflash2.mp4'), sfx(['c1', 'spins'], 's_correct.mp3', 0.45), sfx(['c2', 'stop', 2], 's_awk.mp3', 0.45)]),
 'r3handY': dict(top='N3on trusted the STRIPPER over Sarah', hl={'STRIPPER': '#FF2A2A'}, music=['suspense_n', 0], ctaAt=['c1', 'tuck'],
   tints=[[['hook', 'stripper'], R], [['c1', 'kick'], G], [['c1', 'butt'], R], [['c2', 'sarah'], R]], rizz=[['c1', 'kick']],
   punch=[['hook', 'trusted'], ['hook', 'stripper'], ['c1', 'kick'], ['c1', 'tuck'], ['c1', 'butt'], ['c1', 'nothing'], ['c2', 'again'], ['c2', 'no'], ['c2', 'stripper'], ['c2', 'sarah']],
   blowouts=[['c2', 'sarah']], blackFlash=[['c1', 'nothing']], streaks=[['c2']],
   extras=[sfx(['c1', 'tuck'], 's_correct.mp3', 0.4), sfx(['c1', 'butt'], 's_fahhh.mp3', 0.45), png(['c1', 'butt'], 'e_sob.png'),
           sfx(['c1', 'nothing'], 's_huh.mp3', 0.5), png(['c1', 'nothing'], 'e_laugh.png', 260), sfx(['c2', 'sarah'], 's_awk.mp3', 0.45)]),
 'r3cheatY': dict(top='N3on tried to SKIP the workout', hl={'SKIP': '#FF2A2A'}, music=['empire_n', 20], ctaAt=['c3', 'tired'],
   tints=[[['hook', '50'], R], [['c1', 'restroom'], G], [['c2', 'cheater'], R], [['c3', 'calories'], R], [['c4', 'sue'], R]], rizz=[['c1', 'restroom']],
   punch=[['hook', 'no'], ['hook', '50'], ['c1', '50'], ['c1', 'restroom'], ['c2', 'scammer'], ['c2', 'cheater'], ['c3', 'f***'], ['c3', 'tired'], ['c3', 'calories'], ['c4', '50'], ['c4', 'sue']],
   blowouts=[['c2', 'cheater']], blackFlash=[['c4', 'sue']], streaks=[['c3'], ['c4']],
   extras=[sfx(['c1', 'restroom'], 's_huh.mp3', 0.5), png(['c1', 'restroom'], 'e_laugh.png', 260), sfx(['c2', 'cheater'], 's_awk.mp3', 0.45), png(['c2', 'cheater'], 'e_sob.png'),
           ov(['c3', 'calories'], 'greenflash2.mp4'), sfx(['c3', 'calories'], 's_wow.mp3', 0.45), sfx(['c4', 'sue'], 's_fahhh.mp3', 0.45)]),
}
for eid, c in CFG.items():
    c.update(cta='*full episode on @HardScope*', track='none', calls=[], src=f'g67_{EDITS[eid][0]}.mp4', intro=True, hardcut=True, cutSfx='s_camflash.mp3')
    sc = {s['id']: s for s in gen[eid]}
    refs = [r for r, _ in c['tints']] + [c['ctaAt']] + [e['at'] for e in c['extras']] + sum((c[k] for k in ('rizz', 'punch', 'blowouts', 'blackFlash', 'streaks')), [])
    for r in refs:
        if len(r) == 1: assert r[0] in sc, (eid, r); continue
        ws = [w for w in sc[r[0]]['words'] if w['word'].lower().startswith(r[1].lower())]
        assert len(ws) > (r[2] if len(r) > 2 else 0), (eid, r, [w['word'] for w in sc[r[0]]['words']])
json.dump(CFG, open('src/r3g.cfg.json', 'w'), indent=1); print('cfg ok')
