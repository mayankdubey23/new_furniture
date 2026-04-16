import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Address from '@/models/Address';
import {
  cleanString,
  legacyError,
  legacyMessage,
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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const item = await Address.findById(id).populate('user').lean();

    if (!item) {
      return legacyError('Address record not found.', 404);
    }

    return legacySuccess(serializeLegacyAddress(item));
  } catch {
    return legacyError('Failed to load address record.', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const item = await Address.findByIdAndUpdate(id, buildPayload(await readRequestData(request)), {
      returnDocument: 'after',
      runValidators: true,
    })
      .populate('user')
      .lean();

    if (!item) {
      return legacyError('Address record not found.', 404);
    }

    return legacySuccess(serializeLegacyAddress(item));
  } catch (error) {
    return legacyError(
      error instanceof Error ? error.message : 'Failed to update address record.',
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
    const deleted = await Address.findByIdAndDelete(id);

    if (!deleted) {
      return legacyError('Address record not found.', 404);
    }

    return legacyMessage('Record Has Been Deleted Successfully');
  } catch {
    return legacyError('Failed to delete address record.', 500);
  }
}
