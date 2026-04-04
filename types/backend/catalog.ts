import type { ProductColorEntry, ProductInput, ProductMedia, ProductSpecs } from '@/lib/productCatalog';

export type AdminUploadKind = 'image' | 'model';
export type AdminProductMutationRequest = ProductInput;

export interface AdminUploadRequestFields {
  category: string;
  productName: string;
  slot: string;
  kind: AdminUploadKind;
}

export interface AdminUploadResponse {
  path: string;
}

export interface ApiErrorResponse {
  error: string;
}

export interface AdminProductDto {
  _id: string;
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  eyebrow: string;
  modelPath?: string | null;
  images: string[];
  colors: ProductColorEntry[];
  specs: ProductSpecs;
  media: ProductMedia;
}

