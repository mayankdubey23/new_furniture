import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Brand from '@/models/Brand';
import { legacyError, legacySuccess, readRequestData } from '@/lib/server/legacyApi';
import {
  buildLegacyCatalogPayload,
  serializeLegacyCatalogEntity,
} from '@/lib/server/legacyCatalog';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    const items = await Brand.find({}).sort({ active: -1, name: 1 }).lean();

    return legacySuccess(
      items
        .map((item) => serializeLegacyCatalogEntity(item))
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
    );
  } catch {
    return legacyError('Failed to load brand records.', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await readRequestData(request);
    const payload = await buildLegacyCatalogPayload(data, 'brand', 'Brand');
    const created = await Brand.create(payload);

    return legacySuccess(serializeLegacyCatalogEntity(created.toObject()), { status: 201 });
  } catch (error) {
    return legacyError(
      error instanceof Error ? error.message : 'Failed to create brand record.',
      400
    );
  }
}
