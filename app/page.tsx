import HomePageClient from '@/components/home/HomePageClient';
import { getFeaturedProducts, getStorefrontCollectionLinks } from '@/lib/productStore';
import { getSiteContent } from '@/lib/services/siteContent';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [products, collections, siteContent] = await Promise.all([
    getFeaturedProducts(),
    getStorefrontCollectionLinks(),
    getSiteContent(),
  ]);

  return <HomePageClient products={products} collections={collections} siteContent={siteContent} />;
}
