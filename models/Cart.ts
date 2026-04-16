import { Schema, model, models, type Types } from 'mongoose';

export interface ICart {
  user: Types.ObjectId;
  product: Types.ObjectId;
  color?: string;
  size?: string;
  quantity: number;
  total: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const CartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    color: { type: String, default: '', trim: true },
    size: { type: String, default: '', trim: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    total: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true }
);

CartSchema.index({ user: 1, product: 1 }, { unique: true });

export default models.Cart || model<ICart>('Cart', CartSchema);
