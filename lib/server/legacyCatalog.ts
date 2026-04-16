import { normalizeCatalogEntity, prepareCatalogEntityMutationInput } from '@/lib/catalogEntities';
import {
  cleanBoolean,
  cleanString,
  extractFiles,
} from '@/lib/server/legacyApi';
import {
  saveCatalogUpload,
  type CatalogUploadCollection,
} from '@/lib/server/uploadStorage';

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function serializeLegacyCatalogEntity(value: unknown) {
  if (!isRecord(value)) {
    return null;
  }

  return normalizeCatalogEntity(value);
}

export async function buildLegacyCatalogPayload(
  data: Record<string, unknown>,
  collection: CatalogUploadCollection,
  label: string
) {
  let pic = cleanString(data.pic);
  const files = extractFiles(data.pic);

  if (files.length) {
    const upload = await saveCatalogUpload({
      file: files[0],
      collection,
      entityName: cleanString(data.name) || label,
    });

    if (!upload.ok) {
      throw new Error(upload.error);
    }

    pic = upload.path;
  }

  return prepareCatalogEntityMutationInput(
    {
      name: cleanString(data.name),
      pic,
      active: cleanBoolean(data.active, true),
    },
    label
  );
}
