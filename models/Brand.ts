import { Schema, model, models } from 'mongoose';

export interface IBrand {
  name: string;
  slug: string;
  pic?: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const BrandSchema = new Schema<IBrand>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
    pic: { type: String, default: '' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

BrandSchema.index({ name: 1 });

export default models.Brand || model('Brand', BrandSchema);
