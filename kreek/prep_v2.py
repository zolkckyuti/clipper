"""KreekCraft edit v2 prep: for one clip config, cut + join the story segments from the 1080p60 stream window into a clean
full-frame source (public/kreek/v2/<name>_src.mp4, swears muted) and write the composition props (src/kreek/v2/<name>.json):
segment cuts, words in OUTPUT time (swears starred), and the per-clip v2 directives from the config ("v2" block).
Usage: python3 kreek/prep_v2.py <clip.mp4> <clip.words.json> <clip.cfg.json>"""
import json, os, subprocess, sys

src, words_f, cfg_f = sys.argv[1:4]
W = json.load(open(words_f)); CFG = json.load(open(cfg_f)); NAME = CFG['name']
SEG = [tuple(x) for x in CFG['seg']]
SWEAR = ('fuck', 'shit', 'bitch', 'damn', 'ass', 'dick', 'hell')
def is_swear(t):
    k = t.lower().strip(',.?!')
    return any(k.startswith(x) and len(k) <= len(x) + 3 for x in SWEAR)
def star(t):
    k = t.strip(',.?!'); return k[0] + '*' * (len(k) - 2) + k[-1] if is_swear(t) and len(k) > 2 else t
MUTE = [tuple(m) for m in CFG.get('mute', [])] + [(w[0] - 0.03, w[1] + 0.03) for w in W if is_swear(w[2]) and any(a <= w[0] < b for _, a, b in SEG)]
FIX = CFG.get('fix', {})
os.makedirs('public/kreek/v2', exist_ok=True); os.makedirs('src/kreek/v2', exist_ok=True)
words, cuts, o = [], [], 0.0
parts = []
for i, (sid, a, b) in enumerate(SEG):
    for w in [w for w in W if a - 0.05 <= w[0] < b - 0.05]:
        t = star(FIX.get(w[2].lower(), w[2]))
        words.append({'t': t, 'a': round(o + max(0, w[0] - a), 3), 'b': round(o + min(b, w[1]) - a, 3), 'seg': sid})
    cuts.append({'id': sid, 'a': round(o, 3), 'b': round(o + b - a, 3), 'src': a})
    mute = ''.join(f",volume=enable='between(t,{m0 - a:.2f},{m1 - a:.2f})':volume=0" for m0, m1 in MUTE if a <= m0 < b)
    f = f'.work/kreek/v2_{NAME}_{i}.mkv'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{a:.3f}', '-to', f'{b:.3f}', '-i', src, '-vf', 'fps=60', '-af', f'aresample=48000{mute}',
                    '-c:v', 'libx264', '-preset', 'fast', '-crf', '14', '-pix_fmt', 'yuv420p', '-c:a', 'pcm_s16le', f], check=True)
    parts.append(f"file '{os.path.abspath(f)}'"); o += b - a
open('.work/kreek/v2_list.txt', 'w').write('\n'.join(parts) + '\n')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', '.work/kreek/v2_list.txt', '-c:v', 'libx264', '-preset', 'medium', '-crf', '15',
                '-pix_fmt', 'yuv420p', '-r', '60', '-g', '30', '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', f'public/kreek/v2/{NAME}_src.mp4'], check=True)
props = {'name': NAME, 'dur': round(o, 3), 'top': CFG['top'], 'cuts': cuts, 'words': words, 'hl': CFG.get('hl', []), **CFG.get('v2', {}), 'vv': CFG.get('vv', {})}
json.dump(props, open(f'src/kreek/v2/{NAME}.json', 'w'), indent=1)
print('ok', NAME, round(o, 2))
