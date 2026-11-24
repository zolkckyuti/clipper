"""Podcast audio + b-roll clip source builder (Dulude campaign: Jordan Harbinger interview audio over his own adventure footage).
Given a spec JSON:
  {"name": "gd_anx", "audio": "<podcast.mp3>",
   "segs": [["hook", 1522.1, 1525.3], ["s1", 1507.4, 1525.3], ...],          # approx podcast times (whisper segment edges)
   "shots": [["<broll.mp4>", start, end, "P"|"F"], ...]}                      # b-roll shots in order, looped to fill
it (1) snaps every audio segment to real word edges (faster-whisper small.en word timestamps on a window around it, plus a short
energy tail so the last word is never clipped), (2) concatenates the audio with 6 ms fades, (3) lays the b-roll shots over it
(crop mode P = letterboxed promo: centre image band, burned-in subtitles cropped off; F = full-frame vertical: top 1150 px,
subtitles below cropped off) -> 1080x1150 60 fps, and writes public/kreek/v2/<name>_src.mp4 + .work/gd/<name>.words.json
(word timings on the OUTPUT timeline) + the segment cuts. Usage: python3 kreek/podcast_broll.py <spec.json>"""
import json, os, subprocess, sys
import numpy as np
from faster_whisper import WhisperModel

S = json.load(open(sys.argv[1])); NAME = S['name']
os.makedirs('.work/gd', exist_ok=True); os.makedirs('public/kreek/v2', exist_ok=True)
M = WhisperModel('small.en', device='cpu', compute_type='int8', cpu_threads=4)
SR = 16000
def pcm(src, a, b):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{a:.3f}', '-to', f'{b:.3f}', '-i', src, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'],
                         capture_output=True, stdin=subprocess.DEVNULL).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768
def words(src, a, b):
    x = pcm(src, a, b); segs, _ = M.transcribe(x, word_timestamps=True, language='en')
    return [[a + w.start, a + w.end, w.word.strip()] for s in segs for w in s.words], x
def snap(t0, t1):
    W, x = words(S['audio'], max(0, t0 - 2.5), t1 + 2.5); base = max(0, t0 - 2.5)
    inside = [w for w in W if w[0] >= t0 - 0.35 and w[1] <= t1 + 0.45]
    if not inside: raise SystemExit(f'no words in {t0}-{t1}')
    a = inside[0][0] - 0.1
    prev = [w for w in W if w[1] <= inside[0][0] - 0.01]
    if prev: a = max(a, prev[-1][1] + 0.03)
    nxt = [w for w in W if w[0] >= inside[-1][1] - 0.01 and w is not inside[-1]]
    hard = nxt[0][0] - 0.05 if nxt else inside[-1][1] + 0.5
    # energy tail: extend past whisper's (often early) word end until 120 ms of quiet, never into the next word
    hop = 160; n = len(x) // hop
    db = 20 * np.log10(np.sqrt((x[:n * hop].reshape(n, hop) ** 2).mean(1)) + 1e-6); thr = np.percentile(db, 30) + 6
    i = int((inside[-1][1] - base) * SR / hop); lim = int((hard - base) * SR / hop)
    while i < min(n - 12, lim) and (db[i:i + 12] > thr).any(): i += 1
    b = min(hard, base + i * hop / SR + 0.08)
    return round(a, 3), round(b, 3), [w for w in inside]
segs, allw, o = [], [], 0.0
for sid, t0, t1 in S['segs']:
    a, b, ws = snap(t0, t1)
    for w in ws: allw.append([round(o + w[0] - a, 3), round(o + w[1] - a, 3), w[2], sid])
    segs.append([sid, a, b, round(o, 3)]); o += b - a
    print(f'{sid}: {a:.2f}-{b:.2f} ({b - a:.2f}s) | ' + ' '.join(w[2] for w in ws))
DUR = round(o, 3)
# ---- audio
parts = []
for i, (sid, a, b, _) in enumerate(segs):
    f = f'.work/gd/{NAME}_a{i}.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{a:.3f}', '-to', f'{b:.3f}', '-i', S['audio'], '-af',
                    f'afade=t=in:d=0.006,afade=t=out:st={b - a - 0.006:.3f}:d=0.006,aresample=48000', '-ac', '2', f], check=True)
    parts.append(f)
fl = f'.work/gd/{NAME}_al.txt'; open(fl, 'w').write(''.join(f"file '{os.path.abspath(p)}'\n" for p in parts))
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', fl, '-c', 'pcm_s16le', f'.work/gd/{NAME}_audio.wav'], check=True)
# ---- video: shots in order, looped, until DUR is covered
vparts, t, k = [], 0.0, 0
while t < DUR - 0.01:
    src, s0, s1, mode = S['shots'][k % len(S['shots'])]; d = min(s1 - s0, DUR - t)
    crop = 'crop=780:830:150:470,scale=1080:1150:flags=lanczos' if mode == 'P' else 'crop=1080:1150:0:25'
    f = f'.work/gd/{NAME}_v{k}.mp4'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{s0:.3f}', '-t', f'{d:.3f}', '-i', src, '-an', '-vf', f'{crop},fps=60,setsar=1',
                    '-c:v', 'libx264', '-preset', 'fast', '-crf', '14', '-pix_fmt', 'yuv420p', f], check=True)
    vparts.append(f); t += d; k += 1
fl = f'.work/gd/{NAME}_vl.txt'; open(fl, 'w').write(''.join(f"file '{os.path.abspath(p)}'\n" for p in vparts))
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', fl, '-i', f'.work/gd/{NAME}_audio.wav', '-map', '0:v', '-map', '1:a',
                '-c:v', 'libx264', '-preset', 'medium', '-crf', '15', '-pix_fmt', 'yuv420p', '-r', '60', '-g', '30', '-c:a', 'aac', '-b:a', '256k',
                '-t', f'{DUR:.3f}', '-movflags', '+faststart', f'public/kreek/v2/{NAME}_src.mp4'], check=True)
for p in parts + vparts: os.remove(p)
json.dump({'dur': DUR, 'segs': segs, 'words': allw}, open(f'.work/gd/{NAME}.words.json', 'w'), indent=1)
print('ok', NAME, DUR)
