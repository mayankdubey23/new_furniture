import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { adminMiddleware } from '@/lib/auth';
import SubCategory from '@/models/SubCategory';
import Product from '@/models/Product';
import {
  normalizeCatalogEntity,
  prepareCatalogEntityMutationInput,
} from '@/lib/catalogEntities';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const entity = await SubCategory.findById(id).lean();

    if (!entity) {
      return NextResponse.json({ error: 'Subcategory not found.' }, { status: 404 });
    }

    return NextResponse.json(normalizeCatalogEntity(entity), {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to load subcategory.' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await adminMiddleware(request);
  if (authError) return authError;

  try {
    await dbConnect();
    const { id } = await params;
    const data = await request.json();
    const payload = prepareCatalogEntityMutationInput(data, 'Subcategory');
    const entity = await SubCategory.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    }).lean();

    if (!entity) {
      return NextResponse.json({ error: 'Subcategory not found.' }, { status: 404 });
    }

    return NextResponse.json(normalizeCatalogEntity(entity), {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update subcategory.' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await adminMiddleware(request);
  if (authError) return authError;

  try {
    await dbConnect();
    const { id } = await params;
    const linkedProducts = await Product.countDocuments({ subCategory: id });

    if (linkedProducts > 0) {
      return NextResponse.json(
        { error: 'This subcategory is linked to products. Reassign those products first.' },
        { status: 400 }
      );
    }

    const deleted = await SubCategory.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Subcategory not found.' }, { status: 404 });
    }

    return NextResponse.json(
      { success: true },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch {
    return NextResponse.json({ error: 'Failed to delete subcategory.' }, { status: 500 });
  }
}
