"""Kitsch x Saint Nic — batch 4: the Christmas storytime look (KitschStory3) rebuilt for the swipe test.
User feedback (2026-11-20): keep the unique Christmas-card style, but HOOK first, 15–22 s, zooms, pop-up bubbles, meme sfx ("fahh"), 4K.
Each clip opens on its payoff line with the strongest picture (J-cut where the line starts before the shot), then the narrated story.
Usage: python3 kitsch/build_v4.py -> src/kitsch/v4/<name>.json (rendered by src/kitsch/KitschStory3.tsx)"""
import sys
sys.path.insert(0, 'kitsch')
from build_v3 import build

RED = dict(bg='radial-gradient(120% 80% at 50% 30%, #c8102e 0%, #7a0a1d 55%, #3a0510 100%)', stripe='#ffffff', accent='#FFD84A', capStroke='#2a0008',
           particles='snow', tilt=1.6, cardTop=1000)
GREEN = dict(bg='radial-gradient(120% 80% at 50% 30%, #1f7a4a 0%, #0f4a2c 55%, #06261a 100%)', stripe='#f3d27a', accent='#F7C948', capStroke='#04170e',
             particles='snow', tilt=-1.4, cardTop=1000)
NIGHT = dict(bg='radial-gradient(120% 80% at 50% 25%, #23306b 0%, #121a45 55%, #070b22 100%)', stripe='#d9b44a', accent='#FFD84A', capStroke='#05081c',
             particles='sparkle', tilt=1.2, cardTop=1000)
O = 'src/kitsch/v4'

# segment tuple: (kind, src, v, n, crop, a, wide)   a = audio start for a J-cut, wide = [y0, y1] landscape crop in a wide card
# snap=True: real lines run to the end of the speech (VAD) and narration lines to the end of their last word — never cut early.
HERO = [10, 680]   # BTS promo still: Nic arms wide in front of the Kitsch-packed Jeep (below y≈780 is the promo overlay)

build('xmom', 'narrD', [
    ('S', 'nic', [46.72, 48.4], None, None, 46.3),     # HOOK: mom's face — "You did all this?"
    ('N', 'v2', [0.3, 2.4], [0.0, 2.1], None, None, HERO),  # "Nic from Love Island suited up as Santa," (BTS hero still)
    ('N', 'nic', [16.9, 19.0], [2.15, 4.25]),          # "and his mom had no idea." (walking up with the sack)
    ('S', 'nic', [22.0, 23.9]),                         # I'm Saint Nic. Get it?
    ('S', 'nic', [39.35, 40.95]),                       # Mother, come outside!
    ('S', 'nic', [41.45, 42.9]),                        # Nicholas, what's going on?
    ('N', 'v2', [5.0, 6.6], [4.4, 6.0]),               # "He didn't bring her one gift." (BTS: box avalanche)
    ('N', 'v2', [6.6, 8.2], [6.1, 7.7]),               # "He brought the whole Jeep." (BTS: Jeep packed with Kitsch)
    ('S', 'v1', [65.85, 68.5]),                         # More deliveries coming. Stay nice.
], "His mom had NO idea Nic was coming as Santa 😭", ['NO'], RED, ('none', '', []),
    labels=[('Kitsch gifts', ('s', 5, 41.6)), ('The whole Kitsch Jeep', ('n', 7, 6.6))],
    stamps=[('SON OF THE YEAR', '#d4a017', ('s', 0, 47.45), -6)],
    zooms=[('s', 0, 47.1), ('s', 4, 39.45), ('s', 5, 41.5), ('n', 7, 6.86)],
    bubbles=[('Saint Nic mode 🎅', ('n', 1, 0.5)), ('she had NO idea 👀', ('n', 2, 2.86)), ('the WHOLE Jeep 📦📦', ('n', 7, 6.9))],
    sfx=[('sfx_fahh', ('s', 0, 47.7), 0.55), ('sfx_sparkle', ('n', 1, 0.15), 0.3), ('sfx_sparkle', ('s', 5, 41.6), 0.35), ('sfx_boom', ('n', 7, 7.0), 0.45)],
    pops=[('s', 5, 41.6)], out_dir=O, snap=True)

build('xtax', 'narrD', [
    ('S', 'nic', [51.95, 53.3]),                        # HOOK: "Saint Nic tax."
    ('N', 'v2', [3.0, 4.95], [7.85, 9.8]),             # "Nic played Santa for his sister," (BTS: Nic in the Jeep door)
    ('N', 'nic', [34.0, 36.05], [9.95, 12.0]),         # "Kitsch holiday sets and everything."
    ('S', 'nic', [20.85, 23.9]),                        # What are you wearing? / I'm Saint Nic. Get it?
    ('S', 'nic', [36.95, 38.55]),                       # Okay, fine. This is cute.
    ('N', 'nic', [48.6, 50.8], [12.15, 14.35]),        # "But then he spotted the Curl Cream."
    ('S', 'nic', [50.8, 51.95]),                        # (tucks it in his belt)
    ('S', 'nic', [59.0, 61.1]),                         # sly smile
], "He gave his sister Kitsch… then charged a SAINT NIC TAX 😭", ['SAINT', 'NIC', 'TAX'], GREEN, ('none', '', []),
    labels=[('Kitsch holiday sets', ('s', 4, 37.0)), ('Kitsch Curl Cream', ('n', 5, 13.6))],
    stamps=[('SAINT NIC TAX', '#c8102e', ('s', 0, 52.3), -7)],
    zooms=[('s', 0, 52.2), ('s', 3, 21.3), ('n', 5, 13.8), ('s', 6, 51.0)],
    bubbles=[('the Kitsch Jeep 📦', ('n', 1, 8.2)), ('the fit 😭', ('s', 3, 21.0)), ('Saint Nic 🎅', ('s', 3, 22.3)), ('wait… 👀', ('n', 5, 12.3)), ('he really kept it 😭', ('s', 7, 59.2))],
    sfx=[('sfx_fahh', ('s', 0, 52.9), 0.55), ('sfx_sparkle', ('s', 4, 37.0), 0.35), ('sfx_boom', ('s', 6, 51.0), 0.45)],
    pops=[('n', 5, 13.6)], out_dir=O, snap=True)

build('xmystery', 'narrD', [
    ('S', 'nic', [55.65, 58.95], None, None, 54.35),   # HOOK: red Kitsch bag — "Who's that one for?" … "No."
    ('N', 'v2', [4.5, 7.45], [14.55, 17.48]),          # "Nic handed out Kitsch to his sister and his mom." (BTS: packed Jeep, box avalanche)
    ('S', 'nic', [36.95, 38.55]),                       # Okay, fine. This is cute.
    ('S', 'nic', [46.72, 48.4], None, None, 46.3),     # You did all this?
    ('N', 'nic', [59.0, 61.35], [17.5, 19.85]),        # "But there's one gift he won't explain."
    ('S', 'v1', [60.75, 65.8]),                         # Who's Saint Nic? You're Saint Nic. Mmm, you look good, Santa.
], "He refuses to say who the last Kitsch gift is for 👀", ['KITSCH'], NIGHT,
    ('list', "SAINT NIC'S LIST", [('SIS', ('s', 2, 38.2), 'ok'), ('MOM', ('s', 3, 47.4), 'ok'), ('???', ('n', 4, 18.3), 'q')]),
    labels=[('Kitsch gift bag', ('s', 0, 54.6)), ('A Jeep full of Kitsch', ('n', 1, 15.6))],
    stamps=[('NO COMMENT 🤐', '#6b2bd6', ('s', 0, 57.2), 6)],
    zooms=[('s', 0, 57.2), ('s', 3, 47.1), ('n', 4, 18.48), ('s', 5, 64.2)],
    bubbles=[('the whole Jeep 📦', ('n', 1, 15.0)), ('he knows 😏', ('n', 4, 18.5)), ('the confidence 😭', ('s', 5, 62.9))],
    sfx=[('sfx_boom', ('s', 0, 57.2), 0.5), ('sfx_sparkle', ('s', 2, 37.1), 0.35), ('sfx_fahh', ('s', 5, 64.6), 0.5)],
    dings=[('s', 2, 38.2), ('s', 3, 47.4)], out_dir=O, snap=True)
