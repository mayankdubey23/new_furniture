import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import SubCategory from '@/models/SubCategory';
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
    const item = await SubCategory.findById(id).lean();

    if (!item) {
      return legacyError('Subcategory record not found.', 404);
    }

    return legacySuccess(serializeLegacyCatalogEntity(item));
  } catch {
    return legacyError('Failed to load subcategory record.', 500);
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
    const payload = await buildLegacyCatalogPayload(data, 'subcategory', 'Subcategory');
    const item = await SubCategory.findByIdAndUpdate(id, payload, {
      returnDocument: 'after',
      runValidators: true,
    }).lean();

    if (!item) {
      return legacyError('Subcategory record not found.', 404);
    }

    return legacySuccess(serializeLegacyCatalogEntity(item));
  } catch (error) {
    return legacyError(
      error instanceof Error ? error.message : 'Failed to update subcategory record.',
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
    const deleted = await SubCategory.findByIdAndDelete(id);

    if (!deleted) {
      return legacyError('Subcategory record not found.', 404);
    }

    return legacyMessage('Record Has Been Deleted Successfully', undefined, 'reason');
  } catch {
    return legacyError('Failed to delete subcategory record.', 500);
  }
}
