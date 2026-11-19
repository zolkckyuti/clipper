// KreekCraft GTA 6 edit v2 (1080x1920 @ 60 fps): built to NOT look like the standard facecam-top/gameplay-bottom repost.
// Big full-height gameplay with a living facecam picture-in-picture that jumps to a big reaction cutaway on his loudest lines,
// a freeze-frame + stamp on the payoff, karaoke captions, context chip, CapCut grade, 3-frame black flicker, red/green hits,
// punch-ins, camera-flash cuts, phonk that sits low until the drop and ducks under his voice. Official logo always visible.
// Props come from src/kreek/v2/<name>.json (kreek/prep_v2.py). Source: public/kreek/v2/<name>_src.mp4.
import {loadFont} from '@remotion/fonts';
import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import croc from './v2/croc.json';
import dance from './v2/dance.json';
import gas from './v2/gas.json';
import plane from './v2/plane.json';
import scooter from './v2/scooter.json';
import swim from './v2/swim.json';

loadFont({family: 'Montserrat', url: staticFile('Montserrat-Black.woff2'), weight: '800'});
type W = {t: string; a: number; b: number; seg: string};
type P = {name: string; dur: number; top: string; cuts: {id: string; a: number; b: number}[]; words: W[]; hl: string[]; react: number[][]; freeze: [number, string];
  chip: [number, string]; drop: number; vv: {music: [string, number]; music_off?: number[][]; red?: string[]; green?: string[]; punch?: string[]; music_vol?: number}};
export const KREEK_V2: Record<string, P> = {croc, gas, swim, plane, scooter, dance} as unknown as Record<string, P>;
const FPS = 60;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const norm = (t: string) => t.replace(/[^A-Za-z0-9*']/g, '').toUpperCase();
const firstHits = (P: P, list: string[] = [], n = 1, gap = 0.6) => {
  const out: number[] = [];
  for (const w of list) P.words.filter((x) => norm(x.t) === w).slice(0, n).forEach((x) => out.push(x.a));
  return out.sort((a, b) => a - b).filter((t, i, arr) => arr.findIndex((u) => Math.abs(u - t) < gap) === i);
};
const SRC_W = 1920, SRC_H = 1080;
// gameplay window: shows source x 520..1400 (facecam lives at x 0..410), full height, scaled to 1320 px tall
const G = {top: 300, h: 1320, scale: 1320 / SRC_H};

export const KreekV2: React.FC<{clip: string}> = ({clip}) => {
  const P = KREEK_V2[clip];
  const f = useCurrentFrame(), {fps} = useVideoConfig(), s = f / fps;
  const src = staticFile(`kreek/v2/${P.name}_src.mp4`);
  const reds = firstHits(P, P.vv.red), greens = firstHits(P, P.vv.green), punches = firstHits(P, P.vv.punch, 2, 0.5);
  const cutTimes = P.cuts.slice(1).map((c) => c.a);
  // ---- freeze: picture holds 0.75 s at the payoff (audio keeps running)
  const [fz, stamp] = P.freeze; const inFreeze = s >= fz && s < fz + 0.75;
  const videoTime = inFreeze ? fz : s;
  // ---- reaction cutaway amount 0..1
  const react = P.react.reduce((m, [a, b]) => Math.max(m, interpolate(s, [a - 0.12, a + 0.05, b - 0.08, b + 0.08], [0, 1, 1, 0], clamp)), 0);
  // ---- punch-in on gameplay
  const punch = punches.reduce((m, t) => Math.max(m, interpolate(s, [t - 0.02, t + 0.05, t + 0.38, t + 0.5], [0, 1, 1, 0], clamp)), 0);
  const push = 1 + 0.04 * ((s - (P.cuts.find((c) => s >= c.a && s < c.b)?.a ?? 0)) / 4);
  const fzK = inFreeze ? spring({frame: f - Math.round(fz * fps), fps, config: {damping: 14, stiffness: 160}}) : 0;
  const gScale = G.scale * push * (1 + 0.13 * punch) * (1 + 0.32 * fzK);
  const shake = reds.some((t) => s >= t && s < t + 0.25) || (s >= fz && s < fz + 0.2) ? 10 * Math.sin(f * 2.3) : 0;
  const tint = reds.some((t) => s >= t && s < t + 0.27) ? 'rgba(244,3,5,0.28)' : greens.some((t) => s >= t && s < t + 0.27) ? 'rgba(167,234,4,0.28)' : 'transparent';
  const white = cutTimes.some((t) => s >= t && s < t + 2 / FPS) ? 0.9 : [...reds, ...greens].some((t) => s >= t && s < t + 0.05) ? 0.55 : (s >= fz && s < fz + 0.06) ? 0.8 : 0;
  const flicker = f % 3 === 0 ? 0.05 : 0;
  // ---- facecam PiP -> big reaction cutaway
  const bounce = [...reds, ...greens].reduce((m, t) => Math.max(m, interpolate(s, [t, t + 0.08, t + 0.3], [0, 1, 0], clamp)), 0);
  const camW = interpolate(react, [0, 1], [400, 900]), camH = camW * 266 / 320;
  const camX = interpolate(react, [0, 1], [36, 90]), camY = interpolate(react, [0, 1], [326, 520]);
  const camTilt = interpolate(react, [0, 1], [-2.5, 0]);
  // ---- captions: 3-word chunks, active word highlighted
  const chunks: W[][] = []; let cur: W[] = [];
  P.words.forEach((w, i) => { cur.push(w); if (/[.,!?]$/.test(w.t) || cur.length >= 3 || i === P.words.length - 1) { chunks.push(cur); cur = []; } });
  const ci = chunks.findIndex((c, i) => s >= c[0].a - 0.05 && (i === chunks.length - 1 || s < chunks[i + 1][0].a - 0.05));
  const chunk = ci >= 0 ? chunks[ci] : null;
  const hl = new Set(P.hl);
  // ---- top title: visible from frame 0
  const topWords = P.top.split(' ');
  const topK = spring({frame: f, fps, config: {damping: 12, stiffness: 200}, from: 0.9, to: 1});
  const chipK = interpolate(s, [P.chip[0], P.chip[0] + 0.25, P.chip[0] + 2.6, P.chip[0] + 2.9], [0, 1, 1, 0], clamp);
  // ---- music
  const voiceAt = (t: number) => P.words.some((w) => t >= w.a - 0.08 && t <= w.b + 0.15);
  const off = (t: number) => (P.vv.music_off ?? []).some(([a, b]) => t >= a && t < b);
  const mv = P.vv.music_vol ?? 0.7;
  const musicVol = (fr: number) => { const t = fr / FPS; if (off(t)) return 0; return (t < P.drop ? 0.4 : 1) * mv * (voiceAt(t) ? 0.42 : 1) * Math.min(1, t / 0.15, (P.dur - t) / 0.3); };
  const sfx: [string, number, number][] = [...cutTimes.map((t): [string, number, number] => ['s_camflash', t, 0.45]), ...reds.map((t): [string, number, number] => ['shock', t, 0.35]),
    ...greens.map((t): [string, number, number] => ['rizz', t, 0.32]), ...punches.map((t): [string, number, number] => ['pop', t, 0.16]),
    ...P.react.flatMap(([a, b]): [string, number, number][] => [['whoosh', a - 0.15, 0.3], ['whoosh', b - 0.1, 0.18]]), ['flash', fz, 0.45]];
  return <AbsoluteFill style={{background: 'linear-gradient(180deg,#0b0b12 0%,#141022 55%,#0b0b12 100%)', fontFamily: 'Montserrat'}}>
    {/* gameplay */}
    <div style={{position: 'absolute', left: 0, top: G.top, width: 1080, height: G.h, overflow: 'hidden', transform: `translateX(${shake}px)`}}>
      <div style={{position: 'absolute', left: 540 - 960 * gScale - 0 * gScale, top: G.h / 2 - (SRC_H / 2) * gScale, width: SRC_W * gScale, height: SRC_H * gScale,
        transform: `translateX(${-(960 - 960) * gScale}px)`}}>
        <OffthreadVideo src={src} muted startFrom={0} style={{width: '100%', height: '100%', filter: `contrast(1.1) saturate(1.25)${inFreeze ? ' brightness(1.08)' : ''}`,
          transform: `translateX(${-(960 - 960) * gScale}px)`}} {...({} as object)} />
      </div>
      <AbsoluteFill style={{background: tint}} />
      <AbsoluteFill style={{background: `rgba(0,0,0,${0.55 * react})`}} />
    </div>
    {/* freeze stamp */}
    {inFreeze && <div style={{position: 'absolute', top: 560, width: 1080, display: 'flex', justifyContent: 'center',
      transform: `rotate(-6deg) scale(${interpolate(fzK, [0, 1], [1.7, 1])})`}}>
      <div style={{background: '#F40305', color: '#fff', fontSize: 92, fontWeight: 800, padding: '10px 34px', borderRadius: 14, border: '7px solid #fff', boxShadow: '0 12px 40px rgba(0,0,0,.6)',
        maxWidth: 960, textAlign: 'center', lineHeight: 1.05}}>{stamp}</div></div>}
    {/* facecam PiP / reaction cutaway */}
    <div style={{position: 'absolute', left: camX + (1 - react) * 0, top: camY, width: camW, height: camH, borderRadius: 26, overflow: 'hidden', border: `${interpolate(react, [0, 1], [6, 8])}px solid #fff`,
      boxShadow: '0 14px 40px rgba(0,0,0,.65)', transform: `rotate(${camTilt}deg) scale(${1 + 0.08 * bounce})`, transformOrigin: 'center'}}>
      <div style={{position: 'absolute', left: -50 * (camW / 320), top: -136 * (camW / 320), width: SRC_W * (camW / 320), height: SRC_H * (camW / 320)}}>
        <OffthreadVideo src={src} muted style={{width: '100%', height: '100%', filter: 'contrast(1.06) saturate(1.15)'}} />
      </div>
    </div>
    {/* chip */}
    {chipK > 0 && <div style={{position: 'absolute', right: 34, top: 330 + (1 - chipK) * -20, opacity: chipK, display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(10,10,16,.82)',
      borderRadius: 40, padding: '12px 22px', border: '2px solid rgba(255,255,255,.2)'}}>
      <span style={{width: 16, height: 16, borderRadius: 8, background: '#ff2d2d', boxShadow: '0 0 12px #ff2d2d', opacity: f % 40 < 26 ? 1 : 0.3}} />
      <span style={{color: '#fff', fontSize: 30, fontWeight: 800, letterSpacing: 0.5}}>{P.chip[1]}</span></div>}
    {/* top title (from frame 0) */}
    <div style={{position: 'absolute', top: 40, left: 40, right: 40, height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${topK})`}}>
      <div style={{textAlign: 'center', fontSize: 62, fontWeight: 800, lineHeight: 1.12, color: '#fff', textShadow: '0 4px 14px rgba(0,0,0,.6)'}}>
        {topWords.map((w, i) => <span key={i} style={{color: /[A-Z]{3,}/.test(w.replace(/[^A-Za-z]/g, '')) && w.replace(/[^A-Za-z]/g, '') === w.replace(/[^A-Za-z]/g, '').toUpperCase() ? '#FFD400' : '#fff'}}>{w} </span>)}
      </div>
    </div>
    {/* captions */}
    {chunk && <div style={{position: 'absolute', top: 1350, left: 30, right: 30, textAlign: 'center', lineHeight: 1.08}}>
      {chunk.map((w, i) => { const on = s >= w.a - 0.04; const active = on && (i === chunk.length - 1 || s < chunk[i + 1].a - 0.04);
        const k = active ? spring({frame: f - Math.round(w.a * fps), fps, config: {damping: 10, stiffness: 260}, from: 1.25, to: 1.1}) : 1;
        return <span key={i} style={{display: 'inline-block', margin: '0 22px', fontSize: 84, fontWeight: 800, textTransform: 'uppercase', opacity: on ? 1 : 0.0,
          color: active ? (hl.has(norm(w.t)) ? '#FF3B3B' : '#FFD400') : '#fff', WebkitTextStroke: '11px #000', paintOrder: 'stroke fill', transform: `scale(${k})`,
          textShadow: '0 6px 0 rgba(0,0,0,.5)'}}>{w.t.replace(/[.,!?]$/, '')}</span>; })}
    </div>}
    {/* official logo overlay: always visible */}
    <Img src={staticFile('kreek/kreek_overlay.png')} style={{position: 'absolute', left: 540 - 330, top: 1660, width: 660}} />
    <AbsoluteFill style={{background: `rgba(0,0,0,${flicker})`}} />
    <AbsoluteFill style={{background: `rgba(255,255,255,${white})`}} />
    {/* audio */}
    <OffthreadVideo src={src} style={{display: 'none'}} volume={1} />
    <Audio src={staticFile(`kreek/music/${P.vv.music[0]}_n.wav`)} startFrom={Math.round(P.vv.music[1] * FPS)} volume={musicVol} loop />
    {sfx.filter(([, t]) => t >= 0).map(([n, t, v], i) => <Sequence key={i} from={Math.round(t * FPS)}><Audio src={staticFile(`kreek/music/${n}.mp3`)} volume={v} /></Sequence>)}
  </AbsoluteFill>;
};
