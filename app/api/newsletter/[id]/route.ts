import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Newsletter from '@/models/Newsletter';
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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const item = await Newsletter.findById(id).lean();

    if (!item) {
      return legacyError('Newsletter record not found.', 404);
    }

    return legacySuccess(serializeNewsletter(item));
  } catch {
    return legacyError('Failed to load newsletter record.', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const item = await Newsletter.findByIdAndUpdate(id, buildPayload(await readRequestData(request)), {
      returnDocument: 'after',
      runValidators: true,
    }).lean();

    if (!item) {
      return legacyError('Newsletter record not found.', 404);
    }

    return legacySuccess(serializeNewsletter(item));
  } catch (error) {
    return legacyError(
      error instanceof Error ? error.message : 'Failed to update newsletter record.',
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
    const deleted = await Newsletter.findByIdAndDelete(id);

    if (!deleted) {
      return legacyError('Newsletter record not found.', 404);
    }

    return legacyMessage('Record Has Been Deleted Successfully');
  } catch {
    return legacyError('Failed to delete newsletter record.', 500);
  }
}
