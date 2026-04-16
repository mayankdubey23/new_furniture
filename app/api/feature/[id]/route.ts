import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Feature from '@/models/Feature';
import {
  cleanBoolean,
  cleanString,
  getId,
  legacyError,
  legacyMessage,
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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const item = await Feature.findById(id).lean();

    if (!item) {
      return legacyError('Feature record not found.', 404);
    }

    return legacySuccess(serializeFeature(item));
  } catch {
    return legacyError('Failed to load feature record.', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const item = await Feature.findByIdAndUpdate(id, buildPayload(await readRequestData(request)), {
      returnDocument: 'after',
      runValidators: true,
    }).lean();

    if (!item) {
      return legacyError('Feature record not found.', 404);
    }

    return legacySuccess(serializeFeature(item));
  } catch (error) {
    return legacyError(
      error instanceof Error ? error.message : 'Failed to update feature record.',
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
    const deleted = await Feature.findByIdAndDelete(id);

    if (!deleted) {
      return legacyError('Feature record not found.', 404);
    }

    return legacyMessage('Record Has Been Deleted Successfully');
  } catch {
    return legacyError('Failed to delete feature record.', 500);
  }
}
