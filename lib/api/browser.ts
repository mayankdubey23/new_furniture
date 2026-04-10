export const DATA_SOURCE_VALUES = ['internal', 'external', 'mock'] as const;

export type DataSource = (typeof DATA_SOURCE_VALUES)[number];

const DEFAULT_MOCK_API_BASE_URL = 'http://localhost:4000';

function isDataSource(value: string): value is DataSource {
  return DATA_SOURCE_VALUES.includes(value as DataSource);
}

function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/, '');
}

export function getBrowserDataSource(): DataSource {
  const value = String(process.env.NEXT_PUBLIC_DATA_SOURCE || 'internal').trim().toLowerCase();
  return isDataSource(value) ? value : 'internal';
}

export function getBrowserApiBaseUrl(source: DataSource = getBrowserDataSource()) {
  if (source === 'internal') {
    return '';
  }

  if (source === 'mock') {
    return normalizeBaseUrl(process.env.NEXT_PUBLIC_MOCK_API_BASE_URL || DEFAULT_MOCK_API_BASE_URL);
  }

  return normalizeBaseUrl(process.env.NEXT_PUBLIC_EXTERNAL_API_BASE_URL || '');
}

export function getApiUrl(path: string, source: DataSource = getBrowserDataSource()) {
  if (!path) {
    return path;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const baseUrl = getBrowserApiBaseUrl(source);

  return baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath;
}
