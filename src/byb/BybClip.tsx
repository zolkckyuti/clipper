// Backyard Breaks pull clip (1080x1920 @ 60 fps) — VverPaldo / KreekV2 energy for VERTICAL Whatnot recordings
// (host cam on top, card table below). Built for the ClipHouse SOP: price on screen with the tracker's exact value,
// first 3 s = reaction/tension, hosts' real audio kept (phonk ducked under it), one moment per clip, card never covered.
// Look: CapCut grade + 3-frame flicker, punch-ins on key words, zoom INTO the hosts' reactions (react windows) and onto the
// card (card windows), cut flashes, red/green hit tints, pop-up bubbles, freeze + stamp on the reveal, FAHH / boom sfx.
// Props come from src/kreek/v2/<name>.json (kreek/prep_v2.py, same pipeline as the GTA clips) + a "byb" block.
import {loadFont} from '@remotion/fonts';
import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import clark from '../kreek/v2/byb_clark.json';
import dart from '../kreek/v2/byb_dart.json';
import flagg from '../kreek/v2/byb_flagg.json';
import starwars from '../kreek/v2/byb_starwars.json';

loadFont({family: 'Montserrat', url: staticFile('Montserrat-Black.woff2'), weight: '800'});
type W = {t: string; a: number; b: number};
type P = {name: string; dur: number; top: string; cuts: {a: number; b: number}[]; words: W[]; hl: string[]; react: number[][]; freeze: [number, string];
  drop: number; pops?: [number, string][]; src_wh?: [number, number];
  byb: {price: string; rarity: string; price_at: number; face_y: number; card_y: number; hook_y?: number; cap_y?: number; price_y?: number; cards?: number[][]; fahh?: number[]; boom?: number[]};
  vv: {music: [string, number]; red?: string[]; green?: string[]; punch?: string[]; music_vol?: number}};
export const BYB: Record<string, P> = {byb_clark: clark, byb_dart: dart, byb_flagg: flagg, byb_starwars: starwars} as unknown as Record<string, P>;
const FPS = 60;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const norm = (t: string) => t.replace(/[^A-Za-z0-9*'$]/g, '').toUpperCase();
const hits = (P: P, list: string[] = [], n = 1, gap = 0.6) => {
  const out: number[] = [];
  for (const w of list) P.words.filter((x) => norm(x.t) === w).slice(0, n).forEach((x) => out.push(x.a));
  return out.sort((a, b) => a - b).filter((t, i, arr) => arr.findIndex((u) => Math.abs(u - t) < gap) === i);
};
const win = (s: number, ws: number[][], ramp = 0.18) => ws.reduce((m, [a, b]) => Math.max(m, interpolate(s, [a - ramp, a, b - ramp, b], [0, 1, 1, 0], clamp)), 0);

export const BybClip: React.FC<{clip: string; music?: boolean}> = ({clip, music = true}) => {
  const P = BYB[clip], Y = P.byb;
  const [SW, SH] = P.src_wh ?? [1080, 1920];
  const f = useCurrentFrame(), {fps} = useVideoConfig(), s = f / fps;
  const reds = hits(P, P.vv.red), greens = hits(P, P.vv.green), punches = hits(P, P.vv.punch, 2, 0.5);
  const cutTimes = P.cuts.slice(1).map((c) => c.a);
  const [fz, stamp] = P.freeze; const inFreeze = s >= fz && s < fz + 0.9;
  const fzK = inFreeze ? spring({frame: f - Math.round(fz * fps), fps, config: {damping: 14, stiffness: 160}}) : 0;
  // ---- camera: slow push per cut, punch on key words, zoom into reactions (face_y) or the card (card_y)
  const segA = P.cuts.find((c) => s >= c.a && s < c.b)?.a ?? 0;
  const push = 1 + 0.035 * (s - segA) / 3;
  const punch = punches.reduce((m, t) => Math.max(m, interpolate(s, [t - 0.02, t + 0.05, t + 0.38, t + 0.5], [0, 1, 1, 0], clamp)), 0);
  const faceK = win(s, P.react), cardK = win(s, Y.cards ?? []);
  const zoom = push * (1 + 0.1 * punch) * (1 + 0.55 * faceK) * (1 + 0.35 * cardK) * (1 + 0.15 * fzK);
  const oy = cardK > faceK ? Y.card_y : faceK > 0 ? Y.face_y : 0.5;   // zoom origin (fraction of frame height)
  const shake = reds.some((t) => s >= t && s < t + 0.25) || (s >= fz && s < fz + 0.2) ? 9 * Math.sin(f * 2.3) : 0;
  const tint = reds.some((t) => s >= t && s < t + 0.27) ? 'rgba(244,3,5,0.25)' : greens.some((t) => s >= t && s < t + 0.27) ? 'rgba(40,220,90,0.25)' : 'transparent';
  const white = cutTimes.some((t) => s >= t && s < t + 2 / FPS) ? 0.85 : [...reds, ...greens].some((t) => s >= t && s < t + 0.05) ? 0.5 : (s >= fz && s < fz + 0.06) ? 0.8 : 0;
  const flicker = f % 3 === 0 ? 0.05 : 0;
  // ---- captions (2–3 word chunks, active word yellow / red for key words), cleared 0.7 s after the last word
  const chunks: W[][] = []; let cur: W[] = [];
  P.words.forEach((w, i) => { cur.push(w); const nx = P.words[i + 1]; if (/[.,!?]$/.test(w.t) || cur.length >= 3 || !nx || nx.a - w.b > 0.5) { chunks.push(cur); cur = []; } });
  const ci = chunks.findIndex((c, i) => s >= c[0].a - 0.05 && (i === chunks.length - 1 || s < chunks[i + 1][0].a - 0.05));
  const chunk = ci >= 0 && s <= chunks[ci][chunks[ci].length - 1].b + 0.7 ? chunks[ci] : null;
  const hl = new Set(P.hl);
  // ---- price badge
  const pk = s >= Y.price_at ? spring({frame: f - Math.round(Y.price_at * fps), fps, config: {damping: 11, stiffness: 190}}) : 0;
  const pricePulse = 1 + 0.06 * Math.max(0, Math.sin(s * 5)) * (s - Y.price_at < 2 ? 1 : 0.3);
  // ---- music: phonk under the hosts (ducked hard on speech), drop at the reveal
  const voiceAt = (t: number) => P.words.some((w) => t >= w.a - 0.08 && t <= w.b + 0.15);
  const mv = P.vv.music_vol ?? 0.5;
  const musicVol = (fr: number) => { const t = fr / FPS; return (t < P.drop ? 0.45 : 1) * mv * (voiceAt(t) ? 0.32 : 1) * Math.min(1, t / 0.15, (P.dur - t) / 0.3); };
  const sfx: [string, number, number][] = [...cutTimes.map((t): [string, number, number] => ['kreek/music/s_camflash.mp3', t, 0.4]),
    ...reds.map((t): [string, number, number] => ['kreek/music/shock.mp3', t, 0.32]), ...greens.map((t): [string, number, number] => ['kreek/music/rizz.mp3', t, 0.3]),
    ...punches.map((t): [string, number, number] => ['kreek/music/pop.mp3', t, 0.15]), ['kreek/music/flash.mp3', fz, 0.45],
    ...(P.pops ?? []).map(([t]): [string, number, number] => ['kreek/music/pop.mp3', t, 0.3]),
    ...(Y.fahh ?? []).map((t): [string, number, number] => ['byb/sfx_fahh.mp3', t, 0.5]), ...(Y.boom ?? []).map((t): [string, number, number] => ['kreek/music/shock.mp3', t, 0.45]),
    ['kreek/music/whoosh.mp3', Y.price_at - 0.1, 0.3]];
  const vw = 1080, vh = 1080 * SH / SW;
  return <AbsoluteFill style={{background: '#000', fontFamily: 'Montserrat', overflow: 'hidden'}}>
    {/* footage (full 9:16) */}
    <AbsoluteFill style={{transform: `translateX(${shake}px)`}}>
      <div style={{position: 'absolute', left: 0, top: (1920 - vh) / 2, width: vw, height: vh, transform: `scale(${zoom})`, transformOrigin: `540px ${oy * vh}px`}}>
        <OffthreadVideo src={staticFile(`kreek/v2/${P.name}_src.mp4`)} muted style={{width: '100%', height: '100%', filter: `contrast(1.1) saturate(1.22)${inFreeze ? ' brightness(1.08)' : ''}`}} />
      </div>
      <AbsoluteFill style={{background: tint}} />
    </AbsoluteFill>
    {/* hook (top, from frame 0) */}
    <div style={{position: 'absolute', top: Y.hook_y ?? 560, left: 36, right: 36, textAlign: 'center', fontSize: 62, fontWeight: 800, lineHeight: 1.08, color: '#fff', textTransform: 'uppercase',
      WebkitTextStroke: '12px #000', paintOrder: 'stroke fill', transform: `scale(${spring({frame: f, fps, from: 0.88, to: 1, config: {damping: 12, stiffness: 200}})})`}}>
      {P.top.split(' ').map((w, i) => <span key={i} style={{color: /\$|1\/1|ONLY|ONE/.test(w) || hl.has(norm(w)) ? '#FFE135' : '#fff'}}>{w} </span>)}</div>
    {/* price badge — tracker value, never over the card */}
    {pk > 0 && <div style={{position: 'absolute', left: 0, width: 1080, top: Y.price_y ?? 1600, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${(0.4 + 0.6 * pk) * pricePulse})`}}>
      <div style={{background: 'linear-gradient(180deg,#2BE36B,#11A848)', color: '#fff', fontSize: 104, fontWeight: 800, padding: '4px 40px 8px', borderRadius: 28, border: '7px solid #fff',
        WebkitTextStroke: '6px #063d1a', paintOrder: 'stroke fill', boxShadow: '0 16px 50px rgba(0,0,0,.6)'}}>{Y.price}</div>
      <div style={{marginTop: 14, background: '#111', color: '#FFE135', fontSize: 40, fontWeight: 800, padding: '8px 24px', borderRadius: 16, letterSpacing: 1}}>{Y.rarity}</div>
    </div>}
    {/* pop-ups */}
    {(P.pops ?? []).map(([t, txt], k) => s >= t && s < t + 1.5 && <div key={k} style={{position: 'absolute', top: (Y.cap_y ?? 800) + 150 + (k % 2) * 110, ...(k % 2 ? {left: 36} : {right: 36}), maxWidth: 640,
      transform: `rotate(${k % 2 ? -3 : 3}deg) scale(${spring({frame: Math.round((s - t) * FPS), fps: FPS, from: 0.3, to: 1, config: {damping: 10, stiffness: 240}})})`,
      opacity: interpolate(s, [t + 1.3, t + 1.5], [1, 0], clamp)}}>
      <div style={{background: '#fff', color: '#111', fontSize: 50, fontWeight: 800, padding: '12px 28px', borderRadius: 24, border: '5px solid #111', boxShadow: '0 12px 30px rgba(0,0,0,.55)', lineHeight: 1.1, textAlign: 'center'}}>{txt}</div></div>)}
    {/* freeze stamp */}
    {inFreeze && <div style={{position: 'absolute', top: 820, left: 0, width: 1080, display: 'flex', justifyContent: 'center', transform: `rotate(-6deg) scale(${interpolate(fzK, [0, 1], [1.7, 1])})`}}>
      <div style={{background: '#F40305', color: '#fff', fontSize: 86, fontWeight: 800, padding: '10px 34px', borderRadius: 14, border: '7px solid #fff', boxShadow: '0 12px 40px rgba(0,0,0,.6)', textAlign: 'center', lineHeight: 1.05, maxWidth: 980}}>{stamp}</div></div>}
    {/* captions — middle, between host cam and card */}
    {chunk && <div style={{position: 'absolute', top: Y.cap_y ?? 800, left: 30, right: 30, textAlign: 'center', lineHeight: 1.08}}>
      {chunk.map((w, i) => { const on = s >= w.a - 0.04; const active = on && (i === chunk.length - 1 || s < chunk[i + 1].a - 0.04);
        const k = active ? spring({frame: f - Math.round(w.a * fps), fps, config: {damping: 10, stiffness: 260}, from: 1.25, to: 1.1}) : 1;
        return <span key={i} style={{display: 'inline-block', margin: '0 18px', fontSize: 80, fontWeight: 800, textTransform: 'uppercase', opacity: on ? 1 : 0,
          color: active ? (hl.has(norm(w.t)) ? '#FF3B3B' : '#FFE135') : '#fff', WebkitTextStroke: '11px #000', paintOrder: 'stroke fill', transform: `scale(${k})`}}>{w.t.replace(/[.,!?]$/, '')}</span>; })}
    </div>}
    <AbsoluteFill style={{background: `rgba(0,0,0,${flicker})`}} />
    <AbsoluteFill style={{background: `rgba(255,255,255,${white})`}} />
    {/* audio: the hosts' real audio (full), phonk ducked under it, sfx */}
    <OffthreadVideo src={staticFile(`kreek/v2/${P.name}_src.mp4`)} style={{display: 'none'}} volume={1} />
    {music && <Audio src={staticFile(`kreek/music/${P.vv.music[0]}_n.wav`)} startFrom={Math.round(P.vv.music[1] * FPS)} volume={musicVol} loop />}
    {sfx.filter(([, t]) => t >= 0).map(([n, t, v], i) => <Sequence key={i} from={Math.round(t * FPS)}><Audio src={staticFile(n)} volume={v} /></Sequence>)}
  </AbsoluteFill>;
};
