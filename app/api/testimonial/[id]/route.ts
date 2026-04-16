import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Testimonial from '@/models/Testimonial';
import {
  cleanNumber,
  cleanString,
  legacyError,
  legacyMessage,
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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const item = await Testimonial.findById(id).populate('user').populate('product').lean();

    if (!item) {
      return legacyError('Testimonial record not found.', 404);
    }

    return legacySuccess(serializeLegacyTestimonial(item));
  } catch {
    return legacyError('Failed to load testimonial record.', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const item = await Testimonial.findByIdAndUpdate(id, buildPayload(await readRequestData(request)), {
      returnDocument: 'after',
      runValidators: true,
    })
      .populate('user')
      .populate('product')
      .lean();

    if (!item) {
      return legacyError('Testimonial record not found.', 404);
    }

    return legacySuccess(serializeLegacyTestimonial(item));
  } catch (error) {
    return legacyError(
      error instanceof Error ? error.message : 'Failed to update testimonial record.',
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
    const deleted = await Testimonial.findByIdAndDelete(id);

    if (!deleted) {
      return legacyError('Testimonial record not found.', 404);
    }

    return legacyMessage('Record Has Been Deleted Successfully');
  } catch {
    return legacyError('Failed to delete testimonial record.', 500);
  }
}
