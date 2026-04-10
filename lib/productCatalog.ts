import {
  normalizeCatalogEntity,
  type CatalogEntityRecord,
} from '@/lib/catalogEntities';

export const PRODUCT_CATEGORIES = ['sofa', 'chair', 'recliner', 'pouffe'] as const;
export type ProductCategory = string;

export const PRODUCT_VIEW_KEYS = ['main', 'cover', 'left', 'right', 'top', 'detail'] as const;
export type ProductViewKey = (typeof PRODUCT_VIEW_KEYS)[number];

export interface ProductColorEntry {
  name: string;
  image: string;
}

export interface ProductSpecItem {
  label: string;
  value: string;
}

export interface ProductSpecSection {
  title: string;
  items: ProductSpecItem[];
}

export interface ProductSpecs {
  material: string;
  foam?: string;
  dimensions: string;
  weight: string;
  warranty: string;
  sections?: ProductSpecSection[];
}

export interface ProductMediaViews {
  main: string;
  cover?: string;
  left?: string;
  right?: string;
  top?: string;
  detail?: string;
}

export interface ProductMedia {
  views: ProductMediaViews;
  gallery: string[];
}

export interface ProductRecord {
  id: string;
  _id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  eyebrow: string;
  modelPath?: string | null;
  images: string[];
  colors: ProductColorEntry[];
  specs: ProductSpecs;
  media: ProductMedia;
  mainCategoryId: string | null;
  subCategoryId: string | null;
  brandId: string | null;
  mainCategory: CatalogEntityRecord | null;
  subCategory: CatalogEntityRecord | null;
  brand: CatalogEntityRecord | null;
  mainCategoryName: string;
  subCategoryName: string;
  brandName: string;
  basePrice: number;
  discount: number;
  finalPrice: number;
  inStock: boolean;
  stockQuantity: number;
  size: string[];
  pic: string[];
  color: string[];
  active: boolean;
}

export interface StorefrontCollectionLink {
  key: string;
  name: string;
  href: string;
  targetId: string;
  category: string;
  productId: string;
}

export interface ProductInput {
  category: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  eyebrow: string;
  modelPath?: string | null;
  images: string[];
  colors: ProductColorEntry[];
  specs: ProductSpecs;
  media: ProductMedia;
  mainCategory: string | null;
  subCategory: string | null;
  brand: string | null;
  mainCategoryName: string;
  subCategoryName: string;
  brandName: string;
  basePrice: number;
  discount: number;
  finalPrice: number;
  inStock: boolean;
  stockQuantity: number;
  size: string[];
  pic: string[];
  color: string[];
  active: boolean;
}

type EntityReferenceLike = string | Record<string, unknown> | null | undefined;

type ProductLike = {
  _id?: unknown;
  id?: unknown;
  category?: unknown;
  name?: unknown;
  description?: unknown;
  price?: unknown;
  stock?: unknown;
  imageUrl?: unknown;
  eyebrow?: unknown;
  modelPath?: unknown;
  images?: unknown;
  colors?: unknown;
  specs?: unknown;
  media?: unknown;
  mainCategory?: unknown;
  subCategory?: unknown;
  brand?: unknown;
  mainCategoryId?: unknown;
  subCategoryId?: unknown;
  brandId?: unknown;
  mainCategoryName?: unknown;
  subCategoryName?: unknown;
  brandName?: unknown;
  basePrice?: unknown;
  discount?: unknown;
  finalPrice?: unknown;
  inStock?: unknown;
  stockQuantity?: unknown;
  size?: unknown;
  pic?: unknown;
  color?: unknown;
  active?: unknown;
};

interface DefaultProduct extends Omit<ProductInput, 'mainCategory' | 'subCategory' | 'brand' | 'images'> {
  mainCategory?: string | null;
  subCategory?: string | null;
  brand?: string | null;
  images?: string[];
}

const EMPTY_SPECS: ProductSpecs = {
  material: '',
  foam: '',
  dimensions: '',
  weight: '',
  warranty: '',
  sections: [],
};

const HOME_CENTRE_COMPANY =
  'Lifestyle Int Pvt Ltd, 77 Degree Town Centre, Building No. 3, West Wing, Off-HAL Airport Road, Yamlur, Bangalore-560037';
const HOME_CENTRE_CUSTOMER_CARE =
  'Manager Commercial, 77 Degree Town Centre, Building No. 3, West Wing, Off HAL Airport Road, Yamlur PO., Bangalore-560037, Phone: 1800-212-7500, help@homecentre.in';
const LANDMARK_ONLINE_INDIA = 'Landmark Online India Pvt Ltd';

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function cleanString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function cleanOptionalString(value: unknown) {
  const normalized = cleanString(value);
  return normalized || null;
}

function cleanNumber(value: unknown, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function cleanBoolean(value: unknown, fallback = false) {
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

function cleanStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((entry) => cleanString(entry)).filter(Boolean);
}

function dedupeStrings(values: Array<string | undefined | null>) {
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const value of values) {
    const normalized = cleanString(value);
    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    unique.push(normalized);
  }

  return unique;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'item';
}

function titleCaseSlug(value: string) {
  return cleanString(value)
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function isProductCategory(value: string) {
  return PRODUCT_CATEGORIES.includes(value as (typeof PRODUCT_CATEGORIES)[number]);
}

function extractEntityId(value: EntityReferenceLike) {
  if (!value) return null;

  if (typeof value === 'string') {
    return value.trim() || null;
  }

  if (!isRecord(value)) {
    return null;
  }

  const entity = normalizeCatalogEntity(value);
  if (entity) {
    return entity._id;
  }

  const fallback = cleanString(value._id ?? value.id);
  return fallback || null;
}

function extractEntityName(value: EntityReferenceLike) {
  if (!value || typeof value === 'string' || !isRecord(value)) {
    return '';
  }

  return normalizeCatalogEntity(value)?.name || cleanString(value.name);
}

function normalizeEntityReference(value: unknown) {
  if (!isRecord(value)) {
    return null;
  }

  return normalizeCatalogEntity(value);
}

function inferViewKeyFromImage(src: string): ProductViewKey | null {
  const filename = src.split('/').pop()?.replace(/\.[^.]+$/, '').toLowerCase() ?? '';

  if (filename.includes('main')) return 'main';
  if (filename.includes('cover')) return 'cover';
  if (filename.includes('left')) return 'left';
  if (filename.includes('right')) return 'right';
  if (filename.includes('top')) return 'top';
  if (
    filename.includes('detail') ||
    filename.includes('closeup') ||
    filename.includes('fabric') ||
    filename.includes('leg')
  ) {
    return 'detail';
  }

  return null;
}

function normalizeViews(value: unknown) {
  const views: Partial<Record<ProductViewKey, string>> = {};
  const source: Record<string, unknown> = isRecord(value) ? value : {};

  for (const key of PRODUCT_VIEW_KEYS) {
    const normalized = cleanString(source[key]);
    if (normalized) {
      views[key] = normalized;
    }
  }

  return views;
}

export function extractProductViews(value: ProductLike | DefaultProduct) {
  const source = value as ProductLike;
  const fromMedia = normalizeViews(isRecord(source.media) ? source.media.views : null);
  const inferredFromImages = dedupeStrings([
    ...cleanStringArray(source.images),
    ...cleanStringArray(source.pic),
  ]);
  const directImage = cleanString(source.imageUrl);

  if (directImage && !fromMedia.main) {
    fromMedia.main = directImage;
  }

  for (const image of inferredFromImages) {
    const viewKey = inferViewKeyFromImage(image);
    if (!viewKey || fromMedia[viewKey]) {
      continue;
    }

    fromMedia[viewKey] = image;
  }

  return fromMedia;
}

export function buildOrderedProductImages(
  views: Partial<Record<ProductViewKey, string>>,
  gallery: string[] = [],
  fallbackImage = ''
) {
  return dedupeStrings([
    views.main,
    views.cover,
    views.left,
    views.right,
    views.top,
    views.detail,
    ...gallery,
    fallbackImage,
  ]);
}

export function extractAdditionalGalleryImages(value: ProductLike | DefaultProduct) {
  const source = value as ProductLike;
  const views = extractProductViews(source);
  const mediaGallery = isRecord(source.media) ? cleanStringArray(source.media.gallery) : [];
  const images = dedupeStrings([...cleanStringArray(source.images), ...cleanStringArray(source.pic)]);
  const namedViewImages = new Set(
    Object.values(views)
      .map((entry) => cleanString(entry))
      .filter(Boolean)
  );

  return dedupeStrings([...mediaGallery, ...images]).filter((image) => !namedViewImages.has(image));
}

function normalizeColorNames(value: ProductLike | DefaultProduct, fallback: string[] = []) {
  const source = value as ProductLike;
  const direct = cleanStringArray(source.color);

  if (direct.length) {
    return dedupeStrings(direct);
  }

  if (!Array.isArray(source.colors)) {
    return fallback;
  }

  const names = source.colors
    .map((entry) => {
      const color = isRecord(entry) ? entry : {};
      return cleanString(color.name);
    })
    .filter(Boolean);

  return dedupeStrings(names.length ? names : fallback);
}

function normalizeColorEntries(
  value: ProductLike | DefaultProduct,
  fallback: ProductColorEntry[],
  imagePool: string[],
  fallbackImage: string
) {
  const source = value as ProductLike;

  if (Array.isArray(source.colors)) {
    const colors = source.colors
      .map((entry, index) => {
        const color = isRecord(entry) ? entry : {};
        const name = cleanString(color.name);
        const image = cleanString(color.image) || imagePool[index] || fallbackImage;

        if (!name || !image) {
          return null;
        }

        return { name, image };
      })
      .filter((entry): entry is ProductColorEntry => Boolean(entry));

    if (colors.length) {
      return colors;
    }
  }

  const names = normalizeColorNames(source);
  if (!names.length) {
    return fallback;
  }

  const generated = names
    .map((name, index) => {
      const image = imagePool[index] || fallbackImage;
      if (!image) {
        return null;
      }

      return { name, image };
    })
    .filter((entry): entry is ProductColorEntry => Boolean(entry));

  return generated.length ? generated : fallback;
}

function normalizeSpecSections(
  value: unknown,
  fallback: ProductSpecSection[] = []
): ProductSpecSection[] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const sections = value
    .map((entry) => {
      const section = isRecord(entry) ? entry : {};
      const title = cleanString(section.title);
      const items = Array.isArray(section.items)
        ? section.items
            .map((item) => {
              const specItem = isRecord(item) ? item : {};
              const label = cleanString(specItem.label);
              const itemValue = cleanString(specItem.value);

              if (!label || !itemValue) {
                return null;
              }

              return {
                label,
                value: itemValue,
              };
            })
            .filter((item): item is ProductSpecItem => Boolean(item))
        : [];

      if (!title || !items.length) {
        return null;
      }

      return {
        title,
        items,
      };
    })
    .filter((section): section is ProductSpecSection => Boolean(section));

  return sections.length ? sections : fallback;
}

function normalizeSpecs(value: unknown, fallback: ProductSpecs = EMPTY_SPECS): ProductSpecs {
  const source: Record<string, unknown> = isRecord(value) ? value : {};

  return {
    material: cleanString(source.material) || fallback.material,
    foam: cleanString(source.foam) || fallback.foam || '',
    dimensions: cleanString(source.dimensions) || fallback.dimensions,
    weight: cleanString(source.weight) || fallback.weight,
    warranty: cleanString(source.warranty) || fallback.warranty,
    sections: normalizeSpecSections(source.sections, fallback.sections || []),
  };
}

function createSpecSection(
  title: string,
  items: Array<{ label: string; value: string | null | undefined }>
): ProductSpecSection {
  return {
    title,
    items: items
      .map((item) => ({
        label: cleanString(item.label),
        value: cleanString(item.value),
      }))
      .filter((item) => item.label && item.value),
  };
}

export const DEFAULT_PRODUCTS: DefaultProduct[] = [
  {
    category: 'sofa',
    name: 'Milano Sculpted Sofa',
    description:
      'Layered in deep olive velvet with a softly curved silhouette, this statement sofa anchors the room with gallery-grade presence and cloud-soft comfort.',
    price: 45000,
    stock: 7,
    imageUrl: '/products/sofa/main.png',
    eyebrow: 'Signature Sofa',
    modelPath: '/3D%20models/teal%20sofa%203d%20model.glb',
    colors: [
      { name: 'Olive Velvet', image: '/products/sofa/main.png' },
      { name: 'Bronze Leather', image: '/products/sofa/bronge leather.png' },
      { name: 'Warm Taupe', image: '/products/sofa/warm taupe.png' },
      { name: 'Deep Charcoal', image: '/products/sofa/deep charcol.png' },
    ],
    specs: {
      material: 'Antimicrobial polyester fabric upholstery',
      foam: 'Foam and spring seat filling',
      dimensions: '3-Seater: 225 cm x 99 cm x 91 cm',
      weight: '',
      warranty: 'Vacuum clean; assembly required',
      sections: [
        createSpecSection('Dimensions', [
          { label: '3-Seater', value: '225 cm x 99 cm x 91 cm' },
        ]),
        createSpecSection('Material', [
          { label: 'Upholstery Material', value: 'Fabric' },
          { label: 'Seat Filling', value: 'Foam and Spring' },
          { label: 'Frame Material', value: 'Solid Wood' },
          { label: 'Wood Type', value: 'Pine' },
        ]),
        createSpecSection('General Specifications', [
          { label: 'Seating Capacity', value: '3-Seater' },
          { label: 'Type', value: 'Sofas' },
          { label: 'Net Quantity', value: '1 Number' },
          { label: 'Color', value: 'Olive Velvet' },
          { label: 'Product', value: 'Milano Sculpted Sofa' },
        ]),
        createSpecSection('Comfort & Construction', [
          { label: 'Support System', value: 'Pocket spring coils' },
          { label: 'Arms', value: 'Broad arms' },
          { label: 'Cushions', value: 'Throw cushions included' },
          { label: 'Leg Finish', value: 'Electroplated metal legs' },
        ]),
        createSpecSection('Warranty & Care', [
          { label: 'Care Instructions', value: 'Vacuum Clean' },
          { label: 'Assembly Required', value: 'Yes' },
          { label: 'Assembly Type', value: 'Assembly Service Provided by Retailer' },
        ]),
        createSpecSection('Manufacturer Details', [
          { label: 'Manufacture and Marketed by', value: HOME_CENTRE_COMPANY },
          { label: 'Country of Origin', value: 'India' },
        ]),
        createSpecSection('Customer Care', [
          { label: 'Customer Care', value: HOME_CENTRE_CUSTOMER_CARE },
        ]),
      ],
    },
    media: {
      views: {
        main: '/products/sofa/main.png',
        cover: '/products/sofa/cover.png',
        left: '/products/sofa/left.png',
        right: '/products/sofa/right.png',
        top: '/products/sofa/top.png',
        detail: '/products/sofa/sofa leg.png',
      },
      gallery: [
        '/products/sofa/main.png',
        '/products/sofa/cover.png',
        '/products/sofa/top.png',
        '/products/sofa/left.png',
        '/products/sofa/right.png',
        '/products/sofa/sofa leg.png',
      ],
    },
    mainCategoryName: 'Sofa',
    subCategoryName: 'Signature Collection',
    brandName: 'LUXE Studio',
    basePrice: 45000,
    discount: 0,
    finalPrice: 45000,
    inStock: true,
    stockQuantity: 7,
    size: ['3 Seater'],
    pic: [
      '/products/sofa/main.png',
      '/products/sofa/cover.png',
      '/products/sofa/top.png',
      '/products/sofa/left.png',
      '/products/sofa/right.png',
      '/products/sofa/sofa leg.png',
    ],
    color: ['Olive Velvet', 'Bronze Leather', 'Warm Taupe', 'Deep Charcoal'],
    active: true,
  },
  {
    category: 'chair',
    name: 'Verona Accent Chair',
    description:
      'A sculpted lounge chair with curved arms, rich textured upholstery, and a compact footprint that adds depth to reading corners and formal seating areas.',
    price: 18500,
    stock: 12,
    imageUrl: '/products/chairs/main.png',
    eyebrow: 'Accent Seating',
    modelPath: '/3D%20models/teal+velvet+armchair+3d+model.glb',
    colors: [
      { name: 'Cognac Leather', image: '/products/chairs/Cognac Leather.png' },
      { name: 'Forest Green', image: '/products/chairs/Forest Green.png' },
      { name: 'Sunset Terracotta', image: '/products/chairs/Sunset Terracotta.png' },
      { name: 'Midnight Navy', image: '/products/chairs/midnight navy.png' },
    ],
    specs: {
      material: 'Fabric upholstery',
      foam: 'Foam and spring seat filling',
      dimensions: '1-Seater: 85 cm x 88 cm x 80 cm',
      weight: '',
      warranty: 'Professional cleaning; assembly required',
      sections: [
        createSpecSection('Dimensions', [
          { label: '1-Seater', value: '85 cm x 88 cm x 80 cm' },
        ]),
        createSpecSection('Material', [
          { label: 'Upholstery Material', value: 'Fabric' },
          { label: 'Seat Filling', value: 'Foam and Spring' },
          { label: 'Frame Material', value: 'Solid Wood' },
          { label: 'Wood Type', value: 'Meranti' },
        ]),
        createSpecSection('General Specifications', [
          { label: 'Seating Capacity', value: '1-Seater' },
          { label: 'Seat Cushion', value: 'Fixed' },
          { label: 'Type', value: 'Arm Chairs' },
          { label: 'Net Quantity', value: '1 Number' },
          { label: 'Color', value: 'Cognac Leather' },
          { label: 'Product', value: 'Verona Accent Chair' },
        ]),
        createSpecSection('Warranty & Care', [
          { label: 'Care Instructions', value: 'Professional Cleaning' },
          { label: 'Assembly Required', value: 'Yes' },
          { label: 'Assembly Type', value: 'Assembly Service Provided by Retailer' },
        ]),
        createSpecSection('Manufacturer Details', [
          { label: 'Manufacture and Marketed by', value: HOME_CENTRE_COMPANY },
          { label: 'Country of Origin', value: 'India' },
        ]),
        createSpecSection('Customer Care', [
          { label: 'Customer Care', value: HOME_CENTRE_CUSTOMER_CARE },
        ]),
      ],
    },
    media: {
      views: {
        main: '/products/chairs/main.png',
        cover: '/products/chairs/cover.png',
        left: '/products/chairs/left.png',
        right: '/products/chairs/right.png',
        top: '/products/chairs/top.png',
        detail: '/products/chairs/legs.png',
      },
      gallery: [
        '/products/chairs/main.png',
        '/products/chairs/cover.png',
        '/products/chairs/top.png',
        '/products/chairs/left.png',
        '/products/chairs/right.png',
        '/products/chairs/legs.png',
      ],
    },
    mainCategoryName: 'Chair',
    subCategoryName: 'Accent Collection',
    brandName: 'LUXE Studio',
    basePrice: 18500,
    discount: 0,
    finalPrice: 18500,
    inStock: true,
    stockQuantity: 12,
    size: ['Single'],
    pic: [
      '/products/chairs/main.png',
      '/products/chairs/cover.png',
      '/products/chairs/top.png',
      '/products/chairs/left.png',
      '/products/chairs/right.png',
      '/products/chairs/legs.png',
    ],
    color: ['Cognac Leather', 'Forest Green', 'Sunset Terracotta', 'Midnight Navy'],
    active: true,
  },
  {
    category: 'recliner',
    name: 'Aurelian Leather Recliner',
    description:
      'Cut in rich saddle leather with tailored stitching and a quietly engineered recline, it brings lounge-level comfort to a polished living space.',
    price: 32000,
    stock: 4,
    imageUrl: '/products/recliners/main.png',
    eyebrow: 'Private Lounge',
    modelPath: '/3D%20models/recliner+chair+3d+model.glb',
    colors: [
      { name: 'Cognac Leather', image: '/products/recliners/Cognac Leather.png' },
      { name: 'Forest Green', image: '/products/recliners/Forest Green.png' },
      { name: 'Midnight Navy', image: '/products/recliners/Midnight Navy.png' },
      { name: 'Sunset Terracotta', image: '/products/recliners/Sunset Terracotta.png' },
    ],
    specs: {
      material: 'Faux leather upholstery',
      foam: 'Foam with spring seat filling',
      dimensions: '1-Seater Recliner: 106 cm x 99 cm x 102 cm',
      weight: '',
      warranty: 'Spot clean; assembly required',
      sections: [
        createSpecSection('Dimensions', [
          { label: '1-Seater Recliner', value: '106 cm x 99 cm x 102 cm' },
        ]),
        createSpecSection('Material', [
          { label: 'Upholstery Material', value: 'Faux Leather' },
          { label: 'Seat Filling', value: 'Foam with Spring' },
          { label: 'Frame Material', value: 'Solid Wood' },
        ]),
        createSpecSection('General Specifications', [
          { label: 'Seating Capacity', value: '1-Seater' },
          { label: 'Seat Cushion', value: 'Fixed' },
          { label: 'Recliner Type', value: 'Manual Recliner' },
          { label: 'Rocking', value: 'Yes' },
          { label: 'Type', value: 'Recliners' },
          { label: 'Net Quantity', value: '1 Number' },
          { label: 'Color', value: 'Cognac Leather' },
          { label: 'Product', value: 'Aurelian Leather Recliner' },
        ]),
        createSpecSection('Comfort & Construction', [
          { label: 'Reclining Positions', value: '3' },
          { label: 'Spring System', value: 'No-sag springs' },
          { label: 'Webbing', value: 'High elastic nylon webbing' },
        ]),
        createSpecSection('Warranty & Care', [
          { label: 'Care Instructions', value: 'Spot Clean' },
          { label: 'Assembly Required', value: 'Yes' },
          { label: 'Assembly Type', value: 'Assembly Service Provided by Retailer' },
        ]),
        createSpecSection('Manufacturer Details', [
          { label: 'Manufacture and Marketed by', value: HOME_CENTRE_COMPANY },
          { label: 'Country of Origin', value: 'India' },
        ]),
        createSpecSection('Customer Care', [
          { label: 'Customer Care', value: HOME_CENTRE_CUSTOMER_CARE },
        ]),
      ],
    },
    media: {
      views: {
        main: '/products/recliners/main.png',
        cover: '/products/recliners/cover.png',
        left: '/products/recliners/left.png',
        right: '/products/recliners/right.png',
        top: '/products/recliners/top.png',
        detail: '/products/recliners/legs.png',
      },
      gallery: [
        '/products/recliners/main.png',
        '/products/recliners/cover.png',
        '/products/recliners/top.png',
        '/products/recliners/left.png',
        '/products/recliners/right.png',
        '/products/recliners/legs.png',
      ],
    },
    mainCategoryName: 'Recliner',
    subCategoryName: 'Lounge Collection',
    brandName: 'LUXE Studio',
    basePrice: 32000,
    discount: 0,
    finalPrice: 32000,
    inStock: true,
    stockQuantity: 4,
    size: ['Single'],
    pic: [
      '/products/recliners/main.png',
      '/products/recliners/cover.png',
      '/products/recliners/top.png',
      '/products/recliners/left.png',
      '/products/recliners/right.png',
      '/products/recliners/legs.png',
    ],
    color: ['Cognac Leather', 'Forest Green', 'Midnight Navy', 'Sunset Terracotta'],
    active: true,
  },
  {
    category: 'pouffe',
    name: 'Atelier Accent Pouffe',
    description:
      'A compact accent piece with artisanal texture, warm bronze undertones, and flexible styling that works beside a sofa, bed, or reading chair.',
    price: 4500,
    stock: 18,
    imageUrl: '/products/pouffes/main.png',
    eyebrow: 'Finishing Touch',
    modelPath: '/3D%20models/teal+pouffies+3d+model.glb',
    colors: [
      { name: 'Bronze Texture', image: '/products/pouffes/Cognac Leather.png' },
      { name: 'Warm Sand', image: '/products/pouffes/Midnight Navy.png' },
      { name: 'Clay Terracotta', image: '/products/pouffes/Sunset Terracota.png' },
      { name: 'Forest Green', image: '/products/pouffes/Forest Green.png' },
    ],
    specs: {
      material: 'Velvet upholstery',
      foam: 'Foam seat filling',
      dimensions: 'Pouffe: 43 cm x 43 cm x 45 cm',
      weight: '',
      warranty: '',
      sections: [
        createSpecSection('Dimensions', [
          { label: 'Pouffe', value: '43 cm x 43 cm x 45 cm' },
        ]),
        createSpecSection('Material', [
          { label: 'Upholstery Material', value: 'Velvet' },
          { label: 'Seat Filling', value: 'Foam' },
          { label: 'Frame Material', value: 'Solid Wood' },
        ]),
        createSpecSection('General Specifications', [
          { label: 'Type', value: 'Pouffe' },
          { label: 'Net Quantity', value: '1 Number' },
          { label: 'Color', value: 'Bronze Texture' },
          { label: 'Product', value: 'Atelier Accent Pouffe' },
        ]),
        createSpecSection('Design & Utility', [
          { label: 'Storage Availability', value: 'Lift-up storage under seat' },
          { label: 'Weight Capacity', value: 'Up to 70 kg' },
          { label: 'Base Support', value: 'Metal bottom support' },
        ]),
        createSpecSection('Manufacturer Details', [
          { label: 'Country of Origin', value: 'India' },
          { label: 'Sold By', value: LANDMARK_ONLINE_INDIA },
        ]),
        createSpecSection('Customer Care', [
          { label: 'Customer Care', value: HOME_CENTRE_CUSTOMER_CARE },
        ]),
      ],
    },
    media: {
      views: {
        main: '/products/pouffes/main.png',
        cover: '/products/pouffes/cover.png',
        left: '/products/pouffes/left.png',
        right: '/products/pouffes/right.png',
        top: '/products/pouffes/top.png',
        detail: '/products/pouffes/closeup.png',
      },
      gallery: [
        '/products/pouffes/main.png',
        '/products/pouffes/cover.png',
        '/products/pouffes/top.png',
        '/products/pouffes/left.png',
        '/products/pouffes/right.png',
        '/products/pouffes/closeup.png',
      ],
    },
    mainCategoryName: 'Pouffe',
    subCategoryName: 'Accent Collection',
    brandName: 'LUXE Studio',
    basePrice: 4500,
    discount: 0,
    finalPrice: 4500,
    inStock: true,
    stockQuantity: 18,
    size: ['Compact'],
    pic: [
      '/products/pouffes/main.png',
      '/products/pouffes/cover.png',
      '/products/pouffes/top.png',
      '/products/pouffes/left.png',
      '/products/pouffes/right.png',
      '/products/pouffes/closeup.png',
    ],
    color: ['Bronze Texture', 'Warm Sand', 'Clay Terracotta', 'Forest Green'],
    active: true,
  },
];

const DEFAULT_PRODUCT_BY_CATEGORY = new Map(
  DEFAULT_PRODUCTS.map((product) => [product.category, product])
);
const DEFAULT_PRODUCT_BY_NAME = new Map(
  DEFAULT_PRODUCTS.map((product) => [slugify(product.name), product])
);

function getDefaultProduct(category: string) {
  return DEFAULT_PRODUCT_BY_CATEGORY.get(category) ?? DEFAULT_PRODUCTS[0];
}

function getDefaultProductByName(name: string) {
  return DEFAULT_PRODUCT_BY_NAME.get(slugify(name)) ?? null;
}

function createSparseFallback(category: string): DefaultProduct {
  return {
    category,
    name: '',
    description: '',
    price: 0,
    stock: 0,
    imageUrl: '',
    eyebrow: '',
    modelPath: null,
    images: [],
    colors: [],
    specs: EMPTY_SPECS,
    media: { views: { main: '' }, gallery: [] },
    mainCategoryName: titleCaseSlug(category),
    subCategoryName: '',
    brandName: '',
    basePrice: 0,
    discount: 0,
    finalPrice: 0,
    inStock: false,
    stockQuantity: 0,
    size: [],
    pic: [],
    color: [],
    active: true,
  };
}

function getNormalizationFallback(value: ProductLike | DefaultProduct, category: string) {
  const source = value as ProductLike;
  const matchingDefault = getDefaultProductByName(cleanString(source.name));

  if (matchingDefault) {
    return matchingDefault;
  }

  return source._id || source.id ? createSparseFallback(category) : getDefaultProduct(category);
}

export function normalizeProduct(
  value: ProductLike | DefaultProduct,
  fallbackCategory?: string
): ProductRecord {
  const source = value as ProductLike;
  const rawCategory =
    cleanString(source.category).toLowerCase() ||
    slugify(
      cleanString(source.mainCategoryName) ||
        extractEntityName(source.mainCategory as EntityReferenceLike) ||
        fallbackCategory ||
        ''
    );
  const category = rawCategory || fallbackCategory || DEFAULT_PRODUCTS[0].category;
  const fallback = getNormalizationFallback(source, category);
  const views = {
    ...extractProductViews(fallback),
    ...extractProductViews(value),
  };
  const additionalGallery = dedupeStrings([
    ...extractAdditionalGalleryImages(fallback),
    ...extractAdditionalGalleryImages(value),
  ]);
  const images = buildOrderedProductImages(
    views,
    dedupeStrings([
      ...cleanStringArray(source.pic),
      ...additionalGallery,
    ]),
    cleanString(value.imageUrl) || fallback.media?.views?.main || ''
  );
  const mainImage = views.main || images[0] || fallback.media?.views?.main || '';
  const normalizedViews: ProductMediaViews = {
    main: mainImage,
    ...(views.cover ? { cover: views.cover } : {}),
    ...(views.left ? { left: views.left } : {}),
    ...(views.right ? { right: views.right } : {}),
    ...(views.top ? { top: views.top } : {}),
    ...(views.detail ? { detail: views.detail } : {}),
  };
  const mainCategoryEntity = normalizeEntityReference(source.mainCategory);
  const subCategoryEntity = normalizeEntityReference(source.subCategory);
  const brandEntity = normalizeEntityReference(source.brand);
  const mainCategoryName =
    cleanString(source.mainCategoryName) ||
    mainCategoryEntity?.name ||
    fallback.mainCategoryName ||
    titleCaseSlug(category);
  const subCategoryName =
    cleanString(source.subCategoryName) ||
    subCategoryEntity?.name ||
    fallback.subCategoryName ||
    '';
  const brandName =
    cleanString(source.brandName) ||
    brandEntity?.name ||
    fallback.brandName ||
    '';
  const basePrice = Math.max(0, cleanNumber(source.basePrice, cleanNumber(source.price, fallback.basePrice)));
  const discount = Math.max(0, cleanNumber(source.discount, fallback.discount));
  const finalPrice = Math.max(0, cleanNumber(source.finalPrice, cleanNumber(source.price, basePrice)));
  const stockQuantity = Math.max(
    0,
    cleanNumber(
      source.stockQuantity,
      typeof source.stock === 'number'
        ? cleanNumber(source.stock, fallback.stockQuantity)
        : fallback.stockQuantity
    )
  );
  const inStock = cleanBoolean(
    source.inStock ?? (typeof source.stock === 'boolean' ? source.stock : undefined),
    stockQuantity > 0 || fallback.inStock
  );
  const active = cleanBoolean(source.active, fallback.active);
  const pic = dedupeStrings([...cleanStringArray(source.pic), ...images]);
  const colors = normalizeColorEntries(source, fallback.colors, pic, mainImage);
  const color = dedupeStrings([
    ...normalizeColorNames(source, fallback.color),
    ...colors.map((entry) => entry.name),
  ]);
  const specs = normalizeSpecs(source.specs, fallback.specs || EMPTY_SPECS);
  const name = cleanString(value.name) || fallback.name;
  const id = String(source._id ?? source.id ?? `${category}-${slugify(name)}`);

  return {
    id,
    _id: id,
    category,
    name,
    description: cleanString(value.description) || fallback.description,
    price: finalPrice,
    stock: stockQuantity,
    imageUrl: mainImage,
    eyebrow: cleanString(value.eyebrow) || brandName || subCategoryName || fallback.eyebrow || mainCategoryName,
    modelPath: cleanOptionalString(value.modelPath) ?? fallback.modelPath ?? null,
    images: pic.length ? pic : fallback.pic,
    colors,
    specs,
    media: {
      views: normalizedViews,
      gallery: pic.length ? pic : fallback.pic,
    },
    mainCategoryId: extractEntityId(source.mainCategoryId as EntityReferenceLike) || extractEntityId(source.mainCategory as EntityReferenceLike),
    subCategoryId: extractEntityId(source.subCategoryId as EntityReferenceLike) || extractEntityId(source.subCategory as EntityReferenceLike),
    brandId: extractEntityId(source.brandId as EntityReferenceLike) || extractEntityId(source.brand as EntityReferenceLike),
    mainCategory: mainCategoryEntity,
    subCategory: subCategoryEntity,
    brand: brandEntity,
    mainCategoryName,
    subCategoryName,
    brandName,
    basePrice,
    discount,
    finalPrice,
    inStock,
    stockQuantity,
    size: dedupeStrings([...cleanStringArray(source.size), ...fallback.size]),
    pic: pic.length ? pic : fallback.pic,
    color,
    active,
  };
}

export function prepareProductMutationInput(value: ProductLike | DefaultProduct): ProductInput {
  const source = value as ProductLike;
  const mainCategoryName =
    cleanString(source.mainCategoryName) ||
    extractEntityName(source.mainCategory as EntityReferenceLike);
  const subCategoryName =
    cleanString(source.subCategoryName) ||
    extractEntityName(source.subCategory as EntityReferenceLike);
  const brandName =
    cleanString(source.brandName) ||
    extractEntityName(source.brand as EntityReferenceLike);
  const rawCategory = cleanString(source.category).toLowerCase() || slugify(mainCategoryName);
  const category = rawCategory || slugify(cleanString(source.name));
  const name = cleanString(source.name);

  if (!category) {
    throw new Error('A product category or main category name is required.');
  }

  if (!name) {
    throw new Error('Product name is required.');
  }

  const basePrice = Math.max(0, cleanNumber(source.basePrice, cleanNumber(source.price, Number.NaN)));
  const finalPrice = Math.max(0, cleanNumber(source.finalPrice, cleanNumber(source.price, basePrice)));
  const discount = Math.max(0, cleanNumber(source.discount, 0));
  const stockQuantity = Math.max(
    0,
    cleanNumber(
      source.stockQuantity,
      typeof source.stock === 'number' ? cleanNumber(source.stock, 0) : 0
    )
  );
  const inStock = cleanBoolean(
    source.inStock ?? (typeof source.stock === 'boolean' ? source.stock : undefined),
    stockQuantity > 0
  );

  if (!Number.isFinite(basePrice)) {
    throw new Error('Base price must be a valid number.');
  }

  if (!Number.isFinite(finalPrice)) {
    throw new Error('Final price must be a valid number.');
  }

  const specs = normalizeSpecs(source.specs);
  const views = extractProductViews(source);
  const gallery = dedupeStrings([
    ...extractAdditionalGalleryImages(source),
    ...cleanStringArray(source.images),
    ...cleanStringArray(source.pic),
    ...(isRecord(source.media) ? cleanStringArray(source.media.gallery) : []),
  ]);
  const imageUrl = views.main || cleanString(source.imageUrl) || gallery[0] || '';

  if (!imageUrl) {
    throw new Error('At least one product image is required.');
  }

  const normalizedViews: ProductMediaViews = {
    main: imageUrl,
    ...(views.cover ? { cover: views.cover } : {}),
    ...(views.left ? { left: views.left } : {}),
    ...(views.right ? { right: views.right } : {}),
    ...(views.top ? { top: views.top } : {}),
    ...(views.detail ? { detail: views.detail } : {}),
  };
  const images = buildOrderedProductImages(normalizedViews, gallery, imageUrl);
  const pic = dedupeStrings([...cleanStringArray(source.pic), ...images]);
  const colors = normalizeColorEntries(source, [], pic, imageUrl);
  const color = dedupeStrings([
    ...normalizeColorNames(source),
    ...colors.map((entry) => entry.name),
  ]);

  return {
    category,
    name,
    description: cleanString(source.description),
    price: finalPrice,
    stock: stockQuantity,
    imageUrl,
    eyebrow:
      cleanString(source.eyebrow) ||
      brandName ||
      subCategoryName ||
      mainCategoryName ||
      titleCaseSlug(category),
    modelPath: cleanOptionalString(source.modelPath),
    images: pic,
    colors,
    specs,
    media: {
      views: normalizedViews,
      gallery: pic,
    },
    mainCategory: extractEntityId(source.mainCategoryId as EntityReferenceLike) || extractEntityId(source.mainCategory as EntityReferenceLike),
    subCategory: extractEntityId(source.subCategoryId as EntityReferenceLike) || extractEntityId(source.subCategory as EntityReferenceLike),
    brand: extractEntityId(source.brandId as EntityReferenceLike) || extractEntityId(source.brand as EntityReferenceLike),
    mainCategoryName,
    subCategoryName,
    brandName,
    basePrice,
    discount,
    finalPrice,
    inStock,
    stockQuantity,
    size: cleanStringArray(source.size),
    pic,
    color,
    active: cleanBoolean(source.active, true),
  };
}

export function getProductCollectionName(
  product: Pick<ProductRecord, 'mainCategoryName' | 'category' | 'name'>
) {
  return cleanString(product.mainCategoryName) || titleCaseSlug(product.category) || product.name;
}

export function getProductCollectionKey(
  product: Pick<ProductRecord, 'mainCategoryId' | 'mainCategoryName' | 'category'>
) {
  return cleanString(product.mainCategoryId) || slugify(getProductCollectionName({
    mainCategoryName: product.mainCategoryName,
    category: product.category,
    name: '',
  }));
}

export function getProductCollectionTargetId(
  product: Pick<ProductRecord, 'mainCategoryName' | 'category' | 'name'>
) {
  return `collection-${slugify(getProductCollectionName(product))}`;
}

export function ensureFeaturedProducts(products: Array<ProductLike | DefaultProduct>) {
  const normalized = products.map((product) => normalizeProduct(product));
  const visible = normalized.filter((product) => product.active !== false);
  const source = visible.length ? visible : normalized;
  const byCollection = new Map<string, ProductRecord>();

  for (const product of source) {
    const key = getProductCollectionKey(product);
    if (!byCollection.has(key)) {
      byCollection.set(key, product);
    }
  }

  if (!byCollection.size) {
    return DEFAULT_PRODUCTS.map((product) => normalizeProduct(product, product.category));
  }

  return Array.from(byCollection.values());
}

export function buildStorefrontCollectionLinks(products: ProductRecord[]): StorefrontCollectionLink[] {
  const featuredProducts = ensureFeaturedProducts(products);

  return featuredProducts.map((product) => {
    const targetId = getProductCollectionTargetId(product);

    return {
      key: getProductCollectionKey(product),
      name: getProductCollectionName(product),
      href: `/#${targetId}`,
      targetId,
      category: product.category,
      productId: product.id,
    };
  });
}
