import { normalizeCatalogEntity } from '@/lib/catalogEntities';
import {
  normalizeProduct,
  prepareProductMutationInput,
  slugify,
} from '@/lib/productCatalog';
import Brand from '@/models/Brand';
import MainCategory from '@/models/MainCategory';
import SubCategory from '@/models/SubCategory';
import {
  cleanBoolean,
  cleanNumber,
  cleanString,
  cleanStringArray,
  extractFiles,
} from '@/lib/server/legacyApi';
import { saveProductUpload } from '@/lib/server/uploadStorage';

function dedupeStrings(values: string[]) {
  const seen = new Set<string>();

  return values.filter((value) => {
    const normalized = value.trim();
    if (!normalized || seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);
    return true;
  });
}

function resolveRelationName(value: unknown) {
  return normalizeCatalogEntity(
    value as Parameters<typeof normalizeCatalogEntity>[0]
  )?.name || '';
}

export function serializeLegacyProduct(value: unknown) {
  return normalizeProduct(value as Parameters<typeof normalizeProduct>[0]);
}

export async function buildLegacyProductPayload(data: Record<string, unknown>) {
  const name = cleanString(data.name);
  const mainCategoryId = cleanString(data.maincategory ?? data.mainCategory);
  const subCategoryId = cleanString(data.subcategory ?? data.subCategory);
  const brandId = cleanString(data.brand);

  const [mainCategoryDoc, subCategoryDoc, brandDoc] = await Promise.all([
    mainCategoryId ? MainCategory.findById(mainCategoryId).lean() : null,
    subCategoryId ? SubCategory.findById(subCategoryId).lean() : null,
    brandId ? Brand.findById(brandId).lean() : null,
  ]);

  const mainCategoryName =
    cleanString(data.mainCategoryName) || resolveRelationName(mainCategoryDoc);
  const subCategoryName =
    cleanString(data.subCategoryName) || resolveRelationName(subCategoryDoc);
  const brandName = cleanString(data.brandName) || resolveRelationName(brandDoc);
  const category =
    cleanString(data.category).toLowerCase() || slugify(mainCategoryName || cleanString(data.name));
  const basePrice = cleanNumber(data.basePrice, cleanNumber(data.price, 0));
  const discount = cleanNumber(data.discount, 0);
  const providedFinalPrice = cleanNumber(data.finalPrice, Number.NaN);
  const calculatedFinalPrice =
    Number.isFinite(providedFinalPrice) && providedFinalPrice >= 0
      ? providedFinalPrice
      : Math.max(0, Math.round(basePrice - basePrice * (discount / 100)));
  const stockQuantity = Math.max(
    0,
    cleanNumber(data.stockQuantity, typeof data.stock === 'number' ? cleanNumber(data.stock, 0) : 0)
  );
  const manualPics = cleanStringArray(data.pic);
  const uploadCategory = category || 'product';
  const files = extractFiles(data.pic);
  const uploadedPics: string[] = [];

  for (let index = 0; index < files.length; index += 1) {
    const upload = await saveProductUpload({
      file: files[index],
      category: uploadCategory,
      productName: name || 'product',
      slot: `gallery-${index + 1}`,
      kind: 'image',
    });

    if (!upload.ok) {
      throw new Error(upload.error);
    }

    uploadedPics.push(upload.path);
  }

  const pic = dedupeStrings([...manualPics, ...uploadedPics]);

  return prepareProductMutationInput({
    category,
    name,
    description: cleanString(data.description),
    mainCategory: mainCategoryId || null,
    subCategory: subCategoryId || null,
    brand: brandId || null,
    mainCategoryName,
    subCategoryName,
    brandName,
    basePrice,
    discount,
    finalPrice: calculatedFinalPrice,
    stockQuantity,
    inStock: cleanBoolean(data.stock, stockQuantity > 0),
    size: cleanStringArray(data.size),
    color: cleanStringArray(data.color),
    pic,
    images: pic,
    imageUrl: pic[0] || cleanString(data.imageUrl),
    active: cleanBoolean(data.active, true),
  });
}
