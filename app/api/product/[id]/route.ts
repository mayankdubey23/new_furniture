import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Product from '@/models/Product';
import {
  legacyError,
  legacyMessage,
  legacySuccess,
  readRequestData,
} from '@/lib/server/legacyApi';
import {
  buildLegacyProductPayload,
  serializeLegacyProduct,
} from '@/lib/server/legacyProduct';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const item = await Product.findById(id)
      .populate('mainCategory')
      .populate('subCategory')
      .populate('brand')
      .lean();

    if (!item) {
      return legacyError('Product record not found.', 404);
    }

    return legacySuccess(serializeLegacyProduct(item));
  } catch {
    return legacyError('Failed to load product record.', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const data = await readRequestData(request);
    const payload = await buildLegacyProductPayload(data);
    const item = await Product.findByIdAndUpdate(id, payload, {
      returnDocument: 'after',
      runValidators: true,
    })
      .populate('mainCategory')
      .populate('subCategory')
      .populate('brand')
      .lean();

    if (!item) {
      return legacyError('Product record not found.', 404);
    }

    return legacySuccess(serializeLegacyProduct(item));
  } catch (error) {
    return legacyError(
      error instanceof Error ? error.message : 'Failed to update product record.',
      400
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) {
      return legacyError('Product record not found.', 404);
    }

    return legacyMessage('Record Has Been Deleted Successfully', undefined, 'reason');
  } catch {
    return legacyError('Failed to delete product record.', 500);
  }
}
