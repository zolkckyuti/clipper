// Blocky story #1 — "In this town, every time you lie, your head gets bigger." (1080x1920, 30 fps, ~22 s)
// Every shot hangs off the narration's word timestamps (vo_lie.words.json).
import {loadFont} from '@remotion/fonts';
import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill, staticFile, useCurrentFrame} from 'remotion';
import {Avatar, Baseplate, Bowl, Cam, Captions, Dog, House, Road, School, Sky, Soundtrack, Tree, Window, blinkAt, chunks, ease, easeOut, idlePose, lerp, lerp3, loadWords, plastic,
  pop, prog, walkPose, wordAt, type Look, type V3} from './kit';
import raw from './vo_lie.words.json';

loadFont({family: 'Montserrat', url: staticFile('Montserrat-Black.woff2'), weight: '800'});
const OFF = 300;
const W = loadWords(raw, OFF);
const at = (w: string, n = 0) => wordAt(W, w, n);
export const LIE_MS = at('town', 1) + 1500;
const S = {hook: 0, jake: at('Jake'), teeth: at('He'), dog: at('He', 1), door: at('By'), mom: at('Then'), ask: at('Did'), want: at('He', 2), shrink: at('and'),
  teacher: at("That's"), end: LIE_MS};
const ORDER = ['hook', 'jake', 'teeth', 'dog', 'door', 'mom', 'ask', 'want', 'shrink', 'teacher'] as const;
const C = chunks(W);

const JAKE: Look = {shirt: '#2f80ed', pants: '#3d3d3d', hair: 'short', hairColor: '#6b3e1f', shoes: '#ffffff'};
const MOM: Look = {shirt: '#e84393', pants: '#2d3436', hair: 'long', hairColor: '#3b2314', skin: '#f1c27d'};
const TEACHER: Look = {shirt: '#27ae60', pants: '#2c3e50', hair: 'none', glasses: true, tie: '#c0392b', skin: '#e0ac69'};
const GUY: Look = {shirt: '#f39c12', pants: '#34495e', hair: 'cap', capColor: '#8e44ad'};
const TOWN: Look[] = [{shirt: '#e74c3c', pants: '#2c3e50', hair: 'bun', hairColor: '#222'}, {shirt: '#16a085', pants: '#7f8c8d', hair: 'spiky', hairColor: '#f1c40f'},
  {shirt: '#9b59b6', pants: '#34495e', hair: 'long', hairColor: '#e67e22', skin: '#c68642'}, {shirt: '#ecf0f1', pants: '#2d3436', hair: 'cap', capColor: '#27ae60', skin: '#8d5524'}];

// head size per lie (steps land on the punch words)
const headOf = (o: number) => {
  const steps: [number, number][] = [[at('homework.'), 1.55], [at('teeth.'), 2.15], [at('dog.'), 2.8], [at('door.') - 900, 3.5]];
  let h = 1; for (const [t, v] of steps) if (o >= t - 80) h = lerp(h, v, pop((o - t + 80) / 450));
  if (o >= S.want) h = lerp(h, h + 0.25 * Math.max(0, Math.sin((o - S.want) / 70)), prog(o, S.want, S.want + 300) * (1 - prog(o, at('but'), at('but') + 200)));
  if (o >= at('shrank')) h = lerp(h, 1, easeOut((o - at('shrank') + 150) / 700));
  return h;
};

const Street = ({broken = false}: {broken?: boolean}) => <>
  <Baseplate />
  <Road z={8} />
  <House position={[-16, 0, -6]} wall="#f6e7c8" roof="#c0392b" brokenWindow={broken} />
  <House position={[0, 0, -8]} wall="#dfe9f5" roof="#2c3e50" w={13} />
  <House position={[16, 0, -6]} wall="#f9d9c6" roof="#16a085" />
  <Tree position={[-27, 0, -2]} /><Tree position={[27, 0, -3]} s={1.15} /><Tree position={[8, 0, -1]} s={0.8} />
</>;

const Hook = ({o}: {o: number}) => {
  const t = prog(o, 0, S.jake), lie = at('lie,');
  const hs = o < lie ? 1 : lerp(1, 2.7, pop((o - at('bigger.') + 120) / 500));
  return <>
    <Sky />
    <Cam p={lerp3([0, 7, 30], [0, 6.2, 19], ease(t))} l={[0, 4.2, 0]} fov={42} />
    <Street />
    {TOWN.map((lk, i) => <Avatar key={i} look={lk} position={[-14 + i * 9 + ((o / 1000) * 2.2 * (i % 2 ? 1 : -1)) % 6, 0, 4 + (i % 2) * 2]} rotY={i % 2 ? Math.PI / 2 : -Math.PI / 2}
      pose={walkPose(o + i * 300)} blink={blinkAt(o, i)} expr={o > at('bigger.') ? 'shock' : 'smile'} />)}
    <Avatar look={GUY} position={[0, 0, 2]} pose={idlePose(o, {armR: o > lie - 200 ? 1.2 : 0.1, headScale: hs})} expr={o > at('bigger.') ? 'shock' : 'smug'} blink={blinkAt(o, 7)} />
  </>;
};
const JakeHome = ({o, a, b, prop}: {o: number; a: number; b: number; prop?: 'paper' | 'brush'}) => {
  const t = prog(o, a, b), hs = headOf(o);
  return <>
    <Sky />
    <Cam p={lerp3([5, 5.5 + hs, 15 + hs * 2], [3, 5 + hs, 12 + hs * 2], ease(t))} l={[0, 3.6 + hs, 0]} fov={40} />
    <Street />
    <Avatar look={JAKE} name="Jake" position={[0, 0, 2]} pose={idlePose(o, {armR: 1.0 + 0.15 * Math.sin(o / 160), headScale: hs, headTilt: -0.05})} expr={hs > 1.6 ? 'worried' : 'smug'} blink={blinkAt(o, 2)}>
      {prop === 'paper' && <mesh position={[0, -2.1, 0.4]} rotation={[-0.3, 0, 0]}><boxGeometry args={[1.4, 0.05, 1.8]} /><meshStandardMaterial color="#ffffff" /></mesh>}
      {prop === 'brush' && <group position={[0, -2.0, 0.3]}><mesh material={plastic('#00b894')}><boxGeometry args={[0.2, 0.2, 1.8]} /></mesh><mesh position={[0, 0.15, 0.8]} material={plastic('#ffffff')}><boxGeometry args={[0.24, 0.25, 0.4]} /></mesh></group>}
    </Avatar>
    <Avatar look={MOM} position={[-6, 0, 0]} rotY={0.6} pose={idlePose(o, {armL: 0.4, armR: 0.4})} expr="smile" blink={blinkAt(o, 4)} />
  </>;
};
const DogShot = ({o}: {o: number}) => {
  const t = prog(o, S.dog, S.door), hs = headOf(o);
  return <>
    <Sky />
    <Cam p={lerp3([-9, 6, 17], [-7, 7, 21], ease(t))} l={[1, 4 + hs * 0.6, 0]} fov={42} />
    <Street />
    <Avatar look={JAKE} name="Jake" position={[2, 0, 2]} rotY={-0.4} pose={idlePose(o, {armR: 0.9, armL: 0.2, headScale: hs})} expr="smug" blink={blinkAt(o, 2)} />
    <Dog position={[-3.5, 0, 4]} rotY={0.8} o={o} sad={0.8} />
    <Bowl position={[-2, 0.2, 6.2]} />
  </>;
};
const DoorShot = ({o}: {o: number}) => {
  const t = prog(o, S.door, S.mom), hs = headOf(o);
  const push = Math.sin(o / 120) * 0.35 * prog(o, S.door + 500, S.door + 700);
  return <>
    <Sky />
    <Cam p={lerp3([17, 6, 15], [13, 6.5, 12], ease(t))} l={[0, 5.5, 4.5]} fov={48} />
    <Baseplate />
    <School position={[0, 0, -1.5]} />
    <Avatar look={JAKE} name="Jake" position={[0, 0, 6.6 - push]} rotY={Math.PI} pose={walkPose(o, 0.7, {headScale: hs, lean: 0.12})} expr="worried" blink={blinkAt(o, 2)} />
    {TOWN.slice(0, 2).map((lk, i) => <Avatar key={i} look={lk} position={[i ? 11 : -11, 0, 14]} rotY={i ? -0.7 : 0.7} pose={idlePose(o, {armR: 0.3})} expr="grin" blink={blinkAt(o, i + 3)} />)}
  </>;
};
const MomShot = ({o, a, b, close}: {o: number; a: number; b: number; close?: boolean}) => {
  const t = prog(o, a, b), hs = headOf(o);
  return <>
    <Sky />
    {close ? <Cam p={lerp3([-2, 6 + hs, 11 + hs * 2], [-1.5, 6 + hs, 9 + hs * 2], ease(t))} l={[1.5, 4.5 + hs * 0.8, 0]} fov={38} />
      : <Cam p={lerp3([-7, 6, 17], [-9, 5.5, 13], ease(t))} l={[-17, 4.5, -1]} fov={44} />}
    <Street broken />
    <Avatar look={MOM} position={close ? [-3.5, 0, 2.5] : [-13, 0, 3.5]} rotY={close ? 0.8 : 0.9} pose={idlePose(o, {armL: 1.2, armR: 1.2, armLOut: -0.5, armROut: -0.5})} expr="angry" blink={blinkAt(o, 4)} />
    <Avatar look={JAKE} name="Jake" position={close ? [2.5, 0, 2.5] : [-6, 0, 3]} rotY={close ? -0.7 : -0.6} pose={idlePose(o, {headScale: hs, headTilt: 0.12})} expr={o > at('truth,') ? 'smile' : 'worried'} blink={blinkAt(o, 2)} />
  </>;
};
const ShrinkShot = ({o}: {o: number}) => {
  const t = prog(o, S.shrink, S.teacher), hs = headOf(o);
  return <>
    <Sky />
    <Cam p={lerp3([1, 6, 15], [1, 5, 12], ease(t))} l={[0, 3.6 + hs * 0.8, 0]} fov={42} />
    <Street broken />
    <Avatar look={JAKE} name="Jake" position={[1, 0, 2.5]} pose={idlePose(o, {headScale: hs, armL: o > at('normal.') ? 2.6 : 0.2, armR: o > at('normal.') ? 2.6 : 0.2})} expr={o > at('normal.') ? 'grin' : 'happy'} blink={blinkAt(o, 2)} />
    <Avatar look={MOM} position={[-5, 0, 2.5]} rotY={0.6} pose={idlePose(o, {armL: 0.6, armR: 0.6})} expr="happy" blink={blinkAt(o, 4)} />
  </>;
};
const TeacherShot = ({o}: {o: number}) => {
  const t = prog(o, S.teacher, S.end), reveal = prog(o, at('teacher\'s') - 200, at('teacher\'s') + 900);
  const ths = 6.2 + 0.15 * Math.sin(o / 300);
  return <>
    <Sky />
    <Cam p={lerp3([5, 4, 14], [6, 8, 34], ease(reveal))} l={lerp3([3, 4, 1], [-3, 12, -2], ease(reveal))} fov={lerp(38, 50, ease(t))} />
    <Baseplate />
    <School position={[0, 0, -10]} />
    <Avatar look={JAKE} name="Jake" position={[3, 0, 3]} rotY={-0.9} pose={idlePose(o, {headTilt: -0.35 * ease(reveal)})} expr={o > at('biggest') ? 'shock' : 'smile'} blink={blinkAt(o, 2)} />
    <Avatar look={TEACHER} name="Mr. Hall" position={[-5, 0, -1]} rotY={0.5} pose={idlePose(o, {headScale: ths, armR: 0.8})} expr="smug" blink={blinkAt(o, 9)} />
  </>;
};

export const LieShort = () => {
  const f = useCurrentFrame(), o = (f / 30) * 1000;
  let id: (typeof ORDER)[number] = 'hook'; for (const k of ORDER) if (o >= S[k]) id = k;
  const i = ORDER.indexOf(id), a = S[id], b = i < ORDER.length - 1 ? S[ORDER[i + 1]] : S.end;
  const flash = Math.max(0, 1 - (o - a) / 140) * (i > 0 ? 1 : 0);
  return <AbsoluteFill style={{background: '#000'}}>
    <ThreeCanvas width={1080} height={1920} shadows gl={{antialias: true}}>
      {id === 'hook' && <Hook o={o} />}
      {id === 'jake' && <JakeHome o={o} a={a} b={b} prop="paper" />}
      {id === 'teeth' && <JakeHome o={o} a={a} b={b} prop="brush" />}
      {id === 'dog' && <DogShot o={o} />}
      {id === 'door' && <DoorShot o={o} />}
      {id === 'mom' && <MomShot o={o} a={a} b={b} />}
      {(id === 'ask' || id === 'want') && <MomShot o={o} a={a} b={b} close />}
      {id === 'shrink' && <ShrinkShot o={o} />}
      {id === 'teacher' && <TeacherShot o={o} />}
    </ThreeCanvas>
    <AbsoluteFill style={{background: '#fff', opacity: flash * 0.5}} />
    <Captions o={o} C={C} keyword={/^(lie|lied|bigger|head|door|window|truth|normal|biggest|teacher's)$/i} />
    <Soundtrack vo="blocky/vo_lie.wav" off={OFF} W={W} total={S.end} music="blocky/m_xcool_n.mp3" musicFrom={21} fx={[
      ['pop', at('bigger.') - 60, 0.6], ['pop', at('homework.') - 60, 0.55], ['pop', at('teeth.') - 60, 0.55], ['pop', at('dog.') - 60, 0.55],
      ['s_awk', at('door.') - 300, 0.45], ['shock', at('window?'), 0.45], ['s_huh', at('lie,', 1), 0.4], ['s_correct', at('truth,'), 0.4],
      ['rizz', at('shrank'), 0.45], ['s_wow', at('biggest'), 0.5], ['s_camflash', S.jake - 40, 0.3], ['s_camflash', S.teacher - 40, 0.3]]} />
  </AbsoluteFill>;
};
