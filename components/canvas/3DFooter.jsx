'use client';

import Image from 'next/image';
import { PRODUCT_SVG_MOTIFS } from '@/lib/productSvgMotifs';

const FOOTER_GRAPHICS = [
  {
    key: 'sofa',
    src: PRODUCT_SVG_MOTIFS.sofa,
    className:
      'absolute left-1/2 top-12 h-[14rem] w-[19rem] -translate-x-1/2 opacity-[0.17] sm:h-[16rem] sm:w-[24rem] md:top-10 md:h-[20rem] md:w-[30rem] lg:top-8 lg:h-[24rem] lg:w-[38rem]',
    imageClassName:
      'object-contain rotate-[-4deg] saturate-[0.82] [filter:drop-shadow(0_18px_40px_rgba(0,0,0,0.28))]',
    glowClassName:
      'absolute inset-[14%] rounded-full bg-[radial-gradient(circle,rgba(199,140,92,0.24),transparent_72%)]',
    sizes: '(min-width: 1280px) 38rem, (min-width: 768px) 30rem, 24rem',
  },
  {
    key: 'chair',
    src: PRODUCT_SVG_MOTIFS.chair,
    className:
      'absolute left-[-3.5rem] top-[12rem] hidden h-[14rem] w-[14rem] opacity-[0.14] md:block lg:left-[1%] lg:top-[10.5rem] lg:h-[20rem] lg:w-[20rem]',
    imageClassName:
      'object-contain -rotate-[10deg] saturate-[0.9] [filter:drop-shadow(0_16px_34px_rgba(0,0,0,0.22))]',
    glowClassName:
      'absolute inset-[14%] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.12),transparent_70%)]',
    sizes: '(min-width: 1024px) 20rem, 14rem',
  },
  {
    key: 'recliner',
    src: PRODUCT_SVG_MOTIFS.recliner,
    className:
      'absolute right-[-2.5rem] top-[12rem] hidden h-[13rem] w-[13rem] opacity-[0.15] md:block lg:right-[3%] lg:top-[11rem] lg:h-[17rem] lg:w-[17rem]',
    imageClassName:
      'object-contain rotate-[8deg] saturate-[0.88] [filter:drop-shadow(0_16px_34px_rgba(0,0,0,0.22))]',
    glowClassName:
      'absolute inset-[14%] rounded-full bg-[radial-gradient(circle,rgba(221,208,189,0.18),transparent_70%)]',
    sizes: '(min-width: 1024px) 17rem, 13rem',
  },
  {
    key: 'pouffe',
    src: PRODUCT_SVG_MOTIFS.pouffe,
    className:
      'absolute bottom-[5.5rem] right-[12%] h-[7rem] w-[7rem] opacity-[0.18] sm:h-[8rem] sm:w-[8rem] md:bottom-[6rem] md:right-[16%] md:h-[10rem] md:w-[10rem] lg:h-[12rem] lg:w-[12rem]',
    imageClassName:
      'object-contain rotate-[-8deg] saturate-[0.9] [filter:drop-shadow(0_18px_36px_rgba(0,0,0,0.24))]',
    glowClassName:
      'absolute inset-[12%] rounded-full bg-[radial-gradient(circle,rgba(199,140,92,0.2),transparent_72%)]',
    sizes: '(min-width: 1024px) 12rem, (min-width: 768px) 10rem, 8rem',
  },
  {
    key: 'cushion',
    src: PRODUCT_SVG_MOTIFS.cushion,
    className:
      'absolute bottom-[7rem] left-[10%] h-[6rem] w-[6rem] opacity-[0.16] sm:h-[7rem] sm:w-[7rem] md:bottom-[8rem] md:h-[8rem] md:w-[8rem] lg:left-[14%] lg:h-[10rem] lg:w-[10rem]',
    imageClassName:
      'object-contain -rotate-[14deg] saturate-[0.86] [filter:drop-shadow(0_18px_30px_rgba(0,0,0,0.2))]',
    glowClassName:
      'absolute inset-[12%] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.14),transparent_72%)]',
    sizes: '(min-width: 1024px) 10rem, (min-width: 768px) 8rem, 7rem',
  },
];

export default function ThreeFooter({ isDark = true }) {
  const imageToneClassName = isDark
    ? 'brightness-[1.04] contrast-[1.02]'
    : 'brightness-[0.9] contrast-[0.96]';

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-x-[8%] top-8 h-48 rounded-full bg-[radial-gradient(circle,rgba(199,140,92,0.12),transparent_72%)] blur-3xl" />

      {FOOTER_GRAPHICS.map((graphic) => (
        <div key={graphic.key} className={graphic.className}>
          <div className={graphic.glowClassName} />
          <Image
            src={graphic.src}
            alt=""
            fill
            unoptimized
            sizes={graphic.sizes}
            className={`${graphic.imageClassName} ${imageToneClassName}`}
          />
        </div>
      ))}
    </div>
  );
}
