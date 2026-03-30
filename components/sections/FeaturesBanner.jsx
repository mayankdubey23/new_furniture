'use client';
import { motion } from 'framer-motion';

export default function FeaturesBanner() {
  const features = [
    "Premium Sustainable Materials", "•",
    "10-Year Warranty", "•",
    "Free Nationwide Shipping", "•",
    "Award-Winning Designs", "•",
    "Easy EMI Options", "•"
  ];

  return (
    <div className="bg-theme-forest py-4 overflow-hidden flex items-center shadow-inner">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: [0, -1000] }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 25,
            ease: "linear",
          },
        }}
      >
        {/* Array ko 3 baar repeat kiya hai taaki loop smooth chalte rahe */}
        {[...features, ...features, ...features].map((text, index) => (
          <span 
            key={index} 
            className={`text-theme-beige text-lg font-semibold uppercase tracking-widest mx-6 ${text === '•' ? 'opacity-50' : ''}`}
          >
            {text}
          </span>
        ))}
      </motion.div>
    </div>
  );
}