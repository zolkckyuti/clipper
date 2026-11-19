"""YoungLA Bodybuilders vs Models (ClipFarm), same R3born style (2026-11-18): 5 MORE fresh moments (also none of batch H) (none of the 43 earlier R3 edits use these seconds),
VerPaldo default: hook (wildest second) -> hard cut (white flash + camera flash) into the story, cut before it resolves.
Brief rules: @HardScope + #r3born, never FaZe, no politics, Ep2 footage only, >= 7 s, big captions, no dead air,
no invented context. Words: faster-whisper large-v3 on the 1080p proxy (scratchpad tx/r3ep2.json).
Each edit renders from a graded excerpt public/g_<id>.mp4 = r3ep2.mp4[W0, W1] (grade = CapCut 4K filter, source only).
Usage: python3 planH.py <tx.json>"""
import json, re, sys
T = json.load(open(sys.argv[1]))
W = [w for s in T for w in s['w']]
FIX = {'fuck': 'f***', 'fucking': 'f***ing', 'shit': 'sh*t', 'shit,': 'sh*t,', 'shit.': 'sh*t.'}
G = json.load(open('src/edits.gen.json'))

# id: (excerpt window, scenes [(sid, a, b, crops [(t, x, zoom, y)])])
EDITS = {
 'bbSkully': ((164.0, 192.5), [
     ('hook', 186.65, 192.0, [(186.65, 560, 1.25, 470), (187.65, 1400, 1.25, 470), (189.15, 560, 1.25, 470), (190.15, 1400, 1.25, 470), (191.15, 560, 1.25, 470)]),
     ('s0', 164.7, 173.5, [(164.7, 960, 1.0, 540), (168.0, 960, 1.25, 480)]),
     ('s1', 176.85, 186.6, [(176.85, 960, 1.0, 540), (182.25, 1400, 1.25, 470), (183.25, 560, 1.25, 470), (185.0, 560, 1.25, 470)])]),
 'bbBail': ((306.5, 341.0), [
     ('hook', 329.55, 336.15, [(329.55, 900, 1.15, 520)]),
     ('s1', 306.85, 313.8, [(306.85, 960, 1.0, 540)]),
     ('s2', 320.5, 324.5, [(320.5, 960, 1.0, 540)]),
     ('s3', 327.45, 329.55, [(327.45, 960, 1.0, 540)]),
     ('s4', 336.3, 340.0, [(336.3, 900, 1.15, 520)])]),
 'bbJohnny': ((412.5, 445.6), [
     ('hook', 412.75, 418.95, [(412.75, 960, 1.0, 540), (416.5, 960, 1.2, 500)]),
     ('s1', 420.55, 426.8, [(420.55, 990, 1.0, 540), (422.5, 960, 1.1, 520)]),
     ('s2', 427.85, 431.55, [(427.85, 560, 1.25, 470)]),
     ('s3', 433.05, 436.8, [(433.05, 990, 1.0, 540)]),
     ('s4', 440.25, 445.45, [(440.25, 560, 1.25, 470), (442.55, 1400, 1.25, 470), (443.45, 560, 1.25, 470)])]),
 'bbSound': ((824.5, 867.2), [
     ('hook', 860.55, 866.95, [(860.55, 560, 1.25, 470), (861.95, 1400, 1.25, 470), (864.05, 560, 1.25, 470)]),
     ('s1', 824.85, 829.6, [(824.85, 960, 1.0, 540)]),
     ('s2', 835.05, 838.25, [(835.05, 960, 1.0, 540)]),
     ('s3', 841.65, 846.5, [(841.65, 1400, 1.25, 470), (843.25, 560, 1.25, 470), (844.85, 1400, 1.25, 470)]),
     ('s4', 851.15, 859.35, [(851.15, 560, 1.25, 470), (852.95, 1400, 1.25, 470), (856.65, 560, 1.25, 470)])]),
 'bbDance': ((641.0, 681.2), [
     ('hook', 654.75, 656.65, [(654.75, 1300, 1.3, 470)]),
     ('s1', 641.45, 647.45, [(641.45, 960, 1.0, 540)]),
     ('s2', 651.55, 652.85, [(651.55, 960, 1.0, 540)]),
     ('s3', 673.75, 681.0, [(673.75, 960, 1.0, 540), (677.0, 960, 1.2, 500)])]),
}

for eid, ((w0, w1), plan) in EDITS.items():
    scenes = []
    for sid, a, b, cr in plan:
        n = round((b - a) * 30); words = []
        for (ws, we, t) in W:
            if a - 0.05 <= ws < b - 0.05:
                t = re.sub(r"(?i)\b(f)uck", lambda m: m.group(1) + '***', t)
                t = re.sub(r"(?i)\b(s)hit", lambda m: m.group(1) + 'h*t', t).strip(',.')
                t = 'Skully' if t.lower().strip(',.?') == 'skully' else ('runway' if t.lower().strip(',.?') == 'laptop' else t)
                if not t:
                    continue
                f0 = max(0, round((ws - a) * 30)); f1 = min(n, max(f0 + 4, round((we - a) * 30) + 3))
                words.append({'word': t, 'startFrame': f0, 'endFrame': f1})
        for i in range(len(words) - 1):
            words[i]['endFrame'] = words[i + 1]['startFrame']  # captions always on: hold until the next word
        if words:
            words[-1]['endFrame'] = n
        crops = [[max(0, round((t - a) * 30)), x, z, y] for t, x, z, y in cr]
        scenes.append({'id': sid, 'videoStartSec': round(a - w0, 3), 'durationInFrames': n, 'cropX': 960, 'crops': crops, 'words': words})
    G[eid] = scenes
    print(eid, round(sum(s['durationInFrames'] for s in scenes) / 30, 1), 's |', ' / '.join(s['id'] + ': ' + ' '.join(w['word'] for w in s['words']) for s in scenes))
json.dump(G, open('src/edits.gen.json', 'w'))
json.dump({k: v[0] for k, v in EDITS.items()}, open('src/bb.windows.json', 'w'))


def png(at, f, x=870, y=1290, size=200): return dict(at=at, kind='png', file=f, x=x, y=y, size=size)
def ov(at, f, dur=34): return dict(at=at, kind='ov', file=f, dur=dur)
def sfx(at, f, v=0.5): return dict(at=at, kind='sfx', file=f, v=v)


BASE = dict(track='none', calls=[], intro=True, hardcut=True, cutSfx='s_camflash.mp3')
CFG = {
 'bbSkully': dict(top='His Skully alibi fell apart in 2 seconds', hl={'alibi': '#FF2A2A'}, cta='*would you wear a Skully?*', ctaAt=['s1', 'love'], music=['bb_aura_n', 22],
   tints=[[['hook', 'deadass'], 'R'], [['s0', 'strong'], 'G'], [['s1', 'skully', 1], 'G']], rizz=[['s0', 'professional']],
   punch=[['hook', 'last'], ['hook', 'two'], ['hook', 'deadass'], ['hook', 'no'], ['s0', 'marlon'], ['s0', 'burberry'], ['s1', 'skully'], ['s1', 'white']],
   blowouts=[['hook', 'no']], blackFlash=[['s1']], streaks=[['s0']],
   extras=[sfx(['hook', 'deadass'], 's_huh.mp3', 0.45), png(['hook', 'thought'], 'e_laugh.png', 260), sfx(['s0', 'burberry'], 's_wow.mp3', 0.4)]),
 'bbBail': dict(top='"Gonna run to the bathroom"... he never came back', hl={'never': '#FF2A2A'}, cta='*would you have left too?*', ctaAt=['s1', 'coming'], music=['bb_funkabn_n', 7.5],
   tints=[[['hook', 'paid'], 'R'], [['s3', 'doing'], 'R'], [['s4', 'good'], 'G']], rizz=[['s4', 'good']],
   punch=[['hook', 'paid'], ['hook', 'watching'], ['hook', 'love'], ['s1', 'bathroom'], ['s1', '30'], ['s3', 'doing'], ['s4', 'wait']],
   blowouts=[['s3', 'doing']], blackFlash=[['s2']], streaks=[['s2']],
   extras=[sfx(['s1', 'bathroom'], 's_huh.mp3', 0.45), sfx(['s3', 'doing'], 's_fahhh.mp3', 0.45), png(['hook', 'love'], 'e_laugh.png', 260)]),
 'bbJohnny': dict(top='They felt his aura from 100 MILES away', hl={'MILES': '#FF2A2A'}, cta='*who has the most aura?*', ctaAt=['s1', 'website'], music=['bb_alquimia_n', 25],
   tints=[[['hook', 'pants'], 'R'], [['s1', 'every'], 'G'], [['s3', 'miles'], 'G'], [['s4', 'aura'], 'G']], rizz=[['s3', 'miles']],
   punch=[['hook', 'johnny'], ['hook', 'pants'], ['s1', 'face'], ['s1', 'every'], ['s2', 'goosebumps'], ['s3', '100'], ['s4', 'head'], ['s4', 'aura']],
   blowouts=[['hook', 'pants']], blackFlash=[['s2']], streaks=[['s4']],
   extras=[sfx(['hook', 'pants'], 's_huh.mp3', 0.5), png(['hook', 'pants'], 'e_skull.png', 260), sfx(['s4', 'aura'], 's_wow.mp3', 0.4)]),
 'bbSound': dict(top='The most aura at the show went to... the SOUND GUY', hl={'SOUND': '#58EE28', 'GUY': '#58EE28'}, cta='*who would you give it to?*', ctaAt=['s1', 'aura'], music=['bb_empire_n', 19.5],
   tints=[[['hook', 'noise'], 'G'], [['s3', 'sound'], 'G'], [['s4', 'speak'], 'R']], rizz=[['s3', 'sound']],
   punch=[['hook', 'noise'], ['hook', 'himself'], ['hook', 'wow'], ['s1', 'aura'], ['s2', 'most'], ['s3', 'sound'], ['s4', 'speak'], ['s4', 'volumes']],
   blowouts=[['hook', 'wow']], blackFlash=[['s4']], streaks=[['s3']],
   extras=[sfx(['hook', 'wow'], 's_wow.mp3', 0.45), png(['s3', 'sound'], 'e_heart.png', 260), sfx(['s2', 'most'], 's_huh.mp3', 0.4)]),
 'bbDance': dict(top='They asked a bodybuilder for ONE dance move...', hl={'ONE': '#FF2A2A'}, cta='*rate the dance 1-10*', ctaAt=['s1', 'come'], music=['bb_sentamento_n', 33.5],
   tints=[[['hook', 'better'], 'R'], [['s2', 'whoa'], 'G'], [['s3', 'home'], 'R']], rizz=[['s2', 'whoa']],
   punch=[['hook', 'urs'], ['hook', 'better'], ['s1', 'dance'], ['s1', 'come'], ['s2', 'whoa'], ['s3', 'that'], ['s3', 'home']],
   blowouts=[['s3', 'home']], blackFlash=[['s1']], streaks=[['s2']],
   extras=[sfx(['s3', 'home'], 's_fahhh.mp3', 0.45), png(['s3', 'know'], 'e_laugh.png', 260), sfx(['hook', 'better'], 's_huh.mp3', 0.4)]),
}
out = {}
for eid, d in CFG.items():
    c = {**BASE, **d, 'src': f'g_{eid}.mp4'}
    sc = {s['id']: s for s in G[eid]}
    refs = [e['at'] for e in c['extras']] + [t[0] for t in c['tints']] + c['rizz'] + c['punch'] + c['blowouts'] + c['blackFlash'] + c['streaks'] + [c['ctaAt']]
    for r in refs:
        assert r[0] in sc, (eid, r)
        if len(r) > 1:
            n = r[2] if len(r) > 2 else 0
            hits = [x for x in sc[r[0]]['words'] if x['word'].lower().startswith(r[1].lower())]
            assert len(hits) > n, (eid, r, [x['word'] for x in sc[r[0]]['words']])
    out[eid] = c
json.dump(out, open('src/bb.cfg.json', 'w'), indent=1)
print('ok', list(out))
