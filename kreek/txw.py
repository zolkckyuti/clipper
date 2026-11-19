import json, subprocess, sys
import numpy as np
from faster_whisper import WhisperModel
m = WhisperModel('large-v3', device='cpu', compute_type='int8', cpu_threads=4)
pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', sys.argv[1], '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True).stdout
segs, _ = m.transcribe(np.frombuffer(pcm, np.int16).astype(np.float32) / 32768, word_timestamps=True, language='en')
W = [[round(w.start, 2), round(w.end, 2), w.word.strip()] for s in segs for w in s.words]
json.dump(W, open(sys.argv[2], 'w'))
print(' '.join(f'{t}@{a:.1f}' for a, b, t in W))
