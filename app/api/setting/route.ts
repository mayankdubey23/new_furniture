import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Setting from '@/models/Setting';
import { normalizeSiteSetting } from '@/lib/siteSettings';
import {
  cleanString,
  legacyError,
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

export async function GET() {
  try {
    await dbConnect();
    const items = await Setting.find({}).sort({ createdAt: -1 }).lean();
    return legacySuccess(items.map((item) => normalizeSiteSetting(item)));
  } catch {
    return legacyError('Failed to load setting records.', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await readRequestData(request);
    const created = await Setting.create(buildPayload(data));
    return legacySuccess(normalizeSiteSetting(created.toObject()), { status: 201 });
  } catch (error) {
    return legacyError(
      error instanceof Error ? error.message : 'Failed to create setting record.',
      400
    );
  }
}
