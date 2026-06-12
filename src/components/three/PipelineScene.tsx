'use client';

import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

const STAGE_POSITIONS: [number, number, number][] = [
  [-6.5, 0, 0], [-4.6, 0, 0], [-2.7, 0, 0], [-0.8, 0, 0],
  [1.1, 0, 0],  [3.0, 0, 0],  [4.9, 0, 0],  [6.8, 0, 0],
];
const STAGE_NAMES = ['CV In', 'Review', 'Short', 'Interview', 'Feedback', 'Offer', 'Approved', 'Hired'];
const AMBER = new THREE.Color('#f59e0b');
const BLUE  = new THREE.Color('#3b82f6');

function PipelineNode({
  position, label, count, index,
}: { position: [number, number, number]; label: string; count: number; index: number }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const glow = 0.6 + Math.sin(t * 1.5 + index * 0.8) * 0.3;
    if (meshRef.current) {
      (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = glow;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.01;
      ringRef.current.scale.setScalar(1 + Math.sin(t + index) * 0.08);
    }
  });

  const intensity = Math.min(count / 3, 1);
  const color = new THREE.Color().lerpColors(BLUE, AMBER, intensity);

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.32, 32, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.02, 8, 48]} />
        <meshStandardMaterial color={AMBER} emissive={AMBER} emissiveIntensity={0.5} transparent opacity={0.6} />
      </mesh>
      <Suspense fallback={null}>
        <Text position={[0, 0.68, 0]} fontSize={0.18} color="#fbbf24" anchorX="center">
          {label}
        </Text>
        <Text position={[0, -0.62, 0]} fontSize={0.24} color="#f8fafc" anchorX="center">
          {count.toString()}
        </Text>
      </Suspense>
    </group>
  );
}

function PipelineTube({ from, to }: { from: [number, number, number]; to: [number, number, number] }) {
  const mid: [number, number, number] = [
    (from[0] + to[0]) / 2,
    (from[1] + to[1]) / 2,
    (from[2] + to[2]) / 2,
  ];
  const len = new THREE.Vector3(...from).distanceTo(new THREE.Vector3(...to));
  return (
    <mesh position={mid} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.035, 0.035, len - 0.64, 8]} />
      <meshStandardMaterial color="#1e3a5f" emissive="#1e3a5f" emissiveIntensity={0.3} metalness={0.9} roughness={0.2} />
    </mesh>
  );
}

function Particles({ count = 120 }: { count?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const data = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        t: Math.random(),
        speed: 0.003 + Math.random() * 0.003,
        y: (Math.random() - 0.5) * 0.18,
      })),
    [count],
  );

  useFrame(() => {
    data.forEach((d, i) => {
      d.t = (d.t + d.speed) % 1;
      const x = -7.5 + d.t * 15;
      dummy.position.set(x, d.y, 0);
      dummy.scale.setScalar(0.055);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial color={AMBER} emissive={AMBER} emissiveIntensity={1.5} />
    </instancedMesh>
  );
}

export function PipelineScene({ stageCounts = [0, 0, 0, 0, 0, 0, 0, 0] }: { stageCounts?: number[] }) {
  return (
    <Canvas
      camera={{ position: [0, 2.5, 12], fov: 55 }}
      style={{ height: 280 }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 5, 5]}   color="#f59e0b" intensity={3} />
      <pointLight position={[-5, -2, 3]} color="#3b82f6" intensity={1.5} />

      {STAGE_POSITIONS.map((pos, i) => (
        <PipelineNode
          key={i}
          position={pos}
          label={STAGE_NAMES[i]}
          count={stageCounts[i] ?? 0}
          index={i}
        />
      ))}

      {STAGE_POSITIONS.slice(0, -1).map((pos, i) => (
        <PipelineTube key={i} from={pos} to={STAGE_POSITIONS[i + 1]} />
      ))}

      <Particles count={150} />
      <fog attach="fog" args={['#050b14', 18, 30]} />
    </Canvas>
  );
}
