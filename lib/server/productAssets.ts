import 'server-only';

import { type ProductRecord } from '@/lib/productCatalog';

function cleanAssetPath(value: string | null | undefined) {
  return typeof value === 'string' ? value.trim() : '';
}

function isAbsoluteAssetUrl(value: string) {
  return /^(?:https?:)?\/\//i.test(value);
}

export async function resolveRenderableModelPath(
  product: Pick<ProductRecord, 'modelPath'>
) {
  const modelPath = cleanAssetPath(product.modelPath);
  const normalizedModelPath = modelPath.split(/[?#]/, 1)[0] || modelPath;

  if (!modelPath) {
    return null;
  }

  if (!/\.glb(?:[?#].*)?$/i.test(modelPath)) {
    return null;
  }

  if (isAbsoluteAssetUrl(modelPath)) {
    return modelPath;
  }

  if (normalizedModelPath.startsWith('/uploads/')) {
    return modelPath;
  }

  // Trust bundled public asset paths without touching the filesystem.
  if (normalizedModelPath.startsWith('/')) {
    return modelPath;
  }

  return null;
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
