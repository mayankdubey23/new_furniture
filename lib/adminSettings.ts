import {
  DEFAULT_SITE_CONTENT,
  normalizeSiteContent,
  type SiteContent,
} from '@/lib/content/siteContent';

export interface AdminSettingsState {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  notifications: {
    orderAlerts: boolean;
    lowStockAlerts: boolean;
  };
  adminProfile: {
    displayName: string;
    email: string;
  };
  siteContent: SiteContent;
}

export const DEFAULT_ADMIN_SETTINGS: AdminSettingsState = {
  maintenanceMode: false,
  maintenanceMessage: 'Website is under maintenance. Please visit later.',
  notifications: {
    orderAlerts: true,
    lowStockAlerts: true,
  },
  adminProfile: {
    displayName: 'LUXE Administrator',
    email: 'admin@luxe.local',
  },
  siteContent: DEFAULT_SITE_CONTENT,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readString(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function readBoolean(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback;
}

export function normalizeAdminSettings(value: unknown): AdminSettingsState {
  const source = isRecord(value) ? value : {};
  const notifications = isRecord(source.notifications) ? source.notifications : {};
  const adminProfile = isRecord(source.adminProfile) ? source.adminProfile : {};
  const siteContentSource =
    source.siteContent ??
    {
      hero: source.hero,
      footer: source.footer,
    };

  return {
    maintenanceMode: readBoolean(
      source.maintenanceMode,
      DEFAULT_ADMIN_SETTINGS.maintenanceMode
    ),
    maintenanceMessage: readString(
      source.maintenanceMessage,
      DEFAULT_ADMIN_SETTINGS.maintenanceMessage
    ),
    notifications: {
      orderAlerts: readBoolean(
        notifications.orderAlerts,
        DEFAULT_ADMIN_SETTINGS.notifications.orderAlerts
      ),
      lowStockAlerts: readBoolean(
        notifications.lowStockAlerts,
        DEFAULT_ADMIN_SETTINGS.notifications.lowStockAlerts
      ),
    },
    adminProfile: {
      displayName: readString(
        adminProfile.displayName,
        DEFAULT_ADMIN_SETTINGS.adminProfile.displayName
      ),
      email: readString(adminProfile.email, DEFAULT_ADMIN_SETTINGS.adminProfile.email),
    },
    siteContent: normalizeSiteContent(siteContentSource),
  };
}
