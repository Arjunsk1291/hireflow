'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Gear({
  radius,
  position,
  speed,
  teeth = 12,
}: {
  radius: number;
  position: [number, number, number];
  speed: number;
  teeth?: number;
}) {
  const ref = useRef<THREE.Mesh>(null!);

  const shape = useMemo(() => {
    const s = new THREE.Shape();
    for (let i = 0; i < teeth; i++) {
      const a0 = (i / teeth) * Math.PI * 2;
      const a1 = ((i + 0.4) / teeth) * Math.PI * 2;
      const a2 = ((i + 0.6) / teeth) * Math.PI * 2;
      const a3 = ((i + 1)   / teeth) * Math.PI * 2;
      const r1 = radius, r2 = radius * 1.18;
      if (i === 0) s.moveTo(Math.cos(a0) * r1, Math.sin(a0) * r1);
      else          s.lineTo(Math.cos(a0) * r1, Math.sin(a0) * r1);
      s.lineTo(Math.cos(a1) * r2, Math.sin(a1) * r2);
      s.lineTo(Math.cos(a2) * r2, Math.sin(a2) * r2);
      s.lineTo(Math.cos(a3) * r1, Math.sin(a3) * r1);
    }
    s.closePath();
    const hole = new THREE.Path();
    hole.absarc(0, 0, radius * 0.3, 0, Math.PI * 2, true);
    s.holes.push(hole);
    return s;
  }, [radius, teeth]);

  useFrame(() => { if (ref.current) ref.current.rotation.z += speed; });

  return (
    <mesh ref={ref} position={position}>
      <extrudeGeometry args={[shape, { depth: 0.15, bevelEnabled: false }]} />
      <meshStandardMaterial color="#f59e0b" wireframe emissive="#f59e0b" emissiveIntensity={0.3} />
    </mesh>
  );
}

function FloatingParticles() {
  const ref = useRef<THREE.Points>(null!);
  const count = 80;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.getElapsedTime() * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#f59e0b" size={0.08} transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

export function AuthScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 60 }}
      style={{ position: 'absolute', inset: 0 }}
      gl={{ alpha: true }}
    >
      <ambientLight intensity={0.1} />
      <pointLight position={[3, 3, 5]}  color="#f59e0b" intensity={4} />
      <pointLight position={[-4, -2, 3]} color="#3b82f6" intensity={2} />

      <Gear radius={2}    position={[0,     0, 0]}  speed={0.003}  teeth={14} />
      <Gear radius={1.2}  position={[3.15,  0, 0]}  speed={-0.005} teeth={9}  />
      <Gear radius={1.2}  position={[-3.15, 0, 0]}  speed={-0.005} teeth={9}  />

      <FloatingParticles />

      <mesh position={[0, 0, -3]}>
        <planeGeometry args={[25, 25]} />
        <meshBasicMaterial color="#0d1a2d" transparent opacity={0.6} />
      </mesh>

      <fog attach="fog" args={['#050b14', 8, 20]} />
    </Canvas>
  );
}
