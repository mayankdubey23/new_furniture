'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF, useProgress, Bounds } from '@react-three/drei';






function AnimatedModel({ modelPath }) {
  const { scene } = useGLTF(modelPath);
  const groupRef = useRef();
  const didInit = useRef(false);
  const startTime = useRef(null);

  useFrame((state) => {
    if (!groupRef.current) return;


    if (!didInit.current) {
      didInit.current = true;
      groupRef.current.scale.setScalar(0.001);
      startTime.current = state.clock.getElapsedTime();
      return;
    }

    if (startTime.current === null) return;

    const elapsed = state.clock.getElapsedTime() - startTime.current;
    const t = Math.min(elapsed / 0.65, 1);
    const eased = 1 - Math.pow(1 - t, 3);

    groupRef.current.scale.setScalar(eased);

    if (t >= 1) {
      groupRef.current.scale.setScalar(1);
      startTime.current = null;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

function LoadingOverlay() {
  const { progress, active } = useProgress();
  if (!active) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-3">
      <div className="relative h-12 w-12">
        <svg
          className="absolute inset-0 h-full w-full animate-spin text-theme-bronze/80"
          viewBox="0 0 48 48"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="100"
            strokeDashoffset="60"
            className="opacity-90"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-3 w-3 rounded-full bg-theme-bronze/70" />
        </div>
      </div>
      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-white/75">
        Loading Model&nbsp;
        <span className="text-theme-bronze">{Math.round(progress)}%</span>
      </p>
    </div>
  );
}

export default function Model3DViewer({ modelPath }) {
  if (!modelPath) return null;

  return (
    <div className="relative h-full w-full">

      <Canvas gl={{ antialias: true, alpha: true }} style={{ background: 'transparent' }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[4, 6, 4]} intensity={1.1} />
        <directionalLight position={[-3, 2, -4]} intensity={0.35} />

        <Suspense fallback={null}>






          <Bounds fit clip margin={1.2} damping={8}>
            <AnimatedModel modelPath={modelPath} />
          </Bounds>
          <Environment preset="apartment" />
        </Suspense>

        <OrbitControls
          autoRotate
          autoRotateSpeed={1}
          enablePan={false}
          minPolarAngle={Math.PI / 8}
          maxPolarAngle={Math.PI * 0.78}
        />
      </Canvas>

      <LoadingOverlay />

      <div className="pointer-events-none absolute bottom-5 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/14 bg-black/30 px-4 py-2 text-[0.58rem] font-medium uppercase tracking-[0.24em] text-white/65 backdrop-blur-sm">
        Drag to rotate&nbsp;·&nbsp;Scroll to zoom
      </div>
    </div>
  );
}
