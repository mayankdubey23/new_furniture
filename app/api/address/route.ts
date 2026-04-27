import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Address from '@/models/Address';
import {
  cleanString,
  legacyError,
  legacySuccess,
  readRequestData,
} from '@/lib/server/legacyApi';
import { serializeLegacyAddress } from '@/lib/server/legacyRelations';
import { saveCustomerAddress } from '@/lib/server/customerAddresses';
import { getUserFromCookie } from '@/lib/userAuth';

export const dynamic = 'force-dynamic';

function buildPayload(data: Record<string, unknown>) {
  return {
    user: cleanString(data.user),
    name: cleanString(data.name),
    email: cleanString(data.email).toLowerCase(),
    phone: cleanString(data.phone),
    address: cleanString(data.address),
    pin: cleanString(data.pin),
    city: cleanString(data.city),
    state: cleanString(data.state),
  };
}

export async function GET() {
  try {
    const user = await getUserFromCookie();

    if (!user?.userId) {
      return legacyError('Not authenticated', 401);
    }

    await dbConnect();
    const items = await Address.find({ user: user.userId })
      .populate('user')
      .sort({ createdAt: -1 })
      .lean();

    return legacySuccess(
      items
        .map((item) => serializeLegacyAddress(item))
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
    );
  } catch {
    return legacyError('Failed to load address records.', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromCookie();

    if (!user?.userId) {
      return legacyError('Not authenticated', 401);
    }

    const payload = buildPayload(await readRequestData(request));

    if (!payload.name || !payload.email || !payload.phone || !payload.address) {
      return legacyError('Name, email, phone, and address are required.');
    }

    const address = await saveCustomerAddress(user.userId, payload);
    await dbConnect();
    const item = await Address.findOne({ _id: address.id, user: user.userId })
      .populate('user')
      .lean();

    if (!item) {
      return legacyError('Failed to create address record.', 500);
    }

    return legacySuccess(serializeLegacyAddress(item), { status: 201 });
  } catch (error) {
    return legacyError(
      error instanceof Error ? error.message : 'Failed to create address record.',
      400
    );
  }
}
