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
      whileHover={{ y: -2 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={className}
    >
      <Tag>
        {textLines.map((line, index) => (
          <motion.div
            key={`${line}-${index}`}
            initial={{ opacity: 0, y: index % 2 === 0 ? 18 : -18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once, amount }}
            transition={{ duration: 0.55, ease: 'easeOut', delay: index * stagger }}
            className={`origin-left ${lineClassName}`}
          >
            <span className="inline-block">{line}</span>
          </motion.div>
        ))}
      </Tag>
    </motion.div>
  );
}
