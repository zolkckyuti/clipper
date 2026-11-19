"""Find candidate 'big moments' in a long stream from its audio: per-second loudness vs. a rolling local baseline,
keep sustained spikes (screams / laughter / chaos), space them >= 4 min apart, write candidates.json.
Usage: python3 peaks.py <audio file> [n]"""
import json, subprocess, sys
import numpy as np

src = sys.argv[1]; n_out = int(sys.argv[2]) if len(sys.argv) > 2 else 30
SR = 8000
p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', src, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], stdout=subprocess.PIPE)
rms = []
while True:
    b = p.stdout.read(SR * 2 * 60)
    if not b: break
    a = np.frombuffer(b, np.int16).astype(np.float32) / 32768
    k = len(a) // SR
    rms += list(20 * np.log10(np.sqrt(np.mean(a[: k * SR].reshape(k, SR) ** 2, axis=1)) + 1e-6))
r = np.array(rms); T = len(r)
print('seconds', T)
# rolling 5-min median baseline
W = 300
base = np.array([np.median(r[max(0, i - W): i + W]) for i in range(0, T, 30)])
base = np.interp(np.arange(T), np.arange(0, T, 30), base)
ex = r - base
# sustained excess: 6 s smoothed, must stay high
sm = np.convolve(ex, np.ones(6) / 6, 'same')
score = sm + 0.5 * np.convolve(np.maximum(ex - 6, 0), np.ones(10), 'same') / 10
order = np.argsort(-score)
picked = []
for i in order:
    if score[i] < 3: break
    if all(abs(i - j) > 240 for j, _ in picked): picked.append((int(i), float(score[i])))
    if len(picked) >= n_out: break
picked.sort()
json.dump([{'t': t, 'score': round(s, 2), 'hms': f'{t // 3600}:{t % 3600 // 60:02d}:{t % 60:02d}'} for t, s in picked], open('candidates.json', 'w'), indent=1)
np.save('rms.npy', r)
for t, s in picked: print(f'{t // 3600}:{t % 3600 // 60:02d}:{t % 60:02d}  score {s:.1f}')
