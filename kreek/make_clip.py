"""KreekCraft GTA 6 test clip: "the crocodile bet" (Day 1 stream, VOD v2932147800 at 11:27:30-11:29:50).
Brief (ClipLaunch Notion): KreekCraft's GTA 6 stream footage only, official logo overlay visible the WHOLE video,
true to what happened, caption 'Watch KreekCraft on YouTube and Twitch' + #GTA6 #KreekCraft #GrandTheftAutoVI, no links.
Style: VverPaldo hook + hard cut (2-frame white flash), facecam top / gameplay bottom, one-word captions.
Output: 1080x1920 60 fps master + a 2160x3840 upscale (platforms give 4K uploads a better codec/bitrate).
Usage: python3 kreek/make_croc.py <clip.mp4> <clip.words.json> <overlay.png> <out_dir> <clip.cfg.json>"""
import json, os, subprocess, sys

src, words_f, logo, out, cfg_f = sys.argv[1:6]
W = json.load(open(words_f)); CFG = json.load(open(cfg_f))
NAME = CFG['name']
# (id, start, end) in clip seconds; hook first, then the story in order (hook line never replayed)
SEG = [tuple(x) for x in CFG['seg']]
SWEAR = ('fuck', 'shit', 'bitch', 'damn', 'ass', 'dick', 'hell')
# mute every swear inside the used segments (+ any manual ranges), caption shows it starred
MUTE = [tuple(m) for m in CFG.get('mute', [])] + [(w[0] - 0.03, w[1] + 0.03) for w in W
        if any(w[2].lower().strip(',.?!').startswith(x) and len(w[2].strip(',.?!')) <= len(x) + 3 for x in SWEAR) and any(a <= w[0] < b for _, a, b in SEG)]
FIX = CFG.get('fix', {})
def star(t):
    k = t.lower().strip(',.?!')
    for x in SWEAR:
        if k.startswith(x) and len(k) <= len(x) + 3: return t[0] + '*' * (len(t.strip(',.?!')) - 2) + t.strip(',.?!')[-1]
    return t
TOP = CFG['top']
HL = set(CFG.get('hl', []))
FPS = 60

# ---------------------------------------------------------------- captions (ASS), timeline = output seconds
def ts(t): h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60; return f'{h}:{m:02d}:{s:05.2f}'
ev = []; o = 0.0; cuts = []; WT = []   # WT: (WORD, output time) for the VverPaldo effects
for sid, a, b in SEG:
    ws = [w for w in W if a - 0.05 <= w[0] < b - 0.05]
    for i, (s, e, t) in enumerate(ws):
        t = star(FIX.get(t.lower(), t)).strip(',.?!').upper()
        s0 = o + max(0, s - a); s1 = o + (ws[i + 1][0] - a if i + 1 < len(ws) else b - a)
        if s1 - s0 > 1.2: s1 = s0 + 1.2
        WT.append((t, s0, sid))
        hl = t in HL
        col = '&H0035E1FF&' if hl else '&H00FFFFFF&'
        ev.append(f'Dialogue: 0,{ts(s0)},{ts(s1)},Cap,,0,0,0,,{{\\fad(0,0)\\t(0,70,\\fscx100\\fscy100)\\fscx118\\fscy118\\c{col}}}{t}')
    cuts.append(o); o += b - a
DUR = o
ev.append(f'Dialogue: 1,{ts(0)},{ts(DUR)},Top,,0,0,0,,{TOP}')
ass = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Montserrat Black,92,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,1,0,0,0,100,100,0,0,1,7,3,5,40,40,0,1
Style: Top,Montserrat Black,52,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,1,0,0,0,100,100,0,0,1,5,0,8,50,50,52,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
""" + '\n'.join(e.replace('Cap,,0,0,0,,', 'Cap,,0,0,0,,{\\pos(540,1440)}') for e in ev) + '\n'
os.makedirs(out, exist_ok=True)
open(os.path.join(out, f'{NAME}.ass'), 'w').write(ass)

# ---------------------------------------------------------------- video: one ffmpeg per segment (low memory), then join + finish
seglist = os.path.join(out, f'{NAME}_segs.txt'); lines = []
for i, (sid, a, b) in enumerate(SEG):
    z = 1.15 if sid in CFG.get('punch', ['hook']) else 1.0   # punch-in = tighter crop on these segments
    mute = ''.join(f",volume=enable='between(t,{m0 - a:.2f},{m1 - a:.2f})':volume=0" for m0, m1 in MUTE if a <= m0 < b)
    g = (f'[0:v]fps={FPS},split[f][g];[f]crop=410:266:0:136,scale=1080:700:flags=lanczos[fc];'
         f'[g]crop={int(1058 / z)}:{int(1080 / z)}:(iw-ow)/2+40:(ih-oh)/2,scale=1080:1100:flags=lanczos,setsar=1[gp];[fc][gp]vstack,pad=1080:1920:0:120:black[v];'
         f'[0:a]aresample=48000{mute}[a]')
    f = os.path.join(out, f'{NAME}_seg{i}.mp4')
    if not os.path.exists(f.replace('.mp4', '.mkv'))  or os.environ.get('RESEG'): subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{a:.3f}', '-to', f'{b:.3f}', '-i', src, '-filter_complex', g, '-map', '[v]', '-map', '[a]',
                    '-c:v', 'libx264', '-preset', 'fast', '-crf', '12', '-pix_fmt', 'yuv420p', '-r', str(FPS), '-c:a', 'pcm_s16le', '-f', 'matroska', f.replace('.mp4', '.mkv')], check=True)
    lines.append(f"file '{os.path.abspath(f.replace('.mp4', '.mkv'))}'")
open(seglist, 'w').write('\n'.join(lines) + '\n')
flash = '+'.join(f'between(t,{c:.3f},{c + 2 / FPS:.3f})' for c in cuts[1:])
VV = CFG.get('vv')
sub = f"subtitles={os.path.join(out, f'{NAME}.ass')}:fontsdir={os.path.abspath('.work/fonts')}"
if not VV:
    graph = (f"[0:v]drawbox=x=0:y=0:w=iw:h=ih:color=white@0.9:t=fill:enable='{flash}'[fv];[1:v]scale=560:-1[lg];[fv][lg]overlay=x=500:y=660:shortest=1[lv];"
             f"[lv]{sub}[vout];[0:a]loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.85:level=disabled[aout]")
    extra_in = []; tag = ''
else:
    # VverPaldo: CapCut-style grade, constant 4 % black flicker every 3 frames, punch-ins on key words (gameplay only),
    # green/red tint hits + white blow-outs with their SFX, camera-flash on hard cuts, phonk ducked under the voice.
    def first(words, n=2):
        hits = []
        for w in words:
            hits += [x for x in WT if x[0] == w][:n]
        return sorted(hits, key=lambda x: x[1])
    def spaced(evs, gap=0.6):
        outl = []
        for e in evs:
            if all(abs(e[1] - x[1]) > gap for x in outl): outl.append(e)
        return outl
    reds, greens = spaced(first(VV.get('red', []), 1)), spaced(first(VV.get('green', []), 1))
    punches = spaced(first(VV.get('punch', []), 2), 0.5)
    pz = '+'.join(f'between(on,{int(t * FPS)},{int((t + 0.45) * FPS)})' for _, t, _ in punches) or '0'
    win = lambda evs, d: '+'.join(f'between(t,{t:.3f},{t + d:.3f})' for _, t, _ in evs) or '0'
    graph = (f"[0:v]eq=contrast=1.1:saturation=1.25,unsharp=5:5:0.8,split[top][gp0];[top]crop=1080:820:0:0[tp];"
             f"[gp0]crop=1080:1100:0:820,zoompan=z='1+0.13*min(1,{pz})':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1100:fps={FPS}[gz];[tp][gz]vstack[st];"
             f"[st]drawbox=x=0:y=0:w=iw:h=ih:color=black@0.05:t=fill:enable='eq(mod(n,3),0)',"
             f"drawbox=x=0:y=0:w=iw:h=ih:color=0xA7EA04@0.28:t=fill:enable='{win(greens, 0.27)}',"
             f"drawbox=x=0:y=0:w=iw:h=ih:color=0xF40305@0.28:t=fill:enable='{win(reds, 0.27)}',"
             f"drawbox=x=0:y=0:w=iw:h=ih:color=white@0.55:t=fill:enable='{win(reds + greens, 0.05)}',"
             f"drawbox=x=0:y=0:w=iw:h=ih:color=white@0.9:t=fill:enable='{flash}'[fv];"
             f"[1:v]scale=560:-1[lg];[fv][lg]overlay=x=500:y=660:shortest=1[lv];[lv]{sub}[vout];")
    # audio: stream voice + phonk (ducked, optional silent windows) + sfx
    mfile, moff = VV['music']
    msil = '+'.join(f'between(t,{a:.2f},{b:.2f})' for a, b in VV.get('music_off', [])) or '0'
    fx = [('s_camflash', c, 0.45) for c in cuts[1:]] + [('rizz', t, 0.35) for _, t, _ in greens] + [('shock', t, 0.35) for _, t, _ in reds] + [('pop', t, 0.18) for _, t, _ in punches]
    extra_in = ['-stream_loop', '-1', '-ss', str(moff), '-i', os.path.join('public/kreek/music', f'{mfile}_n.wav')]
    for name, t, v in fx: extra_in += ['-i', os.path.join('public/kreek/music', f'{name}.mp3')]
    k = 3
    parts = []
    for i, (name, t, v) in enumerate(fx):
        parts.append(f'[{k + i}:a]adelay={int(t * 1000)}|{int(t * 1000)},volume={v}[x{i}]')
    graph += (f"[0:a]aresample=48000,asplit[voice][key];[2:a]aresample=48000,volume={VV.get('music_vol', 0.55)},volume=enable='{msil}':volume=0,afade=t=in:d=0.15[mus0];"
              f"[mus0][key]sidechaincompress=threshold=0.04:ratio=5:attack=15:release=350[mus];" + ';'.join(parts) + (';' if parts else '') +
              f"[voice][mus]{''.join(f'[x{i}]' for i in range(len(fx)))}amix=inputs={2 + len(fx)}:normalize=0:duration=first,"
              f"loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.85:level=disabled[aout]")
    tag = '_vv'
master = os.path.join(out, f'kreek_{NAME}{tag}_1080p60.mp4')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', seglist, '-loop', '1', '-i', logo] + extra_in + ['-filter_complex', graph, '-map', '[vout]', '-map', '[aout]',
                '-t', f'{DUR:.3f}', '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-r', str(FPS), '-c:a', 'aac', '-b:a', '256k',
                '-ar', '48000', '-movflags', '+faststart', '-map_metadata', '-1', master], check=True)
up = os.path.join(out, f'kreek_{NAME}{tag}_4k60.mp4')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', master, '-vf', 'scale=2160:3840:flags=lanczos,unsharp=5:5:0.6', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17',
                '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-movflags', '+faststart', up], check=True)
print('ok', round(DUR, 2), 's')
