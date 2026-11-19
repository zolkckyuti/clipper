"""Speaker framing for the YoungLA interview shots: for each scene window, sample the source at 10 fps, mark frames that look
like the interview two-shot (close to a reference frame), and pick the talking side by mouth-area motion (left face vs right face).
Prints crops [(t, x, zoom, y)] per scene with >= 0.9 s holds; non-interview frames keep a centre crop.
Usage: python3 speakers_bb.py <video> <ref_time> <a> <b> [<a> <b> ...]"""
import subprocess, sys
import numpy as np

THR = float(__import__('os').environ.get('THR', 22))
src, ref = sys.argv[1], float(sys.argv[2]); wins = list(zip(map(float, sys.argv[3::2]), map(float, sys.argv[4::2])))
W, H = 192, 108
def frames(a, b, fps=10):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(a), '-to', str(b), '-i', src, '-vf', f'fps={fps},scale={W}:{H},format=gray', '-f', 'rawvideo', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
R = frames(ref, ref + 0.1)[0]
# face/mouth boxes in the 192x108 thumbnail (hosts sit at x~0.28 and x~0.75 of the frame, mouths ~45 % down)
LBOX, RBOX = (slice(40, 62), slice(38, 70)), (slice(40, 62), slice(128, 160))
LEFT, RIGHT, CENTRE = (560, 1.25, 470), (1400, 1.25, 470), (960, 1.0, 540)
for a, b in wins:
    F = frames(a, b)
    inter = [float(np.mean(np.abs(f - R))) < THR for f in F]
    d = np.abs(np.diff(F, axis=0))
    ml = np.array([d[i][LBOX].mean() for i in range(len(d))]); mr = np.array([d[i][RBOX].mean() for i in range(len(d))])
    k = np.ones(6) / 6; ml, mr = np.convolve(ml, k, 'same'), np.convolve(mr, k, 'same')
    crops, last, since = [], None, 99
    for i in range(len(d)):
        t = a + i / 10
        want = (LEFT if ml[i] > mr[i] * 1.15 else RIGHT if mr[i] > ml[i] * 1.15 else (last or LEFT)) if inter[i] else CENTRE
        if want != last and (since >= 9 or last is None or want == CENTRE or last == CENTRE):
            crops.append((round(t, 2), *want)); last, since = want, 0
        else: since += 1
    print(f'{a}-{b}:', crops)
