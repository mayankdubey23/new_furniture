'use client';

import ProductSection from '@/components/sections/ProductSection';
import { notFound } from 'next/navigation';

interface Params {
  id: string;
}

export default async function ProductPage({ params }: { params: Params }) {
  let product;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/products/${params.id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error();
    product = await res.json();
  } catch {
    notFound();
  }

  return (
    <div>
      <ProductSection id="product" data={product} />
    </div>
  );
}

