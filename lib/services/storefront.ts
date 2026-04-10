import 'server-only';

import { cache } from 'react';
import dbConnect from '@/lib/mongoose';
import Product from '@/models/Product';
import {
  buildStorefrontCollectionLinks,
  DEFAULT_PRODUCTS,
  ensureFeaturedProducts,
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
      .sort({ category: 1, name: 1 })
      .lean();

    if (!products.length) {
      return getDefaultProducts();
    }

    return products.map((product) => normalizeProduct(product as NormalizableProduct));
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

    return products.map((product) => normalizeProduct(product as NormalizableProduct));
  } catch {
    return getDefaultProducts();
  }
}

async function getExternalProducts() {
  try {
    const products = await fetchServerJson<unknown[]>(getExternalProductsPath());

    if (!Array.isArray(products) || !products.length) {
      return getDefaultProducts();
    }

    return products.map((product) => normalizeProduct(product as NormalizableProduct));
  } catch {
    return getDefaultProducts();
  }
}

export const getAllProducts = cache(async (): Promise<ProductRecord[]> => {
  const source = getServerDataSource();

  if (source === 'mock') {
    return getMockProducts();
  }

  if (source === 'external') {
    return getExternalProducts();
  }

  return getInternalProducts();
});

export const getFeaturedProducts = cache(async (): Promise<ProductRecord[]> => {
  const products = await getAllProducts();
  return ensureFeaturedProducts(products);
});

export const getStorefrontCollectionLinks = cache(async (): Promise<StorefrontCollectionLink[]> => {
  const products = await getFeaturedProducts();
  return buildStorefrontCollectionLinks(products);
});

export const getProductById = cache(async (id: string): Promise<ProductRecord | null> => {
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
        return normalizeProduct(product);
      }
    } catch {

    }
  }

  if (source === 'external') {
    try {
      const product = await fetchServerJson<unknown>(
        `${getExternalProductsPath()}/${encodeURIComponent(normalizedId)}`
      );
      return normalizeProduct(product as NormalizableProduct);
    } catch {

    }
  }

  const products = await getAllProducts();

  return (
    products.find((product) => {
      const productId = String(product.id || '').trim();
      const objectId = String(product._id || '').trim();
      return productId === normalizedId || objectId === normalizedId;
    }) || null
  );
});
