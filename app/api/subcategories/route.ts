import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { adminMiddleware } from '@/lib/auth';
import SubCategory from '@/models/SubCategory';
import {
  normalizeCatalogEntity,
  prepareCatalogEntityMutationInput,
  sortCatalogEntities,
} from '@/lib/catalogEntities';

export const dynamic = 'force-dynamic';

function getActiveQuery(value: string | null) {
  if (value === 'true') return { active: true };
  if (value === 'false') return { active: false };
  return {};
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const active = request.nextUrl.searchParams.get('active');
    const entities = await SubCategory.find(getActiveQuery(active)).sort({ active: -1, name: 1 }).lean();
    const normalized = sortCatalogEntities(
      entities
        .map((entity) => normalizeCatalogEntity(entity))
        .filter((entity): entity is NonNullable<typeof entity> => Boolean(entity))
    );

    return NextResponse.json(normalized, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to load subcategories.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = await adminMiddleware(request);
  if (authError) return authError;

  try {
    await dbConnect();
    const data = await request.json();
    const payload = prepareCatalogEntityMutationInput(data, 'Subcategory');
    const entity = await SubCategory.create(payload);

    return NextResponse.json(normalizeCatalogEntity(entity.toObject()), {
      status: 201,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create subcategory.' },
      { status: 400 }
    );
  }
}
