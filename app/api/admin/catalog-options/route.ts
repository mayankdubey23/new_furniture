import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import MainCategory from '@/models/MainCategory';
import SubCategory from '@/models/SubCategory';
import Brand from '@/models/Brand';
import { normalizeCatalogEntity, sortCatalogEntities } from '@/lib/catalogEntities';

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
    const query = getActiveQuery(active);
    const [mainCategories, subCategories, brands] = await Promise.all([
      MainCategory.find(query).sort({ active: -1, name: 1 }).lean(),
      SubCategory.find(query).sort({ active: -1, name: 1 }).lean(),
      Brand.find(query).sort({ active: -1, name: 1 }).lean(),
    ]);

    const response = {
      mainCategories: sortCatalogEntities(
        mainCategories
          .map((entity) => normalizeCatalogEntity(entity))
          .filter((entity): entity is NonNullable<typeof entity> => Boolean(entity))
      ),
      subCategories: sortCatalogEntities(
        subCategories
          .map((entity) => normalizeCatalogEntity(entity))
          .filter((entity): entity is NonNullable<typeof entity> => Boolean(entity))
      ),
      brands: sortCatalogEntities(
        brands
          .map((entity) => normalizeCatalogEntity(entity))
          .filter((entity): entity is NonNullable<typeof entity> => Boolean(entity))
      ),
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to load catalog options.' }, { status: 500 });
  }
}
