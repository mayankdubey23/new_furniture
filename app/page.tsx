import Navbar from '@/components/Navbar';
import Hero from '@/components/sections/Hero';
import FeaturesBanner from '@/components/sections/FeaturesBanner';
import About from '@/components/sections/About';
import ProductSection from '@/components/sections/ProductSection';
import Footer from '@/components/Footer'; 


// Dummy Data with Pexels Images
const dummyProducts = [
  { 
    id: 1, category: 'sofa', name: 'Forest Green Velvet Sofa', 
    description: 'Immerse yourself in luxury with our signature velvet sofa. The deep forest tones and plush seating create the perfect centerpiece for a sophisticated living room.', 
    price: 45000, imageUrl: 'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' 
  },
  { 
    id: 2, category: 'recliner', name: 'Classic Brown Leather Recliner', 
    description: 'Experience unmatched relaxation. Crafted with premium tan brown leather, this ergonomic recliner supports your posture while adding a rustic charm to your space.', 
    price: 32000, imageUrl: 'https://images.pexels.com/photos/3757055/pexels-photo-3757055.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' 
  },
  { 
    id: 3, category: 'pouffe', name: 'Teal Knitted Pouffe', 
    description: 'A touch of modern artistry. This handcrafted teal pouffe acts as a perfect footrest or extra seating, blending seamlessly with minimalist and boho interiors.', 
    price: 4500, imageUrl: 'https://images.pexels.com/photos/1034584/pexels-photo-1034584.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' 
  }
];

export default function Home() {
  const sofaData = dummyProducts.find(p => p.category === 'sofa');
  const reclinerData = dummyProducts.find(p => p.category === 'recliner');
  const pouffeData = dummyProducts.find(p => p.category === 'pouffe');

  return (
    <main className="bg-theme-beige overflow-clip">
      {/* 3D Background */}
      
      {/* Navbar */}
      <Navbar />
      
      <Hero />
      
      {/* Hero ke theek baad scrolling text */}
      <FeaturesBanner /> 
      
      <About />
      
      {/* Products Display */}
      <ProductSection id="sofas" data={sofaData} bgColor="bg-theme-beige" />
      <ProductSection id="recliners" data={reclinerData} reverseLayout={true} bgColor="bg-white" />
      <ProductSection id="pouffes" data={pouffeData} bgColor="bg-theme-beige" />
      

      
      {/* Page ke end mein footer */}
      <Footer /> 
    </main>
  );
}