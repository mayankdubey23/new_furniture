import { Schema, model, models } from 'mongoose';

export interface ISetting {
  map1?: string;
  map2?: string;
  address?: string;
  siteName?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  facebook?: string;
  youtube?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const SettingSchema = new Schema<ISetting>(
  {
    map1: { type: String, default: '', trim: true },
    map2: { type: String, default: '', trim: true },
    address: { type: String, default: '', trim: true },
    siteName: { type: String, default: '', trim: true },
    email: { type: String, default: '', trim: true, lowercase: true },
    phone: { type: String, default: '', trim: true },
    whatsapp: { type: String, default: '', trim: true },
    facebook: { type: String, default: '', trim: true },
    youtube: { type: String, default: '', trim: true },
    instagram: { type: String, default: '', trim: true },
    linkedin: { type: String, default: '', trim: true },
    twitter: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

export default models.Setting || model<ISetting>('Setting', SettingSchema);
