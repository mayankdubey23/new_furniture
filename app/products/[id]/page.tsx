import ProductSection from '@/components/sections/ProductSection';
import { getProductById } from '@/lib/productStore';
import { getProductSlug } from '@/lib/productCatalog';
import { ensureStorefrontAvailable } from '@/lib/services/storefrontAvailability';
import { notFound, permanentRedirect } from 'next/navigation';

interface Params {
  id: string;
}

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  await ensureStorefrontAvailable();

  const { id } = await params;

  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const canonicalSlug = getProductSlug(product);

  if (canonicalSlug && id !== canonicalSlug) {
    permanentRedirect(`/products/${canonicalSlug}`);
  }

  return (
    <main className="px-4 pb-14 pt-28 sm:px-6 md:px-8 md:pb-18 md:pt-32 lg:px-10">
      <div className="mx-auto w-full max-w-[112rem]">
        <ProductSection id="product" data={product} showIntroCard />
      </div>
    </main>
  );
}

