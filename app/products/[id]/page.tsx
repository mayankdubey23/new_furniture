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
    <div>
      <ProductSection id="product" data={product} />
    </div>
  );
}

