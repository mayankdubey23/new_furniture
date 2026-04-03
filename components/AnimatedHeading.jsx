'use client';

import { motion } from 'framer-motion';

export default function AnimatedHeading({
  as: Tag = 'h2',
  lines = undefined,
  children,
  className = '',
  lineClassName = '',
  once = true,
  amount = 0.35,
  stagger = 0.08,
}) {
  const textLines = Array.isArray(lines)
    ? lines
    : String(children ?? '')
        .split('\n')
        .filter(Boolean);

  return (
    <motion.div
      whileHover={{ y: -2, rotateX: -2, rotateY: 2 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      style={{ transformStyle: 'preserve-3d' }}
      className={className}
    >
      <Tag>
        {textLines.map((line, index) => (
          <motion.div
            key={`${line}-${index}`}
            initial={{
              opacity: 0,
              x: index % 4 === 0 ? -40 : index % 4 === 1 ? 40 : index % 4 === 2 ? -22 : 22,
              y: index % 2 === 0 ? 18 : -18,
              rotateX: index % 2 === 0 ? -24 : 24,
              rotateY: index % 2 === 0 ? -18 : 18,
              skewX: index % 2 === 0 ? -6 : 6,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
              y: 0,
              rotateX: 0,
              rotateY: 0,
              skewX: 0,
            }}
            viewport={{ once, amount }}
            transition={{ duration: 0.65, ease: 'easeOut', delay: index * stagger }}
            whileHover={{ x: 8, rotateY: 10, skewX: -3 }}
            className={`origin-left [transform-style:preserve-3d] ${lineClassName}`}
          >
            <span className="inline-block">{line}</span>
          </motion.div>
        ))}
      </Tag>
    </motion.div>
  );
}
