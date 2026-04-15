import 'server-only';

import dbConnect from '@/lib/mongoose';
import { DEFAULT_ADMIN_SETTINGS, normalizeAdminSettings, type AdminSettingsState } from '@/lib/adminSettings';
import { getServerDataSource } from '@/lib/api/server';
import { readMockDatabase } from '@/lib/mocks/serverDb';
import AdminSettings from '@/models/AdminSettings';

const SETTINGS_KEY = 'global';

export async function getAdminSettings(): Promise<AdminSettingsState> {
  const source = getServerDataSource();

  if (source === 'mock') {
    try {
      const database = (await readMockDatabase()) as {
        adminSettings?: unknown;
        siteContent?: unknown;
      };

      return normalizeAdminSettings({
        ...(typeof database.adminSettings === 'object' ? database.adminSettings : {}),
        siteContent: database.siteContent,
      });
    } catch {
      return DEFAULT_ADMIN_SETTINGS;
    }
  }

  if (source === 'external') {
    return DEFAULT_ADMIN_SETTINGS;
  }

  try {
    await dbConnect();

    const settings = await AdminSettings.findOneAndUpdate(
      { key: SETTINGS_KEY },
      { $setOnInsert: { key: SETTINGS_KEY } },
      { returnDocument: 'after', upsert: true }
    ).lean();

    return normalizeAdminSettings(settings);
  } catch {
    return DEFAULT_ADMIN_SETTINGS;
  }
}

export async function saveAdminSettings(value: unknown): Promise<AdminSettingsState> {
  const payload = normalizeAdminSettings(value);

  await dbConnect();

  const settings = await AdminSettings.findOneAndUpdate(
    { key: SETTINGS_KEY },
    {
      $set: payload,
      $setOnInsert: { key: SETTINGS_KEY },
    },
    { returnDocument: 'after', upsert: true }
  ).lean();

  return normalizeAdminSettings(settings);
}
