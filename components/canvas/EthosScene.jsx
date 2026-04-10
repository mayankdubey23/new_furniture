'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { useRef, useEffect, useState } from 'react';

function SofaForm({ paused }) {
  const sofaRef = useRef();

  useFrame((state) => {
    if (paused || !sofaRef.current) return;
    const time = state.clock.getElapsedTime();
    sofaRef.current.rotation.y = time * 0.75;
    sofaRef.current.rotation.x = Math.sin(time * 0.9) * 0.08;
    sofaRef.current.position.y = Math.sin(time * 1.4) * 0.06 - 0.15;
  });

  return (
    <group ref={sofaRef} scale={0.92} position={[0, -0.05, 0]}>
      <RoundedBox args={[2.2, 0.42, 0.88]} radius={0.12} position={[0, -0.62, 0]}>
        <meshStandardMaterial color="#0b4048" metalness={0.15} roughness={0.82} />
      </RoundedBox>
      <RoundedBox args={[0.34, 0.98, 0.86]} radius={0.12} position={[-1.14, -0.22, 0]}>
        <meshStandardMaterial color="#0a4f59" metalness={0.14} roughness={0.78} />
      </RoundedBox>
      <RoundedBox args={[0.34, 0.98, 0.86]} radius={0.12} position={[1.14, -0.22, 0]}>
        <meshStandardMaterial color="#0a4f59" metalness={0.14} roughness={0.78} />
      </RoundedBox>
      <RoundedBox args={[0.68, 0.84, 0.22]} radius={0.09} position={[-0.72, 0.08, -0.24]}>
        <meshStandardMaterial color="#0e5964" metalness={0.12} roughness={0.76} />
      </RoundedBox>
      <RoundedBox args={[0.68, 0.84, 0.22]} radius={0.09} position={[0, 0.08, -0.24]}>
        <meshStandardMaterial color="#0e5964" metalness={0.12} roughness={0.76} />
      </RoundedBox>
      <RoundedBox args={[0.68, 0.84, 0.22]} radius={0.09} position={[0.72, 0.08, -0.24]}>
        <meshStandardMaterial color="#0e5964" metalness={0.12} roughness={0.76} />
      </RoundedBox>
      <RoundedBox args={[0.68, 0.28, 0.8]} radius={0.12} position={[-0.72, -0.38, 0.03]}>
        <meshStandardMaterial color="#116c79" metalness={0.12} roughness={0.7} />
      </RoundedBox>
      <RoundedBox args={[0.68, 0.28, 0.8]} radius={0.12} position={[0, -0.38, 0.03]}>
        <meshStandardMaterial color="#116c79" metalness={0.12} roughness={0.7} />
      </RoundedBox>
      <RoundedBox args={[0.68, 0.28, 0.8]} radius={0.12} position={[0.72, -0.38, 0.03]}>
        <meshStandardMaterial color="#116c79" metalness={0.12} roughness={0.7} />
      </RoundedBox>
      <mesh position={[-0.95, -1.05, 0.27]} rotation={[0, 0, 0.03]}>
        <boxGeometry args={[0.06, 0.7, 0.06]} />
        <meshStandardMaterial color="#c99756" metalness={0.9} roughness={0.18} />
      </mesh>
      <mesh position={[0.95, -1.05, 0.27]} rotation={[0, 0, -0.03]}>
        <boxGeometry args={[0.06, 0.7, 0.06]} />
        <meshStandardMaterial color="#c99756" metalness={0.9} roughness={0.18} />
      </mesh>
    </group>
  );
}

export default function EthosScene() {
  const wrapperRef = useRef(null);

  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setPaused(!entry.isIntersecting),
      { threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative h-[260px] w-full overflow-hidden rounded-[1.75rem] border border-white/12 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),rgba(255,255,255,0.04)_40%,rgba(18,14,11,0.12)_100%)] md:h-[320px]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(165,106,63,0.22),transparent_28%),radial-gradient(circle_at_78%_76%,rgba(102,114,95,0.18),transparent_24%)]" />
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 34 }}
        dpr={1}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#120e0b']} />
        <ambientLight intensity={0.95} color="#f4e7d6" />
        <hemisphereLight intensity={0.8} groundColor="#120e0b" color="#f5e7d4" />
        <directionalLight position={[3.8, 4.2, 5.2]} intensity={1.9} color="#fff2df" />
        <directionalLight position={[-3.4, 2.6, 3.2]} intensity={0.85} color="#b77a4d" />
        <pointLight position={[-4, -2, 2]} intensity={1.1} color="#a56a3f" />
        <pointLight position={[0, 1.2, -3]} intensity={0.55} color="#3d2a21" />
        <spotLight position={[0, 5, 4]} angle={0.38} penumbra={1} intensity={1.35} color="#fff2df" />
        <fog attach="fog" args={['#120e0b', 5.5, 11]} />
        <SofaForm paused={paused} />
      </Canvas>
    </div>
  );
}
