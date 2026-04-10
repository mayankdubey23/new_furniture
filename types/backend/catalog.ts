import type { ProductColorEntry, ProductInput, ProductMedia, ProductSpecs } from '@/lib/productCatalog';
import type { CatalogEntityRecord, CatalogOptionsResponse } from '@/lib/catalogEntities';

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
  mainCategoryId: string | null;
  subCategoryId: string | null;
  brandId: string | null;
  mainCategory: CatalogEntityRecord | null;
  subCategory: CatalogEntityRecord | null;
  brand: CatalogEntityRecord | null;
  mainCategoryName: string;
  subCategoryName: string;
  brandName: string;
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

export type AdminCatalogOptionsResponse = CatalogOptionsResponse;
