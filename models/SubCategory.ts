import { Schema, model, models } from 'mongoose';

export interface ISubCategory {
  name: string;
  slug: string;
  pic?: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const SubCategorySchema = new Schema<ISubCategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
    pic: { type: String, default: '' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

SubCategorySchema.index({ name: 1 });

export default models.SubCategory || model('SubCategory', SubCategorySchema);
