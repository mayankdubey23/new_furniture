import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import ContactUs from '@/models/ContactUs';
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

function serializeContact(value: Record<string, unknown>) {
  const id = getId(value._id ?? value.id);

  return {
    id,
    _id: id,
    name: cleanString(value.name),
    email: cleanString(value.email),
    phone: cleanString(value.phone),
    subject: cleanString(value.subject),
    message: cleanString(value.message),
    active: cleanBoolean(value.active, true),
    ...(toIsoDateString(value.createdAt) ? { createdAt: toIsoDateString(value.createdAt) } : {}),
    ...(toIsoDateString(value.updatedAt) ? { updatedAt: toIsoDateString(value.updatedAt) } : {}),
  };
}

function buildPayload(data: Record<string, unknown>) {
  return {
    name: cleanString(data.name),
    email: cleanString(data.email).toLowerCase(),
    phone: cleanString(data.phone),
    subject: cleanString(data.subject),
    message: cleanString(data.message),
    active: cleanBoolean(data.active, true),
  };
}

export async function GET() {
  try {
    await dbConnect();
    const items = await ContactUs.find({}).sort({ createdAt: -1 }).lean();
    return legacySuccess(items.map((item) => serializeContact(item)));
  } catch {
    return legacyError('Failed to load contact records.', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await readRequestData(request);
    const payload = buildPayload(data);

    if (!payload.name || !payload.email || !payload.message) {
      return legacyError('Name, email, and message are required.');
    }

    const created = await ContactUs.create(payload);
    return legacySuccess(serializeContact(created.toObject()), { status: 201 });
  } catch (error) {
    return legacyError(
      error instanceof Error ? error.message : 'Failed to create contact record.',
      400
    );
  }
}
