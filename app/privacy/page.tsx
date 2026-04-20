import Footer from '@/components/Footer';
import PolicyPageClient from '@/components/legal/PolicyPageClient';
import {
  LEGAL_LAST_UPDATED,
  getPrivacyHighlights,
  getPrivacySections,
} from '@/lib/legalContent';
import { SITE_NAME } from '@/lib/brand';
import { getStorefrontCollectionLinks } from '@/lib/productStore';
import { getSiteContent } from '@/lib/services/siteContent';
import { ensureStorefrontAvailable } from '@/lib/services/storefrontAvailability';
import { getLegalPageContext } from '@/lib/services/legalPages';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: `Privacy Policy | ${SITE_NAME}`,
  description:
    `Read how ${SITE_NAME} handles accounts, checkout data, customization requests, order tracking, and customer communications.`,
};

export default async function PrivacyPolicyPage() {
  await ensureStorefrontAvailable();

  const [{ siteSetting }, collections, siteContent] = await Promise.all([
    getLegalPageContext(),
    getStorefrontCollectionLinks(),
    getSiteContent(),
  ]);

  return (
    <>
      <PolicyPageClient
        eyebrow="Privacy Policy"
        title="Your privacy, explained in plain language."
        intro="This page explains what information we collect, why we collect it, and how it supports sign-in, checkout, customization requests, delivery updates, and customer support."
        lastUpdated={LEGAL_LAST_UPDATED}
        highlights={getPrivacyHighlights(siteSetting)}
        sections={getPrivacySections(siteSetting)}
        siteSetting={siteSetting}
      />
      <Footer collections={collections} content={siteContent.footer} />
    </>
  );
}
