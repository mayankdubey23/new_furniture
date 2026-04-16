import { revalidatePath } from 'next/cache';
import { getProductRouteSegments } from '@/lib/productCatalog';

type RevalidatableProduct =
  | string
  | {
      id?: string | null;
      _id?: string | null;
      name?: string | null;
      category?: string | null;
    };

export function revalidateCatalogRoutes(product?: RevalidatableProduct) {
  revalidatePath('/', 'layout');
  revalidatePath('/admin');

  if (!product) {
    return;
  }

  const segments =
    typeof product === 'string'
      ? [product]
      : getProductRouteSegments({
          id: product.id || '',
          _id: product._id || '',
          name: product.name || '',
          category: product.category || '',
        });

  for (const segment of segments) {
    revalidatePath(`/products/${segment}`);
  }
}
