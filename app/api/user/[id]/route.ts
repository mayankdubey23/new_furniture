import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import {
  cleanBoolean,
  cleanString,
  legacyError,
  legacyMessage,
  legacySuccess,
  readRequestData,
} from '@/lib/server/legacyApi';
import { serializeLegacyUser } from '@/lib/server/legacyRelations';

export const dynamic = 'force-dynamic';

function applyPayload(user: InstanceType<typeof User>, data: Record<string, unknown>) {
  const name = cleanString(data.name);
  const username = cleanString(data.username ?? data.userName);
  const email = cleanString(data.email).toLowerCase();
  const phone = cleanString(data.phone);
  const password = cleanString(data.password);
  const role = cleanString(data.role);

  if (name) user.name = name;
  if (username) user.username = username;
  if (email) user.email = email;
  if (phone) user.phone = phone;
  if (password) user.password = password;
  if (role) user.role = role;
  user.active = cleanBoolean(data.active, user.active ?? true);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const item = await User.findById(id).lean();

    if (!item) {
      return legacyError('User record not found.', 404);
    }

    return legacySuccess(serializeLegacyUser(item));
  } catch {
    return legacyError('Failed to load user record.', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const user = await User.findById(id);

    if (!user) {
      return legacyError('User record not found.', 404);
    }

    applyPayload(user, await readRequestData(request));
    await user.save();

    return legacySuccess(serializeLegacyUser(user.toObject()));
  } catch (error) {
    return legacyError(
      error instanceof Error ? error.message : 'Failed to update user record.',
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
    const deleted = await User.findByIdAndDelete(id);

    if (!deleted) {
      return legacyError('User record not found.', 404);
    }

    return legacyMessage('Record Has Been Deleted Successfully');
  } catch {
    return legacyError('Failed to delete user record.', 500);
  }
}
