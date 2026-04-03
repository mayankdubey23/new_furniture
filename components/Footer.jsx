'use client';

import { Suspense, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Environment, OrbitControls, useGLTF } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { gsap } from 'gsap';

function FooterScene({ isDark }) {
  const sofaGroup = useRef(null);
  const lampLightRef = useRef(null);
  const glowIntensity = isDark ? 2.4 : 1.2;
  const { scene } = useGLTF('/3D models/teal sofa 3d model.glb');

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material = child.material.clone();
        child.material.color.setHex(0xc78c5c);
        child.material.emissive = new THREE.Color(0x26120a);
        child.material.emissiveIntensity = 0.08;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    clone.scale.set(0.58, 0.58, 0.58);
    clone.position.set(-0.45, -0.18, 0);
    clone.rotation.y = Math.PI * 0.12;
    return clone;
  }, [scene]);

  useEffect(() => {
    if (sofaGroup.current) {
      gsap.from(sofaGroup.current.scale, {
        x: 0.5,
        y: 0.5,
        z: 0.5,
        duration: 1.1,
        ease: 'power3.out',
      });
    }

    if (lampLightRef.current) {
      gsap.to(lampLightRef.current, {
        intensity: glowIntensity * 1.5,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut',
      });
    }
  }, [glowIntensity]);

  return (
    <>
      <group position={[0, -0.5, 0]}>
        <group ref={sofaGroup}>
          <primitive object={clonedScene} />
        </group>

        <group position={[1.45, 0.48, -0.5]}>
          <mesh>
            <sphereGeometry args={[0.15, 12, 12]} />
            <meshStandardMaterial color="#fff8dc" emissive="#fde68a" emissiveIntensity={1.4} />
          </mesh>
          <pointLight ref={lampLightRef} intensity={glowIntensity} color="#fff8dc" position={[0, 0.3, 0]} />
        </group>

        <mesh position={[-1.45, 0.1, -0.2]}>
          <cylinderGeometry args={[0.06, 0.08, 0.72, 6]} />
          <meshStandardMaterial color="#7abf71" />
        </mesh>

        <mesh position={[0.52, 0.82, -1.16]}>
          <planeGeometry args={[0.5, 0.4]} />
          <meshStandardMaterial color="#f6efe7" transparent opacity={0.82} />
        </mesh>

        <mesh position={[-0.8, -0.2, -1]}>
          <boxGeometry args={[0.6, 0.05, 0.3]} />
          <meshStandardMaterial color="#e6ddd2" />
        </mesh>

        <ContactShadows position={[0, 0, 0]} opacity={0.35} scale={10} blur={1.2} far={2.5} />
      </group>

      <ambientLight intensity={isDark ? 0.28 : 0.58} />
      <directionalLight position={[3, 4, 2]} intensity={1.15} />
      <pointLight position={[-3, 2, -2]} intensity={0.45} />
    </>
  );
}

useGLTF.preload('/3D models/teal sofa 3d model.glb');

export default function ThreeFooter({ isDark = true }) {
  return (
    <footer className="relative mt-20 min-h-[560px] w-full overflow-hidden bg-[radial-gradient(circle_at_top,rgba(199,140,92,0.16),transparent_28%),linear-gradient(180deg,#1a1613_0%,#120e0c_58%,#0d0a09_100%)]">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas
          camera={{ position: [0, 1.5, 5], fov: 45 }}
          gl={{ toneMapping: THREE.ACESFilmicToneMapping, antialias: true }}
        >
          <Suspense fallback={null}>
            <Environment preset="studio" />
            <FooterScene isDark={isDark} />
            <OrbitControls enablePan={false} enableZoom={false} enableRotate={false} autoRotate autoRotateSpeed={0.3} />
            <EffectComposer>
              <Bloom luminanceThreshold={0.6} luminanceSmoothing={0.9} intensity={1.45} />
            </EffectComposer>
          </Suspense>
        </Canvas>
      </div>

      <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_28%),linear-gradient(180deg,rgba(18,14,11,0.08)_0%,rgba(18,14,11,0.7)_50%,rgba(12,9,8,0.94)_100%)]" />

      <div className="relative z-20 mx-auto flex h-full max-w-[96rem] flex-col justify-between px-6 pb-10 pt-24 text-white md:px-10 lg:px-16">
        <div className="grid grid-cols-1 gap-10 rounded-[2rem] border border-white/10 bg-white/8 p-6 md:grid-cols-4 md:gap-12 md:p-8">
          <div className="md:col-span-1">
            <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-theme-bronze">Luxe Atelier</p>
            <h2 className="mb-4 font-display text-4xl tracking-[0.08em] text-theme-ivory">LUXE</h2>
            <p className="mb-6 text-sm leading-7 text-white/72">
              Curated seating, tactile materials, and atmospheric 3D product storytelling for homes that want to feel composed and elevated.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-white/78">Furniture</span>
              <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-white/78">3D Ready</span>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.32em] text-theme-bronze">Collections</h3>
            <ul className="space-y-3 text-sm text-white/68">
              <li><Link href="/#sofa-3d-view-start" className="transition-colors hover:text-theme-bronze">Sofas</Link></li>
              <li><Link href="/#chairs-start" className="transition-colors hover:text-theme-bronze">Chairs</Link></li>
              <li><Link href="/#recliner-3d-view-start" className="transition-colors hover:text-theme-bronze">Recliners</Link></li>
              <li><Link href="/#pouffes-start" className="transition-colors hover:text-theme-bronze">Pouffes</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.32em] text-theme-bronze">Experience</h3>
            <ul className="space-y-3 text-sm text-white/68">
              <li><Link href="/customization" className="transition-colors hover:text-theme-bronze">Customization</Link></li>
              <li><Link href="/contact" className="transition-colors hover:text-theme-bronze">Contact</Link></li>
              <li><Link href="/admin" className="transition-colors hover:text-theme-bronze">Admin</Link></li>
              <li><Link href="/#hero" className="transition-colors hover:text-theme-bronze">Back to top</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.32em] text-theme-bronze">Stay Informed</h3>
            <p className="mb-4 text-sm leading-7 text-white/68">Get first access to new drops, design notes, and private consultation openings.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email address"
                className="w-full rounded-full border border-white/12 bg-white/8 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-1 focus:ring-theme-bronze/60"
              />
              <button className="rounded-full bg-theme-bronze px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-theme-ivory hover:text-theme-ink">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-white/44 md:flex-row">
          <p>© {new Date().getFullYear()} Luxe Furniture. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="transition-colors hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="transition-colors hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
