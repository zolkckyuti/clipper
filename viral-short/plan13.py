# R3born Ep2 "top 10" (Nov 17): the 10 strongest moments, rebuilt for retention + comments.
# - hook = wildest second (straight cut, no intro blur, so frame 1 is already the action); story; ending loops into the hook
# - cooler grade (67 + 9000 K, less saturation) - the old look was too orange
# - centre emoji pops (see-through, small->big, echo rings) + an echo-pop SFX on every pop; every overlay carries its own SFX
# - resource overlays: green flashes, cash fall, "a few moments later" insert, emojis, skull
# - comment prompt pill (ask) at the end + progress bar
# Excerpts public/g67_t<k>.mp4 = the edit's source windows concatenated; scenes carry their own window offset.
# Usage: python3 plan13.py <tx.json> <r3ep2.mp4> [--no-excerpts] [--only=a,b]
import ast, glob, json, subprocess, sys
W = [w for s in json.load(open(sys.argv[1])) for w in s['w']]
SRC = sys.argv[2]
ONLY = [x for a in sys.argv if a.startswith('--only=') for x in a[7:].split(',')]
TR = [(k, [tuple(c) for c in v['crops']]) for f in sorted(glob.glob('src/tracks/r3*/auto_edits.json')) for k, v in json.load(open(f)).items() if v['crops']]
FIX = {'neon': 'N3on', 'fuck': 'f***', 'fucking': 'f***ing', 'shitting': 'sh*tting', 'shit': 'sh*t', 'dumbass': 'dumba**'}
src8 = open('plan8.py').read(); ATW = ast.literal_eval(src8[src8.index('ATW = ') + 6: src8.index('\ndef crops')])
ATW.update({(419.3, 'to'): 'at', (419.5, 'ask'): 'a**', (418.1, 'the'): 'at the', (252.3, 'cuz'): "'cause", (259.7, 'one'): 'in one',
            (175.6, 'in'): '', (175.8, 'this'): '', (176.2, 'fucking'): '', (176.7, 'hard'): '',   # burned into the source already
            (450.4, 'i'): 'I', (222.5, 'you'): "You're", (449.9, 'why'): '', (714.0, 'set'): 'at', (720.2, 'in'): 'on', (537.3, 'seriously'): '', (484.1, 'i'): '', (616.3, 'should'): 'Am', (716.9, 'spider'): 'Spider-Man', (717.1, '-man'): '', (717.6, 'doop'): 'doop-de-doop', (718.3, '-de'): '', (718.4, '-doop'): '', (612.1, 'it'): '', (612.3, 'down'): '', (612.4, 'a'): '', (612.6, 'little'): '', (612.7, 'more'): '', (616.7, "i'm"): 'I', (222.9, 'look'): '', (450.5, 'should'): 'asked', (450.6, 'use'): '', (687.4, 'cuz'): "'cause", (698.8, 'burn'): 'burned',
            (448.2, 'you'): 'You', (722.9, 'bring'): 'Bring'})
G67 = ("split[ga][gb];[gb]gblur=sigma=14[gg];[ga][gg]blend=all_mode=softlight:all_opacity=0.245,unsharp=5:5:1.74:5:5:0,"
       "eq=contrast=1.113:saturation=1.26:gamma=0.98,curves=all='0/0 0.25/0.21 0.75/0.81 1/1',unsharp=3:3:0.79,"
       "colortemperature=temperature=10000,eq=saturation=0.92,format=yuv420p")
def crops(a, b):
    best = max(TR, key=lambda t: min(b, t[1][-1][0] + 2) - max(a, t[1][0][0]))
    k, cr = best
    if min(b, cr[-1][0] + 2) - max(a, cr[0][0]) <= 0: return [(a, 960)]
    c = [x for x in cr if a - 0.01 <= x[0] < b]; prev = [x for x in cr if x[0] <= a]
    first = prev[-1][1] if prev else (c[0][1] if c else 960)
    return [(a, first)] + [x for x in c if x[0] > a + 0.01]
G, R = 'G', 'R'
def pop(at, f, react=None, rv=0.45, off=0, after=False): return dict(at=at, kind='png', file=f, off=off, after=after, **({'sfx': react, 'sv': rv} if react else {}))
def ov(at, f, sfx, dur=34, sv=0.45, op=1): return dict(at=at, kind='ov', file=f, dur=dur, sfx=sfx, sv=sv, op=op)
def sfx(at, f, v=0.5): return dict(at=at, kind='sfx', file=f, v=v)
INS = lambda sid, f, d: (sid, 'insert', f, d)
def txt(at, text, color='#58EE28', size=150, off=0, y=None, dur=30, after=False): return dict(at=at, kind='txt', file=text, color=color, size=size, off=off, dur=dur, after=after, **({'y': y} if y else {}))
Y = '#FFE14A'; W_ = '#FFFFFF'; RD = '#FF2A2A'
UI = (1.18, 560)
E = {
 'tmoney': dict(scenes=[('hook', 258.20, 260.35), ('c1', 261.68, 262.95), ('c3', 252.95, 257.10)], spk={'hook': [(258.2, 'HIM')], 'c1': [(261.6, 'HER')], 'c3': [(252.9, 'HIM'), (254.85, 'HER')]},
   top='She made HOW much in ONE night?!', hl={'HOW': R, 'ONE': R}, sub='She teaches pole dancing for a living', music=['aura_n', 0],
   ask=[[['hook'], 'Guess how much'], [['c1', 'three'], 'Would you strip for $3K?']],
   tints=[[['c1', 'three'], G], [['c3', 'stripper', 1], R]], rizz=[['c1', 'three']],
   punch=[['hook', 'most'], ['hook', 'money'], ['hook', 'night'], ['c1', 'three'], ['c1', 'grand'], ['c3', 'stripper'], ['c3', 'stripper', 1]],
   blowouts=[], blackFlash=[], streaks=[['c3']],
   extras=[ov(['c1', 'three'], 'cashfall.mp4', 's_ding.mp3', 22), txt(['c1', 'three'], '$3,000', off=2, dur=12), txt(['c3'], 'HAS SHE EVER STRIPPED?', color=W_, size=80, y=560, dur=40), 
           txt(['c3', 'have'], 'SHE ADMITTED IT', color=Y, size=100, y=560, dur=50), sfx(['c3', 'have'], 's_ayo.mp3'), pop(['c3', 'stripper', 1], 'skull.png', 's_fahhh.mp3', after=True)]),
 'treveal': dict(scenes=[('c1', 726.40, 730.95), ('c2', 733.30, 736.00), ('c3', 741.00, 741.85), ('c4', 759.85, 761.10)],
   top='Loser gets WAXED… who lost?', hl={'WAXED': R}, sub='Bet: most calories burned wins', music=['suspense_n', 0],
   ask=[[['c1'], 'Who lost? Guess'], [['c4'], 'Rate his pain 1-10']],
   tints=[[['c1', '326'], G]], rizz=[['c1', '326']],
   punch=[['c1', 'grand'], ['c1', '326'], ['c3', 'calf']],
   blowouts=[], blackFlash=[], streaks=[['c3']],
   extras=[txt(['c1'], 'HIM vs HER: CALORIES', color=Y, size=80, y=560, dur=80), txt(['c1', '326'], '326', off=2), ov(['c2'], 'greenflash2.mp4', 's_wow.mp3', op=0.5) | {'off': 60},
           txt(['c2'], 'SHE WINS 389', color=RD, size=110, off=60, dur=20),  txt(['c3'], 'LOSER PICKS THE SPOT: CALF', color=Y, size=70, y=560, dur=26), sfx(['c3'], 's_awk.mp3'),
           txt(['c4'], 'RIIIP', color=RD, size=130, y=490, off=10, dur=30), sfx(['c4'], 's_rip.mp3', 0.6) | {'off': 10}, sfx(['c4'], 's_fahhh.mp3') | {'off': 18}]),
 'tsmoked': dict(scenes=[('c1', 506.30, 510.85), ('c2', 511.00, 513.85), ('c3', 515.90, 516.65)], spk={'c1': [(506.3, 'HIM')], 'c2': [(511.0, 'COACH')]},
   top="He's 100 calories BEHIND… can he come back?", hl={'BEHIND…': R}, sub='Bet: most calories burned wins. Loser gets waxed.', music=['funkabn_n', 4],
   ask=[[['c1'], 'Can he come back? Yes or no']],
   tints=[[['c1', '100'], R], [['c3', 'smoked'], R]], rizz=[],
   punch=[['c1', 'down'], ['c1', '100'], ['c1', 'hundred'], ['c1', 'more'], ['c2', 'flipping'], ['c2', 'splitting'], ['c2', 'slay'], ['c3', 'smoked']],
   blowouts=[], blackFlash=[], streaks=[['c2'], ['c3']],
   extras=[txt(['c1', '100'], 'DOWN 100', color=RD, size=140, off=2, dur=30), sfx(['c1', '100'], 's_fahhh.mp3', 0.4), txt(['c1', 'hundred'], 'NEEDS +100', color=Y, size=110, y=560, dur=36), sfx(['c1', 'hundred'], 's_ding.mp3', 0.4),
           txt(['c2', 'flipping'], 'FLIPPING + SPLITTING', color=W_, size=80, y=560, dur=40), sfx(['c2', 'flipping'], 's_whoosh.mp3', 0.4),
           txt(['c3', 'smoked'], "HE'S GETTING SMOKED", color=RD, size=90, y=560, dur=24), pop(['c3', 'smoked'], 'skull.png', 's_ayo.mp3', off=6)]),
 'trip': dict(scenes=[('c1', 752.95, 756.00), ('c2', 759.20, 761.40), ('c3', 764.85, 766.75)], crop={'c1': [(752.95, 700), (754.00, 1100), (754.75, 700)]}, spk={'c1': [(753.0, 'HIM'), (754.3, 'HER'), (755.0, 'HIM')], 'c3': [(764.85, 'HER')]},
   top='"I got good lawyers"… then THIS', hl={'THIS': R}, sub='He lost the bet. Loser gets waxed.', music=['empire_n', 20],
   ask=[[['c1'], 'Rate his pain 1-10']],
   tints=[], rizz=[],
   punch=[['c1', 'touch'], ['c1', 'sue'], ['c1', 'sue', 1], ['c1', 'lawyers'], ['c2', 'two'], ['c2', 'one'], ['c3', 'wow']],
   blowouts=[], blackFlash=[], streaks=[],
   extras=[sfx(['c1', 'lawyers'], 's_ayo.mp3'), txt(['c2', 'two'], '2… 1…', color=W_, size=120, y=560, dur=16), sfx(['c2', 'two'], 'pop.mp3', 0.5),
           txt(['c2', 'one'], 'RIIIP', color=RD, size=130, y=490, off=17, dur=18), txt(['c2', 'one'], 'HE FELT THAT', color=W_, size=90, y=560, off=27, dur=18), sfx(['c2', 'one'], 's_rip.mp3', 0.6) | {'off': 17},
           pop(['c3', 'wax'], 'e_laugh.png', 's_huh.mp3', after=True)]),
 'tsus': dict(scenes=[('c3', 535.85, 537.75), ('c1', 171.20, 174.45), ('c2', 531.30, 533.30)], eq='eq=brightness=0.06:gamma=1.25', spk={'c3': [(535.8, 'HER')], 'c1': [(171.2, 'INSTRUCTOR')], 'c2': [(531.3, 'INSTRUCTOR')]},
   top='This workout got SUS real quick', hl={'SUS': R}, sub='Just workout instructions… right?', music=['brega_n', 0],
   ask=[[['c3'], 'Which line got you?']],
   tints=[[['c3', 'hard'], R], [['c1', 'between'], R]], rizz=[['c1', 'thigh']],
   punch=[['c3', 'hard'], ['c1', 'ball'], ['c1', 'between'], ['c1', 'thigh'], ['c2', 'push'], ['c2', 'hips'], ['c2', 'come']],
   blowouts=[['c3', 'hard']], blackFlash=[], streaks=[['c1'], ['c2']],
   extras=[txt(['c1', 'ball'], 'BALL??', color=Y, size=120, y=560, dur=16), sfx(['c1', 'ball'], 's_twitch.mp3'), txt(['c3', 'hard'], 'SO HARD??', color=RD, size=130, y=560, dur=30), sfx(['c3', 'hard'], 's_twitch.mp3'), txt(['c1', 'inner'], 'INNER THIGH??', color=Y, size=110, y=560, dur=30), sfx(['c1', 'inner'], 's_huh.mp3'),
           txt(['c2', 'hips'], 'HIPS FORWARD??', color=Y, size=100, y=560, dur=14), sfx(['c2', 'hips'], 's_twitch.mp3'), txt(['c2', 'come'], 'COME??', color=RD, size=130, y=560, dur=20), pop(['c2', 'come'], 'skull.png', 's_ayo.mp3', off=10)]),
 'tcheat': dict(scenes=[('hook', 684.80, 686.10), ('c1', 639.45, 642.00), INS('afml', 'afml.mp4', 0.6), ('c2', 659.20, 660.70),
                        ('c4', 690.55, 692.20), ('c5', 694.00, 695.35)],
   top='He said he had to use the BATHROOM…', hl={'BATHROOM…': R}, sub='Bet: most calories burned wins', music=['funkabn_n', 4],
   ask=[[['hook'], 'Cheating or genius?'], [['c5', 'sorry'], 'Cheating or genius?']],
   tints=[[['hook', 'f***'], R], [['c1', 'restroom'], G], [['c4', 'calories'], R]], rizz=[['c1', 'restroom']],
   punch=[['hook', 'f***'], ['hook', 'doing'], ['c1', '50'], ['c1', 'restroom'], ['c4', 'burn'], ['c4', 'calories'], ['c5', 'sorry']],
   blowouts=[], blackFlash=[], streaks=[['c2']],
   extras=[txt(['hook'], 'CAUGHT HIM', color=RD, size=120, y=560, dur=36), txt(['c1'], 'EARLIER…', color=W_, size=80, y=560, dur=14), txt(['c1', '50'], "HE'S DOWN 50 CALORIES", color=Y, size=80, y=560, dur=36),
           pop(['c1', 'restroom'], 'e_laugh.png', 's_ahh.mp3', after=True), sfx(['c2'], 's_loading.mp3', 0.4), txt(['c2'], 'THE "BATHROOM" WORKOUT', color=Y, size=80, y=560, dur=44),
           pop(['c5', 'sorry'], 'e_sob.png', 's_fahhh.mp3', after=True)]),
 'tpilates': dict(scenes=[('c0', 210.66, 212.95), ('c1', 214.90, 216.70), ('c2', 219.40, 222.40)], spk={'c0': [(210.66, 'HIM')], 'c1': [(214.9, 'HIM')], 'c2': [(219.4, 'HER'), (220.8, 'HIM'), (221.6, 'HER')]},
   top='His watch said 103… "malfunction"', hl={'103…': R}, sub='Bet: most calories burned wins. Loser gets waxed.', music=['sentamento_n', 55],
   ask=[[['c0'], 'Malfunction or excuse?']],
   tints=[[['c1', '103'], R], [['c2', '161'], G]], rizz=[['c2', '161']],
   punch=[['c0', 'embarrassing'], ['c0', 'malfunction'], ['c1', '103'], ['c1', 'impossible'], ['c2', '161'], ['c2', 'close'], ['c2', 'close', 1]],
   blowouts=[['c2', '161']], blackFlash=[], streaks=[],
   extras=[txt(['c1', '103'], '103', color=RD, off=2), sfx(['c1', 'impossible'], 's_huh.mp3'), txt(['c2', '161'], '161', off=2, dur=18), sfx(['c2', '161'], 's_correct.mp3'),
           txt(['c2', '161'], 'SHE WINS', color=Y, size=100, y=560, off=20, dur=30), txt(['c2', 'not'], 'NOT CLOSE', color=RD, size=120, y=560, dur=30), sfx(['c2', 'close', 1], 's_fahhh.mp3')]),
 'tpretty': dict(scenes=[('c1', 477.38, 482.45), ('c2', 483.15, 485.90)], spk={'c1': [(477.3, 'HER')], 'c2': [(483.1, 'HIM')]},
   top='She introduced him and FUMBLED hard', hl={'FUMBLED': R}, sub="She's introducing him to her coach", music=['xcool_n', 0],
   ask=[[['c1'], 'Fumble or on purpose?']],
   tints=[[['c1', 'men'], R]], rizz=[['c1', 'jacked']],
   punch=[['c1', 'jacked'], ['c1', 'pretty'], ['c1', 'men'], ['c2', 'specifically'], ['c2', 'idea']],
   blowouts=[], blackFlash=[], streaks=[['c2']],
   extras=[txt(['c1', 'jacked'], 'BIG AND JACKED', color=W_, size=90, y=560, dur=24), sfx(['c1', 'jacked'], 'pop.mp3', 0.4), txt(['c1', 'men'], 'FOR MEN??', color=RD, size=140, y=560, dur=30), sfx(['c1', 'men'], 's_ayo.mp3'),
           txt(['c2', 'specifically'], 'WOMEN. SPECIFICALLY.', color=Y, size=90, y=560, dur=30), sfx(['c2', 'specifically'], 's_awk.mp3'), pop(['c2', 'specifically'], 'e_laugh.png', 's_huh.mp3', after=True)]),
 'tlat': dict(scenes=[('c1', 145.50, 148.95), ('c2', 157.15, 158.10), ('c3', 158.60, 161.35)], eq='eq=brightness=0.12:gamma=1.4', zoom={'c1': (1.15, 560), 'c2': (1.15, 560), 'c3': (1.15, 560)},
   spk={'c1': [(145.5, 'INSTRUCTOR'), (147.5, 'HIM')], 'c2': [(157.1, 'HER')], 'c3': [(158.6, 'HIM'), (159.4, 'HER')]},
   top='He asked what a lat was… it got WORSE', hl={'WORSE': R}, sub='His first ever Pilates class', music=['montagem_n', 25],
   ask=[[['c1'], 'Rate his effort 1-10']],
   tints=[[['c1', 'lat'], R], [['c3', 'doing'], R]], rizz=[],
   punch=[['c1', 'lats'], ['c1', 'what'], ['c1', 'lat'], ['c2', 'fire'], ['c3', 'too'], ['c3', 'doing']],
   blowouts=[], blackFlash=[], streaks=[['c2']],
   extras=[sfx(['c1', 'lat'], 's_huh.mp3'), txt(['c1', 'lat'], 'WHAT IS A LAT??', color=Y, size=100, y=560, off=10, dur=30),
           sfx(['c2', 'fire'], 's_ahh.mp3'),
           txt(['c3', 'too'], 'ME TOO?', color=Y, size=110, y=560, dur=20), txt(['c3', 'doing'], "YOU'RE NOT EVEN DOING SH*T", color=Y, size=80, y=560, off=-8, dur=40), pop(['c3', 'doing'], 'skull.png', 's_fahhh.mp3', off=6)]),
 'tgpt': dict(scenes=[('c1', 450.30, 453.20), ('c2', 441.95, 444.00), ('c3', 456.70, 457.60), ('c4', 448.15, 450.30)], zoom={'c1': (1.22, 560), 'c2': (1.3, 420)},
   spk={'c1': [(450.3, 'HIM')], 'c2': [(441.95, 'HIM')], 'c3': [(456.7, 'HIM')], 'c4': [(448.15, 'HER')]},
   top='His excuses for losing are CRAZY', hl={'CRAZY': R}, sub='He lost the calorie bet. His excuses:', music=['alquimia_n', 0],
   ask=[[['c1'], 'Do men REALLY burn more?']],
   tints=[[['c4', 'woman'], R], [['c1', 'men'], R]], rizz=[],
   punch=[['c4', 'genes'], ['c4', 'woman'], ['c1', 'ChatGPT'], ['c1', 'men'], ['c2', 'women'], ['c3', 'LeBron']],
   blowouts=[], blackFlash=[], streaks=[['c2'], ['c3']],
   extras=[txt(['c1', 'ChatGPT'], 'EXCUSE #1: CHATGPT', color=Y, size=80, y=560, dur=50), txt(['c4'], 'HER COMEBACK:', color=W_, size=80, y=560, dur=36), sfx(['c4', 'woman'], 's_ayo.mp3') | {'after': True},
           txt(['c2', "women's"], "EXCUSE #2: WOMEN'S WORKOUT", color=Y, size=80, y=560, dur=50), txt(['c3', 'like'], "EXCUSE #3: I'M LEBRON", color=Y, size=80, y=560, dur=30),
           sfx(['c3', 'James'], 's_huh.mp3')]),
}

gen = json.load(open('src/edits.gen.json')); CFG = {}
for eid, spec in E.items():
    # source windows: merge the scenes' ranges (pad 0.2 s), concatenated into one graded excerpt
    rng = sorted((a - 0.2, b + 0.2) for sid, a, b, *_ in spec['scenes'] if a not in ('insert', 'rewind'))
    win = []
    for a, b in rng:
        if win and a <= win[-1][1] + 1.0: win[-1][1] = max(win[-1][1], b)
        else: win.append([a, b])
    offs, t = [], 0.0
    for a, b in win: offs.append((a, b, t)); t += b - a
    scenes = []
    for sc in spec['scenes']:
        if sc[1] == 'insert':
            scenes.append({'id': sc[0], 'videoStartSec': 0, 'durationInFrames': round(sc[3] * 30), 'cropX': 960, 'crops': [[0, 960]], 'insert': sc[2], 'words': []}); continue
        if sc[1] == 'rewind':
            xs = lambda t: next(t - o[0] + o[2] for o in offs if o[0] <= t <= o[1])
            scenes.append({'id': sc[0], 'videoStartSec': round(xs(sc[3]), 3), 'durationInFrames': sc[4], 'cropX': 960, 'crops': [[0, 960]], 'rewind': [round(xs(sc[2]), 3), round(xs(sc[3]), 3)], 'words': []}); continue
        sid, a, b = sc; n = round((b - a) * 30); words = []
        wa, wb, wt = next(o for o in offs if o[0] <= a and b <= o[1])
        for (ws, we, tx) in W:
            if a - 0.05 <= ws < b - 0.05:
                k = (round(ws, 1), tx.lower().strip(',.?!')); tt = ATW[k] if k in ATW else FIX.get(tx.lower().strip(',.?!'), tx.strip(',.'))
                if not tt: continue
                f0 = max(0, round((ws - a) * 30)); f1 = min(n, max(f0 + 4, round((we - a) * 30) + 3))
                sp = [l for t, l in spec.get('spk', {}).get(sid, []) if t <= ws + 0.05]
                words.append({'word': tt, 'startFrame': f0, 'endFrame': f1, **({'spk': sp[-1]} if sp else {})})
        for i in range(len(words) - 1): words[i]['endFrame'] = min(words[i]['endFrame'], words[i + 1]['startFrame'])
        cr = [x for x in spec['crop'][sid]] if sid in spec.get('crop', {}) else crops(a, b); z = spec.get('zoom', {}).get(sid)
        scenes.append({'id': sid, 'videoStartSec': round(a - wa + wt, 3), 'durationInFrames': n, 'cropX': cr[0][1], 'crops': [[round((s - a) * 30), x, *z] if z else [round((s - a) * 30), x] for s, x in cr], 'words': words})
    gen[eid] = scenes
    print(eid, round(sum(s['durationInFrames'] for s in scenes) / 30, 1), 's |', ' / '.join(s['id'] + ': ' + ' '.join(w['word'] for w in s['words']) for s in scenes))
    if '--no-excerpts' not in sys.argv and (not ONLY or eid in ONLY):
        cmd = ['ffmpeg', '-v', 'error', '-y']; fc = []
        for i, (a, b, _) in enumerate(offs):
            cmd += ['-ss', f'{a:.3f}', '-t', f'{b - a:.3f}', '-i', SRC]
            fc.append(f'[{i}:v]fps=30,setpts=PTS-STARTPTS,scale=1920:1080,setsar=1,format=yuv420p[v{i}]')
            fc.append(f'[{i}:a]asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=stereo,apad,atrim=0:{b - a:.3f}[a{i}]')
        fc.append(''.join(f'[v{i}][a{i}]' for i in range(len(offs))) + f'concat=n={len(offs)}:v=1:a=1[cv][ca]'); fc.append('[cv]' + G67 + (',' + spec['eq'] if spec.get('eq') else '') + '[gv]')
        subprocess.run(cmd + ['-filter_complex', ';'.join(fc), '-map', '[gv]', '-map', '[ca]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
                              '-g', '15', '-c:a', 'aac', '-b:a', '192k', '-map_metadata', '-1', f'public/g67_{eid}.mp4'], check=True)
    c = {k: v for k, v in spec.items() if k not in ('scenes', 'zoom', 'eq', 'crop', 'spk')}
    c['hl'] = {w: ('#FF2A2A' if col == R else '#58EE28') for w, col in c['hl'].items()}
    c.update(cta='*full episode on @HardScope*', ctaAt=[scenes[-1]['id']], ask=[{'at': r, 'text': t} for r, t in c['ask']], track='none', calls=[], src=f'g67_{eid}.mp4',
             intro=False, ctaEnd=True, hardcut=True, cutSfx='s_camflash.mp3', sat=1.1, progress=True, popMid=True)
    sc = {s['id']: s for s in scenes}; ST, t = {}, 0
    for s in scenes: ST[s['id']] = t; t += s['durationInFrames']
    END = t
    for e in c['extras']:
        if e.pop('after', False):
            w = [x for x in sc[e['at'][0]]['words'] if x['word'].lower().startswith(e['at'][1].lower())][e['at'][2] if len(e['at']) > 2 else 0]
            e['off'] = w['endFrame'] - w['startFrame'] + 4
        if e['kind'] in ('png', 'txt', 'sfx') and len(e['at']) > 1:
            w = [x for x in sc[e['at'][0]]['words'] if x['word'].lower().startswith(e['at'][1].lower())][e['at'][2] if len(e['at']) > 2 else 0]
            t0 = ST[e['at'][0]] + w['startFrame'] + e.get('off', 0)
            if t0 > END - 20: e['off'] = e.get('off', 0) - (t0 - (END - 20))
    refs = [r for r, _ in c['tints']] + [c['ctaAt']] + [q['at'] for q in c['ask']] + [e['at'] for e in c['extras']] + sum((c[k] for k in ('rizz', 'punch', 'blowouts', 'blackFlash', 'streaks')), [])
    for r in refs:
        assert r[0] in sc, (eid, r)
        if len(r) == 1: continue
        ws = [w for w in sc[r[0]]['words'] if w['word'].lower().startswith(r[1].lower())]
        assert len(ws) > (r[2] if len(r) > 2 else 0), (eid, r, [w['word'] for w in sc[r[0]]['words']])
    for e in c['extras']: assert e['kind'] in ('sfx', 'png', 'txt') or e.get('sfx'), (eid, 'overlay without SFX', e)   # pngs get the echo-pop automatically
    CFG[eid] = c
json.dump(gen, open('src/edits.gen.json', 'w'))
json.dump(CFG, open('src/r3t.cfg.json', 'w'), indent=1); print('cfg ok')
