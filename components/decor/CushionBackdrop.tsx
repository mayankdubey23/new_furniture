import Image from 'next/image';
import { PRODUCT_SVG_MOTIFS } from '@/lib/productSvgMotifs';

type CushionBackdropVariant = 'hero' | 'home' | 'auth';

interface CushionLayer {
  src: string;
  className: string;
  imageClassName: string;
  glowClassName: string;
  motionClassName: string;
  sizes: string;
  priority?: boolean;
}

const layersByVariant: Record<CushionBackdropVariant, CushionLayer[]> = {
  hero: [
    {
      src: PRODUCT_SVG_MOTIFS.cushion,
      className:
        'absolute right-[-6rem] top-[7rem] hidden h-[18rem] w-[18rem] opacity-[0.16] sm:block md:right-[-4rem] md:top-[8rem] md:h-[28rem] md:w-[28rem] lg:right-[2%] lg:top-[12rem] lg:h-[34rem] lg:w-[34rem]',
      imageClassName: 'object-contain brightness-[1.18] saturate-[0.84]',
      glowClassName:
        'bg-[radial-gradient(circle,rgba(165,106,63,0.16),transparent_70%)]',
      motionClassName: 'cushion-drift-slow',
      sizes: '(min-width: 1024px) 34rem, (min-width: 768px) 28rem, 18rem',
      priority: true,
    },
    {
      src: PRODUCT_SVG_MOTIFS.cushion,
      className:
        'absolute bottom-[6rem] left-[-7rem] hidden h-[14rem] w-[14rem] opacity-[0.1] md:block lg:left-[4%] lg:h-[18rem] lg:w-[18rem]',
      imageClassName: 'object-contain brightness-[1.08] saturate-[0.82]',
      glowClassName:
        'bg-[radial-gradient(circle,rgba(102,114,95,0.12),transparent_72%)]',
      motionClassName: 'cushion-drift-reverse',
      sizes: '(min-width: 1024px) 18rem, 14rem',
    },
  ],
  home: [
    {
      src: PRODUCT_SVG_MOTIFS.sofa,
      className:
        'absolute right-[-10rem] top-[calc(100svh+3rem)] hidden h-[22rem] w-[22rem] opacity-[0.08] md:block lg:right-[-6rem] lg:h-[30rem] lg:w-[30rem]',
      imageClassName: 'object-contain mix-blend-multiply saturate-[0.84] rotate-[10deg]',
      glowClassName:
        'bg-[radial-gradient(circle,rgba(165,106,63,0.14),transparent_72%)]',
      motionClassName: 'cushion-drift-slow',
      sizes: '(min-width: 1024px) 30rem, 22rem',
    },
    {
      src: PRODUCT_SVG_MOTIFS.chair,
      className:
        'absolute left-[-7rem] top-[28%] hidden h-[18rem] w-[18rem] opacity-[0.08] lg:block xl:left-[-5rem] xl:h-[22rem] xl:w-[22rem]',
      imageClassName: 'object-contain mix-blend-multiply saturate-[0.82] -rotate-[8deg]',
      glowClassName:
        'bg-[radial-gradient(circle,rgba(102,114,95,0.1),transparent_72%)]',
      motionClassName: 'cushion-drift-delayed',
      sizes: '22rem',
    },
    {
      src: PRODUCT_SVG_MOTIFS.recliner,
      className:
        'absolute right-[-4rem] top-[56%] hidden h-[18rem] w-[18rem] opacity-[0.08] xl:block xl:right-[2%] xl:h-[24rem] xl:w-[24rem]',
      imageClassName: 'object-contain mix-blend-multiply saturate-[0.86] rotate-[6deg]',
      glowClassName:
        'bg-[radial-gradient(circle,rgba(221,208,189,0.22),transparent_72%)]',
      motionClassName: 'cushion-drift-reverse',
      sizes: '(min-width: 1280px) 24rem, 18rem',
    },
    {
      src: PRODUCT_SVG_MOTIFS.pouffe,
      className:
        'absolute left-[6%] bottom-[14%] hidden h-[12rem] w-[12rem] opacity-[0.08] md:block lg:h-[15rem] lg:w-[15rem]',
      imageClassName: 'object-contain mix-blend-multiply saturate-[0.9]',
      glowClassName:
        'bg-[radial-gradient(circle,rgba(165,106,63,0.12),transparent_72%)]',
      motionClassName: 'cushion-drift-reverse',
      sizes: '(min-width: 1024px) 15rem, 12rem',
    },
    {
      src: PRODUCT_SVG_MOTIFS.cushion,
      className:
        'absolute bottom-[7%] right-[18%] hidden h-[14rem] w-[14rem] opacity-[0.08] lg:block xl:h-[18rem] xl:w-[18rem]',
      imageClassName: 'object-contain mix-blend-multiply saturate-[0.92] -rotate-[12deg]',
      glowClassName:
        'bg-[radial-gradient(circle,rgba(221,208,189,0.24),transparent_72%)]',
      motionClassName: 'cushion-drift-delayed',
      sizes: '(min-width: 1280px) 18rem, 14rem',
    },
  ],
  auth: [
    {
      src: PRODUCT_SVG_MOTIFS.cushion,
      className:
        'absolute right-[-8rem] top-[-2rem] h-[18rem] w-[18rem] opacity-[0.14] sm:right-[-6rem] sm:top-4 sm:h-[22rem] sm:w-[22rem] lg:h-[24rem] lg:w-[24rem]',
      imageClassName: 'object-contain mix-blend-multiply saturate-[0.88]',
      glowClassName:
        'bg-[radial-gradient(circle,rgba(165,106,63,0.18),transparent_70%)]',
      motionClassName: 'cushion-drift-slow',
      sizes: '(min-width: 1024px) 24rem, (min-width: 640px) 22rem, 18rem',
      priority: true,
    },
    {
      src: PRODUCT_SVG_MOTIFS.cushion,
      className:
        'absolute left-[-9rem] bottom-[-3rem] hidden h-[16rem] w-[16rem] opacity-[0.1] sm:block lg:h-[19rem] lg:w-[19rem]',
      imageClassName: 'object-contain mix-blend-multiply saturate-[0.82]',
      glowClassName:
        'bg-[radial-gradient(circle,rgba(102,114,95,0.12),transparent_72%)]',
      motionClassName: 'cushion-drift-reverse',
      sizes: '(min-width: 1024px) 19rem, 16rem',
    },
    {
      src: PRODUCT_SVG_MOTIFS.cushion,
      className:
        'absolute bottom-[7%] right-[10%] hidden h-[10rem] w-[10rem] opacity-[0.07] md:block lg:h-[12rem] lg:w-[12rem]',
      imageClassName: 'object-contain mix-blend-multiply saturate-[0.9]',
      glowClassName:
        'bg-[radial-gradient(circle,rgba(221,208,189,0.22),transparent_72%)]',
      motionClassName: 'cushion-drift-delayed',
      sizes: '(min-width: 1024px) 12rem, 10rem',
    },
  ],
};

export default function CushionBackdrop({
  variant,
  className = '',
}: {
  variant: CushionBackdropVariant;
  className?: string;
}) {
  const layers = layersByVariant[variant];

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {layers.map((layer, index) => (
        <div key={`${variant}-${index}`} className={layer.className}>
          <div className={`absolute inset-[12%] rounded-full ${layer.glowClassName}`} />
          <div className={`relative h-full w-full ${layer.motionClassName}`}>
            <Image
              src={layer.src}
              alt=""
              fill
              unoptimized
              priority={layer.priority}
              sizes={layer.sizes}
              className={layer.imageClassName}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
