import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Faq from '@/models/Faq';
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

function serializeFaq(value: Record<string, unknown>) {
  const id = getId(value._id ?? value.id);

  return {
    id,
    _id: id,
    question: cleanString(value.question),
    answer: cleanString(value.answer),
    active: cleanBoolean(value.active, true),
    ...(toIsoDateString(value.createdAt) ? { createdAt: toIsoDateString(value.createdAt) } : {}),
    ...(toIsoDateString(value.updatedAt) ? { updatedAt: toIsoDateString(value.updatedAt) } : {}),
  };
}

function buildPayload(data: Record<string, unknown>) {
  return {
    question: cleanString(data.question),
    answer: cleanString(data.answer),
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
    const item = await Faq.findById(id).lean();

    if (!item) {
      return legacyError('Faq record not found.', 404);
    }

    return legacySuccess(serializeFaq(item));
  } catch {
    return legacyError('Failed to load faq record.', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const item = await Faq.findByIdAndUpdate(id, buildPayload(await readRequestData(request)), {
      returnDocument: 'after',
      runValidators: true,
    }).lean();

    if (!item) {
      return legacyError('Faq record not found.', 404);
    }

    return legacySuccess(serializeFaq(item));
  } catch (error) {
    return legacyError(
      error instanceof Error ? error.message : 'Failed to update faq record.',
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
    const deleted = await Faq.findByIdAndDelete(id);

    if (!deleted) {
      return legacyError('Faq record not found.', 404);
    }

    return legacyMessage('Record Has Been Deleted Successfully');
  } catch {
    return legacyError('Failed to delete faq record.', 500);
  }
}
