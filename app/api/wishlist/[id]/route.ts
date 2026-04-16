import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Wishlist from '@/models/Wishlist';
import {
  cleanString,
  legacyError,
  legacyMessage,
  legacySuccess,
  readRequestData,
} from '@/lib/server/legacyApi';
import { serializeLegacyWishlist } from '@/lib/server/legacyRelations';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const item = await Wishlist.findById(id).populate('user').populate('product').lean();

    if (!item) {
      return legacyError('Wishlist record not found.', 404);
    }

    return legacySuccess(serializeLegacyWishlist(item));
  } catch {
    return legacyError('Failed to load wishlist record.', 500);
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
    const item = await Wishlist.findByIdAndUpdate(
      id,
      {
        user: cleanString(data.user),
        product: cleanString(data.product),
      },
      {
        returnDocument: 'after',
        runValidators: true,
      }
    )
      .populate('user')
      .populate('product')
      .lean();

    if (!item) {
      return legacyError('Wishlist record not found.', 404);
    }

    return legacySuccess(serializeLegacyWishlist(item));
  } catch (error) {
    return legacyError(
      error instanceof Error ? error.message : 'Failed to update wishlist record.',
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
    const deleted = await Wishlist.findByIdAndDelete(id);

    if (!deleted) {
      return legacyError('Wishlist record not found.', 404);
    }

    return legacyMessage('Record Has Been Deleted Successfully');
  } catch {
    return legacyError('Failed to delete wishlist record.', 500);
  }
}
