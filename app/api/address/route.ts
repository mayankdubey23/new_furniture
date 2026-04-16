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
    await dbConnect();
    const items = await Address.find({})
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
    await dbConnect();
    const payload = buildPayload(await readRequestData(request));

    if (!payload.user || !payload.name || !payload.email || !payload.phone || !payload.address) {
      return legacyError('User, name, email, phone, and address are required.');
    }

    const created = await Address.create(payload);
    const item = await Address.findById(created._id).populate('user').lean();
    return legacySuccess(serializeLegacyAddress(item ?? created.toObject()), { status: 201 });
  } catch (error) {
    return legacyError(
      error instanceof Error ? error.message : 'Failed to create address record.',
      400
    );
  }
}
