import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Newsletter from '@/models/Newsletter';
import {
  cleanBoolean,
  cleanString,
  getId,
  legacyError,
  legacySuccess,
  readRequestData,
  toIsoDateString,
} from '@/lib/server/legacyApi';

export const dynamic = 'force-dynamic';

function serializeNewsletter(value: Record<string, unknown>) {
  const id = getId(value._id ?? value.id);

  return {
    id,
    _id: id,
    email: cleanString(value.email),
    active: cleanBoolean(value.active, true),
    ...(toIsoDateString(value.createdAt) ? { createdAt: toIsoDateString(value.createdAt) } : {}),
    ...(toIsoDateString(value.updatedAt) ? { updatedAt: toIsoDateString(value.updatedAt) } : {}),
  };
}

function buildPayload(data: Record<string, unknown>) {
  return {
    email: cleanString(data.email).toLowerCase(),
    active: cleanBoolean(data.active, true),
  };
}

export async function GET() {
  try {
    await dbConnect();
    const items = await Newsletter.find({}).sort({ createdAt: -1 }).lean();
    return legacySuccess(items.map((item) => serializeNewsletter(item)));
  } catch {
    return legacyError('Failed to load newsletter records.', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const payload = buildPayload(await readRequestData(request));

    if (!payload.email) {
      return legacyError('Email is required.');
    }

    const item = await Newsletter.findOneAndUpdate(
      { email: payload.email },
      { $set: payload },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    ).lean();

    return legacySuccess(serializeNewsletter(item as Record<string, unknown>), { status: 201 });
  } catch (error) {
    return legacyError(
      error instanceof Error ? error.message : 'Failed to create newsletter record.',
      400
    );
  }
}
