"""Cartoon ASMR #2 ("tingly" rebuild after the #1 feedback: not tingly enough / bland).
What changed vs #1:
  * real binaural placement: inter-aural time difference (up to 0.65 ms) + head-shadow low-pass on the far ear + level
    difference, and MOVING sources (brush strokes / scratches sweep ear to ear), instead of plain stereo panning;
  * close-mic proximity (warm low-mid lift, airy top) and textured, irregular gestures (no two hits alike);
  * trigger STYLES from the top ASMR channels (fast nail-tapping rolls, lens brushing, crinkles, mic scratching,
    personal attention plucking, fast trigger switching). All sounds are synthesized here, no one's recordings.
Writes src/asmr/timeline2.json (picture reads it) + public/asmr/asmr2.wav. Usage: python3 asmr/make_asmr2.py"""
import json, os
import numpy as np
from scipy.signal import butter, sosfilt
import soundfile as sf

SR = 48000
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
rng = np.random.default_rng(11)
DUR = 60.0

# ------------------------------------------------------------------ timeline
TRIG = [  # id, start, end, label
    ('lens', 0.0, 5.0, 'nail tapping on your screen'), ('brush', 5.0, 10.0, 'fluffy brush on the lens'), ('crinkle', 10.0, 15.0, 'crinkly wrapper'),
    ('keys', 15.0, 20.0, 'fast jelly key tapping'), ('sand', 20.0, 25.0, 'kinetic sand cutting'), ('slime', 25.0, 30.0, 'slime poking'),
    ('candy', 30.0, 35.0, 'honeycomb crunch'), ('popit', 35.0, 40.0, 'pop it'), ('honey', 40.0, 45.0, 'sticky honey'),
    ('mic', 45.0, 50.0, 'fluffy mic scratching'), ('drops', 50.0, 55.0, 'water drops'), ('pluck', 55.0, 60.0, 'plucking away your stress')]
EV = {}
# 1 lens taps: rolls of 4 fast taps, alternating screen sides
taps = []; t = 0.45
pts = [(-0.3, -0.05), (0.3, 0.05), (-0.22, 0.22), (0.25, -0.2), (0.0, 0.1), (-0.32, 0.1), (0.3, 0.2), (0.0, -0.15)]
k = 0
while t < 4.75:
    x, y = pts[k % len(pts)]
    for j in range(4):
        taps.append([round(t + j * 0.075, 3), round(x + rng.uniform(-0.05, 0.05), 3), round(y + rng.uniform(-0.05, 0.05), 3)])
    t += 0.52; k += 1
EV['lens'] = taps
EV['brush'] = [[round(5.25 + i * 0.78, 3), 1 if i % 2 == 0 else -1] for i in range(6)]          # start, direction (+1 = L->R)
EV['crinkle'] = [[10.25, 11.65], [11.85, 13.2], [13.4, 14.8]]                                     # squeeze gestures
EV['keys'] = [round(15.3 + i * 0.13 + (0.12 if i % 6 == 5 else 0) + (i // 6) * 0.1, 3) for i in range(30)]
EV['sand'] = [20.35, 21.45, 22.55, 23.65]
EV['slime'] = [25.3, 26.45, 27.6, 28.75]
EV['candy'] = [30.3, 31.2, 32.1, 33.0, 33.9]
EV['popit'] = [round(35.25 + i * 0.17, 3) for i in range(26)]
EV['honey'] = [40.25, 44.6]
EV['mic'] = [[round(45.25 + i * 0.37, 3), -1 if i % 2 == 0 else 1] for i in range(12)]            # stroke start, ear
EV['drops'] = [round(50.3 + i * 0.5, 3) for i in range(9)]
EV['pluck'] = [55.4, 56.3, 57.2, 58.1]
NOTES = [0, 4, 7, 12, 7, 9, 4, 2, 0]

# ------------------------------------------------------------------ dsp
def bp(x, lo, hi, o=4): return sosfilt(butter(o, [lo, min(hi, SR / 2 - 100)], btype='band', fs=SR, output='sos'), x)
def lp(x, f, o=2): return sosfilt(butter(o, f, btype='low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, btype='high', fs=SR, output='sos'), x)
def N(sec): return rng.standard_normal(int(sec * SR))
def env(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-5)) * np.exp(-np.maximum(0, t - a) / max(d, 1e-5))
def modal(freqs, decays, amps, sec, jit=0.0):
    t = np.arange(int(sec * SR)) / SR; o = np.zeros_like(t)
    for f, d, a in zip(freqs, decays, amps):
        o += a * np.sin(2 * np.pi * f * (1 + jit * rng.uniform(-1, 1)) * t + rng.uniform(0, 6.3)) * np.exp(-t / d)
    return o
def chirp(f0, f1, sec, dec):
    t = np.arange(int(sec * SR)) / SR; f = f0 * (f1 / f0) ** np.minimum(1, t / sec)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / dec)
def grains(sec, rate, lo, hi, g=0.003, shape=None, cluster=1.0):
    """irregular micro-click texture; cluster>1 makes bursty (crinkle-like) timing"""
    n = int(sec * SR); o = np.zeros(n); gl = int(g * SR)
    t = 0.0
    while t < sec:
        t += rng.exponential(1 / rate) * (rng.uniform(0.05, cluster) if cluster > 1 else 1)
        p = int(t * SR)
        if p >= n - gl: break
        o[p:p + gl] += rng.uniform(0.1, 1) ** 2 * rng.standard_normal(gl) * np.exp(-np.arange(gl) / (gl / 5))
    o = bp(o, lo, hi)
    if shape is not None: o *= shape(np.arange(n) / n)
    return o
def norm(x, pk=1.0):
    m = np.max(np.abs(x)) or 1; return x / m * pk

L = np.zeros(int(DUR * SR) + SR); R = np.zeros_like(L)
def place(sig, t, gain=1.0, pan=0.0, pan_end=None):
    """binaural-ish placement; pan -1 = left ear .. +1 = right ear; pan_end sweeps (moving source)"""
    n = len(sig); i = int(t * SR)
    p = np.full(n, pan) if pan_end is None else np.linspace(pan, pan_end, n)
    # ILD: equal-power + extra cut on the far ear; ITD: far ear delayed by up to 0.65 ms; head shadow: far ear low-passed
    gl = np.cos((p + 1) * np.pi / 4) * (1 - 0.25 * np.clip(p, 0, 1)); gr = np.sin((p + 1) * np.pi / 4) * (1 - 0.25 * np.clip(-p, 0, 1))
    far = lp(sig, 3200, 2)
    mean = float(np.mean(p)); d = int(abs(mean) * 0.00065 * SR)
    sl = np.where(p > 0, far * np.clip(p, 0, 1) + sig * (1 - np.clip(p, 0, 1)), sig) * gl
    sr_ = np.where(p < 0, far * np.clip(-p, 0, 1) + sig * (1 - np.clip(-p, 0, 1)), sig) * gr
    if mean > 0: sl = np.concatenate([np.zeros(d), sl])[:n]
    elif mean < 0: sr_ = np.concatenate([np.zeros(d), sr_])[:n]
    end = min(len(L), i + n); L[i:end] += sl[: end - i] * gain; R[i:end] += sr_[: end - i] * gain

# ------------------------------------------------------------------ triggers
def nail_tap():   # acrylic nail on glass: bright click + glassy ring + finger-pad thump
    s = 0.12; n = int(s * SR)
    click = hp(N(s), 3500) * env(n, 0.0002, 0.0012) * 1.2
    ring = modal([3300, 5200, 7900], [0.012, 0.007, 0.004], [0.5, 0.35, 0.2], s, jit=0.08)
    pad = lp(N(s), 400) * env(n, 0.001, 0.008) * 0.8
    return norm(click + ring + pad, rng.uniform(0.7, 1.0))
def brush_stroke(sec=0.7):   # soft bristles dragged across the mic
    n = int(sec * SR); u = np.arange(n) / n
    shape = np.sin(np.pi * u) ** 1.2
    bristles = grains(sec, 6000, 2500, 14000, g=0.0015, shape=lambda u: np.sin(np.pi * u) ** 1.2)
    air = bp(N(sec), 300, 4000) * shape * 0.5
    return norm(bristles + air, 0.85)
def crinkle(sec):   # bursty plastic crackle, with squeeze dynamics
    burst = lambda u: (np.sin(np.pi * u) ** 0.6) * (0.55 + 0.45 * np.sin(2 * np.pi * 2.3 * u) ** 2)
    a = grains(sec, 900, 2200, 15000, g=0.0025, shape=burst, cluster=6.0)
    b = grains(sec, 300, 800, 4000, g=0.006, shape=burst, cluster=4.0) * 0.5
    return norm(a + b, 0.9)
def key_nail():   # nail on a jelly keycap: crisp clack + soft thock
    s = 0.14
    body = modal([330, 760, 1650], [0.022, 0.012, 0.006], [1, 0.45, 0.25], s, jit=0.06)
    nail = hp(N(s), 4000) * env(int(s * SR), 0.0002, 0.0015) * 1.4
    return norm(body * 0.7 + nail, rng.uniform(0.75, 1))
def sand_cut():
    sec = 0.9; o = np.zeros(int(sec * SR))
    press = grains(0.45, 3800, 1500, 12000, g=0.002, shape=lambda u: np.sin(np.pi * np.minimum(1, u)) ** 0.6)
    crumble = grains(0.45, 1300, 1200, 9000, g=0.003, shape=lambda u: np.exp(-3 * u))
    o[: len(press)] += press; o[int(0.45 * SR): int(0.45 * SR) + len(crumble)] += 0.8 * crumble
    return norm(o, 0.9)
def slime_poke():
    sec = 0.8; n = int(sec * SR); o = lp(N(sec), 700) * np.sin(np.pi * np.arange(n) / n) * 0.35
    for _ in range(40):   # wet clicks + bubble pops
        p = rng.integers(0, n - 2500)
        if rng.uniform() < 0.6: b = chirp(rng.uniform(900, 2600), rng.uniform(2800, 5200), 0.01, 0.005) * rng.uniform(0.2, 0.9)
        else: b = bp(N(0.006), 1500, 7000) * env(int(0.006 * SR), 0.0002, 0.0015) * rng.uniform(0.3, 1)
        o[p:p + len(b)] += b
    return norm(o, 0.85)
def candy_crunch():
    sec = 0.8; n = int(sec * SR); o = np.zeros(n)
    snap = hp(N(0.02), 1200) * env(int(0.02 * SR), 0.0002, 0.004) * 1.4; o[: len(snap)] += snap
    o += grains(sec, 2600, 1200, 14000, g=0.002, shape=lambda u: np.exp(-3.2 * u))
    for _ in range(14):
        p = int(rng.uniform(0.02, 0.55) * SR); m = modal([rng.uniform(2200, 6000)], [0.005], [1], 0.025); o[p:p + len(m)] += m * rng.uniform(0.2, 0.8)
    return norm(o, 0.95)
def pop():
    s = 0.12; n = int(s * SR); o = np.zeros(n)
    c = chirp(rng.uniform(800, 1100), 360, 0.025, 0.018); o[: len(c)] += c
    o += hp(N(s), 2000) * env(n, 0.0002, 0.003) * 0.9
    o += modal([560, 1250], [0.025, 0.01], [0.35, 0.2], s, jit=0.06)
    return norm(o, 0.85)
def honey(sec):
    n = int(sec * SR); t = np.arange(n) / SR
    o = lp(N(sec), 380) * (0.4 + 0.6 * np.sin(2 * np.pi * 0.6 * t) ** 2) * 0.45
    for _ in range(int(sec * 9)):   # sticky tacks / string snaps
        p = int(rng.uniform(0, sec - 0.05) * SR); b = bp(N(0.012), 700, 5000) * env(int(0.012 * SR), 0.0004, 0.003) * rng.uniform(0.2, 0.8); o[p:p + len(b)] += b
    for _ in range(int(sec * 1.6)):
        p = int(rng.uniform(0, sec - 0.2) * SR); c = chirp(rng.uniform(170, 240), rng.uniform(90, 120), 0.12, 0.05) * 0.6; o[p:p + len(c)] += c
    return norm(o, 0.8)
def mic_scratch(sec=0.33):   # nails scratching a fluffy mic cover: bursty fibrous scratch, close and boomy
    n = int(sec * SR); u = np.arange(n) / n
    fib = grains(sec, 9000, 900, 9000, g=0.002, shape=lambda u: np.sin(np.pi * u) ** 0.8)
    boom = lp(N(sec), 220) * np.sin(np.pi * u) * 0.9
    return norm(fib + boom, 0.9)
def drop(note):
    f0 = 560 * 2 ** (note / 12); s = 0.7; o = np.zeros(int(s * SR))
    b = chirp(f0, f0 * 2.2, 0.03, 0.05); o[: len(b)] += b
    r = modal([f0 * 2.2, f0 * 4.4], [0.22, 0.07], [0.35, 0.1], s); o[int(0.018 * SR):] += r[: len(o) - int(0.018 * SR)]
    return norm(o, 0.7)
def pluck():   # gentle "pluck" + soft breath-like whoosh away (no voice)
    s = 0.9; n = int(s * SR); o = np.zeros(n)
    p = bp(N(0.02), 1500, 8000) * env(int(0.02 * SR), 0.0003, 0.004); o[: len(p)] += p
    w = bp(N(0.7), 400, 3000) * np.sin(np.pi * np.arange(int(0.7 * SR)) / int(0.7 * SR)) ** 2 * 0.5; o[int(0.18 * SR): int(0.18 * SR) + len(w)] += w
    return norm(o, 0.6)

# ------------------------------------------------------------------ place
for (t, x, y) in EV['lens']: place(nail_tap(), t, 2.2, pan=float(np.clip(x * 2.6, -0.95, 0.95)))
for (t, d) in EV['brush']: place(brush_stroke(0.72), t, 1.0, pan=-0.9 * d, pan_end=0.9 * d)
for i, (a, b) in enumerate(EV['crinkle']): place(crinkle(b - a), a, 2.4, pan=[-0.7, 0.7, 0.0][i], pan_end=[0.2, -0.2, 0.0][i])
for i, t in enumerate(EV['keys']): place(key_nail(), t, 1.4, pan=float(np.sin(i * 0.9)) * 0.85)
for i, t in enumerate(EV['sand']): place(sand_cut(), t, 1.3, pan=[-0.6, 0.6][i % 2])
for i, t in enumerate(EV['slime']): place(slime_poke(), t, 1.1, pan=[0.55, -0.55][i % 2])
for i, t in enumerate(EV['candy']): place(candy_crunch(), t + 0.3, 1.9, pan=[-0.65, 0.65, -0.2, 0.4, 0.0][i])
for i, t in enumerate(EV['popit']): place(pop(), t + 0.05, 1.2, pan=-0.85 + 1.7 * ((i * 7) % 26) / 25)
place(honey(EV['honey'][1] - EV['honey'][0]), EV['honey'][0], 1.05, pan=-0.5, pan_end=0.5)
for (t, ear) in EV['mic']: place(mic_scratch(), t, 0.9, pan=0.9 * ear, pan_end=0.6 * ear)
for i, t in enumerate(EV['drops']): place(drop(NOTES[i]), t + 0.4, 0.9, pan=-0.8 + 1.6 * i / 8)
for i, t in enumerate(EV['pluck']): place(pluck(), t, 1.9, pan=[-0.4, 0.4, -0.7, 0.7][i], pan_end=[-0.95, 0.95, -0.95, 0.95][i])
# proximity: warm low-mid lift + air; very quiet room tone
mix = np.stack([L, R], 1)[: int(DUR * SR)]
for c in range(2):
    x = mix[:, c]; mix[:, c] = x + 0.35 * bp(x, 120, 380, 2) + 0.1 * hp(x, 9000, 2)
room = lp(rng.standard_normal(len(mix)), 1500) * 0.003
mix[:, 0] += room; mix[:, 1] += np.roll(room, 37) * 0.95
mix = mix / np.max(np.abs(mix)) * 0.89
os.makedirs(os.path.join(ROOT, 'public', 'asmr'), exist_ok=True)
sf.write(os.path.join(ROOT, 'public', 'asmr', 'asmr2.wav'), mix.astype(np.float32), SR)
json.dump({'dur': DUR, 'trig': [{'id': i, 'a': a, 'b': b, 'label': l} for i, a, b, l in TRIG], 'ev': EV, 'notes': NOTES},
          open(os.path.join(ROOT, 'src', 'asmr', 'timeline2.json'), 'w'), indent=1)
print('ok')
