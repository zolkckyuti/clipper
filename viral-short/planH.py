"""HardScope R3born Ep2, batch H (2026-11-18): 5 FRESH moments (none of the 43 earlier R3 edits use these seconds),
VerPaldo default: hook (wildest second) -> hard cut (white flash + camera flash) into the story, cut before it resolves.
Brief rules: @HardScope + #r3born, never FaZe, no politics, Ep2 footage only, >= 7 s, big captions, no dead air,
no invented context. Words: faster-whisper large-v3 on the 1080p proxy (scratchpad tx/r3ep2.json).
Each edit renders from a graded excerpt public/g_<id>.mp4 = r3ep2.mp4[W0, W1] (grade = CapCut 4K filter, source only).
Usage: python3 planH.py <tx.json>"""
import json, sys
T = json.load(open(sys.argv[1]))
W = [w for s in T for w in s['w']]
FIX = {'fuck': 'f***', 'fucking': 'f***ing', 'shit': 'sh*t', 'shit,': 'sh*t,', 'shit.': 'sh*t.'}
G = json.load(open('src/edits.gen.json'))

# id: (excerpt window, scenes [(sid, a, b, crops [(t, x, zoom, y)])])
EDITS = {
 'r3hOpen': ((0.0, 30.0), [
     ('hook', 7.15, 9.55, [(7.15, 900, 1.15, 470)]),
     ('s1', 0.0, 6.9, [(0.0, 960, 1.0, 540), (2.0, 960, 1.35, 430), (5.0, 960, 1.05, 540)]),
     ('s2', 11.7, 15.15, [(11.7, 980, 1.3, 420)]),
     ('s3', 19.45, 29.45, [(19.45, 1000, 1.1, 480), (21.4, 960, 1.0, 540), (26.2, 980, 1.1, 480)])]),
 'r3hPrison': ((60.5, 84.5), [
     ('hook', 82.95, 84.3, [(82.95, 1400, 1.6, 420)]),
     ('s1', 61.1, 66.6, [(61.1, 1350, 1.35, 420), (63.2, 1050, 1.1, 470)]),
     ('s2', 73.9, 82.95, [(73.9, 1150, 1.05, 500), (78.4, 1350, 1.4, 430), (79.7, 900, 1.1, 480), (82.0, 1150, 1.0, 540)])]),
 'r3hTough': ((268.5, 293.0), [
     ('hook', 290.05, 292.6, [(290.05, 960, 1.0, 540)]),
     ('s1', 270.6, 277.3, [(270.6, 900, 1.05, 520), (272.7, 1300, 1.3, 440)]),
     ('s2', 277.5, 290.05, [(277.5, 850, 1.1, 480), (280.4, 850, 1.45, 430), (284.0, 850, 1.75, 420), (285.5, 900, 1.05, 520)])]),
 'r3hTurn': ((300.5, 332.0), [
     ('hook', 327.75, 331.62, [(327.75, 1040, 1.2, 480), (330.75, 1040, 1.6, 440)]),
     ('s1', 301.45, 312.45, [(301.45, 900, 1.05, 520), (308.85, 960, 1.0, 540)]),
     ('s2', 320.35, 327.75, [(320.35, 1050, 1.05, 520), (323.15, 1050, 1.3, 470)])]),
 'r3hSilks': ((568.5, 598.6), [
     ('hook', 592.45, 597.9, [(592.45, 1050, 1.0, 540), (594.4, 1050, 1.12, 500)]),
     ('s1', 569.15, 574.45, [(569.15, 960, 1.0, 540), (573.5, 980, 1.3, 460)]),
     ('s2', 584.6, 592.45, [(584.6, 1000, 1.1, 500), (589.3, 1250, 1.35, 470)])]),
}

for eid, ((w0, w1), plan) in EDITS.items():
    scenes = []
    for sid, a, b, cr in plan:
        n = round((b - a) * 30); words = []
        for (ws, we, t) in W:
            if a - 0.05 <= ws < b - 0.05:
                t = FIX.get(t.lower(), t).strip(',.')
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
json.dump({k: v[0] for k, v in EDITS.items()}, open('src/h.windows.json', 'w'))


def png(at, f, x=870, y=1290, size=200): return dict(at=at, kind='png', file=f, x=x, y=y, size=size)
def ov(at, f, dur=34): return dict(at=at, kind='ov', file=f, dur=dur)
def sfx(at, f, v=0.5): return dict(at=at, kind='sfx', file=f, v=v)


BASE = dict(cta='*full episode on @HardScope*', track='none', calls=[], intro=True, hardcut=True, cutSfx='s_camflash.mp3')
CFG = {
 'r3hOpen': dict(top='3 "women\'s workouts" vs N3on… who breaks first?', hl={'N3on…': '#FF2A2A'}, ctaAt=['s3', 'three'], music=['m_impostor_n', 7],
   tints=[[['s1', 'joke'], 'R'], [['s2', 'sarah'], 'G'], [['s3', 'three'], 'G']], rizz=[['s2', 'sarah']],
   punch=[['hook', 'pants'], ['s1', 'insane'], ['s1', 'joke'], ['s1', 'really'], ['s2', 'sarah'], ['s3', 'calories'], ['s3', 'three'], ['s3', 'lead']],
   blowouts=[['s1', 'joke']], blackFlash=[['s1']], streaks=[['s3']],
   extras=[sfx(['hook', 'huh'], 's_huh.mp3', 0.5), png(['hook', 'huh'], 'e_skull.png', 260), sfx(['s1', 'joke'], 's_ding.mp3', 0.4),
           png(['s3', 'calories'], 'e_think.png'), sfx(['s3', 'lead'], 's_wow.mp3', 0.4)]),
 'r3hPrison': dict(top='Pilates was invented WHERE?!', hl={'WHERE?!': '#FF2A2A'}, ctaAt=['s2', 'meet'], music=['m_getout_n', 5],
   tints=[[['hook', 'straight'], 'R'], [['s1', 'pilates'], 'G'], [['s2', 'prison'], 'R']], rizz=[['s1', 'pilates']],
   punch=[['hook', 'straight'], ['s1', 'challenge'], ['s1', 'kidding'], ['s1', 'pilates'], ['s2', 'men'], ['s2', 'invented'], ['s2', 'prison']],
   blowouts=[['s2', 'prison']], blackFlash=[['s2']], streaks=[['s2']],
   extras=[png(['hook', 'straight'], 'e_skull.png', 260), sfx(['s1', 'kidding'], 's_huh.mp3', 0.45), sfx(['s2', 'prison'], 's_fahhh.mp3', 0.45),
           png(['s2', 'prison'], 'e_laugh.png')]),
 'r3hTough': dict(top='"This won\'t be too tough"… then she did THIS', hl={'THIS': '#FF2A2A'}, ctaAt=['s2', 'interested'], music=['m_wtf_n', 0],
   tints=[[['hook', 'oh'], 'G'], [['s1', 'flexible'], 'G'], [['s2', 'tough'], 'R']], rizz=[['s1', 'flexible']],
   punch=[['hook', 'oh'], ['s1', 'fun'], ['s1', 'flexible'], ['s1', 'strength'], ['s2', 'everything'], ['s2', 'intrigued'], ['s2', 'tough'], ['s2', 'show']],
   blowouts=[['hook', 'oh']], blackFlash=[['s2']], streaks=[['s2']],
   extras=[sfx(['hook', 'oh'], 's_wow.mp3', 0.45), ov(['hook', 'oh'], 'greenflash2.mp4'), png(['s1', 'fun'], 'e_heart.png', 260),
           sfx(['s2', 'tough'], 's_awk.mp3', 0.45), png(['s2', 'tough'], 'e_skull.png')]),
 'r3hTurn': dict(top='Everyone else struggled… then it was HIS turn', hl={'HIS': '#FF2A2A'}, ctaAt=['s2', 'yes'], music=['m_luna_n', 0],
   tints=[[['hook', 'turn'], 'R'], [['s1', 'nice'], 'G'], [['s2', 'yes'], 'G']], rizz=[['s1', 'nice']],
   punch=[['hook', 'turn'], ['hook', 'oh'], ['s1', 'baby'], ['s1', 'struggling'], ['s2', 'what'], ['s2', 'yes']],
   blowouts=[['hook', 'oh']], blackFlash=[['s1']], streaks=[['s2']],
   extras=[png(['hook', 'oh'], 'e_sob.png', 260), sfx(['hook', 'oh'], 's_fahhh.mp3', 0.45), sfx(['s1', 'struggling'], 's_huh.mp3', 0.45),
           ov(['s2', 'yes'], 'greenflash2.mp4'), sfx(['s2', 'yes'], 's_correct.mp3', 0.4)]),
 'r3hSilks': dict(top='She made it look EASY… now it\'s N3on\'s turn', hl={'EASY…': '#58EE28'}, ctaAt=['s2', 'backpack'], music=['m_flyday_n', 14],
   tints=[[['hook', 'straddle'], 'G'], [['s1', 'really'], 'R'], [['s2', 'tuck'], 'G']], rizz=[['hook', 'inversion']],
   punch=[['hook', 'legs'], ['hook', 'straddle'], ['hook', 'inversion'], ['s1', 'really'], ['s2', 'knot'], ['s2', 'backpack'], ['s2', 'tuck']],
   blowouts=[['hook', 'inversion']], blackFlash=[['s2']], streaks=[['s2']],
   extras=[sfx(['hook', 'inversion'], 's_wow.mp3', 0.45), png(['s1', 'really'], 'e_skull.png', 260), sfx(['s1', 'really'], 's_huh.mp3', 0.45),
           png(['s2', 'backpack'], 'e_think.png')]),
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
json.dump(out, open('src/h.cfg.json', 'w'), indent=1)
print('ok', list(out))
