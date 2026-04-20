import { Schema, model, models } from 'mongoose';
import { DEFAULT_SITE_CONTENT, type SiteContent } from '@/lib/content/siteContent';
import { ADMIN_CONTACT_EMAIL, DEFAULT_ADMIN_DISPLAY_NAME } from '@/lib/brand';

export interface IAdminSettings {
  key: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  notifications: {
    orderAlerts: boolean;
    lowStockAlerts: boolean;
  };
  adminProfile: {
    displayName: string;
    email: string;
    phone: string;
  };
  siteContent: SiteContent;
}

const AdminSettingsSchema = new Schema<IAdminSettings>(
  {
    key: { type: String, required: true, unique: true, default: 'global' },
    maintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: {
      type: String,
      default: 'Website is under maintenance. Please visit later.',
    },
    notifications: {
      orderAlerts: { type: Boolean, default: true },
      lowStockAlerts: { type: Boolean, default: true },
    },
    adminProfile: {
      displayName: { type: String, default: DEFAULT_ADMIN_DISPLAY_NAME },
      email: { type: String, default: ADMIN_CONTACT_EMAIL },
      phone: { type: String, default: '', trim: true },
    },
    siteContent: {
      type: Schema.Types.Mixed,
      default: () => JSON.parse(JSON.stringify(DEFAULT_SITE_CONTENT)),
    },
  },
  { timestamps: true }
);

export default models.AdminSettings || model('AdminSettings', AdminSettingsSchema);
