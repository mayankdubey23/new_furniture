'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CushionBackdrop from '@/components/decor/CushionBackdrop';
import Hero from '@/components/sections/Hero';
import {
  getProductCollectionTargetId,
  type ProductRecord,
  type StorefrontCollectionLink,
} from '@/lib/productCatalog';
import type { SiteContent } from '@/lib/content/siteContent';

gsap.registerPlugin(ScrollTrigger);

const Product3D = dynamic(() => import('@/components/product/Product3D'), {
  loading: () => <SectionSkeleton height="80vh" />,
});
const ProductSection = dynamic(() => import('@/components/sections/ProductSection'), {
  loading: () => <SectionSkeleton height="80vh" />,
});
const Footer = dynamic(() => import('@/components/Footer'), {
  loading: () => <SectionSkeleton height="40vh" />,
});

function SectionSkeleton({ height = '80vh' }: { height?: string }) {
  return (
    <div className="flex w-full items-center justify-center" style={{ minHeight: height }}>
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-theme-bronze/20 border-t-theme-bronze" />
    </div>
  );
}

function LazySection({
  children,
  minHeight = '80vh',
  rootMargin = '400px',
  id,
}: {
  children: React.ReactNode;
  minHeight?: string;
  rootMargin?: string;
  id?: string;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const element = wrapperRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

        setShouldRender(true);
        observer.disconnect();
      },
      { rootMargin, threshold: 0 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin]);

  useEffect(() => {
    if (!shouldRender) {
      return;
    }

    const element = wrapperRef.current;
    let rafId = 0;
    let timeoutId = 0;

    const refreshScrollTriggers = () => {
      window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    };

    refreshScrollTriggers();
    timeoutId = window.setTimeout(refreshScrollTriggers, 220);

    if (!element || typeof ResizeObserver === 'undefined') {
      return () => {
        window.cancelAnimationFrame(rafId);
        window.clearTimeout(timeoutId);
      };
    }

    const resizeObserver = new ResizeObserver(() => {
      refreshScrollTriggers();
    });

    resizeObserver.observe(element);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [shouldRender]);

  return (
    <div
      id={id}
      ref={wrapperRef}
      style={{ minHeight }}
      className="relative w-full scroll-mt-36 md:scroll-mt-40"
    >
      {shouldRender ? children : <SectionSkeleton height={minHeight} />}
    </div>
  );
}

export default function HomePageClient({
  products,
  collections,
  siteContent,
}: {
  products: ProductRecord[];
  collections: StorefrontCollectionLink[];
  siteContent: SiteContent;
}) {
  return (
    <main className="page-strata relative isolate w-full overflow-clip bg-transparent">
      <CushionBackdrop variant="home" className="-z-10" />

      <section className="w-full">
        <Hero content={siteContent.hero} />
      </section>

      <div id="collections">
        {products.map((product, index) => {
          const targetId = collections[index]?.targetId || getProductCollectionTargetId(product);
          const surfaceClassName =
            index % 2 === 0 ? 'bg-transparent' : 'bg-theme-mist/55 dark:bg-theme-mist/20';

          return (
            <LazySection
              key={product.id}
              id={targetId}
              minHeight="80vh"
              rootMargin={index === 0 ? '300px' : '400px'}
            >
              <Product3D
                id={`${targetId}-3d`}
                data={product}
                surfaceClassName={surfaceClassName}
              />
              <ProductSection
                id={`${targetId}-details`}
                data={product}
                surfaceClassName={surfaceClassName}
              />
            </LazySection>
          );
        })}
      </div>

      <LazySection id="site-footer-trigger" minHeight="40vh">
        <Footer collections={collections} content={siteContent.footer} />
      </LazySection>
    </main>
  );
}
