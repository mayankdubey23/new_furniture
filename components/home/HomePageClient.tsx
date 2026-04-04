'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Hero from '@/components/sections/Hero';
import FeaturesBanner from '@/components/sections/FeaturesBanner';
import type { ProductRecord } from '@/lib/productCatalog';

const About = dynamic(() => import('@/components/sections/About'), {
  loading: () => <SectionSkeleton height="60vh" />,
});
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

export default function HomePageClient({ products }: { products: ProductRecord[] }) {
  const sofaData = products.find((product) => product.category === 'sofa') ?? products[0];
  const chairData = products.find((product) => product.category === 'chair') ?? products[0];
  const reclinerData = products.find((product) => product.category === 'recliner') ?? products[0];
  const pouffeData = products.find((product) => product.category === 'pouffe') ?? products[0];

  return (
    <main className="page-strata w-full overflow-clip bg-transparent">
      <section className="w-full">
        <Hero />
      </section>
      <section className="w-full">
        <FeaturesBanner />
      </section>

      <LazySection minHeight="60vh">
        <About />
      </LazySection>

      <LazySection id="sofa-3d-view-start" minHeight="80vh" rootMargin="300px">
        <Product3D id="sofa-3d-view" data={sofaData} surfaceClassName="bg-transparent" />
        <ProductSection id="sofas" data={sofaData} surfaceClassName="bg-transparent" />
      </LazySection>

      <LazySection id="chair-3d-view-start" minHeight="80vh">
        <Product3D
          id="chair-3d-view"
          data={chairData}
          surfaceClassName="bg-theme-mist/55 dark:bg-theme-mist/20"
        />
        <ProductSection
          id="chairs"
          data={chairData}
          surfaceClassName="bg-theme-mist/55 dark:bg-theme-mist/20"
        />
      </LazySection>

      <LazySection id="recliner-3d-view-start" minHeight="80vh">
        <Product3D id="recliner-3d-view" data={reclinerData} surfaceClassName="bg-transparent" />
        <ProductSection id="recliners" data={reclinerData} surfaceClassName="bg-transparent" />
      </LazySection>

      <LazySection id="pouffe-3d-view-start" minHeight="80vh">
        <Product3D
          id="pouffe-3d-view"
          data={pouffeData}
          surfaceClassName="bg-theme-mist/55 dark:bg-theme-mist/20"
        />
        <ProductSection id="pouffes" data={pouffeData} surfaceClassName="bg-transparent" />
      </LazySection>

      <LazySection minHeight="40vh">
        <Footer />
      </LazySection>
    </main>
  );
}

