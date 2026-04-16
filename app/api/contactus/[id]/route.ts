import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import ContactUs from '@/models/ContactUs';
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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const item = await ContactUs.findById(id).lean();

    if (!item) {
      return legacyError('Contact record not found.', 404);
    }

    return legacySuccess(serializeContact(item));
  } catch {
    return legacyError('Failed to load contact record.', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const item = await ContactUs.findByIdAndUpdate(id, buildPayload(await readRequestData(request)), {
      returnDocument: 'after',
      runValidators: true,
    }).lean();

    if (!item) {
      return legacyError('Contact record not found.', 404);
    }

    return legacySuccess(serializeContact(item));
  } catch (error) {
    return legacyError(
      error instanceof Error ? error.message : 'Failed to update contact record.',
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
    const deleted = await ContactUs.findByIdAndDelete(id);

    if (!deleted) {
      return legacyError('Contact record not found.', 404);
    }

    return legacyMessage('Contactus Record Has Been Deleted');
  } catch {
    return legacyError('Failed to delete contact record.', 500);
  }
}
