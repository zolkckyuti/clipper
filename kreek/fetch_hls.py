"""Cut a window [a, b] (seconds) out of any HLS VOD playlist (Kick/IVS .ts or Twitch .mp4 segments) using the real cumulative
EXTINF durations, download only the needed segments in parallel, and write a clean H.264/AAC mp4 starting at a.
Usage: python3 kreek/fetch_hls.py <playlist url> <a> <b> <out.mp4>"""
import os, subprocess, sys, tempfile, urllib.request
from concurrent.futures import ThreadPoolExecutor
url, a, b, out = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), sys.argv[4]
base = url.rsplit('/', 1)[0]
get_url = lambda u, timeout=60: urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'curl/8.5.0'}), timeout=timeout).read()
pl = get_url(url).decode().split('\n')
segs, t, dur, init = [], 0.0, None, None
for l in pl:
    if l.startswith('#EXT-X-MAP:URI='): init = l.split('"')[1]
    elif l.startswith('#EXTINF:'): dur = float(l[8:].split(',')[0])
    elif l and not l.startswith('#') and dur is not None:
        segs.append((t, dur, l)); t += dur; dur = None
need = [(i, s) for i, s in enumerate(segs) if s[0] + s[1] > a and s[0] < b]
t0 = need[0][1][0]
tmp = tempfile.mkdtemp(dir=os.path.dirname(os.path.abspath(out)))
def get(x):
    i, (_, _, name) = x
    for _ in range(4):
        try:
            data = get_url(f'{base}/{name}'); open(f'{tmp}/{i:07d}', 'wb').write(data); return
        except Exception: pass
    raise SystemExit(f'failed {name}')
with ThreadPoolExecutor(12) as ex: list(ex.map(get, need))
with open(f'{tmp}/all', 'wb') as f:
    if init: f.write(get_url(f'{base}/{init}'))
    for i, _ in need: f.write(open(f'{tmp}/{i:07d}', 'rb').read())
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{a - t0:.3f}', '-i', f'{tmp}/all', '-t', f'{b - a:.3f}', '-c:v', 'libx264', '-preset', 'fast', '-crf', '14',
                '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', out], check=True)
subprocess.run(['rm', '-rf', tmp])
print(out, subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out], capture_output=True, text=True).stdout.strip())
