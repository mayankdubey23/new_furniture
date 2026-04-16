import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Feature from '@/models/Feature';
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

function serializeFeature(value: Record<string, unknown>) {
  const id = getId(value._id ?? value.id);

  return {
    id,
    _id: id,
    name: cleanString(value.name),
    shortDescription: cleanString(value.shortDescription),
    icon: cleanString(value.icon),
    active: cleanBoolean(value.active, true),
    ...(toIsoDateString(value.createdAt) ? { createdAt: toIsoDateString(value.createdAt) } : {}),
    ...(toIsoDateString(value.updatedAt) ? { updatedAt: toIsoDateString(value.updatedAt) } : {}),
  };
}

function buildPayload(data: Record<string, unknown>) {
  return {
    name: cleanString(data.name),
    shortDescription: cleanString(data.shortDescription ?? data.shortdescription),
    icon: cleanString(data.icon),
    active: cleanBoolean(data.active, true),
  };
}

export async function GET() {
  try {
    await dbConnect();
    const items = await Feature.find({}).sort({ active: -1, createdAt: -1 }).lean();
    return legacySuccess(items.map((item) => serializeFeature(item)));
  } catch {
    return legacyError('Failed to load feature records.', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const payload = buildPayload(await readRequestData(request));

    if (!payload.name || !payload.shortDescription) {
      return legacyError('Name and shortDescription are required.');
    }

    const created = await Feature.create(payload);
    return legacySuccess(serializeFeature(created.toObject()), { status: 201 });
  } catch (error) {
    return legacyError(
      error instanceof Error ? error.message : 'Failed to create feature record.',
      400
    );
  }
}
