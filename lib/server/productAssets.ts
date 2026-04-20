import 'server-only';

import {
  DEFAULT_PRODUCTS,
  normalizeProduct,
  type ProductRecord,
} from '@/lib/productCatalog';
import { PRODUCT_UPLOAD_PUBLIC_BASE } from '@/lib/server/uploadStorage';

const DEFAULT_MODEL_BY_CATEGORY = new Map(
  DEFAULT_PRODUCTS.map((product) => {
    const normalized = normalizeProduct(product, product.category);
    return [normalized.category, normalized.modelPath ?? null];
  })
);

function cleanAssetPath(value: string | null | undefined) {
  return typeof value === 'string' ? value.trim() : '';
}

function isAbsoluteAssetUrl(value: string) {
  return /^(?:https?:)?\/\//i.test(value);
}

function getFallbackModelPath(category: string) {
  return (
    DEFAULT_MODEL_BY_CATEGORY.get(category) ??
    DEFAULT_MODEL_BY_CATEGORY.get('sofa') ??
    null
  );
}

export async function resolveRenderableModelPath(
  product: Pick<ProductRecord, 'category' | 'modelPath'>
) {
  const modelPath = cleanAssetPath(product.modelPath);
  const normalizedModelPath = modelPath.split(/[?#]/, 1)[0] || modelPath;
  const fallbackModelPath = getFallbackModelPath(product.category);

  if (!modelPath) {
    return fallbackModelPath;
  }

  if (!/\.glb(?:[?#].*)?$/i.test(modelPath)) {
    return fallbackModelPath;
  }

  if (isAbsoluteAssetUrl(modelPath)) {
    return modelPath;
  }

  if (
    normalizedModelPath.startsWith(PRODUCT_UPLOAD_PUBLIC_BASE) ||
    normalizedModelPath.startsWith('/uploads/')
  ) {
    return fallbackModelPath;
  }

  // Trust bundled public asset paths without touching the filesystem.
  if (normalizedModelPath.startsWith('/')) {
    return modelPath;
  }

  return fallbackModelPath;
}

export async function ensureRenderableProductAssets(product: ProductRecord) {
  const modelPath = await resolveRenderableModelPath(product);

  if (modelPath === product.modelPath) {
    return product;
  }

  return {
    ...product,
    modelPath,
  };
}

export function ensureRenderableProductAssetList(products: ProductRecord[]) {
  return Promise.all(products.map((product) => ensureRenderableProductAssets(product)));
}
