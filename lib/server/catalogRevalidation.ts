import { revalidatePath } from 'next/cache';

export function revalidateCatalogRoutes(productId?: string) {
  revalidatePath('/', 'layout');
  revalidatePath('/admin');

  if (productId) {
    revalidatePath(`/products/${productId}`);
  }
}

