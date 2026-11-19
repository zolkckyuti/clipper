// Kitsch x Saint Nic — narrated storytime breakdown (1080x1920 @ 30 fps), built to be clearly TRANSFORMATIVE vs the raw ad:
// original narration (ElevenLabs) carries the story, the real lines play between; footage sits in a tilted card on our own animated
// festive background; gift tracker (SIS / MOM / ???), product labels + stamps, karaoke captions (narrator white, real lines yellow).
// Brief: Kitsch product on screen every beat, Nic looks sweet/fun, mystery gift stays a mystery, no raw repost.
import {loadFont} from '@remotion/fonts';
import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import NW from './narr_words.json';
import SW from './src_words.json';

loadFont({family: 'Montserrat', url: staticFile('Montserrat-Black.woff2'), weight: '800'});
const FPS = 30;
type Seg = {kind: 'N' | 'S'; v: [number, number]; n?: [number, number]};   // v = source video window, n = narration window (N only)
// N: narration over b-roll (source audio ducked); S: the real moment at full volume
const SEGS: Seg[] = [
  {kind: 'N', v: [0.0, 4.85], n: [0.0, 4.85]},
  {kind: 'S', v: [19.0, 22.7]},
  {kind: 'N', v: [31.3, 35.7], n: [5.7, 10.1]},
  {kind: 'S', v: [36.5, 38.6]},
  {kind: 'N', v: [15.0, 16.95], n: [11.0, 12.95]},
  {kind: 'S', v: [39.3, 43.0]},
  {kind: 'N', v: [43.6, 46.0], n: [13.25, 15.65]},
  {kind: 'S', v: [46.2, 48.4]},
  {kind: 'N', v: [48.4, 50.4], n: [16.5, 18.5]},
  {kind: 'S', v: [50.4, 53.3]},
  {kind: 'S', v: [54.3, 57.7]},
  {kind: 'N', v: [57.7, 60.3], n: [19.0, 21.6]},
];
const START: number[] = []; let acc = 0; for (const s of SEGS) { START.push(acc); acc += s.v[1] - s.v[0]; }
export const KITSCH_STORY_S = acc;
const FIX: Record<string, string> = {nick: 'Nic', 'nick,': 'Nic,', 'nick.': 'Nic.', kish: 'Kitsch', kitsch: 'Kitsch', 'kitsch,': 'Kitsch,'};
const fix = (t: string) => FIX[t.toLowerCase()] ?? t;
// caption words on the output timeline
type CW = {t: string; a: number; real: boolean};
const CAPS: CW[] = SEGS.flatMap((s, i) => {
  const o = START[i];
  if (s.kind === 'N') return (NW as number[][]).filter((w) => (w[0] as number) >= s.n![0] - 0.05 && (w[0] as number) < s.n![1] - 0.05)
    .map((w) => ({t: fix(String(w[2])), a: o + (w[0] as number) - s.n![0], real: false}));
  return (SW as (number | string)[][]).filter((w) => (w[0] as number) >= s.v[0] - 0.05 && (w[0] as number) < s.v[1] - 0.05)
    .map((w) => ({t: fix(String(w[2])), a: o + (w[0] as number) - s.v[0], real: true}));
});
const segAt = (s: number) => { let i = 0; START.forEach((t, k) => { if (s >= t) i = k; }); return i; };
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const tOf = (segIdx: number, srcT: number) => START[segIdx] + srcT - SEGS[segIdx].v[0];
// story beats (output seconds)
const B = {sisCheck: tOf(3, 38.1), momCheck: tOf(7, 47.4), tax: tOf(9, 52.2), mystery: tOf(10, 54.4), holiday: tOf(3, 36.6), curl: tOf(9, 50.6), son: tOf(7, 47.2)};

const Snow = ({f}: {f: number}) => <>{Array.from({length: 46}, (_, i) => {
  const sp = 0.6 + random(`sp${i}`) * 1.4, x = random(`x${i}`) * 1080 + Math.sin(f / 40 + i) * 18, y = ((random(`y${i}`) * 2100 + f * sp * 3) % 2100) - 90, r = 3 + random(`r${i}`) * 7;
  return <div key={i} style={{position: 'absolute', left: x, top: y, width: r, height: r, borderRadius: r, background: 'rgba(255,255,255,.75)', filter: 'blur(0.5px)'}} />;
})}</>;
const Stamp = ({text, color, at, s, y = 700, rot = -8}: {text: string; color: string; at: number; s: number; y?: number; rot?: number}) => {
  if (s < at || s > at + 1.6) return null;
  const k = interpolate(s, [at, at + 0.12, at + 0.22], [1.8, 0.95, 1], clamp), o = interpolate(s, [at + 1.35, at + 1.6], [1, 0], clamp);
  return <div style={{position: 'absolute', top: y, width: 1080, display: 'flex', justifyContent: 'center', opacity: o, transform: `rotate(${rot}deg) scale(${k})`}}>
    <div style={{border: `9px solid ${color}`, color, fontSize: 92, fontWeight: 800, padding: '6px 30px', borderRadius: 18, background: 'rgba(255,255,255,.92)', letterSpacing: 2,
      boxShadow: '0 14px 40px rgba(0,0,0,.35)'}}>{text}</div></div>;
};
const Label = ({text, at, s, y}: {text: string; at: number; s: number; y: number}) => {
  if (s < at || s > at + 2.4) return null;
  const k = spring({frame: Math.round((s - at) * FPS), fps: FPS, config: {damping: 13, stiffness: 180}}), o = interpolate(s, [at + 2.1, at + 2.4], [1, 0], clamp);
  return <div style={{position: 'absolute', top: y, left: 0, width: 1080, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${(1 - k) * 30}px) scale(${0.85 + 0.15 * k})`}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 14, background: '#fff', color: '#b3122e', fontSize: 44, fontWeight: 800, padding: '12px 28px', borderRadius: 40,
      boxShadow: '0 10px 30px rgba(0,0,0,.35)'}}><span style={{fontSize: 40}}>▼</span>{text}</div></div>;
};
const Tracker = ({s}: {s: number}) => {
  const items: [string, number, boolean][] = [['SIS', B.sisCheck, true], ['MOM', B.momCheck, true], ['???', B.mystery, false]];
  return <div style={{position: 'absolute', right: 14, top: 470, display: 'flex', flexDirection: 'column', gap: 18}}>
    {items.map(([t, at, ok], i) => { const done = s >= at; const k = done ? interpolate(s, [at, at + 0.15, at + 0.3], [1, 1.3, 1], clamp) : 1;
      return <div key={i} style={{width: 118, height: 118, borderRadius: 22, background: done ? (ok ? '#1f9d55' : '#6b2bd6') : 'rgba(255,255,255,.16)', border: '4px solid #fff',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', transform: `scale(${k})`, boxShadow: '0 8px 22px rgba(0,0,0,.35)'}}>
        <div style={{fontSize: 46, lineHeight: 1}}>{done ? (ok ? '✓' : '?') : '▢'}</div>
        <div style={{fontSize: 26, fontWeight: 800, marginTop: 4}}>{t}</div></div>; })}
  </div>;
};

export const KitschStory: React.FC<{music?: boolean}> = ({music = true}) => {
  const f = useCurrentFrame(), {fps} = useVideoConfig(), s = f / fps;
  const i = segAt(s), seg = SEGS[i], local = s - START[i];
  const enter = spring({frame: Math.round(local * fps), fps, config: {damping: 14, stiffness: 170}});
  const rot = (i % 2 ? 1.6 : -1.6) * (seg.kind === 'S' ? 0.4 : 1);
  const cardScale = (seg.kind === 'S' ? 0.76 : 0.73) * (0.94 + 0.06 * enter) * (1 + 0.025 * local / 4);
  const punch = [B.sisCheck, B.son, B.tax].some((t) => s >= t && s < t + 0.35) ? 1.05 : 1;
  const flash = i > 0 && local < 0.07 ? 0.85 : 0;
  // captions: 1–3 word chunks
  const chunks: CW[][] = []; let cur: CW[] = [];
  CAPS.forEach((w, k) => { cur.push(w); const nx = CAPS[k + 1]; if (/[.,!?]$/.test(w.t) || cur.length >= 3 || !nx || nx.real !== w.real || nx.a - w.a > 0.7) { chunks.push(cur); cur = []; } });
  const ci = chunks.findIndex((c, k) => s >= c[0].a - 0.05 && (k === chunks.length - 1 || s < chunks[k + 1][0].a - 0.05));
  const ch = ci >= 0 ? chunks[ci] : null;
  const title = 'Love Island\'s Nic turned into SANTA for his family';
  return <AbsoluteFill style={{fontFamily: 'Montserrat', overflow: 'hidden', background: 'radial-gradient(120% 80% at 50% 30%, #c8102e 0%, #7a0a1d 55%, #3a0510 100%)'}}>
    {/* gift-wrap stripes */}
    <AbsoluteFill style={{opacity: 0.12, backgroundImage: 'repeating-linear-gradient(45deg, #fff 0 22px, transparent 22px 88px)', backgroundPosition: `${f * 1.2}px 0`}} />
    <Snow f={f} />
    {/* footage card */}
    <div style={{position: 'absolute', left: 540 - 540 * cardScale, top: 1000 - 960 * cardScale, width: 1080 * cardScale, height: 1920 * cardScale,
      transform: `rotate(${rot}deg) scale(${punch})`, borderRadius: 40, overflow: 'hidden', border: '10px solid #fff', boxShadow: '0 30px 80px rgba(0,0,0,.55)'}}>
      {SEGS.map((g, k) => k === i && <Sequence key={k} from={Math.round(START[k] * fps)} durationInFrames={Math.round((g.v[1] - g.v[0]) * fps) + 1}>
        <OffthreadVideo src={staticFile('kitsch/nic.mp4')} startFrom={Math.round(g.v[0] * fps)} volume={g.kind === 'S' ? 1 : 0.22}
          style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.06) saturate(1.15)'}} /></Sequence>)}
      {seg.kind === 'S' && <div style={{position: 'absolute', top: 22, left: 22, background: 'rgba(0,0,0,.55)', color: '#fff', fontSize: 30, fontWeight: 800, padding: '6px 16px', borderRadius: 20}}>🔊 REAL</div>}
    </div>
    {/* title (visible from frame 0) */}
    <div style={{position: 'absolute', top: 36, left: 40, right: 40, textAlign: 'center', fontSize: 58, fontWeight: 800, lineHeight: 1.12, color: '#fff',
      textShadow: '0 5px 18px rgba(0,0,0,.5)', transform: `scale(${spring({frame: f, fps, from: 0.92, to: 1, config: {damping: 12}})})`}}>
      {title.split(' ').map((w, k) => <span key={k} style={{color: w === 'SANTA' ? '#FFD84A' : '#fff'}}>{w} </span>)}</div>
    <Tracker s={s} />
    <Label text="Kitsch holiday sets" at={B.holiday} s={s} y={330} />
    <Label text="Kitsch Curl Cream" at={B.curl} s={s} y={330} />
    <Stamp text="NICE LIST ✓" color="#1f9d55" at={B.sisCheck} s={s} y={760} />
    <Stamp text="10/10 SON" color="#d4a017" at={B.son + 0.25} s={s} y={760} rot={6} />
    <Stamp text="SAINT NIC TAX" color="#c8102e" at={B.tax} s={s} y={760} />
    {/* captions */}
    {ch && <div style={{position: 'absolute', top: 1772, left: 30, right: 30, textAlign: 'center'}}>
      {ch.map((w, k) => { const on = s >= w.a - 0.04, act = on && (k === ch.length - 1 || s < ch[k + 1].a - 0.04);
        return <span key={k} style={{display: 'inline-block', margin: '0 14px', fontSize: 74, fontWeight: 800, textTransform: 'uppercase', opacity: on ? 1 : 0.35,
          color: w.real ? (act ? '#FFD84A' : '#ffe9a6') : (act ? '#fff' : 'rgba(255,255,255,.8)'), WebkitTextStroke: '10px #2a0008', paintOrder: 'stroke fill',
          transform: `scale(${act ? 1.1 : 1})`}}>{w.real && k === 0 ? '“' : ''}{w.t.replace(/[.,!?]$/, '')}{w.real && k === ch.length - 1 ? '”' : ''}</span>; })}
    </div>}
    <AbsoluteFill style={{background: `rgba(255,255,255,${flash})`}} />
    {/* audio: narration windows, sfx, optional soft bed */}
    {SEGS.map((g, k) => g.kind === 'N' && <Sequence key={`n${k}`} from={Math.round(START[k] * fps)} durationInFrames={Math.round((g.n![1] - g.n![0]) * fps) + 3}>
      <Audio src={staticFile('kitsch/narr.wav')} startFrom={Math.round(g.n![0] * fps)} volume={1} /></Sequence>)}
    {START.slice(1).map((t, k) => <Sequence key={`w${k}`} from={Math.max(0, Math.round((t - 0.12) * fps))}><Audio src={staticFile('kitsch/whoosh.mp3')} volume={0.14} /></Sequence>)}
    {[B.sisCheck, B.momCheck].map((t, k) => <Sequence key={`d${k}`} from={Math.round(t * fps)}><Audio src={staticFile('kitsch/s_ding.mp3')} volume={0.3} /></Sequence>)}
    {[B.holiday, B.curl, B.tax, B.son].map((t, k) => <Sequence key={`p${k}`} from={Math.round(t * fps)}><Audio src={staticFile('kitsch/pop.mp3')} volume={0.2} /></Sequence>)}
    {music && <Audio src={staticFile('kitsch/m_brega_n.mp3')} startFrom={11 * fps} volume={(fr) => { const t = fr / fps, ii = segAt(t); return (SEGS[ii].kind === 'S' ? 0.05 : 0.1) * Math.min(1, t / 0.4, (KITSCH_STORY_S - t) / 0.5); }} />}
  </AbsoluteFill>;
};
