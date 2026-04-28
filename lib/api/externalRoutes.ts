const EXTERNAL_API_ROUTE_MAPPINGS = [
  ['/api/products', '/api/product'],
  ['/api/product', '/api/product'],
  ['/api/maincategories', '/api/maincategory'],
  ['/api/maincategory', '/api/maincategory'],
  ['/api/subcategories', '/api/subcategory'],
  ['/api/subcategory', '/api/subcategory'],
  ['/api/brands', '/api/brand'],
  ['/api/brand', '/api/brand'],
  ['/api/settings', '/api/setting'],
  ['/api/setting', '/api/setting'],
] as const;

function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function getExternalApiRouteMapping(pathname: string) {
  return EXTERNAL_API_ROUTE_MAPPINGS.find(([localPrefix]) => matchesPrefix(pathname, localPrefix)) || null;
}

export function mapLocalApiPathToExternalPath(pathname: string) {
  const mapping = getExternalApiRouteMapping(pathname);

  if (!mapping) {
    return pathname;
  }

  const [localPrefix, externalPrefix] = mapping;
  const suffix = pathname.slice(localPrefix.length);
  return `${externalPrefix}${suffix}`;
}

export function getDefaultExternalProductsPath() {
  return mapLocalApiPathToExternalPath('/api/products') || '/api/product';
}
