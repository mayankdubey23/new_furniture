import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Setting from '@/models/Setting';
import { normalizeSiteSetting } from '@/lib/siteSettings';
import {
  cleanString,
  legacyError,
  legacyMessage,
  legacySuccess,
  readRequestData,
} from '@/lib/server/legacyApi';

export const dynamic = 'force-dynamic';

function buildPayload(data: Record<string, unknown>) {
  return {
    map1: cleanString(data.map1),
    map2: cleanString(data.map2),
    address: cleanString(data.address),
    siteName: cleanString(data.siteName),
    email: cleanString(data.email).toLowerCase(),
    phone: cleanString(data.phone),
    whatsapp: cleanString(data.whatsapp),
    facebook: cleanString(data.facebook),
    youtube: cleanString(data.youtube),
    instagram: cleanString(data.instagram),
    linkedin: cleanString(data.linkedin),
    twitter: cleanString(data.twitter),
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const item = await Setting.findById(id).lean();

    if (!item) {
      return legacyError('Setting record not found.', 404);
    }

    return legacySuccess(normalizeSiteSetting(item));
  } catch {
    return legacyError('Failed to load setting record.', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const data = await readRequestData(request);
    const item = await Setting.findByIdAndUpdate(id, buildPayload(data), {
      returnDocument: 'after',
      runValidators: true,
    }).lean();

    if (!item) {
      return legacyError('Setting record not found.', 404);
    }

    return legacySuccess(normalizeSiteSetting(item));
  } catch (error) {
    return legacyError(
      error instanceof Error ? error.message : 'Failed to update setting record.',
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
    const deleted = await Setting.findByIdAndDelete(id);

    if (!deleted) {
      return legacyError('Setting record not found.', 404);
    }

    return legacyMessage('Setting Record Has Been Deleted Successfully');
  } catch {
    return legacyError('Failed to delete setting record.', 500);
  }
}
