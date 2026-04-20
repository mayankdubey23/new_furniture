import { Schema, model, models } from 'mongoose';

export interface ICustomerCartItem {
  userId: string;
  lineId: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  selectedColor?: string;
  selectedColorImage?: string;
  selectedSize?: string;
  selectedMaterial?: string;
  selectedFinish?: string;
  selectedAddons?: string[];
  configurationNotes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const CustomerCartItemSchema = new Schema<ICustomerCartItem>(
  {
    userId: { type: String, required: true, trim: true, index: true },
    lineId: { type: String, required: true, trim: true },
    productId: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    selectedColor: { type: String, default: '', trim: true },
    selectedColorImage: { type: String, default: '', trim: true },
    selectedSize: { type: String, default: '', trim: true },
    selectedMaterial: { type: String, default: '', trim: true },
    selectedFinish: { type: String, default: '', trim: true },
    selectedAddons: [{ type: String, trim: true }],
    configurationNotes: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

CustomerCartItemSchema.index({ userId: 1, lineId: 1 }, { unique: true });

export default models.CustomerCartItem ||
  model<ICustomerCartItem>('CustomerCartItem', CustomerCartItemSchema);
