import Navbar from '@/components/Navbar';
import Hero from '@/components/sections/Hero';
import FeaturesBanner from '@/components/sections/FeaturesBanner';
import About from '@/components/sections/About';
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
    imageUrl:
      'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    eyebrow: 'Signature Sofa',
  },
  {
    id: 2,
    category: 'recliner',
    name: 'Aurelian Leather Recliner',
    description:
      'Cut in rich saddle leather with tailored stitching and a quietly engineered recline, it brings lounge-level comfort to a polished living space.',
    price: 32000,
    imageUrl:
      'https://images.pexels.com/photos/3757055/pexels-photo-3757055.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    eyebrow: 'Private Lounge',
  },
  {
    id: 3,
    category: 'pouffe',
    name: 'Atelier Accent Pouffe',
    description:
      'A compact accent piece with artisanal texture, warm bronze undertones, and flexible styling that works beside a sofa, bed, or reading chair.',
    price: 4500,
    imageUrl:
      'https://images.pexels.com/photos/1034584/pexels-photo-1034584.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    eyebrow: 'Finishing Touch',
  },
];

export default function Home() {
  const sofaData = curatedProducts.find((product) => product.category === 'sofa');
  const reclinerData = curatedProducts.find((product) => product.category === 'recliner');
  const pouffeData = curatedProducts.find((product) => product.category === 'pouffe');

  return (
    <main className="overflow-clip bg-transparent">
      <Navbar />
      <Hero />
      <FeaturesBanner />
      <About />
      <ProductSection id="sofas" data={sofaData} surfaceClassName="bg-transparent" />
      <ProductSection id="recliners" data={reclinerData} reverseLayout surfaceClassName="bg-theme-mist/55 dark:bg-theme-mist/20" />
      <ProductSection id="pouffes" data={pouffeData} surfaceClassName="bg-transparent" />
      <Footer />
    </main>
  );
}
