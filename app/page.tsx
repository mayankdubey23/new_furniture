import HomePageClient from '@/components/home/HomePageClient';
import { getFeaturedProducts, getStorefrontCollectionLinks } from '@/lib/productStore';
import { ensureStorefrontAvailable } from '@/lib/services/storefrontAvailability';
import { getSiteContent } from '@/lib/services/siteContent';

export const dynamic = 'force-dynamic';

export default async function Home() {
  await ensureStorefrontAvailable();

  const [products, collections, siteContent] = await Promise.all([
    getFeaturedProducts(),
    getStorefrontCollectionLinks(),
    getSiteContent(),
  ]);

  return <HomePageClient products={products} collections={collections} siteContent={siteContent} />;
}
