import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Address from '@/models/Address';
import {
  legacyError,
  legacyMessage,
  legacySuccess,
  readRequestData,
} from '@/lib/server/legacyApi';
import { serializeLegacyAddress } from '@/lib/server/legacyRelations';
import { deleteCustomerAddress, saveCustomerAddress } from '@/lib/server/customerAddresses';
import { getUserFromCookie } from '@/lib/userAuth';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromCookie();

    if (!user?.userId) {
      return legacyError('Not authenticated', 401);
    }

    await dbConnect();
    const { id } = await params;
    const item = await Address.findOne({ _id: id, user: user.userId }).populate('user').lean();

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
    const user = await getUserFromCookie();

    if (!user?.userId) {
      return legacyError('Not authenticated', 401);
    }

    const { id } = await params;
    const payload = (await readRequestData(request)) as Record<string, unknown>;
    const address = await saveCustomerAddress(user.userId, payload, { id });
    await dbConnect();
    const item = await Address.findOne({ _id: address.id, user: user.userId })
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
    const user = await getUserFromCookie();

    if (!user?.userId) {
      return legacyError('Not authenticated', 401);
    }

    const { id } = await params;
    const deleted = await deleteCustomerAddress(user.userId, id);

    if (!deleted) {
      return legacyError('Address record not found.', 404);
    }

    return legacyMessage('Record Has Been Deleted Successfully');
  } catch {
    return legacyError('Failed to delete address record.', 500);
  }
}
