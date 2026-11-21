"""Make sure nobody gets cut mid-word / mid-sentence: move every segment boundary of a clip config to a real pause in the
SOURCE audio (energy-based, not whisper timings — whisper often ends a word early, e.g. "the ten-" instead of "the tension").
End: walk forward from the cut until there is >= PAUSE s of quiet (max +1.0 s, never past the source end or into the next segment
when it continues in the source). If no pause is found in that window the cut moves to the quietest 10 ms within +0.4 s (between syllables).
Starts are left alone (snap_segs already starts on a clean sentence), only nudged back to the nearest quiet frame if they land mid-word.
Usage: python3 kreek/finish_cuts.py <src.mp4> <clip.cfg.json> [pause=0.25]  (edits the cfg's seg in place, prints the changes)"""
import json, subprocess, sys
import numpy as np

src, cfg_f = sys.argv[1:3]
PAUSE = float(sys.argv[3]) if len(sys.argv) > 3 else 0.25
SR, HOP = 16000, 160                                   # 10 ms frames
pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True, stdin=subprocess.DEVNULL).stdout
a = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
n = len(a) // HOP
db = 20 * np.log10(np.sqrt(np.mean(a[: n * HOP].reshape(n, HOP) ** 2, axis=1)) + 1e-6)
floor = np.percentile(db, 10)
loud = db > max(floor + 12, np.percentile(db, 60) - 18)   # speech-ish frames
dur = n * HOP / SR
P = int(PAUSE * SR / HOP)
def quiet_run_at(i):                                    # True if frames i..i+P are all quiet
    return i + P <= n and not loud[i:i + P].any()
C = json.load(open(cfg_f))
segs = C['seg']
for idx, s in enumerate(segs):
    sid, t0, t1 = s
    t1 = min(t1, dur - 0.02)
    nxt = segs[idx + 1][1] if idx + 1 < len(segs) and segs[idx + 1][1] >= t1 - 0.05 else None   # next seg continues in the source
    cap = min(dur - 0.02, t1 + 1.0, nxt if nxt is not None else 1e9)
    i = min(n - 1, int(t1 * SR / HOP)); lim = min(n, int(cap * SR / HOP))
    if loud[max(0, i - 3):i + 1].any():                 # cut lands in/at the tail of speech -> find the end of this phrase
        j = i
        while j < lim and not quiet_run_at(j): j += 1
        new1 = min(cap, j * HOP / SR + 0.12) if j < lim else (min(lim - 1, i + int(0.4 * SR / HOP)) * 0 + (i + int(np.argmin(db[i:min(lim, i + 40)]))) * HOP / SR if lim > i else t1)
    else:
        new1 = t1
    i0 = int(t0 * SR / HOP)
    new0 = t0
    if 0 < i0 < n and loud[i0] and loud[max(0, i0 - 15):i0].all():   # starts mid-word -> back to the quietest frame within 0.4 s
        lo = max(0, i0 - 40); new0 = (lo + int(np.argmin(db[lo:i0]))) * HOP / SR
    if abs(new0 - t0) > 0.01 or abs(new1 - s[2]) > 0.01:
        print(f'{C["name"]} {sid}: {t0:.2f}-{s[2]:.2f} -> {new0:.2f}-{new1:.2f}')
    s[1], s[2] = round(new0, 2), round(new1, 2)
json.dump(C, open(cfg_f, 'w'), indent=1)
print(C['name'], 'dur', round(sum(x[2] - x[1] for x in segs), 2))
