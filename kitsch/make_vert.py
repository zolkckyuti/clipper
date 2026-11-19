"""VverPaldo edit for footage that is ALREADY vertical (Kitsch x Nic Vans "Saint Nic", 1080x1920).
Per clip config: segments (hook first, then the story; the hook line is never replayed), top hook text, highlight / green / punch
words, song. Look: CapCut-style grade, 5 % black flicker every 3 frames, green tint + white blow-out hits, punch-in zooms on key
words, 2-frame white flash + camera-flash SFX on every hard cut, one-word captions (white, black stroke, key words yellow),
phonk/slowed song sidechain-ducked under the voices. Output: 1080x1920 30 fps.
Usage: python3 kitsch/make_vert.py <src.mp4> <src_tx.json> <clip.json> <out_dir>"""
import json, os, subprocess, sys

src, tx_f, cfg_f, out = sys.argv[1:5]
W = [w for s in json.load(open(tx_f)) for w in s['w']]
C = json.load(open(cfg_f)); NAME = C['name']; SEG = [tuple(x) for x in C['seg']]
FIX = {'kish': 'Kitsch', 'nick.': 'Nic.', 'nick': 'Nic', **C.get('fix', {})}
FPS = 30
os.makedirs(out, exist_ok=True)
def ts(t): return f'{int(t // 3600)}:{int(t % 3600 // 60):02d}:{t % 60:05.2f}'
ev, WT, cuts, o = [], [], [], 0.0
for sid, a, b in SEG:
    ws = [w for w in W if a - 0.05 <= w[0] < b - 0.05]
    for i, (s, e, t) in enumerate(ws):
        t = FIX.get(t.lower(), FIX.get(t.lower().strip(',.?!'), t)).strip(',.?!').upper()
        s0 = o + max(0, s - a); s1 = o + (ws[i + 1][0] - a if i + 1 < len(ws) else b - a)
        s1 = min(s1, s0 + 1.3)
        col = '&H0000D4FF&' if t in C.get('hl', []) else '&H00FFFFFF&'
        ev.append(f'Dialogue: 0,{ts(s0)},{ts(s1)},Cap,,0,0,0,,{{\\pos(540,{C.get('cap_y', 1330)})\\t(0,80,\\fscx100\\fscy100)\\fscx120\\fscy120\\c{col}}}{t}')
        WT.append((t, s0))
    cuts.append(o); o += b - a
DUR = o
top = C['top'].replace('\n', '\\N')
ev.append(f'Dialogue: 1,{ts(0)},{ts(DUR)},Top,,0,0,0,,{{\\pos(540,250)}}{top}')
ass = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Montserrat Black,96,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,1,0,0,0,100,100,0,0,1,8,3,5,40,40,0,1
Style: Top,Montserrat Black,62,&H00FFFFFF,&H00FFFFFF,&H00000000,&H96000000,1,0,0,0,100,100,0,0,1,7,2,5,60,60,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
""" + '\n'.join(ev) + '\n'
assf = os.path.join(out, f'{NAME}.ass'); open(assf, 'w').write(ass)

# ---- segments (one ffmpeg each, low memory) -> concat list
lines = []
for i, (sid, a, b) in enumerate(SEG):
    f = os.path.join(out, f'{NAME}_seg{i}.mkv')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{a:.3f}', '-to', f'{b:.3f}', '-i', src, '-vf', f'fps={FPS},scale=1080:1920,setsar=1', '-af', 'aresample=48000',
                    '-c:v', 'libx264', '-preset', 'fast', '-crf', '12', '-pix_fmt', 'yuv420p', '-c:a', 'pcm_s16le', f], check=True)
    lines.append(f"file '{os.path.abspath(f)}'")
segl = os.path.join(out, f'{NAME}_segs.txt'); open(segl, 'w').write('\n'.join(lines) + '\n')

def hits(words, n=1, gap=0.6):
    h = []
    for w in words: h += [t for x, t in WT if x == w][:n]
    h.sort(); outl = []
    for t in h:
        if all(abs(t - u) > gap for u in outl): outl.append(t)
    return outl
greens, punches, blows = hits(C.get('green', [])), hits(C.get('punch', []), 2, 0.5), hits(C.get('blow', []))
win = lambda ts_, d: '+'.join(f'between(t,{t:.3f},{t + d:.3f})' for t in ts_) or '0'
pz = '+'.join(f'between(on,{int(t * FPS)},{int((t + 0.45) * FPS)})' for t in punches) or '0'
flash = '+'.join(f'between(t,{c:.3f},{c + 2 / FPS:.3f})' for c in cuts[1:]) or '0'
fonts = os.path.abspath('.work/fonts')
graph = (f"[0:v]eq=contrast=1.08:saturation=1.18,unsharp=5:5:0.7,"
         f"zoompan=z='1+0.12*min(1,{pz})':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps={FPS},"
         f"drawbox=x=0:y=0:w=iw:h=ih:color=black@0.05:t=fill:enable='eq(mod(n,3),0)',"
         f"drawbox=x=0:y=0:w=iw:h=ih:color=0xA7EA04@0.22:t=fill:enable='{win(greens, 0.27)}',"
         f"drawbox=x=0:y=0:w=iw:h=ih:color=white@0.5:t=fill:enable='{win(blows + greens, 0.06)}',"
         f"drawbox=x=0:y=0:w=iw:h=ih:color=white@0.9:t=fill:enable='{flash}',"
         f"subtitles={assf}:fontsdir={fonts}[vout];")
mfile, moff = C['music']
fx = [('s_camflash', c, 0.4) for c in cuts[1:]] + [('rizz', t, 0.3) for t in greens] + [('pop', t, 0.16) for t in punches] + [('flash', t, 0.3) for t in blows]
ins = ['-stream_loop', '-1', '-ss', str(moff), '-i', mfile]
for n, t, v in fx: ins += ['-i', f'public/kreek/music/{n}.mp3']
parts = ''.join(f'[{2 + i}:a]adelay={int(t * 1000)}|{int(t * 1000)},volume={v}[x{i}];' for i, (n, t, v) in enumerate(fx))
graph += (f"[0:a]asplit[voice][key];[1:a]aresample=48000,volume={C.get('music_vol', 0.6)},afade=t=in:d=0.2[m0];[m0][key]sidechaincompress=threshold=0.04:ratio=5:attack=15:release=350[mus];"
          + parts + f"[voice][mus]{''.join(f'[x{i}]' for i in range(len(fx)))}amix=inputs={2 + len(fx)}:normalize=0:duration=first,"
          f"loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.8:level=disabled[aout]")
dst = os.path.join(out, f'kitsch_{NAME}_1080p.mp4')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', segl] + ins + ['-filter_complex', graph, '-map', '[vout]', '-map', '[aout]', '-t', f'{DUR:.3f}',
                '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-r', str(FPS), '-c:a', 'aac', '-b:a', '256k', '-ar', '48000',
                '-movflags', '+faststart', '-map_metadata', '-1', dst], check=True)
for l in lines: os.remove(l.split("'")[1])
print('ok', NAME, round(DUR, 2))
