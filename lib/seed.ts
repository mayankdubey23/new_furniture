import dbConnect from './mongoose';
import Product from '../models/Product';
import MainCategory from '@/models/MainCategory';
import SubCategory from '@/models/SubCategory';
import Brand from '@/models/Brand';
import { slugifyCatalogValue } from '@/lib/catalogEntities';
import { DEFAULT_PRODUCTS, prepareProductMutationInput } from '@/lib/productCatalog';

async function ensureCatalogEntity(
  Model: typeof MainCategory | typeof SubCategory | typeof Brand,
  {
    name,
    pic = '',
    active = true,
  }: {
    name: string;
    pic?: string;
    active?: boolean;
  }
) {
  const slug = slugifyCatalogValue(name);
  const existing = await Model.findOne({ slug });

  if (existing) {
    return existing;
  }

  return Model.create({
    name,
    slug,
    pic,
    active,
  });
}

export async function seedProducts() {
  await dbConnect();
  const results: string[] = [];

  for (const productData of DEFAULT_PRODUCTS) {
    const mainCategory = await ensureCatalogEntity(MainCategory, {
      name: productData.mainCategoryName,
      pic: productData.imageUrl,
    });
    const subCategory = await ensureCatalogEntity(SubCategory, {
      name: productData.subCategoryName,
      pic: productData.imageUrl,
    });
    const brand = await ensureCatalogEntity(Brand, {
      name: productData.brandName,
    });
    const payload = prepareProductMutationInput({
      ...productData,
      mainCategory: String(mainCategory._id),
      subCategory: String(subCategory._id),
      brand: String(brand._id),
      mainCategoryName: mainCategory.name,
      subCategoryName: subCategory.name,
      brandName: brand.name,
    });
    const existing = await Product.findOne({ category: payload.category });

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
