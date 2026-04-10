import 'server-only';

import { cache } from 'react';
import {
  DEFAULT_SITE_CONTENT,
  normalizeSiteContent,
  type SiteContent,
} from '@/lib/content/siteContent';
import {
  fetchServerJson,
  getExternalSiteContentPath,
  getServerDataSource,
} from '@/lib/api/server';
import { readMockDatabase } from '@/lib/mocks/serverDb';

async function getMockSiteContent() {
  try {
    const database = await readMockDatabase();
    return normalizeSiteContent(database.siteContent);
  } catch {
    return DEFAULT_SITE_CONTENT;
  }
}

async function getExternalSiteContent() {
  try {
    const content = await fetchServerJson<unknown>(getExternalSiteContentPath());
    return normalizeSiteContent(content);
  } catch {
    return DEFAULT_SITE_CONTENT;
  }
}

export const getSiteContent = cache(async (): Promise<SiteContent> => {
  const source = getServerDataSource();

  if (source === 'mock') {
    return getMockSiteContent();
  }

  if (source === 'external') {
    return getExternalSiteContent();
  }

  return DEFAULT_SITE_CONTENT;
});
