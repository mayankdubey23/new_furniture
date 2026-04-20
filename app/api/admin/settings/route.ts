import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { adminMiddleware, syncAdminContactProfile, verifyAdmin } from '@/lib/auth';
import { getAdminSettings, saveAdminSettings } from '@/lib/services/adminSettings';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const settings = await getAdminSettings();
    const admin = await verifyAdmin(request);

    if (!admin) {
      return NextResponse.json(
        {
          maintenanceMode: settings.maintenanceMode,
          maintenanceMessage: settings.maintenanceMessage,
        },
        {
          headers: {
            'Cache-Control': 'no-store',
          },
        }
      );
    }

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
    await syncAdminContactProfile({
      email: settings.adminProfile.email,
      phone: settings.adminProfile.phone,
    });

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
