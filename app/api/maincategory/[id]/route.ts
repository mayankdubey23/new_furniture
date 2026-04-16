import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import MainCategory from '@/models/MainCategory';
import {
  legacyError,
  legacyMessage,
  legacySuccess,
  readRequestData,
} from '@/lib/server/legacyApi';
import {
  buildLegacyCatalogPayload,
  serializeLegacyCatalogEntity,
} from '@/lib/server/legacyCatalog';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const item = await MainCategory.findById(id).lean();

    if (!item) {
      return legacyError('Main category record not found.', 404);
    }

    return legacySuccess(serializeLegacyCatalogEntity(item));
  } catch {
    return legacyError('Failed to load main category record.', 500);
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
    const payload = await buildLegacyCatalogPayload(data, 'maincategory', 'Main category');
    const item = await MainCategory.findByIdAndUpdate(id, payload, {
      returnDocument: 'after',
      runValidators: true,
    }).lean();

    if (!item) {
      return legacyError('Main category record not found.', 404);
    }

    return legacySuccess(serializeLegacyCatalogEntity(item));
  } catch (error) {
    return legacyError(
      error instanceof Error ? error.message : 'Failed to update main category record.',
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
    const deleted = await MainCategory.findByIdAndDelete(id);

    if (!deleted) {
      return legacyError('Main category record not found.', 404);
    }

    return legacyMessage('Maincategory Record Has Been Deleted Successfully');
  } catch {
    return legacyError('Failed to delete main category record.', 500);
  }
}
