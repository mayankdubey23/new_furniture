'use client';

import Image from 'next/image';
import { useMemo, useRef, useSyncExternalStore } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useOptimizePerformance } from '@/hooks/useOptimizePerformance';
import { useViewportMode, type LayoutMode } from '@/hooks/useViewportMode';
import { PRODUCT_SVG_MOTIFS } from '@/lib/productSvgMotifs';

gsap.registerPlugin(ScrollTrigger);

type CushionDepth = 'foreground' | 'midground' | 'background';

interface CascadeSpec {
  id: string;
  depth: CushionDepth;
  sizeScale: number;
  startX: number;
  midX: number;
  glideX: number;
  exitX: number;
  midY: number;
  glideY: number;
  exitY: number;
  startRotation: number;
  midRotation: number;
  glideRotation: number;
  exitRotation: number;
  footerGatherX: number;
  footerGatherY: number;
  footerBurstX: number;
  footerBurstY: number;
  footerBurstRotation: number;
  spawn: number;
  idleLift: number;
  idleTilt: number;
}

const BASE_WIDTHS: Record<CushionDepth, number> = {
  foreground: 188,
  midground: 150,
  background: 118,
};

const MODE_SCALES: Record<LayoutMode, number> = {
  desktop: 1,
  tablet: 0.84,
  mobile: 0.66,
};

const VISIBLE_COUNTS: Record<LayoutMode, number> = {
  desktop: 14,
  tablet: 9,
  mobile: 6,
};

const DEPTH_SETTINGS: Record<
  CushionDepth,
  {
    zIndex: number;
    introOpacity: number;
    glideOpacity: number;
    travelOpacity: number;
    footerOpacity: number;
    exitOpacity: number;
    shadow: string;
    imageClassName: string;
  }
> = {
  foreground: {
    zIndex: 18,
    introOpacity: 0.15,
    glideOpacity: 0.08,
    travelOpacity: 0.04,
    footerOpacity: 0.1,
    exitOpacity: 0.07,
    shadow: 'drop-shadow(0 24px 52px rgba(42, 33, 28, 0.24))',
    imageClassName: 'brightness-[0.86] saturate-[0.58] mix-blend-multiply',
  },
  midground: {
    zIndex: 12,
    introOpacity: 0.1,
    glideOpacity: 0.055,
    travelOpacity: 0.03,
    footerOpacity: 0.065,
    exitOpacity: 0.03,
    shadow: 'drop-shadow(0 18px 38px rgba(42, 33, 28, 0.16))',
    imageClassName: 'brightness-[0.82] saturate-[0.48] mix-blend-multiply',
  },
  background: {
    zIndex: 6,
    introOpacity: 0.055,
    glideOpacity: 0.03,
    travelOpacity: 0.018,
    footerOpacity: 0.04,
    exitOpacity: 0,
    shadow: 'drop-shadow(0 14px 28px rgba(42, 33, 28, 0.1))',
    imageClassName: 'brightness-[0.78] saturate-[0.4] mix-blend-multiply',
  },
};

const CASCADE_SPECS: CascadeSpec[] = [
  { id: 'cushion-01', depth: 'foreground', sizeScale: 1.12, startX: -0.14, midX: 0.16, glideX: 0.22, exitX: 0.28, midY: 0.12, glideY: 0.4, exitY: 1.02, startRotation: -18, midRotation: -8, glideRotation: -2, exitRotation: 6, footerGatherX: 0.44, footerGatherY: 0.74, footerBurstX: 0.28, footerBurstY: 0.8, footerBurstRotation: -28, spawn: 0.02, idleLift: -5, idleTilt: -1.6 },
  { id: 'cushion-02', depth: 'background', sizeScale: 0.92, startX: 1.08, midX: 0.82, glideX: 0.74, exitX: 0.68, midY: 0.16, glideY: 0.46, exitY: 1.04, startRotation: 16, midRotation: 8, glideRotation: 3, exitRotation: -8, footerGatherX: 0.54, footerGatherY: 0.7, footerBurstX: 0.72, footerBurstY: 0.76, footerBurstRotation: 24, spawn: 0.08, idleLift: -2, idleTilt: 1.1 },
  { id: 'cushion-03', depth: 'midground', sizeScale: 1.04, startX: 0.44, midX: 0.56, glideX: 0.62, exitX: 0.66, midY: 0.08, glideY: 0.34, exitY: 0.96, startRotation: -7, midRotation: -1, glideRotation: 3, exitRotation: 11, footerGatherX: 0.5, footerGatherY: 0.72, footerBurstX: 0.62, footerBurstY: 0.78, footerBurstRotation: 18, spawn: 0.15, idleLift: -4, idleTilt: -1.1 },
  { id: 'cushion-04', depth: 'midground', sizeScale: 0.98, startX: 0.94, midX: 0.72, glideX: 0.58, exitX: 0.5, midY: 0.22, glideY: 0.56, exitY: 1.08, startRotation: 18, midRotation: 9, glideRotation: 2, exitRotation: -8, footerGatherX: 0.58, footerGatherY: 0.76, footerBurstX: 0.82, footerBurstY: 0.84, footerBurstRotation: 26, spawn: 0.22, idleLift: -4, idleTilt: 1.5 },
  { id: 'cushion-05', depth: 'background', sizeScale: 0.88, startX: 0.24, midX: 0.2, glideX: 0.14, exitX: 0.1, midY: 0.26, glideY: 0.52, exitY: 1, startRotation: -12, midRotation: -8, glideRotation: -3, exitRotation: 3, footerGatherX: 0.42, footerGatherY: 0.68, footerBurstX: 0.22, footerBurstY: 0.74, footerBurstRotation: -20, spawn: 0.29, idleLift: -2, idleTilt: -1 },
  { id: 'cushion-06', depth: 'foreground', sizeScale: 1.06, startX: -0.1, midX: 0.28, glideX: 0.34, exitX: 0.42, midY: 0.1, glideY: 0.44, exitY: 0.94, startRotation: -22, midRotation: -10, glideRotation: -4, exitRotation: 5, footerGatherX: 0.46, footerGatherY: 0.78, footerBurstX: 0.34, footerBurstY: 0.88, footerBurstRotation: -22, spawn: 0.36, idleLift: -5, idleTilt: -1.4 },
  { id: 'cushion-07', depth: 'midground', sizeScale: 1.02, startX: 0.76, midX: 0.48, glideX: 0.54, exitX: 0.46, midY: 0.14, glideY: 0.42, exitY: 0.98, startRotation: 12, midRotation: 6, glideRotation: 0, exitRotation: -9, footerGatherX: 0.56, footerGatherY: 0.72, footerBurstX: 0.7, footerBurstY: 0.82, footerBurstRotation: 21, spawn: 0.43, idleLift: -3, idleTilt: 1.2 },
  { id: 'cushion-08', depth: 'background', sizeScale: 0.9, startX: 1.04, midX: 0.9, glideX: 0.84, exitX: 0.78, midY: 0.08, glideY: 0.32, exitY: 0.82, startRotation: 10, midRotation: 4, glideRotation: 0, exitRotation: -6, footerGatherX: 0.62, footerGatherY: 0.66, footerBurstX: 0.8, footerBurstY: 0.72, footerBurstRotation: 18, spawn: 0.5, idleLift: -2, idleTilt: 0.8 },
  { id: 'cushion-09', depth: 'foreground', sizeScale: 1.14, startX: 0.04, midX: 0.12, glideX: 0.16, exitX: 0.22, midY: 0.06, glideY: 0.28, exitY: 0.84, startRotation: -8, midRotation: -3, glideRotation: 2, exitRotation: 12, footerGatherX: 0.48, footerGatherY: 0.7, footerBurstX: 0.4, footerBurstY: 0.76, footerBurstRotation: -16, spawn: 0.57, idleLift: -6, idleTilt: -0.8 },
  { id: 'cushion-10', depth: 'midground', sizeScale: 0.94, startX: 0.48, midX: 0.4, glideX: 0.36, exitX: 0.3, midY: 0.28, glideY: 0.6, exitY: 1.12, startRotation: -16, midRotation: -10, glideRotation: -5, exitRotation: 1, footerGatherX: 0.44, footerGatherY: 0.8, footerBurstX: 0.24, footerBurstY: 0.92, footerBurstRotation: -24, spawn: 0.64, idleLift: -3, idleTilt: -1.2 },
  { id: 'cushion-11', depth: 'background', sizeScale: 0.82, startX: -0.06, midX: 0.06, glideX: 0.1, exitX: 0.16, midY: 0.18, glideY: 0.4, exitY: 0.9, startRotation: 14, midRotation: 8, glideRotation: 3, exitRotation: -3, footerGatherX: 0.38, footerGatherY: 0.7, footerBurstX: 0.18, footerBurstY: 0.78, footerBurstRotation: -18, spawn: 0.71, idleLift: -2, idleTilt: 1 },
  { id: 'cushion-12', depth: 'midground', sizeScale: 1, startX: 0.66, midX: 0.8, glideX: 0.74, exitX: 0.82, midY: 0.12, glideY: 0.36, exitY: 0.88, startRotation: -10, midRotation: -4, glideRotation: 0, exitRotation: 8, footerGatherX: 0.6, footerGatherY: 0.74, footerBurstX: 0.74, footerBurstY: 0.8, footerBurstRotation: 16, spawn: 0.78, idleLift: -3, idleTilt: 1.3 },
  { id: 'cushion-13', depth: 'foreground', sizeScale: 1.08, startX: 1.1, midX: 0.64, glideX: 0.56, exitX: 0.48, midY: 0.04, glideY: 0.26, exitY: 0.76, startRotation: 20, midRotation: 10, glideRotation: 4, exitRotation: -10, footerGatherX: 0.54, footerGatherY: 0.68, footerBurstX: 0.66, footerBurstY: 0.72, footerBurstRotation: 22, spawn: 0.85, idleLift: -5, idleTilt: 1.1 },
  { id: 'cushion-14', depth: 'background', sizeScale: 0.86, startX: -0.08, midX: 0.3, glideX: 0.42, exitX: 0.54, midY: 0.02, glideY: 0.22, exitY: 0.7, startRotation: -14, midRotation: -6, glideRotation: -1, exitRotation: 7, footerGatherX: 0.5, footerGatherY: 0.66, footerBurstX: 0.58, footerBurstY: 0.7, footerBurstRotation: 14, spawn: 0.92, idleLift: -2, idleTilt: -0.9 },
];

function subscribeHydration() {
  return () => {};
}

function getHydratedSnapshot() {
  return true;
}

function getServerHydratedSnapshot() {
  return false;
}

function getPreparedSpecs(mode: LayoutMode, reduceAnimations: boolean) {
  const visibleCount = reduceAnimations
    ? Math.max(4, VISIBLE_COUNTS[mode] - 3)
    : VISIBLE_COUNTS[mode];

  return CASCADE_SPECS.slice(0, visibleCount).map((spec) => ({
    ...spec,
    width: BASE_WIDTHS[spec.depth] * spec.sizeScale * MODE_SCALES[mode],
  }));
}

function AnimatedCushion({
  spec,
  reduceAnimations,
  setItemRef,
}: {
  spec: ReturnType<typeof getPreparedSpecs>[number];
  reduceAnimations: boolean;
  setItemRef: (id: string) => (node: HTMLDivElement | null) => void;
}) {
  const depthSettings = DEPTH_SETTINGS[spec.depth];

  return (
    <div
      ref={setItemRef(spec.id)}
      className="absolute left-0 top-0 will-change-transform"
      style={{
        width: spec.width,
        height: spec.width,
        zIndex: depthSettings.zIndex,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={
          reduceAnimations
            ? { opacity: 1, scale: 1 }
            : {
                opacity: 1,
                scale: 1,
                y: [0, spec.idleLift, 0],
                rotate: [0, spec.idleTilt, 0],
              }
        }
        transition={
          reduceAnimations
            ? { duration: 0.4, ease: 'easeOut' }
            : {
                duration: 10 + spec.spawn * 5,
                repeat: Infinity,
                ease: 'easeInOut',
              }
        }
        className="relative h-full w-full"
      >
        <div
          className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(166,124,91,0.16),transparent_72%)]"
          style={{
            opacity: spec.depth === 'foreground' ? 0.15 : 0.08,
            transform: 'scale(0.8)',
          }}
        />
        <Image
          src={PRODUCT_SVG_MOTIFS.cushion}
          alt=""
          fill
          unoptimized
          sizes={`${Math.round(spec.width)}px`}
          className={depthSettings.imageClassName}
          style={{ filter: depthSettings.shadow }}
        />
      </motion.div>
    </div>
  );
}

export default function CushionCascade() {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const hasHydrated = useSyncExternalStore(
    subscribeHydration,
    getHydratedSnapshot,
    getServerHydratedSnapshot
  );
  const viewportMode = useViewportMode();
  const { shouldReduceAnimations } = useOptimizePerformance();

  const preparedSpecs = useMemo(
    () => getPreparedSpecs(viewportMode, shouldReduceAnimations),
    [viewportMode, shouldReduceAnimations]
  );

  useGSAP(
    () => {
      if (!hasHydrated || !containerRef.current || !preparedSpecs.length) {
        return;
      }

      const hero = document.querySelector('#hero');
      const footerTrigger = document.querySelector('#site-footer-trigger');
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const preparedNodes = preparedSpecs
        .map((spec) => ({
          spec,
          node: itemRefs.current[spec.id],
          depthSettings: DEPTH_SETTINGS[spec.depth],
        }))
        .filter(
          (
            item
          ): item is {
            spec: ReturnType<typeof getPreparedSpecs>[number];
            node: HTMLDivElement;
            depthSettings: (typeof DEPTH_SETTINGS)[CushionDepth];
          } => Boolean(item.node)
        );

      if (!preparedNodes.length) {
        return;
      }

      if (shouldReduceAnimations) {
        preparedNodes.forEach(({ spec, node, depthSettings }) => {
          const glideX = viewportWidth * spec.glideX - spec.width / 2;
          const glideY = viewportHeight * spec.glideY;

          gsap.set(node, {
            x: glideX,
            y: glideY,
            rotation: spec.glideRotation,
            scale: 0.98,
            opacity: 0,
            force3D: true,
          });

          gsap.to(node, {
            opacity: depthSettings.glideOpacity,
            duration: 0.45,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        });

        if (footerTrigger) {
          ScrollTrigger.create({
            trigger: footerTrigger,
            start: 'top 72%',
            end: 'top 42%',
            markers: false,
            onEnter: () => {
              preparedNodes.forEach(({ node }, index) => {
                gsap.to(node, {
                  opacity: 0,
                  scale: 0.74,
                  duration: 0.38,
                  delay: index * 0.02,
                  ease: 'power2.out',
                  overwrite: 'auto',
                });
              });
            },
            onLeaveBack: () => {
              preparedNodes.forEach(({ node, depthSettings }, index) => {
                gsap.to(node, {
                  opacity: depthSettings.glideOpacity,
                  scale: 0.98,
                  duration: 0.32,
                  delay: index * 0.01,
                  ease: 'power2.out',
                  overwrite: 'auto',
                });
              });
            },
          });
        }

        return;
      }

      const journeyTimeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: hero || document.body,
          start: hero ? 'bottom 88%' : 'top top',
          endTrigger: footerTrigger || undefined,
          end: footerTrigger
            ? 'top 72%'
            : () => ScrollTrigger.maxScroll(window) || viewportHeight * 1.8,
          scrub: true,
          pin: false,
          markers: false,
          invalidateOnRefresh: true,
        },
      });

      const footerTimeline = footerTrigger
        ? gsap.timeline({
            defaults: { ease: 'power2.out' },
            scrollTrigger: {
              trigger: footerTrigger,
              start: 'top 72%',
              end: 'top 38%',
              scrub: true,
              pin: false,
              markers: false,
              invalidateOnRefresh: true,
            },
          })
        : null;

      preparedNodes.forEach(({ spec, node, depthSettings }) => {
        const startX = viewportWidth * spec.startX - spec.width / 2;
        const midX = viewportWidth * spec.midX - spec.width / 2;
        const glideX = viewportWidth * spec.glideX - spec.width / 2;
        const exitX = viewportWidth * spec.exitX - spec.width / 2;
        const startY = -spec.width * (1.25 + spec.spawn * 0.35);
        const midY = viewportHeight * spec.midY;
        const glideY = viewportHeight * spec.glideY;
        const exitY = viewportHeight * spec.exitY;
        const footerGatherX = viewportWidth * spec.footerGatherX - spec.width / 2;
        const footerGatherY = viewportHeight * spec.footerGatherY;
        const footerBurstX = viewportWidth * spec.footerBurstX - spec.width / 2;
        const footerBurstY = viewportHeight * spec.footerBurstY;

        gsap.set(node, {
          x: startX,
          y: startY,
          rotation: spec.startRotation,
          scale: 0.9,
          opacity: 0,
          force3D: true,
          transformOrigin: '50% 50%',
        });

        const introAt = spec.spawn * 0.62;
        const glideAt = 0.92 + spec.spawn * 0.34;
        const exitAt = 2.08 + spec.spawn * 0.42;

        journeyTimeline.to(
          node,
          {
            x: midX,
            y: midY,
            rotation: spec.midRotation,
            scale: 1,
            opacity: depthSettings.introOpacity,
            duration: 0.76,
            ease: spec.depth === 'foreground' ? 'power3.out' : 'sine.out',
          },
          introAt
        );

        journeyTimeline.to(
          node,
          {
            x: glideX,
            y: glideY,
            rotation: spec.glideRotation,
            scale: 0.97,
            opacity: depthSettings.glideOpacity,
            duration: 0.86,
            ease: 'power2.out',
          },
          glideAt
        );

        journeyTimeline.to(
          node,
          {
            x: exitX,
            y: exitY,
            rotation: spec.exitRotation,
            scale: 0.9,
            opacity: depthSettings.travelOpacity,
            duration: 1.18,
            ease: 'sine.out',
          },
          exitAt
        );

        footerTimeline?.to(
          node,
          {
            x: footerGatherX,
            y: footerGatherY,
            rotation: spec.glideRotation * 0.5,
            scale: 1.08,
            opacity: depthSettings.footerOpacity,
            duration: 0.36,
            ease: 'power2.out',
          },
          spec.spawn * 0.2
        );

        footerTimeline?.to(
          node,
          {
            x: footerBurstX,
            y: footerBurstY,
            rotation: spec.footerBurstRotation,
            scale: 0.48,
            opacity: 0,
            duration: 0.76,
            ease: 'expo.out',
          },
          0.22 + spec.spawn * 0.18
        );
      });
    },
    {
      scope: containerRef,
      dependencies: [hasHydrated, preparedSpecs, shouldReduceAnimations],
    }
  );

  const setItemRef = (id: string) => (node: HTMLDivElement | null) => {
    itemRefs.current[id] = node;
  };

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[18] overflow-hidden"
      style={{
        maskImage:
          'linear-gradient(180deg, transparent 0%, black 16%, black 88%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(180deg, transparent 0%, black 16%, black 88%, transparent 100%)',
      }}
    >
      {preparedSpecs.map((spec) => (
        <AnimatedCushion
          key={spec.id}
          spec={spec}
          reduceAnimations={shouldReduceAnimations}
          setItemRef={setItemRef}
        />
      ))}
    </div>
  );
}
