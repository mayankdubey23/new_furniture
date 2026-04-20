import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Product from '@/models/Product';
import {
  cleanString,
  legacyError,
  legacySuccess,
  readRequestData,
} from '@/lib/server/legacyApi';
import {
  buildLegacyProductPayload,
  serializeLegacyProduct,
} from '@/lib/server/legacyProduct';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const category = cleanString(request.nextUrl.searchParams.get('category'));
    const mainCategory = cleanString(
      request.nextUrl.searchParams.get('maincategory') ??
        request.nextUrl.searchParams.get('mainCategory')
    );
    const subCategory = cleanString(
      request.nextUrl.searchParams.get('subcategory') ??
        request.nextUrl.searchParams.get('subCategory')
    );
    const brand = cleanString(request.nextUrl.searchParams.get('brand'));
    const activeValue = request.nextUrl.searchParams.get('active');
    const query: Record<string, unknown> = {};

    if (category) query.category = category.toLowerCase();
    if (mainCategory) query.mainCategory = mainCategory;
    if (subCategory) query.subCategory = subCategory;
    if (brand) query.brand = brand;
    if (activeValue === 'true') query.active = true;
    if (activeValue === 'false') query.active = false;

    const items = await Product.find(query)
      .populate('mainCategory')
      .populate('subCategory')
      .populate('brand')
      .sort({ createdAt: 1, name: 1 })
      .lean();

    return legacySuccess(items.map((item) => serializeLegacyProduct(item)));
  } catch {
    return legacyError('Failed to load product records.', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await readRequestData(request);
    const payload = await buildLegacyProductPayload(data);
    const created = await Product.create(payload);
    const item = await Product.findById(created._id)
      .populate('mainCategory')
      .populate('subCategory')
      .populate('brand')
      .lean();

    return legacySuccess(serializeLegacyProduct(item ?? created.toObject()), { status: 201 });
  } catch (error) {
    return legacyError(
      error instanceof Error ? error.message : 'Failed to create product record.',
      400
    );
  }
}
