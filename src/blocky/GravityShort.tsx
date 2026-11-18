// Blocky story #2 — "What if gravity turned off for ten seconds every day at noon?" (1080x1920, 30 fps, ~23 s)
import {loadFont} from '@remotion/fonts';
import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill, staticFile, useCurrentFrame} from 'remotion';
import {Avatar, Baseplate, Basket, Bench, Box, Bread, Cam, Captions, Car, Clock, Cloud, House, Road, School, Sky, Soundtrack, Tree, blinkAt, chunks, ease, easeOut, idlePose, lerp,
  lerp3, loadWords, plastic, pop, prog, signTex, walkPose, wordAt, type Look, type Pose, type V3} from './kit';
import raw from './vo_gravity.words.json';

loadFont({family: 'Montserrat', url: staticFile('Montserrat-Black.woff2'), weight: '800'});
const OFF = 300;
const W = loadWords(raw, OFF);
const at = (w: string, n = 0) => wordAt(W, w, n);
export const GRAVITY_MS = at('bread') + 1500;
const S = {hook: 0, bench: at('In'), car: at('Every', 2), leo: at('But'), count: at('Three'), up: at('Leo', 1), trees: at('past', 1), clouds: at('past', 2), fall: at('Ten'),
  land: at('Leo', 2), deliver: at('Now'), end: GRAVITY_MS};
const ORDER = ['hook', 'bench', 'car', 'leo', 'count', 'up', 'trees', 'clouds', 'fall', 'land', 'deliver'] as const;
const C = chunks(W);

const LEO: Look = {shirt: '#e67e22', pants: '#2c3e50', hair: 'cap', capColor: '#2980b9', shoes: '#ecf0f1'};
const TOWN: Look[] = [{shirt: '#e74c3c', pants: '#2c3e50', hair: 'bun', hairColor: '#222'}, {shirt: '#16a085', pants: '#7f8c8d', hair: 'spiky', hairColor: '#f1c40f'},
  {shirt: '#9b59b6', pants: '#34495e', hair: 'long', hairColor: '#e67e22', skin: '#c68642'}, {shirt: '#ecf0f1', pants: '#2d3436', hair: 'short', hairColor: '#111', skin: '#8d5524'},
  {shirt: '#f1c40f', pants: '#2d3436', hair: 'long', hairColor: '#5b3a1e'}];
const floatPose = (o: number, k = 1): Pose => ({armLOut: 1.1 * k + 0.15 * Math.sin(o / 300), armROut: 1.1 * k + 0.15 * Math.sin(o / 330), legSpread: 0.35 * k, armL: 0.3, armR: 0.3,
  headTilt: -0.2 * k, lean: 0.05 * Math.sin(o / 500)});

const Bakery = ({position}: {position: V3}) => <group position={position}>
  <mesh position={[0, 5, 0]} castShadow receiveShadow material={plastic('#f8e1c4', 0.8)}><boxGeometry args={[14, 10, 12]} /></mesh>
  <mesh position={[0, 10.25, 0]} receiveShadow castShadow material={plastic('#8e5b3a', 0.8)}><boxGeometry args={[14.6, 0.5, 12.6]} /></mesh>
  <mesh position={[0, 8.2, 6.05]}><planeGeometry args={[9, 2.2]} /><meshStandardMaterial map={signTex('BAKERY', '#c0392b')} /></mesh>
  <mesh position={[0, 3, 6.02]} material={plastic('#7a4a24')}><planeGeometry args={[2.8, 6]} /></mesh>
  {[-4.5, 4.5].map((x) => <mesh key={x} position={[x, 4, 6.03]}><planeGeometry args={[3, 3]} /><meshStandardMaterial color="#ffe9a6" /></mesh>)}
  {[-4, 0, 4].map((x) => <mesh key={x} position={[x, 6.5, 6.5]} rotation={[0.5, 0, 0]} material={plastic(x === 0 ? '#ffffff' : '#e74c3c')}><boxGeometry args={[4, 0.15, 2]} /></mesh>)}
</group>;
const Town = ({noClock = false}: {noClock?: boolean}) => <>
  <Baseplate />
  <Road z={10} />
  <School position={[-26, 0, -12]} />
  <Bakery position={[14, 0, -8]} />
  <House position={[34, 0, -6]} wall="#dfe9f5" roof="#2c3e50" />
  {!noClock && <Clock position={[-2, 0, -10]} h={11} m={59} />}
  <Tree position={[-6, 0, 2]} /><Tree position={[28, 0, 3]} s={1.2} /><Tree position={[-44, 0, 0]} /><Tree position={[46, 0, 2]} s={0.9} />
</>;

const Hook = ({o}: {o: number}) => {
  const t = prog(o, 0, S.bench), lift = easeOut(prog(o, 400, S.bench));
  return <>
    <Sky />
    <Cam p={lerp3([2, 3, 26], [2, 6, 20], ease(t))} l={[0, 6 + 4 * lift, 0]} fov={46} />
    <Town />
    {TOWN.slice(0, 4).map((lk, i) => <Avatar key={i} look={lk} position={[-8 + i * 5.5, lift * (5 + i * 1.6) + 0.2 * Math.sin(o / 300 + i), 4 + (i % 2) * 2]} rotY={0.25 * Math.sin(o / 700 + i)}
      pose={floatPose(o + i * 200)} expr={i % 2 ? 'shock' : 'grin'} blink={blinkAt(o, i)} />)}
    <Box position={[7, 1 + lift * 9, 2]} s={[1.6, 1.6, 1.6]} rot={o / 400} />
    <Box position={[-11, 0.6 + lift * 7, 7]} s={[1.2, 1.2, 1.2]} color="#e74c3c" rot={-o / 500} />
  </>;
};
const BenchShot = ({o}: {o: number}) => {
  const t = prog(o, S.bench, S.car), belt = pop((o - at('belt.') + 150) / 500);
  return <>
    <Sky />
    <Cam p={lerp3([-5, 5, 14], [-2, 4.5, 11], ease(t))} l={[0, 2.6, 0]} fov={42} />
    <Town />
    <Bench position={[0, 0, 0]} />
    <mesh position={[0, 1.95, 0.95]} scale={[belt, 1, 1]} material={plastic('#e74c3c')}><boxGeometry args={[7.1, 0.3, 0.12]} /></mesh>
    {[-1.7, 1.7].map((x, i) => <Avatar key={i} look={TOWN[i + 2]} position={[x, 0.2, 0.3]} pose={idlePose(o, {sit: 1, armL: 0.5, armR: 0.5})} expr="smile" blink={blinkAt(o, i)} />)}
  </>;
};
const CarShot = ({o}: {o: number}) => {
  const t = prog(o, S.car, S.leo), chain = prog(o, at('chained') - 100, at('chained') + 400);
  return <>
    <Sky />
    <Cam p={lerp3([-14, 6, 20], [-6, 4.5, 18], ease(t))} l={[0, 1.6, 9]} fov={42} />
    <Town />
    <Car position={[0, 0, 8]} color="#2980b9" chained={chain > 0} />
    <Car position={[-13, 0, 12]} color="#c0392b" chained />
  </>;
};
const LeoShot = ({o}: {o: number}) => {
  const t = prog(o, S.leo, S.count);
  return <>
    <Sky />
    <Cam p={lerp3([6, 5, 15], [3, 6, 13], ease(t))} l={[-1, 4.2, -2]} fov={44} />
    <Town />
    <Avatar look={LEO} name="Leo" position={[lerp(-3, 1.5, t), 0, 3]} rotY={Math.PI / 2 - 0.4} pose={walkPose(o, 0.6, {armR: 1.2, headTilt: 0.35})} expr="smile" blink={blinkAt(o, 1)}>
      <mesh position={[0, -2.05, 0.35]} rotation={[-0.6, 0, 0]} material={plastic('#111')}><boxGeometry args={[0.7, 0.08, 1.2]} /></mesh>
    </Avatar>
  </>;
};
const CountShot = ({o}: {o: number}) => {
  const t = prog(o, S.count, S.up), min = o > at('one.') ? 0 : 59;
  return <>
    <Sky />
    <Cam p={lerp3([-2, 15, 16], [-2, 15, 13], ease(t))} l={[-2, 15, -8]} fov={36} roll={0.04 * Math.sin(o / 60)} />
    <Town noClock />
    <Clock position={[-2, 0, -10]} h={min ? 11 : 12} m={min} />
  </>;
};
// Leo rising: y follows a smooth climb across the up / trees / clouds shots
const leoY = (o: number) => lerp(0, 15, easeOut(prog(o, S.up, S.trees))) + lerp(0, 11, prog(o, S.trees, S.clouds)) + lerp(0, 20, prog(o, S.clouds, S.fall)) + 0.4 * Math.sin(o / 400);
const Rise = ({o, a, b, cam}: {o: number; a: number; b: number; cam: (y: number, t: number) => [V3, V3]}) => {
  const y = leoY(o), t = prog(o, a, b), [p, l] = cam(y, t);
  return <>
    <Sky top={y > 25 ? '#2f7fe0' : '#4fa8ff'} bottom={y > 25 ? '#a8d8ff' : '#cfeaff'} />
    <Cam p={p} l={l} fov={46} />
    <Town />
    {[[-22, 34, -4, 2.2], [-6, 38, -8, 2.6], [-17, 43, 9, 1.4], [-9, 47, 1, 1.8], [-24, 50, -10, 2.4], [6, 44, -6, 2]].map(([x, yy, z, s], i) => <Cloud key={i} position={[x + (o / 2000) % 3, yy, z]} s={s} />)}
    <Tree position={[-18, 0, -3]} s={1.3} /><Tree position={[-9, 0, -6]} s={1.1} /><Tree position={[-20, 0, 8]} />
    <Avatar look={LEO} name="Leo" position={[-14, y, 4]} rotY={0.3 * Math.sin(o / 900)} pose={floatPose(o)} expr="shock" blink={blinkAt(o, 1)} />
  </>;
};
const Fall = ({o}: {o: number}) => {
  const t = prog(o, S.fall, S.land), back = at('back');
  const y = o < back ? 44 + 0.3 * Math.sin(o / 300) : lerp(44, 22, ease(prog(o, back, S.land + 200)));
  const x = lerp(-14, 6, prog(o, back, S.land + 200));
  return <>
    <Sky top="#2f7fe0" bottom="#a8d8ff" />
    <Cam p={[x + 7, y + 4, 19]} l={[x, y - 3, 0]} fov={54} />
    <Town />
    <Avatar look={LEO} name="Leo" position={[x, y, 4]} rotY={o < back ? 0 : 0.6} pose={o < back ? floatPose(o) : {armL: 2.8, armR: 2.8, legSpread: 0.2, headTilt: 0.4}} expr="shock" blink={blinkAt(o, 1)} />
  </>;
};
const Land = ({o}: {o: number}) => {
  const t = prog(o, S.land, S.deliver), hit = at('landed') + 250;
  const y = o < hit ? lerp(24, 10.5, (prog(o, S.land, hit)) ** 2) : 10.5 + Math.abs(Math.sin((o - hit) / 160)) * 1.4 * Math.exp(-(o - hit) / 260);
  const squash = o < hit ? 1 : 1 - 0.25 * Math.exp(-(o - hit) / 120);
  return <>
    <Sky />
    <Cam p={lerp3([30, 15, 22], [26, 14, 16], ease(t))} l={[14, 10, -4]} fov={46} roll={o > hit && o < hit + 300 ? 0.03 * Math.sin(o / 25) : 0} />
    <Town />
    <group scale={[1, squash, 1]} position={[14, 0, -6]}>
      <Avatar look={LEO} name="Leo" position={[0, y, 0]} pose={o < hit ? {armL: 2.8, armR: 2.8, legSpread: 0.25} : idlePose(o, {sit: o > hit + 500 ? 1 : 0, headTilt: 0.15})}
        expr={o < hit + 700 ? 'shock' : 'grin'} blink={blinkAt(o, 1)} />
    </group>
    {o > hit && Array.from({length: 10}, (_, i) => { const k = prog(o, hit, hit + 700); const a = (i / 10) * Math.PI * 2;
      return <mesh key={i} position={[14 + Math.cos(a) * 2.5 * k * 1.5, 10.6 + k * 0.6, -6 + Math.sin(a) * 2.5 * k * 1.5]} scale={1 - k}><boxGeometry args={[0.5, 0.5, 0.5]} /><meshStandardMaterial color="#e8d8c0" /></mesh>; })}
  </>;
};
const Deliver = ({o}: {o: number}) => {
  const t = prog(o, S.deliver, S.end);
  const x = lerp(-10, 12, t), y = 12 + 0.6 * Math.sin(o / 400);
  return <>
    <Sky />
    <Cam p={lerp3([-4, 10, 30], [6, 12, 28], ease(t))} l={[x - 2, 8, 4]} fov={48} />
    <Town />
    <Avatar look={LEO} name="Leo" position={[x, y, 6]} rotY={Math.PI / 2 - 0.5} pose={{...floatPose(o, 0.6), armR: 0.9, armROut: 0.2}} expr="grin" blink={blinkAt(o, 1)}>
      <group position={[0, -2.2, 0.6]}><Basket><Bread position={[0, 0.5, 0]} /><Bread position={[0.3, 0.6, 0.2]} rot={0.6} /></Basket></group>
    </Avatar>
    {[0, 1, 2].map((i) => { const t0 = S.deliver + 600 + i * 900, k = prog(o, t0, t0 + 900); if (o < t0) return null;
      const bx = lerp(-10, 12, prog(t0, S.deliver, S.end)) + 1;
      return <Bread key={i} position={[bx, lerp(y - 2, 4.6, k * k), 6.5]} rot={o / 200} />; })}
    {TOWN.slice(0, 4).map((lk, i) => <Avatar key={i} look={lk} position={[-6 + i * 6, 0, 8]} rotY={0.2} pose={idlePose(o, {armL: 2.6, armR: 2.6})} expr="grin" blink={blinkAt(o, i)} />)}
  </>;
};

export const GravityShort = () => {
  const f = useCurrentFrame(), o = (f / 30) * 1000;
  let id: (typeof ORDER)[number] = 'hook'; for (const k of ORDER) if (o >= S[k]) id = k;
  const i = ORDER.indexOf(id), a = S[id], b = i < ORDER.length - 1 ? S[ORDER[i + 1]] : S.end;
  const flash = Math.max(0, 1 - (o - a) / 140) * (i > 0 ? 1 : 0);
  const num = id === 'count' ? (o >= at('one.') ? '1' : o >= at('two,') ? '2' : '3') : null;
  const numK = num ? easeOut((o - (num === '1' ? at('one.') : num === '2' ? at('two,') : at('Three'))) / 180) : 0;
  return <AbsoluteFill style={{background: '#000'}}>
    <ThreeCanvas width={1080} height={1920} shadows gl={{antialias: true}}>
      {id === 'hook' && <Hook o={o} />}
      {id === 'bench' && <BenchShot o={o} />}
      {id === 'car' && <CarShot o={o} />}
      {id === 'leo' && <LeoShot o={o} />}
      {id === 'count' && <CountShot o={o} />}
      {id === 'up' && <Rise o={o} a={a} b={b} cam={(y, t) => [[-4, y + 3, 18 - 2 * t], [-14, y + 1, -4]]} />}
      {id === 'trees' && <Rise o={o} a={a} b={b} cam={(y, t) => [[-2, y + 4, 21], [-15, y - 3.5, 0]]} />}
      {id === 'clouds' && <Rise o={o} a={a} b={b} cam={(y, t) => [[-8 - 4 * t, y + 2, 15], [-14, y + 1, 0]]} />}
      {id === 'fall' && <Fall o={o} />}
      {id === 'land' && <Land o={o} />}
      {id === 'deliver' && <Deliver o={o} />}
    </ThreeCanvas>
    <AbsoluteFill style={{background: '#fff', opacity: flash * 0.5}} />
    {num && <div style={{position: 'absolute', top: 330, width: 1080, textAlign: 'center', fontFamily: 'Montserrat', fontWeight: 800, fontSize: 330, color: '#FFE135',
      WebkitTextStroke: '22px #000', paintOrder: 'stroke fill', transform: `scale(${0.6 + 0.4 * numK})`}}>{num}</div>}
    <Captions o={o} C={C} keyword={/^(gravity|noon|seatbelt|seat|belt|chained|forgot|floated|clouds|bakery|bread|ten|10)$/i} />
    <Soundtrack vo="blocky/vo_gravity.wav" off={OFF} W={W} total={S.end} music="blocky/m_impostor_n.mp3" musicFrom={7} fx={[
      ['riser', 300, 0.3], ['s_wow', at('noon?') , 0.4], ['pop', at('belt.') - 60, 0.5], ['shock', at('chained'), 0.35], ['s_huh', at('forgot'), 0.45],
      ['s_ding', at('Three'), 0.45], ['s_ding', at('two,'), 0.45], ['s_ding', at('one.'), 0.55], ['rizz', at('floated'), 0.45], ['s_fahhh', at('back'), 0.45],
      ['shock', at('landed') + 250, 0.55], ['s_correct', at('delivers'), 0.4], ['s_camflash', S.bench - 40, 0.25], ['s_camflash', S.deliver - 40, 0.25]]} />
  </AbsoluteFill>;
};
