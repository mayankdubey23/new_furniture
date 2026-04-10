import ProductSection from '@/components/sections/ProductSection';
import { getProductById } from '@/lib/productStore';
import { notFound } from 'next/navigation';

interface Params {
  id: string;
}

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;

  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <main className="px-4 pb-14 pt-28 sm:px-6 md:px-8 md:pb-18 md:pt-32 lg:px-10">
      <div className="mx-auto w-full max-w-[112rem]">
        <ProductSection id="product" data={product} showIntroCard />
      </div>
    </main>
  );
}

