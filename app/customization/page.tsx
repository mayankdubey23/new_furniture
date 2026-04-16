import SofaReveal from '@/components/sections/SofaReveal';
import ClientCustomization from '@/components/customization/ClientCustomization';
import { SITE_NAME } from '@/lib/brand';

export const metadata = {
  title: `Customization & Cart | ${SITE_NAME}`,
  description: 'Review your cart and customize upholstery, finishes, and details before checkout.',
};

export default function CustomizationPage() {
  return (
    <>
      <SofaReveal />
      <ClientCustomization />
    </>
  );
}
