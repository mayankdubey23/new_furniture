import { revalidatePath } from 'next/cache';

export function revalidateCatalogEntityRoutes() {
  revalidatePath('/', 'layout');
  revalidatePath('/admin');
  revalidatePath('/maintenance');
}
