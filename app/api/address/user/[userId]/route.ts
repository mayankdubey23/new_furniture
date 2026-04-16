import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Address from '@/models/Address';
import { legacyError, legacySuccess } from '@/lib/server/legacyApi';
import { serializeLegacyAddress } from '@/lib/server/legacyRelations';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await dbConnect();
    const { userId } = await params;
    const items = await Address.find({ user: userId })
      .populate('user')
      .sort({ createdAt: -1 })
      .lean();

    return legacySuccess(
      items
        .map((item) => serializeLegacyAddress(item))
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
    );
  } catch {
    return legacyError('Failed to load user addresses.', 500);
  }
}
