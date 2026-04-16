import { Schema, model, models } from 'mongoose';

export interface IFeature {
  name: string;
  shortDescription: string;
  icon?: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const FeatureSchema = new Schema<IFeature>(
  {
    name: { type: String, required: true, trim: true },
    shortDescription: { type: String, required: true, trim: true },
    icon: { type: String, default: '', trim: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.Feature || model<IFeature>('Feature', FeatureSchema);
