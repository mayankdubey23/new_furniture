'use client';

import { useRef, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'gsap';

function FooterScene({ isDark }) {
  const sofaGroup = useRef();
  const lampRef = useRef();
  const glowIntensity = isDark ? 2.5 : 1.2;

  const gltf = useLoader(GLTFLoader, '/3D models/teal sofa 3d model.glb');

  const clonedScene = useMemo(() => {
    const clone = gltf.scene.clone(true);
    clone.traverse((child) => {
      if (child.isMesh) {
        child.material = child.material.clone();
        child.material.color.setHex(0xf79227); // Orange sofa color
        child.material.emissive = new THREE.Color(0x331a00);
        child.material.emissiveIntensity = 0.1;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    clone.scale.set(0.8, 0.8, 0.8);
    clone.position.set(-0.5, 0, 0);
    clone.rotation.y = Math.PI * 0.1;
    return clone;
  }, [gltf]);

  useEffect(() => {
    if (sofaGroup.current) {
      gsap.from(sofaGroup.current.scale, {
        x: 0.6, y: 0.6, z: 0.6,
        duration: 1.2,
        ease: 'power3.out'
      });
    }
    if (lampRef.current) {
      gsap.to(lampRef.current, {
        intensity: glowIntensity * 1.3,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut'
      });
    }
  }, [glowIntensity]);

  return (
    <>
      {/* Sofa */}
      <group ref={sofaGroup}>
        <primitive object={clonedScene} />
      </group>

      {/* Lamp */}
      <group position={[1.2, 0.2, -0.5]}>
        <mesh ref={lampRef}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#fffde7" emissive="#fde047" emissiveIntensity={1.5} />
        </mesh>
        <pointLight ref={lampRef} intensity={glowIntensity} color="#fffde7" position={[0, 0.3, 0]} />
      </group>

      {/* Cactus */}
      <mesh position={[-1.2, -0.3, 0]}>
        <cylinderGeometry args={[0.05, 0.08, 0.6, 8]} />
        <meshStandardMaterial color="#71C26D" />
      </mesh>

      {/* Picture frame */}
      <mesh position={[0.3, 0.4, -1]}>
        <planeGeometry args={[0.4, 0.3]} />
        <meshStandardMaterial color="#f5f6f7" transparent opacity={0.8} />
      </mesh>

      {/* Bricks */}
      <mesh position={[-0.8, -0.5, -0.8]}>
        <boxGeometry args={[0.6, 0.05, 0.3]} />
        <meshStandardMaterial color="#e2e3e4" />
      </mesh>

      <ContactShadows position={[0, -0.5, 0]} opacity={0.4} scale={5} blur={1.5} />
      <ambientLight intensity={isDark ? 0.4 : 0.8} />
      <directionalLight position={[2, 3, 2]} intensity={1} />
      <pointLight position={[-2, 1, -2]} intensity={0.6} />
    </>
  );
}

export default function ThreeFooter({ isDark = false }) {
  return (
    <div className="threeCanvas relative h-[200px] w-[400px] overflow-hidden rounded-xl">
      <Canvas
        camera={{ position: [2, 1.5, 3], fov: 45 }}
        gl={{ toneMapping: THREE.ACESFilmicToneMapping, antialias: false }}
      >
        <Suspense fallback={null}>
          <Environment preset="studio" />
          <FooterScene isDark={isDark} />
          <OrbitControls 
            enablePan={false} 
            enableZoom={false} 
            enableRotate={false} 
            autoRotate 
            autoRotateSpeed={0.5}
          />
          <EffectComposer>
            <Bloom luminanceThreshold={0.7} luminanceSmoothing={0.6} intensity={1.2} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
