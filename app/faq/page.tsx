import Footer from '@/components/Footer';
import FaqPageClient from '@/components/legal/FaqPageClient';
import { SITE_NAME } from '@/lib/brand';
import { getStorefrontCollectionLinks } from '@/lib/productStore';
import { getSiteContent } from '@/lib/services/siteContent';
import { ensureStorefrontAvailable } from '@/lib/services/storefrontAvailability';
import { getLegalPageContext } from '@/lib/services/legalPages';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: `FAQ | ${SITE_NAME}`,
  description:
    `Answers about checkout, payments, customization, order tracking, account email, cart behavior, and support on ${SITE_NAME}.`,
};

export default async function FaqPage() {
  await ensureStorefrontAvailable();

  const [{ faqs, siteSetting }, collections, siteContent] = await Promise.all([
    getLegalPageContext(),
    getStorefrontCollectionLinks(),
    getSiteContent(),
  ]);

  return (
    <>
      <FaqPageClient faqs={faqs} siteSetting={siteSetting} />
      <Footer collections={collections} content={siteContent.footer} />
    </>
  );
}
