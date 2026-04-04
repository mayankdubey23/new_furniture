import dbConnect from './mongoose';
import Product from '../models/Product';
import { DEFAULT_PRODUCTS, prepareProductMutationInput } from '@/lib/productCatalog';

export async function seedProducts() {
  await dbConnect();
  const results: string[] = [];

  for (const productData of DEFAULT_PRODUCTS) {
    const existing = await Product.findOne({ category: productData.category });
    const payload = prepareProductMutationInput(productData);

    if (!existing) {
      await Product.create(payload);
      results.push(`Created: ${payload.name}`);
      continue;
    }

    results.push(`Skipped: ${payload.name} (already exists)`);
  }

  return results;
}

if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seedProducts()
    .then((results) => {
      results.forEach((result) => console.log(result));
      console.log('Seed complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

