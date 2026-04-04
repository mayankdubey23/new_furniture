import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Product from '@/models/Product';
import { adminMiddleware } from '@/lib/auth';
import { revalidateCatalogRoutes } from '@/lib/server/catalogRevalidation';
import { normalizeProduct, prepareProductMutationInput } from '@/lib/productCatalog';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const product = await Product.findById(id).lean();
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(normalizeProduct(product), {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await adminMiddleware(request);
  if (authError) return authError;

  try {
    await dbConnect();
    const { id } = await params;
    const data = await request.json();
    const payload = prepareProductMutationInput(data);
    const product = await Product.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    }).lean();
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    revalidateCatalogRoutes(id);

    return NextResponse.json(normalizeProduct(product), {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update product' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await adminMiddleware(request);
  if (authError) return authError;

  try {
    await dbConnect();
    const { id } = await params;
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    revalidateCatalogRoutes(id);

    return NextResponse.json(
      { success: true },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
