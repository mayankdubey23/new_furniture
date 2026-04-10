import { Schema, model, models, type Types } from 'mongoose';
import { slugify } from '@/lib/productCatalog';

export interface IProduct {
  category: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  eyebrow?: string;
  modelPath?: string | null;
  images: string[];
  media?: {
    views: {
      main?: string;
      cover?: string;
      left?: string;
      right?: string;
      top?: string;
      detail?: string;
    };
    gallery: string[];
  };
  colors: { name: string; image: string }[];
  specs?: {
    material?: string;
    foam?: string;
    dimensions?: string;
    weight?: string;
    warranty?: string;
    sections?: Array<{
      title?: string;
      items?: Array<{
        label?: string;
        value?: string;
      }>;
    }>;
  };
  mainCategory?: Types.ObjectId | null;
  subCategory?: Types.ObjectId | null;
  brand?: Types.ObjectId | null;
  mainCategoryName?: string;
  subCategoryName?: string;
  brandName?: string;
  basePrice: number;
  discount: number;
  finalPrice: number;
  inStock: boolean;
  stockQuantity: number;
  size: string[];
  pic: string[];
  color: string[];
  active: boolean;
}

const ProductSchema = new Schema<IProduct>(
  {
    category: { type: String, required: true, trim: true, lowercase: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    imageUrl: { type: String, default: '' },
    eyebrow: { type: String, default: '' },
    modelPath: { type: String, default: null },
    images: [{ type: String }],
    media: {
      views: {
        main: { type: String, default: '' },
        cover: String,
        left: String,
        right: String,
        top: String,
        detail: String,
      },
      gallery: [{ type: String }],
    },
    colors: [
      {
        name: { type: String, required: true, trim: true },
        image: { type: String, required: true, trim: true },
      },
    ],
    specs: {
      material: { type: String, default: '' },
      foam: { type: String, default: '' },
      dimensions: { type: String, default: '' },
      weight: { type: String, default: '' },
      warranty: { type: String, default: '' },
      sections: [
        {
          title: { type: String, trim: true, default: '' },
          items: [
            {
              label: { type: String, trim: true, default: '' },
              value: { type: String, trim: true, default: '' },
            },
          ],
        },
      ],
    },
    mainCategory: { type: Schema.Types.ObjectId, ref: 'MainCategory', default: null, index: true },
    subCategory: { type: Schema.Types.ObjectId, ref: 'SubCategory', default: null, index: true },
    brand: { type: Schema.Types.ObjectId, ref: 'Brand', default: null, index: true },
    mainCategoryName: { type: String, default: '' },
    subCategoryName: { type: String, default: '' },
    brandName: { type: String, default: '' },
    basePrice: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    finalPrice: { type: Number, required: true, min: 0 },
    inStock: { type: Boolean, default: true },
    stockQuantity: { type: Number, default: 0, min: 0 },
    size: [{ type: String, trim: true }],
    pic: [{ type: String }],
    color: [{ type: String, trim: true }],
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ProductSchema.pre('validate', function syncProductFields() {
  if (!this.category && this.mainCategoryName) {
    this.category = slugify(this.mainCategoryName);
  }

  if (!Number.isFinite(this.basePrice)) {
    this.basePrice = Number.isFinite(this.price) ? this.price : 0;
  }

  if (!Number.isFinite(this.finalPrice)) {
    this.finalPrice = Number.isFinite(this.price) ? this.price : this.basePrice;
  }

  this.price = Number.isFinite(this.finalPrice) ? this.finalPrice : this.price;
  this.stockQuantity = Number.isFinite(this.stockQuantity) ? this.stockQuantity : this.stock || 0;
  this.stock = this.stockQuantity;
  this.inStock = typeof this.inStock === 'boolean' ? this.inStock : this.stockQuantity > 0;

  const combinedImages = Array.isArray(this.pic) && this.pic.length
    ? this.pic
    : Array.isArray(this.images)
      ? this.images
      : [];

  this.pic = combinedImages;
  this.images = combinedImages;

  if (!this.imageUrl && combinedImages[0]) {
    this.imageUrl = combinedImages[0];
  }

  if (!this.media) {
    this.media = { views: {}, gallery: [] };
  }

  this.media.gallery = Array.isArray(this.media.gallery) && this.media.gallery.length
    ? this.media.gallery
    : combinedImages;

  if (!this.media.views) {
    this.media.views = {};
  }

  if (!this.media.views.main && this.imageUrl) {
    this.media.views.main = this.imageUrl;
  }

  if ((!this.color || !this.color.length) && Array.isArray(this.colors)) {
    this.color = this.colors.map((entry) => entry.name).filter(Boolean);
  }

  if (!this.eyebrow) {
    this.eyebrow = this.brandName || this.subCategoryName || this.mainCategoryName || '';
  }

});

export default models.Product || model('Product', ProductSchema);
