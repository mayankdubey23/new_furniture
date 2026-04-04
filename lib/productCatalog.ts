export const PRODUCT_CATEGORIES = ['sofa', 'chair', 'recliner', 'pouffe'] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const PRODUCT_VIEW_KEYS = ['main', 'cover', 'left', 'right', 'top', 'detail'] as const;
export type ProductViewKey = (typeof PRODUCT_VIEW_KEYS)[number];

export interface ProductColorEntry {
  name: string;
  image: string;
}

export interface ProductSpecs {
  material: string;
  foam?: string;
  dimensions: string;
  weight: string;
  warranty: string;
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
  category: ProductCategory;
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
}

export interface ProductInput {
  category: ProductCategory;
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
}

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
};

interface DefaultProduct extends Omit<ProductInput, 'imageUrl' | 'images' | 'media'> {
  imageUrl?: string;
  images?: string[];
  media?: Partial<ProductMedia>;
}

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

export function isProductCategory(value: string): value is ProductCategory {
  return PRODUCT_CATEGORIES.includes(value as ProductCategory);
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
  const inferredFromImages = cleanStringArray(source.images);
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
  const images = cleanStringArray(source.images);
  const namedViewImages = new Set(
    Object.values(views)
      .map((entry) => cleanString(entry))
      .filter(Boolean)
  );

  return dedupeStrings([...mediaGallery, ...images]).filter((image) => !namedViewImages.has(image));
}

export const DEFAULT_PRODUCTS: DefaultProduct[] = [
  {
    category: 'sofa',
    name: 'Milano Sculpted Sofa',
    description:
      'Layered in deep olive velvet with a softly curved silhouette, this statement sofa anchors the room with gallery-grade presence and cloud-soft comfort.',
    price: 45000,
    stock: 7,
    eyebrow: 'Signature Sofa',
    modelPath: '/3D%20models/teal%20sofa%203d%20model.glb',
    colors: [
      { name: 'Olive Velvet', image: '/products/sofa/main.png' },
      { name: 'Bronze Leather', image: '/products/sofa/bronge leather.png' },
      { name: 'Warm Taupe', image: '/products/sofa/warm taupe.png' },
      { name: 'Deep Charcoal', image: '/products/sofa/deep charcol.png' },
    ],
    specs: {
      material: 'Premium velvet upholstery',
      foam: 'High-density foam core',
      dimensions: '300 x 90 x 80 cm',
      weight: '80 kg',
      warranty: '5 years',
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
  },
  {
    category: 'chair',
    name: 'Verona Accent Chair',
    description:
      'A sculpted lounge chair with curved arms, rich textured upholstery, and a compact footprint that adds depth to reading corners and formal seating areas.',
    price: 18500,
    stock: 12,
    eyebrow: 'Accent Seating',
    modelPath: '/3D%20models/teal+velvet+armchair+3d+model.glb',
    colors: [
      { name: 'Cognac Leather', image: '/products/chairs/Cognac Leather.png' },
      { name: 'Forest Green', image: '/products/chairs/Forest Green.png' },
      { name: 'Sunset Terracotta', image: '/products/chairs/Sunset Terracotta.png' },
      { name: 'Midnight Navy', image: '/products/chairs/midnight navy.png' },
    ],
    specs: {
      material: 'Textured fabric',
      foam: 'Multi-layer foam',
      dimensions: '80 x 80 x 85 cm',
      weight: '25 kg',
      warranty: '3 years',
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
  },
  {
    category: 'recliner',
    name: 'Aurelian Leather Recliner',
    description:
      'Cut in rich saddle leather with tailored stitching and a quietly engineered recline, it brings lounge-level comfort to a polished living space.',
    price: 32000,
    stock: 4,
    eyebrow: 'Private Lounge',
    modelPath: '/3D%20models/recliner+chair+3d+model.glb',
    colors: [
      { name: 'Cognac Leather', image: '/products/recliners/Cognac Leather.png' },
      { name: 'Forest Green', image: '/products/recliners/Forest Green.png' },
      { name: 'Midnight Navy', image: '/products/recliners/Midnight Navy.png' },
      { name: 'Sunset Terracotta', image: '/products/recliners/Sunset Terracotta.png' },
    ],
    specs: {
      material: 'Full-grain leather',
      foam: 'Ergonomic recliner mechanism',
      dimensions: '95 x 95 x 105 cm',
      weight: '45 kg',
      warranty: '5 years',
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
  },
  {
    category: 'pouffe',
    name: 'Atelier Accent Pouffe',
    description:
      'A compact accent piece with artisanal texture, warm bronze undertones, and flexible styling that works beside a sofa, bed, or reading chair.',
    price: 4500,
    stock: 18,
    eyebrow: 'Finishing Touch',
    modelPath: '/3D%20models/teal+pouffies+3d+model.glb',
    colors: [
      { name: 'Bronze Texture', image: '/products/pouffes/Cognac Leather.png' },
      { name: 'Warm Sand', image: '/products/pouffes/Midnight Navy.png' },
      { name: 'Clay Terracotta', image: '/products/pouffes/Sunset Terracota.png' },
      { name: 'Forest Green', image: '/products/pouffes/Forest Green.png' },
    ],
    specs: {
      material: 'Artisanal woven fabric',
      foam: 'Firm support filling',
      dimensions: '50 x 50 x 40 cm',
      weight: '8 kg',
      warranty: '2 years',
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
  },
];

const DEFAULT_PRODUCT_BY_CATEGORY = new Map(
  DEFAULT_PRODUCTS.map((product) => [product.category, product])
);

function getDefaultProduct(category: ProductCategory) {
  return DEFAULT_PRODUCT_BY_CATEGORY.get(category) ?? DEFAULT_PRODUCTS[0];
}

function normalizeColors(value: unknown, fallback: ProductColorEntry[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const colors = value
    .map((entry) => {
      const source: Record<string, unknown> = isRecord(entry) ? entry : {};
      const name = cleanString(source.name);
      const image = cleanString(source.image);

      if (!name || !image) {
        return null;
      }

      return { name, image };
    })
    .filter((entry): entry is ProductColorEntry => Boolean(entry));

  return colors.length ? colors : fallback;
}

function normalizeSpecs(value: unknown, fallback: ProductSpecs): ProductSpecs {
  const source: Record<string, unknown> = isRecord(value) ? value : {};

  return {
    material: cleanString(source.material) || fallback.material,
    foam: cleanString(source.foam) || fallback.foam || '',
    dimensions: cleanString(source.dimensions) || fallback.dimensions,
    weight: cleanString(source.weight) || fallback.weight,
    warranty: cleanString(source.warranty) || fallback.warranty,
  };
}

export function normalizeProduct(
  value: ProductLike | DefaultProduct,
  fallbackCategory?: ProductCategory
): ProductRecord {
  const source = value as ProductLike;
  const rawCategory = cleanString(value.category).toLowerCase();
  const category = isProductCategory(rawCategory)
    ? rawCategory
    : fallbackCategory || DEFAULT_PRODUCTS[0].category;
  const fallback = getDefaultProduct(category);
  const views = {
    ...extractProductViews(fallback),
    ...extractProductViews(value),
  };
  const additionalGallery = dedupeStrings([
    ...extractAdditionalGalleryImages(fallback),
    ...extractAdditionalGalleryImages(value),
  ]);
  const images = buildOrderedProductImages(views, additionalGallery, cleanString(value.imageUrl) || fallback.media?.views?.main || '');
  const mainImage = views.main || images[0] || fallback.media?.views?.main || '';
  const normalizedViews: ProductMediaViews = {
    main: mainImage,
    ...(views.cover ? { cover: views.cover } : {}),
    ...(views.left ? { left: views.left } : {}),
    ...(views.right ? { right: views.right } : {}),
    ...(views.top ? { top: views.top } : {}),
    ...(views.detail ? { detail: views.detail } : {}),
  };
  const id = String(source._id ?? source.id ?? `${category}-${slugify(cleanString(value.name) || fallback.name)}`);
  const specs = normalizeSpecs(value.specs, fallback.specs);

  return {
    id,
    _id: id,
    category,
    name: cleanString(value.name) || fallback.name,
    description: cleanString(value.description) || fallback.description,
    price: cleanNumber(value.price, fallback.price),
    stock: Math.max(0, cleanNumber(value.stock, fallback.stock)),
    imageUrl: mainImage,
    eyebrow: cleanString(value.eyebrow) || fallback.eyebrow,
    modelPath: cleanOptionalString(value.modelPath) ?? fallback.modelPath ?? null,
    images: images.length ? images : fallback.media?.gallery || [],
    colors: normalizeColors(value.colors, fallback.colors),
    specs,
    media: {
      views: normalizedViews,
      gallery: images.length ? images : fallback.media?.gallery || [],
    },
  };
}

export function prepareProductMutationInput(value: ProductLike | DefaultProduct): ProductInput {
  const category = cleanString(value.category).toLowerCase();

  if (!isProductCategory(category)) {
    throw new Error('Please select a valid product category.');
  }

  const name = cleanString(value.name);
  const description = cleanString(value.description);
  const eyebrow = cleanString(value.eyebrow);
  const price = cleanNumber(value.price, Number.NaN);
  const stock = Math.max(0, cleanNumber(value.stock, 0));

  if (!name) throw new Error('Product name is required.');
  if (!description) throw new Error('Description is required.');
  if (!eyebrow) throw new Error('Eyebrow label is required.');
  if (!Number.isFinite(price) || price < 0) throw new Error('Price must be a valid number.');

  const specsSource: Record<string, unknown> = isRecord(value.specs) ? value.specs : {};
  const specs: ProductSpecs = {
    material: cleanString(specsSource.material),
    foam: cleanString(specsSource.foam),
    dimensions: cleanString(specsSource.dimensions),
    weight: cleanString(specsSource.weight),
    warranty: cleanString(specsSource.warranty),
  };

  if (!specs.material || !specs.dimensions || !specs.weight || !specs.warranty) {
    throw new Error('Material, dimensions, weight, and warranty are required.');
  }

  const colors = Array.isArray(value.colors)
    ? value.colors
        .map((entry) => {
          const source: Record<string, unknown> = isRecord(entry) ? entry : {};
          const colorName = cleanString(source.name);
          const colorImage = cleanString(source.image);
          if (!colorName || !colorImage) {
            return null;
          }

          return { name: colorName, image: colorImage };
        })
        .filter((entry): entry is ProductColorEntry => Boolean(entry))
    : [];

  const views = extractProductViews(value);
  const gallery = dedupeStrings([
    ...extractAdditionalGalleryImages(value),
    ...cleanStringArray(value.images),
    ...(isRecord(value.media) ? cleanStringArray(value.media.gallery) : []),
  ]);
  const imageUrl = views.main || cleanString(value.imageUrl) || gallery[0] || colors[0]?.image || '';

  if (!imageUrl) {
    throw new Error('A main product image is required.');
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

  return {
    category,
    name,
    description,
    price,
    stock,
    imageUrl,
    eyebrow,
    modelPath: cleanOptionalString(value.modelPath),
    images,
    colors,
    specs,
    media: {
      views: normalizedViews,
      gallery: images,
    },
  };
}

export function ensureFeaturedProducts(products: Array<ProductLike | DefaultProduct>) {
  const normalized = products.map((product) => normalizeProduct(product));
  const byCategory = new Map<ProductCategory, ProductRecord>();

  for (const product of normalized) {
    if (!byCategory.has(product.category)) {
      byCategory.set(product.category, product);
    }
  }

  return PRODUCT_CATEGORIES.map((category) => {
    const product = byCategory.get(category);
    return product ?? normalizeProduct(getDefaultProduct(category), category);
  });
}
