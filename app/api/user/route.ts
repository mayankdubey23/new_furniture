import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import {
  cleanBoolean,
  cleanString,
  legacyError,
  legacySuccess,
  readRequestData,
} from '@/lib/server/legacyApi';
import { serializeLegacyUser } from '@/lib/server/legacyRelations';

export const dynamic = 'force-dynamic';

function buildPayload(data: Record<string, unknown>) {
  const password = cleanString(data.password);

  return {
    name: cleanString(data.name),
    username: cleanString(data.username ?? data.userName),
    email: cleanString(data.email).toLowerCase(),
    phone: cleanString(data.phone),
    ...(password ? { password } : {}),
    role: cleanString(data.role) || 'Buyer',
    active: cleanBoolean(data.active, true),
  };
}

export async function GET() {
  try {
    await dbConnect();
    const items = await User.find({}).sort({ createdAt: -1 }).lean();
    return legacySuccess(
      items
        .map((item) => serializeLegacyUser(item))
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
    );
  } catch {
    return legacyError('Failed to load user records.', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const payload = buildPayload(await readRequestData(request));

    if (!payload.name || !payload.email || !payload.password) {
      return legacyError('Name, email, and password are required.');
    }

    const created = await User.create(payload);
    return legacySuccess(serializeLegacyUser(created.toObject()), { status: 201 });
  } catch (error) {
    return legacyError(
      error instanceof Error ? error.message : 'Failed to create user record.',
      400
    );
  }
}
