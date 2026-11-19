"""Cartoon ASMR #1: the timeline (single source of truth for picture AND sound) + every sound, synthesized here.
No music, no meme sounds: close-mic'd tingle sounds only (taps, slices, crunch, squish, pops, pours, drops),
panned left/right for the binaural feel, over a very quiet room tone.
Writes src/asmr/timeline.json and public/asmr/asmr1.wav (48 kHz stereo, ~-16 LUFS before the final master).
Usage: python3 asmr/make_asmr.py"""
import json, os
import numpy as np
from scipy.signal import butter, sosfilt

SR = 48000
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
rng = np.random.default_rng(7)
DUR = 60.0

# ------------------------------------------------------------------ timeline (seconds)
SEG = [('jelly', 0.0, 6.6), ('sand', 6.6, 12.6), ('keys', 12.6, 18.6), ('popit', 18.6, 24.6), ('soap', 24.6, 30.6),
       ('slime', 30.6, 36.6), ('honey', 36.6, 42.6), ('candy', 42.6, 48.6), ('drops', 48.6, 55.4), ('finale', 55.4, DUR)]
EV = {
    'jellyCuts': [0.95, 1.65, 2.35, 3.05, 3.75],          # knife touches top -> board at +0.22
    'jellyTips': [4.45, 4.75, 5.05, 5.35, 5.65, 5.95],
    'sandCuts': [7.0, 8.05, 9.1, 10.15, 11.2],            # 0.55 s press each, crumble after
    'keys': [round(12.85 + i * 0.3 + (0.04 if i % 4 == 3 else 0), 3) for i in range(18)],
    'pops': [round(18.85 + i * 0.24, 3) for i in range(20)],
    'carves': [25.0, 26.4, 27.8, 29.2],                   # 1.05 s scrape each
    'slime': [31.0, 32.45, 33.9, 35.35],                  # press 0.5 s, lift/stretch 0.7 s
    'honey': [36.85, 41.4],                               # pour start / end
    'candy': [43.0, 44.25, 45.5, 46.75],
    'drops': [round(48.95 + i * 0.55, 3) for i in range(9)],
    'reform': [56.0, 57.4],
}
DROP_NOTES = [0, 2, 4, 7, 9, 12, 9, 7, 12]               # pentatonic steps per drop (bowl index = note)

# ------------------------------------------------------------------ dsp helpers
def bp(x, lo, hi, order=4):
    return sosfilt(butter(order, [lo, hi], btype='band', fs=SR, output='sos'), x)
def lp(x, f, order=4):
    return sosfilt(butter(order, f, btype='low', fs=SR, output='sos'), x)
def hp(x, f, order=4):
    return sosfilt(butter(order, f, btype='high', fs=SR, output='sos'), x)
def env(n, a, d, shape=1.0):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / max(d, 1e-4))
    return e ** shape
def noise(sec):
    return rng.standard_normal(int(sec * SR))
def modal(freqs, decays, amps, sec, jitter=0.0):
    t = np.arange(int(sec * SR)) / SR
    out = np.zeros_like(t)
    for f, d, a in zip(freqs, decays, amps):
        f = f * (1 + jitter * rng.uniform(-1, 1))
        out += a * np.sin(2 * np.pi * f * t + rng.uniform(0, 6.28)) * np.exp(-t / d)
    return out
def chirp(f0, f1, sec, decay):
    t = np.arange(int(sec * SR)) / SR
    f = f0 * (f1 / f0) ** np.minimum(1, t / sec)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / decay)
def grains(sec, rate, lo, hi, gdur=0.004, envf=None):
    """crunchy/granular texture: `rate` tiny filtered clicks per second"""
    n = int(sec * SR); out = np.zeros(n); g = int(gdur * SR)
    k = rng.poisson(rate * sec)
    for _ in range(k):
        p = rng.integers(0, max(1, n - g)); amp = rng.uniform(0.2, 1.0) ** 2
        out[p:p + g] += amp * rng.standard_normal(g) * np.exp(-np.arange(g) / (g / 4))
    out = bp(out, lo, hi)
    if envf is not None: out *= envf(np.arange(n) / n)
    return out

L = np.zeros(int(DUR * SR)); R = np.zeros(int(DUR * SR))
def put(sig, t, gain=1.0, pan=0.0):
    """pan -1 = left, +1 = right (equal power)"""
    i = int(t * SR); sig = sig[: max(0, len(L) - i)]
    a = (pan + 1) * np.pi / 4
    L[i:i + len(sig)] += sig * gain * np.cos(a); R[i:i + len(sig)] += sig * gain * np.sin(a)

def norm(x, peak=1.0):
    m = np.max(np.abs(x)) or 1; return x / m * peak

# ------------------------------------------------------------------ sounds
def jelly_slice():
    n = int(0.42 * SR)
    swish = bp(noise(0.42), 2500, 8000) * env(n, 0.04, 0.09)
    wet = bp(noise(0.42), 900, 3200) * env(n, 0.01, 0.05) * (1 + 0.6 * np.sin(np.arange(n) / SR * 2 * np.pi * 38))
    sq = np.zeros(n); sq[: int(0.3 * SR)] = lp(noise(0.3), 700) * env(int(0.3 * SR), 0.02, 0.08)
    out = 0.18 * swish + 0.6 * wet + 0.55 * sq
    tap = modal([170, 420, 1300], [0.05, 0.02, 0.006], [0.7, 0.3, 0.15], 0.25) * 0.6     # blade meets the board
    out[int(0.22 * SR):int(0.22 * SR) + len(tap)] += tap[: n - int(0.22 * SR)]
    return norm(out, 0.9)
def jelly_plop():
    a = lp(noise(0.3), 1400) * env(int(0.3 * SR), 0.005, 0.05)
    b = np.zeros_like(a); c = chirp(300, 150, 0.16, 0.045); b[: len(c)] = c
    return norm(a * 0.7 + b * 0.5, 0.8)
def sand_cut():
    sec = 0.95
    press = grains(0.55, 2600, 1800, 9000, envf=lambda u: np.sin(np.pi * np.minimum(1, u)) ** 0.7)
    crumble = grains(0.4, 900, 1500, 7000, envf=lambda u: np.exp(-3 * u))
    out = np.zeros(int(sec * SR)); out[: len(press)] += press; out[int(0.55 * SR): int(0.55 * SR) + len(crumble)] += 0.7 * crumble
    out += 0.15 * lp(noise(sec), 400) * env(len(out), 0.2, 0.3)
    return norm(out, 0.85)
def key_thock(i):
    sec = 0.22
    body = modal([260, 610, 1450, 2900], [0.03, 0.018, 0.008, 0.004], [1.0, 0.5, 0.35, 0.2], sec, jitter=0.04)
    click = bp(noise(sec), 2500, 9000) * env(int(sec * SR), 0.0005, 0.004)
    rel = np.zeros(int(sec * SR)); r = modal([700, 1900], [0.01, 0.004], [0.4, 0.2], 0.05, jitter=0.05); p = int(0.12 * SR); rel[p:p + len(r)] = r
    return norm(body + 0.5 * click + 0.6 * rel, 0.8 + 0.1 * rng.uniform())
def pop_it():
    sec = 0.16
    tone = chirp(900 * rng.uniform(0.9, 1.1), 380, 0.03, 0.02)
    out = np.zeros(int(sec * SR)); out[: len(tone)] += tone
    out += bp(noise(sec), 1200, 6000) * env(int(sec * SR), 0.0004, 0.006) * 0.8
    out += modal([520, 1180], [0.03, 0.012], [0.4, 0.2], sec, jitter=0.05)
    return norm(out, 0.85)
def soap_carve():
    sec = 1.15; n = int(sec * SR)
    t = np.arange(n) / SR
    stick = (np.sin(2 * np.pi * (70 + 30 * np.sin(2 * np.pi * 1.3 * t)) * t) > 0.6).astype(float)   # stick-slip bursts
    scrape = bp(noise(sec), 2200, 8000) * (0.35 + 0.65 * stick) * np.sin(np.pi * np.minimum(1, t / sec)) ** 0.6
    curl = grains(sec, 500, 3000, 10000, envf=lambda u: u)
    return norm(scrape + 0.4 * curl, 0.75)
def soap_curl_fall():
    return norm(modal([900, 2100], [0.01, 0.004], [0.6, 0.3], 0.06) + 0.3 * bp(noise(0.06), 2000, 6000) * env(int(0.06 * SR), 0.001, 0.01), 0.4)
def slime_press():
    sec = 0.6; n = int(sec * SR)
    base = lp(noise(sec), 900) * np.sin(np.pi * np.minimum(1, np.arange(n) / n)) * 0.6
    out = base.copy()
    for _ in range(26):   # tiny trapped-air bubbles
        p = rng.integers(0, n - 2000); b = chirp(rng.uniform(900, 2400), rng.uniform(2600, 4200), 0.012, 0.006) * rng.uniform(0.2, 0.8)
        out[p:p + len(b)] += b
    return norm(out, 0.8)
def slime_stretch():
    sec = 0.75; n = int(sec * SR); out = 0.25 * lp(noise(sec), 600) * env(n, 0.1, 0.25)
    for k in range(9):    # sticky tacks as strands let go
        p = int((0.08 + k * 0.07 + rng.uniform(0, 0.03)) * SR); b = bp(noise(0.02), 600, 3500) * env(int(0.02 * SR), 0.0005, 0.004) * rng.uniform(0.4, 1)
        out[p:p + len(b)] += b
    return norm(out, 0.7)
def honey_pour(sec):
    n = int(sec * SR); t = np.arange(n) / SR
    stream = lp(noise(sec), 500) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.7 * t) ** 2) * np.minimum(1, t / 0.3) * np.minimum(1, (sec - t) / 0.3)
    out = 0.6 * stream
    for k in range(int(sec * 2.2)):   # slow plops
        p = int(rng.uniform(0.2, sec - 0.3) * SR); c = chirp(rng.uniform(180, 260), rng.uniform(90, 130), 0.12, 0.05) * rng.uniform(0.4, 0.9)
        out[p:p + len(c)] += c
    return norm(out, 0.7)
def candy_crunch():
    sec = 0.9; n = int(sec * SR)
    crack = hp(noise(0.03), 1500) * env(int(0.03 * SR), 0.0003, 0.006)
    out = np.zeros(n); out[: len(crack)] += crack * 1.2
    out += grains(sec, 1400, 1500, 11000, envf=lambda u: np.exp(-4 * u))
    for k in range(10):
        p = int(rng.uniform(0.05, 0.6) * SR); m = modal([rng.uniform(1800, 4500)], [0.006], [0.5], 0.03); out[p:p + len(m)] += m * rng.uniform(0.3, 1)
    return norm(out, 0.9)
def water_drop(note):
    f0 = 520 * 2 ** (note / 12)
    sec = 0.6; out = np.zeros(int(sec * SR))
    blip = chirp(f0, f0 * 2.1, 0.035, 0.05); out[: len(blip)] += blip
    ring = modal([f0 * 2.1, f0 * 4.3], [0.18, 0.06], [0.35, 0.1], sec)
    out[int(0.02 * SR):] += ring[: len(out) - int(0.02 * SR)]
    out += 0.2 * bp(noise(sec), 3000, 9000) * env(len(out), 0.0005, 0.01)
    return norm(out, 0.75)
def reform_whoosh():
    sec = 1.0; n = int(sec * SR); t = np.arange(n) / SR
    s = bp(noise(sec), 600, 2600) * np.sin(np.pi * t / sec) ** 2
    return norm(s, 0.35)

# ------------------------------------------------------------------ place everything
for i, t in enumerate(EV['jellyCuts']): put(jelly_slice(), t - 0.05, 0.7, pan=[-0.5, 0.5][i % 2])
for i, t in enumerate(EV['jellyTips']): put(jelly_plop(), t + 0.18, 0.75, pan=-0.6 + i * 0.24)
for i, t in enumerate(EV['sandCuts']): put(sand_cut(), t, 0.9, pan=[-0.55, 0.55][i % 2])
for i, t in enumerate(EV['keys']): put(key_thock(i), t, 0.75, pan=-0.7 + 1.4 * ((i * 5) % 18) / 17)
for i, t in enumerate(EV['pops']): put(pop_it(), t + 0.06, 0.7, pan=-0.7 + 1.4 * (i % 5) / 4)
for i, t in enumerate(EV['carves']):
    put(soap_carve(), t, 0.85, pan=[-0.5, 0.5][i % 2])
    put(soap_curl_fall(), t + 1.25, 0.6, pan=[-0.3, 0.3][i % 2])
for i, t in enumerate(EV['slime']):
    put(slime_press(), t, 0.85, pan=[-0.45, 0.45][i % 2]); put(slime_stretch(), t + 0.55, 0.75, pan=[0.3, -0.3][i % 2])
put(honey_pour(EV['honey'][1] - EV['honey'][0]), EV['honey'][0], 0.8, pan=0.0)
for i, t in enumerate(EV['candy']): put(candy_crunch(), t + 0.32, 0.9, pan=[-0.5, 0.5][i % 2])
for i, t in enumerate(EV['drops']): put(water_drop(DROP_NOTES[i]), t + 0.42, 0.7, pan=-0.75 + 1.5 * i / 8)
for t in EV['reform']: put(reform_whoosh(), t - 0.4, 0.6)
put(jelly_plop(), EV['reform'][1] + 0.5, 0.5)
room = lp(rng.standard_normal(len(L)), 1800) * 0.004
L += room; R += room * 0.9
mix = np.stack([L, R], 1); mix = mix / np.max(np.abs(mix)) * 0.89
os.makedirs(os.path.join(ROOT, 'public', 'asmr'), exist_ok=True)
import soundfile as sf
sf.write(os.path.join(ROOT, 'public', 'asmr', 'asmr1.wav'), mix.astype(np.float32), SR)
json.dump({'dur': DUR, 'seg': [{'id': s, 'a': a, 'b': b} for s, a, b in SEG], 'ev': EV, 'dropNotes': DROP_NOTES},
          open(os.path.join(ROOT, 'src', 'asmr', 'timeline.json'), 'w'), indent=1)
print('ok', len(L) / SR, 's')
