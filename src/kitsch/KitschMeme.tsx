// Kitsch x Saint Nic — "meme frame" batch (1080x1920 @ 30 fps), built for the SWIPE test (viewed-vs-swiped) after the narrated
// storytime only kept 12.1 % of viewers. Rules: frame 0 = big readable hook + the strongest picture + a real line starting
// immediately; footage almost full-width (1080x1350 window of the vertical source); 7–10 s; cut every 1–2 s; payoff stamp + punch-in;
// ending that loops into the start; captions middle-centre (clear of the platform title/description UI). Real audio only (+ optional soft bed).
import {loadFont} from '@remotion/fonts';
import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import NIC from './src_words.json';
import V1 from './v1_words.json';

loadFont({family: 'Montserrat', url: staticFile('Montserrat-Black.woff2'), weight: '800'});
type Src = 'nic' | 'v1';
type Seg = {src: Src; v: [number, number]; cy?: number; a?: number};   // a = audio start (J-cut: picture v, sound from a)
type Clip = {hook: string; segs: Seg[]; pops: {text: string; seg: number; t: number}[]; stamps: {text: string; color: string; seg: number; t: number; rot: number}[];
  punch: {seg: number; t: number}[]; music: number};
const FILE: Record<Src, string> = {nic: 'kitsch/nic.mp4', v1: 'kitsch/v1.mp4'};
const WORDS: Record<Src, (number | string)[][]> = {nic: NIC as (number | string)[][], v1: V1 as (number | string)[][]};
// hook text: *word* = red highlight
export const MEME: Record<string, Clip> = {
  mom: {hook: 'He pulled up to his mom\'s house with a *WHOLE* Jeep of Kitsch 😭', music: 40,
    segs: [{src: 'nic', v: [46.72, 48.17], a: 46.3}, {src: 'nic', v: [39.35, 40.95]}, {src: 'nic', v: [41.45, 42.9]}, {src: 'nic', v: [43.5, 46.0], cy: 960}, {src: 'nic', v: [59.0, 61.0], cy: 760}],
    pops: [{text: 'the WHOLE Jeep 📦📦📦', seg: 3, t: 43.7}], stamps: [{text: 'SON OF THE YEAR', color: '#d4a017', seg: 0, t: 46.9, rot: -6}],
    punch: [{seg: 0, t: 46.8}, {seg: 1, t: 39.42}, {seg: 3, t: 44.6}]},
  tax: {hook: 'He gave his sister Kitsch… then took a *"Saint Nic tax"* 😭', music: 70,
    segs: [{src: 'nic', v: [36.95, 38.55]}, {src: 'nic', v: [49.3, 51.95], cy: 1000}, {src: 'nic', v: [51.95, 53.3], cy: 760}, {src: 'nic', v: [59.0, 60.6], cy: 760}],
    pops: [{text: 'wait… 👀', seg: 1, t: 49.5}], stamps: [{text: 'SAINT NIC TAX', color: '#c8102e', seg: 2, t: 52.2, rot: -7}],
    punch: [{seg: 1, t: 50.2}, {seg: 2, t: 52.14}]},
  mystery: {hook: 'He refuses to say who the last Kitsch gift is for 👀', music: 11,
    segs: [{src: 'nic', v: [55.65, 58.95], a: 54.35}, {src: 'nic', v: [59.0, 60.8], cy: 760}, {src: 'v1', v: [57.85, 60.65]}],
    pops: [{text: 'he knows 😏', seg: 1, t: 59.2}], stamps: [{text: 'NO COMMENT 🤐', color: '#6b2bd6', seg: 0, t: 57.2, rot: 6}],
    punch: [{seg: 0, t: 57.2}, {seg: 1, t: 59.3}]},
  mirror: {hook: 'Nic hyping himself up before the Kitsch delivery 😭', music: 25,
    segs: [{src: 'v1', v: [60.75, 64.75]}, {src: 'nic', v: [19.5, 20.15], cy: 760}, {src: 'nic', v: [20.85, 21.9], cy: 760}, {src: 'v1', v: [65.85, 68.5], cy: 760}],
    pops: [{text: 'the confidence 😭', seg: 0, t: 63.0}], stamps: [{text: 'NOT CONVINCED', color: '#c8102e', seg: 2, t: 21.5, rot: -6}],
    punch: [{seg: 0, t: 64.2}, {seg: 2, t: 21.5}]},
  sister: {hook: 'POV: your brother is *Nic from Love Island* 🎅', music: 55,
    segs: [{src: 'nic', v: [19.5, 20.15], cy: 760}, {src: 'nic', v: [20.85, 21.9], cy: 760}, {src: 'nic', v: [22.0, 23.9], cy: 760}, {src: 'nic', v: [31.45, 32.65]},
      {src: 'nic', v: [36.55, 38.55]}, {src: 'nic', v: [59.0, 60.5], cy: 760}],
    pops: [{text: 'Kitsch holiday sets 🎁', seg: 4, t: 36.7}], stamps: [{text: 'SHE CAVED 😭', color: '#1f9d55', seg: 4, t: 38.1, rot: -6}],
    punch: [{seg: 1, t: 21.3}, {seg: 4, t: 38.1}]},
};
export const memeDur = (c: Clip) => c.segs.reduce((a, g) => a + g.v[1] - g.v[0], 0);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const FIXW: Record<string, string> = {nick: 'Nic', 'nick.': 'Nic.', 'nick?': 'Nic?', kish: 'Kitsch', 'nick,': 'Nic,'};

export const KitschMeme: React.FC<{clip: string; music?: boolean}> = ({clip, music = true}) => {
  const C = MEME[clip];
  const f = useCurrentFrame(), {fps} = useVideoConfig(), s = f / fps;
  const starts: number[] = []; let acc = 0; C.segs.forEach((g) => { starts.push(acc); acc += g.v[1] - g.v[0]; });
  const A0 = (g: Seg) => g.a ?? g.v[0];
  const dur = acc, tOf = (seg: number, t: number) => starts[seg] + t - A0(C.segs[seg]);   // beat times are SOURCE-AUDIO times
  let i = 0; starts.forEach((t, k) => { if (s >= t) i = k; });
  const local = s - starts[i];
  const punches = C.punch.map((p) => tOf(p.seg, p.t)), stamps = C.stamps.map((x) => ({...x, at: tOf(x.seg, x.t)})), pops = C.pops.map((p) => ({...p, at: tOf(p.seg, p.t)}));
  const pk = punches.reduce((m, t) => Math.max(m, interpolate(s, [t - 0.02, t + 0.06, t + 0.45, t + 0.6], [0, 1, 1, 0], clamp)), 0);
  const zoom = (1 + 0.035 * local / 2) * (1 + 0.12 * pk);
  const flash = i > 0 && local < 2 / 30 ? 0.7 : 0;
  // captions: words of all segs on the output timeline, 1–2 word chunks
  const caps = C.segs.flatMap((g, k) => { const a0 = A0(g), a1 = a0 + g.v[1] - g.v[0]; return WORDS[g.src].filter((w) => (w[0] as number) >= a0 - 0.05 && (w[0] as number) < a1 - 0.05)
    .map((w) => ({t: FIXW[String(w[2]).toLowerCase()] ?? String(w[2]), a: starts[k] + Math.max(0, (w[0] as number) - a0), b: starts[k] + Math.min(a1, w[1] as number) - a0})); });
  const chunks: typeof caps[] = []; let cur: typeof caps = [];
  caps.forEach((w, k) => { cur.push(w); const nx = caps[k + 1]; if (/[.,!?]$/.test(w.t) || cur.length >= 2 || !nx || nx.a - w.b > 0.35) { chunks.push(cur); cur = []; } });
  const ch = chunks.find((c) => s >= c[0].a - 0.04 && s <= c[c.length - 1].b + 0.25);
  const H = 1350, Y0 = 400;   // footage window
  const g = C.segs[i], cy = g.cy ?? 860;
  return <AbsoluteFill style={{background: '#ffffff', fontFamily: 'Montserrat', overflow: 'hidden'}}>
    {/* footage: 1080x1350 window of the 1080x1920 source, centred on cy */}
    <div style={{position: 'absolute', left: 0, top: Y0, width: 1080, height: H, overflow: 'hidden', background: '#000'}}>
      {C.segs.map((sg, k) => k === i && <Sequence key={k} from={Math.round(starts[k] * fps)} durationInFrames={Math.round((sg.v[1] - sg.v[0]) * fps) + 1}>
        <div style={{position: 'absolute', left: 0, top: H / 2 - cy, width: 1080, height: 1920, transform: `scale(${zoom})`, transformOrigin: `540px ${cy}px`}}>
          <OffthreadVideo muted src={staticFile(FILE[sg.src])} startFrom={Math.round(sg.v[0] * fps)} style={{width: 1080, height: 1920, filter: 'contrast(1.07) saturate(1.15)'}} />
        </div></Sequence>)}
      {pops.map((p, k) => s >= p.at && s < p.at + 1.5 && <div key={k} style={{position: 'absolute', top: 70, left: 0, width: 1080, display: 'flex', justifyContent: 'center',
        transform: `scale(${spring({frame: Math.round((s - p.at) * fps), fps, from: 0.5, to: 1, config: {damping: 11, stiffness: 220}})})`}}>
        <div style={{background: '#fff', color: '#111', fontSize: 50, fontWeight: 800, padding: '10px 26px', borderRadius: 18, boxShadow: '0 10px 30px rgba(0,0,0,.35)'}}>{p.text}</div></div>)}
    </div>
    {/* hook: visible at full size from frame 0 */}
    <div style={{position: 'absolute', top: 40, left: 40, right: 40, height: 330, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
      <div style={{fontSize: 66, fontWeight: 800, lineHeight: 1.12, color: '#111', letterSpacing: -0.5}}>
        {C.hook.split(/(\*[^*]+\*)/).map((part, k) => part.startsWith('*') ? <span key={k} style={{color: '#e0102e'}}>{part.slice(1, -1)}</span> : <span key={k}>{part}</span>)}</div>
    </div>
    {/* stamp on the payoff */}
    {stamps.map((x, k) => s >= x.at && s < x.at + 1.0 && <div key={k} style={{position: 'absolute', top: 640, left: 0, width: 1080, display: 'flex', justifyContent: 'center',
      transform: `rotate(${x.rot}deg) scale(${interpolate(s, [x.at, x.at + 0.1, x.at + 0.2], [1.8, 0.95, 1], clamp)})`}}>
      <div style={{border: `9px solid ${x.color}`, color: x.color, background: 'rgba(255,255,255,.95)', fontSize: x.text.length > 11 ? 70 : 84, fontWeight: 800, padding: '6px 30px', borderRadius: 18,
        boxShadow: '0 14px 40px rgba(0,0,0,.4)', whiteSpace: 'nowrap'}}>{x.text}</div></div>)}
    {/* captions: middle-centre */}
    {ch && <div style={{position: 'absolute', top: 1090, left: 30, right: 30, textAlign: 'center'}}>
      {ch.map((w, k) => { const act = s >= w.a - 0.04 && (k === ch.length - 1 || s < ch[k + 1].a - 0.04);
        return <span key={k} style={{display: 'inline-block', margin: '0 16px', fontSize: 92, fontWeight: 800, textTransform: 'uppercase', opacity: s >= w.a - 0.04 ? 1 : 0.4,
          color: act ? '#FFE135' : '#fff', WebkitTextStroke: '12px #000', paintOrder: 'stroke fill', transform: `scale(${act ? 1.08 : 1})`}}>{w.t.replace(/[.,!?]$/, '')}</span>; })}
    </div>}
    <AbsoluteFill style={{background: `rgba(255,255,255,${flash})`}} />
    {/* audio: real source audio (per seg), soft sfx, optional bed */}
    {C.segs.map((sg, k) => <Sequence key={`a${k}`} from={Math.round(starts[k] * fps)} durationInFrames={Math.round((sg.v[1] - sg.v[0]) * fps) + 1}>
      <Audio src={staticFile(FILE[sg.src])} startFrom={Math.round(A0(sg) * fps)} /></Sequence>)}
    {starts.slice(1).map((t, k) => <Sequence key={`w${k}`} from={Math.max(0, Math.round((t - 0.1) * fps))}><Audio src={staticFile('kitsch/whoosh.mp3')} volume={0.1} /></Sequence>)}
    {stamps.map((x, k) => <Sequence key={`d${k}`} from={Math.round(x.at * fps)}><Audio src={staticFile('kitsch/s_ding.mp3')} volume={0.3} /></Sequence>)}
    {pops.map((p, k) => <Sequence key={`p${k}`} from={Math.round(p.at * fps)}><Audio src={staticFile('kitsch/pop.mp3')} volume={0.22} /></Sequence>)}
    {music && <Audio src={staticFile('kitsch/m_brega_n.mp3')} startFrom={C.music * fps} volume={(fr) => 0.07 * Math.min(1, fr / fps / 0.2, (dur - fr / fps) / 0.3)} />}
  </AbsoluteFill>;
};
