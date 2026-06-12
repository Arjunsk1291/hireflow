'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

/* GLSL simplex noise (Ashima) — displaces the knot surface like molten metal */
const NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x){return x - floor(x * (1.0/289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0/289.0)) * 289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

const VERTEX = /* glsl */ `
${NOISE_GLSL}
uniform float uTime;
varying vec3 vNormal;
varying vec3 vView;
varying float vNoise;
void main() {
  float n = snoise(position * 0.9 + uTime * 0.25);
  vNoise = n;
  vec3 displaced = position + normal * n * 0.22;
  vec4 mv = modelViewMatrix * vec4(displaced, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vView = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`;

const FRAGMENT = /* glsl */ `
uniform float uTime;
varying vec3 vNormal;
varying vec3 vView;
varying float vNoise;
void main() {
  float fresnel = pow(1.0 - clamp(dot(vNormal, vView), 0.0, 1.0), 2.2);
  vec3 deep   = vec3(0.018, 0.04, 0.09);   // dark steel core
  vec3 ember  = vec3(0.96, 0.62, 0.04);    // molten amber
  vec3 flare  = vec3(1.0, 0.85, 0.45);     // hot highlight
  float pulse = 0.5 + 0.5 * sin(uTime * 0.6 + vNoise * 4.0);
  vec3 color = mix(deep, ember, fresnel);
  color += flare * pow(fresnel, 4.0) * (0.7 + 0.5 * pulse);
  color += ember * smoothstep(0.25, 0.8, vNoise) * 0.35;
  gl_FragColor = vec4(color, 1.0);
}
`;

function MoltenKnot() {
  const mesh = useRef<THREE.Mesh>(null!);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    if (mesh.current) {
      mesh.current.rotation.x = state.clock.elapsedTime * 0.08;
      mesh.current.rotation.y = state.clock.elapsedTime * 0.12;
    }
  });

  return (
    <mesh ref={mesh}>
      <torusKnotGeometry args={[1.7, 0.48, 260, 48]} />
      <shaderMaterial vertexShader={VERTEX} fragmentShader={FRAGMENT} uniforms={uniforms} />
    </mesh>
  );
}

function OrbitalRing({ radius, tilt, speed, opacity }: { radius: number; tilt: number; speed: number; opacity: number }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    if (ref.current) ref.current.rotation.z = state.clock.elapsedTime * speed;
  });
  return (
    <mesh ref={ref} rotation={[tilt, 0.4, 0]}>
      <torusGeometry args={[radius, 0.006, 8, 220]} />
      <meshBasicMaterial color="#f59e0b" transparent opacity={opacity} />
    </mesh>
  );
}

function ParticleField() {
  const ref = useRef<THREE.Points>(null!);
  const count = 350;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 6 + Math.random() * 14;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
      arr[i * 3 + 2] = r * Math.cos(phi) - 4;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.015;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#7da6d9" size={0.035} transparent opacity={0.5} sizeAttenuation depthWrite={false} />
    </points>
  );
}

/* Eases the camera toward the pointer for a weighty parallax feel */
function ParallaxRig() {
  const { camera, pointer } = useThree();
  useFrame(() => {
    camera.position.x += (pointer.x * 1.2 - camera.position.x) * 0.04;
    camera.position.y += (pointer.y * 0.7 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export function AuthScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7.5], fov: 45 }}
      dpr={[1, 1.75]}
      style={{ position: 'absolute', inset: 0 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
    >
      <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.6}>
        <MoltenKnot />
        <OrbitalRing radius={3.1} tilt={1.2}  speed={0.10}  opacity={0.35} />
        <OrbitalRing radius={3.7} tilt={1.9}  speed={-0.07} opacity={0.18} />
        <OrbitalRing radius={4.4} tilt={0.7}  speed={0.045} opacity={0.10} />
      </Float>

      <Sparkles count={90} scale={[14, 8, 8]} size={1.6} speed={0.25} color="#fbbf24" opacity={0.55} />
      <ParticleField />
      <ParallaxRig />

      <fog attach="fog" args={['#04080f', 9, 24]} />
    </Canvas>
  );
}
