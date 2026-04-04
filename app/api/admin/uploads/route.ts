import { NextRequest, NextResponse } from 'next/server';
import { adminMiddleware } from '@/lib/auth';
import { saveProductUpload } from '@/lib/server/uploadStorage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const authError = await adminMiddleware(request);
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const category = String(formData.get('category') || 'general');
    const productName = String(formData.get('productName') || 'draft-product');
    const slot = String(formData.get('slot') || 'asset');
    const kind = String(formData.get('kind') || 'image') === 'model' ? 'model' : 'image';

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Please select a file to upload.' }, { status: 400 });
    }

    const result = await saveProductUpload({
      file,
      category,
      productName,
      slot,
      kind,
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
