import type { ProductRecord } from '@/lib/productCatalog';

export const STANDARD_PRODUCT_MATERIALS = [
  'Leather',
  'Velvet',
  'Boucle',
  'Linen',
  'Premium Fabric',
] as const;

export const STANDARD_PRODUCT_FINISHES = [
  'Dark Walnut',
  'Natural Oak',
  'Matte Black',
  'Brushed Brass',
  'Polished Nickel',
] as const;

export const STANDARD_PRODUCT_ADDONS = [
  'Premium Cushion Fill',
  'Accent Stitching',
  'Extended Depth',
  'Swivel Base',
] as const;

export interface CommerceSelection {
  selectedColor: string;
  selectedColorImage: string;
  selectedSize: string;
  selectedMaterial: string;
  selectedFinish: string;
  selectedAddons: string[];
  configurationNotes: string;
}

export interface CommerceCartItem extends CommerceSelection {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface CommerceWishlistItem extends CommerceSelection {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
}

export interface SavedCustomerAddress {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  pincode: string;
  addressLine1: string;
  addressLine2: string;
  address: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

function slugifySegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

function hashValue(value: string) {
  let hash = 5381;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index);
  }

  return (hash >>> 0).toString(36);
}

export function cleanCommerceString(value: unknown, maxLength = 120) {
  return String(value || '').trim().slice(0, maxLength);
}

export function cleanCommerceStringArray(value: unknown, maxLength = 80) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .map((entry) => cleanCommerceString(entry, maxLength))
        .filter(Boolean)
    )
  );
}

export function normalizeCommerceSelection(
  value: Partial<CommerceSelection> | null | undefined
): CommerceSelection {
  return {
    selectedColor: cleanCommerceString(value?.selectedColor, 80),
    selectedColorImage: cleanCommerceString(value?.selectedColorImage, 300),
    selectedSize: cleanCommerceString(value?.selectedSize, 80),
    selectedMaterial: cleanCommerceString(value?.selectedMaterial, 80),
    selectedFinish: cleanCommerceString(value?.selectedFinish, 80),
    selectedAddons: cleanCommerceStringArray(value?.selectedAddons, 80).slice(0, 8),
    configurationNotes: cleanCommerceString(value?.configurationNotes, 240),
  };
}

export function buildCommerceItemId(
  productId: string,
  selection?: Partial<CommerceSelection> | null
) {
  const normalizedProductId = cleanCommerceString(productId, 120);
  const normalizedSelection = normalizeCommerceSelection(selection);
  const selectionSignature = JSON.stringify(normalizedSelection);
  const productKey = slugifySegment(normalizedProductId) || 'product';

  return `${productKey}-${hashValue(selectionSignature)}`;
}

export function getSelectionSummaryLines(selection?: Partial<CommerceSelection> | null) {
  const normalizedSelection = normalizeCommerceSelection(selection);
  const lines = [
    normalizedSelection.selectedColor
      ? `Color: ${normalizedSelection.selectedColor}`
      : '',
    normalizedSelection.selectedSize
      ? `Size: ${normalizedSelection.selectedSize}`
      : '',
    normalizedSelection.selectedMaterial
      ? `Material: ${normalizedSelection.selectedMaterial}`
      : '',
    normalizedSelection.selectedFinish
      ? `Finish: ${normalizedSelection.selectedFinish}`
      : '',
    normalizedSelection.selectedAddons.length
      ? `Add-ons: ${normalizedSelection.selectedAddons.join(', ')}`
      : '',
    normalizedSelection.configurationNotes
      ? `Configuration: ${normalizedSelection.configurationNotes}`
      : '',
  ].filter(Boolean);

  return lines;
}

export function formatSelectionSummary(
  selection?: Partial<CommerceSelection> | null,
  separator = ' | '
) {
  return getSelectionSummaryLines(selection).join(separator);
}

export function getDefaultSizeForProduct(
  product?: Pick<ProductRecord, 'size'> | null
) {
  return cleanCommerceString(product?.size?.[0], 80);
}

export function getDefaultMaterialForProduct(
  product?: Pick<ProductRecord, 'specs'> | null
) {
  const materialDescription = cleanCommerceString(product?.specs?.material, 160).toLowerCase();

  if (!materialDescription) {
    return '';
  }

  return (
    STANDARD_PRODUCT_MATERIALS.find((option) =>
      materialDescription.includes(option.toLowerCase())
    ) ||
    (materialDescription.includes('leather')
      ? 'Leather'
      : materialDescription.includes('velvet')
        ? 'Velvet'
        : materialDescription.includes('boucle')
          ? 'Boucle'
          : materialDescription.includes('linen')
            ? 'Linen'
            : materialDescription.includes('fabric') || materialDescription.includes('polyester')
              ? 'Premium Fabric'
              : cleanCommerceString(product?.specs?.material, 80))
  );
}

export function mergeCommerceCartItems(
  primary: CommerceCartItem[],
  secondary: CommerceCartItem[]
) {
  const merged = new Map<string, CommerceCartItem>();

  for (const item of [...primary, ...secondary]) {
    const key = cleanCommerceString(item.id, 160) || buildCommerceItemId(item.productId, item);
    const quantity = Math.max(1, Number(item.quantity || 1));
    const existing = merged.get(key);

    if (!existing) {
      merged.set(key, { ...item, id: key, quantity });
      continue;
    }

    merged.set(key, {
      ...existing,
      ...item,
      id: key,
      quantity: existing.quantity + quantity,
    });
  }

  return Array.from(merged.values());
}

export function mergeCommerceWishlistItems(
  primary: CommerceWishlistItem[],
  secondary: CommerceWishlistItem[]
) {
  const merged = new Map<string, CommerceWishlistItem>();

  for (const item of [...primary, ...secondary]) {
    const key = cleanCommerceString(item.id, 160) || buildCommerceItemId(item.productId, item);

    if (!merged.has(key)) {
      merged.set(key, { ...item, id: key });
    }
  }

  return Array.from(merged.values());
}
