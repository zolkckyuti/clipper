// Viral-shorts layer shared by TrevClip and KreekV2 (user, 2026-11-25: "HOOK → MAKE THEM WATCH THE FULL VID → ENGAGE (like, comment,
// subscribe)", learned from the reference BYB shorts + the editing-guideline doc):
//  - cta:     italic mid-video engagement prompt, e.g. "*comment your NBA GOAT*" (refs put it on the lower part of the footage)
//  - imgpops: big centred image pop-ups. kind 'good' = green flash + ding/correct, 'meme' = red flash + fahhh/shock (guideline)
//  - money:   raining-money overlay (public/res/money_fall.webm, keyed) + money sfx, BEHIND the pop-up image (guideline)
//  - callout: red circle + arrow and a red italic name call-out ("*TREVOR LAWRENCE*")
//  - endcta:  short "like + follow" line in the last ~1.6 s (doesn't block the loop)
import React from 'react';
import {Img, OffthreadVideo, Sequence, interpolate, spring, staticFile} from 'remotion';

export type FX = {
  cta?: [number, string];
  imgpops?: [number, string, 'good' | 'meme', number?][];   // [t, image (public path), kind, size px]
  money?: [number, number][];                                 // [t, duration]
  callout?: [number, string, number, number][];               // [t, text, x, y] (frame px)
  endcta?: string;
  dur: number;
};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const FPS = 60;

/** sfx the layer needs, as [file, t, volume] for the host template's sfx list */
export const fxSfx = (P: FX): [string, number, number][] => [
  ...(P.imgpops ?? []).flatMap(([t, , kind]): [string, number, number][] => kind === 'good'
    ? [['res/ding.mp3', t, 0.45], ['res/correct.mp3', t + 0.05, 0.3]] : [['res/fahhh.mp3', t, 0.5], ['res/shock.mp3', t + 0.05, 0.3]]),
  ...(P.money ?? []).map(([t]): [string, number, number] => ['res/money.mp3', t, 0.45]),
  ...(P.callout ?? []).map(([t]): [string, number, number] => ['res/swoosh.mp3', t, 0.35]),
  ...(P.cta ? [['res/swoosh.mp3', P.cta[0], 0.25] as [string, number, number]] : []),
];

/** colour flash (0..1, colour) the host should tint its footage panel with */
export const fxFlash = (P: FX, s: number): [number, string] => {
  for (const [t, , kind] of P.imgpops ?? []) {
    const a = interpolate(s, [t, t + 0.04, t + 0.28], [0, 0.55, 0], clamp);
    if (a > 0) return [a, kind === 'good' ? 'rgba(43,255,90,1)' : 'rgba(255,30,40,1)'];
  }
  return [0, 'transparent'];
};

export const ViralFX: React.FC<{P: FX; s: number; f: number; panelTop: number; panelH: number}> = ({P, s, f, panelTop, panelH}) => {
  const cy = panelTop + panelH / 2;
  return <>
    {(P.money ?? []).map(([t, d], i) => s >= t && s < t + d && (
      <Sequence key={'m' + i} from={Math.round(t * FPS)} durationInFrames={Math.round(d * FPS)} layout="none">
        <div style={{position: 'absolute', left: 0, top: panelTop, width: 1080, height: panelH, overflow: 'hidden', opacity: interpolate(s, [t, t + 0.15, t + d - 0.3, t + d], [0, 1, 1, 0], clamp)}}>
          <OffthreadVideo src={staticFile('res/money_fall.webm')} transparent muted style={{width: 1080, height: 1920, marginTop: (panelH - 1920) / 2}} />
        </div>
      </Sequence>))}
    {(P.imgpops ?? []).map(([t, src, , size], i) => {
      if (s < t || s > t + 1.35) return null;
      const k = spring({frame: Math.round((s - t) * FPS), fps: FPS, config: {damping: 11, stiffness: 230}});
      const out = interpolate(s, [t + 1.15, t + 1.35], [1, 0], clamp);
      const S = size ?? 520;
      return <Img key={'p' + i} src={staticFile(src)} style={{position: 'absolute', left: 540 - S / 2, top: cy - S / 2 - 150, width: S, height: S, objectFit: 'contain',
        opacity: out, transform: `scale(${0.3 + 0.7 * k}) rotate(${Math.sin((s - t) * 8) * 4}deg)`, filter: 'drop-shadow(0 16px 30px rgba(0,0,0,.6)) contrast(1.08) saturate(1.1)'}} />;
    })}
    {(P.callout ?? []).map(([t, txt, x, y], i) => {
      if (s < t || s > t + 1.8) return null;
      const k = spring({frame: Math.round((s - t) * FPS), fps: FPS, config: {damping: 12, stiffness: 200}});
      const out = interpolate(s, [t + 1.55, t + 1.8], [1, 0], clamp);
      return <div key={'c' + i} style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, opacity: out}}>
        <Img src={staticFile('res/circle_arrow.png')} style={{position: 'absolute', left: x - 170, top: y - 170, width: 340, height: 340, transform: `scale(${k})`}} />
        <div style={{position: 'absolute', left: 0, width: 1080, top: y + 150, textAlign: 'center', fontSize: 58, fontWeight: 800, fontStyle: 'italic', color: '#FF2A2A',
          WebkitTextStroke: '8px #000', paintOrder: 'stroke fill', transform: `scale(${k})`}}>{txt}</div>
      </div>;
    })}
    {P.cta && s >= P.cta[0] && s < P.cta[0] + 2.8 && <div style={{position: 'absolute', left: 40, right: 40, top: panelTop + panelH - 120, textAlign: 'center',
      fontSize: 46, fontWeight: 800, fontStyle: 'italic', color: '#fff', WebkitTextStroke: '7px #000', paintOrder: 'stroke fill',
      opacity: interpolate(s, [P.cta[0], P.cta[0] + 0.15, P.cta[0] + 2.55, P.cta[0] + 2.8], [0, 1, 1, 0], clamp),
      transform: `translateY(${interpolate(s, [P.cta[0], P.cta[0] + 0.2], [20, 0], clamp)}px)`}}>{P.cta[1]}</div>}
    {P.endcta && s >= P.dur - 1.6 && <div style={{position: 'absolute', left: 0, width: 1080, top: panelTop + panelH - 110, display: 'flex', justifyContent: 'center',
      opacity: interpolate(s, [P.dur - 1.6, P.dur - 1.4], [0, 1], clamp),
      transform: `scale(${spring({frame: f - Math.round((P.dur - 1.6) * FPS), fps: FPS, config: {damping: 10, stiffness: 220}, from: 0.6, to: 1})})`}}>
      <div style={{background: '#FF0033', color: '#fff', fontSize: 40, fontWeight: 800, padding: '12px 30px', borderRadius: 40, border: '4px solid #fff', boxShadow: '0 10px 28px rgba(0,0,0,.5)'}}>{P.endcta}</div>
    </div>}
  </>;
};
