// Boeshi "same guy btw" contrast meme, part B (1080x1920 @ 60): after the high-pitched stream moment (KreekV2 part A) the
// edit hard-cuts on a white flash to his fitness account's physique reveal, with the GigaChad theme dropping on the cut.
// Same top title as part A (continuity), big "SAME GUY btw 💀" pop, Boeshi Twitch overlay kept on screen (campaign rule).
// Part A + part B are joined by kreek/concat_ab.sh.
import {loadFont} from '@remotion/fonts';
import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

loadFont({family: 'Montserrat', url: staticFile('Montserrat-Black.woff2'), weight: '800'});
type F = {src: string; from: number; dur: number; top: string; hl: string[]; text: string; sub?: string; music_from: number};
export const BOFIT: Record<string, F> = {
  bo6_coffee: {src: 'boeshi/fit_a.mp4', from: 1.0, dur: 6.5, top: "Bro's voice does NOT match his appearance 💀", hl: ['NOT'],
    text: 'SAME GUY btw 💀', music_from: 29.9},
  bo6_won: {src: 'boeshi/fit_b.mp4', from: 0.4, dur: 6.5, top: "Can't believe these two are the same person 💀", hl: ['SAME'],
    text: 'SAME GUY btw 💀', music_from: 29.9},
};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const norm = (t: string) => t.replace(/[^A-Za-z0-9']/g, '').toUpperCase();

export const BoFit: React.FC<{clip: string}> = ({clip}) => {
  const C = BOFIT[clip];
  const f = useCurrentFrame(), {fps} = useVideoConfig(), s = f / fps;
  const white = interpolate(s, [0, 2 / fps, 6 / fps], [1, 0.9, 0], clamp);
  const zoom = 1.12 - 0.06 * Math.min(1, s / C.dur);                 // starts punched in, slow pull-out
  const shake = s < 0.35 ? 12 * (1 - s / 0.35) * Math.sin(f * 2.3) : 0;
  const tk = spring({frame: f - Math.round(0.45 * fps), fps, config: {damping: 9, stiffness: 220}});
  const tOut = interpolate(s, [C.dur - 0.25, C.dur], [1, 0], clamp);
  const hl = new Set(C.hl.map(norm));
  return <AbsoluteFill style={{background: '#000', fontFamily: 'Montserrat', overflow: 'hidden'}}>
    <AbsoluteFill style={{transform: `translate(${shake}px, ${shake * 0.5}px) scale(${zoom})`}}>
      <OffthreadVideo src={staticFile(C.src)} startFrom={Math.round(C.from * fps)} muted
        style={{width: 1080, height: 1920, objectFit: 'cover', filter: 'contrast(1.12) saturate(1.15)'}} />
    </AbsoluteFill>
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.65) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 72%, rgba(0,0,0,.55) 100%)'}} />
    {/* same top title as part A */}
    <div style={{position: 'absolute', top: 40, left: 40, right: 40, height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{textAlign: 'center', fontSize: 62, fontWeight: 800, lineHeight: 1.12, color: '#fff', textShadow: '0 4px 14px rgba(0,0,0,.6)'}}>
        {C.top.split(' ').map((w, i) => <span key={i} style={{color: hl.has(norm(w)) ? '#FFE135' : '#fff'}}>{w} </span>)}</div></div>
    {/* the punchline */}
    {s > 0.4 && <div style={{position: 'absolute', top: 1150, left: 0, width: 1080, textAlign: 'center', opacity: tOut,
      transform: `scale(${0.4 + 0.6 * tk}) rotate(${(1 - tk) * -8}deg)`}}>
      <span style={{fontSize: 104, fontWeight: 800, color: '#FFE135', WebkitTextStroke: '14px #000', paintOrder: 'stroke fill', textShadow: '0 10px 30px rgba(0,0,0,.7)'}}>{C.text}</span>
    </div>}
    <Img src={staticFile('boeshi/overlay.png')} style={{position: 'absolute', left: 540 - 330, top: 1660, width: 660}} />
    <AbsoluteFill style={{background: `rgba(255,255,255,${white})`}} />
    <Audio src={staticFile('tl/music/gigachad.wav')} startFrom={Math.round(C.music_from * fps)}
      volume={(fr) => 0.95 * interpolate(fr / fps, [C.dur - 0.5, C.dur], [1, 0], clamp)} />
    <Audio src={staticFile('sfx2/camera_flash.mp3')} volume={0.5} />
  </AbsoluteFill>;
};
