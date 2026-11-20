"""Kitsch x Saint Nic — storytime batch 3 (config builder for src/kitsch/KitschStory3.tsx).
Three edits with different angle / hook / narration / on-screen text / theme, so each is a NEW edit under the brief:
  delivery  — "Kitsch delivery route" (green+gold, route widget SIS -> MOM -> ???), uses the BTS Jeep footage
  women     — "the women in his life" (blush pink, nice-list widget), uses Nic's new intro + mirror ending
  ranking   — "ranking every gift" (midnight + gold, countdown widget #4 -> #1)
Sources (public/kitsch/): nic.mp4 = original spot (clean), v1.mp4 = new V7 cut (burned subs in the intro -> crop), v2.mp4 = BTS promo (only 3.3–8.3 s is clean).
N = narration over b-roll (source ducked), S = the real moment at full volume.
Usage: python3 kitsch/build_v3.py  -> src/kitsch/v3/<name>.json"""
import json, os

NIC = json.load(open('src/kitsch/src_words.json'))
V1 = json.load(open('src/kitsch/v1_words.json'))
SRCW = {'nic': NIC, 'v1': V1, 'v2': []}
FIX = {'nick': 'Nic', 'nick,': 'Nic,', 'nick.': 'Nic.', 'nick?': 'Nic?', 'st.': 'Saint', 'kish': 'Kitsch', 'kitsch': 'Kitsch', 'kitsch,': 'Kitsch,',
       'kitsch.': 'Kitsch.', 'jeep': 'Jeep', '4,': 'four,', '3,': 'three,', '2,': 'two,', '1,': 'one,'}
fix = lambda t: FIX.get(t.lower(), t)


def build(name, narr, segs, title, hl, theme, widget, labels=(), stamps=(), dings=(), pops=()):
    NW = json.load(open(f'.work/kitsch/v3/{narr}.words.json'))
    out, caps, o = [], [], 0.0
    for g in segs:
        kind, src, v = g[0], g[1], g[2]
        d = dict(kind=kind, src=src, v=v, start=round(o, 3))
        if kind == 'N':
            n = g[3]; d['n'] = n
            caps += [dict(t=fix(w[2]), a=round(o + w[0] - n[0], 3), real=False) for w in NW if n[0] - 0.05 <= w[0] < n[1] - 0.05]
        else:
            caps += [dict(t=fix(w[2]), a=round(o + max(0, w[0] - v[0]), 3), real=True) for w in SRCW[src] if v[0] - 0.05 <= w[0] < v[1] - 0.05]
        if len(g) > 4 and g[4]: d['crop'] = g[4]
        out.append(d); o += v[1] - v[0]
    S = [x['start'] for x in out]
    # beat helpers: ('s', seg, src_t) = source time inside seg; ('n', seg, narr_t) = narration time inside an N seg
    def T(b):
        if isinstance(b, (int, float)): return b
        k, i, t = b
        return round(S[i] + t - (segs[i][3][0] if k == 'n' else segs[i][2][0]), 3)
    cfg = dict(name=name, dur=round(o, 3), narr=f'kitsch/{narr}.wav', title=title, hl=hl, theme=theme, segs=out, caps=caps,
               widget=dict(type=widget[0], head=widget[1], items=[dict(label=l, at=T(b), mark=m) for l, b, m in widget[2]]),
               labels=[dict(text=t, at=T(b)) for t, b in labels], stamps=[dict(text=t, color=c, at=T(b), rot=r) for t, c, b, r in stamps],
               dings=[T(b) for b in dings], pops=[T(b) for b in pops])
    os.makedirs('src/kitsch/v3', exist_ok=True)
    json.dump(cfg, open(f'src/kitsch/v3/{name}.json', 'w'), indent=1)
    print(name, round(o, 2), 's', len(out), 'segs')


CROP_SUBS = [0, 1240]   # v1 intro has burned-in subtitles at y≈1260–1380

# ---------------------------------------------------------------- A: delivery route
build('delivery', 'narrA', [
    ('N', 'v2', [3.3, 8.3], [0.0, 5.0]),            # Jeep packed, box avalanche — "packed his Jeep so full of Kitsch…"
    ('S', 'nic', [19.0, 22.75]),                      # Ho ho ho / what are you wearing / I'm Saint Nic
    ('N', 'nic', [32.0, 34.3], [5.15, 7.45]),        # "First stop on the route, his sister."
    ('S', 'nic', [36.6, 38.55]),                      # Okay fine. This is cute.
    ('N', 'nic', [15.0, 18.95], [7.6, 11.55]),       # "Stop two, mom. And this is where it got extra."
    ('S', 'nic', [39.35, 42.95]),                     # Mother, come outside / Nicholas, what's going on?
    ('N', 'nic', [43.6, 45.45], [11.6, 13.45]),      # "He didn't bring her one gift."
    ('S', 'nic', [46.2, 47.75]),                      # You did all this?
    ('N', 'nic', [0.5, 2.55], [13.45, 15.5]),        # "He brought her the whole Kitsch drop." (truck bed of boxes)
    ('N', 'nic', [55.3, 59.25], [15.55, 19.5]),      # "But there's one more stop… not saying who it's for."
    ('S', 'v1', [65.85, 68.5]),                       # More deliveries coming. Stay nice.
], "Nic from Love Island turned his Jeep into a KITSCH delivery truck", ['KITSCH'],
    dict(bg='radial-gradient(120% 80% at 50% 30%, #1f7a4a 0%, #0f4a2c 55%, #06261a 100%)', stripe='#f3d27a', accent='#F7C948', capStroke='#04170e',
         particles='snow', tilt=1.4, cardTop=1062, scale=0.955),
    ('route', 'DELIVERY ROUTE', [('SIS', ('s', 3, 38.2), 'ok'), ('MOM', ('s', 7, 47.4), 'ok'), ('???', ('n', 9, 16.3), 'q')]),
    labels=[('Kitsch holiday sets', ('s', 3, 36.7)), ('The whole Kitsch drop', ('n', 8, 13.6))],
    stamps=[('DELIVERED ✓', '#1f9d55', ('s', 3, 38.2), -7), ('DELIVERED ✓', '#1f9d55', ('s', 7, 46.85), 6)],
    dings=[('s', 3, 38.2), ('s', 7, 47.4)], pops=[('s', 3, 36.7), ('n', 8, 13.6), ('n', 9, 16.3)])

# ---------------------------------------------------------------- B: the women in his life
build('women', 'narrB', [
    ('S', 'v1', [3.0, 8.2], None, CROP_SUBS),         # I'm not gonna name names, but there are a few women in my life who mean everything to me
    ('N', 'v1', [0.1, 2.6], [0.0, 2.5]),              # "So he suited up as Saint Nic and made his rounds."
    ('S', 'nic', [19.0, 20.15]),                      # Ho, ho, ho!
    ('N', 'nic', [32.0, 36.35], [2.7, 7.05]),         # "First up, his sister. Kitsch holiday sets, wrapped and ready."
    ('S', 'nic', [36.6, 38.55]),                      # Okay, fine. This is cute.
    ('N', 'nic', [42.95, 46.3], [7.12, 10.47]),       # "Then mom, and she got a whole pile of Kitsch."
    ('S', 'nic', [46.3, 47.75]),                      # You did all this?
    ('N', 'nic', [57.6, 60.2], [10.5, 13.1]),         # "And the last gift? That one's staying a secret."
    ('S', 'v1', [60.75, 64.75]),                      # Who's Saint Nic? You're Saint Nic. Mmm, you look good, Santa. (mirror)
], "Nic said there are a few women in his life who mean EVERYTHING to him", ['EVERYTHING'],
    dict(bg='radial-gradient(120% 80% at 50% 25%, #f7b6c8 0%, #e27a9a 50%, #8f2d52 100%)', stripe='#ffffff', accent='#FFE45C', capStroke='#4a0f27',
         particles='hearts', tilt=0, cardTop=1010, scale=1),
    ('list', "SAINT NIC'S LIST", [('SIS', ('s', 4, 38.2), 'ok'), ('MOM', ('s', 6, 47.4), 'ok'), ('???', ('n', 7, 11.7), 'q')]),
    labels=[('Kitsch holiday sets', ('n', 3, 4.66)), ('A whole pile of Kitsch', ('n', 5, 9.1))],
    stamps=[('SHE LOVES IT', '#d6336c', ('s', 4, 38.2), -6), ('BEST SON EVER', '#d4a017', ('s', 6, 46.85), 6)],
    dings=[('s', 4, 38.2), ('s', 6, 47.4)], pops=[('n', 3, 4.66), ('n', 5, 9.1), ('n', 7, 11.7)])

# ---------------------------------------------------------------- C: ranking every gift
build('ranking', 'narrC', [
    ('N', 'nic', [0.0, 4.8], [0.0, 4.8]),             # "Nic from Love Island played Santa this year, so let's rank every gift he gave out."
    ('S', 'nic', [21.95, 23.9]),                      # I'm Saint Nic. Get it?
    ('N', 'nic', [32.0, 35.05], [4.9, 7.95]),         # "Number four, his sister's Kitsch holiday sets."
    ('S', 'nic', [36.6, 38.55]),                      # Okay, fine. This is cute.
    ('N', 'nic', [48.7, 51.95], [8.2, 11.45]),        # "Number three, the Kitsch Curl Cream he kept for himself."
    ('S', 'nic', [51.95, 53.25]),                     # Saint Nic tax.
    ('N', 'nic', [41.7, 46.32], [11.78, 16.4]),       # "Number two, mom's gift, which was basically the entire Kitsch haul."
    ('S', 'nic', [46.32, 47.75]),                     # You did all this?
    ('N', 'nic', [57.6, 61.15], [16.35, 19.9]),       # "And number one, the gift he won't tell anyone about."
    ('S', 'nic', [54.3, 57.7]),                       # Who's that one for? … No.
], "Ranking every gift Saint Nic gave out this year", ['SAINT', 'NIC'],
    dict(bg='radial-gradient(120% 80% at 50% 25%, #23306b 0%, #121a45 55%, #070b22 100%)', stripe='#d9b44a', accent='#FFD84A', capStroke='#05081c',
         particles='sparkle', tilt=-1.2, cardTop=1010, scale=1),
    ('rank', 'GIFT RANKING', [("#4 SISTER'S SETS", ('n', 2, 4.98), '4'), ('#3 THE CURL CREAM', ('n', 4, 8.28), '3'), ("#2 MOM'S HAUL", ('n', 6, 11.82), '2'),
                              ('#1 ???', ('n', 8, 16.92), '1')]),
    labels=[('Kitsch holiday sets', ('s', 3, 36.7)), ('Kitsch Curl Cream', ('n', 4, 9.66))],
    stamps=[('SAINT NIC TAX', '#c8102e', ('s', 5, 52.14), -7), ('NO COMMENT', '#6b2bd6', ('s', 9, 57.2), 6)],
    dings=[('n', 2, 4.98), ('n', 4, 8.28), ('n', 6, 11.82), ('n', 8, 16.92)], pops=[('s', 3, 36.7), ('n', 4, 9.66)])
