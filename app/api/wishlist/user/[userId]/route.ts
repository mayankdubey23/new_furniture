import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Wishlist from '@/models/Wishlist';
import { legacyError, legacySuccess } from '@/lib/server/legacyApi';
import { serializeLegacyWishlist } from '@/lib/server/legacyRelations';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await dbConnect();
    const { userId } = await params;
    const items = await Wishlist.find({ user: userId })
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
    return legacyError('Failed to load user wishlist records.', 500);
  }
}
