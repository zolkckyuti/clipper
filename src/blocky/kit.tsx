// Blocky-avatar story kit ("In this town…" / "What if…" Shorts). Everything is procedural and our own: block-built
// avatars with canvas faces, a studded baseplate town, props. No game logos, names or third-party assets.
// Units: an avatar is ~5.2 tall (legs 2, torso 2, head 1.2), standing on y = 0, facing +z.
import {RoundedBox} from '@react-three/drei';
import {useThree} from '@react-three/fiber';
import React, {useMemo} from 'react';
import {Audio, Sequence, random, staticFile} from 'remotion';
import * as THREE from 'three';

export type V3 = [number, number, number];
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const ease = (t: number) => { const x = clamp01(t); return x * x * (3 - 2 * x); };
export const easeOut = (t: number) => 1 - (1 - clamp01(t)) ** 3;
export const prog = (o: number, a: number, b: number) => clamp01((o - a) / (b - a));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
/** springy pop: 0 → overshoot → 1 */
export const pop = (t: number) => { const x = clamp01(t); return x >= 1 ? 1 : 1 - Math.cos(x * Math.PI * 2.5) * Math.exp(-x * 5); };

// ---------------------------------------------------------------- textures (canvas, cached)
const cache = new Map<string, THREE.Texture>();
const canvasTex = (key: string, w: number, h: number, draw: (x: CanvasRenderingContext2D) => void, repeat?: [number, number]) => {
  if (cache.has(key)) return cache.get(key)!;
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); }
  cache.set(key, t); return t;
};
export const studTex = (color: string, repeat: number) => canvasTex(`stud:${color}:${repeat}`, 128, 128, (x) => {
  x.fillStyle = color; x.fillRect(0, 0, 128, 128);
  const g = x.createRadialGradient(56, 56, 4, 64, 64, 34); g.addColorStop(0, 'rgba(255,255,255,0.22)'); g.addColorStop(0.7, 'rgba(255,255,255,0.05)'); g.addColorStop(1, 'rgba(0,0,0,0.18)');
  x.fillStyle = g; x.beginPath(); x.arc(64, 64, 30, 0, Math.PI * 2); x.fill();
  x.strokeStyle = 'rgba(0,0,0,0.10)'; x.lineWidth = 2; x.strokeRect(1, 1, 126, 126);
}, [repeat, repeat]);
export const gradTex = (top: string, bottom: string) => canvasTex(`grad:${top}:${bottom}`, 8, 512, (x) => {
  const g = x.createLinearGradient(0, 0, 0, 512); g.addColorStop(0, top); g.addColorStop(1, bottom); x.fillStyle = g; x.fillRect(0, 0, 8, 512);
});
export const signTex = (text: string, bg: string, fg = '#fff') => canvasTex(`sign:${text}:${bg}:${fg}`, 512, 128, (x) => {
  x.fillStyle = bg; x.fillRect(0, 0, 512, 128); x.strokeStyle = 'rgba(0,0,0,.35)'; x.lineWidth = 10; x.strokeRect(5, 5, 502, 118);
  x.fillStyle = fg; x.font = '900 78px Inter, Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 256, 68);
});
const tagTex = (text: string) => canvasTex(`tag:${text}`, 512, 128, (x) => {
  x.font = '800 64px Inter, Arial'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.lineWidth = 12; x.strokeStyle = 'rgba(0,0,0,.75)'; x.strokeText(text, 256, 64); x.fillStyle = '#fff'; x.fillText(text, 256, 64);
});
export type Expr = 'smile' | 'grin' | 'sad' | 'shock' | 'smug' | 'worried' | 'cry' | 'happy' | 'angry';
const faceTex = (e: Expr, blink: boolean) => canvasTex(`face:${e}:${blink}`, 256, 256, (x) => {
  x.clearRect(0, 0, 256, 256); x.fillStyle = '#111'; x.strokeStyle = '#111'; x.lineCap = 'round';
  const eye = (cx: number, big = 1) => {
    if (blink) { x.lineWidth = 9; x.beginPath(); x.moveTo(cx - 16, 108); x.lineTo(cx + 16, 108); x.stroke(); return; }
    x.beginPath(); x.ellipse(cx, 104, 13 * big, 22 * big, 0, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#fff'; x.beginPath(); x.arc(cx + 4, 95, 5 * big, 0, Math.PI * 2); x.fill(); x.fillStyle = '#111';
  };
  const brow = (cx: number, tilt: number, y = 66) => { x.lineWidth = 9; x.beginPath(); x.moveTo(cx - 20, y + tilt); x.lineTo(cx + 20, y - tilt); x.stroke(); };
  const big = e === 'shock' ? 1.35 : 1;
  eye(88, big); eye(168, big);
  x.lineWidth = 10;
  if (e === 'smile' || e === 'happy') { x.beginPath(); x.arc(128, 150, 44, 0.15 * Math.PI, 0.85 * Math.PI); x.stroke(); }
  if (e === 'happy') { brow(88, -4); brow(168, 4); }
  if (e === 'grin') { x.beginPath(); x.moveTo(78, 152); x.quadraticCurveTo(128, 222, 178, 152); x.closePath(); x.fill(); x.fillStyle = '#fff'; x.fillRect(92, 154, 72, 14); }
  if (e === 'sad' || e === 'cry') { x.beginPath(); x.arc(128, 206, 40, 1.2 * Math.PI, 1.8 * Math.PI); x.stroke(); brow(88, -9, 70); brow(168, 9, 70); }
  if (e === 'cry') { x.fillStyle = 'rgba(70,160,255,.9)'; x.fillRect(76, 128, 12, 60); x.fillRect(168, 128, 12, 60); }
  if (e === 'shock') { x.beginPath(); x.ellipse(128, 182, 22, 30, 0, 0, Math.PI * 2); x.fill(); brow(88, 0, 52); brow(168, 0, 52); }
  if (e === 'smug') { x.beginPath(); x.moveTo(92, 170); x.quadraticCurveTo(140, 186, 172, 152); x.stroke(); brow(88, 0, 70); brow(168, -8, 58); }
  if (e === 'worried') { x.beginPath(); x.moveTo(90, 178); x.bezierCurveTo(108, 162, 120, 192, 138, 176); x.bezierCurveTo(152, 164, 160, 186, 170, 176); x.stroke(); brow(88, -8, 66); brow(168, 8, 66); }
  if (e === 'angry') { x.beginPath(); x.arc(128, 196, 34, 1.2 * Math.PI, 1.8 * Math.PI); x.stroke(); brow(88, 10, 70); brow(168, -10, 70); }
});

// ---------------------------------------------------------------- materials
const matCache = new Map<string, THREE.Material>();
export const plastic = (color: string, rough = 0.55) => {
  const k = `p:${color}:${rough}`;
  if (!matCache.has(k)) matCache.set(k, new THREE.MeshStandardMaterial({color, roughness: rough, metalness: 0}));
  return matCache.get(k)!;
};

// ---------------------------------------------------------------- avatar
export type Hair = 'short' | 'cap' | 'long' | 'bun' | 'none' | 'spiky';
export type Look = {skin?: string; shirt: string; pants: string; hair?: Hair; hairColor?: string; shoes?: string; capColor?: string; glasses?: boolean; tie?: string};
export type Pose = {
  walk?: number;        // walk phase (radians); amplitude via swing
  swing?: number;       // 0..1 limb swing amplitude
  armL?: number; armR?: number;   // extra arm raise (radians, forward/up)
  armLOut?: number; armROut?: number; // arm spread sideways (radians)
  legSpread?: number;   // legs out sideways (float pose)
  lean?: number;        // body pitch forward
  headTilt?: number; headTurn?: number;
  headScale?: number;   // the "lie" head
  sit?: number;         // 0..1 seated (legs forward)
  bob?: number;         // vertical bob
};
export const Avatar = ({look, pose = {}, expr = 'smile', blink = false, name, position = [0, 0, 0], rotY = 0, scale = 1, children, headProp}: {
  look: Look; pose?: Pose; expr?: Expr; blink?: boolean; name?: string; position?: V3; rotY?: number; scale?: number; children?: React.ReactNode; headProp?: React.ReactNode}) => {
  const sw = (pose.swing ?? 0) * Math.sin(pose.walk ?? 0);
  const skin = plastic(look.skin ?? '#f5cd8a'), shirt = plastic(look.shirt), pants = plastic(look.pants), shoes = plastic(look.shoes ?? '#2b2b2b');
  const hs = pose.headScale ?? 1, sit = pose.sit ?? 0;
  const hairM = plastic(look.hairColor ?? '#5b3a1e', 0.7);
  const legRot = -sit * Math.PI / 2;
  return <group position={[position[0], position[1] + (pose.bob ?? 0), position[2]]} rotation={[0, rotY, 0]} scale={scale}>
    <group position={[0, 2 - sit * 0.95, 0]} rotation={[pose.lean ?? 0, 0, 0]}>
      {/* legs (pivot at hip) */}
      {[-0.5, 0.5].map((x, i) => <group key={i} position={[x, 0, 0]} rotation={[legRot + (i ? -sw : sw) * 0.7 * (1 - sit), 0, (i ? -1 : 1) * -(pose.legSpread ?? 0)]}>
        <mesh position={[0, -0.85, 0]} material={pants} castShadow><boxGeometry args={[0.98, 1.7, 0.98]} /></mesh>
        <mesh position={[0, -1.85, 0.06]} material={shoes} castShadow><boxGeometry args={[1, 0.3, 1.1]} /></mesh>
      </group>)}
      {/* torso */}
      <mesh position={[0, 1, 0]} material={shirt} castShadow><boxGeometry args={[2, 2, 1]} /></mesh>
      <mesh position={[0, 0.1, 0]} material={pants}><boxGeometry args={[2.02, 0.22, 1.02]} /></mesh>
      {look.tie && <mesh position={[0, 1.15, 0.52]} material={plastic(look.tie)}><boxGeometry args={[0.26, 1.3, 0.04]} /></mesh>}
      {/* arms (pivot at shoulder) */}
      {[-1.5, 1.5].map((x, i) => <group key={i} position={[x, 1.85, 0]}
        rotation={[-(i ? pose.armR ?? 0 : pose.armL ?? 0) + (i ? sw : -sw) * 0.8, 0, (i ? -1 : 1) * -(i ? pose.armROut ?? 0 : pose.armLOut ?? 0)]}>
        <mesh position={[0, -0.85, 0]} material={shirt} castShadow><boxGeometry args={[0.96, 1.2, 0.96]} /></mesh>
        <mesh position={[0, -1.6, 0]} material={skin} castShadow><boxGeometry args={[0.94, 0.5, 0.94]} /></mesh>
        {i === 1 && children}
      </group>)}
      {/* head (pivot at neck) */}
      <group position={[0, 2, 0]} rotation={[pose.headTilt ?? 0, pose.headTurn ?? 0, 0]} scale={hs}>
        <mesh position={[0, 0.12, 0]} material={skin}><cylinderGeometry args={[0.36, 0.36, 0.25, 16]} /></mesh>
        <RoundedBox args={[1.25, 1.2, 1.2]} radius={0.22} smoothness={4} position={[0, 0.85, 0]} material={skin} castShadow />
        <mesh position={[0, 0.82, 0.605]}><planeGeometry args={[1.1, 1.1]} /><meshBasicMaterial map={faceTex(expr, blink)} transparent toneMapped={false} /></mesh>
        {look.glasses && <group position={[0, 1.0, 0.63]}>
          {[-0.27, 0.27].map((x, i) => <mesh key={i} position={[x, 0, 0]}><torusGeometry args={[0.17, 0.035, 8, 24]} /><meshStandardMaterial color="#222" /></mesh>)}
          <mesh><boxGeometry args={[0.2, 0.04, 0.04]} /><meshStandardMaterial color="#222" /></mesh>
        </group>}
        <HairMesh hair={look.hair ?? 'short'} m={hairM} cap={plastic(look.capColor ?? '#d22')} />
        {headProp}
      </group>
    </group>
    {name && <sprite position={[0, 5.9 * Math.max(1, hs * 0.6) + (hs - 1) * 1.3, 0]} scale={[2.6, 0.65, 1]}><spriteMaterial map={tagTex(name)} depthTest={false} transparent /></sprite>}
  </group>;
};
const HairMesh = ({hair, m, cap}: {hair: Hair; m: THREE.Material; cap: THREE.Material}) => {
  if (hair === 'none') return null;
  if (hair === 'cap') return <group position={[0, 1.42, 0]}>
    <RoundedBox args={[1.32, 0.42, 1.3]} radius={0.15} material={cap} />
    <mesh position={[0, -0.12, 0.82]} material={cap}><boxGeometry args={[1.2, 0.08, 0.6]} /></mesh>
  </group>;
  if (hair === 'spiky') return <group position={[0, 1.42, -0.05]}>
    <RoundedBox args={[1.32, 0.35, 1.3]} radius={0.12} material={m} />
    {[-0.4, 0, 0.4].map((x, i) => <mesh key={i} position={[x, 0.3, 0]} rotation={[0, 0, (i - 1) * 0.3]} material={m}><coneGeometry args={[0.28, 0.6, 4]} /></mesh>)}
  </group>;
  return <group>
    <RoundedBox args={[1.34, 0.38, 1.32]} radius={0.14} position={[0, 1.4, -0.02]} material={m} />
    <mesh position={[0, 1.0, -0.6]} material={m}><boxGeometry args={[1.32, hair === 'long' ? 1.7 : 0.9, 0.2]} /></mesh>
    {hair === 'long' && [-0.66, 0.66].map((x, i) => <mesh key={i} position={[x, 0.75, -0.1]} material={m}><boxGeometry args={[0.14, 1.5, 1.1]} /></mesh>)}
    {hair === 'bun' && <mesh position={[0, 1.75, -0.35]} material={m}><sphereGeometry args={[0.32, 16, 12]} /></mesh>}
    {hair === 'short' && <mesh position={[0, 1.25, 0.6]} material={m}><boxGeometry args={[1.3, 0.22, 0.12]} /></mesh>}
  </group>;
};
export const walkPose = (o: number, speed = 1, extra: Pose = {}): Pose => ({walk: (o / 1000) * Math.PI * 2 * 1.6 * speed, swing: 0.6, bob: Math.abs(Math.sin((o / 1000) * Math.PI * 2 * 1.6 * speed)) * 0.12, ...extra});
export const idlePose = (o: number, extra: Pose = {}): Pose => ({armL: 0.05 + 0.03 * Math.sin(o / 700), armR: 0.05 + 0.03 * Math.sin(o / 700 + 1), headTilt: 0.03 * Math.sin(o / 900), bob: 0.03 * Math.sin(o / 500), ...extra});
export const blinkAt = (o: number, seed = 0) => ((o + seed * 977) % 3100) < 120;

// ---------------------------------------------------------------- world
export const Sky = ({top = '#4fa8ff', bottom = '#cfeaff', fog, sun = 1, warm = false}: {top?: string; bottom?: string; fog?: [string, number, number] | null; sun?: number; warm?: boolean}) => {
  const {scene} = useThree();
  scene.background = gradTex(top, bottom);
  if (fog) { if (scene.fog instanceof THREE.Fog) { scene.fog.color.set(fog[0]); scene.fog.near = fog[1]; scene.fog.far = fog[2]; } else scene.fog = new THREE.Fog(...fog); } else scene.fog = null;
  return <>
    <hemisphereLight args={[warm ? '#ffe2c0' : '#ffffff', '#6f9a5a', 1.1 * sun]} />
    <directionalLight position={[30, 50, 25]} intensity={2.4 * sun} color={warm ? '#ffc58a' : '#fff6e6'} castShadow
      shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-60} shadow-camera-right={60} shadow-camera-top={60} shadow-camera-bottom={-60} shadow-bias={-0.0004} />
    <ambientLight intensity={0.25 * sun} />
  </>;
};
export const Cam = ({p, l, fov = 40, roll = 0}: {p: V3; l: V3; fov?: number; roll?: number}) => {
  const {camera} = useThree(); const c = camera as THREE.PerspectiveCamera;
  c.position.set(...p); c.fov = fov; c.near = 0.1; c.far = 900; c.up.set(Math.sin(roll), Math.cos(roll), 0); c.lookAt(...l); c.updateProjectionMatrix();
  return null;
};
export const Baseplate = ({size = 400, color = '#4caf3c'}: {size?: number; color?: string}) =>
  <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[size, size]} /><meshStandardMaterial map={studTex(color, size / 2)} roughness={0.8} /></mesh>;
export const Road = ({z = 0, len = 400, w = 10, rotY = 0}: {z?: number; len?: number; w?: number; rotY?: number}) => <group position={[0, 0.02, z]} rotation={[0, rotY, 0]}>
  <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[len, w]} /><meshStandardMaterial color="#4a4d52" roughness={0.9} /></mesh>
  {Array.from({length: Math.floor(len / 8)}, (_, i) => <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-len / 2 + i * 8 + 2, 0.01, 0]}><planeGeometry args={[4, 0.4]} /><meshBasicMaterial color="#f4d03f" /></mesh>)}
  {[-1, 1].map((s) => <mesh key={s} position={[0, 0.25, s * (w / 2 + 1.5)]} receiveShadow castShadow><boxGeometry args={[len, 0.5, 3]} /><meshStandardMaterial color="#b9b9b9" /></mesh>)}
</group>;
const windowTex = (lit: boolean) => canvasTex(`win:${lit}`, 64, 64, (x) => {
  x.fillStyle = '#eee'; x.fillRect(0, 0, 64, 64); x.fillStyle = lit ? '#ffe9a6' : '#8cc6ef'; x.fillRect(5, 5, 54, 54);
  x.fillStyle = 'rgba(255,255,255,.45)'; x.fillRect(10, 10, 14, 30); x.fillStyle = '#eee'; x.fillRect(30, 5, 4, 54); x.fillRect(5, 30, 54, 4);
});
export const Window = ({position, w = 2, h = 2, broken = false, lit = false}: {position: V3; w?: number; h?: number; broken?: boolean; lit?: boolean}) => <group position={position}>
  <mesh><planeGeometry args={[w, h]} /><meshStandardMaterial map={windowTex(lit)} /></mesh>
  {broken && <>
    <mesh position={[0.1, -0.05, 0.01]}><circleGeometry args={[0.45 * w / 2, 7]} /><meshBasicMaterial color="#1b1b1b" /></mesh>
    {Array.from({length: 7}, (_, i) => { const a = (i / 7) * Math.PI * 2 + 0.3; const r = 0.5 * w / 2 + random(`crk${i}`) * 0.25 * w;
      return <mesh key={i} position={[Math.cos(a) * r / 2 + 0.1, Math.sin(a) * r / 2 - 0.05, 0.012]} rotation={[0, 0, a]}><planeGeometry args={[r, 0.05]} /><meshBasicMaterial color="#222" /></mesh>; })}
  </>}
</group>;
export const House = ({position, rotY = 0, w = 12, d = 10, h = 8, wall = '#f2e3c6', roof = '#c0392b', door = '#7a4a24', sign, signColor = '#e67e22', brokenWindow = false, doorOpen = 0}: {
  position: V3; rotY?: number; w?: number; d?: number; h?: number; wall?: string; roof?: string; door?: string; sign?: string; signColor?: string; brokenWindow?: boolean; doorOpen?: number}) =>
  <group position={position} rotation={[0, rotY, 0]}>
    <mesh position={[0, h / 2, 0]} castShadow receiveShadow material={plastic(wall, 0.8)}><boxGeometry args={[w, h, d]} /></mesh>
    <mesh position={[0, h + 1.6, 0]} rotation={[0, Math.PI / 4, 0]} castShadow material={plastic(roof, 0.7)}><coneGeometry args={[Math.max(w, d) * 0.78, 3.2, 4]} /></mesh>
    <mesh position={[0, 3, d / 2 + 0.01]} material={plastic(door)}><planeGeometry args={[2.6, 6]} /></mesh>
    {doorOpen > 0 && <mesh position={[0, 3, d / 2 + 0.02]}><planeGeometry args={[2.6 * doorOpen, 6]} /><meshBasicMaterial color="#2a1c10" /></mesh>}
    <Window position={[-w / 2 + 2.4, h * 0.62, d / 2 + 0.02]} broken={brokenWindow} />
    <Window position={[w / 2 - 2.4, h * 0.62, d / 2 + 0.02]} />
    {sign && <mesh position={[0, h - 0.9, d / 2 + 0.06]}><planeGeometry args={[w * 0.6, w * 0.15]} /><meshStandardMaterial map={signTex(sign, signColor)} /></mesh>}
  </group>;
export const School = ({position, rotY = 0, doorW = 3.2, doorH = 6.2}: {position: V3; rotY?: number; doorW?: number; doorH?: number}) => <group position={position} rotation={[0, rotY, 0]}>
  {/* wall with a door hole (four blocks around it) */}
  <mesh position={[-(doorW / 2 + 9), 7, 0]} castShadow receiveShadow material={plastic('#d9774b', 0.85)}><boxGeometry args={[18, 14, 12]} /></mesh>
  <mesh position={[doorW / 2 + 9, 7, 0]} castShadow receiveShadow material={plastic('#d9774b', 0.85)}><boxGeometry args={[18, 14, 12]} /></mesh>
  <mesh position={[0, doorH + (14 - doorH) / 2, 0]} castShadow material={plastic('#d9774b', 0.85)}><boxGeometry args={[doorW, 14 - doorH, 12]} /></mesh>
  <mesh position={[0, doorH / 2, -2]} material={plastic('#3b2a1c')}><boxGeometry args={[doorW, doorH, 0.3]} /></mesh>
  <mesh position={[0, 14.4, 0]} castShadow material={plastic('#7f8c8d')}><boxGeometry args={[doorW + 37, 0.8, 13]} /></mesh>
  <mesh position={[0, 11.5, 6.05]}><planeGeometry args={[12, 2.6]} /><meshStandardMaterial map={signTex('SCHOOL', '#2c3e50')} /></mesh>
  {[-14, -8, 8, 14].map((x) => <React.Fragment key={x}><Window position={[x, 9, 6.02]} w={3} h={3} /><Window position={[x, 3.6, 6.02]} w={3} h={3} /></React.Fragment>)}
</group>;
export const Tree = ({position, s = 1}: {position: V3; s?: number}) => <group position={position} scale={s}>
  <mesh position={[0, 2.5, 0]} castShadow material={plastic('#8b5a2b', 0.9)}><boxGeometry args={[1.2, 5, 1.2]} /></mesh>
  <mesh position={[0, 6.6, 0]} castShadow material={plastic('#2e8b3a', 0.8)}><boxGeometry args={[5, 4, 5]} /></mesh>
  <mesh position={[0, 9, 0]} castShadow material={plastic('#36a046', 0.8)}><boxGeometry args={[3.4, 2, 3.4]} /></mesh>
</group>;
export const Cloud = ({position, s = 1, color = '#ffffff', opacity = 1}: {position: V3; s?: number; color?: string; opacity?: number}) => {
  const m = useMemo(() => new THREE.MeshStandardMaterial({color, roughness: 1, transparent: opacity < 1, opacity}), [color, opacity]);
  return <group position={position} scale={s}>
    {[[0, 0, 0, 4, 2, 3], [-2.4, -0.3, 0.2, 3, 1.6, 2.6], [2.3, -0.2, -0.1, 3.2, 1.8, 2.8], [0.6, 1.1, 0, 2.6, 1.4, 2.2]].map(([x, y, z, a, b, c], i) =>
      <mesh key={i} position={[x, y, z]} material={m}><boxGeometry args={[a, b, c]} /></mesh>)}
  </group>;
};
/** rain streaks under a cloud: n drops falling from y0 to y1 inside a box w x d, local to `position` */
export const Rain = ({o, position, w = 4, d = 3, y0 = 0, y1 = -7, n = 60, amount = 1}: {o: number; position: V3; w?: number; d?: number; y0?: number; y1?: number; n?: number; amount?: number}) => {
  const m = useMemo(() => new THREE.MeshBasicMaterial({color: '#7fc4ff', transparent: true, opacity: 0.8}), []);
  return <group position={position}>
    {Array.from({length: Math.round(n * clamp01(amount))}, (_, i) => {
      const ph = ((o / 600 + random(`rd${i}`)) % 1);
      return <mesh key={i} position={[(random(`rx${i}`) - 0.5) * w, lerp(y0, y1, ph), (random(`rz${i}`) - 0.5) * d]} material={m}><boxGeometry args={[0.06, 0.5, 0.06]} /></mesh>;
    })}
  </group>;
};
export const Bench = ({position, rotY = 0, belt = false}: {position: V3; rotY?: number; belt?: boolean}) => <group position={position} rotation={[0, rotY, 0]}>
  <mesh position={[0, 1.05, 0]} castShadow material={plastic('#a0522d', 0.85)}><boxGeometry args={[7, 0.35, 2]} /></mesh>
  <mesh position={[0, 2.3, -0.9]} castShadow material={plastic('#a0522d', 0.85)}><boxGeometry args={[7, 2, 0.3]} /></mesh>
  {[-3, 3].map((x) => <mesh key={x} position={[x, 0.5, 0]} material={plastic('#333')}><boxGeometry args={[0.3, 1, 1.8]} /></mesh>)}
  {belt && <mesh position={[0, 1.95, 0.95]} material={plastic('#e74c3c')}><boxGeometry args={[7.1, 0.3, 0.12]} /></mesh>}
</group>;
export const Car = ({position, rotY = 0, color = '#2980b9', chained = false}: {position: V3; rotY?: number; color?: string; chained?: boolean}) => <group position={position} rotation={[0, rotY, 0]}>
  <mesh position={[0, 1.4, 0]} castShadow material={plastic(color, 0.35)}><boxGeometry args={[8, 1.8, 3.8]} /></mesh>
  <mesh position={[-0.4, 2.9, 0]} castShadow material={plastic(color, 0.35)}><boxGeometry args={[4.4, 1.3, 3.5]} /></mesh>
  <mesh position={[-0.4, 2.9, 0]}><boxGeometry args={[4.5, 1.0, 3.55]} /><meshStandardMaterial color="#9fd3f0" roughness={0.1} /></mesh>
  {[[-2.7, 1.9], [2.7, 1.9], [-2.7, -1.9], [2.7, -1.9]].map(([x, z], i) => <mesh key={i} position={[x, 0.75, z]} rotation={[Math.PI / 2, 0, 0]} material={plastic('#1d1d1d', 0.9)}><cylinderGeometry args={[0.75, 0.75, 0.5, 16]} /></mesh>)}
  {chained && [-2.7, 2.7].map((x) => <Chain key={x} a={[x, 1.2, 2.0]} b={[x + 0.4, 0.05, 3.6]} />)}
</group>;
export const Chain = ({a, b, links = 9}: {a: V3; b: V3; links?: number}) => {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), dir = B.clone().sub(A), len = dir.length();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  return <group position={a} quaternion={q}>
    {Array.from({length: links}, (_, i) => <mesh key={i} position={[0, (i + 0.5) * (len / links), 0]} rotation={[0, i % 2 ? Math.PI / 2 : 0, 0]} material={plastic('#9aa0a6', 0.3)}>
      <torusGeometry args={[len / links * 0.55, 0.06, 6, 12]} /></mesh>)}
    <mesh position={[0, len, 0]} material={plastic('#555')}><boxGeometry args={[0.6, 0.2, 0.6]} /></mesh>
  </group>;
};
export const Clock = ({position, h = 11, m = 59, s = 1, rotY = 0}: {position: V3; h?: number; m?: number; s?: number; rotY?: number}) => <group position={position} scale={s} rotation={[0, rotY, 0]}>
  <mesh position={[0, 9, 0]} castShadow material={plastic('#d5c4a1', 0.8)}><boxGeometry args={[4, 18, 4]} /></mesh>
  <mesh position={[0, 19.5, 0]} castShadow material={plastic('#7b4b2a')}><coneGeometry args={[3.4, 3, 4]} /></mesh>
  <mesh position={[0, 15, 2.02]}><circleGeometry args={[1.6, 32]} /><meshStandardMaterial color="#fffdf5" /></mesh>
  <mesh position={[0, 15, 2.04]} rotation={[0, 0, -((h % 12) + m / 60) / 12 * Math.PI * 2]}><group><mesh position={[0, 0.45, 0]}><boxGeometry args={[0.16, 0.9, 0.02]} /><meshBasicMaterial color="#111" /></mesh></group></mesh>
  <mesh position={[0, 15, 2.05]} rotation={[0, 0, -(m / 60) * Math.PI * 2]}><group><mesh position={[0, 0.65, 0]}><boxGeometry args={[0.1, 1.3, 0.02]} /><meshBasicMaterial color="#c0392b" /></mesh></group></mesh>
</group>;
export const Umbrella = ({open = 1, color = '#f1c40f'}: {open?: number; color?: string}) => <group>
  <mesh position={[0, 1.2, 0]} material={plastic('#333')}><cylinderGeometry args={[0.06, 0.06, 3.2, 8]} /></mesh>
  <mesh position={[0, 2.9, 0]} scale={[0.15 + 0.85 * open, 0.4 + 0.6 * open, 0.15 + 0.85 * open]} castShadow material={plastic(color, 0.4)}><coneGeometry args={[2.6, 1.1, 8, 1, true]} /></mesh>
</group>;
export const Dog = ({position, rotY = 0, o = 0, sad = 0}: {position: V3; rotY?: number; o?: number; sad?: number}) => {
  const m = plastic('#c98b4b'), d = plastic('#6b4423');
  const wag = Math.sin(o / 90) * 0.6 * (1 - sad);
  return <group position={position} rotation={[0, rotY, 0]}>
    <mesh position={[0, 1.3, 0]} castShadow material={m}><boxGeometry args={[1.3, 1.1, 2.6]} /></mesh>
    <group position={[0, 2.0 - sad * 0.4, 1.4]}>
      <mesh castShadow material={m}><boxGeometry args={[1.1, 1, 1]} /></mesh>
      <mesh position={[0, -0.2, 0.62]} material={d}><boxGeometry args={[0.5, 0.4, 0.3]} /></mesh>
      {[-0.35, 0.35].map((x) => <mesh key={x} position={[x, 0.12, 0.51]}><boxGeometry args={[0.14, 0.18, 0.02]} /><meshBasicMaterial color="#111" /></mesh>)}
      {[-0.55, 0.55].map((x) => <mesh key={x} position={[x, 0.15 - sad * 0.2, 0]} rotation={[0, 0, x > 0 ? -0.3 - sad : 0.3 + sad]} material={d}><boxGeometry args={[0.2, 0.7, 0.5]} /></mesh>)}
    </group>
    {[[-0.45, 0.9], [0.45, 0.9], [-0.45, -0.9], [0.45, -0.9]].map(([x, z], i) => <mesh key={i} position={[x, 0.4, z]} material={m}><boxGeometry args={[0.35, 0.8, 0.35]} /></mesh>)}
    <mesh position={[0, 1.7, -1.4]} rotation={[0.8, wag, 0]} material={m}><boxGeometry args={[0.22, 0.22, 0.9]} /></mesh>
  </group>;
};
export const Bowl = ({position}: {position: V3}) => <mesh position={position} material={plastic('#e74c3c')}><cylinderGeometry args={[0.7, 0.5, 0.4, 16]} /></mesh>;
export const Bread = ({position, rot = 0}: {position: V3; rot?: number}) => <group position={position} rotation={[0, rot, 0.2]}>
  <RoundedBox args={[1.4, 0.6, 0.7]} radius={0.25} material={plastic('#d4943a', 0.7)} castShadow />
</group>;
export const Basket = ({children}: {children?: React.ReactNode}) => <group>
  <mesh position={[0, 0, 0]} material={plastic('#a0702a', 0.9)}><boxGeometry args={[1.6, 0.8, 1.1]} /></mesh>
  <mesh position={[0, 0.9, 0]} rotation={[0, 0, 0]} material={plastic('#a0702a', 0.9)}><torusGeometry args={[0.7, 0.07, 6, 16, Math.PI]} /></mesh>
  {children}
</group>;
export const Sun = ({position, s = 1, o = 0}: {position: V3; s?: number; o?: number}) => <group position={position} scale={s} rotation={[0, 0, o / 1200]}>
  <mesh><boxGeometry args={[1.4, 1.4, 1.4]} /><meshBasicMaterial color="#ffd23f" toneMapped={false} /></mesh>
  {Array.from({length: 8}, (_, i) => <mesh key={i} rotation={[0, 0, (i / 8) * Math.PI * 2]}><group><mesh position={[0, 1.3, 0]}><boxGeometry args={[0.25, 0.6, 0.25]} /><meshBasicMaterial color="#ffb703" toneMapped={false} /></mesh></group></mesh>)}
  <pointLight intensity={3} distance={10} color="#ffcf66" />
</group>;
export const Box = ({position, s = [2, 2, 2], color = '#c49a6c', rot = 0}: {position: V3; s?: V3; color?: string; rot?: number}) =>
  <mesh position={position} rotation={[0, rot, 0]} castShadow material={plastic(color, 0.9)}><boxGeometry args={s} /></mesh>;

// ---------------------------------------------------------------- 2D overlay: captions + sound
export type Word = {t: string; at: number; end: number};
export const loadWords = (raw: {text: string; startMs: number; endMs: number}[], off: number): Word[] => raw.map((w) => ({t: w.text, at: w.startMs + off, end: w.endMs + off}));
export const wordAt = (W: Word[], word: string, nth = 0) => {
  const q = word.replace(/[.,!?]/g, '').toLowerCase();
  const hits = W.filter((w) => w.t.replace(/[.,!?]/g, '').toLowerCase() === q);
  if (!hits[nth]) throw new Error(`word "${word}" #${nth} not in narration`);
  return hits[nth].at;
};
/** 1–3 word chunks, broken at punctuation; each chunk stays until the next one starts (captions always on) */
export const chunks = (W: Word[]) => {
  const out: {a: number; w: Word[]}[] = []; let cur: Word[] = [];
  W.forEach((w, i) => { cur.push(w); if (/[.,!?]$/.test(w.t) || cur.length >= 3 || i === W.length - 1) { out.push({a: cur[0].at, w: cur}); cur = []; } });
  return out;
};
export const Captions = ({o, C, keyword, top = 1180}: {o: number; C: ReturnType<typeof chunks>; keyword: RegExp; top?: number}) => {
  let c = -1; C.forEach((x, i) => { if (o >= x.a - 40) c = i; });
  if (c < 0) return null;
  const ch = C[c]; const k = clamp01((o - ch.a) / 110);
  return <div style={{position: 'absolute', left: 30, right: 30, top, textAlign: 'center', transform: `scale(${0.82 + 0.18 * easeOut(k)}) rotate(${(1 - easeOut(k)) * -3}deg)`, lineHeight: 1.05}}>
    {ch.w.map((w, i) => { const t = w.t.replace(/[.,!?]$/, '').replace(/^10$/, 'TEN').toUpperCase();
      return <span key={i} style={{fontFamily: 'Montserrat', fontWeight: 800, fontSize: 96, color: keyword.test(w.t.replace(/[.,!?']/g, '')) ? '#FFE135' : '#fff', margin: '0 12px', display: 'inline-block',
        WebkitTextStroke: '14px #000', paintOrder: 'stroke fill', textShadow: '0 8px 0 rgba(0,0,0,.55)', opacity: o >= w.at - 60 ? 1 : 0.0}}>{t}</span>; })}
  </div>;
};
const FPS = 30;
export const fr = (ms: number) => Math.round((ms / 1000) * FPS);
export const Soundtrack = ({vo, off, W, total, fx, music, musicFrom = 0, musicVol = 0.16}: {vo: string; off: number; W: Word[]; total: number; fx: [string, number, number][]; music: string; musicFrom?: number; musicVol?: number}) => {
  const voiceAt = (ms: number) => W.some((w) => ms >= w.at - 150 && ms <= w.end + 200);
  return <>
    <Sequence from={fr(off)}><Audio src={staticFile(vo)} volume={1} /></Sequence>
    <Audio src={staticFile(music)} startFrom={fr(musicFrom * 1000)} volume={(f) => { const ms = (f / FPS) * 1000; return (voiceAt(ms) ? musicVol * 0.45 : musicVol) * Math.min(1, ms / 300, (total - ms) / 600); }} />
    {fx.map(([file, t, v], i) => <Sequence key={i} from={Math.max(0, fr(t))}><Audio src={staticFile(`blocky/sfx/${file}.mp3`)} volume={v} /></Sequence>)}
  </>;
};
