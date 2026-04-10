import { NextRequest, NextResponse } from 'next/server';
import { adminMiddleware } from '@/lib/auth';
import {
  saveCatalogUpload,
  saveProductUpload,
  type CatalogUploadCollection,
} from '@/lib/server/uploadStorage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const authError = await adminMiddleware(request);
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const scope = String(formData.get('scope') || 'product') === 'catalog' ? 'catalog' : 'product';
    const collection = String(formData.get('collection') || '');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Please select a file to upload.' }, { status: 400 });
    }

    if (
      scope === 'catalog' &&
      !(['maincategory', 'subcategory', 'brand'] as CatalogUploadCollection[]).includes(
        collection as CatalogUploadCollection
      )
    ) {
      return NextResponse.json({ error: 'Invalid catalog collection.' }, { status: 400 });
    }

    const result =
      scope === 'catalog'
        ? await saveCatalogUpload({
            file,
            collection: collection as CatalogUploadCollection,
            entityName: String(formData.get('entityName') || 'item'),
          })
        : await saveProductUpload({
            file,
            category: String(formData.get('category') || 'general'),
            productName: String(formData.get('productName') || 'draft-product'),
            slot: String(formData.get('slot') || 'asset'),
            kind: String(formData.get('kind') || 'image') === 'model' ? 'model' : 'image',
          });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(
      {
        path: result.path,
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch {
    return NextResponse.json({ error: 'Upload failed.' }, { status: 500 });
  }
}
