import { Schema, model, models } from 'mongoose';
import { PRODUCT_CATEGORIES } from '@/lib/productCatalog';

export interface IProduct {
  category: string;
  name: string;
  description: string;
  price: number;
  stock?: number;
  imageUrl: string;
  eyebrow: string;
  modelPath?: string | null;
  images: string[];
  media?: {
    views: {
      main: string;
      cover?: string;
      left?: string;
      right?: string;
      top?: string;
      detail?: string;
    };
    gallery: string[];
  };
  colors: { name: string; image: string }[];
  specs: {
    material: string;
    foam?: string;
    dimensions: string;
    weight: string;
    warranty: string;
  };
}

const ProductSchema = new Schema<IProduct>({
  category: { type: String, enum: PRODUCT_CATEGORIES, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  imageUrl: { type: String, required: true },
  eyebrow: { type: String, required: true },
  modelPath: { type: String, default: null },
  images: [{ type: String }],
  media: {
    views: {
      main: { type: String, required: true },
      cover: String,
      left: String,
      right: String,
      top: String,
      detail: String,
    },
    gallery: [{ type: String }],
  },
  colors: [{
    name: { type: String, required: true },
    image: { type: String, required: true },
  }],
  specs: {
    material: { type: String, required: true },
    foam: String,
    dimensions: { type: String, required: true },
    weight: { type: String, required: true },
    warranty: { type: String, required: true },
  },
}, { timestamps: true });

export default models.Product || model('Product', ProductSchema);

