"""Find where a short clip sits inside a long VOD by cross-correlating 50 Hz log-energy envelopes of their audio.
Usage: python3 kreek/locate_clip.py <vod_audio> <clip1> [clip2 ...]   -> prints best offset (s) and match score per clip"""
import subprocess, sys
import numpy as np
SR, HOP = 8000, 160
def env(f):
    pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True).stdout
    a = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
    k = len(a) // HOP
    e = np.log(np.sqrt((a[:k * HOP].reshape(k, HOP) ** 2).mean(1)) + 1e-4)
    return e - np.convolve(e, np.ones(250) / 250, 'same')   # remove slow loudness drift
V = env(sys.argv[1])
for f in sys.argv[2:]:
    c = env(f); c = (c - c.mean()) / (c.std() + 1e-9); n = len(c)
    N = 1 << int(np.ceil(np.log2(len(V) + n)))
    corr = np.fft.irfft(np.fft.rfft(V, N) * np.conj(np.fft.rfft(c, N)), N)[:len(V) - n]
    s1 = np.convolve(V, np.ones(n), 'valid')[:len(corr)]; s2 = np.convolve(V ** 2, np.ones(n), 'valid')[:len(corr)]
    std = np.sqrt(np.maximum(s2 / n - (s1 / n) ** 2, 1e-9))
    score = corr / (n * std); i = int(np.argmax(score))
    print(f, f'offset {i * HOP / SR:.2f}s ({int(i*HOP/SR)//3600}:{int(i*HOP/SR)%3600//60:02d}:{int(i*HOP/SR)%60:02d})', f'score {score[i]:.3f}')
