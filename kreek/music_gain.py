"""Set a clip's background music exactly DB_UNDER dB below the speakers (user rule: music 15 dB under the voice).
Measures the integrated loudness (EBU R128) of the clip's prepped source audio (speech) and of the music file, then writes
music_gain = 10^(((speech - DB_UNDER) - music) / 20) into the props JSON.
Usage: python3 kreek/music_gain.py <props.json> <src.mp4> <music.wav> [db_under=15]"""
import json, re, subprocess, sys

props_f, src, music = sys.argv[1:4]
UNDER = float(sys.argv[4]) if len(sys.argv) > 4 else 15.0
def lufs(f):
    out = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', f, '-vn', '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True, stdin=subprocess.DEVNULL).stderr
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', out)[-1])
sp, mu = lufs(src), lufs(music)
gain = 10 ** (((sp - UNDER) - mu) / 20)
P = json.load(open(props_f)); P['music_gain'] = round(gain, 4); json.dump(P, open(props_f, 'w'), indent=1)
print(f'{P["name"]}: speech {sp:.1f} LUFS, music {mu:.1f} LUFS -> music at {sp - UNDER:.1f} LUFS (gain {gain:.3f})')
