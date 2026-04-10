import { Schema, model, models } from 'mongoose';

export interface IMainCategory {
  name: string;
  slug: string;
  pic?: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const MainCategorySchema = new Schema<IMainCategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
    pic: { type: String, default: '' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

MainCategorySchema.index({ name: 1 });

export default models.MainCategory || model('MainCategory', MainCategorySchema);
