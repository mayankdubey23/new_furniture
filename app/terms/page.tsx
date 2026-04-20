import Footer from '@/components/Footer';
import PolicyPageClient from '@/components/legal/PolicyPageClient';
import {
  LEGAL_LAST_UPDATED,
  getTermsHighlights,
  getTermsSections,
} from '@/lib/legalContent';
import { SITE_NAME } from '@/lib/brand';
import { getStorefrontCollectionLinks } from '@/lib/productStore';
import { getSiteContent } from '@/lib/services/siteContent';
import { ensureStorefrontAvailable } from '@/lib/services/storefrontAvailability';
import { getLegalPageContext } from '@/lib/services/legalPages';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: `Terms & Conditions | ${SITE_NAME}`,
  description:
    `Review the rules for accounts, checkout, customization requests, payments, delivery, and order tracking on ${SITE_NAME}.`,
};

export default async function TermsPage() {
  await ensureStorefrontAvailable();

  const [{ siteSetting }, collections, siteContent] = await Promise.all([
    getLegalPageContext(),
    getStorefrontCollectionLinks(),
    getSiteContent(),
  ]);

  return (
    <>
      <PolicyPageClient
        eyebrow="Terms & Conditions"
        title="The key terms for shopping with the studio."
        intro="These terms cover browsing, customer accounts, checkout, payments, customization requests, delivery updates, and support after you place an order."
        lastUpdated={LEGAL_LAST_UPDATED}
        highlights={getTermsHighlights()}
        sections={getTermsSections(siteSetting)}
        siteSetting={siteSetting}
      />
      <Footer collections={collections} content={siteContent.footer} />
    </>
  );
}
