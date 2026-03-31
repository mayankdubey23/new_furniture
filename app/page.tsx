'use client';

import Navbar from '@/components/Navbar';
import Hero from '@/components/sections/Hero';
import FeaturesBanner from '@/components/sections/FeaturesBanner';
import About from '@/components/sections/About';
import Model3DViewer from '@/components/sections/Model3DViewer';
import ProductSection from '@/components/sections/ProductSection';
import Footer from '@/components/Footer';

const curatedProducts = [
  {
    id: 1,
    category: 'sofa',
    name: 'Milano Sculpted Sofa',
    description:
      'Layered in deep olive velvet with a softly curved silhouette, this statement sofa anchors the room with gallery-grade presence and cloud-soft comfort.',
    price: 45000,
    glbPath: '/sofa.glb',
    imageUrl: '/sofa-preview.svg',
    eyebrow: 'Signature Sofa',
  },
  {
    id: 2,
    category: 'chair',
    name: 'Verona Accent Chair',
    description:
      'A sculpted lounge chair with curved arms, rich textured upholstery, and a compact footprint that adds depth to reading corners and formal seating areas.',
    price: 18500,
    glbPath: '/rocking-chair.glb',
    imageUrl: '/chair-preview.svg',
    eyebrow: 'Accent Seating',
  },
  {
    id: 3,
    category: 'recliner',
    name: 'Aurelian Leather Recliner',
    description:
      'Cut in rich saddle leather with tailored stitching and a quietly engineered recline, it brings lounge-level comfort to a polished living space.',
    price: 32000,
    glbPath: '/recliner.glb',
    imageUrl: '/recliner-preview.svg',
    eyebrow: 'Private Lounge',
  },
  {
    id: 4,
    category: 'pouffe',
    name: 'Atelier Accent Pouffe',
    description:
      'A compact accent piece with artisanal texture, warm bronze undertones, and flexible styling that works beside a sofa, bed, or reading chair.',
    price: 4500,
    glbPath: '/sofa.glb',
    imageUrl: '/pouffe-preview.svg',
    eyebrow: 'Finishing Touch',
  },
];

export default function Home() {
  const sofaData = curatedProducts.find((product) => product.category === 'sofa');
  const chairData = curatedProducts.find((product) => product.category === 'chair');
  const reclinerData = curatedProducts.find((product) => product.category === 'recliner');
  const pouffeData = curatedProducts.find((product) => product.category === 'pouffe');

  return (
    <main className="overflow-clip bg-transparent">
      <Navbar />
      <Hero />
      <FeaturesBanner />
      <About />
      <Model3DViewer id="sofa-3d-view" data={sofaData} surfaceClassName="bg-transparent" />
      <ProductSection id="sofas" data={sofaData} surfaceClassName="bg-transparent" />
      <Model3DViewer id="chair-3d-view" data={chairData} reverseLayout surfaceClassName="bg-theme-mist/55 dark:bg-theme-mist/20" />
      <ProductSection id="chairs" data={chairData} surfaceClassName="bg-theme-mist/55 dark:bg-theme-mist/20" />
      <Model3DViewer id="recliner-3d-view" data={reclinerData} surfaceClassName="bg-transparent" />
      <ProductSection id="recliners" data={reclinerData} reverseLayout surfaceClassName="bg-transparent" />
      <ProductSection id="pouffes" data={pouffeData} surfaceClassName="bg-transparent" />
      <Footer />
    </main>
  );
}

