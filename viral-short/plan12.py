# R3born Ep2 'sus' edit (Nov 17): innuendo from the instructions only (ball between the thighs -> "this is f***ing hard",
# "push your hips forward... start to arch"). Nothing explicit; only N3on is the punchline (brief: don't embarrass the creators).
# Excerpt public/g67_sus.mp4 = [169.8-177.4] + [528.0-536.0] graded 67; scenes carry their own window offset.
# Usage: python3 plan12.py <tx.json> <r3ep2.mp4> [--no-excerpts]
import json, subprocess, sys
W = [w for s in json.load(open(sys.argv[1])) for w in s['w']]
SRC = sys.argv[2]
FIX = {'fuck': 'f***', 'fucking': 'f***ing'}
ATW = {(175.6, 'in'): '', (175.8, 'this'): '', (176.2, 'fucking'): '', (176.7, 'hard'): ''}   # source has this line burned in
G67 = ("split[ga][gb];[gb]gblur=sigma=14[gg];[ga][gg]blend=all_mode=softlight:all_opacity=0.245,unsharp=5:5:1.74:5:5:0,"
       "eq=contrast=1.113:saturation=1.26:gamma=0.98,curves=all='0/0 0.25/0.21 0.75/0.81 1/1',unsharp=3:3:0.79,format=yuv420p")
WIN = [(169.8, 177.4), (528.0, 536.0)]
OFF = {0: 169.8, 1: 528.0 - (177.4 - 169.8)}
# (scene, a, b, window, [(src sec, cx[, zoom, cy])])
PLAN = [('hook', 175.50, 177.05, 0, [(175.5, 1000)]),
        ('c1', 170.30, 177.05, 0, [(170.3, 980), (171.8, 1270), (173.2, 980)]),
        ('c2', 528.60, 535.40, 1, [(528.6, 620), (532.0, 900)])]
gen = json.load(open('src/edits.gen.json')); scenes = []
for sid, a, b, wi, fr in PLAN:
    n = round((b - a) * 30); words = []
    for (ws, we, t) in W:
        if a - 0.05 <= ws < b - 0.05:
            k = (round(ws, 1), t.lower().strip(',.?!')); tt = ATW[k] if k in ATW else FIX.get(t.lower().strip(',.?!'), t.strip(',.'))
            if not tt: continue
            f0 = max(0, round((ws - a) * 30)); f1 = min(n, max(f0 + 4, round((we - a) * 30) + 3))
            words.append({'word': tt, 'startFrame': f0, 'endFrame': f1})
    for i in range(len(words) - 1): words[i]['endFrame'] = min(words[i]['endFrame'], words[i + 1]['startFrame'])
    crops = [[max(0, round((s - a) * 30)), *c] for s, *c in fr]
    scenes.append({'id': sid, 'videoStartSec': round(a - OFF[wi], 3), 'durationInFrames': n, 'cropX': crops[0][1], 'crops': crops, 'words': words})
gen['r3sus'] = scenes
print('r3sus', round(sum(s['durationInFrames'] for s in scenes) / 30, 1), 's |', ' / '.join(s['id'] + ': ' + ' '.join(w['word'] for w in s['words']) for s in scenes))
json.dump(gen, open('src/edits.gen.json', 'w'))
if '--no-excerpts' not in sys.argv:
    cmd = ['ffmpeg', '-v', 'error', '-y']; fc = []
    for i, (a, b) in enumerate(WIN):
        cmd += ['-ss', f'{a:.3f}', '-t', f'{b - a:.3f}', '-i', SRC]
        fc.append(f'[{i}:v]fps=30,setpts=PTS-STARTPTS,scale=1920:1080,setsar=1,format=yuv420p[v{i}]')
        fc.append(f'[{i}:a]asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=stereo,apad,atrim=0:{b - a:.3f}[a{i}]')
    fc.append('[v0][a0][v1][a1]concat=n=2:v=1:a=1[cv][ca]'); fc.append('[cv]' + G67 + '[gv]')
    subprocess.run(cmd + ['-filter_complex', ';'.join(fc), '-map', '[gv]', '-map', '[ca]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18',
                          '-g', '15', '-c:a', 'aac', '-b:a', '192k', '-map_metadata', '-1', 'public/g67_sus.mp4'], check=True)
G, R = 'G', 'R'
def png(at, f, x=870, y=1290, size=200): return dict(at=at, kind='png', file=f, x=x, y=y, size=size)
def sfx(at, f, v=0.5): return dict(at=at, kind='sfx', file=f, v=v)
CFG = {'r3sus': dict(top='This workout got SUS real quick', hl={'SUS': '#FF2A2A'}, music=['funkabn_n', 4], ctaAt=['c2', 'hips'],
   tints=[[['c1', 'between'], R], [['c1', 'kneel'], R], [['c2', 'hips'], R], [['c2', 'arch'], R]], rizz=[['c1', 'thigh'], ['c2', 'forward']],
   punch=[['c1', 'ball'], ['c1', 'between'], ['c1', 'thigh'], ['c1', 'kneel'], ['c1', 'down'],
          ['c2', 'rock'], ['c2', 'push'], ['c2', 'hips'], ['c2', 'forward'], ['c2', 'backbend'], ['c2', 'arch']],
   blowouts=[['c2', 'arch']], blackFlash=[['c1', 'down']], streaks=[['c2', 'push']],
   extras=[sfx(['c1', 'between'], 's_huh.mp3', 0.5), png(['c1', 'thigh'], 'e_laugh.png', 260), sfx(['c1', 'down'], 's_fahhh.mp3', 0.45),
           sfx(['c2', 'hips'], 's_awk.mp3', 0.45), png(['c2', 'hips'], 'e_sob.png'), sfx(['c2', 'arch'], 's_wow.mp3', 0.45)])}
for eid, c in CFG.items():
    c.update(cta='*full episode on @HardScope*', track='none', calls=[], src='g67_sus.mp4', intro=True, hardcut=True, cutSfx='s_camflash.mp3')
    sc = {s['id']: s for s in gen[eid]}
    refs = [r for r, _ in c['tints']] + [c['ctaAt']] + [e['at'] for e in c['extras']] + sum((c[k] for k in ('rizz', 'punch', 'blowouts', 'blackFlash', 'streaks')), [])
    for r in refs:
        ws = [w for w in sc[r[0]]['words'] if w['word'].lower().startswith(r[1].lower())]
        if len(r) == 1: continue
        assert len(ws) > (r[2] if len(r) > 2 else 0), (eid, r, [w['word'] for w in sc[r[0]]['words']])
json.dump(CFG, open('src/r3sus.cfg.json', 'w'), indent=1); print('cfg ok')
