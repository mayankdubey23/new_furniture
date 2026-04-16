import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Brand from '@/models/Brand';
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
    const item = await Brand.findById(id).lean();

    if (!item) {
      return legacyError('Brand record not found.', 404);
    }

    return legacySuccess(serializeLegacyCatalogEntity(item));
  } catch {
    return legacyError('Failed to load brand record.', 500);
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
    const payload = await buildLegacyCatalogPayload(data, 'brand', 'Brand');
    const item = await Brand.findByIdAndUpdate(id, payload, {
      returnDocument: 'after',
      runValidators: true,
    }).lean();

    if (!item) {
      return legacyError('Brand record not found.', 404);
    }

    return legacySuccess(serializeLegacyCatalogEntity(item));
  } catch (error) {
    return legacyError(
      error instanceof Error ? error.message : 'Failed to update brand record.',
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
    const deleted = await Brand.findByIdAndDelete(id);

    if (!deleted) {
      return legacyError('Brand record not found.', 404);
    }

    return legacyMessage('Record Has Been Deleted Successfully');
  } catch {
    return legacyError('Failed to delete brand record.', 500);
  }
}
