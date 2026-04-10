import 'server-only';

import type { DataSource } from '@/lib/api/browser';
import { DATA_SOURCE_VALUES } from '@/lib/api/browser';

const DEFAULT_MOCK_API_BASE_URL = 'http://localhost:4000';

function isDataSource(value: string): value is DataSource {
  return DATA_SOURCE_VALUES.includes(value as DataSource);
}

function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/, '');
}

function readEnv(...names: string[]) {
  for (const name of names) {
    const value = String(process.env[name] || '').trim();
    if (value) {
      return value;
    }
  }

  return '';
}

export function getServerDataSource(): DataSource {
  const value = readEnv('DATA_SOURCE', 'NEXT_PUBLIC_DATA_SOURCE').toLowerCase() || 'internal';
  return isDataSource(value) ? value : 'internal';
}

export function getServerApiBaseUrl(source: DataSource = getServerDataSource()) {
  if (source === 'internal') {
    return '';
  }

  if (source === 'mock') {
    return normalizeBaseUrl(
      readEnv('MOCK_API_BASE_URL', 'NEXT_PUBLIC_MOCK_API_BASE_URL') || DEFAULT_MOCK_API_BASE_URL
    );
  }

  return normalizeBaseUrl(
    readEnv('EXTERNAL_API_BASE_URL', 'NEXT_PUBLIC_EXTERNAL_API_BASE_URL')
  );
}

export function getExternalProductsPath() {
  return readEnv('EXTERNAL_PRODUCTS_PATH', 'NEXT_PUBLIC_EXTERNAL_PRODUCTS_PATH') || '/api/products';
}

export function getExternalSiteContentPath() {
  return readEnv('EXTERNAL_SITE_CONTENT_PATH', 'NEXT_PUBLIC_EXTERNAL_SITE_CONTENT_PATH') || '/api/site-content';
}

export function getServerApiUrl(path: string, source: DataSource = getServerDataSource()) {
  if (!path) {
    return path;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const baseUrl = getServerApiBaseUrl(source);

  if (!baseUrl) {
    throw new Error(`No API base URL configured for "${source}" data source.`);
  }

  return `${baseUrl}${normalizedPath}`;
}

export async function fetchServerJson<T>(
  path: string,
  init?: RequestInit,
  source: DataSource = getServerDataSource()
) {
  const response = await fetch(getServerApiUrl(path, source), {
    ...init,
    headers: {
      Accept: 'application/json',
      ...init?.headers,
    },
    cache: init?.cache ?? 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${path} with status ${response.status}`);
  }

  return (await response.json()) as T;
}
