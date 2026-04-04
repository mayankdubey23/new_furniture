import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Product from '@/models/Product';
import { adminMiddleware } from '@/lib/auth';
import { revalidateCatalogRoutes } from '@/lib/server/catalogRevalidation';
import {
  isProductCategory,
  normalizeProduct,
  prepareProductMutationInput,
} from '@/lib/productCatalog';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const category = request.nextUrl.searchParams.get('category')?.trim().toLowerCase() ?? '';
    const query = isProductCategory(category) ? { category } : {};
    const products = await Product.find(query).sort({ category: 1, name: 1 }).lean();

    return NextResponse.json(products.map((product) => normalizeProduct(product)), {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = await adminMiddleware(request);
  if (authError) return authError;

  try {
    await dbConnect();
    const data = await request.json();
    const payload = prepareProductMutationInput(data);
    const product = await Product.create(payload);

    revalidateCatalogRoutes(String(product._id));

    return NextResponse.json(normalizeProduct(product.toObject()), {
      status: 201,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create product' },
      { status: 400 }
    );
  }
}
