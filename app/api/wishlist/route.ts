import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Wishlist from '@/models/Wishlist';
import {
  cleanString,
  legacyError,
  legacySuccess,
  readRequestData,
} from '@/lib/server/legacyApi';
import { serializeLegacyWishlist } from '@/lib/server/legacyRelations';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    const items = await Wishlist.find({})
      .populate('user')
      .populate('product')
      .sort({ createdAt: -1 })
      .lean();

    return legacySuccess(
      items
        .map((item) => serializeLegacyWishlist(item))
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
    );
  } catch {
    return legacyError('Failed to load wishlist records.', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await readRequestData(request);
    const user = cleanString(data.user);
    const product = cleanString(data.product);

    if (!user || !product) {
      return legacyError('User and product are required.');
    }

    const item = await Wishlist.findOneAndUpdate(
      { user, product },
      { $set: { user, product } },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    )
      .populate('user')
      .populate('product')
      .lean();

    return legacySuccess(serializeLegacyWishlist(item), { status: 201 });
  } catch (error) {
    return legacyError(
      error instanceof Error ? error.message : 'Failed to create wishlist record.',
      400
    );
  }
}
