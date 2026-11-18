"""VverPaldo batch Y (Nov 18): NBA GOAT, Redemption + 3 more Trevor stream clips.
Default VverPaldo structure: payoff/hook first, hard cut (2-frame white flash + camera-flash SFX) into the story,
hook line never replayed later, story ends right before the hook line so it loops.
New text hooks, a new BGSONGS song per video (m_*_n.mp3, loudness-matched), extras from the editing-resources Drive only.
Scenes are sliced from the existing scenes in edits.gen.json (plan7 word timings + manual crops)."""
import json
G = json.load(open('src/edits.gen.json'))
TV = json.load(open('src/tv.cfg.json'))


def words_abs(base, a, b):
    """words from the one base scene that covers [a, b] best (non-hook scenes first: no duplicates)."""
    cands = [s for s in G[base] if s['id'] != 'rw']
    def cover(s):
        s0, s1 = s['videoStartSec'], s['videoStartSec'] + s['durationInFrames'] / 30
        return (max(0, min(b, s1) - max(a, s0)), s['id'] != 'hook')
    s = max(cands, key=cover)
    return [(s['videoStartSec'] + w['startFrame'] / 30, s['videoStartSec'] + w['endFrame'] / 30, w['word']) for w in s['words']]


def crops_abs(base):
    out = []
    for s in G[base]:
        if s['id'] == 'rw':
            continue
        for c in s['crops']:
            out.append((s['videoStartSec'] + c[0] / 30, c[1:]))
    return sorted(out, key=lambda c: c[0])


def cut(base, sid, a, b):
    n = round((b - a) * 30)
    ws = []
    for (s, e, t) in words_abs(base, a, b):
        if a - 0.03 <= s < b - 0.05:
            ws.append((s, e, t))
    words = []
    for (s, e, t) in ws:
        f0 = max(0, round((s - a) * 30)); f1 = min(n, max(f0 + 4, round((e - a) * 30)))
        words.append({'word': t, 'startFrame': f0, 'endFrame': f1})
    for i in range(len(words) - 1):
        words[i]['endFrame'] = max(words[i]['startFrame'] + 1, min(words[i]['endFrame'], words[i + 1]['startFrame']))
    cr = crops_abs(base)
    before = [c for c in cr if c[0] <= a + 0.01]
    inside = [c for c in cr if a + 0.01 < c[0] < b]
    crops = ([[0] + before[-1][1]] if before else [[0, 960]]) + [[round((t - a) * 30)] + v for t, v in inside]
    return {'id': sid, 'videoStartSec': a, 'durationInFrames': n, 'cropX': 960, 'crops': crops, 'words': words}


def png(at, f, x=870, y=1290, size=200): return dict(at=at, kind='png', file=f, x=x, y=y, size=size)
def ov(at, f, dur=34): return dict(at=at, kind='ov', file=f, dur=dur)
def sfx(at, f, v=0.5): return dict(at=at, kind='sfx', file=f, v=v)


BASE = dict(cta='', track='none', calls=[], intro=True, hardcut=True, cutSfx='s_camflash.mp3')
NEW = {
  'tvgoatY': ('tvgoat', 'goat_input', [('hook', 14.95, 18.81), ('s1', 0.0, 9.6), ('s2', 12.4, 14.95)], dict(
      top='He had ONE job: name the NBA GOAT', hl={'ONE': '#FF2A2A'}, cta='*who is YOUR NBA GOAT?*', ctaAt=['s1', 'greatest'], music=['m_luna_n', 0],
      tints=[[['hook', 'tension'], 'R'], [['s1', 'goat?'], 'G'], [['s2', 'dellavedova'], 'G']], rizz=[['s2', 'matthew']],
      punch=[['hook', 'oh'], ['hook', 'tension'], ['s1', 'nba'], ['s1', 'goat?'], ['s1', 'goat?', 1], ['s1', 'greatest'], ['s2', 'gotta'], ['s2', 'dellavedova']],
      blowouts=[['s2', 'dellavedova']], blackFlash=[['s1']], streaks=[['s2']],
      extras=[sfx(['s1', 'goat?', 1], 's_huh.mp3', 0.5), png(['s1', 'player'], 'e_think.png', 260), ov(['s2', 'dellavedova'], 'greenflash2.mp4'),
              sfx(['s2', 'dellavedova'], 's_wow.mp3', 0.45), png(['s2', 'dellavedova'], 'e_skull.png'), png(['hook', 'tension'], 'e_laugh.png', 260)])),
  'tvredeemY': ('tvredeem4', 'u3_redemptions', None, dict(
      top='A $20,000 card turned into $500… here\'s why', hl={'$20,000': '#58EE28', '$500…': '#FF2A2A'}, cta='*would you still buy one?*', ctaAt=['s3', 'oh'], music=['m_brega_n', 11],
      extras=[ov(['s1', '$20,000'], 'cashfall.mp4', 52), sfx(['s1', '$20,000'], 's_money.mp3', 0.4), png(['s1', '$500'], 'e_sob.png'), sfx(['s1', '$500'], 's_fahhh.mp3', 0.45),
              sfx(['s2', 'sign'], 's_huh.mp3', 0.5), png(['s3', 'really'], 'e_skull.png', 260), sfx(['s3', 'really'], 's_awk.mp3', 0.45)])),
  'tvfansY': ('tvfans', 't3_traveling_trevors', [('hook', 81.60, 83.45), ('s1', 72.75, 81.58), ('s2', 91.65, 98.55)], dict(
      top='When the NFL star finds your fan account', hl={'fan': '#FF2A2A'}, cta='*would you follow them?*', ctaAt=['s2', 'then'], music=['m_xcool_n', 21],
      tints=[[['hook', 'these'], 'R'], [['s1', 'weird'], 'R'], [['s2', 'funny'], 'G']], rizz=[['s2', 'funny']],
      punch=[['hook', 'these'], ['s1', 'weird'], ['s1', 'giggling'], ['s1', 'first'], ['s2', 'second'], ['s2', 'playing'], ['s2', 'funny']],
      blowouts=[['s1', 'weird']], blackFlash=[['s1']], streaks=[['s2']],
      extras=[png(['hook', 'wack'], 'e_skull.png', 260), sfx(['s1', 'giggling'], 's_huh.mp3', 0.45), png(['s1', 'think'], 'e_think.png'),
              ov(['s2', 'funny'], 'greenflash2.mp4'), sfx(['s2', 'funny'], 's_correct.mp3', 0.45), png(['s2', 'funny'], 'e_laugh.png', 260)])),
  'tvticketY': ('tvticket', 't4_natty_ticket', [('hook', 13.90, 17.35), ('s1', 9.75, 13.88), ('s2', 20.75, 31.75)], dict(
      top='The most awkward gift you can give an NFL QB', hl={'awkward': '#FF2A2A'}, cta='*would you keep it or sell it?*', ctaAt=['s2', 'mvp'], music=['m_sybau_n', 48.5],
      tints=[[['hook', 'weird'], 'R'], [['s2', 'signed'], 'G'], [['s2', 'championship'], 'G'], [['s2', 'sweet'], 'G']], rizz=[['s2', 'signed']],
      punch=[['hook', 'weird'], ['hook', 'gifting'], ['s1', 'gift'], ['s2', 'signed'], ['s2', 'national'], ['s2', 'mvp'], ['s2', 'signature'], ['s2', 'sweet']],
      blowouts=[['s2', 'signed']], blackFlash=[['s1']], streaks=[['s2']],
      extras=[png(['hook', 'gifting'], 'e_skull.png', 260), sfx(['s1', 'gift'], 's_ding.mp3', 0.4), ov(['s2', 'signed'], 'greenflash2.mp4'),
              sfx(['s2', 'clemson'], 's_wow.mp3', 0.45), png(['s2', 'sweet'], 'e_heart.png', 260)])),
  'tvcellyY': ('tvcelly', 'u2_psa10_celly', [('hook', 26.30, 28.88), ('s1', 14.95, 26.30), ('s2', 28.88, 32.40)], dict(
      top='Every card collector needs this TD celly', hl={'TD': '#58EE28'}, cta='*would you hit this in the end zone?*', ctaAt=['s1', 'collectors'], music=['m_flyday_n', 14],
      tints=[[['hook', 'point'], 'G'], [['s1', 'stadium'], 'G'], [['s1', 'best'], 'G'], [['s2', 'like'], 'G']], rizz=[['s1', 'best']],
      punch=[['hook', 'point'], ['hook', 'easy'], ['s1', 'dance'], ['s1', 'stadium'], ['s1', 'psa'], ['s1', 'best'], ['s2', 'like']],
      blowouts=[['s1', 'psa']], blackFlash=[['s1']], streaks=[['s2']],
      extras=[sfx(['s1', 'dance'], 's_awk.mp3', 0.45), png(['s1', 'dance'], 'e_laugh.png', 260), ov(['s1', 'best'], 'greenflash2.mp4'),
              sfx(['s1', 'best'], 's_correct.mp3', 0.45), png(['s2', 'like'], 'e_heart.png')])),
}

out = {}
for nid, (base, src, plan, d) in NEW.items():
    if plan is None:
        G[nid] = [s for s in G[base] if s['id'] != 'rw']
    else:
        G[nid] = [cut(base, sid, a, b) for sid, a, b in plan]
    c = {**TV[base], **BASE, **d, 'src': f'{src}_g.mp4'}
    sc = {s['id']: s for s in G[nid]}
    refs = [e['at'] for e in c['extras']] + [t[0] for t in c['tints']] + c['rizz'] + c['punch'] + c['blowouts'] + c['blackFlash'] + c['streaks'] + [c['ctaAt']]
    for r in refs:
        s, w, n = (r + [None, 0])[:3] if len(r) == 1 else (r + [0])[:3]
        assert s in sc, (nid, r)
        if w is None:
            continue
        hits = [x for x in sc[s]['words'] if x['word'].lower().startswith(w.lower())]
        assert len(hits) > n, (nid, r, [x['word'] for x in sc[s]['words']])
    out[nid] = c
    print(nid, round(sum(s['durationInFrames'] for s in G[nid]) / 30, 1), 's |', ' / '.join(s['id'] + ': ' + ' '.join(w['word'] for w in s['words']) for s in G[nid]))
json.dump(G, open('src/edits.gen.json', 'w'))
json.dump(out, open('src/y.cfg.json', 'w'), indent=1)
print('ok', list(out))
