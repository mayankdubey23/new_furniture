'use client';

import { motion } from 'framer-motion';

const features = [
  {
    number: '01',
    title: 'Curated Collections',
    description: 'Signature sofas, chairs, recliners, and pouffes composed like a private interior edit.',
  },
  {
    number: '02',
    title: 'Bespoke Guidance',
    description: 'Finish suggestions, color direction, and layout support shaped around your room.',
  },
  {
    number: '03',
    title: 'White-Glove Delivery',
    description: 'Premium logistics and setup so every piece arrives with the same care it was designed with.',
  },
];

export default function FeaturesBanner() {
  return (
    <section className="py-12 md:py-16">
      <div className="w-full px-0">
        <div className="grid gap-6 xl:grid-cols-[0.86fr_1.14fr]">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative overflow-hidden rounded-[2.2rem] border border-theme-line/70 bg-theme-ink px-7 py-8 text-theme-ivory shadow-[0_24px_80px_rgba(26,22,19,0.24)] md:px-9 md:py-10"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(199,140,92,0.26),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(102,114,95,0.18),transparent_24%)]" />
            <motion.div
              className="pointer-events-none absolute right-8 top-8 h-28 w-28 rounded-full border border-white/12"
              animate={{ rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
            />

            <div className="relative z-10">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.42em] text-theme-sand/80">Luxe System</p>
              <h2 className="mt-4 max-w-md font-display text-[2.3rem] leading-[0.95] text-theme-ivory md:text-[3.3rem]">
                One furniture studio for every room.
              </h2>
              <p className="mt-5 max-w-lg text-sm leading-7 text-theme-ivory/72 md:text-base">
                A cleaner, more app-like flow inspired by modern premium product sites, adapted to your furniture world and your existing
                visual palette.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {['Sofas', 'Chairs', 'Recliners', 'Pouffes', 'Customization'].map((item) => (
                  <motion.span
                    key={item}
                    whileHover={{ y: -3, scale: 1.03 }}
                    className="rounded-full border border-white/14 bg-white/8 px-4 py-2 text-[0.64rem] font-semibold uppercase tracking-[0.3em] text-theme-ivory/84 backdrop-blur-sm"
                  >
                    {item}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.22 }}
                transition={{ duration: 0.55, delay: index * 0.08, ease: 'easeOut' }}
                whileHover={{ y: -10, rotateX: 4, rotateY: index % 2 === 0 ? -5 : 5, scale: 1.01 }}
                style={{ transformStyle: 'preserve-3d' }}
                className="group relative overflow-hidden rounded-[1.9rem] border border-theme-bronze/12 bg-[linear-gradient(145deg,rgba(255,255,255,0.84),rgba(248,241,232,0.68))] p-6 shadow-[0_20px_48px_rgba(49,30,21,0.07)] dark:bg-[linear-gradient(145deg,rgba(50,39,33,0.46),rgba(24,18,15,0.72))]"
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(165,106,63,0.12),transparent_34%)]" />
                <div className="pointer-events-none absolute -right-8 bottom-0 h-24 w-24 rounded-full bg-theme-bronze/10 blur-[40px] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative z-10 flex h-full flex-col justify-between gap-8">
                  <div className="flex items-center justify-between">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-theme-bronze">{feature.number}</p>
                    <div className="h-10 w-10 rounded-2xl border border-theme-bronze/16 bg-white/62 dark:bg-white/6" />
                  </div>
                  <div>
                    <h3 className="font-display text-[1.9rem] leading-none text-theme-ink dark:text-theme-ivory">{feature.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-theme-walnut/72 dark:text-theme-ink/66">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
