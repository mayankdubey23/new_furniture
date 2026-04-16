import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import {
  cleanNumber,
  cleanString,
  legacyError,
  legacySuccess,
  readRequestData,
} from '@/lib/server/legacyApi';
import { serializeLegacyCart } from '@/lib/server/legacyRelations';

export const dynamic = 'force-dynamic';

async function buildPayload(data: Record<string, unknown>) {
  const user = cleanString(data.user);
  const product = cleanString(data.product);
  const quantity = Math.max(1, cleanNumber(data.quantity, 1));
  const providedTotal = cleanNumber(data.total, Number.NaN);
  let total = Number.isFinite(providedTotal) ? providedTotal : 0;

  if (!total && product) {
    const productRecord = await Product.findById(product).lean();
    const productPrice =
      cleanNumber((productRecord as { finalPrice?: unknown } | null)?.finalPrice, 0) ||
      cleanNumber((productRecord as { price?: unknown } | null)?.price, 0);
    total = productPrice * quantity;
  }

  return {
    user,
    product,
    color: cleanString(data.color),
    size: cleanString(data.size),
    quantity,
    total,
  };
}

export async function GET() {
  try {
    await dbConnect();
    const items = await Cart.find({})
      .populate('user')
      .populate('product')
      .sort({ createdAt: -1 })
      .lean();

    return legacySuccess(
      items
        .map((item) => serializeLegacyCart(item))
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
    );
  } catch {
    return legacyError('Failed to load cart records.', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const payload = await buildPayload(await readRequestData(request));

    if (!payload.user || !payload.product) {
      return legacyError('User and product are required.');
    }

    const item = await Cart.findOneAndUpdate(
      { user: payload.user, product: payload.product },
      {
        $set: {
          color: payload.color,
          size: payload.size,
          total: payload.total,
        },
        $inc: { quantity: payload.quantity },
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    )
      .populate('user')
      .populate('product')
      .lean();

    return legacySuccess(serializeLegacyCart(item), { status: 201 });
  } catch (error) {
    return legacyError(
      error instanceof Error ? error.message : 'Failed to create cart record.',
      400
    );
  }
}
