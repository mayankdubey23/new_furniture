import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Product from '@/models/Product';
import { adminMiddleware } from '@/lib/auth';
import { revalidateCatalogRoutes } from '@/lib/server/catalogRevalidation';
import {
  normalizeProduct,
  prepareProductMutationInput,
} from '@/lib/productCatalog';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const category = request.nextUrl.searchParams.get('category')?.trim().toLowerCase() ?? '';
    const mainCategory = request.nextUrl.searchParams.get('mainCategory')?.trim() ?? '';
    const subCategory = request.nextUrl.searchParams.get('subCategory')?.trim() ?? '';
    const brand = request.nextUrl.searchParams.get('brand')?.trim() ?? '';
    const activeParam = request.nextUrl.searchParams.get('active');
    const query: Record<string, unknown> = {};

    if (category) {
      query.category = category;
    }

    if (mainCategory) {
      query.mainCategory = mainCategory;
    }

    if (subCategory) {
      query.subCategory = subCategory;
    }

    if (brand) {
      query.brand = brand;
    }

    if (activeParam === 'true') {
      query.active = true;
    } else if (activeParam === 'false') {
      query.active = false;
    }

    const products = await Product.find(query)
      .populate('mainCategory')
      .populate('subCategory')
      .populate('brand')
      .sort({ category: 1, name: 1 })
      .lean();

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
    const created = await Product.create(payload);
    const product = await Product.findById(created._id)
      .populate('mainCategory')
      .populate('subCategory')
      .populate('brand')
      .lean();

    revalidateCatalogRoutes(String(created._id));

    return NextResponse.json(normalizeProduct(product ?? created.toObject()), {
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
