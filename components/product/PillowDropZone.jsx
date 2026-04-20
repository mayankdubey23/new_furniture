'use client';

import { useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Matter from 'matter-js';
import { getColoredCushionSvgMotif } from '@/lib/productSvgMotifs';

const PILLOW_PRESETS = [
  { radius: 55, glow: '#0f5b66', tint: '#158091', label: 'Velvet' },
  { radius: 48, glow: '#a56a3f', tint: '#c68b5d', label: 'Bronze' },
  { radius: 52, glow: '#d8c8b4', tint: '#f1e7da', label: 'Ivory' },
  { radius: 45, glow: '#56634f', tint: '#78876f', label: 'Olive' },
  { radius: 60, glow: '#4a3429', tint: '#725141', label: 'Walnut' },
  { radius: 50, glow: '#8c6450', tint: '#b98a70', label: 'Clay' },
  { radius: 54, glow: '#0e5a5a', tint: '#189193', label: 'Teal' },
  { radius: 46, glow: '#7f5f50', tint: '#b68b76', label: 'Rose' },
  { radius: 50, glow: '#6d7462', tint: '#8e9a7e', label: 'Sage' },
  { radius: 56, glow: '#9f6d46', tint: '#c89062', label: 'Caramel' },
  { radius: 48, glow: '#d9ccb8', tint: '#f6eee2', label: 'Pearl' },
  { radius: 58, glow: '#31483d', tint: '#57705f', label: 'Moss' },
];

function seededUnit(index, salt = 1) {
  const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

export default function PillowDropZone({
  title = 'Comfort Motion',
  subtitle = 'Drag the cushions around the stage.',
  totalPillows = 18,
  height = 360,
}) {
  const containerRef = useRef(null);
  const pillowNodesRef = useRef([]);

  const activePillows = useMemo(() => {
    return Array.from({ length: totalPillows }).map((_, index) => {
      const preset = PILLOW_PRESETS[index % PILLOW_PRESETS.length];

      return {
        ...preset,
        id: `pillow-instance-${index}`,
        radius: preset.radius * (0.85 + seededUnit(index, 1) * 0.3),
        svgSrc: getColoredCushionSvgMotif(preset.label),
      };
    });
  }, [totalPillows]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const engine = Matter.Engine.create();
    const world = engine.world;

    const width = container.clientWidth;
    const stageHeight = height;

    const wallOptions = { isStatic: true, render: { visible: false } };
    const ground = Matter.Bodies.rectangle(
      width / 2,
      stageHeight + 50,
      width + 200,
      100,
      wallOptions,
    );
    const leftWall = Matter.Bodies.rectangle(-50, stageHeight / 2, 100, stageHeight * 2, wallOptions);
    const rightWall = Matter.Bodies.rectangle(
      width + 50,
      stageHeight / 2,
      100,
      stageHeight * 2,
      wallOptions,
    );

    Matter.World.add(world, [ground, leftWall, rightWall]);

    const pillowBodies = activePillows.map((pillow, index) => {
      const startX = seededUnit(index, 2) * (width - pillow.radius * 2) + pillow.radius;
      const startY = -100 - index * 70;

      return Matter.Bodies.circle(startX, startY, pillow.radius, {
        restitution: 0.6,
        friction: 0.05,
        frictionAir: 0.01,
        density: 0.04,
        angle: seededUnit(index, 3) * Math.PI * 2,
        render: { visible: false },
      });
    });

    Matter.World.add(world, pillowBodies);

    const mouse = Matter.Mouse.create(container);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false },
      },
    });
    Matter.World.add(world, mouseConstraint);

    Matter.Events.on(engine, 'afterUpdate', () => {
      pillowBodies.forEach((body, index) => {
        const domElement = pillowNodesRef.current[index];
        if (!domElement) return;

        const x = body.position.x - activePillows[index].radius;
        const y = body.position.y - activePillows[index].radius;
        domElement.style.transform = `translate(${x}px, ${y}px) rotate(${body.angle}rad)`;
      });
    });

    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    const handleResize = () => {
      const newWidth = container.clientWidth;
      Matter.Body.setPosition(ground, { x: newWidth / 2, y: stageHeight + 50 });
      Matter.Body.setVertices(
        ground,
        Matter.Bodies.rectangle(newWidth / 2, stageHeight + 50, newWidth + 200, 100).vertices,
      );
      Matter.Body.setPosition(rightWall, { x: newWidth + 50, y: stageHeight / 2 });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
      Matter.World.clear(world, false);
    };
  }, [activePillows, height]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-[1.9rem] border border-theme-bronze/14 bg-[linear-gradient(165deg,rgba(255,255,255,0.72),rgba(248,241,232,0.7))] p-5 shadow-[0_22px_52px_rgba(49,30,21,0.08)] dark:bg-[linear-gradient(165deg,rgba(50,39,33,0.46),rgba(24,18,15,0.74))]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(165,106,63,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(102,114,95,0.08),transparent_24%)]" />
      <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.34em] text-theme-bronze">
            Interactive Comfort Field
          </p>
          <h4 className="mt-3 font-display text-3xl leading-none text-theme-ink dark:text-theme-ivory">
            {title}
          </h4>
          <p className="mt-3 max-w-xl text-sm leading-7 text-theme-walnut/72 dark:text-theme-ink/66">
            {subtitle}
          </p>
        </div>
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-theme-walnut/50 dark:text-theme-ink/48">
          Drag pillows - Drop - Throw
        </p>
      </div>

      <div
        ref={containerRef}
        className="relative mt-5 overflow-hidden rounded-[1.7rem] border border-theme-line/80 bg-[linear-gradient(180deg,rgba(251,247,241,0.3),rgba(238,228,216,0.56))] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] dark:bg-[linear-gradient(180deg,rgba(38,29,24,0.72),rgba(27,21,18,0.88))]"
        style={{ height, cursor: 'grab', touchAction: 'none' }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.46),transparent_36%),linear-gradient(180deg,transparent_0%,rgba(49,30,21,0.06)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,transparent,rgba(79,53,40,0.12))]" />
        <div className="pointer-events-none absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(165,106,63,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(165,106,63,0.06)_1px,transparent_1px)] [background-size:42px_42px]" />

        {activePillows.map((pillow, index) => (
          <div
            key={pillow.id}
            ref={(element) => {
              pillowNodesRef.current[index] = element;
            }}
            className="pointer-events-none absolute left-0 top-0 select-none will-change-transform"
            style={{
              width: pillow.radius * 2,
              height: pillow.radius * 2,
            }}
          >
            <div
              className="absolute inset-[8%] rounded-full blur-2xl"
              style={{
                background: `radial-gradient(circle, ${pillow.tint}aa 0%, ${pillow.glow}2b 48%, transparent 78%)`,
              }}
            />
            <div className="relative h-full w-full">
              <div className="absolute inset-[7%] rounded-full border border-white/26 bg-white/10 shadow-[0_26px_34px_rgba(49,30,21,0.2)] backdrop-blur-[1px]" />
              <div className="pointer-events-none absolute inset-x-[18%] top-[12%] h-[15%] rounded-full bg-white/35 blur-[8px]" />
              <Image
                src={pillow.svgSrc}
                alt=""
                fill
                unoptimized
                draggable={false}
                sizes="(max-width: 768px) 100px, 128px"
                className="object-contain drop-shadow-[0_18px_22px_rgba(49,30,21,0.28)]"
              />
              <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-white/20 bg-[rgba(39,26,20,0.6)] px-2.5 py-1 text-[0.52rem] font-semibold uppercase tracking-[0.18em] text-theme-ivory/88 backdrop-blur-sm">
                {pillow.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
