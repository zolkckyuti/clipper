// KreekCraft GTA 6 edit v2 (1080x1920 @ 60 fps): built to NOT look like the standard facecam-top/gameplay-bottom repost.
// Big full-height gameplay with a living facecam picture-in-picture that jumps to a big reaction cutaway on his loudest lines,
// a freeze-frame + stamp on the payoff, karaoke captions, context chip, CapCut grade, 3-frame black flicker, red/green hits,
// punch-ins, camera-flash cuts, phonk that sits low until the drop and ducks under his voice. Official logo always visible.
// Props come from src/kreek/v2/<name>.json (kreek/prep_v2.py). Source: public/kreek/v2/<name>_src.mp4.
import {loadFont} from '@remotion/fonts';
import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {FX, ViralFX, fxFlash, fxSfx} from './ViralFX';
import croc from './v2/croc.json';
import dance from './v2/dance.json';
import gas from './v2/gas.json';
import plane from './v2/plane.json';
import scooter from './v2/scooter.json';
import swim from './v2/swim.json';
import tgwhale from './v2/tgwhale.json';
import kidsgame from './v2/kidsgame.json';
import easteregg from './v2/easteregg.json';
import fixher from './v2/fixher.json';
import joking from './v2/joking.json';
import mike from './v2/mike.json';
import n3onclip from './v2/n3onclip.json';
import kaigame from './v2/kaigame.json';
import jetski from './v2/jetski.json';
import sixstars from './v2/sixstars.json';
import heli from './v2/heli.json';
import bo_block from './v2/bo_block.json';
import bo_paint from './v2/bo_paint.json';
import bo_birds from './v2/bo_birds.json';
import bo_pool from './v2/bo_pool.json';
import bo_height from './v2/bo_height.json';
import bo_plane from './v2/bo_plane.json';
import bo_doom from './v2/bo_doom.json';
import bo_voice from './v2/bo_voice.json';
import bo_shoot from './v2/bo_shoot.json';
import bo_cops from './v2/bo_cops.json';
import d3_bank from './v2/d3_bank.json';
import d3_never from './v2/d3_never.json';
import d3_crash from './v2/d3_crash.json';
import d3_roblox from './v2/d3_roblox.json';
import d3_ending from './v2/d3_ending.json';
import d3_rafa from './v2/d3_rafa.json';
import d3_tank from './v2/d3_tank.json';
import bo2_mozart from './v2/bo2_mozart.json';
import bo2_donnie from './v2/bo2_donnie.json';
import bo2_meditate from './v2/bo2_meditate.json';
import bo2_gym from './v2/bo2_gym.json';
import bo2_buckme from './v2/bo2_buckme.json';
import d4_niko from './v2/d4_niko.json';
import d4_jimmy from './v2/d4_jimmy.json';
import d4_glitch from './v2/d4_glitch.json';
import d4_tiger from './v2/d4_tiger.json';
import d4_blind from './v2/d4_blind.json';
import bo3_looks from './v2/bo3_looks.json';
import bo3_plane from './v2/bo3_plane.json';
import kv2_egg from './v2/kv2_egg.json';
import kv2_mom from './v2/kv2_mom.json';
import kv2_glitch from './v2/kv2_glitch.json';
import bo4_cool from './v2/bo4_cool.json';
import bo5_sam from './v2/bo5_sam.json';
import bo5_third from './v2/bo5_third.json';
import bo6_coffee from './v2/bo6_coffee.json';
import bo6_won from './v2/bo6_won.json';
import bo7_pre from './v2/bo7_pre.json';
import bo8_tackle from './v2/bo8_tackle.json';
import bo9_mean from './v2/bo9_mean.json';
import bo4_secret from './v2/bo4_secret.json';
import bo4_glasses from './v2/bo4_glasses.json';

loadFont({family: 'Montserrat', url: staticFile('Montserrat-Black.woff2'), weight: '800'});
type W = {t: string; a: number; b: number; seg: string};
type P = {name: string; dur: number; top: string; cuts: {id: string; a: number; b: number}[]; words: W[]; hl: string[]; react: number[][]; freeze: [number, string];
  chip: [number, string]; drop: number; src_wh?: [number, number]; cam?: [number, number, number, number]; game?: [number, number, number]; overlay?: string; meme?: {fahh?: number[]; airhorn?: number[]; boom?: number[]; ooh?: number[]}; transitions?: boolean; music_gain?: number; music_src?: string; cap_y?: number; game_x?: [number, number][]; cap_word?: boolean; cta?: FX['cta']; imgpops?: FX['imgpops']; money?: FX['money']; callout?: FX['callout']; endcta?: string; sfx2?: boolean; sfx?: [number, string, number][]; rgb?: boolean; flash?: number[]; flash_color?: 'blue' | 'green' | 'red'; badge?: string; badge_color?: string; badge_tag?: string; srcdir?: string; pops?: [number, string][]; vv: {music: [string, number]; music_off?: number[][]; red?: string[]; green?: string[]; punch?: string[]; music_vol?: number}};
export const KREEK_V2: Record<string, P> = {croc, gas, swim, plane, scooter, dance, tgwhale, kidsgame, easteregg, fixher, joking, mike, n3onclip, kaigame, jetski, sixstars, heli, bo_block, bo_paint, bo_birds, bo_pool, bo_height, bo_plane, bo_doom, bo_voice, bo_shoot, bo_cops, d3_bank, d3_never, d3_crash, d3_roblox, d3_ending, d3_rafa, d3_tank, bo2_mozart, bo2_donnie, bo2_meditate, bo2_gym, bo2_buckme, d4_niko, d4_jimmy, d4_glitch, d4_tiger, d4_blind, bo3_looks, bo3_plane, kv2_egg, kv2_mom, kv2_glitch, bo4_cool, bo4_secret, bo4_glasses, bo5_sam, bo5_third, bo6_coffee, bo6_won, bo7_pre, bo8_tackle, bo9_mean} as unknown as Record<string, P>;
const FPS = 60;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const norm = (t: string) => t.replace(/[^A-Za-z0-9*']/g, '').toUpperCase();
const firstHits = (P: P, list: string[] = [], n = 1, gap = 0.6) => {
  const out: number[] = [];
  for (const w of list) P.words.filter((x) => norm(x.t) === w).slice(0, n).forEach((x) => out.push(x.a));
  return out.sort((a, b) => a - b).filter((t, i, arr) => arr.findIndex((u) => Math.abs(u - t) < gap) === i);
};
// gameplay window: shows source x 520..1400 (facecam lives at x 0..410), full height, scaled to 1320 px tall

export const KreekV2: React.FC<{clip: string}> = ({clip}) => {
  const P = KREEK_V2[clip];
  const [SRC_W, SRC_H] = P.src_wh ?? [1920, 1080];
  const [CX, CY, CW, CH] = P.cam ?? [50, 136, 320, 266];        // facecam rect in source px
  const [GCX, GY0, GY1] = P.game ?? [960, 0, SRC_H];            // gameplay: centre x, visible source y range
  const G = {top: 300, h: 1320, scale: 1320 / (GY1 - GY0)};
  const f = useCurrentFrame(), {fps} = useVideoConfig(), s = f / fps;
  // optional moving gameplay crop: game_x keyframes [t, source centre x], 0.3 s eased pans (keeps the action in frame)
  let gcx = GCX;
  if (P.game_x && P.game_x.length) {
    gcx = P.game_x[0][1];
    for (const [t, x] of P.game_x) { if (s < t) break; const k = Math.min(1, (s - t) / 0.3); const e = k * k * (3 - 2 * k); gcx = gcx + (x - gcx) * e; }
  }
  const src = staticFile(`${P.srcdir ?? 'kreek/v2'}/${P.name}_src.mp4`);
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
  const oneTint = P.flash_color ? {blue: 'rgba(30,107,255,0.28)', green: 'rgba(43,255,90,0.28)', red: 'rgba(255,30,60,0.28)'}[P.flash_color] : null;
  const tint = reds.some((t) => s >= t && s < t + 0.27) ? (oneTint ?? 'rgba(244,3,5,0.28)') : greens.some((t) => s >= t && s < t + 0.27) ? (oneTint ?? 'rgba(167,234,4,0.28)') : 'transparent';
  // ---- rotating transitions at every cut (opt-in: transitions=true): 0 zoom-blur punch, 1 whip pan, 2 flash + shake
  const TRD = 0.24, trOn = !!P.transitions;
  const ti = trOn ? cutTimes.findIndex((t) => s >= t && s < t + TRD) : -1;
  const tk = ti >= 0 ? 1 - (s - cutTimes[ti]) / TRD : 0, ttype = ti >= 0 ? ti % 3 : -1;
  const trZoom = ttype === 0 ? 1 + 0.38 * tk * tk : 1, trX = ttype === 1 ? (ti % 2 ? -1 : 1) * 760 * tk * tk : 0;
  const trBlur = ttype === 0 || ttype === 1 ? 16 * tk : 0, trShake = ttype === 2 ? 14 * tk * Math.sin(f * 2.7) : 0;
  const white = trOn ? (ttype === 2 && s - cutTimes[ti] < 3 / FPS ? 0.9 : ttype === 0 && s - cutTimes[ti] < 1 / FPS ? 0.5 : [...reds, ...greens].some((t) => s >= t && s < t + 0.05) ? 0.55 : (s >= fz && s < fz + 0.06) ? 0.8 : 0)
    : cutTimes.some((t) => s >= t && s < t + 2 / FPS) ? 0.9 : [...reds, ...greens].some((t) => s >= t && s < t + 0.05) ? 0.55 : (s >= fz && s < fz + 0.06) ? 0.8 : 0;
  const flicker = f % 3 === 0 ? 0.05 : 0;
  // ---- RGB flashes (opt-in rgb=true, clippingraw-style): a fast blue -> red -> green burst (2 frames per colour) on the
  // payoff, the red/green hits, every reaction cutaway and any explicit `flash` time; single-colour pulse on punch-ins.
  const RGB = ['#1E6BFF', '#FF1E3C', '#2BFF5A'];
  let rgbCol: string | null = null, rgbA = 0;
  const ONE = P.flash_color ? {blue: '#1E6BFF', green: '#2BFF5A', red: '#FF1E3C'}[P.flash_color] : null;   // single colour (user rule)
  if (P.rgb || ONE) {
    const bursts = [fz, ...reds, ...greens, ...P.react.map(([a]) => a), ...(P.flash ?? [])];
    const b = bursts.find((t) => s >= t && s < t + 0.3);
    if (b !== undefined && (!ONE || s < b + 3 / FPS)) { rgbCol = ONE ?? RGB[Math.floor((s - b) * FPS / 2) % 3]; rgbA = 0.85; }
    else { const pi = punches.findIndex((t) => s >= t && s < t + 2 / FPS); if (pi >= 0) { rgbCol = ONE ?? RGB[pi % 3]; rgbA = 0.6; } }
  }
  // ---- facecam PiP -> big reaction cutaway
  const bounce = [...reds, ...greens].reduce((m, t) => Math.max(m, interpolate(s, [t, t + 0.08, t + 0.3], [0, 1, 0], clamp)), 0);
  const camW = interpolate(react, [0, 1], [400, 900]), camH = camW * CH / CW;
  const camX = interpolate(react, [0, 1], [36, 90]), camY = interpolate(react, [0, 1], [326, 520]);
  const camTilt = interpolate(react, [0, 1], [-2.5, 0]);
  // ---- captions: 3-word chunks, active word highlighted
  const chunks: W[][] = []; let cur: W[] = [];
  P.words.forEach((w, i) => { cur.push(w); if (/[.,!?]$/.test(w.t) || cur.length >= (P.cap_word ? 1 : 3) || i === P.words.length - 1) { chunks.push(cur); cur = []; } });
  const ci = chunks.findIndex((c, i) => s >= c[0].a - 0.05 && (i === chunks.length - 1 || s < chunks[i + 1][0].a - 0.05));
  const chunk = ci >= 0 && s <= chunks[ci][chunks[ci].length - 1].b + (P.cap_word ? (ci + 1 < chunks.length && chunks[ci + 1][0].a - chunks[ci][chunks[ci].length - 1].b < 0.45 ? 0.45 : 0.15) : 0.7) ? chunks[ci] : null;
  const hl = new Set(P.hl);
  // ---- top title: visible from frame 0
  const topWords = P.top.split(' ');
  const topK = spring({frame: f, fps, config: {damping: 12, stiffness: 200}, from: 0.9, to: 1});
  const chipK = interpolate(s, [P.chip[0], P.chip[0] + 0.25, P.chip[0] + 2.6, P.chip[0] + 2.9], [0, 1, 1, 0], clamp);
  // ---- music
  const voiceAt = (t: number) => P.words.some((w) => t >= w.a - 0.08 && t <= w.b + 0.15);
  const off = (t: number) => (P.vv.music_off ?? []).some(([a, b]) => t >= a && t < b);
  const mv = P.vv.music_vol ?? 0.7;
  const musicVol = (fr: number) => { const t = fr / FPS; if (off(t)) return 0;
    // music_gain (kreek/music_gain.py): constant level 15 dB under the speakers; otherwise the old ducked curve
    if (P.music_gain !== undefined) return P.music_gain * Math.min(1, t / 0.15, (P.dur - t) / 0.3);
    return (t < P.drop ? 0.4 : 1) * mv * (voiceAt(t) ? 0.42 : 1) * Math.min(1, t / 0.15, (P.dur - t) / 0.3); };
  const S2 = !!P.sfx2;   // user's SFX pack (public/sfx2) instead of the generated ones
  const sfx: [string, number, number][] = [...cutTimes.map((t, i): [string, number, number] => trOn && i % 3 !== 2 ? ['whoosh', t - 0.12, 0.38] : ['s_camflash', t, 0.45]), ...reds.map((t): [string, number, number] => ['shock', t, 0.35]),
    ...greens.map((t): [string, number, number] => ['rizz', t, 0.32]), ...punches.map((t): [string, number, number] => ['pop', t, 0.16]),
    ...P.react.flatMap(([a, b]): [string, number, number][] => [['whoosh', a - 0.15, 0.3], ['whoosh', b - 0.1, 0.18]]), ['flash', fz, 0.45],
    ...(P.pops ?? []).map(([t]): [string, number, number] => [S2 ? 'sfx2/pop.mp3' : 'pop', t, 0.4]),
    ...(P.meme?.fahh ?? []).map((t): [string, number, number] => [S2 ? 'sfx2/fah.mp3' : 'byb/sfx_fahh.mp3', t, 0.5]), ...(P.meme?.airhorn ?? []).map((t): [string, number, number] => ['byb/sfx_airhorn.mp3', t, 0.3]),
    ...(P.meme?.boom ?? []).map((t): [string, number, number] => [S2 ? 'sfx2/meme_boom.mp3' : 'byb/sfx_boom.mp3', t, 0.5]), ...(P.meme?.ooh ?? []).map((t): [string, number, number] => ['byb/sfx_ooh.mp3', t, 0.32]),
    ...(P.meme ? [[S2 ? 'sfx2/meme_boom.mp3' : 'byb/sfx_boom.mp3', fz, 0.45] as [string, number, number]] : []),
    ...(P.sfx ?? []).map(([t, n, v]): [string, number, number] => [`sfx2/${n}.mp3`, t, v]), ...fxSfx(P)];
  const [fxA, fxC] = fxFlash(P, s);
  return <AbsoluteFill style={{background: 'linear-gradient(180deg,#0b0b12 0%,#141022 55%,#0b0b12 100%)', fontFamily: 'Montserrat'}}>
    <AbsoluteFill style={{transform: `translateX(${trX + trShake}px) scale(${trZoom})`, filter: trBlur > 0.5 ? `blur(${trBlur.toFixed(1)}px)` : undefined}}>
    {/* gameplay */}
    <div style={{position: 'absolute', left: 0, top: G.top, width: 1080, height: G.h, overflow: 'hidden', transform: `translateX(${shake}px)`}}>
      <div style={{position: 'absolute', left: 540 - gcx * gScale, top: G.h / 2 - ((GY0 + GY1) / 2) * gScale, width: SRC_W * gScale, height: SRC_H * gScale,
        transform: `translateX(${-(960 - 960) * gScale}px)`}}>
        <OffthreadVideo src={src} muted startFrom={0} style={{width: '100%', height: '100%', filter: `contrast(1.1) saturate(1.25)${inFreeze ? ' brightness(1.08)' : ''}`,
          transform: `translateX(${-(960 - 960) * gScale}px)`}} {...({} as object)} />
        {/* with a moving crop the stream's own facecam can slide into view: blur it so his face isn't shown twice */}
        {P.game_x && <div style={{position: 'absolute', left: (CX - 6) * gScale, top: (CY - 6) * gScale, width: (CW + 12) * gScale, height: (CH + 12) * gScale,
          backdropFilter: 'blur(28px) brightness(0.8)', WebkitBackdropFilter: 'blur(28px) brightness(0.8)'}} />}
      </div>
      <AbsoluteFill style={{background: tint}} />
      <AbsoluteFill style={{background: `rgba(0,0,0,${0.55 * react})`}} />
    </div>
    {/* facecam PiP / reaction cutaway */}
    <div style={{position: 'absolute', left: camX + (1 - react) * 0, top: camY, width: camW, height: camH, borderRadius: 26, overflow: 'hidden', border: `${interpolate(react, [0, 1], [6, 8])}px solid #fff`,
      boxShadow: '0 14px 40px rgba(0,0,0,.65)', transform: `rotate(${camTilt}deg) scale(${1 + 0.08 * bounce})`, transformOrigin: 'center'}}>
      <div style={{position: 'absolute', left: -CX * (camW / CW), top: -CY * (camW / CW), width: SRC_W * (camW / CW), height: SRC_H * (camW / CW)}}>
        <OffthreadVideo src={src} muted style={{width: '100%', height: '100%', filter: 'contrast(1.06) saturate(1.15)'}} />
      </div>
    </div>
    </AbsoluteFill>
    {/* RGB flash over the footage area only (black bars stay black) */}
    {rgbCol && <div style={{position: 'absolute', left: 0, top: G.top, width: 1080, height: G.h, background: rgbCol, mixBlendMode: 'color', opacity: rgbA}} />}
    {rgbCol && <div style={{position: 'absolute', left: 0, top: G.top, width: 1080, height: G.h, background: rgbCol, mixBlendMode: 'overlay', opacity: rgbA * 0.45}} />}
    {/* freeze stamp */}
    {inFreeze && <div style={{position: 'absolute', top: 860, left: 0, width: 1080, display: 'flex', justifyContent: 'center',
      transform: `rotate(-6deg) scale(${interpolate(fzK, [0, 1], [1.7, 1])})`}}>
      <div style={{background: '#F40305', color: '#fff', fontSize: 92, fontWeight: 800, padding: '10px 34px', borderRadius: 14, border: '7px solid #fff', boxShadow: '0 12px 40px rgba(0,0,0,.6)',
        maxWidth: 960, textAlign: 'center', lineHeight: 1.05}}>{stamp}</div></div>}
    {/* pop-ups: commentary bubbles on the gameplay (right side, clear of the facecam PiP) */}
    {(P.pops ?? []).map(([t, txt], k) => s >= t && s < t + 1.5 && <div key={`pp${k}`} style={{position: 'absolute', right: 30, top: 600 + (k % 2) * 120, maxWidth: 620,
      transform: `rotate(${k % 2 ? 3 : -3}deg) scale(${spring({frame: Math.round((s - t) * FPS), fps: FPS, from: 0.3, to: 1, config: {damping: 10, stiffness: 240}})})`,
      opacity: interpolate(s, [t + 1.3, t + 1.5], [1, 0], clamp)}}>
      <div style={{background: '#fff', color: '#111', fontSize: 52, fontWeight: 800, padding: '12px 28px', borderRadius: 24, border: '5px solid #111', boxShadow: '0 12px 30px rgba(0,0,0,.55)',
        lineHeight: 1.1, textAlign: 'center'}}>{txt}</div></div>)}
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
    {chunk && <div style={{position: 'absolute', top: P.cap_y ?? 1350, left: 30, right: 30, textAlign: 'center', lineHeight: 1.08}}>
      {chunk.map((w, i) => { const on = s >= w.a - 0.04; const active = on && (i === chunk.length - 1 || s < chunk[i + 1].a - 0.04);
        const k = active ? spring({frame: f - Math.round(w.a * fps), fps, config: {damping: 10, stiffness: 260}, from: 1.25, to: 1.1}) : 1;
        return <span key={i} style={{display: 'inline-block', margin: '0 22px', fontSize: 84, fontWeight: 800, textTransform: 'uppercase', opacity: on ? 1 : 0.0,
          color: active ? (hl.has(norm(w.t)) ? '#FF3B3B' : '#FFD400') : '#fff', WebkitTextStroke: '11px #000', paintOrder: 'stroke fill', transform: `scale(${k})`,
          textShadow: '0 6px 0 rgba(0,0,0,.5)'}}>{w.t.replace(/[.,!?]$/, '')}</span>; })}
    </div>}
    {fxA > 0 && <div style={{position: 'absolute', left: 0, top: G.top, width: 1080, height: G.h, background: fxC, mixBlendMode: 'color', opacity: fxA}} />}
    <ViralFX P={P} s={s} f={f} panelTop={G.top} panelH={G.h} />
    {/* official logo overlay: always visible */}
    {P.badge ? <div style={{position: 'absolute', top: 1690, left: 0, width: 1080, display: 'flex', justifyContent: 'center'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(12,10,22,.88)', border: `3px solid ${P.badge_color ?? '#9146FF'}`, borderRadius: 60, padding: '14px 34px', color: '#fff', fontSize: 46, fontWeight: 800}}>
        <span style={{background: P.badge_color ?? '#9146FF', color: P.badge_color ? '#0b0b0b' : '#fff', borderRadius: 12, padding: '2px 12px', fontSize: 34}}>{P.badge_tag ?? 'LIVE'}</span>{P.badge}</div></div>
      : <Img src={staticFile(P.overlay ?? 'kreek/kreek_overlay.png')} style={{position: 'absolute', left: 540 - 330, top: 1660, width: 660}} />}
    <AbsoluteFill style={{background: `rgba(0,0,0,${flicker})`}} />
    <AbsoluteFill style={{background: `rgba(255,255,255,${white})`}} />
    {/* audio */}
    <OffthreadVideo src={src} style={{display: 'none'}} volume={1} />
    <Audio src={staticFile(P.music_src ?? `kreek/music/${P.vv.music[0]}_n.wav`)} startFrom={Math.round(P.vv.music[1] * FPS)} volume={musicVol} loop />
    {sfx.filter(([, t]) => t >= 0).map(([n, t, v], i) => <Sequence key={i} from={Math.round(t * FPS)}><Audio src={staticFile(n.includes('/') ? n : `kreek/music/${n}.mp3`)} volume={v} /></Sequence>)}
  </AbsoluteFill>;
};
