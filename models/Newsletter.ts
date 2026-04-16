import { Schema, model, models } from 'mongoose';

export interface INewsletter {
  email: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const NewsletterSchema = new Schema<INewsletter>(
  {
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.Newsletter || model<INewsletter>('Newsletter', NewsletterSchema);
