'use client';

import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html, Environment, ContactShadows, Center } from '@react-three/drei';
import { Suspense, useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { gsap } from 'gsap';

// ─── GLB Model ────────────────────────────────────────────────────────────────
function GLBModel({ glbPath, isVisible, onLoaded }) {
  const { scene } = useGLTF(glbPath);
  const groupRef = useRef();
  const [popped, setPopped] = useState(false);

  const { clonedScene, modelScale, floorOffset } = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child.isMesh) {
        child.material = child.material.clone();
        child.material.side = THREE.DoubleSide;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const maxAxis = Math.max(size.x, size.y, size.z) || 1;

    return {
      clonedScene: clone,
      modelScale: 2.6 / maxAxis,
      floorOffset: box.min.y,
    };
  }, [scene]);

  useEffect(() => {
    onLoaded?.();
  }, [onLoaded, scene]);

  useEffect(() => {
    if (!isVisible || !groupRef.current || popped) return;
    
    groupRef.current.scale.set(0.55, 0.55, 0.55);
    groupRef.current.rotation.y = reverseSafeAngle(groupRef.current.rotation.y);
    gsap.to(groupRef.current.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 0.9,
      ease: 'power3.out',
      onComplete: () => setPopped(true),
    });
  }, [isVisible, popped]);

  return (
    <group ref={groupRef}>
      <Center position={[0, -floorOffset * modelScale - 1.15, 0]}>
        <primitive object={clonedScene} scale={modelScale} />
      </Center>
      <ContactShadows position={[0, -1.18, 0]} opacity={0.5} scale={8} blur={2.4} far={3.5} color="#1a1a1a" />
    </group>
  );
}

function reverseSafeAngle(value) {
  return Number.isFinite(value) ? value : 0;
}

// ─── OBJ / MTL Model ─────────────────────────────────────────────────────────
function OBJModel({ objPath, mtlPath, isVisible }) {
  const groupRef = useRef();
  const [popped, setPopped] = useState(false);

  const materials = useLoader(MTLLoader, mtlPath);
  const obj = useLoader(OBJLoader, objPath, (loader) => {
    materials.preload();
    loader.setMaterials(materials);
  });

  const clonedObj = useMemo(() => {
    const clone = obj.clone(true);
    clone.traverse((child) => {
      if (child.isMesh) {
        child.material.side = THREE.DoubleSide;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clone;
  }, [obj]);

  useEffect(() => {
    if (!isVisible || !groupRef.current || popped) return;
    
    groupRef.current.scale.set(0, 0, 0);
    groupRef.current.position.set(0, -1.2, 0); // Grounded!

    gsap.to(groupRef.current.scale, {
      x: 0.0035, y: 0.0035, z: 0.0035,
      duration: 1.2,
      ease: 'elastic.out(1, 0.75)',
      onComplete: () => setPopped(true),
    });
  }, [isVisible, popped]);

  return (
    <group ref={groupRef}>
      <primitive object={clonedObj} />
      {/* Shadow directly under the grounded model */}
      <ContactShadows position={[0, 0, 0]} opacity={0.7} scale={12} blur={2.5} far={4} color="#1a1a1a" />
    </group>
  );
}

// ─── Loading spinner ─────────────────────────────────────────────────────────
function LoadingFallback() {
  return (
    <Html center>
      <div
        style={{
          width: 40,
          height: 40,
          border: '3px solid rgba(160,115,75,0.25)',
          borderTopColor: 'rgba(160,115,75,0.85)',
          borderRadius: '50%',
          animation: 'spin 0.9s linear infinite',
        }}
      />
    </Html>
  );
}

// ─── OrbitControls ────────────────────────────────────────────────────────────
function SceneControls() {
  return (
    <OrbitControls
      enablePan={false}
      enableZoom={true}
      enableRotate={true}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.7}
      minDistance={2}
      maxDistance={7} 
      maxPolarAngle={Math.PI / 2 + 0.1} // Zameen ke neeche dekhne se rokne ke liye
    />
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────
export default function ModelViewer({ glbPath, objPath, mtlPath, onLoaded }) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex h-[22rem] w-full items-center justify-center overflow-hidden rounded-[1.6rem] cursor-grab active:cursor-grabbing md:h-[30rem]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(165,106,63,0.16),_rgba(251,247,241,0.15)_65%,_transparent_100%)] dark:bg-[radial-gradient(circle_at_top,_rgba(199,140,92,0.18),_rgba(34,27,23,0.08)_65%,_transparent_100%)]"></div>

      <Canvas
        className="relative z-10"
        camera={{ position: [4.3, 1.3, 4.1], fov: 42, near: 0.1, far: 40 }}
        style={{ width: '100%', height: '100%' }}
        dpr={[1, 1.25]}
        gl={{ antialias: false, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping }}
        performance={{ min: 0.4, max: 1 }}
        shadows="percentage"
      >
        <ambientLight intensity={1} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.6}
          castShadow
          shadow-mapSize={[512, 512]}
        />
        <pointLight position={[-5, 4, -5]} intensity={0.6} />
        <Environment preset="studio" />

        <Suspense fallback={<LoadingFallback />}>
          {glbPath ? (
            <GLBModel glbPath={glbPath} isVisible={isVisible} onLoaded={onLoaded} />
          ) : objPath && mtlPath ? (
            <OBJModel objPath={objPath} mtlPath={mtlPath} isVisible={isVisible} />
          ) : null}
        </Suspense>

        <SceneControls />
      </Canvas>
    </div>
  );
}
