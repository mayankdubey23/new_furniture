import HomePageClient from '@/components/home/HomePageClient';
import { getStorefrontCollectionLinks, getStorefrontProducts } from '@/lib/productStore';
import { ensureStorefrontAvailable } from '@/lib/services/storefrontAvailability';
import { getSiteContent } from '@/lib/services/siteContent';

export const dynamic = 'force-dynamic';

export default async function Home() {
  await ensureStorefrontAvailable();

  const [products, collections, siteContent] = await Promise.all([
    getStorefrontProducts(),
    getStorefrontCollectionLinks(),
    getSiteContent(),
  ]);

  return <HomePageClient products={products} collections={collections} siteContent={siteContent} />;
}
