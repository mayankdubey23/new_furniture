import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Testimonial from '@/models/Testimonial';
import {
  cleanNumber,
  cleanString,
  legacyError,
  legacySuccess,
  readRequestData,
} from '@/lib/server/legacyApi';
import { serializeLegacyTestimonial } from '@/lib/server/legacyRelations';

export const dynamic = 'force-dynamic';

function buildPayload(data: Record<string, unknown>) {
  return {
    user: cleanString(data.user),
    product: cleanString(data.product) || null,
    message: cleanString(data.message),
    star: Math.min(5, Math.max(1, cleanNumber(data.star, 5))),
  };
}

export async function GET() {
  try {
    await dbConnect();
    const items = await Testimonial.find({})
      .populate('user')
      .populate('product')
      .sort({ createdAt: -1 })
      .lean();

    return legacySuccess(
      items
        .map((item) => serializeLegacyTestimonial(item))
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
    );
  } catch {
    return legacyError('Failed to load testimonial records.', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const payload = buildPayload(await readRequestData(request));

    if (!payload.user || !payload.message) {
      return legacyError('User and message are required.');
    }

    const created = await Testimonial.create(payload);
    const item = await Testimonial.findById(created._id).populate('user').populate('product').lean();
    return legacySuccess(serializeLegacyTestimonial(item ?? created.toObject()), { status: 201 });
  } catch (error) {
    return legacyError(
      error instanceof Error ? error.message : 'Failed to create testimonial record.',
      400
    );
  }
}
