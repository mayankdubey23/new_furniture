import 'server-only';

import { cache } from 'react';
import dbConnect from '@/lib/mongoose';
import Product from '@/models/Product';
import {
  DEFAULT_PRODUCTS,
  ensureFeaturedProducts,
  normalizeProduct,
  type ProductRecord,
} from '@/lib/productCatalog';

export const getAllProducts = cache(async (): Promise<ProductRecord[]> => {
  try {
    await dbConnect();
    const products = await Product.find({}).sort({ category: 1, name: 1 }).lean();

    if (!products.length) {
      return DEFAULT_PRODUCTS.map((product) => normalizeProduct(product, product.category));
    }

    return products.map((product) => normalizeProduct(product));
  } catch {
    return DEFAULT_PRODUCTS.map((product) => normalizeProduct(product, product.category));
  }
});

export const getFeaturedProducts = cache(async (): Promise<ProductRecord[]> => {
  const products = await getAllProducts();
  return ensureFeaturedProducts(products);
});

export const getProductById = cache(async (id: string): Promise<ProductRecord | null> => {
  try {
    await dbConnect();
    const product = await Product.findById(id).lean();
    return product ? normalizeProduct(product) : null;
  } catch {
    return null;
  }
});

