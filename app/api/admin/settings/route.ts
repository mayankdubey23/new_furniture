import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import AdminSettings from '@/models/AdminSettings';
import { adminMiddleware } from '@/lib/auth';

const SETTINGS_KEY = 'global';

async function getOrCreateSettings() {
  await dbConnect();

  const settings = await AdminSettings.findOneAndUpdate(
    { key: SETTINGS_KEY },
    { $setOnInsert: { key: SETTINGS_KEY } },
    { new: true, upsert: true }
  ).lean();

  return settings;
}

export async function GET() {
  try {
    const settings = await getOrCreateSettings();
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const authError = await adminMiddleware(request);
  if (authError) return authError;

  try {
    const payload = await request.json();
    await dbConnect();

    const settings = await AdminSettings.findOneAndUpdate(
      { key: SETTINGS_KEY },
      {
        $set: {
          maintenanceMode: Boolean(payload.maintenanceMode),
          maintenanceMessage:
            payload.maintenanceMessage || 'Website is under maintenance. Please visit later.',
          notifications: {
            orderAlerts: payload.notifications?.orderAlerts ?? true,
            lowStockAlerts: payload.notifications?.lowStockAlerts ?? true,
          },
          adminProfile: {
            displayName: payload.adminProfile?.displayName || 'LUXE Administrator',
            email: payload.adminProfile?.email || 'admin@luxe.local',
          },
        },
      },
      { new: true, upsert: true }
    ).lean();

    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
