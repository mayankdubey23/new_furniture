import HomePageClient from '@/components/home/HomePageClient';
import { getFeaturedProducts } from '@/lib/productStore';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const products = await getFeaturedProducts();

  return <HomePageClient products={products} />;
}

