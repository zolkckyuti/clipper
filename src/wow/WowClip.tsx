// World of Warcraft: Forever campaign clips (Content Rewards / Clipping Culture, DE + UK briefs) — 1080x1920 @ 60 fps.
// Source is Blizzard's OFFICIAL vertical trailer (no voice-over) from the campaign's Frame.io folder, so the edit is a
// cold-open montage of real trailer shots: hook shot -> logo reveal -> one contiguous trailer run, with the trailer's own
// soundtrack kept as the ONLY music (brief: original audio clearly audible, no AI voice). Style carried over from the
// other clips: punch-zoom transitions with ONE flash colour, slow push-in, a header line just below the centre.
// On-screen text must be genuine and say the game is OUT (not "coming soon") — and never the trailer's pre-order end card.
import {loadFont} from '@remotion/fonts';
import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

loadFont({family: 'Montserrat', url: staticFile('Montserrat-Black.woff2'), weight: '800'});
type Clip = {src: string; segs: [number, number][]; l1: string; l2: string; hold: number; flash: string; sfx: [string, number, number][]};
// segs are SOURCE seconds; both trailers (deDE / enGB) share the same cut timing.
export const WOW: Record<string, Clip> = {
  de: {src: 'wow/de_vrt.mp4', segs: [[72.8, 74.1], [38.0, 42.72], [42.75, 57.73]],
    l1: 'WORLD OF WARCRAFT: FOREVER', l2: 'IST JETZT DA', hold: 5.9, flash: 'rgba(40,140,255,', sfx: []},
  uk: {src: 'wow/uk_vrt.mp4', segs: [[98.45, 100.25], [38.0, 42.72], [70.97, 89.15]],
    l1: 'WORLD OF WARCRAFT: FOREVER', l2: 'IS OUT NOW', hold: 6.4, flash: 'rgba(40,140,255,', sfx: []},
};
export const wowDur = (k: string) => WOW[k].segs.reduce((s, [a, b]) => s + b - a, 0);
const FPS = 60;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const WowClip: React.FC<{clip: string}> = ({clip}) => {
  const C = WOW[clip];
  const f = useCurrentFrame(), {fps} = useVideoConfig(), s = f / fps;
  const starts: number[] = []; let o = 0;
  for (const [a, b] of C.segs) { starts.push(o); o += b - a; }
  const total = o, cuts = starts.slice(1);
  const si = Math.max(0, starts.findIndex((t, i) => s >= t && (i === starts.length - 1 || s < starts[i + 1])));
  // transitions: zoom punch + blur + ONE-colour flash on every cut, shake on the logo slam
  const TR = 0.26;
  const ci = cuts.findIndex((t) => s >= t && s < t + TR);
  const tk = ci >= 0 ? 1 - (s - cuts[ci]) / TR : 0;
  const flash = cuts.reduce((m, t) => Math.max(m, interpolate(s, [t - 0.02, t, t + 0.05, t + 0.12], [0, 0.75, 0.75, 0], clamp)), 0);
  const push = 1 + 0.045 * Math.min(1, (s - starts[si]) / Math.max(1, (C.segs[si][1] - C.segs[si][0])));
  const zoom = push * (1 + 0.3 * tk * tk);
  const shake = ci === 0 ? 10 * tk * Math.sin(f * 2.6) : 0;
  // header: springs in on frame 0 (hook), holds through the logo reveal, then gets out of the trailer's own titles
  const hk = spring({frame: f, fps, config: {damping: 12, stiffness: 170}});
  const l2k = spring({frame: f - 8, fps, config: {damping: 10, stiffness: 190}});
  const out = interpolate(s, [C.hold - 0.25, C.hold], [1, 0], clamp);
  const fadeEnd = interpolate(s, [total - 0.25, total], [1, 0.0], clamp);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{transform: `translate(${shake}px, ${shake * 0.6}px) scale(${zoom})`, filter: `blur(${12 * tk * tk}px) saturate(1.12) contrast(1.05)`, opacity: fadeEnd}}>
        {C.segs.map(([a, b], i) => (
          <Sequence key={i} from={Math.round(starts[i] * FPS)} durationInFrames={Math.round((b - a) * FPS)}>
            <OffthreadVideo src={staticFile(C.src)} startFrom={Math.round(a * FPS)} endAt={Math.round(b * FPS)} style={{width: 1080, height: 1920}}
              // 5-frame micro fades so the trailer score never clicks at a join
              volume={(fr) => interpolate(fr, [0, 5, (b - a) * FPS - 5, (b - a) * FPS], [0, 1, 1, 0], clamp)} />
          </Sequence>
        ))}
      </AbsoluteFill>
      <AbsoluteFill style={{background: `${C.flash}${flash})`, mixBlendMode: 'screen'}} />
      <div style={{position: 'absolute', top: 1180, width: '100%', textAlign: 'center', fontFamily: 'Montserrat', fontWeight: 800, opacity: out,
        transform: `scale(${0.6 + 0.4 * hk})`}}>
        <div style={{display: 'inline-block', fontSize: 50, color: '#fff', letterSpacing: 1, padding: '10px 26px', background: 'rgba(0,0,0,0.55)', borderRadius: 18,
          WebkitTextStroke: '2px #000', paintOrder: 'stroke fill'}}>{C.l1}</div>
        <div style={{marginTop: 14, fontSize: 92, color: '#4fb6ff', WebkitTextStroke: '10px #000', paintOrder: 'stroke fill', textShadow: '0 6px 18px rgba(0,0,0,0.7)',
          transform: `scale(${l2k}) rotate(${(1 - l2k) * -6}deg)`}}>{C.l2}</div>
      </div>
      {cuts.map((t, i) => (
        <Sequence key={'w' + i} from={Math.max(0, Math.round((t - 0.14) * FPS))}>
          <Audio src={staticFile('kreek/music/whoosh.mp3')} volume={0.22} />
        </Sequence>
      ))}
      {C.sfx.map(([n, t, v], i) => (
        <Sequence key={'s' + i} from={Math.round(t * FPS)}><Audio src={staticFile(`sfx2/${n}.mp3`)} volume={v} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
