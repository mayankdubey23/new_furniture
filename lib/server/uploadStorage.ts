import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { slugify } from '@/lib/productCatalog';

export const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);
export const MODEL_EXTENSIONS = new Set(['.glb']);
export const VIDEO_EXTENSIONS = new Set(['.mp4', '.webm', '.ogg']);

function resolveUploadRoot(configuredRoot: string | undefined, segments: string[]) {
  const normalizedRoot = configuredRoot?.trim();

  if (normalizedRoot) {
    return path.isAbsolute(normalizedRoot)
      ? normalizedRoot
      : path.join(/* turbopackIgnore: true */ process.cwd(), normalizedRoot);
  }

  return path.join(/* turbopackIgnore: true */ process.cwd(), ...segments);
}

export const PRODUCT_UPLOAD_ROOT =
  resolveUploadRoot(process.env.PRODUCT_UPLOAD_ROOT, ['public', 'uploads', 'products']);

export const PRODUCT_UPLOAD_PUBLIC_BASE =
  process.env.PRODUCT_UPLOAD_PUBLIC_BASE || '/uploads/products';

export const CATALOG_UPLOAD_ROOT =
  resolveUploadRoot(process.env.CATALOG_UPLOAD_ROOT, ['public', 'uploads']);

export const CATALOG_UPLOAD_PUBLIC_BASE =
  process.env.CATALOG_UPLOAD_PUBLIC_BASE || '/uploads';

export const SITE_UPLOAD_ROOT =
  resolveUploadRoot(process.env.SITE_UPLOAD_ROOT, ['public', 'uploads', 'site']);

export const SITE_UPLOAD_PUBLIC_BASE =
  process.env.SITE_UPLOAD_PUBLIC_BASE || '/uploads/site';

export type CatalogUploadCollection = 'maincategory' | 'subcategory' | 'brand';

export function sanitizeUploadSegment(value: string, fallback: string) {
  return slugify(value) || fallback;
}

export function getUploadExtension(file: File) {
  const originalExtension = path.extname(file.name).toLowerCase();

  if (originalExtension) {
    return originalExtension;
  }

  if (file.type === 'image/jpeg') return '.jpg';
  if (file.type === 'image/png') return '.png';
  if (file.type === 'image/webp') return '.webp';
  if (file.type === 'image/avif') return '.avif';
  if (file.type === 'model/gltf-binary') return '.glb';

  return '';
}

export function getAllowedExtensions(kind: 'image' | 'model') {
  return kind === 'model' ? MODEL_EXTENSIONS : IMAGE_EXTENSIONS;
}

export function getAllowedSiteExtensions(kind: 'image' | 'video') {
  return kind === 'video' ? VIDEO_EXTENSIONS : IMAGE_EXTENSIONS;
}

export function buildProductUploadTarget({
  category,
  productName,
  slot,
  kind,
  extension,
}: {
  category: string;
  productName: string;
  slot: string;
  kind: 'image' | 'model';
  extension: string;
}) {
  const safeCategory = sanitizeUploadSegment(category, 'general');
  const safeProductName = sanitizeUploadSegment(productName, 'draft-product');
  const safeSlot = sanitizeUploadSegment(slot, 'asset');
  const destinationFolder = kind === 'model' ? 'models' : 'images';
  const directory = path.join(
    /* turbopackIgnore: true */ PRODUCT_UPLOAD_ROOT,
    safeCategory,
    safeProductName,
    destinationFolder
  );
  const filename = `${safeSlot}-${Date.now()}${extension}`;
  const absolutePath = path.join(/* turbopackIgnore: true */ directory, filename);
  const publicPath = `${PRODUCT_UPLOAD_PUBLIC_BASE}/${safeCategory}/${safeProductName}/${destinationFolder}/${filename}`;

  return {
    directory,
    absolutePath,
    publicPath,
  };
}

export function buildCatalogUploadTarget({
  collection,
  entityName,
  extension,
}: {
  collection: CatalogUploadCollection;
  entityName: string;
  extension: string;
}) {
  const safeCollection = sanitizeUploadSegment(collection, 'catalog');
  const safeEntityName = sanitizeUploadSegment(entityName, 'item');
  const directory = path.join(/* turbopackIgnore: true */ CATALOG_UPLOAD_ROOT, safeCollection);
  const filename = `${Date.now()}${safeEntityName}${extension}`;
  const absolutePath = path.join(/* turbopackIgnore: true */ directory, filename);
  const publicPath = `${CATALOG_UPLOAD_PUBLIC_BASE}/${safeCollection}/${filename}`;

  return {
    directory,
    absolutePath,
    publicPath,
  };
}

export function buildSiteUploadTarget({
  section,
  slot,
  kind,
  extension,
}: {
  section: string;
  slot: string;
  kind: 'image' | 'video';
  extension: string;
}) {
  const safeSection = sanitizeUploadSegment(section, 'site');
  const safeSlot = sanitizeUploadSegment(slot, 'asset');
  const folder = kind === 'video' ? 'videos' : 'images';
  const directory = path.join(/* turbopackIgnore: true */ SITE_UPLOAD_ROOT, safeSection, folder);
  const filename = `${safeSlot}-${Date.now()}${extension}`;
  const absolutePath = path.join(/* turbopackIgnore: true */ directory, filename);
  const publicPath = `${SITE_UPLOAD_PUBLIC_BASE}/${safeSection}/${folder}/${filename}`;

  return {
    directory,
    absolutePath,
    publicPath,
  };
}

async function persistUpload(target: {
  directory: string;
  absolutePath: string;
  publicPath: string;
}, file: File) {
  await mkdir(target.directory, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(target.absolutePath, buffer);

  return {
    ok: true as const,
    path: target.publicPath,
  };
}

export async function saveProductUpload({
  file,
  category,
  productName,
  slot,
  kind,
}: {
  file: File;
  category: string;
  productName: string;
  slot: string;
  kind: 'image' | 'model';
}) {
  const extension = getUploadExtension(file);
  const allowedExtensions = getAllowedExtensions(kind);

  if (!allowedExtensions.has(extension)) {
    return {
      ok: false as const,
      error:
        kind === 'model'
          ? 'Only .glb files are supported for 3D uploads.'
          : 'Only JPG, PNG, WEBP, and AVIF files are supported.',
    };
  }

  const target = buildProductUploadTarget({
    category,
    productName,
    slot,
    kind,
    extension,
  });

  return persistUpload(target, file);
}

export async function saveCatalogUpload({
  file,
  collection,
  entityName,
}: {
  file: File;
  collection: CatalogUploadCollection;
  entityName: string;
}) {
  const extension = getUploadExtension(file);

  if (!IMAGE_EXTENSIONS.has(extension)) {
    return {
      ok: false as const,
      error: 'Only JPG, PNG, WEBP, and AVIF files are supported.',
    };
  }

  const target = buildCatalogUploadTarget({
    collection,
    entityName,
    extension,
  });

  return persistUpload(target, file);
}

export async function saveSiteUpload({
  file,
  section,
  slot,
  kind,
}: {
  file: File;
  section: string;
  slot: string;
  kind: 'image' | 'video';
}) {
  const extension = getUploadExtension(file);
  const allowedExtensions = getAllowedSiteExtensions(kind);

  if (!allowedExtensions.has(extension)) {
    return {
      ok: false as const,
      error:
        kind === 'video'
          ? 'Only MP4, WEBM, and OGG videos are supported.'
          : 'Only JPG, PNG, WEBP, and AVIF files are supported.',
    };
  }

  const target = buildSiteUploadTarget({
    section,
    slot,
    kind,
    extension,
  });

  return persistUpload(target, file);
}
