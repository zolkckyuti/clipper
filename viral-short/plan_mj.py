# Loaded Tea x MJ (Clipfarm) batch 1 redo in the VverPaldo template (Nov 16). Campaign rules: ONLY their footage (no video overlays),
# watermark big + uncovered for the whole video (cfg.wm, drawn last in the black band above the box; top text moves onto the box via topY).
# Vertical iPhone sources: a 1080-wide square (top = y0) is cut, scaled 1088 and centred in a 1920x1080 canvas, so the template's
# 16:9 box shows exactly that square. Each edit gets one pre-graded (67, footage only) excerpt public/g67_mj<k>.mp4 = its scenes back to back.
# Usage: python3 plan_mj.py <proxy dir> <transcript dir> [--no-excerpts]
import json, os, subprocess, sys
PX, TX = sys.argv[1], sys.argv[2]
A9, V63, V64 = 'A009C003_261020JC-005.mp4', 'IMG_3763_2-004.mp4', 'IMG_3764_2.mp4'
G67 = ("split[ga][gb];[gb]gblur=sigma=14[gg];[ga][gg]blend=all_mode=softlight:all_opacity=0.245,unsharp=5:5:1.74:5:5:0,"
       "eq=contrast=1.113:saturation=1.26:gamma=0.98,curves=all='0/0 0.25/0.21 0.75/0.81 1/1',unsharp=3:3:0.79,format=yuv420p")
# transcript words (absolute source seconds); p = A009 685-740, d = IMG_3763 380-468, dance = IMG_3763 14-54
def words(name, off):
    return [(w[0] + off, w[1] + off, w[2]) for s in json.load(open(f'{TX}/{name}.json')) for w in s['w']]
WA9 = words('p', 685); W63 = words('d', 380) + words('dance', 14)
MANUAL = {V63: [(405.25, 405.6, "There's"), (405.6, 406.0, 'straws'), (406.0, 406.4, 'over'), (406.4, 406.75, 'here'), (406.75, 407.2, 'too')]}
DROP = [(452.2, 454.5), (441.0, 442.6)]   # unclear lines -> no captions
FIX = {"y": "y'all", "'all,": ''}
# (scene, source, a, b, crops) — crops: [(src sec, cx[, zoom, cy])] for A009; for verticals an int = square top y0
EDITS = {
 'mjpepsi': [('hook', A9, 701.0, 703.6, [(701.0, 900), (702.0, 700, 1.3, 480)]),
             ('c1', A9, 689.0, 707.2, [(689.0, 940), (691.9, 1400), (693.0, 1020), (697.8, 760), (699.9, 1150), (701.9, 700), (702.4, 700, 1.3, 480),
                                       (704.6, 960), (705.9, 1000)])],
 'mjpaused': [('hook', V63, 435.5, 437.9, 330), ('c1', V63, 386.3, 390.9, 450), ('c2', V63, 404.9, 410.95, 480), ('c3', V63, 424.6, 430.0, 700)],
 'mjsugar': [('hook', V63, 450.1, 451.8, 650), ('c1', V63, 439.9, 448.6, 420), ('c2', V63, 448.6, 457.1, 650)],
 'mjdance': [('hook', V63, 48.0, 50.0, 380), ('c1', V63, 14.0, 21.0, 500), ('c2', V63, 21.0, 26.0, 500), ('c3', V63, 26.0, 31.0, 560),
             ('c4', V63, 46.5, 52.0, 380)],
 'mjred': [('hook', V64, 187.5, 189.5, 520), ('c1', V64, 116.0, 121.0, 640), ('c2', V64, 121.0, 126.0, 640), ('c3', V64, 126.0, 130.0, 640),
           ('c4', V64, 183.0, 190.0, 600)],
}
gen = json.load(open('src/edits.gen.json'))
SQ = 1088 / 1080
for eid, plan in EDITS.items():
    out = f'public/g67_{eid}.mp4'; scenes = []; t = 0.0; parts = []
    for sid, src, a, b, cr in plan:
        n = round((b - a) * 30); d = n / 30
        parts.append((src, a, d, cr))
        if isinstance(cr, int): crops = [[0, 960]]
        else: crops = [[max(0, round((c[0] - a) * 30)), *c[1:]] for c in cr]
        ws = [] if src == A9 and False else None
        pool = (WA9 if src == A9 else W63 if src == V63 else []) + MANUAL.get(src, [])
        wl = []
        for ws_, we, tx in sorted(pool):
            if not (a - 0.05 <= ws_ < b - 0.05) or any(x <= ws_ < y for x, y in DROP): continue
            tx = FIX.get(tx, tx).strip().strip(',.')
            if not tx: continue
            f0 = max(0, round((ws_ - a) * 30)); f1 = min(n, max(f0 + 4, round((we - a) * 30) + 3))
            wl.append({'word': tx, 'startFrame': f0, 'endFrame': f1})
        for i in range(len(wl) - 1): wl[i]['endFrame'] = min(wl[i]['endFrame'], wl[i + 1]['startFrame'])
        scenes.append({'id': sid, 'videoStartSec': round(t, 4), 'durationInFrames': n, 'cropX': 960, 'crops': crops, 'words': wl})
        t += d
    gen[eid] = scenes
    print(eid, round(t, 2), 's |', ' / '.join(s['id'] + ': ' + ' '.join(w['word'] for w in s['words']) for s in scenes))
    ONLY = [a[7:] for a in sys.argv if a.startswith('--only=')]
    if '--no-excerpts' in sys.argv or (ONLY and eid not in ONLY): continue
    cmd = ['ffmpeg', '-v', 'error', '-y']; fc = []
    for i, (src, a, d, cr) in enumerate(parts):
        cmd += ['-ss', f'{a:.3f}', '-t', f'{d:.4f}', '-i', f'{PX}/{src}']
        if isinstance(cr, int):
            fc.append(f'[{i}:v]fps=30,setpts=PTS-STARTPTS,crop=1080:1080:0:{cr},scale=1088:1088,crop=1088:1080:0:4,pad=1920:1080:416:0:black,setsar=1,format=yuv420p[v{i}]')
        else:
            fc.append(f'[{i}:v]fps=30,setpts=PTS-STARTPTS,scale=1920:1080,setsar=1,format=yuv420p[v{i}]')
        fc.append(f'[{i}:a]asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=stereo,apad,atrim=0:{d:.4f}[a{i}]')
    fc.append(''.join(f'[v{i}][a{i}]' for i in range(len(parts))) + f'concat=n={len(parts)}:v=1:a=1[cv][ca]')
    fc.append('[cv]' + G67 + '[gv]')
    subprocess.run(cmd + ['-filter_complex', ';'.join(fc), '-map', '[gv]', '-map', '[ca]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18',
                          '-g', '15', '-c:a', 'aac', '-b:a', '192k', out], check=True)
json.dump(gen, open('src/edits.gen.json', 'w'))

G, R = 'G', 'R'
def png(at, f, x=870, y=1290, size=200): return dict(at=at, kind='png', file=f, x=x, y=y, size=size)
def sfx(at, f, v=0.5): return dict(at=at, kind='sfx', file=f, v=v)
def static_track(eid, scene, s0, s1, x, y, r):
    # template track = {excerpt sec (2 dp): [x, y, r]} in the 1920x1080 excerpt; static point (steady shot)
    st = {s['id']: s for s in gen[eid]}[scene]['videoStartSec']
    return {f'{st + k / 50:.2f}': [x, y, r] for k in range(round(s0 * 50), round(s1 * 50) + 1)}
def call(eid, scene, s0, s1, label):
    st = {s['id']: s for s in gen[eid]}[scene]['videoStartSec']
    return [round(st + s0, 2), round(st + s1, 2), label]
CFG = {
 'mjpepsi': dict(top='They said it\'s BETTER than Pepsi', hl={'BETTER': '#58EE28'}, music=['brevis_n', 4], ctaAt=['c1', "it's"], cta='*would you pick it over Pepsi?*',
   tints=[[['c1', 'sugar'], G], [['c1', 'carbs', 1], G], [['c1', 'better'], G], [['c1', 'pepsi', 1], R]], rizz=[['c1', 'sugar']],
   punch=[['hook', 'better'], ['hook', 'pepsi'], ['c1', 'zero'], ['c1', 'sugar'], ['c1', 'carbs'], ['c1', 'good'], ['c1', 'better'], ['c1', 'pepsi'], ['c1', 'pepsi', 1]],
   blowouts=[['c1', 'pepsi']], blackFlash=[['c1', 'better', 1]], streaks=[['c1', 'you']],
   extras=[sfx(['c1', 'zero'], 's_ding.mp3', 0.4), sfx(['c1', 'good'], 's_wow.mp3', 0.45), png(['c1', 'good'], 'e_heart.png'),
           sfx(['c1', 'pepsi', 1], 's_huh.mp3', 0.5), png(['c1', 'pepsi', 1], 'e_laugh.png', 260)]),
 'mjpaused': dict(top='They PAUSED the MJ show for drinks', hl={'PAUSED': '#FF2A2A'}, music=['funkabn_n', 4], ctaAt=['c2', 'this'], cta='*would you pause the show for this?*',
   tints=[[['c1', 'paused'], R], [['c1', 'drinks'], G], [['c2', 'great'], G]], rizz=[['c1', 'drinks']],
   punch=[['hook', 'delicious'], ['hook', "i'm"], ['c1', 'paused'], ['c1', 'performance'], ['c1', 'drinks'], ['c2', 'straws'], ['c2', 'great'], ['c3', 'cheers'], ['c3', 'cheers', 2]],
   blowouts=[['c3', 'cheers', 2]], blackFlash=[['c1', 'paused']], streaks=[['c2'], ['c3']],
   extras=[sfx(['hook', "i'm"], 's_wow.mp3', 0.45), png(['hook', "i'm"], 'e_laugh.png', 260), sfx(['c1', 'paused'], 's_huh.mp3', 0.5),
           sfx(['c3', 'cheers', 2], 's_ding.mp3', 0.4), png(['c3', 'cheers', 2], 'e_heart.png')]),
 'mjsugar': dict(top='No sugar, no carbs… the DREAM drink', hl={'DREAM': '#58EE28'}, music=['sentamento_n', 55], ctaAt=['c2', 'yes'], cta='*would you try it?*',
   tints=[[['c1', 'sugar'], G], [['c2', 'carbs'], G], [['c2', 'dream'], G]], rizz=[['c2', 'dream']],
   punch=[['hook', 'dream'], ['c1', 'refreshing'], ['c1', 'sugar'], ['c1', 'seriously'], ['c1', 'sugar', 1], ['c2', 'carbs'], ['c2', 'dream'], ['c2', 'girl']],
   blowouts=[['c1', 'seriously']], blackFlash=[['c2', 'dream']], streaks=[['c2']],
   extras=[sfx(['c1', 'refreshing'], 's_wow.mp3', 0.45), sfx(['c2', 'dream'], 's_ding.mp3', 0.4), png(['c2', 'dream'], 'e_heart.png'),
           sfx(['c2', 'girl'], 's_huh.mp3', 0.45), png(['c2', 'girl'], 'e_laugh.png', 260)]),
 'mjdance': dict(top='Blue MJ vs Black MJ DANCE-OFF', hl={'DANCE-OFF': '#FF2A2A'}, music=['montagem_n', 25], ctaAt=['c3'], cta='*who won, blue or black?*', srcVol=0.35,
   tints=[[['c2'], G], [['c4'], R]], rizz=[['c2']],
   punch=[['hook'], ['c1', 'move'], ['c1', 'move', 1], ['c2'], ['c3'], ['c4']],
   blowouts=[['c4']], blackFlash=[['c3']], streaks=[['c2'], ['c4']],
   extras=[sfx(['c1', 'move'], 's_huh.mp3', 0.45), sfx(['c4'], 's_wow.mp3', 0.45), png(['c4'], 'e_laugh.png', 260)]),
 'mjred': dict(top='When the RED JACKET MJs take over', hl={'RED': '#FF2A2A', 'JACKET': '#FF2A2A'}, music=['empire_n', 20], ctaAt=['c3'], cta='*which MJ had the best moves?*', srcVol=0.35,
   tints=[[['c2'], R], [['c4'], G]], rizz=[['c4']],
   punch=[['hook'], ['c1'], ['c2'], ['c3'], ['c4']],
   blowouts=[['c4']], blackFlash=[['c3']], streaks=[['c2'], ['c4']],
   extras=[sfx(['c2'], 's_wow.mp3', 0.45), png(['c2'], 'e_heart.png'), sfx(['c4'], 's_correct.mp3', 0.4)]),
}
TRACKS = {'mjpaused': [('c1', 1.0, 3.4, 1170, 290, 120, '*The MJ*')]}
for eid, c in CFG.items():
    c.update(track='none', calls=[], trackData={}, src=f'g67_{eid}.mp4', intro=True, hardcut=True, cutSfx='s_camflash.mp3',
             wm=dict(file='wm_loadedtea.png', x=80, y=140, w=920), topY=436)
    for sc_, s0, s1, x, y, r, lab in TRACKS.get(eid, []):
        c['trackData'].update(static_track(eid, sc_, s0, s1, x, y, r)); c['calls'].append(call(eid, sc_, s0, s1, lab))
    sc = {s['id']: s for s in gen[eid]}
    refs = [r for r, _ in c['tints']] + [c['ctaAt']] + [e['at'] for e in c['extras']] + sum((c[k] for k in ('rizz', 'punch', 'blowouts', 'blackFlash', 'streaks')), [])
    for r in refs:
        if len(r) == 1: assert r[0] in sc, (eid, r); continue
        ws = [w for w in sc[r[0]]['words'] if w['word'].lower().startswith(r[1].lower())]
        assert len(ws) > (r[2] if len(r) > 2 else 0), (eid, r, [w['word'] for w in sc[r[0]]['words']])
json.dump(CFG, open('src/mj.cfg.json', 'w'), indent=1); print('cfg ok')
