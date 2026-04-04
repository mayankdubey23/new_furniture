import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { slugify } from '@/lib/productCatalog';

export const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);
export const MODEL_EXTENSIONS = new Set(['.glb', '.gltf']);

export const PRODUCT_UPLOAD_ROOT =
  process.env.PRODUCT_UPLOAD_ROOT || path.join(process.cwd(), 'public', 'uploads', 'products');

export const PRODUCT_UPLOAD_PUBLIC_BASE =
  process.env.PRODUCT_UPLOAD_PUBLIC_BASE || '/uploads/products';

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
  if (file.type === 'model/gltf+json') return '.gltf';

  return '';
}

export function getAllowedExtensions(kind: 'image' | 'model') {
  return kind === 'model' ? MODEL_EXTENSIONS : IMAGE_EXTENSIONS;
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
  const directory = path.join(PRODUCT_UPLOAD_ROOT, safeCategory, safeProductName, destinationFolder);
  const filename = `${safeSlot}-${Date.now()}${extension}`;
  const absolutePath = path.join(directory, filename);
  const publicPath = `${PRODUCT_UPLOAD_PUBLIC_BASE}/${safeCategory}/${safeProductName}/${destinationFolder}/${filename}`;

  return {
    directory,
    absolutePath,
    publicPath,
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
          ? 'Only .glb and .gltf files are supported for 3D uploads.'
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

  await mkdir(target.directory, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(target.absolutePath, buffer);

  return {
    ok: true as const,
    path: target.publicPath,
  };
}

