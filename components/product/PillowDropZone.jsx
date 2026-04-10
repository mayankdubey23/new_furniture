'use client';

import { useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import Matter from 'matter-js';


const PILLOW_PRESETS = [
  { radius: 55, colorA: '#0f5b66', colorB: '#158091', seam: '#e7d6c0', label: 'Velvet' },
  { radius: 48, colorA: '#a56a3f', colorB: '#c68b5d', seam: '#f0deca', label: 'Bronze' },
  { radius: 52, colorA: '#d8c8b4', colorB: '#f1e7da', seam: '#8f5f3d', label: 'Ivory' },
  { radius: 45, colorA: '#56634f', colorB: '#78876f', seam: '#ebe0d0', label: 'Olive' },
  { radius: 60, colorA: '#4a3429', colorB: '#725141', seam: '#e8d8c5', label: 'Walnut' },
  { radius: 50, colorA: '#8c6450', colorB: '#b98a70', seam: '#f4e7d9', label: 'Clay' },
  { radius: 54, colorA: '#0e5a5a', colorB: '#189193', seam: '#efe1d1', label: 'Teal' },
  { radius: 46, colorA: '#7f5f50', colorB: '#b68b76', seam: '#f1e4d7', label: 'Rose' },
  { radius: 50, colorA: '#6d7462', colorB: '#8e9a7e', seam: '#f0e4d6', label: 'Sage' },
  { radius: 56, colorA: '#9f6d46', colorB: '#c89062', seam: '#f7eadf', label: 'Caramel' },
  { radius: 48, colorA: '#d9ccb8', colorB: '#f6eee2', seam: '#a16e4a', label: 'Pearl' },
  { radius: 58, colorA: '#31483d', colorB: '#57705f', seam: '#efe2d3', label: 'Moss' },
];


const TOTAL_PILLOWS = 28;

function seededUnit(index, salt = 1) {
  const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

export default function PillowDropZone({ title = 'Comfort Motion', subtitle = 'Drag the cushions around the stage.' }) {
  const containerRef = useRef(null);
  const pillowNodesRef = useRef([]);
  const engineRef = useRef(null);


  const activePillows = useMemo(() => {
    return Array.from({ length: TOTAL_PILLOWS }).map((_, index) => {
      const preset = PILLOW_PRESETS[index % PILLOW_PRESETS.length];
      return {
        ...preset,
        id: `pillow-instance-${index}`,
        radius: preset.radius * (0.85 + seededUnit(index, 1) * 0.3),
      };
    });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Setup Matter.js Engine
    const engine = Matter.Engine.create();
    const world = engine.world;
    engineRef.current = engine;

    const width = container.clientWidth;
    const height = 420;

    // 2. Create Boundaries
    const wallOptions = { isStatic: true, render: { visible: false } };
    const ground = Matter.Bodies.rectangle(width / 2, height + 50, width + 200, 100, wallOptions);
    const leftWall = Matter.Bodies.rectangle(-50, height / 2, 100, height * 2, wallOptions);
    const rightWall = Matter.Bodies.rectangle(width + 50, height / 2, 100, height * 2, wallOptions);

    Matter.World.add(world, [ground, leftWall, rightWall]);

    // 3. Create Pillow Bodies
    const pillowBodies = activePillows.map((pillow, index) => {
      const startX = seededUnit(index, 2) * (width - pillow.radius * 2) + pillow.radius;
      // Stagger the drops so they rain down nicely instead of all at once
      const startY = -100 - (index * 70);

      return Matter.Bodies.circle(startX, startY, pillow.radius, {
        restitution: 0.6, // Bounciness
        friction: 0.05,
        frictionAir: 0.01,
        density: 0.04,
        angle: seededUnit(index, 3) * Math.PI * 2,
        render: { visible: false }
      });
    });

    Matter.World.add(world, pillowBodies);

    // 4. Mouse Interaction
    const mouse = Matter.Mouse.create(container);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false }
      }
    });
    Matter.World.add(world, mouseConstraint);

    // Sync bodies to DOM
    Matter.Events.on(engine, 'afterUpdate', () => {
      pillowBodies.forEach((body, i) => {
        const domElement = pillowNodesRef.current[i];
        if (domElement) {
          const x = body.position.x - activePillows[i].radius;
          const y = body.position.y - activePillows[i].radius;
          domElement.style.transform = `translate(${x}px, ${y}px) rotate(${body.angle}rad)`;
        }
      });
    });

    // 5. Run it
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    // 6. Handle Resize
    const handleResize = () => {
      const newWidth = container.clientWidth;
      Matter.Body.setPosition(ground, { x: newWidth / 2, y: height + 50 });
      Matter.Body.setVertices(ground, Matter.Bodies.rectangle(newWidth / 2, height + 50, newWidth + 200, 100).vertices);
      Matter.Body.setPosition(rightWall, { x: newWidth + 50, y: height / 2 });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
      Matter.World.clear(world, false);
    };
  }, [activePillows]);

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
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.34em] text-theme-bronze">Interactive Comfort Field</p>
          <h4 className="mt-3 font-display text-3xl leading-none text-theme-ink dark:text-theme-ivory">{title}</h4>
          <p className="mt-3 max-w-xl text-sm leading-7 text-theme-walnut/72 dark:text-theme-ink/66">{subtitle}</p>
        </div>
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-theme-walnut/50 dark:text-theme-ink/48">
          Drag pillows • Drop • Throw
        </p>
      </div>

      <div
        ref={containerRef}
        className="relative mt-5 h-[420px] overflow-hidden rounded-[1.7rem] border border-theme-line/80 bg-[linear-gradient(180deg,rgba(251,247,241,0.3),rgba(238,228,216,0.56))] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] dark:bg-[linear-gradient(180deg,rgba(38,29,24,0.72),rgba(27,21,18,0.88))]"
        style={{ cursor: 'grab', touchAction: 'none' }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.46),transparent_36%),linear-gradient(180deg,transparent_0%,rgba(49,30,21,0.06)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,transparent,rgba(79,53,40,0.12))]" />
        <div className="pointer-events-none absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(165,106,63,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(165,106,63,0.06)_1px,transparent_1px)] [background-size:42px_42px]" />

        {activePillows.map((pillow, index) => (
          <div
            key={pillow.id}
            ref={(el) => (pillowNodesRef.current[index] = el)}
            className="absolute left-0 top-0 select-none will-change-transform"
            style={{
              width: pillow.radius * 2,
              height: pillow.radius * 2,
            }}
          >
            <div
              className="relative h-full w-full rounded-full border border-white/28 shadow-[0_24px_34px_rgba(49,30,21,0.2)]"
              style={{
                background: `radial-gradient(circle at 30% 24%, rgba(255,255,255,0.38), transparent 28%), radial-gradient(circle at 68% 70%, rgba(0,0,0,0.12), transparent 34%), linear-gradient(145deg, ${pillow.colorA}, ${pillow.colorB})`,
              }}
            >
              <div
                className="absolute inset-[12%] rounded-full border"
                style={{ borderColor: `${pillow.seam}88` }}
              />
              <div className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40 bg-black/10 shadow-[0_0_0_2px_rgba(255,255,255,0.12)]" />
              <div className="pointer-events-none absolute inset-x-[18%] top-[18%] h-[18%] rounded-full bg-white/12 blur-[6px]" />
              <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/12 px-3 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.22em] text-white/82">
                {pillow.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
