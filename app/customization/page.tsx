import SofaReveal from '@/components/sections/SofaReveal';
import ClientCustomization from '@/components/customization/ClientCustomization';
import { SITE_NAME } from '@/lib/brand';
import { getAllProducts } from '@/lib/productStore';
import { ensureStorefrontAvailable } from '@/lib/services/storefrontAvailability';

export const metadata = {
  title: `Customization & Cart | ${SITE_NAME}`,
  description:
    'Customize upholstery, finishes, and sofa configurations, then preview layout guidance inside the customization studio.',
};

export default async function CustomizationPage() {
  await ensureStorefrontAvailable();
  const products = await getAllProducts();
  const customizableProducts = products.filter(
    (product) => product.active !== false && product.inStock !== false
  );

  return (
    <>
      <SofaReveal />
      <ClientCustomization products={customizableProducts} />
    </>
  );
}
