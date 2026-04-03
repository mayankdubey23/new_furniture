import { Schema, model, models } from 'mongoose';

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
  };
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
      displayName: { type: String, default: 'LUXE Administrator' },
      email: { type: String, default: 'admin@luxe.local' },
    },
  },
  { timestamps: true }
);

export default models.AdminSettings || model('AdminSettings', AdminSettingsSchema);
