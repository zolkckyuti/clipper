"""HardScope R3born Ep2, batch H2 (2026-11-18): 5 MORE fresh moments (also none of batch H) (none of the 43 earlier R3 edits use these seconds),
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
 'r3hSlower': ((84.0, 107.0), [
     ('hook', 105.65, 106.85, [(105.65, 1000, 1.25, 470)]),
     ('s1', 84.55, 93.85, [(84.55, 1150, 1.05, 520), (88.0, 1300, 1.3, 450), (90.0, 1000, 1.0, 540), (92.1, 1250, 1.3, 460)]),
     ('s2', 94.05, 102.3, [(94.05, 900, 1.1, 480), (96.5, 1000, 1.0, 540), (100.8, 1150, 1.15, 500)])]),
 'r3hDie': ((137.5, 191.5), [
     ('hook', 188.35, 190.95, [(188.35, 960, 1.15, 480)]),
     ('s1', 138.05, 144.55, [(138.05, 960, 1.0, 540), (141.0, 960, 1.2, 500)]),
     ('s2', 164.6, 169.5, [(164.6, 960, 1.1, 500)]),
     ('s3', 177.1, 181.0, [(177.1, 960, 1.05, 520)])]),
 'r3hShake': ((359.0, 398.0), [
     ('hook', 391.65, 397.45, [(391.65, 760, 1.1, 520), (394.3, 700, 1.3, 480)]),
     ('s1', 359.65, 363.0, [(359.65, 960, 1.0, 540)]),
     ('s2', 369.05, 379.45, [(369.05, 1000, 1.05, 520), (374.0, 960, 1.15, 500), (377.0, 1000, 1.1, 500)])]),
 'r3hUpside': ((619.0, 636.0), [
     ('hook', 632.6, 635.25, [(632.6, 1000, 1.2, 500)]),
     ('s1', 619.6, 632.6, [(619.6, 820, 1.05, 520), (623.0, 900, 1.3, 460), (627.5, 960, 1.0, 540), (630.0, 1000, 1.15, 500)])]),
 'r3hCircus': ((487.0, 548.2), [
     ('hook', 542.45, 547.95, [(542.45, 900, 1.1, 480), (545.0, 900, 1.35, 430)]),
     ('s1', 487.85, 495.4, [(487.85, 960, 1.0, 540)]),
     ('s2', 496.05, 499.9, [(496.05, 800, 1.1, 500), (497.9, 700, 1.3, 460)]),
     ('s3', 538.0, 542.45, [(538.0, 900, 1.05, 520)])]),
}

for eid, ((w0, w1), plan) in EDITS.items():
    scenes = []
    for sid, a, b, cr in plan:
        n = round((b - a) * 30); words = []
        for (ws, we, t) in W:
            if a - 0.05 <= ws < b - 0.05:
                t = re.sub(r"(?i)\b(f)uck", lambda m: m.group(1) + '***', t)
                t = re.sub(r"(?i)\b(s)hit", lambda m: m.group(1) + 'h*t', t).strip(',.')
                t = 'N3on' if t.lower() == 'neon' else t
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
json.dump({k: v[0] for k, v in EDITS.items()}, open('src/h2.windows.json', 'w'))


def png(at, f, x=870, y=1290, size=200): return dict(at=at, kind='png', file=f, x=x, y=y, size=size)
def ov(at, f, dur=34): return dict(at=at, kind='ov', file=f, dur=dur)
def sfx(at, f, v=0.5): return dict(at=at, kind='sfx', file=f, v=v)


BASE = dict(cta='*full episode on @HardScope*', track='none', calls=[], intro=True, hardcut=True, cutSfx='s_camflash.mp3')
CFG = {
 'r3hSlower': dict(top='"I\'m not losing"… 12 seconds later', hl={'losing"…': '#58EE28'}, ctaAt=['s2', 'reach'], music=['m_sybau_n', 48.5],
   tints=[[['hook', 'slower'], 'R'], [['s1', 'losing'], 'G'], [['s2', 'pegs'], 'R']], rizz=[['s1', 'losing']],
   punch=[['hook', 'slower'], ['s1', 'glasses'], ['s1', 'great'], ['s1', 'easy'], ['s1', 'losing'], ['s2', 'reach'], ['s2', 'pegs']],
   blowouts=[['hook', 'slower']], blackFlash=[['s2']], streaks=[['s2']],
   extras=[png(['hook', 'please'], 'e_sob.png', 260), sfx(['hook', 'slower'], 's_fahhh.mp3', 0.45), sfx(['s1', 'glasses'], 's_huh.mp3', 0.45),
           ov(['s1', 'losing'], 'greenflash2.mp4'), sfx(['s1', 'losing'], 's_ding.mp3', 0.4)]),
 'r3hDie': dict(top='"You cannot beat me"… then Pilates got him', hl={'Pilates': '#FF2A2A'}, ctaAt=['s2', 'five'], music=['m_subway_n', 7.5],
   tints=[[['hook', 'die'], 'R'], [['s1', 'beat'], 'G'], [['s2', 'fart'], 'R']], rizz=[['s1', 'million']],
   punch=[['hook', 'die'], ['hook', 'over'], ['s1', 'killing'], ['s1', 'million'], ['s1', 'slower'], ['s1', 'beat'], ['s2', 'fart'], ['s3', 'smile']],
   blowouts=[['s2', 'fart']], blackFlash=[['s1']], streaks=[['s3']],
   extras=[png(['hook', 'die'], 'e_skull.png', 260), sfx(['s1', 'beat'], 's_wow.mp3', 0.4), sfx(['s2', 'fart'], 's_huh.mp3', 0.5),
           png(['s2', 'fart'], 'e_laugh.png'), sfx(['s3', 'smile'], 's_awk.mp3', 0.4)]),
 'r3hShake': dict(top='She nailed the headstand… then it was HIS turn', hl={'HIS': '#FF2A2A'}, ctaAt=['s2', 'ready'], music=['m_letmeknow_n', 1.5],
   tints=[[['hook', 'shaking'], 'R'], [['s2', 'hell'], 'G'], [['s2', 'glad'], 'G']], rizz=[['s2', 'hell']],
   punch=[['hook', 'shaking'], ['hook', 'shaking', 1], ['hook', 'leg'], ['s1', 'headstand'], ['s2', 'falling'], ['s2', 'hell'], ['s2', 'ready'], ['s2', 'glad']],
   blowouts=[['hook', 'shaking']], blackFlash=[['s2']], streaks=[['s2']],
   extras=[png(['hook', 'shaking'], 'e_skull.png', 260), sfx(['hook', 'shaking', 1], 's_huh.mp3', 0.45), sfx(['s2', 'falling'], 's_fahhh.mp3', 0.4),
           ov(['s2', 'hell'], 'greenflash2.mp4'), sfx(['s2', 'hell'], 's_correct.mp3', 0.4)]),
 'r3hUpside': dict(top='N3on hanging UPSIDE DOWN for the first time', hl={'UPSIDE': '#FF2A2A', 'DOWN': '#FF2A2A'}, ctaAt=['s1', 'reach'], music=['m_next_n', 7],
   tints=[[['hook', 'keep'], 'R'], [['s1', 'god'], 'G'], [['s1', 'knees', 1], 'R']], rizz=[['s1', 'there']],
   punch=[['hook', 'keep'], ['hook', 'oh'], ['s1', 'tuck'], ['s1', 'god'], ['s1', 'f***'], ['s1', 'hooked'], ['s1', 'knees', 1], ['s1', 'center']],
   blowouts=[['s1', 'f***']], blackFlash=[['s1']], streaks=[['s1', 'okay']],
   extras=[sfx(['s1', 'f***'], 's_huh.mp3', 0.5), png(['s1', 'f***'], 'e_skull.png', 260), sfx(['hook', 'oh'], 's_fahhh.mp3', 0.45),
           png(['hook', 'oh'], 'e_sob.png')]),
 'r3hCircus': dict(top='They put N3on in a CIRCUS sport', hl={'CIRCUS': '#FF2A2A'}, ctaAt=['s3', 'sink'], music=['m_nowornever_n', 13],
   tints=[[['hook', 'burns'], 'R'], [['s1', 'spinning'], 'R'], [['s2', 'acrobatics'], 'G']], rizz=[['s2', 'acrobatics']],
   punch=[['hook', 'hold'], ['hook', 'nice'], ['hook', 'burns'], ['s1', 'fabric'], ['s1', 'ceiling'], ['s1', 'spinning'], ['s2', 'professional'], ['s2', 'acrobatics'], ['s3', 'knees']],
   blowouts=[['hook', 'burns']], blackFlash=[['s2']], streaks=[['s3']],
   extras=[png(['hook', 'burns'], 'e_sob.png', 260), sfx(['hook', 'burns'], 's_awk.mp3', 0.45), sfx(['s1', 'spinning'], 's_huh.mp3', 0.45),
           ov(['s2', 'acrobatics'], 'greenflash2.mp4'), sfx(['s2', 'acrobatics'], 's_wow.mp3', 0.4)]),
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
json.dump(out, open('src/h2.cfg.json', 'w'), indent=1)
print('ok', list(out))
