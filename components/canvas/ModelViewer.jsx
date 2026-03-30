'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { Suspense, useState, useEffect } from 'react';

function Model({ modelPath }) {
  const [error, setError] = useState(false);

  try {
    const { scene } = useGLTF(modelPath);
    return <primitive object={scene} scale={1} />;
  } catch (err) {
    console.error('Failed to load model:', err);
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="gray" />
      </mesh>
    );
  }
}

function Fallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="lightgray" />
    </mesh>
  );
}

export default function ModelViewer({ modelPath }) {
  return (
    <div className="w-full h-96 md:h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Suspense fallback={<Fallback />}>
          <Model modelPath={modelPath} />
        </Suspense>
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
    </div>
  );
}
