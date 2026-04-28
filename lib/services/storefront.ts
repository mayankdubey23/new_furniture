import 'server-only';

import dbConnect from '@/lib/mongoose';
import Product from '@/models/Product';
import {
  buildStorefrontCollectionLinks,
  DEFAULT_PRODUCTS,
  ensureFeaturedProducts,
  matchesProductRouteSegment,
  normalizeProduct,
  type ProductRecord,
  type StorefrontCollectionLink,
} from '@/lib/productCatalog';
import {
  fetchServerJson,
  getExternalProductsPath,
  getServerDataSource,
} from '@/lib/api/server';
import { readMockDatabase } from '@/lib/mocks/serverDb';
import {
  ensureRenderableProductAssetList,
  ensureRenderableProductAssets,
} from '@/lib/server/productAssets';

type NormalizableProduct = Parameters<typeof normalizeProduct>[0];

function getDefaultProducts() {
  return DEFAULT_PRODUCTS.map((product) => normalizeProduct(product, product.category));
}

async function getInternalProducts() {
  try {
    await dbConnect();
    const products = await Product.find({})
      .populate('mainCategory')
      .populate('subCategory')
      .populate('brand')
      .sort({ createdAt: 1, name: 1 })
      .lean();

    if (!products.length) {
      return getDefaultProducts();
    }

    return ensureRenderableProductAssetList(
      products.map((product) => normalizeProduct(product as NormalizableProduct))
    );
  } catch {
    return getDefaultProducts();
  }
}

async function getMockProducts() {
  try {
    const database = await readMockDatabase();
    const products = Array.isArray(database.products) ? database.products : [];

    if (!products.length) {
      return getDefaultProducts();
    }

    return ensureRenderableProductAssetList(
      products.map((product) => normalizeProduct(product as NormalizableProduct))
    );
  } catch {
    return getDefaultProducts();
  }
}

async function getExternalProducts() {
  try {
    const [products, fallbackProducts] = await Promise.all([
      fetchServerJson<unknown[]>(getExternalProductsPath()),
      getInternalProducts(),
    ]);

    if (!Array.isArray(products) || !products.length) {
      return fallbackProducts;
    }

    const mergedProducts = new Map<string, ProductRecord>();

    for (const product of fallbackProducts) {
      mergedProducts.set(product.id, product);
    }

    for (const product of products) {
      const normalizedProduct = normalizeProduct(product as NormalizableProduct);
      mergedProducts.set(normalizedProduct.id, normalizedProduct);
    }

    return ensureRenderableProductAssetList(
      Array.from(mergedProducts.values())
    );
  } catch {
    return getInternalProducts();
  }
}

export async function getAllProducts(): Promise<ProductRecord[]> {
  const source = getServerDataSource();

  if (source === 'mock') {
    return getMockProducts();
  }

  if (source === 'external') {
    return getExternalProducts();
  }

  return getInternalProducts();
}

export async function getStorefrontProducts(): Promise<ProductRecord[]> {
  const products = await getAllProducts();
  const visibleProducts = products.filter((product) => product.active !== false);

  return visibleProducts.length ? visibleProducts : products;
}

export async function getFeaturedProducts(): Promise<ProductRecord[]> {
  const products = await getAllProducts();
  return ensureFeaturedProducts(products);
}

export async function getStorefrontCollectionLinks(): Promise<StorefrontCollectionLink[]> {
  const products = await getFeaturedProducts();
  return buildStorefrontCollectionLinks(products);
}

export async function getProductById(id: string): Promise<ProductRecord | null> {
  const normalizedId = String(id || '').trim();

  if (!normalizedId) {
    return null;
  }

  const source = getServerDataSource();

  if (source === 'internal') {
    try {
      await dbConnect();
      const product = await Product.findById(normalizedId)
        .populate('mainCategory')
        .populate('subCategory')
        .populate('brand')
        .lean();

      if (product) {
        return ensureRenderableProductAssets(normalizeProduct(product));
      }
    } catch {

    }
  }

  if (source === 'external') {
    try {
      const product = await fetchServerJson<unknown>(
        `${getExternalProductsPath()}/${encodeURIComponent(normalizedId)}`
      );
      return ensureRenderableProductAssets(
        normalizeProduct(product as NormalizableProduct)
      );
    } catch {

    }
  }

  const products = await getAllProducts();

  const matchedProduct =
    products.find((product) => {
      return matchesProductRouteSegment(product, normalizedId);
    }) || null;

  return matchedProduct ? ensureRenderableProductAssets(matchedProduct) : null;
}
