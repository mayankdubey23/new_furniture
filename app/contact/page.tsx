import ContactPageClient from '@/components/contact/ContactPageClient';
import { SITE_NAME } from '@/lib/brand';
import { ensureStorefrontAvailable } from '@/lib/services/storefrontAvailability';

export const metadata = {
  title: `Contact | ${SITE_NAME}`,
  description: `Get in touch with ${SITE_NAME} for bespoke furniture consultations, orders, and support.`,
};

export default async function ContactPage() {
  await ensureStorefrontAvailable();

  return <ContactPageClient />;
}
