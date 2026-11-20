// Kitsch x Saint Nic — storytime batch 3 (1080x1920 @ 30 fps). Same transformative recipe as KitschStory (narrated story, real lines
// between, footage in a card on our own animated background, karaoke captions), but data-driven so each clip has its own angle,
// theme, widget (route / list / rank), labels and stamps. Configs come from kitsch/build_v3.py -> src/kitsch/v3/<name>.json.
import {loadFont} from '@remotion/fonts';
import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import delivery from './v3/delivery.json';
import ranking from './v3/ranking.json';
import women from './v3/women.json';
import xmom from './v4/xmom.json';
import xmystery from './v4/xmystery.json';
import xtax from './v4/xtax.json';

loadFont({family: 'Montserrat', url: staticFile('Montserrat-Black.woff2'), weight: '800'});
type Seg = {kind: string; src: string; v: number[]; n?: number[]; crop?: number[]; start: number; a?: number};
type Cap = {t: string; a: number; real: boolean};
type Item = {label: string; at: number; mark: string};
export type K3 = {name: string; dur: number; narr: string; title: string; hl: string[]; segs: Seg[]; caps: Cap[];
  theme: {bg: string; stripe: string; accent: string; capStroke: string; particles: string; tilt: number; cardTop: number; scale?: number};
  widget: {type: string; head: string; items: Item[]}; labels: {text: string; at: number}[]; stamps: {text: string; color: string; at: number; rot: number}[];
  dings: number[]; pops: number[]; bubbles?: {text: string; at: number}[]; zooms?: number[]; sfx?: {f: string; at: number; vol: number}[]};
export const K3S: Record<string, K3> = {delivery, women, ranking, xmom, xtax, xmystery} as unknown as Record<string, K3>;
const FPS = 30;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const SRC: Record<string, string> = {nic: 'kitsch/nic.mp4', v1: 'kitsch/v1.mp4', v2: 'kitsch/v2.mp4'};
const SRC_FPS: Record<string, number> = {nic: 24000 / 1001, v1: 24000 / 1001, v2: 30};

const Particles = ({f, kind}: {f: number; kind: string}) => <>{Array.from({length: kind === 'snow' ? 46 : 30}, (_, i) => {
  const sp = 0.6 + random(`sp${i}`) * 1.4, x = random(`x${i}`) * 1080 + Math.sin(f / 40 + i) * 18;
  if (kind === 'sparkle') {
    const y = random(`y${i}`) * 1920, tw = 0.35 + 0.65 * Math.abs(Math.sin(f / 14 + i * 1.7)), r = 8 + random(`r${i}`) * 14;
    return <div key={i} style={{position: 'absolute', left: x, top: y, width: r, height: r, background: '#ffe9a0', opacity: tw * 0.8, transform: `rotate(45deg) scale(${tw})`,
      boxShadow: '0 0 14px #ffd84a'}} />;
  }
  const y = ((random(`y${i}`) * 2100 + f * sp * (kind === 'hearts' ? -2 : 3)) % 2100 + 2100) % 2100 - 90, r = 3 + random(`r${i}`) * 7;
  if (kind === 'hearts') return <div key={i} style={{position: 'absolute', left: x, top: y, fontSize: 22 + r * 3, color: 'rgba(255,255,255,.55)', fontFamily: 'DejaVu Sans, sans-serif'}}>♥</div>;
  return <div key={i} style={{position: 'absolute', left: x, top: y, width: r, height: r, borderRadius: r, background: 'rgba(255,255,255,.75)'}} />;
})}</>;

const Stamp = ({text, color, at, s, rot}: {text: string; color: string; at: number; s: number; rot: number}) => {
  if (s < at || s > at + 1.6) return null;
  const k = interpolate(s, [at, at + 0.12, at + 0.22], [1.8, 0.95, 1], clamp), o = interpolate(s, [at + 1.35, at + 1.6], [1, 0], clamp);
  return <div style={{position: 'absolute', top: 760, width: 1080, display: 'flex', justifyContent: 'center', opacity: o, transform: `rotate(${rot}deg) scale(${k})`}}>
    <div style={{border: `9px solid ${color}`, color, fontSize: 88, fontWeight: 800, padding: '6px 30px', borderRadius: 18, background: 'rgba(255,255,255,.93)', letterSpacing: 2,
      boxShadow: '0 14px 40px rgba(0,0,0,.35)', whiteSpace: 'nowrap'}}>{text}</div></div>;
};
const Label = ({text, at, s, color}: {text: string; at: number; s: number; color: string}) => {
  if (s < at || s > at + 2.4) return null;
  const k = spring({frame: Math.round((s - at) * FPS), fps: FPS, config: {damping: 13, stiffness: 180}}), o = interpolate(s, [at + 2.1, at + 2.4], [1, 0], clamp);
  return <div style={{position: 'absolute', top: 1330, left: 0, width: 1080, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${(1 - k) * 30}px) scale(${0.85 + 0.15 * k})`}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 14, background: '#fff', color, fontSize: 44, fontWeight: 800, padding: '12px 28px', borderRadius: 40,
      boxShadow: '0 10px 30px rgba(0,0,0,.35)'}}><span style={{fontSize: 36}}>▲</span>{text}</div></div>;
};
const pulse = (s: number, at: number) => interpolate(s, [at, at + 0.15, at + 0.3], [1, 1.3, 1], clamp);

// ---- widgets
const Route = ({s, items, head, accent}: {s: number; items: Item[]; head: string; accent: string}) => {
  const xs = items.map((_, i) => 230 + i * 300);
  let px = 80;   // gift marker: drives from start to each stop, arriving at its time
  items.forEach((it, i) => { const from = i === 0 ? 0 : items[i - 1].at, x0 = i === 0 ? 80 : xs[i - 1]; if (s >= from) px = interpolate(s, [from, it.at], [x0, xs[i]], clamp); });
  return <div style={{position: 'absolute', top: 226, left: 0, width: 1080, height: 90}}>
    <div style={{position: 'absolute', left: 40, top: -6, color: accent, fontSize: 22, fontWeight: 800, letterSpacing: 3}}>{head}</div>
    <div style={{position: 'absolute', left: 80, right: 80, top: 44, borderTop: '6px dashed rgba(255,255,255,.55)'}} />
    {items.map((it, i) => { const done = s >= it.at; return <div key={i} style={{position: 'absolute', left: xs[i] - 70, top: 18, width: 140, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div style={{width: 52, height: 52, borderRadius: 26, background: done ? (it.mark === 'ok' ? '#1f9d55' : '#6b2bd6') : 'rgba(255,255,255,.2)', border: '5px solid #fff',
        color: '#fff', fontSize: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${done ? pulse(s, it.at) : 1})`}}>{done ? (it.mark === 'ok' ? '✓' : '?') : ''}</div>
      <div style={{color: '#fff', fontSize: 26, fontWeight: 800, marginTop: 4}}>{it.label}</div></div>; })}
    <div style={{position: 'absolute', left: px - 24, top: 8, width: 48, height: 40, background: accent, borderRadius: 8, border: '4px solid #fff', boxShadow: '0 6px 14px rgba(0,0,0,.4)'}}>
      <div style={{position: 'absolute', left: 16, top: -4, width: 8, height: 42, background: '#c8102e'}} /><div style={{position: 'absolute', left: -4, top: 14, width: 48, height: 8, background: '#c8102e'}} /></div>
  </div>;
};
const NiceList = ({s, items, head}: {s: number; items: Item[]; head: string}) =>
  <div style={{position: 'absolute', right: 10, top: 560, width: 138, padding: '14px 8px 18px', background: '#fffaf0', borderRadius: 14, transform: 'rotate(3deg)',
    boxShadow: '0 12px 30px rgba(0,0,0,.35)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16}}>
    <div style={{color: '#b3124e', fontSize: 19, fontWeight: 800, textAlign: 'center', lineHeight: 1.1}}>{head}</div>
    {items.map((it, i) => { const done = s >= it.at; return <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${done ? pulse(s, it.at) : 1})`}}>
      <div style={{fontSize: 46, lineHeight: 1, color: done ? (it.mark === 'ok' ? '#e0245e' : '#6b2bd6') : '#ddd', fontFamily: 'DejaVu Sans, sans-serif'}}>{done && it.mark !== 'ok' ? '?' : '♥'}</div>
      <div style={{fontSize: 26, fontWeight: 800, color: '#4a0f27'}}>{it.label}</div></div>; })}
  </div>;
const Rank = ({s, items, head, accent}: {s: number; items: Item[]; head: string; accent: string}) => {
  const cur = [...items].reverse().find((it) => s >= it.at);
  const k = cur ? spring({frame: Math.round((s - cur.at) * FPS), fps: FPS, config: {damping: 12, stiffness: 170}}) : 0;
  const show = cur && s < cur.at + 2.6;
  return <>
    <div style={{position: 'absolute', left: 8, top: 520, width: 140, display: 'flex', flexDirection: 'column', gap: 12}}>
      <div style={{color: accent, fontSize: 18, fontWeight: 800, textAlign: 'center', letterSpacing: 1}}>{head}</div>
      {[...items].reverse().map((it, i) => { const done = s >= it.at; return <div key={i} style={{height: 96, borderRadius: 16, border: `4px solid ${done ? accent : 'rgba(255,255,255,.3)'}`,
        background: done ? 'rgba(0,0,0,.45)' : 'rgba(255,255,255,.06)', color: done ? accent : 'rgba(255,255,255,.35)', fontSize: 52, fontWeight: 800, display: 'flex', alignItems: 'center',
        justifyContent: 'center', transform: `scale(${done ? pulse(s, it.at) : 1})`}}>#{it.mark}</div>; })}
    </div>
    {show && <div style={{position: 'absolute', top: 330, left: 0, width: 1080, display: 'flex', justifyContent: 'center', transform: `scale(${0.6 + 0.4 * k})`, opacity: interpolate(s, [cur!.at + 2.3, cur!.at + 2.6], [1, 0], clamp)}}>
      <div style={{background: accent, color: '#0b1030', fontSize: 58, fontWeight: 800, padding: '10px 34px', borderRadius: 20, border: '6px solid #fff', boxShadow: '0 14px 40px rgba(0,0,0,.5)'}}>{cur!.label}</div></div>}
  </>;
};

export const KitschStory3: React.FC<{clip: string; music?: boolean}> = ({clip, music = true}) => {
  const P = K3S[clip], T = P.theme;
  const f = useCurrentFrame(), {fps} = useVideoConfig(), s = f / fps;
  let i = 0; P.segs.forEach((g, k) => { if (s >= g.start) i = k; });
  const seg = P.segs[i], local = s - seg.start;
  const enter = spring({frame: Math.round(local * fps), fps, config: {damping: 14, stiffness: 170}});
  const rot = T.tilt * (i % 2 ? 1 : -1) * (seg.kind === 'S' ? 0.4 : 1);
  const cardScale = (seg.kind === 'S' ? 0.75 : 0.72) * (T.scale ?? 1) * (0.94 + 0.06 * enter) * (1 + 0.025 * local / 4);
  const zk = (P.zooms ?? []).reduce((m, t) => Math.max(m, interpolate(s, [t - 0.02, t + 0.08, t + 0.5, t + 0.65], [0, 1, 1, 0], clamp)), 0);
  const punch = (P.stamps.some((x) => s >= x.at && s < x.at + 0.35) ? 1.05 : 1) * (1 + 0.12 * zk);
  const flash = i > 0 && local < 0.07 ? 0.8 : 0;
  // captions: 1–3 word chunks, cleared 0.7 s after the last word
  const chunks: Cap[][] = []; let cur: Cap[] = [];
  P.caps.forEach((w, k) => { cur.push(w); const nx = P.caps[k + 1]; if (/[.,!?]$/.test(w.t) || cur.length >= 3 || !nx || nx.real !== w.real || nx.a - w.a > 0.7) { chunks.push(cur); cur = []; } });
  const ci = chunks.findIndex((c, k) => s >= c[0].a - 0.05 && (k === chunks.length - 1 || s < chunks[k + 1][0].a - 0.05));
  const ch = ci >= 0 && s < chunks[ci][chunks[ci].length - 1].a + 1.2 ? chunks[ci] : null;
  const hl = new Set(P.hl);
  const capSize = ch && ch.map((w) => w.t).join(' ').length > 17 ? 62 : 74;
  const W = P.widget;
  return <AbsoluteFill style={{fontFamily: 'Montserrat', overflow: 'hidden', background: T.bg}}>
    <AbsoluteFill style={{opacity: 0.1, backgroundImage: `repeating-linear-gradient(-45deg, ${T.stripe} 0 20px, transparent 20px 84px)`, backgroundPosition: `${-f * 1.1}px 0`}} />
    <Particles f={f} kind={T.particles} />
    {/* footage card */}
    <div style={{position: 'absolute', left: 540 - 540 * cardScale, top: T.cardTop - 960 * cardScale, width: 1080 * cardScale, height: 1920 * cardScale,
      transform: `rotate(${rot}deg) scale(${punch})`, borderRadius: 40, overflow: 'hidden', border: '10px solid #fff', boxShadow: '0 30px 80px rgba(0,0,0,.5)', background: '#000'}}>
      {P.segs.map((g, k) => k === i && <Sequence key={k} from={Math.round(g.start * fps)} durationInFrames={Math.round((g.v[1] - g.v[0]) * fps) + 1}>
        <OffthreadVideo src={staticFile(SRC[g.src])} startFrom={Math.round(g.v[0] * fps)} volume={g.a !== undefined ? 0 : g.kind === 'S' ? 1 : 0.22}
          style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.06) saturate(1.12)', transformOrigin: 'top center',
            transform: g.crop ? `scale(${1920 / (g.crop[1] - g.crop[0])}) translateY(${-g.crop[0] / 1920 * 100}%)` : undefined}} /></Sequence>)}
      {seg.kind === 'S' && <div style={{position: 'absolute', top: 22, left: 22, background: 'rgba(0,0,0,.55)', color: '#fff', fontSize: 28, fontWeight: 800, padding: '6px 16px', borderRadius: 20}}>REAL MOMENT</div>}
    </div>
    {/* title (from frame 0) */}
    <div style={{position: 'absolute', top: 34, left: 36, right: 36, textAlign: 'center', fontSize: 56, fontWeight: 800, lineHeight: 1.12, color: '#fff',
      textShadow: '0 5px 18px rgba(0,0,0,.45)', transform: `scale(${spring({frame: f, fps, from: 0.92, to: 1, config: {damping: 12}})})`}}>
      {P.title.split(' ').map((w, k) => <span key={k} style={{color: hl.has(w.replace(/[^A-Za-z]/g, '').toUpperCase()) && w === w.toUpperCase() ? T.accent : '#fff'}}>{w} </span>)}</div>
    {W.type === 'none' ? null : W.type === 'route' && <Route s={s} items={W.items} head={W.head} accent={T.accent} />}
    {W.type === 'list' && <NiceList s={s} items={W.items} head={W.head} />}
    {W.type === 'rank' && <Rank s={s} items={W.items} head={W.head} accent={T.accent} />}
    {(P.bubbles ?? []).map((b, k) => s >= b.at && s < b.at + 1.5 && <div key={`b${k}`} style={{position: 'absolute', top: 420 + (k % 2) * 110, left: 0, width: 1080, display: 'flex',
      justifyContent: k % 2 ? 'flex-end' : 'flex-start', padding: '0 70px', opacity: interpolate(s, [b.at + 1.3, b.at + 1.5], [1, 0], clamp)}}>
      <div style={{background: '#fff', color: '#111', fontSize: 50, fontWeight: 800, padding: '12px 28px', borderRadius: 26, border: '5px solid #111', boxShadow: '0 12px 30px rgba(0,0,0,.45)',
        transform: `rotate(${k % 2 ? 4 : -4}deg) scale(${spring({frame: Math.round((s - b.at) * FPS), fps: FPS, from: 0.3, to: 1, config: {damping: 10, stiffness: 240}})})`}}>{b.text}</div></div>)}
    {P.labels.map((l, k) => <Label key={k} text={l.text} at={l.at} s={s} color="#b3122e" />)}
    {P.stamps.map((x, k) => <Stamp key={k} {...x} s={s} />)}
    {/* captions */}
    {ch && <div style={{position: 'absolute', top: 1120, left: 30, right: 30, textAlign: 'center'}}>
      {ch.map((w, k) => { const on = s >= w.a - 0.04, act = on && (k === ch.length - 1 || s < ch[k + 1].a - 0.04);
        return <span key={k} style={{display: 'inline-block', margin: '0 14px', fontSize: capSize, fontWeight: 800, textTransform: 'uppercase', opacity: on ? 1 : 0.35,
          color: w.real ? (act ? T.accent : '#fff3c4') : (act ? '#fff' : 'rgba(255,255,255,.82)'), WebkitTextStroke: `10px ${T.capStroke}`, paintOrder: 'stroke fill',
          transform: `scale(${act ? 1.1 : 1})`}}>{w.real && k === 0 ? '“' : ''}{w.t.replace(/[.,!?]$/, '')}{w.real && k === ch.length - 1 ? '”' : ''}</span>; })}
    </div>}
    <AbsoluteFill style={{background: `rgba(255,255,255,${flash})`}} />
    {/* audio */}
    {P.segs.map((g, k) => g.kind === 'N' && <Sequence key={`n${k}`} from={Math.round(g.start * fps)} durationInFrames={Math.round((g.n![1] - g.n![0]) * fps) + 3}>
      <Audio src={staticFile(P.narr)} startFrom={Math.round(g.n![0] * fps)} /></Sequence>)}
    {P.segs.map((g, k) => g.a !== undefined && <Sequence key={`ja${k}`} from={Math.round(g.start * fps)} durationInFrames={Math.round((g.v[1] - g.v[0]) * fps) + 1}>
      <Audio src={staticFile(SRC[g.src])} startFrom={Math.round(g.a * fps)} volume={g.kind === 'S' ? 1 : 0.22} /></Sequence>)}
    {P.segs.slice(1).map((g, k) => <Sequence key={`w${k}`} from={Math.max(0, Math.round((g.start - 0.12) * fps))}><Audio src={staticFile('kitsch/whoosh.mp3')} volume={0.13} /></Sequence>)}
    {P.dings.map((t, k) => <Sequence key={`d${k}`} from={Math.round(t * fps)}><Audio src={staticFile('kitsch/s_ding.mp3')} volume={0.3} /></Sequence>)}
    {(P.sfx ?? []).map((x, k) => <Sequence key={`x${k}`} from={Math.max(0, Math.round(x.at * fps))}><Audio src={staticFile(`kitsch/${x.f}.mp3`)} volume={x.vol} /></Sequence>)}
    {(P.bubbles ?? []).map((b, k) => <Sequence key={`bp${k}`} from={Math.round(b.at * fps)}><Audio src={staticFile('kitsch/pop.mp3')} volume={0.25} /></Sequence>)}
    {P.pops.map((t, k) => <Sequence key={`p${k}`} from={Math.round(t * fps)}><Audio src={staticFile('kitsch/pop.mp3')} volume={0.2} /></Sequence>)}
    {music && <Audio src={staticFile('kitsch/m_brega_n.mp3')} startFrom={({delivery: 40, women: 70, ranking: 11, xmom: 25, xtax: 55, xmystery: 85} as Record<string, number>)[clip] * fps}
      volume={(fr) => { const t = fr / fps; let ii = 0; P.segs.forEach((g, k) => { if (t >= g.start) ii = k; }); return (P.segs[ii].kind === 'S' ? 0.05 : 0.1) * Math.min(1, t / 0.4, (P.dur - t) / 0.5); }} />}
  </AbsoluteFill>;
};
export const SRC_FPS_K3 = SRC_FPS;
