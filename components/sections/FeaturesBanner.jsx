'use client';

import { motion } from 'framer-motion';

export default function FeaturesBanner() {
  const features = [
    'Designer-Curated Collections',
    'Bespoke Finish Guidance',
    'Nationwide White-Glove Delivery',
    'Premium Warranty Coverage',
    'Crafted for Long-Life Comfort',
    'Private Styling Consultations',
  ];

  return (
    <div className="border-y border-theme-line bg-theme-ink py-4 text-theme-ivory shadow-[0_16px_60px_rgba(26,22,19,0.18)]">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: [0, -1200] }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: 28,
            ease: 'linear',
          },
        }}
      >
        {[...features, ...features, ...features].map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="mx-6 inline-flex items-center gap-6 text-xs font-semibold uppercase tracking-[0.35em] text-theme-ivory/88 md:text-sm"
          >
            <span>{item}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-theme-bronze" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}
