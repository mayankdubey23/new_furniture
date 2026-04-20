import 'server-only';

import { redirect } from 'next/navigation';
import { getAdminSettings } from '@/lib/services/adminSettings';

export async function ensureStorefrontAvailable() {
  const settings = await getAdminSettings();

  if (settings.maintenanceMode) {
    redirect('/maintenance');
  }
}
