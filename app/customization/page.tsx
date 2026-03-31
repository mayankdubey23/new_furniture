import ClientCustomization from '@/components/customization/ClientCustomization';
import Link from 'next/link';

export const metadata = {
  title: 'Customization & Cart | Luxe Decor',
  description: 'Review your cart and customize upholstery, finishes, and details before checkout.',
};

export default function CustomizationPage() {
  return <ClientCustomization />;
}
