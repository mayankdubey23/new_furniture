import { Schema, model, models } from 'mongoose';

export interface IContactUs {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const ContactUsSchema = new Schema<IContactUs>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: '', trim: true },
    subject: { type: String, default: '', trim: true },
    message: { type: String, required: true, trim: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.ContactUs || model<IContactUs>('ContactUs', ContactUsSchema);
