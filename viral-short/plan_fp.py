# Clipfarm x First Press (Press On Ventures), Willie Litvack episode (Nov 16). Business-show rules: one clear idea, clean and professional,
# no memes / loud SFX / clickbait / swearing -> VverPaldo template with fxOff (no SFX), noSkull, no tints/blow-outs/emojis/call-outs.
# Source = 3-panel call recording 1920x1080 (Josh | Madeline | Willie 1310-1920 x 0-840, title bar below); the box is zoomed onto Willie's panel.
# Pre-graded (67) windows public/g67_fp<k>.mp4 (videoStartSec relative to the window start; ppp = two windows back to back).
# Usage: python3 plan_fp.py <dir with transcript jsons (rich, saas, ppp1, ppp2)>
import json, sys
TX = sys.argv[1]
def words(name, off): return [(w[0] + off, w[1] + off, w[2]) for s in json.load(open(f'{TX}/{name}.json')) for w in s['w']]
W = words('rich', 2283) + words('saas', 1572) + words('ppp1', 1650) + words('ppp2', 1744)
FIX = {'freaking': '', 'networking': 'network', 'mode': 'moat', 'like': '', 'Like': '', 'like,': '', 'Like,': ''}
WIDE, TIGHT = (1615, 1.78, 430), (1600, 1.93, 420)
# (scene, a, b, window offset, [(src sec, framing)])
EDITS = {
 'fprich': [('hook', 2290.95, 2295.4, 2283, [(2290.95, TIGHT)]),
            ('c1', 2295.7, 2308.15, 2283, [(2295.7, WIDE), (2301.3, TIGHT), (2302.9, WIDE)]),
            ('c2', 2308.6, 2318.9, 2283, [(2308.6, TIGHT), (2315.4, WIDE)])],
 'fpsaas': [('hook', 1587.0, 1588.85, 1572, [(1587.0, TIGHT)]),
            ('c1', 1576.75, 1594.3, 1572, [(1576.75, WIDE), (1580.9, TIGHT), (1587.0, WIDE), (1589.3, TIGHT)]),
            ('c2', 1598.9, 1610.3, 1572, [(1598.9, WIDE), (1602.0, TIGHT), (1605.0, WIDE)])],
 'fpppp': [('hook', 1657.1, 1661.4, 1654.5, [(1657.1, TIGHT)]),
           ('c1', 1655.1, 1667.95, 1654.5, [(1655.1, WIDE), (1657.1, TIGHT), (1661.8, WIDE)]),
           ('c2', 1747.7, 1753.15, 1747.3 - 14.0, [(1747.7, TIGHT)])],   # 2nd window starts at 14.0 s in g67_fpppp.mp4
}
gen = json.load(open('src/edits.gen.json'))
for eid, plan in EDITS.items():
    scenes = []
    for sid, a, b, off, fr in plan:
        n = round((b - a) * 30); wl = []
        for ws, we, t in W:
            if not (a - 0.05 <= ws < b - 0.05): continue
            t = t.strip(); t = FIX.get(t, t).strip(',.') if t not in FIX else FIX[t]
            if not t: continue
            f0 = max(0, round((ws - a) * 30)); f1 = min(n, max(f0 + 4, round((we - a) * 30) + 3))
            wl.append({'word': t, 'startFrame': f0, 'endFrame': f1})
        for i in range(len(wl) - 1): wl[i]['endFrame'] = min(wl[i]['endFrame'], wl[i + 1]['startFrame'])
        crops = [[max(0, round((s - a) * 30)), *f] for s, f in fr]
        scenes.append({'id': sid, 'videoStartSec': round(a - off, 3), 'durationInFrames': n, 'cropX': crops[0][1], 'crops': crops, 'words': wl})
    gen[eid] = scenes
    print(eid, round(sum(s['durationInFrames'] for s in scenes) / 30, 1), 's |', ' / '.join(s['id'] + ': ' + ' '.join(w['word'] for w in s['words']) for s in scenes))
json.dump(gen, open('src/edits.gen.json', 'w'))
GREEN = '#58EE28'
CTA = '*Full episode on First Press by Press On Ventures YT*'
CFG = {
 'fprich': dict(top='Own 100% of a cash-producing business', hl={'100%': GREEN}, music=['suspense_n', 0], ctaAt=['c2', 'than'],
   punch=[['hook', 'richest'], ['c1', 'million'], ['c1', 'EBITDA'], ['c1', 'rich'], ['c1', 'control'], ['c2', 'superior'], ['c2', 'billion'], ['c2', 'most']],
   streaks=[['c1'], ['c2']]),
 'fpsaas': dict(top='Why software moats are shrinking', hl={'shrinking': GREEN}, music=['sentamento_n', 55], ctaAt=['c2', "it's", 2],
   punch=[['hook', '10'], ['c1', 'SaaS'], ['c1', 'bad'], ['c1', 'ARR'], ['c1', '10'], ['c1', 'shrank'], ['c2', 'more'], ['c2', 'network'], ['c2', 'proprietary'], ['c2', 'hardware']],
   streaks=[['c1'], ['c2']]),
 'fpppp': dict(top='People, product, profits. In that order.', hl={'People,': GREEN}, music=['brevis_n', 4], ctaAt=['c2', 'and'],
   punch=[['hook', 'people'], ['hook', 'order'], ['c1', 'moat'], ['c1', 'people'], ['c1', 'product'], ['c1', 'profits'], ['c1', 'amazing'], ['c1', 'successful'], ['c2', 'profits'], ['c2', 'themselves']],
   streaks=[['c1'], ['c2']]),
}
for eid, c in CFG.items():
    c.update(cta=CTA, track='none', calls=[], tints=[], rizz=[], blowouts=[], blackFlash=[], extras=[], src=f'g67_{eid}.mp4', intro=True, hardcut=True,
             noSkull=True, fxOff=True)
    sc = {s['id']: s for s in gen[eid]}
    for r in [c['ctaAt']] + c['punch'] + c['streaks']:
        if len(r) == 1: assert r[0] in sc, (eid, r); continue
        ws = [w for w in sc[r[0]]['words'] if w['word'].lower().startswith(r[1].lower())]
        assert len(ws) > (r[2] if len(r) > 2 else 0), (eid, r, [w['word'] for w in sc[r[0]]['words']])
json.dump(CFG, open('src/fp.cfg.json', 'w'), indent=1); print('cfg ok')
