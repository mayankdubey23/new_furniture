const INTERNAL_ADMIN_ROOT = '/admin';
const DEFAULT_ADMIN_PORTAL_SLUG = 'atelier-access-7f3k';

function normalizeSegment(value: string | undefined) {
  const cleaned = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!cleaned || cleaned === 'admin') {
    return DEFAULT_ADMIN_PORTAL_SLUG;
  }

  return cleaned;
}

export function getAdminPortalSlug() {
  return normalizeSegment(process.env.NEXT_PUBLIC_ADMIN_PORTAL_SLUG);
}

export function getAdminPortalBasePath() {
  return `/${getAdminPortalSlug()}`;
}

export function getAdminInternalPath(path = '') {
  const suffix = String(path || '').trim();
  if (!suffix || suffix === '/') {
    return INTERNAL_ADMIN_ROOT;
  }

  return suffix.startsWith('/')
    ? `${INTERNAL_ADMIN_ROOT}${suffix}`
    : `${INTERNAL_ADMIN_ROOT}/${suffix}`;
}

export function getAdminPortalPath(path = '') {
  const basePath = getAdminPortalBasePath();
  const suffix = String(path || '').trim();

  if (!suffix || suffix === '/') {
    return basePath;
  }

  if (suffix.startsWith('#')) {
    return `${basePath}${suffix}`;
  }

  return suffix.startsWith('/')
    ? `${basePath}${suffix}`
    : `${basePath}/${suffix}`;
}

export function getAdminRouteSuffix(pathname: string | null | undefined) {
  const currentPath = String(pathname || '').trim();
  const basePath = getAdminPortalBasePath();

  if (currentPath === basePath) {
    return '';
  }

  if (currentPath.startsWith(`${basePath}/`)) {
    return currentPath.slice(basePath.length);
  }

  if (currentPath === INTERNAL_ADMIN_ROOT) {
    return '';
  }

  if (currentPath.startsWith(`${INTERNAL_ADMIN_ROOT}/`)) {
    return currentPath.slice(INTERNAL_ADMIN_ROOT.length);
  }

  return null;
}

export function isAdminPortalPath(pathname: string | null | undefined) {
  return getAdminRouteSuffix(pathname) !== null;
}

export function isAdminLoginPath(pathname: string | null | undefined) {
  return getAdminRouteSuffix(pathname) === '/login';
}

