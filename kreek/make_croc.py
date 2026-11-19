"""KreekCraft GTA 6 test clip: "the crocodile bet" (Day 1 stream, VOD v2932147800 at 11:27:30-11:29:50).
Brief (ClipLaunch Notion): KreekCraft's GTA 6 stream footage only, official logo overlay visible the WHOLE video,
true to what happened, caption 'Watch KreekCraft on YouTube and Twitch' + #GTA6 #KreekCraft #GrandTheftAutoVI, no links.
Style: VverPaldo hook + hard cut (2-frame white flash), facecam top / gameplay bottom, one-word captions.
Output: 1080x1920 60 fps master + a 2160x3840 upscale (platforms give 4K uploads a better codec/bitrate).
Usage: python3 kreek/make_croc.py <croc.mp4> <croc.words.json> <overlay.png> <out_dir>"""
import json, os, subprocess, sys

src, words_f, logo, out = sys.argv[1:5]
W = json.load(open(words_f))
# (start, end) in clip seconds; hook first, then the story in order (hook line never replayed)
SEG = [('hook', 68.25, 72.35), ('s1', 53.15, 59.15), ('s2', 72.35, 76.25), ('s3', 78.9, 83.45), ('s4', 105.15, 107.1), ('s5', 129.45, 135.8)]
MUTE = [(83.0, 83.4)]   # "oh sh*t"
FIX = {'shit.': 'sh*t.', 'shit': 'sh*t', 'chance,': 'chances,'}
TOP = 'He bet a FREE copy of GTA 6 that a crocodile can\'t get him...'
FPS = 60

# ---------------------------------------------------------------- captions (ASS), timeline = output seconds
def ts(t): h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60; return f'{h}:{m:02d}:{s:05.2f}'
ev = []; o = 0.0; cuts = []
for sid, a, b in SEG:
    ws = [w for w in W if a - 0.05 <= w[0] < b - 0.05]
    for i, (s, e, t) in enumerate(ws):
        t = FIX.get(t.lower(), t).strip(',.?!').upper()
        s0 = o + max(0, s - a); s1 = o + (ws[i + 1][0] - a if i + 1 < len(ws) else b - a)
        if s1 - s0 > 1.2: s1 = s0 + 1.2
        hl = t in ('CROCODILE', 'EATEN', 'KIDDING', 'FREE', 'GAME', 'LEG', 'BLEEDING', 'CLIP', 'RUN')
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
open(os.path.join(out, 'croc.ass'), 'w').write(ass)

# ---------------------------------------------------------------- video: one ffmpeg per segment (low memory), then join + finish
seglist = os.path.join(out, 'segs.txt'); lines = []
for i, (sid, a, b) in enumerate(SEG):
    z = 1.15 if sid in ('hook', 's2') else 1.0   # punch-in on the hook and the chaos = tighter crop
    mute = ''.join(f",volume=enable='between(t,{m0 - a:.2f},{m1 - a:.2f})':volume=0" for m0, m1 in MUTE if a <= m0 < b)
    g = (f'[0:v]fps={FPS},split[f][g];[f]crop=410:266:0:136,scale=1080:700:flags=lanczos[fc];'
         f'[g]crop={int(1058 / z)}:{int(1080 / z)}:(iw-ow)/2+40:(ih-oh)/2,scale=1080:1100:flags=lanczos,setsar=1[gp];[fc][gp]vstack,pad=1080:1920:0:120:black[v];'
         f'[0:a]aresample=48000{mute}[a]')
    f = os.path.join(out, f'seg{i}.mp4')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{a:.3f}', '-to', f'{b:.3f}', '-i', src, '-filter_complex', g, '-map', '[v]', '-map', '[a]',
                    '-c:v', 'libx264', '-preset', 'fast', '-crf', '12', '-pix_fmt', 'yuv420p', '-r', str(FPS), '-c:a', 'pcm_s16le', '-f', 'matroska', f.replace('.mp4', '.mkv')], check=True)
    lines.append(f"file '{os.path.abspath(f.replace('.mp4', '.mkv'))}'")
open(seglist, 'w').write('\n'.join(lines) + '\n')
flash = '+'.join(f'between(t,{c:.3f},{c + 2 / FPS:.3f})' for c in cuts[1:])
graph = (f"[0:v]drawbox=x=0:y=0:w=iw:h=ih:color=white@0.9:t=fill:enable='{flash}'[fv];[1:v]scale=560:-1[lg];[fv][lg]overlay=x=500:y=660:shortest=1[lv];"
         f"[lv]subtitles={os.path.join(out, 'croc.ass')}:fontsdir={os.path.abspath('.work/fonts')}[vout];[0:a]loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.85:level=disabled[aout]")
master = os.path.join(out, 'kreek_croc_1080p60.mp4')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', seglist, '-loop', '1', '-i', logo, '-filter_complex', graph, '-map', '[vout]', '-map', '[aout]',
                '-t', f'{DUR:.3f}', '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-r', str(FPS), '-c:a', 'aac', '-b:a', '256k',
                '-ar', '48000', '-movflags', '+faststart', '-map_metadata', '-1', master], check=True)
up = os.path.join(out, 'kreek_croc_4k60.mp4')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', master, '-vf', 'scale=2160:3840:flags=lanczos,unsharp=5:5:0.6', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17',
                '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-movflags', '+faststart', up], check=True)
print('ok', round(DUR, 2), 's')
