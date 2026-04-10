'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';

const ModelViewer = dynamic(() => import('@/components/canvas/ModelViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-[1.6rem] bg-transparent">
      <div className="h-16 w-16 rounded-full border-4 border-theme-bronze/20 border-t-theme-bronze animate-spin" />
    </div>
  ),
});

export default function Model3DViewer({ id, data, reverseLayout = false, surfaceClassName = 'bg-transparent' }) {
  const [shouldLoadModel, setShouldLoadModel] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);

  if (!data?.imageUrl && !data?.modelPath) return null;

  return (
    <section
      id={id}
      className={`scroll-mt-36 py-12 md:scroll-mt-40 md:py-16 ${surfaceClassName}`}
    >
      <div
        className={`mx-auto w-full max-w-[1400px] px-6 md:px-12`}
        style={{ perspective: 1000 }}
      >

        <div className={`grid gap-6 lg:grid-cols-[1.4fr_1fr] ${reverseLayout ? 'lg:[&>*:first-child]:order-2' : ''}`}>


          <motion.div
            whileHover={{ y: -4, rotateX: 1, rotateY: reverseLayout ? -1 : 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            // Dark brown/grey gradient background exactly like the screenshot
            className="relative flex min-h-[400px] lg:min-h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#3a2a22] to-[#201712] p-6 shadow-2xl"
          >

            {data.eyebrow ? (
              <div className="absolute left-6 top-6 z-20 rounded-full border border-white/20 bg-black/30 px-4 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-white backdrop-blur-md">
                {data.eyebrow}
              </div>
            ) : null}


            {data.imageUrl && (
              <Image
                src={data.imageUrl}
                alt={`${data.name} preview`}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className={`object-contain p-10 transition-opacity duration-700 ease-in-out ${modelLoaded ? 'opacity-0' : 'opacity-100'}`}
              />
            )}


            {!shouldLoadModel && data.modelPath ? (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/10 backdrop-blur-[2px]">
                <motion.button
                  type="button"
                  onClick={() => setShouldLoadModel(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-full border border-white/30 bg-black/60 px-8 py-3.5 text-xs font-bold uppercase tracking-[0.28em] text-white shadow-xl backdrop-blur-md transition-colors hover:bg-theme-bronze"
                >
                  Load 3D View
                </motion.button>
              </div>
            ) : null}


            {shouldLoadModel && data.modelPath ? (
              <div className="absolute inset-0 z-10">
                <ModelViewer glbPath={data.modelPath} onLoaded={() => setModelLoaded(true)} />
              </div>
            ) : null}


            <AnimatePresence>
              {shouldLoadModel && data.modelPath && !modelLoaded ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 backdrop-blur-sm"
                >
                  <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-black/50 px-8 py-6 text-center shadow-2xl backdrop-blur-md">
                    <div className="h-10 w-10 rounded-full border-4 border-white/20 border-t-white animate-spin" />
                    <p className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-white/90">Loading 3D</p>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>


          <div className="flex flex-col justify-center gap-5">


            <motion.div
              whileHover={{ y: -2 }}
              className="rounded-[1.8rem] border border-white/10 bg-[#2d211a]/40 p-8 shadow-lg backdrop-blur-md"
            >
              <h3 className="text-[0.7rem] font-bold uppercase tracking-[0.3em] text-white/90">3D View</h3>
              <p className="mt-4 text-sm leading-relaxed text-white/70">
                Tap the model to load the live 3D experience, then continue through the product details below.
              </p>
            </motion.div>


            <div className="grid gap-5 sm:grid-cols-2">


              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                className="flex flex-col justify-center rounded-[1.8rem] bg-white p-8 shadow-xl"
              >
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-theme-walnut/60">Starting At</p>
                <p className="mt-3 font-display text-4xl text-[#4a3525]">
                  Rs. {data.price.toLocaleString('en-IN')}
                </p>
              </motion.div>


              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                className="flex flex-col justify-between rounded-[1.8rem] border border-white/10 bg-[#2d211a]/40 p-7 shadow-lg backdrop-blur-md"
              >
                <div>
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-[#d49f6a]">Consultation Flow</p>
                  <p className="mt-3 text-[0.8rem] leading-relaxed text-white/70">
                    Speak with the studio for finish direction, room planning, and order guidance.
                  </p>
                </div>

                <div className="mt-6">
                  <Link
                    href="/contact"
                    className="inline-block w-full rounded-full bg-white px-5 py-3 text-center text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#3a2a22] transition-colors duration-300 hover:bg-[#d49f6a] hover:text-white"
                  >
                    Book Consultation
                  </Link>
                </div>
              </motion.div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
