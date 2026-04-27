import SofaReveal from '@/components/sections/SofaReveal';
import ClientCustomization from '@/components/customization/ClientCustomization';
import { SITE_NAME } from '@/lib/brand';
import { getAllProducts } from '@/lib/productStore';
import { ensureStorefrontAvailable } from '@/lib/services/storefrontAvailability';
import { getUserFromCookie } from '@/lib/userAuth';
import { listCustomerAddresses } from '@/lib/server/customerAddresses';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { redirect } from 'next/navigation';

export const metadata = {
  title: `Customization & Cart | ${SITE_NAME}`,
  description:
    'Customize upholstery, finishes, and sofa configurations, then preview layout guidance inside the customization studio.',
};

export default async function CustomizationPage() {
  await ensureStorefrontAvailable();
  const sessionUser = await getUserFromCookie();

  if (!sessionUser?.userId) {
    redirect('/login?returnTo=%2Fcustomization');
  }

  await dbConnect();

  const userRecord = await User.findById(sessionUser.userId)
    .select('name email phone')
    .lean();
  const savedAddresses = await listCustomerAddresses(sessionUser.userId);
  const products = await getAllProducts();
  const customizableProducts = products.filter(
    (product) => product.active !== false && product.inStock !== false
  );
  const signedInUser = {
    id: sessionUser.userId,
    name: String(userRecord?.name || sessionUser.name || '').trim(),
    email: String(userRecord?.email || sessionUser.email || '').trim().toLowerCase(),
    phone: String(userRecord?.phone || '').trim(),
  };

  return (
    <>
      <SofaReveal />
      <ClientCustomization
        products={customizableProducts}
        signedInUser={signedInUser}
        savedAddresses={savedAddresses}
      />
    </>
  );
}
