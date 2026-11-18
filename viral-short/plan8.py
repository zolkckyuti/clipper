# R3born Ep2 batch 2 (VverPaldo style): hook (wildest second) -> rewind -> scene, cut BEFORE it resolves (brief: send them to the episode).
# Writes into src/edits.gen.json + src/r3.cfg.json. Source: public/r3ep2.mp4 (gitignored). Crops from autoplan (src/tracks/r3).
import json, sys
W = [w for s in json.load(open(sys.argv[1])) for w in s['w']]
A = json.load(open('src/tracks/r3b/auto_edits.json'))
CR = {k: [tuple(c) for c in v['crops']] for k, v in A.items()}
FIX = {'neon': 'N3on', 'fuck': 'f***', 'fucking': 'f***ing', 'shitting': 'sh*tting', 'shit': 'sh*t', 'dumbass': 'dumba**'}
ATW = {(619.2, 'spider'): 'Spider-Man', (619.4, '-man'): '', (482.4, 'and'): '', (482.7, 'women'): '', (482.8, 'himself'): '…', (148.8, 'lot'): 'lat?', (436.8, 'bring'): 'burned', (720.6, 'pool'): 'pole', (450.8, 'chat'): 'ChatGPT', (451.0, 'gpt'): '', (247.3, 'hold'): 'Pole', (247.9, 'answer'): 'dancer?', (252.7, 'put'): 'pole', (252.8, 'answer'): 'dance', (253.6, 'it'): '', (259.4, 'throwing'): 'thrown at',
       (213.4, "i'd"): "I", (213.8, 'hundred'): '100…', (214.0, 'hundred'): '', (213.7, 'a'): '', (215.1, 'hundred'): '103', (215.3, 'and'): '', (215.5, 'three'): '',
       (684.8, 'the'): 'What the', (687.4, 'cuz'): "'cause"}
def crops(eid, a, b):
    c = [x for x in CR[eid] if a - 0.01 <= x[0] < b]; prev = [x for x in CR[eid] if x[0] <= a]
    first = prev[-1][1] if prev else (c[0][1] if c else 960)
    return [(a, first)] + [x for x in c if x[0] > a + 0.01]
RW = 12
EDITS = {
 'r3stakes': [('hook', 40.15, 41.75), ('rw', 41.75, 27.50, None), ('c1', 27.50, 44.20)],
 'r3hand': [('hook', 387.40, 388.90), ('rw', 388.90, 379.55, None), ('c1', 379.55, 391.50), ('c2', 397.80, 402.40)],
 'r3reformer': [('hook', 159.40, 160.60), ('rw', 160.60, 132.00, None), ('c1', 132.00, 137.50), ('c2', 145.50, 160.60)],
 'r3chatgpt': [('hook', 436.25, 439.80), ('rw', 439.80, 430.55, None), ('c1', 430.55, 439.80), ('c2', 448.15, 457.45)],
 'r3rip': [('hook', 759.25, 762.60), ('rw', 762.60, 754.95, None), ('c1', 754.95, 769.40), ('c2', 773.45, 776.60)],
 'r3tuck': [('hook', 567.90, 570.00), ('rw', 570.00, 548.00, None), ('c1', 548.00, 556.50), ('c2', 565.60, 574.45)],
 'r3pretty': [('hook', 480.30, 484.00), ('rw', 484.00, 467.80, None), ('c1', 467.80, 469.00), ('c2', 475.70, 487.75)],
 'r3spider': [('hook', 616.25, 617.90), ('rw', 617.90, 601.80, None), ('c1', 601.80, 619.60)],
 'r3skinny': [('hook', 57.85, 58.85), ('rw', 58.85, 44.60, None), ('c1', 44.60, 47.00), ('c2', 51.45, 60.80)],
 'r3reveal': [('hook', 736.90, 738.30), ('rw', 738.30, 718.75, None), ('c1', 718.75, 731.20), ('c2', 736.90, 741.90)],
}
SRCMAP = {'r3stakes': 'stakes', 'r3hand': 'handstand', 'r3reformer': 'reformer', 'r3chatgpt': 'genes', 'r3reveal': 'reveal', 'r3rip': 'rip', 'r3tuck': 'tuck', 'r3pretty': 'pretty', 'r3spider': 'spider', 'r3skinny': 'skinny'}
# --- "WAIT FOR IT" teaser versions (no hook/rewind): story only + payoff PiP; cues inherited minus hook refs
NEW = {
 'r3ripT': ('r3rip', 'rip', [('c1', 753.05, 769.40), ('c2', 773.45, 776.60)], dict(a=759.95, b=762.30, x=960, z=1.0, y=540, until=['c1', 'one'])),
 'r3cheatT': ('r3cheat', 'cheat', [('c1', 639.35, 641.95), ('c2', 659.41, 661.95), ('c3', 683.98, 694.62)], dict(a=684.60, b=686.80, x=960, z=1.0, y=540, until=['c3', 'what'])),
 'r3poleT': ('r3pole', 'pole', [('c1', 331.75, 340.92), ('c2', 349.39, 356.60)], dict(a=353.10, b=355.20, x=1010, z=1.0, y=540, until=['c2', 'whoa'])),
 'r3chatgptT': ('r3chatgpt', 'genes', [('c1', 430.55, 439.80), ('c2', 448.15, 457.45)], dict(a=455.60, b=457.40, x=960, z=1.0, y=540, until=['c2', 'comeback'])),
 'r3handT': ('r3hand', 'handstand', [('c1', 379.55, 391.50), ('c2', 397.80, 402.40)], dict(a=389.30, b=391.40, x=960, z=1.0, y=540, until=['c1', 'nothing'])),
}
for nid, (base, crk, scenes, tz) in NEW.items(): EDITS[nid] = scenes; SRCMAP[nid] = crk
# --- hook + straight cut versions (user pick after the teaser test): base edit minus the rewind scene
HARD = {'r3ripH': 'r3rip', 'r3handH': 'r3hand', 'r3chatgptH': 'r3chatgpt'}
for nid, base in HARD.items(): EDITS[nid] = [p for p in EDITS[base] if p[0] != 'rw']; SRCMAP[nid] = SRCMAP[base]
gen = json.load(open('src/edits.gen.json'))
for eid, plan in EDITS.items():
    scenes = []
    for p in plan:
        sid, a, b = p[:3]
        if len(p) == 4:
            scenes.append({'id': sid, 'videoStartSec': b, 'durationInFrames': RW, 'cropX': 960, 'crops': [[0, 960]], 'rewind': [a, b], 'words': []}); continue
        cr = crops(SRCMAP[eid], a, b); n = round((b - a) * 30); words = []
        for (ws, we, t) in W:
            if a - 0.05 <= ws < b - 0.05:
                k = (round(ws, 1), t.lower().strip(',.?!')); tt = ATW[k] if k in ATW else FIX.get(t.lower().strip(',.?!'), t.strip(',.'))
                if not tt: continue
                f0 = max(0, round((ws - a) * 30)); f1 = min(n, max(f0 + 4, round((we - a) * 30) + 3))
                words.append({'word': tt, 'startFrame': f0, 'endFrame': f1})
        for i in range(len(words) - 1): words[i]['endFrame'] = min(words[i]['endFrame'], words[i + 1]['startFrame'])
        scenes.append({'id': sid, 'videoStartSec': a, 'durationInFrames': n, 'cropX': cr[0][1], 'crops': [[round((s - a) * 30), x] for s, x in cr], 'words': words})
    gen[eid] = scenes
    print(eid, round(sum(s['durationInFrames'] for s in scenes) / 30, 1), 's |', ' / '.join(s['id'] + ': ' + ' '.join(w['word'] for w in s['words']) for s in scenes)[:400])
json.dump(gen, open('src/edits.gen.json', 'w'))
G, R = 'G', 'R'
CTA = '*full episode on @HardScope*'
CFG = {
 'r3stakes': dict(top='Loser gets WAXED…', hl={'WAXED…': '#FF2A2A'}, music=['chess_n', 110], ctaAt=['c1', 'okay'],
   tints=[[['hook', 'wax'], R], [['c1', 'winning'], G], [['c1', 'losing'], R], [['c1', 'wax'], R]], rizz=[['c1', 'winning']],
   punch=[['hook', 'wax'], ['hook', 'armpit'], ['c1', 'calories'], ['c1', 'winning'], ['c1', 'losing'], ['c1', 'punishment'], ['c1', 'spicy'], ['c1', 'wax'], ['c1', 'hairy'], ['c1', 'waxing']],
   blowouts=[['c1', 'wax']], blackFlash=[['c1']], streaks=[['c1', 'lose']]),
 'r3hand': dict(top='N3on tried a HANDSTAND', hl={'HANDSTAND': '#FF2A2A'}, music=['phonk_n', 90], ctaAt=['c1', 'tuck'],
   tints=[[['hook', 'nothing'], R], [['c1', 'kick'], G], [['c1', 'butt'], R], [['c2', 'stripper'], R]], rizz=[['c1', 'kick']],
   punch=[['hook', 'nothing'], ['hook', 'look'], ['c1', 'kick'], ['c1', 'tuck'], ['c1', 'butt'], ['c1', 'nothing'], ['c2', 'again'], ['c2', 'trusted'], ['c2', 'stripper'], ['c2', 'sarah']],
   blowouts=[['c2', 'stripper']], blackFlash=[['c1']], streaks=[['c2']]),
 'r3reformer': dict(top='Pilates BROKE N3on', hl={'BROKE': '#FF2A2A'}, music=['goodbye_n', 15], ctaAt=['c2', 'inhale'],
   tints=[[['hook', 'sh*t'], R], [['c2', 'lats'], G], [['c2', 'f***'], R], [['c2', 'fire'], R]], rizz=[['c2', 'lats']],
   punch=[['hook', 'doing'], ['hook', 'sh*t'], ['c2', 'f***'], ['c2', 'lat?'], ['c2', 'abs'], ['c2', 'fire'], ['c2', 'me'], ['c2', 'sh*t']],
   blowouts=[['c2', 'fire']], blackFlash=[['c1']], streaks=[['c2']]),
 'r3chatgpt': dict(top="N3on's excuse after losing AGAIN", hl={'AGAIN': '#FF2A2A'}, music=['chess_n', 30], ctaAt=['c2', 'chat'],
   tints=[[['hook', '50'], R], [['hook', 'crushed'], R], [['c1', 'hundred'], G], [['c2', 'chat'], G], [['c2', 'lebron'], G]], rizz=[['c2', 'chat'], ['c2', 'lebron']],
   punch=[['hook', '50'], ['hook', 'exactly'], ['hook', 'crushed'], ['c1', 'calories'], ['c1', 'hundred'], ['c1', '50'], ['c2', 'genes'], ['c2', 'chat'], ['c2', 'men'], ['c2', 'comeback'], ['c2', 'lebron']],
   blowouts=[['c2', 'lebron']], blackFlash=[['c1']], streaks=[['c2']]),
 'r3rip': dict(top='The moment N3on got WAXED', hl={'WAXED': '#FF2A2A'}, music=['goodbye_n', 40], ctaAt=['c1', 'wow'],
   tints=[[['hook', 'one'], R], [['c1', 'lawyers'], G], [['c1', 'one'], R], [['c1', 'wax'], G]], rizz=[['c1', 'lawyers'], ['c1', 'wax']],
   punch=[['hook', 'two'], ['hook', 'one'], ['c1', 'f***'], ['c1', 'lawyers'], ['c1', 'two'], ['c1', 'one'], ['c1', 'wow'], ['c1', 'wax'], ['c2', 'suffer']],
   blowouts=[['c1', 'one']], blackFlash=[['c1', 'one']], streaks=[['c2']]),
 'r3tuck': dict(top='Who can hold it LONGER?', hl={'LONGER?': '#FF2A2A'}, music=['chess_n', 60], ctaAt=['c2', 'really'],
   tints=[[['hook', 'winner'], G], [['c1', 'go'], G], [['c2', 'winner'], G], [['c2', 'really'], R]], rizz=[['c1', 'go'], ['c2', 'winner']],
   punch=[['hook', 'winner'], ['c1', 'hold'], ['c1', 'longest'], ['c1', 'three'], ['c1', 'two'], ['c1', 'one'], ['c1', 'go'], ['c2', 'winner'], ['c2', 'really']],
   blowouts=[['c2', 'winner']], blackFlash=[['c1']], streaks=[['c2']]),
 'r3pretty': dict(top="N3on's REAL reason for getting jacked", hl={'REAL': '#FF2A2A'}, music=['phonk_n', 20], ctaAt=['c2', 'i'],
   tints=[[['hook', 'women', 1], R], [['c1', 'f***'], R], [['c2', 'jacked'], G], [['c2', 'specifically'], R]], rizz=[['c2', 'jacked']],
   punch=[['hook', 'pretty'], ['hook', 'specifically'], ['c1', 'f***'], ['c2', 'n3on'], ['c2', 'big'], ['c2', 'jacked'], ['c2', 'pretty'], ['c2', 'specifically'], ['c2', 'idea']],
   blowouts=[['c2', 'specifically']], blackFlash=[['c2']], streaks=[['c2']]),
 'r3spider': dict(top='N3on hanging UPSIDE DOWN', hl={'UPSIDE': '#FF2A2A', 'DOWN': '#FF2A2A'}, music=['goodbye_n', 10], ctaAt=['c1', 'try'],
   tints=[[['hook', 'doing'], G], [['c1', 'sh*t'], R], [['c1', 'why'], R], [['c1', 'spider-man'], G]], rizz=[['c1', 'spider-man']],
   punch=[['hook', 'doing'], ['c1', 'sh*t'], ['c1', 'straddle'], ['c1', 'why'], ['c1', 'why', 2], ['c1', 'legs'], ['c1', 'doing'], ['c1', 'spider-man']],
   blowouts=[['c1', 'doing']], blackFlash=[['c1']], streaks=[['c1', 'try']]),
 'r3skinny': dict(top='She roasted his transformation', hl={'roasted': '#FF2A2A'}, music=['chess_n', 95], ctaAt=['c2', 'wait'],
   tints=[[['hook', 'skinny'], R], [['c1', 'transformation'], G], [['c2', 'impressive'], R], [['c2', 'fat'], R]], rizz=[['c1', 'transformation']],
   punch=[['hook', 'skinny'], ['hook', 'fat'], ['c1', 'transformation'], ['c2', 'beat'], ['c2', 'nothing'], ['c2', 'impressive'], ['c2', 'skinny?'], ['c2', 'skinny', 1], ['c2', 'fat']],
   blowouts=[['c2', 'fat']], blackFlash=[['c2']], streaks=[['c2']]),
 'r3reveal': dict(top='N3on vs Sarah… FINAL score', hl={'FINAL': '#FF2A2A'}, music=['phonk_n', 40], ctaAt=['c1', 'okay'],
   tints=[[['hook', '389'], G], [['c1', 'won'], G], [['c1', '326'], R], [['c2', '389'], G]], rizz=[['c1', 'won'], ['c2', '389']],
   punch=[['hook', '389'], ['hook', 'dumba**'], ['c1', 'stripper'], ['c1', 'won'], ['c1', 'grand'], ['c1', '326'], ['c1', 'dumba**'], ['c2', '389'], ['c2', 'eyebrow'], ['c2', 'calf']],
   blowouts=[['c2', '389']], blackFlash=[['c1']], streaks=[['c2']]),
}
BASE = {**json.load(open('src/r3.cfg.json')), **CFG}
for nid, (base, crk, scenes, tz) in NEW.items():
    b = json.loads(json.dumps(BASE[base])); ok = lambda r: r[0] not in ('hook', 'rw')
    for k in ('rizz', 'punch', 'blowouts', 'blackFlash', 'streaks'): b[k] = [r for r in b[k] if ok(r)]
    b['tints'] = [t for t in b['tints'] if ok(t[0])]
    if not ok(b['ctaAt']): b['ctaAt'] = ['c1']
    b['teaser'] = tz; CFG[nid] = b
for nid, base in HARD.items(): CFG[nid] = {**json.loads(json.dumps(CFG[base])), 'hardcut': True}
for eid, c in CFG.items():
    c.update(cta=CTA, track='none', calls=[], src='r3ep2.mp4', intro=True)
    sc = {s['id']: s for s in gen[eid]}
    for key in ('tints', 'rizz', 'punch', 'blowouts', 'blackFlash', 'streaks', 'ctaAt'):
        refs = c[key] if key != 'tints' else [r for r, _ in c[key]]
        if key == 'ctaAt': refs = [refs]
        for r in refs:
            if len(r) == 1: assert r[0] in sc, (eid, r); continue
            ws = [w for w in sc[r[0]]['words'] if w['word'].lower().startswith(r[1].lower())]
            assert len(ws) > (r[2] if len(r) > 2 else 0), (eid, key, r, [w['word'] for w in sc[r[0]]['words']])
json.dump(CFG, open('src/r3b.cfg.json', 'w')); print('cfg ok')
