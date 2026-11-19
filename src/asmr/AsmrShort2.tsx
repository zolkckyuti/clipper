// Cartoon ASMR #2 — POV "personal attention" + fast trigger switching (60 s, 12 triggers, 1080x1920 @ 30 fps).
// Mochi (a pastel bunny ASMRtist with long glossy nails) does triggers ON your screen (nail taps, lens brushing, crinkles,
// fluffy-mic scratching, plucking your stress away) and in macro close-ups (keys, sand, slime, candy, pop-it, honey, drops).
// Picture + sound share src/asmr/timeline2.json (asmr/make_asmr2.py). No music, no meme sounds, no voice.
import {RoundedBox} from '@react-three/drei';
import {useThree} from '@react-three/fiber';
import {loadFont} from '@remotion/fonts';
import {ThreeCanvas} from '@remotion/three';
import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, random, staticFile, useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {Board, Cam, Knife, RAINBOW, Stage, canvas, clamp01, combTex, ease, easeOut, glossy, jig, lerp, lerp3, matte, memo, prog, sandMat, type V3} from './AsmrShort';
import TL from './timeline2.json';

loadFont({family: 'Montserrat', url: staticFile('Montserrat-Black.woff2'), weight: '800'});
export const ASMR2_MS = TL.dur * 1000;
const EV = TL.ev as unknown as {lens: number[][]; brush: number[][]; crinkle: number[][]; keys: number[]; sand: number[]; slime: number[]; candy: number[]; popit: number[];
  honey: number[]; mic: number[][]; drops: number[]; pluck: number[]};

// ---------------------------------------------------------------- Mochi (bunny ASMRtist) + nail hand
const mochiFace = (blink: boolean, mood: 'soft' | 'smile' | 'puff') => canvas(`mochi:${blink}:${mood}`, 512, 512, (x) => {
  x.clearRect(0, 0, 512, 512); x.strokeStyle = '#3a2440'; x.fillStyle = '#3a2440'; x.lineCap = 'round';
  const eye = (cx: number) => {
    if (blink || mood === 'soft') { x.lineWidth = 14; x.beginPath(); x.arc(cx, 236, 28, 1.1 * Math.PI, 1.9 * Math.PI); x.stroke(); return; }
    x.beginPath(); x.ellipse(cx, 236, 26, 34, 0, 0, Math.PI * 2); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.arc(cx + 8, 222, 10, 0, Math.PI * 2); x.fill(); x.fillStyle = '#3a2440';
  };
  eye(180); eye(332);
  x.fillStyle = 'rgba(255,130,170,.6)'; x.beginPath(); x.ellipse(130, 300, 40, 22, 0, 0, Math.PI * 2); x.fill(); x.beginPath(); x.ellipse(382, 300, 40, 22, 0, 0, Math.PI * 2); x.fill();
  x.fillStyle = '#3a2440'; x.lineWidth = 11;
  if (mood === 'puff') { x.beginPath(); x.ellipse(256, 312, 16, 18, 0, 0, Math.PI * 2); x.fill(); }
  else { x.beginPath(); x.moveTo(226, 292); x.quadraticCurveTo(241, 310, 256, 294); x.quadraticCurveTo(271, 310, 286, 292); x.stroke(); }
});
const Mochi = ({s, position = [0, 0, 0] as V3, mood = 'soft' as 'soft' | 'smile' | 'puff', lean = 0, scale = 1}) => {
  const fur = glossy('#fff4f8', {rough: 0.75, clear: 0.15, sheen: '#ffd6e7'}), pink = glossy('#ffb3cc', {rough: 0.6, clear: 0.2});
  const blink = (s % 3.4) < 0.13, bob = 0.04 * Math.sin(s * 2.1);
  return <group position={[position[0], position[1] + bob, position[2]]} rotation={[lean, 0.04 * Math.sin(s * 0.9), 0.03 * Math.sin(s * 0.7)]} scale={scale}>
    <mesh position={[0, 1.4, 0]} scale={[1.25, 1.35, 1]} material={glossy('#c7b8ff', {rough: 0.6, clear: 0.2})}><sphereGeometry args={[1, 32, 24]} /></mesh>
    <mesh position={[0, 3.35, 0]} scale={[1.55, 1.38, 1.3]} castShadow material={fur}><sphereGeometry args={[1, 48, 32]} /></mesh>
    {[-1, 1].map((k) => <group key={k} position={[0.62 * k, 4.6, -0.1]} rotation={[0, 0, -0.18 * k + 0.05 * Math.sin(s * 1.7 + k)]}>
      <mesh position={[0, 1.0, 0]} castShadow material={fur}><capsuleGeometry args={[0.36, 1.6, 8, 16]} /></mesh>
      <mesh position={[0, 1.0, 0.2]} scale={[0.55, 0.85, 0.4]} material={pink}><capsuleGeometry args={[0.36, 1.6, 8, 16]} /></mesh>
    </group>)}
    <mesh position={[0, 3.25, 1.27]}><planeGeometry args={[2.3, 2.3]} /><meshBasicMaterial map={mochiFace(blink, mood)} transparent toneMapped={false} /></mesh>
    <mesh position={[0.9, 4.15, 0.95]} rotation={[0.3, 0.4, 0]} material={glossy('#ff8fb1', {rough: 0.4})}><torusGeometry args={[0.22, 0.09, 10, 24]} /></mesh>
  </group>;
};
/** cartoon hand with long glossy nails; index fingertip at the origin, finger pointing along local -y */
const NailHand = ({position, rot = [0, 0, 0] as V3, scale = 1, curl = 0, nail = '#ff7eb6'}: {position: V3; rot?: V3; scale?: number; curl?: number; nail?: string}) => {
  const skin = glossy('#fff0f4', {rough: 0.6, clear: 0.25, sheen: '#ffd6e7'}), nm = memo(`nail:${nail}`, () => new THREE.MeshPhysicalMaterial({color: nail, roughness: 0.08, clearcoat: 1,
    clearcoatRoughness: 0.02, iridescence: 0.8, iridescenceIOR: 1.5, sheen: 0.4, sheenColor: new THREE.Color('#ffffff')}));
  const finger = (x: number, len: number, bend: number, key: string) => <group key={key} position={[x, 0, 0]} rotation={[bend, 0, 0]}>
    <mesh position={[0, len / 2 + 0.25, 0]} castShadow material={skin}><capsuleGeometry args={[0.22, len, 8, 16]} /></mesh>
    <mesh position={[0, 0.05, 0.13]} rotation={[0.25, 0, 0]} scale={[0.2, 0.42, 0.07]} castShadow material={nm}><sphereGeometry args={[1, 20, 12]} /></mesh>
  </group>;
  return <group position={position} rotation={rot} scale={scale}>
    {finger(0, 1.1, 0, 'i')}
    <group position={[0, 0, 0]} rotation={[0, 0, 0]}>
      {[[-0.48, 0.95, 0.5 + curl], [-0.94, 0.85, 0.7 + curl], [-1.32, 0.7, 0.9 + curl]].map(([x, l, b], i) => <group key={i} position={[0, 0.3 + i * 0.05, 0]}>{finger(x, l, b, `f${i}`)}</group>)}
    </group>
    <RoundedBox args={[1.7, 1.4, 0.75]} radius={0.34} position={[-0.6, 1.95, -0.05]} castShadow material={skin} />
    <group position={[0.55, 1.45, 0.15]} rotation={[0.2, 0, -0.75]}>{finger(0, 0.6, 0.2, 't')}</group>
    <mesh position={[-0.6, 2.95, -0.05]} castShadow material={glossy('#c7b8ff', {rough: 0.6, clear: 0.2})}><cylinderGeometry args={[0.95, 0.9, 0.6, 24]} /></mesh>
  </group>;
};
/** sets the POV camera NOW (before any child renders) and returns screenPoint(x, y, d): the world point at normalized screen
 *  coords (x right, y up, -0.5..0.5) at distance d in front of the camera */
const usePov = (p: V3 = [0, 3.4, 9.5], l: V3 = [0, 3.0, 0], fov = 40) => {
  const {camera} = useThree(); const c = camera as THREE.PerspectiveCamera;
  c.position.set(...p); c.fov = fov; c.near = 0.05; c.far = 200; c.up.set(0, 1, 0); c.lookAt(...l); c.updateProjectionMatrix(); c.updateMatrixWorld();
  return (x: number, y: number, d: number): V3 => {
    const v = new THREE.Vector3(x * 2, y * 2, 0.5).unproject(c).sub(c.position).normalize().multiplyScalar(d).add(c.position);
    return [v.x, v.y, v.z];
  };
};
const PovRoom = ({s}: {s: number}) => <>
  <Stage top="#ffd9ec" bottom="#fff3f9" />
  <mesh position={[0, 3, -6]}><planeGeometry args={[30, 20]} /><meshStandardMaterial color="#ffe6f2" /></mesh>
  {Array.from({length: 7}, (_, i) => <mesh key={i} position={[-5 + i * 1.7, 6.5 + 0.5 * Math.sin(i * 2), -5.8]}><sphereGeometry args={[0.18, 12, 8]} />
    <meshBasicMaterial color={['#fff3b0', '#ffd6e7', '#d6f0ff'][i % 3]} toneMapped={false} /></mesh>)}
  <pointLight position={[0, 5, 3]} intensity={10} distance={14} color="#ffe2ef" />
</>;

// 1. nail tapping on the screen (hook)
const LensScene = ({s}: {s: number}) => {
  const sp = usePov();
  const taps = EV.lens; let i = 0; taps.forEach((t, k) => { if (s >= t[0] - 0.06) i = k; });
  const [t, x, y] = taps[i]; const [, px, py] = taps[Math.max(0, i - 1)];
  const near = s < t ? prog(s, t - 0.06, t) : 1 - prog(s, t + 0.01, t + 0.06);
  const cx = lerp(px, x, ease(prog(s, t - 0.09, t - 0.03))), cy = lerp(py, y, ease(prog(s, t - 0.09, t - 0.03)));
  const intro = easeOut(prog(s, 0, 0.45));
  const tip = sp(cx, cy - 0.02, lerp(3.4, 1.9, near) + (1 - intro) * 3);
  return <>
    <PovRoom s={s} />
    <Mochi s={s} position={[0, 0, -1.5]} mood={s < 0.6 ? 'smile' : 'soft'} lean={0.08} />
    <NailHand position={tip} rot={[-1.35, 0.05, 0.15 * Math.sign(cx)]} scale={0.26} />
  </>;
};
// 2. fluffy brushes across the lens
const Brush = ({position, rot = 0, color = '#ffc6dd', scale = 0.55}: {position: V3; rot?: number; color?: string; scale?: number}) => {
  const m = glossy(color, {rough: 0.85, clear: 0, sheen: '#ffffff'});
  return <group position={position} rotation={[0, 0, rot]} scale={scale}>
    <mesh position={[0, -1.6, 0]} material={glossy('#b9a2ff', {rough: 0.3})}><capsuleGeometry args={[0.13, 2.4, 8, 16]} /></mesh>
    <mesh position={[0, -0.25, 0]} material={glossy('#e6e9ef', {rough: 0.2})}><cylinderGeometry args={[0.2, 0.15, 0.5, 20]} /></mesh>
    {Array.from({length: 46}, (_, i) => { const a = random(`ba${i}`) * Math.PI * 2, r = random(`br${i}`) * 0.32, tilt = r * 1.1;
      return <mesh key={i} position={[Math.cos(a) * r, 0.55, Math.sin(a) * r]} rotation={[Math.sin(a) * tilt, 0, -Math.cos(a) * tilt]} material={m}><coneGeometry args={[0.06, 1.25, 5]} /></mesh>; })}
  </group>;
};
const BrushScene = ({s}: {s: number}) => {
  const sp = usePov();
  const st = EV.brush; let i = 0; st.forEach((b, k) => { if (s >= b[0] - 0.1) i = k; });
  const [t, dir] = st[i]; const u = ease(prog(s, t, t + 0.72));
  const p1 = sp(lerp(-0.62, 0.62, dir > 0 ? u : 1 - u), 0.08 + 0.06 * Math.sin(u * Math.PI), 2.3);
  const p2 = sp(lerp(-0.62, 0.62, dir > 0 ? 1 - u : u) * 0.9, -0.18 - 0.05 * Math.sin(u * Math.PI), 2.6);
  return <>
    <PovRoom s={s} />
    <Mochi s={s} position={[0, 0, -1.5]} mood="soft" />
    <Brush position={p1} rot={-dir * 0.5 - 0.4 + 0.3 * (u - 0.5) * dir} />
    <Brush position={p2} rot={dir * 0.5 + 0.4} color="#c6e8ff" />
  </>;
};
// 3. crinkly iridescent wrapper right in front of the lens
const Wrapper = ({s, crumple, position}: {s: number; crumple: number; position: V3}) => {
  const geo = useMemo(() => new THREE.PlaneGeometry(3.4, 2.6, 48, 36), []);
  const base = useMemo(() => Float32Array.from(geo.attributes.position.array as Float32Array), [geo]);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let k = 0; k < pos.count; k++) {
    const x = base[k * 3], y = base[k * 3 + 1], q = Math.floor(s * 18);
    const n = Math.sin(x * 7.1 + y * 3.3 + q * 1.7) * Math.cos(y * 6.3 - x * 2.1 + q * 0.9) + 0.5 * Math.sin(x * 15 + y * 13 + q * 2.3);
    pos.setXYZ(k, x * (1 - 0.25 * crumple), y * (1 - 0.18 * crumple), n * (0.04 + 0.28 * crumple));
  }
  pos.needsUpdate = true; geo.computeVertexNormals();
  const m = memo('wrap', () => new THREE.MeshPhysicalMaterial({color: '#ffffff', roughness: 0.05, metalness: 0.2, iridescence: 1, iridescenceIOR: 1.8, iridescenceThicknessRange: [100, 800],
    transparent: true, opacity: 0.55, side: THREE.DoubleSide, clearcoat: 1}));
  return <mesh geometry={geo} material={m} position={position} />;
};
const CrinkleScene = ({s}: {s: number}) => {
  const sp = usePov();
  const g = EV.crinkle.find((c) => s < c[1] + 0.2) ?? EV.crinkle[2];
  const u = prog(s, g[0], g[1]), crumple = Math.sin(Math.PI * u) ** 0.6 * (0.7 + 0.3 * Math.sin(u * 14));
  const c = sp(0, 0.0, 3.4);
  return <>
    <PovRoom s={s} />
    <Mochi s={s} position={[0, 0, -1.5]} mood="smile" />
    <Wrapper s={s} crumple={crumple} position={c} />
    <NailHand position={sp(-0.36 + 0.05 * crumple, -0.08, 3.3)} rot={[-0.4, 0, -1.4]} scale={0.3} curl={0.5 * crumple} />
    <NailHand position={sp(0.36 - 0.05 * crumple, -0.06, 3.3)} rot={[-0.4, Math.PI, -1.4]} scale={0.3} curl={0.5 * crumple} />
  </>;
};
// 4. fast nail tapping on jelly keys (macro)
const KEYSEQ = [5, 6, 5, 6, 9, 10, 1, 2, 1, 2, 7, 4, 0, 3, 0, 3, 8, 11, 6, 5, 10, 9, 2, 1, 4, 7, 3, 0, 11, 8];
const KeysScene = ({s}: {s: number}) => {
  const keys = EV.keys, kp = (n: number): V3 => [(n % 4 - 1.5) * 1.5, 1.25, (Math.floor(n / 4) - 1) * 1.5];
  let cur = 0; keys.forEach((t, i) => { if (s >= t - 0.07) cur = i; });
  const t = keys[cur], hp = lerp3(kp(KEYSEQ[Math.max(0, cur - 1)]), kp(KEYSEQ[cur]), ease(prog(s, t - 0.07, t - 0.02)));
  const press = s < t - 0.02 ? 0 : s < t + 0.04 ? 1 : 1 - prog(s, t + 0.04, t + 0.1);
  return <>
    <Stage top="#d7f3ff" bottom="#f1fbff" />
    <Cam p={lerp3([0.4, 6.6, 5.8], [-0.4, 6, 5.2], ease(prog(s, 15, 20)))} l={[0, 0.9, 0.3]} fov={36} k={1.75} />
    <RoundedBox args={[6.6, 0.7, 5]} radius={0.3} position={[0, 0.35, 0]} receiveShadow castShadow material={glossy('#ffffff', {rough: 0.35})} />
    {Array.from({length: 12}, (_, n) => { const last = keys.map((tt, i) => (KEYSEQ[i] === n ? tt : -9)).filter((tt) => tt <= s + 0.02).pop() ?? -9;
      const dn = s < last - 0.02 ? 0 : s < last + 0.04 ? 1 : 1 - prog(s, last + 0.04, last + 0.12); const p = kp(n);
      return <RoundedBox key={n} args={[1.3, 0.75, 1.3]} radius={0.25} position={[p[0], 1.05 - 0.26 * dn, p[2]]} castShadow material={glossy(RAINBOW[n % 6], {rough: 0.08, trans: 0.88})} />; })}
    <NailHand position={[hp[0], hp[1] + 0.32 + 0.7 * (1 - press), hp[2] + 0.1]} rot={[0.45, 0, 0]} scale={0.55} />
  </>;
};
// 5. kinetic sand (macro)
const SandScene = ({s}: {s: number}) => {
  const N = 5, W = 0.75, cuts = EV.sand;
  const k = cuts.findIndex((c) => s < c + 0.7); const ci = k < 0 ? cuts.length - 1 : k, c = cuts[ci];
  const down = s < c - 0.12 ? 0 : s < c + 0.45 ? ease(prog(s, c - 0.12, c + 0.45)) : 1 - ease(prog(s, c + 0.5, c + 0.75));
  return <>
    <Stage top="#e7dcff" bottom="#f8f4ff" />
    <Cam p={lerp3([2.6, 4.6, 6.6], [1.8, 4.2, 6], ease(prog(s, 20, 25)))} l={[0.3, 1.3, 0]} fov={36} k={1.75} />
    <Board w={7} d={5} />
    {Array.from({length: N}, (_, i) => { const idx = N - 1 - i, t0 = i < cuts.length ? cuts[i] + 0.45 : 99, fall = easeOut(prog(s, t0, t0 + 0.35)), x = (idx - (N - 1) / 2) * W;
      return <group key={i} position={[x + W / 2, 0.5, 0]} rotation={[0, 0, -fall * 1.3]}>
        <mesh position={[-W / 2 + 0.005, 1.1, 0]} castShadow receiveShadow material={sandMat('#ffb4d2')}><boxGeometry args={[W - 0.01, 2.2, 2.4]} /></mesh>
        {fall > 0.15 && Array.from({length: 22}, (_, q) => { const kk = prog(s, t0 + 0.15, t0 + 0.8);
          return <mesh key={q} position={[-0.3 + random(`c${i}${q}`) * 0.8, 0.15 + 2.1 * random(`y${i}${q}`) * (1 - kk), -1.1 + random(`z${i}${q}`) * 2.2]} material={sandMat('#ffb4d2')}><boxGeometry args={[0.1, 0.09, 0.1]} /></mesh>; })}
      </group>; })}
    <Knife position={[((N - 1 - ci) - N / 2) * W + W * 0.5 - W / 2 + 0.38, 0.55 + 2.3 + 2.0 * (1 - down), 0]} />
  </>;
};
// 6. slime poking with nails (macro)
const SlimeScene = ({s}: {s: number}) => {
  const ps = EV.slime; let cur = 0; ps.forEach((t, i) => { if (s >= t - 0.25) cur = i; });
  const t = ps[cur], press = s < t ? ease(prog(s, t - 0.25, t)) * 0.3 : s < t + 0.4 ? 0.3 + 0.7 * ease(prog(s, t, t + 0.4)) : 1 - ease(prog(s, t + 0.45, t + 0.95));
  const spots: V3[] = [[-0.5, 0, 0.3], [0.6, 0, -0.2], [0.05, 0, 0.55], [-0.15, 0, -0.45]], sp = spots[cur], sq = 0.32 * press + jig(s, t + 0.95, 0.08, 6, 3);
  const lifting = s > t + 0.45 && s < t + 1.0, lk = prog(s, t + 0.45, t + 1.0), handY = 1.5 - 0.8 * press + (lifting ? 0.8 * lk : 0);
  const slime = glossy('#ff9ed2', {rough: 0.05, trans: 0.92});
  return <>
    <Stage top="#ffe0f1" bottom="#fff5fa" />
    <Cam p={lerp3([0, 5.6, 5.4], [0.6, 5.2, 5], ease(prog(s, 25, 30)))} l={[0, 0.7, 0]} fov={36} k={1.75} />
    <RoundedBox args={[6, 0.3, 5]} radius={0.14} position={[0, 0.15, 0]} receiveShadow material={glossy('#ffffff', {rough: 0.5})} />
    <mesh position={[0, 0.3, 0]} scale={[2.3 * (1 + sq * 0.5), 1.2 * (1 - sq), 2.1 * (1 + sq * 0.5)]} castShadow receiveShadow material={slime}><sphereGeometry args={[1, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} /></mesh>
    {Array.from({length: 16}, (_, i) => <mesh key={i} position={[(random(`bx${i}`) - 0.5) * 3, 0.35 + random(`by${i}`) * 0.8 * (1 - sq), (random(`bz${i}`) - 0.5) * 2.6]} scale={0.04 + random(`bs${i}`) * 0.07}>
      <sphereGeometry args={[1, 12, 8]} /><meshPhysicalMaterial color="#ffffff" transparent opacity={0.65} roughness={0} clearcoat={1} /></mesh>)}
    {lifting && [-0.15, 0.05, 0.22].map((dx, i) => { const len = Math.max(0.05, handY - 0.9), r = 0.07 * (1 - lk) + 0.015;
      return <mesh key={i} position={[sp[0] + dx, 0.95 + len / 2, sp[2] + 0.1]} material={slime}><cylinderGeometry args={[r, r * 1.7, len, 10]} /></mesh>; })}
    <NailHand position={[sp[0], handY, sp[2] + 0.1]} rot={[0.35, 0, 0]} scale={0.6} />
  </>;
};
// 7. honeycomb candy crunch (macro)
const CandyScene = ({s}: {s: number}) => {
  const ts = EV.candy; let cur = 0; ts.forEach((t, i) => { if (s >= t - 0.3) cur = i; });
  const t = ts[cur], press = s < t - 0.3 ? 0 : s < t + 0.3 ? ease(prog(s, t - 0.3, t + 0.3)) : 1 - ease(prog(s, t + 0.35, t + 0.6));
  const xs = [-2.0, -1.0, 0, 1.0, 2.0];
  const mat = memo('combmat2', () => new THREE.MeshPhysicalMaterial({color: '#f5b04a', map: combTex(), roughness: 0.35, clearcoat: 0.8, bumpMap: combTex(), bumpScale: 2}));
  return <>
    <Stage top="#ffeccf" bottom="#fff8ee" />
    <Cam p={lerp3([-1.8, 5, 6.2], [-1, 4.6, 5.6], ease(prog(s, 30, 35)))} l={[0, 1.1, 0]} fov={36} k={1.75} />
    <Board w={7} d={4.4} />
    {xs.map((x, i) => s > ts[i] + 0.3 ? [0, 1, 2].map((q) => { const k = easeOut(prog(s, ts[i] + 0.3, ts[i] + 0.6)), a = q * 2.1 + i;
      return <RoundedBox key={`${i}${q}`} args={[0.5, 0.65, 1.0]} radius={0.1} position={[x + Math.cos(a) * 0.3 * k, 0.85, (q - 1) * 0.95 + Math.sin(a) * 0.2 * k]}
        rotation={[0.2 * k * (q - 1), a * 0.2 * k, 0.15 * k]} castShadow material={mat} />; })
      : <RoundedBox key={i} args={[0.95, 0.75, 3]} radius={0.14} position={[x, 0.88, 0]} castShadow receiveShadow material={mat} />)}
    <group position={[xs[cur], 1.32 + 1.4 * (1 - press) - 0.2 * press, 0]}>
      <mesh scale={[0.55, 0.2, 0.8]} castShadow><sphereGeometry args={[1, 24, 16]} /><meshPhysicalMaterial color="#e3e9f0" roughness={0.15} metalness={0.35} clearcoat={1} /></mesh>
      <mesh position={[0, 0.8, 1.7]} rotation={[0.55, 0, 0]} castShadow><boxGeometry args={[0.18, 0.09, 2.7]} /><meshPhysicalMaterial color="#e3e9f0" roughness={0.15} metalness={0.35} clearcoat={1} /></mesh>
    </group>
  </>;
};
// 8. pop-it, fast
const PopScene = ({s}: {s: number}) => {
  const pops = EV.popit, bp = (n: number): V3 => [((n % 6) - 2.5) * 1.0, 0.75, (Math.floor(n / 6) - 2) * 1.0];
  const order = (k: number) => { const r = Math.floor(k / 6), c = k % 6; return r * 6 + (r % 2 ? 5 - c : c); };
  let cur = 0; pops.forEach((t, i) => { if (s >= t - 0.1) cur = i; });
  const t = pops[cur], hp = lerp3(bp(order(Math.max(0, cur - 1))), bp(order(cur)), ease(prog(s, t - 0.1, t - 0.02)));
  const press = s < t - 0.02 ? 0 : s < t + 0.05 ? 1 : 1 - prog(s, t + 0.05, t + 0.12);
  return <>
    <Stage top="#fff0c9" bottom="#fff9ea" />
    <Cam p={lerp3([0, 7, 5.6], [-0.5, 6.6, 5.2], ease(prog(s, 35, 40)))} l={[0, 0.5, 0.2]} fov={36} k={1.75} />
    <RoundedBox args={[6.4, 0.5, 5.4]} radius={0.2} position={[0, 0.25, 0]} receiveShadow castShadow material={glossy('#ffffff', {rough: 0.4})} />
    {Array.from({length: 30}, (_, n) => { const i = pops.findIndex((_, k) => order(k) === n), pt = i < 0 ? 99 : pops[i] + 0.05;
      const inv = s < pt - 0.02 ? 0 : ease(prog(s, pt - 0.02, pt + 0.02)), p = bp(n);
      return <mesh key={n} position={[p[0], 0.5, p[2]]} scale={[1, 1 - 0.78 * inv + jig(s, pt, 0.15, 10, 6), 1]} castShadow material={glossy(RAINBOW[(Math.floor(n / 6) + (n % 6)) % 6], {rough: 0.3})}>
        <sphereGeometry args={[0.42, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} /></mesh>; })}
    <NailHand position={[hp[0], 0.95 + 0.8 * (1 - press), hp[2] + 0.1]} rot={[0.4, 0, 0]} scale={0.55} />
  </>;
};
// 9. sticky honey dipper
const HoneyScene = ({s}: {s: number}) => {
  const [a, b] = EV.honey, u = prog(s, a, b), honey = glossy('#f2a516', {rough: 0.04, trans: 0.86});
  const dip: V3 = [Math.sin(u * Math.PI * 3) * 0.9, 3.4 + 0.25 * Math.sin(s * 3), 0.2];
  return <>
    <Stage top="#ffe9c7" bottom="#fff7ea" />
    <Cam p={lerp3([0, 4.4, 6.4], [0.6, 4, 5.8], ease(u))} l={[0, 2, 0]} fov={36} k={1.75} />
    <mesh position={[0, 0.12, 0]} receiveShadow material={glossy('#ffffff', {rough: 0.3})}><cylinderGeometry args={[3.2, 2.9, 0.24, 48]} /></mesh>
    {[0, 1, 2].map((i) => <mesh key={i} position={[0, 0.5 + i * 0.6, 0]} castShadow receiveShadow material={matte(i % 2 ? '#e8a556' : '#f0b465', 0.75)}><cylinderGeometry args={[2.1, 2.15, 0.54, 48]} /></mesh>)}
    <mesh position={[0, 2.09, 0]} scale={[0.4 + 1.6 * easeOut(u), 1, 0.4 + 1.6 * easeOut(u)]} material={honey}><cylinderGeometry args={[1, 1, 0.08, 48]} /></mesh>
    <group position={dip} rotation={[0.35, 0, 0.25 * Math.sin(u * Math.PI * 3)]}>
      {Array.from({length: 6}, (_, i) => <mesh key={i} position={[0, -0.15 - i * 0.16, 0]} material={honey}><torusGeometry args={[0.3 - Math.abs(i - 2.5) * 0.04, 0.07, 10, 24]} /></mesh>)}
      <mesh position={[0, -0.55, 0]} material={honey}><cylinderGeometry args={[0.16, 0.16, 1.1, 16]} /></mesh>
      <mesh position={[0, 1.0, 0]} castShadow material={glossy('#c58a4a', {rough: 0.5, clear: 0.3})}><cylinderGeometry args={[0.1, 0.1, 2.2, 12]} /></mesh>
    </group>
    <mesh position={[dip[0], (dip[1] - 1.2 + 2.1) / 2, dip[2]]} material={honey}><cylinderGeometry args={[0.03, 0.05, dip[1] - 1.2 - 2.1, 10]} /></mesh>
    {[0.4, 1.8, 3.2, 4.6].map((ang, i) => { const k = prog(s, a + 0.8 + i * 0.7, a + 2.4 + i * 0.7);
      return k > 0 && <mesh key={i} position={[Math.cos(ang) * 2.12, 2.05 - k * 0.7, Math.sin(ang) * 2.12]} material={honey}><capsuleGeometry args={[0.1, 1.4 * k, 8, 12]} /></mesh>; })}
  </>;
};
// 10. fluffy mic scratching
const furTex = (k: number) => canvas(`fur${k}`, 256, 256, (x) => {
  x.clearRect(0, 0, 256, 256);
  for (let i = 0; i < 2600; i++) { if (random(`f${k}${i}`) > 1 - 0.55 / (k + 1)) continue; const px = random(`x${k}${i}`) * 256, py = random(`y${k}${i}`) * 256;
    x.fillStyle = `rgba(255,255,255,${0.85 - k * 0.1})`; x.fillRect(px, py, 2, 2); }
}, [4, 4]);
const FluffyMic = ({s, wob}: {s: number; wob: number}) => <group position={[0, 0, 0]} rotation={[0, 0, wob]}>
  <mesh position={[0, -1.6, 0]} castShadow material={glossy('#7e6bd6', {rough: 0.3})}><cylinderGeometry args={[0.35, 0.3, 3, 24]} /></mesh>
  <mesh position={[0, 0.6, 0]} material={glossy('#f7d5ff', {rough: 0.95, clear: 0})}><sphereGeometry args={[1.2, 32, 24]} /></mesh>
  {[1, 2, 3, 4, 5, 6].map((k) => <mesh key={k} position={[0, 0.6, 0]} scale={1 + k * 0.035}><sphereGeometry args={[1.2, 32, 24]} />
    <meshStandardMaterial color="#f7d5ff" alphaMap={furTex(k)} transparent depthWrite={false} roughness={1} /></mesh>)}
</group>;
const MicScene = ({s}: {s: number}) => {
  const st = EV.mic; let i = 0; st.forEach((m, k) => { if (s >= m[0] - 0.05) i = k; });
  const [t, ear] = st[i], u = prog(s, t, t + 0.33), scr = Math.sin(u * Math.PI * 4) * 0.25;
  const wob = 0.05 * Math.sin(s * 30) * (u > 0 && u < 1 ? 1 : 0);
  return <>
    <PovRoom s={s} />
    <Cam p={[0, 3.2, 8.6]} l={[0, 2.2, 0]} fov={40} k={1} />
    <Mochi s={s} position={[0, -0.3, -2.6]} mood="soft" />
    <group position={[0, 1.6, 1.2]} scale={0.75}><FluffyMic s={s} wob={wob} /></group>
    <NailHand position={[-1.05 + (ear < 0 ? 0.2 : -0.1), 2.2 + (ear < 0 ? scr : 0), 2.1]} rot={[-0.2, 0.3, 1.3]} scale={0.45} curl={ear < 0 ? 0.6 + scr : 0.2} />
    <NailHand position={[1.05 - (ear > 0 ? 0.2 : -0.1), 2.2 + (ear > 0 ? scr : 0), 2.1]} rot={[-0.2, -0.3, -1.3]} scale={0.45} curl={ear > 0 ? 0.6 + scr : 0.2} />
  </>;
};
// 11. water drops (bowls in a grid)
const NOTESET = [0, 2, 4, 7, 9, 12], BOWLC = ['#ff8fab', '#ffb86b', '#ffe27a', '#8be38f', '#6cc9ff', '#b79cff'];
const DropsScene = ({s}: {s: number}) => {
  const ds = EV.drops, notes = TL.notes, bx = (n: number) => ((NOTESET.indexOf(n) % 3) - 1) * 1.4, bz = (n: number) => (Math.floor(NOTESET.indexOf(n) / 3) - 0.5) * 1.5;
  return <>
    <Stage top="#dff1ff" bottom="#f3faff" />
    <Cam p={lerp3([0, 5.6, 5.2], [0.3, 5.2, 4.8], ease(prog(s, 50, 55)))} l={[0, 0.9, 0]} fov={36} k={1.75} />
    <RoundedBox args={[5.2, 0.3, 4]} radius={0.14} position={[0, 0.15, 0]} receiveShadow material={glossy('#ffffff', {rough: 0.4})} />
    {NOTESET.map((n, i) => { const hits = ds.map((t, k) => (notes[k] === n ? t + 0.4 : -9)).filter((t) => t <= s), last = hits.length ? hits[hits.length - 1] : -9, w = jig(s, last, 0.05, 8, 4);
      return <group key={i} position={[bx(n), 0.3, bz(n)]}>
        <mesh position={[0, 0.45, 0]} castShadow material={glossy(BOWLC[i], {rough: 0.2})}><cylinderGeometry args={[0.55, 0.38, 0.9, 32, 1, true]} /></mesh>
        <mesh position={[0, 0.05, 0]} material={glossy(BOWLC[i], {rough: 0.2})}><cylinderGeometry args={[0.38, 0.38, 0.1, 32]} /></mesh>
        <mesh position={[0, 0.72 + w, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.5, 32]} /><meshPhysicalMaterial color="#9fdcff" roughness={0} clearcoat={1} transparent opacity={0.85} /></mesh>
        {hits.slice(-2).map((h, q) => { const k = prog(s, h, h + 0.7); return k < 1 && <mesh key={q} position={[0, 0.74, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={0.1 + 0.4 * k}>
          <ringGeometry args={[0.9, 1, 32]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.8 * (1 - k)} /></mesh>; })}
      </group>; })}
    {ds.map((t, k) => { const f = prog(s, t, t + 0.4); if (s < t - 0.05 || f >= 1) return null;
      return <mesh key={k} position={[bx(notes[k]), lerp(6, 1.05, f * f), bz(notes[k])]} scale={[0.15, 0.15 * (1 + f * 0.8), 0.15]}><sphereGeometry args={[1, 16, 12]} />
        <meshPhysicalMaterial color="#bfe9ff" roughness={0} clearcoat={1} transparent opacity={0.9} /></mesh>; })}
  </>;
};
// 12. plucking your stress away (personal attention finale)
const PluckScene = ({s}: {s: number}) => {
  const sp = usePov(), pl = EV.pluck; let i = 0; pl.forEach((t, k) => { if (s >= t - 0.35) i = k; });
  const t = pl[i], spots: [number, number][] = [[-0.2, 0.12], [0.22, 0.08], [-0.15, -0.12], [0.18, -0.15]], [x, y] = spots[i];
  const reach = s < t ? ease(prog(s, t - 0.35, t)) : 1 - ease(prog(s, t + 0.1, t + 0.5));
  const pull = s > t ? ease(prog(s, t, t + 0.5)) : 0;
  const tip = sp(x + pull * 0.3 * Math.sign(x), y + pull * 0.1, lerp(3.4, 1.9, reach));
  const done = s > pl[3] + 0.7;
  return <>
    <PovRoom s={s} />
    <Mochi s={s} position={[0, 0, done ? 0 : -1.2]} mood={done ? 'smile' : s > t && s < t + 0.6 ? 'puff' : 'soft'} lean={0.1} />
    {!done && <NailHand position={tip} rot={[-1.35, 0.05, 0.25 * Math.sign(x)]} scale={0.26} curl={pull} />}
  </>;
};

// ---------------------------------------------------------------- 2D overlays: tap ripples, stress scribbles, labels
const TapRipples = ({s}: {s: number}) => <>{EV.lens.filter((t) => s >= t[0] && s < t[0] + 0.45).map(([t, x, y], i) => {
  const k = prog(s, t, t + 0.45), X = 540 + x * 1080, Y = 960 - y * 1920;
  return <div key={i} style={{position: 'absolute', left: X - 90 * k - 10, top: Y - 90 * k - 10, width: 180 * k + 20, height: 180 * k + 20, borderRadius: '50%',
    border: `${4 * (1 - k) + 1}px solid rgba(255,255,255,${0.75 * (1 - k)})`, boxShadow: `0 0 18px rgba(255,200,230,${0.6 * (1 - k)})`}} />;
})}</>;
const Stress = ({s}: {s: number}) => {
  const pl = EV.pluck, spots: [number, number][] = [[-0.2, 0.12], [0.22, 0.08], [-0.15, -0.12], [0.18, -0.15]];
  return <>{pl.map((t, i) => { const [x, y] = spots[i], gone = prog(s, t, t + 0.7), X = 540 + x * 1080 + gone * 600 * Math.sign(x), Y = 960 - y * 1920 - gone * 120;
    if (gone >= 1) return <div key={i} style={{position: 'absolute', left: X - 30, top: Y - 30, fontSize: 60, opacity: 1 - prog(s, t + 0.7, t + 1.2), color: '#fff6a8', textShadow: '0 0 20px #fff'}}>✦</div>;
    return <svg key={i} width="160" height="160" viewBox="0 0 160 160" style={{position: 'absolute', left: X - 80, top: Y - 80, opacity: 0.85 * (1 - gone), transform: `scale(${1 - 0.5 * gone}) rotate(${s * 40}deg)`}}>
      <path d="M30 80 C40 30, 120 30, 110 80 S50 130, 60 80 S100 50, 95 85 S70 100, 75 82" fill="none" stroke="#6b5f78" strokeWidth="9" strokeLinecap="round" /></svg>; })}</>;
};
export const AsmrShort2 = () => {
  const f = useCurrentFrame(), s = f / 30;
  const idx = TL.trig.findIndex((x) => s >= x.a && s < x.b), tr = TL.trig[idx < 0 ? TL.trig.length - 1 : idx], n = (idx < 0 ? TL.trig.length - 1 : idx) + 1;
  const dip = idx > 0 ? clamp01(1 - (s - tr.a) / 0.14) : 0;
  const lab = clamp01((s - tr.a - 0.08) / 0.2) * clamp01((tr.b - s) / 0.2), hook = clamp01(Math.min((s - 0.05) / 0.2, (2.8 - s) / 0.3)), end = clamp01((s - 58.3) / 0.4);
  return <AbsoluteFill style={{background: '#fff'}}>
    <ThreeCanvas width={1080} height={1920} shadows gl={{antialias: true}}>
      {tr.id === 'lens' && <LensScene s={s} />}
      {tr.id === 'brush' && <BrushScene s={s} />}
      {tr.id === 'crinkle' && <CrinkleScene s={s} />}
      {tr.id === 'keys' && <KeysScene s={s} />}
      {tr.id === 'sand' && <SandScene s={s} />}
      {tr.id === 'slime' && <SlimeScene s={s} />}
      {tr.id === 'candy' && <CandyScene s={s} />}
      {tr.id === 'popit' && <PopScene s={s} />}
      {tr.id === 'honey' && <HoneyScene s={s} />}
      {tr.id === 'mic' && <MicScene s={s} />}
      {tr.id === 'drops' && <DropsScene s={s} />}
      {tr.id === 'pluck' && <PluckScene s={s} />}
    </ThreeCanvas>
    {tr.id === 'lens' && <TapRipples s={s} />}
    {tr.id === 'pluck' && <Stress s={s} />}
    <AbsoluteFill style={{background: '#fff', opacity: dip * 0.8}} />
    <div style={{position: 'absolute', top: 230, width: 1080, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16}}>
      {hook > 0 && <div style={{opacity: hook, background: 'rgba(70,45,90,.6)', borderRadius: 50, padding: '12px 34px', fontFamily: 'Montserrat', fontWeight: 800, fontSize: 44, color: '#fff'}}>headphones on 🤍</div>}
      <div style={{opacity: lab, transform: `translateY(${(1 - lab) * -14}px)`, display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(255,255,255,.82)', borderRadius: 50, padding: '14px 30px',
        boxShadow: '0 8px 24px rgba(120,60,140,.18)'}}>
        <span style={{fontFamily: 'Montserrat', fontWeight: 800, fontSize: 46, color: '#ff6fa5'}}>{n}/12</span>
        <span style={{fontFamily: 'Montserrat', fontWeight: 800, fontSize: 46, color: '#5a3d6e'}}>{tr.label}</span>
      </div>
    </div>
    {end > 0 && <div style={{position: 'absolute', top: 1560, width: 1080, textAlign: 'center', opacity: end, fontFamily: 'Montserrat', fontWeight: 800, fontSize: 66, color: '#fff',
      WebkitTextStroke: '12px rgba(90,50,110,.9)', paintOrder: 'stroke fill', lineHeight: 1.15}}>which number<br />gave you tingles?</div>}
    <Audio src={staticFile('asmr/asmr2.wav')} />
  </AbsoluteFill>;
};
