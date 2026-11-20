"""Snap a clip's segment cuts to where the streamer actually stops/starts talking, so no line is cut off mid-sentence
(whisper word timings often drop the last word of a phrase — e.g. "or black?" when he said "or black jacket").
For every segment [a, b]: run Silero VAD (faster-whisper) on the source audio around it; if a cut lands inside speech, move the
start back to that speech run's onset and the end forward to its offset (+ small pad), within max_ext seconds. Then re-transcribe
each final segment window on its own with large-v3 (word timestamps) and write <clip>.words.json in SOURCE time for prep_v2.
Usage: python3 kreek/snap_segs.py <src.mp4> <clip.cfg.json> <out_words.json> [max_ext=4]"""
import json, subprocess, sys
import numpy as np
from faster_whisper import WhisperModel
from faster_whisper.vad import VadOptions, get_speech_timestamps

src, cfg_f, out_w = sys.argv[1:4]
MAX_EXT = float(sys.argv[4]) if len(sys.argv) > 4 else 4.0
SR = 16000
pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True).stdout
A = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
# speech runs over the whole source window (short silences split runs so we can cut in natural pauses)
runs = [(r['start'] / SR, r['end'] / SR) for r in get_speech_timestamps(A, VadOptions(threshold=0.45, min_silence_duration_ms=280, speech_pad_ms=60))]
def inside(t):
    return next(((s, e) for s, e in runs if s < t < e), None)
C = json.load(open(cfg_f))
new = []
starts = [x[1] for x in C['seg']]; ends = [x[2] for x in C['seg']]
for sid, a, b in C['seg']:
    r = inside(a)   # don't pull a start back over a cut that another segment ends on (deliberate split)
    if r and a - r[0] <= MAX_EXT and not any(abs(e - a) < 0.35 for e in ends): a = max(0.0, r[0] - 0.05)
    r = inside(b)   # don't push an end over a cut that another segment starts on
    if r and r[1] - b <= MAX_EXT and not any(abs(st - b) < 0.35 for st in starts): b = r[1] + 0.12
    new.append([sid, round(a, 2), round(b, 2)])
    print(f'{sid}: {a:.2f}-{b:.2f}')
C['seg'] = new
json.dump(C, open(cfg_f, 'w'), indent=1)
# re-transcribe each segment window on its own (catches words whisper dropped in the long-form pass)
m = WhisperModel('large-v3', device='cpu', compute_type='int8', cpu_threads=4)
W = []
for sid, a, b in new:
    seg = A[int(a * SR): int(b * SR)]
    out, _ = m.transcribe(seg, word_timestamps=True, language='en', vad_filter=False, condition_on_previous_text=False)
    ws = [[round(a + w.start, 2), round(a + w.end, 2), w.word.strip()] for s in out for w in s.words]
    W += ws
    print(sid, ' '.join(w[2] for w in ws))
W.sort()
json.dump(W, open(out_w, 'w'))
