'use client';

import { useRef, useEffect, useState } from 'react';
import Hero from '@/components/sections/Hero';
import FeaturesBanner from '@/components/sections/FeaturesBanner';
import dynamic from 'next/dynamic';

// Heavy below-fold sections loaded as separate JS chunks
const About = dynamic(() => import('@/components/sections/About'), { ssr: false });
const Product3D = dynamic(() => import('@/components/product/Product3D'), { ssr: false });
const ProductSection = dynamic(() => import('@/components/sections/ProductSection'), { ssr: false });
const Footer = dynamic(() => import('@/components/Footer'), { ssr: false });

const curatedProducts = [
  {
    id: 1,
    category: 'sofa',
    name: 'Milano Sculpted Sofa',
    description:
      'Layered in deep olive velvet with a softly curved silhouette, this statement sofa anchors the room with gallery-grade presence and cloud-soft comfort.',
    price: 45000,
    imageUrl: '/products/sofa/main.png',
    eyebrow: 'Signature Sofa',
    modelPath: '/3D%20models/teal%20sofa%203d%20model.glb',
    images: [
      '/products/sofa/main.png',
      '/products/sofa/cover.png',
      '/products/sofa/top.png',
      '/products/sofa/left.png',
      '/products/sofa/right.png',
      '/products/sofa/sofa leg.png',
    ],
    colors: [
      { name: 'Olive Velvet', image: '/products/sofa/main.png' },
      { name: 'Bronze Leather', image: '/products/sofa/bronge leather.png' },
      { name: 'Warm Taupe', image: '/products/sofa/warm taupe.png' },
      { name: 'Deep Charcoal', image: '/products/sofa/deep charcol.png' }
    ],
    specs: {
      material: 'Premium velvet upholstery',
      foam: 'High-density foam core',
      dimensions: '300 × 90 × 80 cm',
      weight: '80 kg',
      warranty: '5 years'
    }
  },
  {
    id: 2,
    category: 'chair',
    name: 'Verona Accent Chair',
    description:
      'A sculpted lounge chair with curved arms, rich textured upholstery, and a compact footprint that adds depth to reading corners and formal seating areas.',
    price: 18500,
    imageUrl: '/products/chairs/main.png',
    eyebrow: 'Accent Seating',
    modelPath: '/3D%20models/teal+velvet+armchair+3d+model.glb',
    images: [
      '/products/chairs/main.png',
      '/products/chairs/cover.png',
      '/products/chairs/top.png',
      '/products/chairs/left.png',
      '/products/chairs/right.png',
      '/products/chairs/legs.png'
    ],
    colors: [
      { name: 'Cognac Leather', image: '/products/chairs/Cognac Leather.png' },
      { name: 'Forest Green', image: '/products/chairs/Forest Green.png' },
      { name: 'Sunset Terracotta', image: '/products/chairs/Sunset Terracotta.png' },
      { name: 'Midnight Navy', image: '/products/chairs/midnight navy.png' }
    ],
    specs: {
      material: 'Textured fabric',
      foam: 'Multi-layer foam',
      dimensions: '80 × 80 × 85 cm',
      weight: '25 kg',
      warranty: '3 years'
    }
  },
  {
    id: 3,
    category: 'recliner',
    name: 'Aurelian Leather Recliner',
    description:
      'Cut in rich saddle leather with tailored stitching and a quietly engineered recline, it brings lounge-level comfort to a polished living space.',
    price: 32000,
    imageUrl: '/products/recliners/main.png',
    eyebrow: 'Private Lounge',
    modelPath: '/3D%20models/recliner+chair+3d+model.glb',
    images: [
      '/products/recliners/main.png',
      '/products/recliners/cover.png',
      '/products/recliners/top.png',
      '/products/recliners/left.png',
      '/products/recliners/right.png',
      '/products/recliners/legs.png'
    ],
    colors: [
      { name: 'Cognac Leather', image: '/products/recliners/Cognac Leather.png' },
      { name: 'Forest Green', image: '/products/recliners/Forest Green.png' },
      { name: 'Midnight Navy', image: '/products/recliners/Midnight Navy.png' },
      { name: 'Sunset Terracotta', image: '/products/recliners/Sunset Terracotta.png' }
    ],
    specs: {
      material: 'Full-grain leather',
      foam: 'Ergonomic recliner mechanism',
      dimensions: '95 × 95 × 105 cm',
      weight: '45 kg',
      warranty: '5 years'
    }
  },
  {
    id: 4,
    category: 'pouffe',
    name: 'Atelier Accent Pouffe',
    description:
      'A compact accent piece with artisanal texture, warm bronze undertones, and flexible styling that works beside a sofa, bed, or reading chair.',
    price: 4500,
    imageUrl: '/products/pouffes/main.png',
    eyebrow: 'Finishing Touch',
    modelPath: '/3D%20models/teal+pouffies+3d+model.glb',
    images: [
      '/products/pouffes/main.png',
      '/products/pouffes/cover.png',
      '/products/pouffes/top.png',
      '/products/pouffes/left.png',
      '/products/pouffes/right.png',
      '/products/pouffes/closeup.png'
    ],
    colors: [
      { name: 'Bronze Texture', image: '/products/pouffes/Cognac Leather.png' },
      { name: 'Warm Sand', image: '/products/pouffes/Midnight Navy.png' },
      { name: 'Clay Terracotta', image: '/products/pouffes/Sunset Terracota.png' },
      { name: 'Forest Green', image: '/products/pouffes/Forest Green.png' }
    ],
    specs: {
      material: 'Artisanal woven fabric',
      foam: 'Firm support filling',
      dimensions: '50 × 50 × 40 cm',
      weight: '8 kg',
      warranty: '2 years'
    }
  },
];

/**
 * LazySection — only mounts children when the placeholder enters the viewport
 * (+ rootMargin buffer). Once mounted it never unmounts, so loaded models persist.
 * A min-height placeholder prevents layout shift before mount.
 * 
 * ✅ Fixed: Added keepMounted prop to prevent unmounting after initial mount
 * to avoid DOM manipulation conflicts with GSAP and Three.js
 */
function LazySection({
  children,
  minHeight = '80vh',
  rootMargin = '400px',
  keepMounted = true, // New prop to keep content mounted after first render
}: {
  children: React.ReactNode;
  minHeight?: string;
  rootMargin?: string;
  keepMounted?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMounted(true);
          // Only disconnect if we don't need to keep watching
          if (!keepMounted) {
            observer.disconnect();
          }
        }
      },
      { rootMargin, threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, keepMounted]);

  return (
    <div ref={ref} style={mounted ? undefined : { minHeight }}>
      {mounted ? children : null}
    </div>
  );
}

export default function Home() {
  const sofaData = curatedProducts.find((p) => p.category === 'sofa')!;
  const chairData = curatedProducts.find((p) => p.category === 'chair')!;
  const reclinerData = curatedProducts.find((p) => p.category === 'recliner')!;
  const pouffeData = curatedProducts.find((p) => p.category === 'pouffe')!;

  return (
    <main className="page-strata overflow-clip bg-transparent">
      {/* ── Above the fold — loaded eagerly ── */}
      <Hero />
      <FeaturesBanner />

      {/* ── Below the fold — lazy-mounted when approaching viewport ── */}
      <LazySection minHeight="60vh">
        <About />
      </LazySection>

      {/* Sofa — first product, slightly tighter margin so it feels instant */}
      <LazySection minHeight="80vh" rootMargin="300px">
        <Product3D id="sofa-3d-view" data={sofaData} surfaceClassName="bg-transparent" />
        <ProductSection id="sofas" data={sofaData} surfaceClassName="bg-transparent" />
      </LazySection>

      {/* Chair */}
      <LazySection minHeight="80vh">
        <Product3D id="chair-3d-view" data={chairData} surfaceClassName="bg-theme-mist/55 dark:bg-theme-mist/20" />
        <ProductSection id="chairs" data={chairData} surfaceClassName="bg-theme-mist/55 dark:bg-theme-mist/20" />
      </LazySection>

      {/* Recliner */}
      <LazySection minHeight="80vh">
        <Product3D id="recliner-3d-view" data={reclinerData} surfaceClassName="bg-transparent" />
        <ProductSection id="recliners" data={reclinerData} surfaceClassName="bg-transparent" />
      </LazySection>

      {/* Pouffe */}
      <LazySection minHeight="80vh">
        <Product3D id="pouffe-3d-view" data={pouffeData} surfaceClassName="bg-theme-mist/55 dark:bg-theme-mist/20" />
        <ProductSection id="pouffes" data={pouffeData} surfaceClassName="bg-transparent" />
      </LazySection>

      {/* Footer — heaviest 3D scene, only mounts when user scrolls near it */}
      <LazySection minHeight="40vh">
        <Footer />
      </LazySection>
    </main>
  );
}
