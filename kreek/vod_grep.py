"""Transcribe a long VOD audio in 10-min chunks (low memory) and print lines matching keywords as it goes.
Usage: python3 kreek/vod_grep.py <audio> <out.jsonl> <regex> [start_s] [model]"""
import json, re, subprocess, sys
import numpy as np
from faster_whisper import WhisperModel
src, out, rx = sys.argv[1:4]; start = float(sys.argv[4]) if len(sys.argv) > 4 else 0; model = sys.argv[5] if len(sys.argv) > 5 else 'base.en'
dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', src], capture_output=True, text=True).stdout)
m = WhisperModel(model, device='cpu', compute_type='int8', cpu_threads=4); R = re.compile(rx, re.I)
with open(out, 'a') as f:
    t = start
    while t < dur:
        pcm = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(t), '-t', '600', '-i', src, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True).stdout
        segs, _ = m.transcribe(np.frombuffer(pcm, np.int16).astype(np.float32) / 32768, language='en', vad_filter=True)
        for s in segs:
            f.write(json.dumps([round(t + s.start, 1), round(t + s.end, 1), s.text.strip()]) + '\n'); f.flush()
            if R.search(s.text): print(f'{t + s.start:8.1f} {s.text.strip()}', flush=True)
        print(f'-- chunk {t:.0f} done', flush=True); t += 600
