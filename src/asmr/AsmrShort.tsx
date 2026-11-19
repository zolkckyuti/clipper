// Cartoon ASMR #1 — 60 s of tingle scenes (1080x1920, 30 fps). Picture and sound share src/asmr/timeline.json
// (written by asmr/make_asmr.py, which also synthesizes every sound). No music, no meme sounds, no voice.
// Scenes: rainbow jelly (hook: it has a face, then gets sliced) → kinetic sand → jelly keycaps → pop-it → soap carving →
// slime → honey on pancakes → honeycomb candy → water-drop bowls → the jelly puts itself back together (loop).
import {RoundedBox} from '@react-three/drei';
import {useThree} from '@react-three/fiber';
import {loadFont} from '@remotion/fonts';
import {ThreeCanvas} from '@remotion/three';
import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, random, staticFile, useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import TL from './timeline.json';

loadFont({family: 'Montserrat', url: staticFile('Montserrat-Black.woff2'), weight: '800'});
export const ASMR1_MS = TL.dur * 1000;
type V3 = [number, number, number];
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const ease = (t: number) => { const x = clamp01(t); return x * x * (3 - 2 * x); };
const easeOut = (t: number) => 1 - (1 - clamp01(t)) ** 3;
const prog = (o: number, a: number, b: number) => clamp01((o - a) / (b - a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
/** damped jiggle after an event at time e (seconds), for squash & stretch */
const jig = (s: number, e: number, amp = 0.08, f = 9, d = 3.5) => (s < e ? 0 : amp * Math.sin((s - e) * f * Math.PI * 2 / 3) * Math.exp(-(s - e) * d));
const EV = TL.ev;

// ---------------------------------------------------------------- materials / textures
const cache = new Map<string, unknown>();
const memo = <T,>(k: string, f: () => T): T => { if (!cache.has(k)) cache.set(k, f()); return cache.get(k) as T; };
const glossy = (color: string, o: {rough?: number; clear?: number; trans?: number; sheen?: string} = {}) => memo(`g:${color}:${JSON.stringify(o)}`, () => new THREE.MeshPhysicalMaterial({
  color, roughness: o.rough ?? 0.22, clearcoat: o.clear ?? 1, clearcoatRoughness: 0.08, metalness: 0, transparent: (o.trans ?? 1) < 1, opacity: o.trans ?? 1,
  sheen: o.sheen ? 0.6 : 0, sheenColor: new THREE.Color(o.sheen ?? '#ffffff')}));
const matte = (color: string, rough = 0.85) => memo(`m:${color}:${rough}`, () => new THREE.MeshStandardMaterial({color, roughness: rough}));
const canvas = (key: string, w: number, h: number, draw: (x: CanvasRenderingContext2D) => void, rep?: [number, number]) => memo(`t:${key}`, () => {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); } return t;
});
const grainTex = (seed: string) => canvas(`grain:${seed}`, 256, 256, (x) => {
  const img = x.createImageData(256, 256);
  for (let i = 0; i < 256 * 256; i++) { const v = 150 + random(`${seed}${i}`) * 105; img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255; }
  x.putImageData(img, 0, 0);
}, [3, 3]);
const sandMat = (color: string) => memo(`sand:${color}`, () => new THREE.MeshStandardMaterial({color, roughness: 1, bumpMap: grainTex('s'), bumpScale: 1.4}));
const woodTex = () => canvas('wood', 512, 512, (x) => {
  x.fillStyle = '#e9c79a'; x.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 60; i++) { x.strokeStyle = `rgba(150,100,55,${0.08 + random(`w${i}`) * 0.12})`; x.lineWidth = 1 + random(`wl${i}`) * 3; x.beginPath();
    const y = random(`wy${i}`) * 512; x.moveTo(0, y); for (let k = 0; k <= 8; k++) x.lineTo(k * 64, y + Math.sin(k + i) * 6); x.stroke(); }
});
const combTex = () => canvas('comb', 256, 256, (x) => {
  x.fillStyle = '#f0a43a'; x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 90; i++) { x.fillStyle = `rgba(150,70,10,${0.25 + random(`c${i}`) * 0.3})`; x.beginPath(); x.arc(random(`cx${i}`) * 256, random(`cy${i}`) * 256, 3 + random(`cr${i}`) * 9, 0, Math.PI * 2); x.fill(); }
}, [2, 2]);
const faceTex = (blink: boolean, mood: 'happy' | 'wow' | 'dizzy') => canvas(`face:${blink}:${mood}`, 512, 512, (x) => {
  x.clearRect(0, 0, 512, 512); x.fillStyle = '#2b1b3a'; x.strokeStyle = '#2b1b3a'; x.lineCap = 'round';
  const eye = (cx: number) => {
    if (blink) { x.lineWidth = 16; x.beginPath(); x.arc(cx, 220, 30, 0.1 * Math.PI, 0.9 * Math.PI); x.stroke(); return; }
    if (mood === 'dizzy') { x.lineWidth = 12; x.beginPath(); for (let a = 0; a < 12; a += 0.2) x.lineTo(cx + Math.cos(a) * a * 3, 220 + Math.sin(a) * a * 3); x.stroke(); return; }
    x.beginPath(); x.ellipse(cx, 220, 30, mood === 'wow' ? 46 : 40, 0, 0, Math.PI * 2); x.fill(); x.fillStyle = '#fff';
    x.beginPath(); x.arc(cx + 10, 204, 12, 0, Math.PI * 2); x.fill(); x.beginPath(); x.arc(cx - 10, 236, 6, 0, Math.PI * 2); x.fill(); x.fillStyle = '#2b1b3a';
  };
  eye(170); eye(342);
  x.fillStyle = 'rgba(255,120,150,.55)'; x.beginPath(); x.ellipse(118, 300, 36, 20, 0, 0, Math.PI * 2); x.fill(); x.beginPath(); x.ellipse(394, 300, 36, 20, 0, 0, Math.PI * 2); x.fill();
  x.fillStyle = '#2b1b3a'; x.lineWidth = 14;
  if (mood === 'wow') { x.beginPath(); x.ellipse(256, 320, 30, 38, 0, 0, Math.PI * 2); x.fill(); }
  else { x.beginPath(); x.arc(256, 290, 46, 0.15 * Math.PI, 0.85 * Math.PI); x.stroke(); }
});
const RAINBOW = ['#ff6b8b', '#ff9f5a', '#ffd95a', '#7ee081', '#5ec8ff', '#a78bfa'];

// ---------------------------------------------------------------- stage
const Stage = ({top, bottom, o}: {top: string; bottom: string; o?: number}) => {
  const {scene} = useThree();
  scene.background = canvas(`bg:${top}:${bottom}`, 8, 512, (x) => { const g = x.createLinearGradient(0, 0, 0, 512); g.addColorStop(0, top); g.addColorStop(1, bottom); x.fillStyle = g; x.fillRect(0, 0, 8, 512); });
  scene.fog = null;
  return <>
    <hemisphereLight args={['#ffffff', '#f3d9ff', 1.25]} />
    <directionalLight position={[6, 14, 8]} intensity={2.3} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048}
      shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-12} shadow-bias={-0.0005} shadow-radius={6} />
    <directionalLight position={[-8, 6, -6]} intensity={1.1} color="#cfe6ff" />
    <pointLight position={[0, 6, 9]} intensity={14} distance={30} color="#fff1f6" />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow><planeGeometry args={[80, 80]} /><meshStandardMaterial color={bottom} roughness={0.9} /></mesh>
  </>;
};
const Cam = ({p, l, fov = 32, k = 1.5}: {p: V3; l: V3; fov?: number; k?: number}) => {
  const {camera} = useThree(); const c = camera as THREE.PerspectiveCamera;
  c.position.set(l[0] + (p[0] - l[0]) * k, l[1] + (p[1] - l[1]) * k, l[2] + (p[2] - l[2]) * k); c.fov = fov; c.near = 0.1; c.far = 200; c.up.set(0, 1, 0); c.lookAt(...l); c.updateProjectionMatrix(); return null;
};
const Board = ({w = 9, d = 6}: {w?: number; d?: number}) => <RoundedBox args={[w, 0.5, d]} radius={0.22} position={[0, 0.25, 0]} receiveShadow castShadow>
  <meshStandardMaterial map={woodTex()} roughness={0.7} /></RoundedBox>;

// ---------------------------------------------------------------- tools
const Knife = ({position, rot = 0}: {position: V3; rot?: number}) => <group position={position} rotation={[0, 0, rot]}>
  <mesh position={[0, 1.4, 0]} castShadow><boxGeometry args={[0.07, 2.8, 4.2]} /><meshPhysicalMaterial color="#dfe6ee" roughness={0.18} metalness={0.35} clearcoat={1} /></mesh>
  <RoundedBox args={[0.34, 0.6, 2.4]} radius={0.12} position={[0, 2.95, 2.9]} rotation={[0.15, 0, 0]} castShadow material={glossy('#ff8fb1', {rough: 0.4})} />
</group>;
/** cartoon hand pointing down (index finger tip at the group origin) */
const Hand = ({position, press = 0, rotY = 0, scale = 0.62}: {position: V3; press?: number; rotY?: number; scale?: number}) => {
  const skin = glossy('#ffd3b4', {rough: 0.55, clear: 0.3});
  return <group position={position} rotation={[0, rotY, 0]} scale={scale}>
    <group position={[0, 0, 0]} rotation={[0.35 - 0.1 * press, 0, 0]}>
      <mesh position={[0, 1.05, 0]} castShadow material={skin}><capsuleGeometry args={[0.36, 1.3, 8, 16]} /></mesh>
      <RoundedBox args={[1.9, 1.6, 1.0]} radius={0.45} position={[-0.45, 2.6, -0.3]} castShadow material={skin} />
      {[-0.55, -1.05].map((x, i) => <mesh key={i} position={[x, 1.75, 0.15]} rotation={[0.9, 0, 0]} castShadow material={skin}><capsuleGeometry args={[0.33, 0.55, 8, 16]} /></mesh>)}
      <mesh position={[0.55, 2.2, 0.25]} rotation={[0.3, 0, -0.7]} castShadow material={skin}><capsuleGeometry args={[0.32, 0.6, 8, 16]} /></mesh>
      <mesh position={[-0.45, 3.7, -0.35]} castShadow material={glossy('#a5d8ff', {rough: 0.5})}><cylinderGeometry args={[1.05, 1.0, 0.7, 24]} /></mesh>
    </group>
  </group>;
};

// ---------------------------------------------------------------- 1 + 10: rainbow jelly with a face
const Jelly = ({s, finale = false}: {s: number; finale?: boolean}) => {
  const N = 6, W = 0.55;
  const cuts = EV.jellyCuts, tips = EV.jellyTips;
  // reform: slices stand back up and slide together
  const back = finale ? ease(prog(s, EV.reform[0], EV.reform[1])) : 0;
  const blink = finale ? (s > 58.2 && s < 58.45) : (s > 0.45 && s < 0.65);
  const mood = finale ? (s > EV.reform[1] + 0.4 ? 'happy' : 'dizzy') : (s > cuts[0] - 0.3 && s < cuts[0] + 0.25 ? 'wow' : 'happy');
  const ft = faceTex(blink, mood as 'happy');
  const wob = cuts.reduce((a, e) => a + jig(s, e + 0.2, 0.05), 0) + (finale ? jig(s, EV.reform[1] + 0.1, 0.12, 6, 2.5) : jig(s, 0.05, 0.1, 6, 2.2));
  const uvGeo = useMemo(() => Array.from({length: N}, (_, i) => { const g = new THREE.PlaneGeometry(W, 3.2); const uv = g.attributes.uv as THREE.BufferAttribute;
    for (let k = 0; k < uv.count; k++) uv.setX(k, (i + uv.getX(k)) / N); uv.needsUpdate = true; return g; }), []);
  return <group position={[0, 0.5, 0]} scale={[1 - wob * 0.6, 1 + wob, 1 - wob * 0.6]}>
    {Array.from({length: N}, (_, i) => {
      const cut = i === 0 ? 0 : cuts[i - 1];   // slice i is free once the cut to its left happened
      const spread = finale ? (1 - back) : (s > cut + 0.25 ? 1 : 0);
      const tipT = finale ? 1 - back : easeOut(prog(s, tips[N - 1 - i], tips[N - 1 - i] + 0.38));
      const tipBounce = finale ? 0 : jig(s, tips[N - 1 - i] + 0.38, 0.12, 7, 4);
      const x = (i - (N - 1) / 2) * (W + 0.08 * spread);
      const fan = (i - (N - 1) / 2) * 0.2 * tipT + tipBounce * 0.4 * Math.sign(i - (N - 1) / 2);
      return <group key={i} position={[x * (1 + 1.6 * tipT), 0, 0]} rotation={[0, 0, -fan]}>
        <group position={[0, 0, 0]}>
          {RAINBOW.map((c, k) => <mesh key={k} position={[0, 0.267 + k * 0.533, 0]} castShadow receiveShadow material={glossy(c, {rough: 0.12, trans: 0.92})}>
            <boxGeometry args={[W, 0.533, 3.2]} /></mesh>)}
          <mesh position={[0, 1.6, 1.605]} geometry={uvGeo[i]}><meshBasicMaterial map={ft} transparent toneMapped={false} /></mesh>
        </group>
      </group>;
    })}
  </group>;
};
const JellyScene = ({s}: {s: number}) => {
  const cuts = EV.jellyCuts;
  const k = cuts.findIndex((c) => s < c + 0.5);
  const ci = k < 0 ? cuts.length - 1 : k, c = cuts[ci];
  const down = s < c - 0.2 ? 0 : s < c + 0.22 ? ease(prog(s, c - 0.2, c + 0.22)) : 1 - ease(prog(s, c + 0.24, c + 0.5));
  const kx = (ci + 1 - 3) * 0.6 - 0.04;
  const showKnife = s > 0.55 && s < cuts[cuts.length - 1] + 0.55;
  return <>
    <Stage top="#ffd6e7" bottom="#fff1f7" />
    <Cam p={lerp3([0, 5.2, 11.5], [0.6, 6.4, 10], ease(s / 6.6))} l={[0, 1.6, 0.6]} fov={34} />
    <Board />
    <Jelly s={s} />
    {showKnife && <Knife position={[kx, 0.55 + 3.4 * (1 - down) + 0.02, 0.2]} />}
  </>;
};
const FinaleScene = ({s}: {s: number}) => <>
  <Stage top="#ffd6e7" bottom="#fff1f7" />
  <Cam p={lerp3([0.4, 6, 11], [0, 4.6, 9.5], ease(prog(s, 55.4, 60)))} l={[0, 1.7, 0.6]} fov={34} />
  <Board />
  <Jelly s={s} finale />
</>;

// ---------------------------------------------------------------- 2: kinetic sand
const SandScene = ({s}: {s: number}) => {
  const N = 6, W = 0.7, cuts = EV.sandCuts;
  const k = cuts.findIndex((c) => s < c + 0.75); const ci = k < 0 ? cuts.length - 1 : k, c = cuts[ci];
  const down = s < c - 0.15 ? 0 : s < c + 0.55 ? ease(prog(s, c - 0.15, c + 0.55)) : 1 - ease(prog(s, c + 0.6, c + 0.85));
  const kx = ((N - 1 - ci) - N / 2) * W + W * 0.0;
  return <>
    <Stage top="#e3d9ff" bottom="#f6f1ff" />
    <Cam p={lerp3([3, 6.2, 10.5], [1.6, 5.6, 9.6], ease(prog(s, 6.6, 12.6)))} l={[0.4, 1.2, 0]} fov={34} />
    <Board />
    {Array.from({length: N}, (_, i) => {
      const idx = N - 1 - i;   // cut from the right end: slice i (from the right) is free after cut i
      const t0 = i < cuts.length ? cuts[i] + 0.55 : 99;
      const fall = easeOut(prog(s, t0, t0 + 0.4));
      const x = (idx - (N - 1) / 2) * W;
      return <group key={i} position={[x + W / 2, 0.5, 0]} rotation={[0, 0, -fall * 1.25]}>
        <mesh position={[-W / 2 + 0.005, 1.1, 0]} castShadow receiveShadow material={sandMat('#b9a3ff')}><boxGeometry args={[W - 0.01, 2.2, 2.6]} /></mesh>
        {fall > 0.2 && Array.from({length: 14}, (_, q) => { const r = random(`cr${i}${q}`), kk = prog(s, t0 + 0.2, t0 + 0.9);
          return <mesh key={q} position={[-0.2 + r * 0.6, 0.2 + 2 * random(`cy${i}${q}`) * (1 - kk), -1.2 + random(`cz${i}${q}`) * 2.4]} material={sandMat('#b9a3ff')}>
            <boxGeometry args={[0.12, 0.1, 0.12]} /></mesh>; })}
      </group>;
    })}
    <Knife position={[kx + W * 0.5 - W, 0.55 + 2.35 + 2.4 * (1 - down), 0]} />
  </>;
};

// ---------------------------------------------------------------- 3: jelly keycaps
const KEY_ORDER = [5, 6, 1, 2, 9, 10, 7, 4, 0, 3, 8, 11, 6, 5, 10, 9, 2, 1];
const KeysScene = ({s}: {s: number}) => {
  const keys = EV.keys;
  const kpos = (n: number): V3 => [(n % 4 - 1.5) * 1.55, 1.25, (Math.floor(n / 4) - 1) * 1.55];
  let cur = 0; keys.forEach((t, i) => { if (s >= t - 0.18) cur = i; });
  const t = keys[cur], prev = kpos(KEY_ORDER[Math.max(0, cur - 1)]), nxt = kpos(KEY_ORDER[cur]);
  const mv = ease(prog(s, t - 0.18, t - 0.04));
  const press = s < t - 0.04 ? 0 : s < t + 0.06 ? 1 : 1 - prog(s, t + 0.06, t + 0.16);
  const hp = lerp3(prev, nxt, mv);
  return <>
    <Stage top="#d7f3ff" bottom="#f1fbff" />
    <Cam p={lerp3([0, 9.5, 8.5], [0.8, 9, 7.6], ease(prog(s, 12.6, 18.6)))} l={[0, 0.8, 0.2]} fov={36} />
    <RoundedBox args={[7, 0.7, 5.2]} radius={0.3} position={[0, 0.35, 0]} receiveShadow castShadow material={glossy('#ffffff', {rough: 0.35})} />
    {Array.from({length: 12}, (_, n) => {
      const last = keys.map((tt, i) => (KEY_ORDER[i] === n ? tt : -9)).filter((tt) => tt <= s + 0.04).pop() ?? -9;
      const dn = s < last - 0.04 ? 0 : s < last + 0.06 ? 1 : 1 - prog(s, last + 0.06, last + 0.18);
      const p = kpos(n);
      return <RoundedBox key={n} args={[1.35, 0.75, 1.35]} radius={0.25} position={[p[0], 1.05 - 0.28 * dn, p[2]]} castShadow material={glossy(RAINBOW[n % 6], {rough: 0.1, trans: 0.88})} />;
    })}
    <Hand position={[hp[0] + 0.1, hp[1] + 0.35 + 0.9 * (1 - press) - 0.28 * press, hp[2] + 0.35]} press={press} />
  </>;
};

// ---------------------------------------------------------------- 4: pop-it
const PopScene = ({s}: {s: number}) => {
  const pops = EV.pops;
  const bpos = (n: number): V3 => [((n % 5) - 2) * 1.15, 0.75, (Math.floor(n / 5) - 1.5) * 1.15];
  const order = (n: number) => { const r = Math.floor(n / 5), c = n % 5; return r * 5 + (r % 2 ? 4 - c : c); };   // snake path
  let cur = 0; pops.forEach((t, i) => { if (s >= t - 0.16) cur = i; });
  const t = pops[cur], prev = bpos(order(Math.max(0, cur - 1))), nxt = bpos(order(cur));
  const hp = lerp3(prev, nxt, ease(prog(s, t - 0.16, t - 0.03)));
  const press = s < t - 0.03 ? 0 : s < t + 0.08 ? 1 : 1 - prog(s, t + 0.08, t + 0.18);
  return <>
    <Stage top="#fff0c9" bottom="#fff9ea" />
    <Cam p={lerp3([0, 9, 7.5], [-0.6, 8.6, 7], ease(prog(s, 18.6, 24.6)))} l={[0, 0.5, 0.2]} fov={36} />
    <RoundedBox args={[6.4, 0.5, 5.2]} radius={0.2} position={[0, 0.25, 0]} receiveShadow castShadow material={glossy('#ffffff', {rough: 0.4})} />
    {Array.from({length: 20}, (_, n) => {
      const i = pops.findIndex((_, k) => order(k) === n), pt = pops[i] + 0.06;
      const inv = s < pt - 0.03 ? 0 : ease(prog(s, pt - 0.03, pt + 0.02));
      const p = bpos(n), row = Math.floor(n / 5);
      return <mesh key={n} position={[p[0], 0.5, p[2]]} scale={[1, 1 - 0.78 * inv + jig(s, pt, 0.15, 10, 6), 1]} castShadow material={glossy(RAINBOW[(row + (n % 5)) % 6], {rough: 0.3})}>
        <sphereGeometry args={[0.48, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} /></mesh>;
    })}
    <Hand position={[hp[0] + 0.1, 0.5 + 0.55 + 1.0 * (1 - press), hp[2] + 0.35]} press={press} />
  </>;
};

// ---------------------------------------------------------------- 5: soap carving
const SoapScene = ({s}: {s: number}) => {
  const carves = EV.carves, lanes = [-1.2, -0.4, 0.4, 1.2];
  let cur = 0; carves.forEach((t, i) => { if (s >= t - 0.25) cur = i; });
  const t = carves[cur], u = prog(s, t, t + 1.05), lift = s < t ? 1 - prog(s, t - 0.25, t) : s > t + 1.05 ? prog(s, t + 1.05, t + 1.3) : 0;
  const tz = lerp(-1.6, 1.6, ease(u));
  return <>
    <Stage top="#ffe0ee" bottom="#fff4f8" />
    <Cam p={lerp3([3.6, 6.4, 8.4], [2.8, 5.8, 7.6], ease(prog(s, 24.6, 30.6)))} l={[0, 1.3, 0]} fov={34} />
    <Board w={8} d={6} />
    <RoundedBox args={[3.6, 1.6, 4]} radius={0.35} position={[0, 1.3, 0]} castShadow receiveShadow material={glossy('#ffb6d0', {rough: 0.55, clear: 0.2, sheen: '#ffffff'})} />
    {carves.map((tc, i) => { const k = prog(s, tc, tc + 1.05); if (k <= 0) return null;
      return <mesh key={i} position={[lanes[i], 2.105, -1.6 + 1.6 * k]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.5, 3.2 * k]} /><meshStandardMaterial color="#f78fb5" roughness={0.9} /></mesh>; })}
    {carves.map((tc, i) => { const k = prog(s, tc, tc + 1.05); if (k <= 0) return null;
      const fall = easeOut(prog(s, tc + 1.1, tc + 1.45)), zz = 1.6 + 0.3 * fall;
      return <mesh key={`c${i}`} position={[lanes[i], 2.35 - 1.7 * fall, (s < tc + 1.05 ? lerp(-1.6, 1.6, ease(k)) : zz) - 0.05]} rotation={[0, Math.PI / 2, 0]} castShadow
        material={glossy('#ffc7da', {rough: 0.6, clear: 0.2})}><torusGeometry args={[0.18 + 0.12 * k, 0.07, 10, 24, Math.PI * (0.6 + 1.4 * k)]} /></mesh>; })}
    <group position={[lanes[cur], 2.15 + 1.2 * lift, tz]} rotation={[-0.6, 0, 0]}>
      <mesh position={[0, 0.25, 0]} castShadow><torusGeometry args={[0.28, 0.04, 8, 20, Math.PI]} /><meshPhysicalMaterial color="#dfe6ee" roughness={0.2} metalness={0.3} clearcoat={1} /></mesh>
      <mesh position={[0, 1.6, 0.6]} rotation={[0.45, 0, 0]} castShadow material={glossy('#8fd3ff', {rough: 0.4})}><capsuleGeometry args={[0.2, 1.6, 8, 16]} /></mesh>
    </group>
  </>;
};

// ---------------------------------------------------------------- 6: slime
const SlimeScene = ({s}: {s: number}) => {
  const ps = EV.slime;
  let cur = 0; ps.forEach((t, i) => { if (s >= t - 0.3) cur = i; });
  const t = ps[cur];
  const press = s < t ? ease(prog(s, t - 0.3, t)) * 0.2 : s < t + 0.5 ? 0.2 + 0.8 * ease(prog(s, t, t + 0.5)) : 1 - ease(prog(s, t + 0.55, t + 1.15));
  const lifting = s > t + 0.55 && s < t + 1.2, lk = prog(s, t + 0.55, t + 1.2);
  const spots: V3[] = [[-0.6, 0, 0.2], [0.7, 0, -0.3], [0.1, 0, 0.6], [-0.2, 0, -0.5]];
  const sp = spots[cur];
  const squash = 0.35 * press + jig(s, t + 1.15, 0.08, 6, 3);
  const handY = 1.55 - 0.85 * press + (lifting ? 0.9 * lk : 0);
  return <>
    <Stage top="#d4fff2" bottom="#effff9" />
    <Cam p={lerp3([0, 7.5, 8.2], [0.8, 7, 7.6], ease(prog(s, 30.6, 36.6)))} l={[0, 0.7, 0]} fov={34} />
    <RoundedBox args={[7, 0.3, 6]} radius={0.14} position={[0, 0.15, 0]} receiveShadow material={glossy('#ffffff', {rough: 0.5})} />
    <mesh position={[0, 0.3, 0]} scale={[2.6 * (1 + squash * 0.5), 1.3 * (1 - squash), 2.4 * (1 + squash * 0.5)]} castShadow receiveShadow material={glossy('#4fd1c5', {rough: 0.08, trans: 0.93})}>
      <sphereGeometry args={[1, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} /></mesh>
    {Array.from({length: 9}, (_, i) => <mesh key={i} position={[(random(`bx${i}`) - 0.5) * 3.4, 0.35 + random(`by${i}`) * 0.9 * (1 - squash), (random(`bz${i}`) - 0.5) * 3]}
      scale={0.06 + random(`bs${i}`) * 0.07}><sphereGeometry args={[1, 12, 8]} /><meshPhysicalMaterial color="#ffffff" transparent opacity={0.6} roughness={0} clearcoat={1} /></mesh>)}
    {lifting && [-0.18, 0, 0.2].map((dx, i) => { const len = (handY - 0.2) * (1 - lk * 0.3), r = 0.09 * (1 - lk) + 0.02;
      return <mesh key={i} position={[sp[0] + dx, 1.15 + len / 2 - 0.6, sp[2] + 0.3]} castShadow material={glossy('#4fd1c5', {rough: 0.08, trans: 0.93})}><cylinderGeometry args={[r, r * 1.6, len, 10]} /></mesh>; })}
    <Hand position={[sp[0], handY, sp[2] + 0.3]} press={press} />
  </>;
};

// ---------------------------------------------------------------- 7: honey on pancakes
const HoneyScene = ({s}: {s: number}) => {
  const [a, b] = EV.honey;
  const flow = prog(s, a, a + 0.35) * (1 - prog(s, b - 0.1, b + 0.25));
  const pool = easeOut(prog(s, a + 0.2, b));
  const honey = glossy('#f2a516', {rough: 0.05, trans: 0.88});
  return <>
    <Stage top="#ffe9c7" bottom="#fff7ea" />
    <Cam p={lerp3([0, 6.6, 10], [1.2, 6, 9], ease(prog(s, 36.6, 42.6)))} l={[0, 2, 0]} fov={34} />
    <mesh position={[0, 0.12, 0]} receiveShadow material={glossy('#ffffff', {rough: 0.3})}><cylinderGeometry args={[3.6, 3.3, 0.24, 48]} /></mesh>
    {[0, 1, 2].map((i) => <mesh key={i} position={[0, 0.5 + i * 0.62, 0]} rotation={[0, i, 0]} castShadow receiveShadow material={matte(i % 2 ? '#e8a556' : '#f0b465', 0.75)}>
      <cylinderGeometry args={[2.3 - i * 0.05, 2.35 - i * 0.05, 0.56, 48]} /></mesh>)}
    <RoundedBox args={[0.8, 0.45, 0.8]} radius={0.1} position={[0.2, 2.25 + 0.3 * pool, 0.1]} rotation={[0, 0.5, 0]} castShadow material={glossy('#fff3b0', {rough: 0.4})} />
    {flow > 0.02 && <mesh position={[-0.3 + 0.03 * Math.sin(s * 5), 2.1 + 6, 0]} material={honey}><cylinderGeometry args={[0.035 * flow + 0.01, 0.06 * flow + 0.015, 12, 16]} /></mesh>}
    <mesh position={[0, 2.12, 0]} scale={[0.2 + 2.0 * pool, 1, 0.2 + 2.0 * pool]} material={honey}><cylinderGeometry args={[1, 1, 0.08, 48]} /></mesh>
    {[0.3, 1.5, 2.9, 4.2].map((ang, i) => { const k = prog(s, a + 1.0 + i * 0.6, a + 2.6 + i * 0.6);
      return k > 0 && <mesh key={i} position={[Math.cos(ang) * 2.28, 2.1 - k * 0.8, Math.sin(ang) * 2.28]} castShadow material={honey}><capsuleGeometry args={[0.11, 1.6 * k, 8, 12]} /></mesh>; })}
  </>;
};

// ---------------------------------------------------------------- 8: honeycomb candy
const CandyScene = ({s}: {s: number}) => {
  const ts = EV.candy;
  let cur = 0; ts.forEach((t, i) => { if (s >= t - 0.35) cur = i; });
  const t = ts[cur];
  const press = s < t - 0.35 ? 0 : s < t + 0.32 ? ease(prog(s, t - 0.35, t + 0.32)) : 1 - ease(prog(s, t + 0.4, t + 0.75));
  const xs = [-1.9, -0.65, 0.65, 1.9];
  const mat = memo('combmat', () => new THREE.MeshPhysicalMaterial({color: '#f5b04a', map: combTex(), roughness: 0.35, clearcoat: 0.8, bumpMap: combTex(), bumpScale: 2}));
  return <>
    <Stage top="#ffeccf" bottom="#fff8ee" />
    <Cam p={lerp3([-2.4, 6.6, 8.6], [-1.4, 6, 7.8], ease(prog(s, 42.6, 48.6)))} l={[0, 1.1, 0]} fov={34} />
    <Board w={8} d={5} />
    {xs.map((x, i) => { const br = s > ts[i] + 0.32;
      return br ? [0, 1, 2].map((q) => { const k = easeOut(prog(s, ts[i] + 0.32, ts[i] + 0.7)), ang = q * 2.1 + i;
        return <RoundedBox key={`${i}${q}`} args={[0.6, 0.7, 1.2]} radius={0.12} position={[x + Math.cos(ang) * 0.35 * k, 0.85, (q - 1) * 1.05 + Math.sin(ang) * 0.25 * k]}
          rotation={[0.2 * k * (q - 1), ang * 0.2 * k, 0.15 * k]} castShadow material={mat} />; })
        : <RoundedBox key={i} args={[1.2, 0.8, 3.4]} radius={0.15} position={[x, 0.9, 0]} castShadow receiveShadow material={mat} />; })}
    <group position={[xs[cur], 1.35 + 1.6 * (1 - press) - 0.2 * press, 0]} rotation={[0, 0, 0]}>
      <mesh scale={[0.65, 0.22, 0.9]} castShadow><sphereGeometry args={[1, 24, 16]} /><meshPhysicalMaterial color="#e3e9f0" roughness={0.15} metalness={0.35} clearcoat={1} /></mesh>
      <mesh position={[0, 0.9, 1.9]} rotation={[0.55, 0, 0]} castShadow><boxGeometry args={[0.2, 0.1, 3]} /><meshPhysicalMaterial color="#e3e9f0" roughness={0.15} metalness={0.35} clearcoat={1} /></mesh>
    </group>
  </>;
};

// ---------------------------------------------------------------- 9: water-drop bowls
const NOTES = [0, 2, 4, 7, 9, 12];
const BOWL_COLORS = ['#ff8fab', '#ffb86b', '#ffe27a', '#8be38f', '#6cc9ff', '#b79cff'];
const DropsScene = ({s}: {s: number}) => {
  const ds = EV.drops, notes = TL.dropNotes;
  const bx = (n: number) => ((NOTES.indexOf(n) % 3) - 1) * 1.5;
  const bz = (n: number) => (Math.floor(NOTES.indexOf(n) / 3) - 0.5) * 1.6;
  return <>
    <Stage top="#dff1ff" bottom="#f3faff" />
    <Cam p={lerp3([0, 6.2, 6.6], [0.4, 5.8, 6.1], ease(prog(s, 48.6, 55.4)))} l={[0, 0.9, 0]} fov={36} />
    <RoundedBox args={[5.6, 0.3, 4.4]} radius={0.14} position={[0, 0.15, 0]} receiveShadow material={glossy('#ffffff', {rough: 0.4})} />
    {NOTES.map((n, i) => {
      const hits = ds.map((t, k) => (notes[k] === n ? t + 0.42 : -9)).filter((t) => t <= s);
      const last = hits.length ? hits[hits.length - 1] : -9, w = jig(s, last, 0.05, 8, 4);
      return <group key={i} position={[bx(n), 0.3, bz(n)]}>
        <mesh position={[0, 0.45, 0]} castShadow material={glossy(BOWL_COLORS[i], {rough: 0.2})}><cylinderGeometry args={[0.55, 0.38, 0.9, 32, 1, true]} /></mesh>
        <mesh position={[0, 0.05, 0]} material={glossy(BOWL_COLORS[i], {rough: 0.2})}><cylinderGeometry args={[0.38, 0.38, 0.1, 32]} /></mesh>
        <mesh position={[0, 0.72 + w, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.5, 32]} /><meshPhysicalMaterial color="#9fdcff" roughness={0} clearcoat={1} transparent opacity={0.85} /></mesh>
        {hits.slice(-2).map((h, q) => { const k = prog(s, h, h + 0.7); return k < 1 && <mesh key={q} position={[0, 0.74, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={0.1 + 0.4 * k}>
          <ringGeometry args={[0.9, 1, 32]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.8 * (1 - k)} /></mesh>; })}
      </group>;
    })}
    {ds.map((t, k) => { const f = prog(s, t, t + 0.42); if (s < t - 0.05 || f >= 1) return null;
      return <mesh key={k} position={[bx(notes[k]), lerp(6.5, 1.05, f * f), bz(notes[k])]} scale={[0.16, 0.16 * (1 + f * 0.8), 0.16]}><sphereGeometry args={[1, 16, 12]} />
        <meshPhysicalMaterial color="#bfe9ff" roughness={0} clearcoat={1} transparent opacity={0.9} /></mesh>; })}
  </>;
};

// ---------------------------------------------------------------- composition
const Headphones = () => <svg width="70" height="70" viewBox="0 0 64 64"><path d="M10 38v-6a22 22 0 0 1 44 0v6" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
  <rect x="6" y="36" width="12" height="20" rx="5" fill="#fff" /><rect x="46" y="36" width="12" height="20" rx="5" fill="#fff" /></svg>;
export const AsmrShort = () => {
  const f = useCurrentFrame(), s = f / 30;
  const seg = TL.seg.find((x) => s >= x.a && s < x.b) ?? TL.seg[TL.seg.length - 1];
  const fade = Math.max(clamp01(1 - (s - seg.a) / 0.18), clamp01(1 - (seg.b - s) / 0.12)) * (seg.a > 0 && seg.b < TL.dur ? 1 : seg.a > 0 ? clamp01(1 - (s - seg.a) / 0.18) : clamp01(1 - (seg.b - s) / 0.12));
  const hook = clamp01(Math.min((s - 0.1) / 0.25, (3.0 - s) / 0.3)), end = clamp01((s - 57.9) / 0.4);
  return <AbsoluteFill style={{background: '#fff'}}>
    <ThreeCanvas width={1080} height={1920} shadows gl={{antialias: true}}>
      {seg.id === 'jelly' && <JellyScene s={s} />}
      {seg.id === 'sand' && <SandScene s={s} />}
      {seg.id === 'keys' && <KeysScene s={s} />}
      {seg.id === 'popit' && <PopScene s={s} />}
      {seg.id === 'soap' && <SoapScene s={s} />}
      {seg.id === 'slime' && <SlimeScene s={s} />}
      {seg.id === 'honey' && <HoneyScene s={s} />}
      {seg.id === 'candy' && <CandyScene s={s} />}
      {seg.id === 'drops' && <DropsScene s={s} />}
      {seg.id === 'finale' && <FinaleScene s={s} />}
    </ThreeCanvas>
    <AbsoluteFill style={{background: '#fff', opacity: fade * 0.85}} />
    {hook > 0 && <div style={{position: 'absolute', top: 250, width: 1080, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, opacity: hook, transform: `translateY(${(1 - hook) * -20}px)`}}>
      <div style={{background: 'rgba(60,40,80,.55)', borderRadius: 60, padding: '18px 40px', display: 'flex', alignItems: 'center', gap: 22}}>
        <Headphones /><span style={{fontFamily: 'Montserrat', fontWeight: 800, fontSize: 58, color: '#fff', letterSpacing: 1}}>headphones on</span></div>
    </div>}
    {end > 0 && <div style={{position: 'absolute', top: 260, width: 1080, textAlign: 'center', opacity: end, fontFamily: 'Montserrat', fontWeight: 800, fontSize: 70, color: '#fff',
      WebkitTextStroke: '12px rgba(90,50,110,.9)', paintOrder: 'stroke fill', lineHeight: 1.15, transform: `scale(${0.9 + 0.1 * easeOut(end)})`}}>which one gave<br />you tingles?</div>}
    <Audio src={staticFile('asmr/asmr1.wav')} />
  </AbsoluteFill>;
};
