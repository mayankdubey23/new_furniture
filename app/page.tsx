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
    imageUrl: '/sofa_fbx/main.png',
    eyebrow: 'Signature Sofa',
    modelPath: null,
    images: [
      '/sofa_fbx/main.png',
      '/sofa_fbx/cover.png',
      '/sofa_fbx/top.png',
      '/sofa_fbx/left.png',
      '/sofa_fbx/right.png',
      '/sofa_fbx/sofa leg.png',
    ],
    colors: [
      { name: 'Olive Velvet', image: '/sofa_fbx/main.png' },
      { name: 'Bronze Leather', image: '/sofa_fbx/bronge leather.png' },
      { name: 'Warm Taupe', image: '/sofa_fbx/warm taupe.png' },
      { name: 'Deep Charcoal', image: '/sofa_fbx/deep charcol.png' }
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
    imageUrl: '/chair-preview.svg',
    eyebrow: 'Accent Seating',
    modelPath: '/rocking-chair.glb',
    images: [
      'https://images.pexels.com/photos/2082090/pexels-photo-2082090.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/1591060/pexels-photo-1591060.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/1458894/pexels-photo-1458894.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/1235708/pexels-photo-1235708.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/1364075/pexels-photo-1364075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/1570610/pexels-photo-1570610.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    ],
    colors: [
      { name: 'Cognac Leather', image: 'https://images.pexels.com/photos/2082090/pexels-photo-2082090.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
      { name: 'Forest Green', image: 'https://images.pexels.com/photos/1235708/pexels-photo-1235708.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
      { name: 'Sunset Terracotta', image: 'https://images.pexels.com/photos/1364075/pexels-photo-1364075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
      { name: 'Midnight Navy', image: 'https://images.pexels.com/photos/1570610/pexels-photo-1570610.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }
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
    imageUrl: '/recliner-preview.svg',
    eyebrow: 'Private Lounge',
    modelPath: '/recliner.glb',
    images: [
      'https://images.pexels.com/photos/3757055/pexels-photo-3757055.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/1458894/pexels-photo-1458894.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/1235708/pexels-photo-1235708.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/1364075/pexels-photo-1364075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/1570610/pexels-photo-1570610.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/1590782/pexels-photo-1590782.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    ],
    colors: [
      { name: 'Saddle Leather', image: 'https://images.pexels.com/photos/3757055/pexels-photo-3757055.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
      { name: 'Dark Cognac', image: 'https://images.pexels.com/photos/1235708/pexels-photo-1235708.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
      { name: 'Ebony Black', image: 'https://images.pexels.com/photos/1570610/pexels-photo-1570610.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
      { name: 'Caramel Brown', image: 'https://images.pexels.com/photos/1364075/pexels-photo-1364075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }
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
    imageUrl: '/pouffe-preview.svg',
    eyebrow: 'Finishing Touch',
    modelPath: '/sofa.glb',
    images: [
      'https://images.pexels.com/photos/1034584/pexels-photo-1034584.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/1570610/pexels-photo-1570610.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/1364075/pexels-photo-1364075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/1235708/pexels-photo-1235708.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/1590782/pexels-photo-1590782.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/1458894/pexels-photo-1458894.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    ],
    colors: [
      { name: 'Bronze Texture', image: 'https://images.pexels.com/photos/1034584/pexels-photo-1034584.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
      { name: 'Warm Sand', image: 'https://images.pexels.com/photos/1458894/pexels-photo-1458894.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
      { name: 'Clay Terracotta', image: 'https://images.pexels.com/photos/1364075/pexels-photo-1364075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
      { name: 'Smoked Pearl', image: 'https://images.pexels.com/photos/1590782/pexels-photo-1590782.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }
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
      <ProductSection id="recliners" data={reclinerData}  surfaceClassName="bg-transparent" />
      <ProductSection id="pouffes" data={pouffeData} surfaceClassName="bg-transparent" />
      <Footer />
    </main>
  );
}
