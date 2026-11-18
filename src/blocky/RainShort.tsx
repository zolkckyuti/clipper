// Blocky story #3 — "In this town, when you're sad, it only rains on you." (1080x1920, 30 fps, ~21.5 s)
import {loadFont} from '@remotion/fonts';
import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill, staticFile, useCurrentFrame} from 'remotion';
import {Avatar, Baseplate, Bench, Box, Cam, Captions, Car, Cloud, House, Rain, Road, School, Sky, Soundtrack, Sun, Tree, Umbrella, blinkAt, chunks, ease, easeOut, idlePose, lerp,
  lerp3, loadWords, pop, prog, walkPose, wordAt, type Look, type V3} from './kit';
import raw from './vo_rain.words.json';

loadFont({family: 'Montserrat', url: staticFile('Montserrat-Black.woff2'), weight: '800'});
const OFF = 300;
const W = loadWords(raw, OFF);
const at = (w: string, n = 0) => wordAt(W, w, n);
export const RAIN_MS = at('home.') + 1700;
const S = {hook: 0, moved: at('Mia'), alone: at('She'), cloud: at('so'), avoid: at('Kids'), boy: at('until'), ask: at('Want'), stop: at('The'), home: at('and', 1), end: RAIN_MS};
const ORDER = ['hook', 'moved', 'alone', 'cloud', 'avoid', 'boy', 'ask', 'stop', 'home'] as const;
const C = chunks(W);

const MIA: Look = {shirt: '#8e44ad', pants: '#34495e', hair: 'long', hairColor: '#2b1a10', shoes: '#ecf0f1'};
const SAM: Look = {shirt: '#27ae60', pants: '#2c3e50', hair: 'spiky', hairColor: '#f39c12', shoes: '#e74c3c'};
const KIDS: Look[] = [{shirt: '#e74c3c', pants: '#2c3e50', hair: 'bun', hairColor: '#222'}, {shirt: '#2980b9', pants: '#7f8c8d', hair: 'cap', capColor: '#f1c40f'},
  {shirt: '#f1c40f', pants: '#34495e', hair: 'long', hairColor: '#e67e22', skin: '#c68642'}, {shirt: '#ecf0f1', pants: '#2d3436', hair: 'short', hairColor: '#111', skin: '#8d5524'}];
const SAD: Look = {shirt: '#7f8c8d', pants: '#2c3e50', hair: 'short', hairColor: '#333'};

const Street = ({warm = false}: {warm?: boolean}) => <>
  <Baseplate color={warm ? '#5db04a' : '#4caf3c'} />
  <Road z={10} />
  <House position={[-16, 0, -6]} wall="#f6e7c8" roof="#c0392b" />
  <House position={[0, 0, -8]} wall="#dfe9f5" roof="#2c3e50" w={13} />
  <House position={[16, 0, -6]} wall="#f9d9c6" roof="#16a085" />
  <Tree position={[-27, 0, -2]} /><Tree position={[27, 0, -3]} s={1.15} /><Tree position={[8, 0, -1]} s={0.8} />
</>;
/** a personal rain cloud over an avatar at (x, z) */
const MyCloud = ({o, x, z, amount = 1, s = 1, stop = -7}: {o: number; x: number; z: number; amount?: number; s?: number; stop?: number}) => <>
  <Cloud position={[x, 7.6 + 0.15 * Math.sin(o / 400), z]} s={0.55 * s} color="#8a96a3" opacity={0.96} />
  <Rain o={o} position={[x, 7, z]} w={3.4 * s} d={2.4 * s} y1={stop} n={70} amount={amount} />
</>;

const Hook = ({o}: {o: number}) => {
  const t = prog(o, 0, S.moved);
  return <>
    <Sky />
    <Cam p={lerp3([0, 7, 30], [1, 6.5, 18], ease(t))} l={[1, 4.4, 2]} fov={42} />
    <Street />
    {KIDS.map((lk, i) => <Avatar key={i} look={lk} position={[-14 + i * 9 + (((o / 1000) * 2.2 * (i % 2 ? 1 : -1)) % 5), 0, 5 + (i % 2) * 2]} rotY={i % 2 ? Math.PI / 2 : -Math.PI / 2}
      pose={walkPose(o + i * 300)} blink={blinkAt(o, i)} expr="smile" />)}
    <Avatar look={SAD} position={[1, 0, 2]} pose={idlePose(o, {headTilt: 0.3})} expr="sad" blink={blinkAt(o, 5)} />
    <MyCloud o={o} x={1} z={2} />
  </>;
};
const MovedShot = ({o}: {o: number}) => {
  const t = prog(o, S.moved, S.alone);
  return <>
    <Sky />
    <Cam p={lerp3([8, 6, 18], [5, 5, 14], ease(t))} l={[-1, 3.6, 0]} fov={42} />
    <Street />
    <Car position={[10, 0, 9]} color="#ecf0f1" />
    <Box position={[-4, 1, 4]} s={[2, 2, 2]} /><Box position={[-4.3, 3, 4]} s={[1.6, 1.6, 1.6]} rot={0.3} /><Box position={[5, 0.8, 4.5]} s={[1.6, 1.6, 1.6]} rot={-0.4} />
    <Avatar look={MIA} name="Mia" position={[0, 0, 3]} pose={idlePose(o, {armL: 1.4, armR: 1.4})} expr="worried" blink={blinkAt(o, 2)}>
      <mesh position={[-1.5, -2.2, 0.9]} material={undefined}><boxGeometry args={[2.4, 1.6, 1.6]} /><meshStandardMaterial color="#c49a6c" /></mesh>
    </Avatar>
  </>;
};
const Yard = () => <>
  <Baseplate />
  <School position={[0, 0, -14]} />
  <Tree position={[-20, 0, -2]} /><Tree position={[20, 0, -1]} s={1.2} />
</>;
const AloneShot = ({o}: {o: number}) => {
  const t = prog(o, S.alone, S.cloud);
  return <>
    <Sky />
    <Cam p={lerp3([-1, 7.5, 31], [-0.5, 6.5, 27], ease(t))} l={[-0.8, 3.2, 1]} fov={46} />
    <Yard />
    {KIDS.map((lk, i) => <Avatar key={i} look={lk} position={[-6.5 + (i % 2) * 2.6, 0, 0 + Math.floor(i / 2) * 2.8]} rotY={i % 2 ? -1 : 1} pose={idlePose(o + i * 400, {armR: 0.6 + 0.4 * Math.sin(o / 200 + i)})}
      expr="grin" blink={blinkAt(o, i)} />)}
    <Bench position={[4.5, 0, 2]} rotY={-0.3} />
    <Avatar look={MIA} name="Mia" position={[4.5, 0.2, 2.3]} rotY={-0.3} pose={idlePose(o, {sit: 1, headTilt: 0.35, armL: 0.6, armR: 0.6})} expr="sad" blink={blinkAt(o, 2)} />
  </>;
};
const CloudShot = ({o}: {o: number}) => {
  const t = prog(o, S.cloud, S.avoid), x = lerp(-10, 6, t);
  return <>
    <Sky />
    <Cam p={[x + 4, 6, 22]} l={[x, 4.5, 6]} fov={44} />
    <Street />
    <Avatar look={MIA} name="Mia" position={[x, 0, 6]} rotY={Math.PI / 2} pose={walkPose(o, 0.55, {headTilt: 0.3})} expr="sad" blink={blinkAt(o, 2)} />
    <MyCloud o={o} x={x} z={6} s={pop((o - at('cloud') + 100) / 600) * 0.6 + 0.4 * (o > at('tiny') ? 1 : 0)} />
  </>;
};
const AvoidShot = ({o}: {o: number}) => {
  const t = prog(o, S.avoid, S.boy);
  return <>
    <Sky />
    <Cam p={lerp3([0, 18, 22], [0, 15, 18], ease(t))} l={[0, 1, 4]} fov={48} />
    <Street />
    <Avatar look={MIA} name="Mia" position={[0, 0, 4]} pose={idlePose(o, {headTilt: 0.35})} expr="cry" blink={blinkAt(o, 2)} />
    <MyCloud o={o} x={0} z={4} />
    {KIDS.map((lk, i) => { const k = prog(o, S.avoid + i * 250, S.avoid + i * 250 + 2600), ang = lerp(Math.PI, 0, k), r = 6.5;
      const xx = Math.cos(ang) * (r + i * 0.4), zz = 4 + Math.sin(ang) * (r + i * 0.4) * (i % 2 ? 1 : -1);
      return <Avatar key={i} look={lk} position={[xx, 0, zz]} rotY={(i % 2 ? -1 : 1) * (ang - Math.PI / 2) + Math.PI / 2} pose={walkPose(o + i * 200)} expr="worried" blink={blinkAt(o, i)} />; })}
  </>;
};
const BoyShot = ({o}: {o: number}) => {
  const t = prog(o, S.boy, S.ask), step = ease(prog(o, at('stepped') - 200, at('under') + 200)), open = easeOut(prog(o, at('umbrella.') - 250, at('umbrella.') + 350));
  return <>
    <Sky />
    <Cam p={lerp3([7, 6, 17], [5, 6.5, 14], ease(t))} l={[0, 4, 3]} fov={42} />
    <Street />
    <Avatar look={MIA} name="Mia" position={[-1.4, 0, 3]} rotY={0.5 * step} pose={idlePose(o, {headTilt: 0.35 - 0.3 * open})} expr={open > 0.5 ? 'shock' : 'cry'} blink={blinkAt(o, 2)} />
    <Avatar look={SAM} name="Sam" position={[lerp(9, 1.8, step), 0, 3]} rotY={-Math.PI / 2 + 0.5 * step} pose={step < 1 ? walkPose(o, 0.8, {armR: 2.2 * open}) : idlePose(o, {armR: 2.2 * open})}
      expr="smile" blink={blinkAt(o, 6)}>
      {open > 0 && <group position={[0, -1.9, 0]} rotation={[2.2 * open, 0, -0.35 * open]} scale={1.35}><Umbrella open={open} /></group>}
    </Avatar>
    <MyCloud o={o} x={-1.4} z={3} stop={lerp(-7, -1.4, open)} />
  </>;
};
const AskShot = ({o}: {o: number}) => {
  const t = prog(o, S.ask, S.stop);
  return <>
    <Sky />
    <Cam p={lerp3([4, 7.5, 14], [3, 7.5, 12.5], ease(t))} l={[0, 6.3, 3]} fov={46} />
    <Street />
    <Avatar look={MIA} name="Mia" position={[-1.4, 0, 3]} rotY={0.6} pose={idlePose(o, {headTilt: -0.05})} expr="shock" blink={blinkAt(o, 2)} />
    <Avatar look={SAM} name="Sam" position={[1.8, 0, 3]} rotY={-0.9} pose={idlePose(o, {armR: 2.2, armL: 0.9 + 0.2 * Math.sin(o / 150)})} expr="grin" blink={blinkAt(o, 6)}>
      <group position={[0, -1.9, 0]} rotation={[2.2, 0, -0.35]} scale={1.35}><Umbrella /></group>
    </Avatar>
    <MyCloud o={o} x={-1.4} z={3} stop={-1.4} />
  </>;
};
const StopShot = ({o}: {o: number}) => {
  const t = prog(o, S.stop, S.home), gone = ease(prog(o, at('stopped,') - 100, at('stopped,') + 600));
  return <>
    <Sky sun={1 + 0.25 * gone} />
    <Cam p={lerp3([0, 7, 17], [0, 7.5, 15], ease(t))} l={[0, 5, 3]} fov={44} />
    <Street />
    <Avatar look={MIA} name="Mia" position={[-1.4, 0, 3]} rotY={0.3} pose={idlePose(o, {headTilt: -0.2 * gone})} expr={gone > 0.5 ? 'happy' : 'shock'} blink={blinkAt(o, 2)} />
    <Avatar look={SAM} name="Sam" position={[1.8, 0, 3]} rotY={-0.4} pose={idlePose(o, {armR: 2.2 * (1 - gone)})} expr="grin" blink={blinkAt(o, 6)}>
      {gone < 1 && <group position={[0, -1.9, 0]} rotation={[2.2 * (1 - gone), 0, -0.35 * (1 - gone)]} scale={1.35}><Umbrella open={1 - gone} /></group>}
    </Avatar>
    {gone < 0.98 && <>
      <group scale={1 - gone} position={[-1.4 * gone, 0, 0]}><Cloud position={[-1.4, 7.6, 3]} s={0.55} color="#8a96a3" /></group>
      <Rain o={o} position={[-1.4, 7, 3]} w={3.4} d={2.4} y1={lerp(-1.4, -7, gone)} n={70} amount={1 - gone * 1.4} />
    </>}
  </>;
};
const HomeShot = ({o}: {o: number}) => {
  const t = prog(o, S.home, S.end), x = lerp(-6, 8, t), sun = pop((o - at('sun') + 100) / 700);
  return <>
    <Sky top="#ff9f68" bottom="#ffe0b3" warm sun={1.05} />
    <Cam p={[x + 5, 6.5, 20]} l={[x, 5, 6]} fov={44} />
    <Street warm />
    <Avatar look={MIA} name="Mia" position={[x, 0, 6]} rotY={Math.PI / 2 - 0.3} pose={walkPose(o, 0.6, {headTilt: -0.1})} expr="happy" blink={blinkAt(o, 2)} />
    {o > at('sun') - 100 && <Sun position={[x, 8.3 + 0.2 * Math.sin(o / 350), 6]} s={0.75 * sun} o={o} />}
  </>;
};

export const RainShort = () => {
  const f = useCurrentFrame(), o = (f / 30) * 1000;
  let id: (typeof ORDER)[number] = 'hook'; for (const k of ORDER) if (o >= S[k]) id = k;
  const i = ORDER.indexOf(id), a = S[id], b = i < ORDER.length - 1 ? S[ORDER[i + 1]] : S.end;
  const flash = Math.max(0, 1 - (o - a) / 140) * (i > 0 ? 1 : 0);
  return <AbsoluteFill style={{background: '#000'}}>
    <ThreeCanvas width={1080} height={1920} shadows gl={{antialias: true}}>
      {id === 'hook' && <Hook o={o} />}
      {id === 'moved' && <MovedShot o={o} />}
      {id === 'alone' && <AloneShot o={o} />}
      {id === 'cloud' && <CloudShot o={o} />}
      {id === 'avoid' && <AvoidShot o={o} />}
      {id === 'boy' && <BoyShot o={o} />}
      {id === 'ask' && <AskShot o={o} />}
      {id === 'stop' && <StopShot o={o} />}
      {id === 'home' && <HomeShot o={o} />}
    </ThreeCanvas>
    <AbsoluteFill style={{background: '#fff', opacity: flash * 0.4}} />
    <Captions o={o} C={C} keyword={/^(sad|rains|cloud|wet|umbrella|us|stopped|sun|home|alone|anyone)$/i} />
    <Soundtrack vo="blocky/vo_rain.wav" off={OFF} W={W} total={S.end} music="blocky/m_luna_n.mp3" musicFrom={0} musicVol={0.2} fx={[
      ['s_awk', at('rains'), 0.35], ['pop', at('cloud') - 60, 0.45], ['s_huh', at('wet,'), 0.35], ['s_wow', at('umbrella.'), 0.45],
      ['s_correct', at('stopped,'), 0.45], ['rizz', at('sun'), 0.45], ['s_ding', at('home.'), 0.35], ['s_camflash', S.boy - 40, 0.25]]} />
  </AbsoluteFill>;
};
