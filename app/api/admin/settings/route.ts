import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { adminMiddleware } from '@/lib/auth';
import { getAdminSettings, saveAdminSettings } from '@/lib/services/adminSettings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await getAdminSettings();
    return NextResponse.json(settings, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const authError = await adminMiddleware(request);
  if (authError) return authError;

  try {
    const payload = await request.json();
    const settings = await saveAdminSettings(payload);

    revalidatePath('/', 'layout');
    revalidatePath('/admin');
    revalidatePath('/maintenance');

    return NextResponse.json(settings, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
