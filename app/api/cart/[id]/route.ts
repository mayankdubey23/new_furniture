import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import {
  cleanNumber,
  cleanString,
  legacyError,
  legacyMessage,
  legacySuccess,
  readRequestData,
} from '@/lib/server/legacyApi';
import { serializeLegacyCart } from '@/lib/server/legacyRelations';

export const dynamic = 'force-dynamic';

async function buildPayload(data: Record<string, unknown>) {
  const quantity = Math.max(1, cleanNumber(data.quantity, 1));
  const productId = cleanString(data.product);
  const providedTotal = cleanNumber(data.total, Number.NaN);
  let total = Number.isFinite(providedTotal) ? providedTotal : 0;

  if (!total && productId) {
    const productRecord = await Product.findById(productId).lean();
    const productPrice =
      cleanNumber((productRecord as { finalPrice?: unknown } | null)?.finalPrice, 0) ||
      cleanNumber((productRecord as { price?: unknown } | null)?.price, 0);
    total = productPrice * quantity;
  }

  return {
    user: cleanString(data.user),
    product: productId,
    color: cleanString(data.color),
    size: cleanString(data.size),
    quantity,
    total,
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const item = await Cart.findById(id).populate('user').populate('product').lean();

    if (!item) {
      return legacyError('Cart record not found.', 404);
    }

    return legacySuccess(serializeLegacyCart(item));
  } catch {
    return legacyError('Failed to load cart record.', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const payload = await buildPayload(await readRequestData(request));
    const item = await Cart.findByIdAndUpdate(id, payload, {
      returnDocument: 'after',
      runValidators: true,
    })
      .populate('user')
      .populate('product')
      .lean();

    if (!item) {
      return legacyError('Cart record not found.', 404);
    }

    return legacySuccess(serializeLegacyCart(item));
  } catch (error) {
    return legacyError(
      error instanceof Error ? error.message : 'Failed to update cart record.',
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
    const deleted = await Cart.findByIdAndDelete(id);

    if (!deleted) {
      return legacyError('Cart record not found.', 404);
    }

    return legacyMessage('Record Has Been Deleted Successfully');
  } catch {
    return legacyError('Failed to delete cart record.', 500);
  }
}
