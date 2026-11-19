import json, subprocess, sys
import numpy as np
from faster_whisper import WhisperModel
C = sorted(json.load(open('candidates.json')), key=lambda c: -c['score'])[:14]
m = WhisperModel('small.en', device='cpu', compute_type='int8', cpu_threads=4)
out = []
for c in C:
    a = max(0, c['t'] - 45)
    pcm = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(a), '-t', '75', '-i', 'day1_audio.mp4', '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True).stdout
    segs, _ = m.transcribe(np.frombuffer(pcm, np.int16).astype(np.float32) / 32768, word_timestamps=True, language='en', vad_filter=True)
    segs = list(segs)
    c['text'] = ' '.join(f"[{a + s.start:.0f}] {s.text.strip()}" for s in segs)
    c['words'] = [[round(a + w.start, 2), round(a + w.end, 2), w.word.strip()] for s in segs for w in s.words]
    out.append(c); print(c['hms'], c['score'], '|', c['text'][:900], flush=True)
json.dump(out, open('cand_tx.json', 'w'))
