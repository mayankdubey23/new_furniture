import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Faq from '@/models/Faq';
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

export async function GET() {
  try {
    await dbConnect();
    const items = await Faq.find({}).sort({ active: -1, createdAt: -1 }).lean();
    return legacySuccess(items.map((item) => serializeFaq(item)));
  } catch {
    return legacyError('Failed to load faq records.', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const payload = buildPayload(await readRequestData(request));

    if (!payload.question || !payload.answer) {
      return legacyError('Question and answer are required.');
    }

    const created = await Faq.create(payload);
    return legacySuccess(serializeFaq(created.toObject()), { status: 201 });
  } catch (error) {
    return legacyError(
      error instanceof Error ? error.message : 'Failed to create faq record.',
      400
    );
  }
}
