export type CatalogEntityKind = 'maincategory' | 'subcategory' | 'brand';

export interface CatalogEntityRecord {
  _id: string;
  id: string;
  name: string;
  slug: string;
  pic: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CatalogOptionsResponse {
  mainCategories: CatalogEntityRecord[];
  subCategories: CatalogEntityRecord[];
  brands: CatalogEntityRecord[];
}

type CatalogEntityLike = {
  _id?: unknown;
  id?: unknown;
  name?: unknown;
  slug?: unknown;
  pic?: unknown;
  active?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function cleanCatalogString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export function cleanCatalogBoolean(value: unknown, fallback = true) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }

  return fallback;
}

export function slugifyCatalogValue(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'item';
}

export function normalizeCatalogEntity(value: CatalogEntityLike | null | undefined) {
  if (!value || !isRecord(value)) {
    return null;
  }

  const name = cleanCatalogString(value.name);
  const slug = cleanCatalogString(value.slug) || slugifyCatalogValue(name);
  const id = String((value._id ?? value.id ?? slug) || name || '');

  if (!id || !name) {
    return null;
  }

  const createdAt = cleanCatalogString(value.createdAt);
  const updatedAt = cleanCatalogString(value.updatedAt);

  return {
    _id: id,
    id,
    name,
    slug,
    pic: cleanCatalogString(value.pic),
    active: cleanCatalogBoolean(value.active, true),
    ...(createdAt ? { createdAt } : {}),
    ...(updatedAt ? { updatedAt } : {}),
  } satisfies CatalogEntityRecord;
}

export function prepareCatalogEntityMutationInput(
  value: CatalogEntityLike | null | undefined,
  label = 'Collection item'
) {
  const source = isRecord(value) ? value : {};
  const name = cleanCatalogString(source.name);

  if (!name) {
    throw new Error(`${label} name is required.`);
  }

  return {
    name,
    slug: slugifyCatalogValue(name),
    pic: cleanCatalogString(source.pic),
    active: cleanCatalogBoolean(source.active, true),
  };
}

export function sortCatalogEntities(items: CatalogEntityRecord[]) {
  return [...items].sort(
    (left, right) =>
      Number(right.active) - Number(left.active) || left.name.localeCompare(right.name)
  );
}
