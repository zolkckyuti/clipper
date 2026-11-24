// Backyard Breaks x Trevor Lawrence clip (1080x1920 @ 60 fps) for WIDE 16:9 studio footage (3 people at a table).
// Layout follows the channel the user pointed at (title on top, footage in the middle, word captions on the footage) but
// with the KreekCraft / VverPaldo edit on top: a living square crop that reframes onto whoever is talking (`focus`
// keyframes) and punches into reactions, rotating cut transitions, freeze + stamp on the payoff, pop-up bubbles,
// emoji stickers, red/green hit tints, flicker, phonk ducked under the real audio, meme sfx (user's SFX pack in public/sfx2).
// Props: src/kreek/v2/<name>.json from kreek/prep_v2.py (+ kreek/beats.py for focus / stickers / sfx anchors).
import {loadFont} from '@remotion/fonts';
import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import tl_goat from '../kreek/v2/tl_goat.json';
import tl_celly from '../kreek/v2/tl_celly.json';
import tl_josh from '../kreek/v2/tl_josh.json';
import tl_ticket from '../kreek/v2/tl_ticket.json';
import tl_sig from '../kreek/v2/tl_sig.json';
import tl2_goat from '../kreek/v2/tl2_goat.json';
import tl_left from '../kreek/v2/tl_left.json';
import tl_presnap from '../kreek/v2/tl_presnap.json';
import tl_peyton from '../kreek/v2/tl_peyton.json';
import tl_redeem from '../kreek/v2/tl_redeem.json';
import wiz_cool from '../kreek/v2/wiz_cool.json';
import tl_golf from '../kreek/v2/tl_golf.json';
import tl_coen from '../kreek/v2/tl_coen.json';
import tl_packs from '../kreek/v2/tl_packs.json';
import tl_mills from '../kreek/v2/tl_mills.json';
import tl_tiger from '../kreek/v2/tl_tiger.json';
import gd_anx from '../kreek/v2/gd_anx.json';
import gd_rel from '../kreek/v2/gd_rel.json';
import gd_trust from '../kreek/v2/gd_trust.json';
import gd_hier from '../kreek/v2/gd_hier.json';
import gd_money from '../kreek/v2/gd_money.json';
import dp_scooter from '../kreek/v2/dp_scooter.json';
import dp_orca from '../kreek/v2/dp_orca.json';
import gd_olymp from '../kreek/v2/gd_olymp.json';
import wow_crow from '../kreek/v2/wow_crow.json';
import wow_thanes from '../kreek/v2/wow_thanes.json';
import wow_pal from '../kreek/v2/wow_pal.json';
import wow_lord from '../kreek/v2/wow_lord.json';
import wow_uk from '../kreek/v2/wow_uk.json';
import wow_de from '../kreek/v2/wow_de.json';

loadFont({family: 'Montserrat', url: staticFile('Montserrat-Black.woff2'), weight: '800'});
type W = {t: string; a: number; b: number};
type P = {name: string; dur: number; top: string; cuts: {a: number; b: number}[]; words: W[]; hl: string[]; react: number[][]; freeze: [number, string];
  drop: number; chip: [number, string]; pops?: [number, string][]; src_wh?: [number, number];
  focus?: [number, number, number, number][];          // [t, source cx, source cy, zoom] — zoom 1 = full source height in the panel
  stickers?: [number, string, number, number, number][]; // [t, emoji code (public/emoji-ios), x, y, size]
  sfx?: [number, string, number][];                      // [t, file in public/sfx2 (no ext), volume]
  flash_color?: 'blue' | 'green' | 'red'; flash?: number[];   // ONE colour per clip (user), flashed on the hits
  brand?: [string, string];   // bottom pill text [main, accent]; default @BackyardBreaks · Whatnot
  music: string; music_gain?: number; vv: {red?: string[]; green?: string[]; punch?: string[]; music_vol?: number}};
export const TREV: Record<string, P> = {tl_goat, tl_celly, tl_josh, tl_ticket, tl_sig, tl2_goat, tl_left, tl_presnap, tl_peyton, tl_redeem, wiz_cool, tl_golf, tl_coen, tl_packs, tl_mills, tl_tiger, wow_uk, wow_de, gd_anx, gd_rel, gd_trust, gd_hier, gd_money, dp_scooter, dp_orca, gd_olymp, wow_crow, wow_thanes, wow_pal, wow_lord} as unknown as Record<string, P>;
const FPS = 60;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const norm = (t: string) => t.replace(/[^A-Za-z0-9*'$]/g, '').toUpperCase();
const hits = (P: P, list: string[] = [], n = 1, gap = 0.6) => {
  const out: number[] = [];
  for (const w of list) P.words.filter((x) => norm(x.t) === w).slice(0, n).forEach((x) => out.push(x.a));
  return out.sort((a, b) => a - b).filter((t, i, arr) => arr.findIndex((u) => Math.abs(u - t) < gap) === i);
};
const win = (s: number, ws: number[][], ramp = 0.18) => ws.reduce((m, [a, b]) => Math.max(m, interpolate(s, [a - ramp, a, b - ramp, b], [0, 1, 1, 0], clamp)), 0);
const ease = (x: number) => x * x * (3 - 2 * x);
const PANEL = {top: 330, h: 1150, w: 1080};

export const TrevClip: React.FC<{clip: string}> = ({clip}) => {
  const P = TREV[clip];
  const [SW, SH] = P.src_wh ?? [1920, 1080];
  const f = useCurrentFrame(), {fps} = useVideoConfig(), s = f / fps;
  const reds = hits(P, P.vv.red), greens = hits(P, P.vv.green), punches = hits(P, P.vv.punch, 2, 0.5);
  const cutTimes = P.cuts.slice(1).map((c) => c.a);
  const [fz, stamp] = P.freeze; const inFreeze = s >= fz && s < fz + 0.85;
  const fzK = inFreeze ? spring({frame: f - Math.round(fz * fps), fps, config: {damping: 14, stiffness: 160}}) : 0;
  // ---- reframe: interpolate focus keyframes (0.35 s eased moves), then punch / reaction / freeze zoom on top
  const F = P.focus && P.focus.length ? P.focus : [[0, SW / 2, SH / 2, 1] as [number, number, number, number]];
  let cx = F[0][1], cy = F[0][2], z = F[0][3];
  for (let i = 1; i < F.length; i++) {
    const [t, x, y, zz] = F[i]; if (s < t) break;
    const k = ease(Math.min(1, (s - t) / 0.35)); cx = cx + (x - cx) * k; cy = cy + (y - cy) * k; z = z + (zz - z) * k;
  }
  const segA = P.cuts.find((c) => s >= c.a && s < c.b)?.a ?? 0;
  const push = 1 + 0.03 * (s - segA) / 3;
  const punch = punches.reduce((m, t) => Math.max(m, interpolate(s, [t - 0.02, t + 0.05, t + 0.38, t + 0.5], [0, 1, 1, 0], clamp)), 0);
  const reactK = win(s, P.react);
  const zoom = z * push * (1 + 0.1 * punch) * (1 + 0.3 * reactK) * (1 + 0.18 * fzK);
  const Hs = SH / zoom, Ws = Hs * PANEL.w / PANEL.h, k = PANEL.h / Hs;
  const ccx = Math.min(Math.max(cx, Ws / 2), SW - Ws / 2), ccy = Math.min(Math.max(cy, Hs / 2), SH - Hs / 2);
  // ---- transitions at every cut, rotating: 0 zoom-blur punch, 1 whip pan, 2 flash + shake
  const TR = 0.24;
  const ti = cutTimes.findIndex((t) => s >= t && s < t + TR);
  const tk = ti >= 0 ? 1 - (s - cutTimes[ti]) / TR : 0, ttype = ti >= 0 ? ti % 3 : -1;
  const trZoom = ttype === 0 ? 1 + 0.38 * tk * tk : 1, trX = ttype === 1 ? (ti % 2 ? -1 : 1) * 760 * tk * tk : 0;
  const trBlur = ttype === 0 || ttype === 1 ? 16 * tk : 0;
  const shake = (ttype === 2 ? 14 * tk * Math.sin(f * 2.7) : 0) + (reds.some((t) => s >= t && s < t + 0.25) || (s >= fz && s < fz + 0.2) ? 9 * Math.sin(f * 2.3) : 0);
  // hit tints: with a flash_color the clip uses that ONE colour for every tint (user rule), otherwise red/green
  const oneTint = P.flash_color ? {blue: 'rgba(30,107,255,0.25)', green: 'rgba(43,255,90,0.25)', red: 'rgba(255,30,60,0.25)'}[P.flash_color] : null;
  const tint = reds.some((t) => s >= t && s < t + 0.27) ? (oneTint ?? 'rgba(244,3,5,0.25)') : greens.some((t) => s >= t && s < t + 0.27) ? (oneTint ?? 'rgba(40,220,90,0.25)') : 'transparent';
  const white = ttype === 2 && s - cutTimes[ti] < 3 / FPS ? 0.9 : ttype === 0 && s - cutTimes[ti] < 1 / FPS ? 0.5 : [...reds, ...greens].some((t) => s >= t && s < t + 0.05) ? 0.5 : (s >= fz && s < fz + 0.06) ? 0.8 : 0;
  const flicker = f % 3 === 0 ? 0.05 : 0;
  // ---- single-colour flash (user: one colour only, not a blue/red/green cycle): 3 frames on the payoff, red/green hits,
  // reaction zooms, punch-ins and explicit `flash` times, over the footage panel only
  const FC = {blue: '#1E6BFF', green: '#2BFF5A', red: '#FF1E3C'}[P.flash_color ?? 'blue'];
  const flashTimes = P.flash_color ? [fz, ...reds, ...greens, ...P.react.map(([a]) => a), ...punches, ...(P.flash ?? [])] : [];
  const fl = flashTimes.find((t) => s >= t && s < t + 3 / FPS);
  const flashA = fl === undefined ? 0 : fl === fz || (P.flash ?? []).includes(fl) ? 0.85 : 0.6;
  // ---- captions: 1–3 word chunks, active word yellow (red on key words), cleared 0.7 s after the last word
  const chunks: W[][] = []; let cur: W[] = [];
  P.words.forEach((w, i) => { cur.push(w); const nx = P.words[i + 1]; if (/[.,!?]$/.test(w.t) || cur.length >= 3 || !nx || nx.a - w.b > 0.5) { chunks.push(cur); cur = []; } });
  const ci = chunks.findIndex((c, i) => s >= c[0].a - 0.05 && (i === chunks.length - 1 || s < chunks[i + 1][0].a - 0.05));
  const chunk = ci >= 0 && s <= chunks[ci][chunks[ci].length - 1].b + 0.7 ? chunks[ci] : null;
  const hl = new Set(P.hl);
  const chipK = interpolate(s, [P.chip[0], P.chip[0] + 0.25, P.chip[0] + 2.8, P.chip[0] + 3.1], [0, 1, 1, 0], clamp);
  // ---- music: held at a constant 15 dB under the speakers (user rule). music_gain is measured per clip by
  // kreek/music_gain.py: (speech LUFS - 15) - (track LUFS), as a linear factor. Short fades in/out only.
  const mg = P.music_gain ?? 0.15;
  const musicVol = (fr: number) => { const t = fr / FPS; return mg * Math.min(1, t / 0.15, (P.dur - t) / 0.3); };
  const sfx: [string, number, number][] = [
    ...cutTimes.map((t, i): [string, number, number] => i % 3 === 2 ? ['sfx2/camera_flash.mp3', t, 0.35] : ['kreek/music/whoosh.mp3', t - 0.12, 0.38]),
    ...reds.map((t): [string, number, number] => ['kreek/music/shock.mp3', t, 0.3]), ...greens.map((t): [string, number, number] => ['sfx2/rizz.mp3', t, 0.3]),
    ...punches.map((t): [string, number, number] => ['sfx2/click.mp3', t, 0.25]), ['sfx2/meme_boom.mp3', fz, 0.5],
    ...(P.pops ?? []).map(([t]): [string, number, number] => ['sfx2/pop.mp3', t, 0.45]),
    ...(P.stickers ?? []).map(([t]): [string, number, number] => ['sfx2/pop.mp3', t, 0.3]),
    ...(P.sfx ?? []).map(([t, n, v]): [string, number, number] => [`sfx2/${n}.mp3`, t, v])];
  const src = staticFile(`kreek/v2/${P.name}_src.mp4`);
  return <AbsoluteFill style={{background: '#000', fontFamily: 'Montserrat', overflow: 'hidden'}}>
    {/* blurred backdrop so the frame never looks like a plain letterbox repost */}
    <AbsoluteFill style={{opacity: 0.55}}>
      <OffthreadVideo src={src} muted style={{position: 'absolute', left: -1166, top: 0, width: 3413, height: 1920, filter: 'blur(38px) brightness(0.45) saturate(1.3)'}} />
    </AbsoluteFill>
    {/* footage panel with live reframe */}
    <div style={{position: 'absolute', left: 0, top: PANEL.top, width: PANEL.w, height: PANEL.h, overflow: 'hidden', transform: `translateX(${shake + trX}px)`,
      filter: trBlur > 0.5 ? `blur(${trBlur.toFixed(1)}px)` : undefined, boxShadow: '0 0 60px rgba(0,0,0,.8)'}}>
      <div style={{position: 'absolute', left: PANEL.w / 2 - ccx * k, top: PANEL.h / 2 - ccy * k, width: SW * k, height: SH * k, transform: `scale(${trZoom})`, transformOrigin: `${ccx * k}px ${ccy * k}px`}}>
        <OffthreadVideo src={src} muted style={{width: '100%', height: '100%', filter: `contrast(1.1) saturate(1.22)${inFreeze ? ' brightness(1.08)' : ''}`}} />
      </div>
      <AbsoluteFill style={{background: tint}} />
    </div>
    {flashA > 0 && <div style={{position: 'absolute', left: 0, top: PANEL.top, width: PANEL.w, height: PANEL.h, background: FC, mixBlendMode: 'color', opacity: flashA}} />}
    {flashA > 0 && <div style={{position: 'absolute', left: 0, top: PANEL.top, width: PANEL.w, height: PANEL.h, background: FC, mixBlendMode: 'overlay', opacity: flashA * 0.45}} />}
    {/* title (from frame 0) */}
    <div style={{position: 'absolute', top: 70, left: 40, right: 40, height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      transform: `scale(${spring({frame: f, fps, from: 0.88, to: 1, config: {damping: 12, stiffness: 200}})})`}}>
      <div style={{fontSize: 60, fontWeight: 800, lineHeight: 1.12, color: '#fff', WebkitTextStroke: '10px #000', paintOrder: 'stroke fill'}}>
        {P.top.split(' ').map((w, i) => <span key={i} style={{color: hl.has(norm(w)) || /\$|#1/.test(w) ? '#FFE135' : '#fff'}}>{w} </span>)}</div></div>
    {/* context chip */}
    {chipK > 0 && <div style={{position: 'absolute', top: PANEL.top + 26, left: 0, width: 1080, display: 'flex', justifyContent: 'center', opacity: chipK, transform: `translateY(${(1 - chipK) * -20}px)`}}>
      <div style={{background: 'rgba(0,0,0,.72)', color: '#fff', fontSize: 30, fontWeight: 800, padding: '10px 22px', borderRadius: 40, letterSpacing: 1.5, border: '3px solid #2BE36B'}}>
        <span style={{color: '#2BE36B'}}>● </span>{P.chip[1]}</div></div>}
    {/* emoji stickers */}
    {(P.stickers ?? []).map(([t, code, x, y, size], i) => s >= t && s < t + 1.4 && <Img key={i} src={staticFile(`emoji-ios/${code}.png`)} style={{position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size,
      transform: `rotate(${Math.sin((s - t) * 9) * 8}deg) scale(${spring({frame: Math.round((s - t) * FPS), fps: FPS, from: 0, to: 1, config: {damping: 9, stiffness: 220}})})`,
      opacity: interpolate(s, [t + 1.2, t + 1.4], [1, 0], clamp), filter: 'drop-shadow(0 10px 18px rgba(0,0,0,.6))'}} />)}
    {/* pop-ups */}
    {(P.pops ?? []).map(([t, txt], i) => s >= t && s < t + 1.6 && <div key={i} style={{position: 'absolute', top: PANEL.top + 140 + (i % 2) * 120, ...(i % 2 ? {left: 32} : {right: 32}), maxWidth: 640,
      transform: `rotate(${i % 2 ? -3 : 3}deg) scale(${spring({frame: Math.round((s - t) * FPS), fps: FPS, from: 0.3, to: 1, config: {damping: 10, stiffness: 240}})})`,
      opacity: interpolate(s, [t + 1.4, t + 1.6], [1, 0], clamp)}}>
      <div style={{background: '#fff', color: '#111', fontSize: 48, fontWeight: 800, padding: '12px 28px', borderRadius: 24, border: '5px solid #111', boxShadow: '0 12px 30px rgba(0,0,0,.55)', lineHeight: 1.1, textAlign: 'center'}}>{txt}</div></div>)}
    {/* freeze stamp */}
    {inFreeze && <div style={{position: 'absolute', top: 700, left: 0, width: 1080, display: 'flex', justifyContent: 'center', transform: `rotate(-6deg) scale(${interpolate(fzK, [0, 1], [1.7, 1])})`}}>
      <div style={{background: '#F40305', color: '#fff', fontSize: 84, fontWeight: 800, padding: '10px 34px', borderRadius: 14, border: '7px solid #fff', boxShadow: '0 12px 40px rgba(0,0,0,.6)', textAlign: 'center', lineHeight: 1.05, maxWidth: 960}}>{stamp}</div></div>}
    {/* captions on the lower part of the footage */}
    {/* captions: just below the middle of the frame (user preference) */}
    {chunk && <div style={{position: 'absolute', top: 1040, left: 30, right: 30, textAlign: 'center', lineHeight: 1.08}}>
      {chunk.map((w, i) => { const on = s >= w.a - 0.04; const active = on && (i === chunk.length - 1 || s < chunk[i + 1].a - 0.04);
        const kk = active ? spring({frame: f - Math.round(w.a * fps), fps, config: {damping: 10, stiffness: 260}, from: 1.25, to: 1.1}) : 1;
        return <span key={i} style={{display: 'inline-block', margin: '0 22px', fontSize: 82, fontWeight: 800, textTransform: 'uppercase', opacity: on ? 1 : 0,
          color: active ? (hl.has(norm(w.t)) ? '#FF3B3B' : '#FFE135') : '#fff', WebkitTextStroke: '11px #000', paintOrder: 'stroke fill', transform: `scale(${kk})`}}>{w.t.replace(/[.,!?]$/, '')}</span>; })}
    </div>}
    {/* brand pill */}
    <div style={{position: 'absolute', top: PANEL.top + PANEL.h + 60, left: 0, width: 1080, display: 'flex', justifyContent: 'center'}}>
      <div style={{background: '#111', color: '#fff', fontSize: 40, fontWeight: 800, padding: '14px 34px', borderRadius: 50, border: '4px solid #fff', letterSpacing: 1}}>
        {P.brand ? <>{P.brand[0]} <span style={{color: '#FFE135'}}>{P.brand[1]}</span></> : <><span style={{color: '#2BE36B'}}>@</span>BackyardBreaks <span style={{color: '#FFE135'}}>· Whatnot</span></>}</div></div>
    <AbsoluteFill style={{background: `rgba(0,0,0,${flicker})`}} />
    <AbsoluteFill style={{background: `rgba(255,255,255,${white})`}} />
    {/* audio: real audio, phonk ducked under it, sfx */}
    <OffthreadVideo src={src} style={{display: 'none'}} volume={1} />
    <Audio src={staticFile(`tl/music/${P.music}.wav`)} volume={musicVol} loop />
    {sfx.filter(([, t]) => t >= 0).map(([n, t, v], i) => <Sequence key={i} from={Math.round(t * FPS)}><Audio src={staticFile(n)} volume={v} /></Sequence>)}
  </AbsoluteFill>;
};
