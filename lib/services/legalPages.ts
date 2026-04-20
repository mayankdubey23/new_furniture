import 'server-only';

import dbConnect from '@/lib/mongoose';
import Faq from '@/models/Faq';
import Setting from '@/models/Setting';
import {
  DEFAULT_FAQ_ITEMS,
  type LegalFaqEntry,
} from '@/lib/legalContent';
import {
  DEFAULT_SITE_SETTING,
  normalizeSiteSetting,
  type SiteSettingRecord,
} from '@/lib/siteSettings';

function normalizeFaq(value: Record<string, unknown>): LegalFaqEntry | null {
  const question = String(value.question || '').trim();
  const answer = String(value.answer || '').trim();
  const id = String(value._id || value.id || question).trim();

  if (!question || !answer) {
    return null;
  }

  return {
    id,
    question,
    answer,
  };
}

function mergeFaqs(primary: LegalFaqEntry[], fallback: LegalFaqEntry[]) {
  const merged: LegalFaqEntry[] = [];
  const seen = new Set<string>();

  for (const item of [...primary, ...fallback]) {
    const key = item.question.trim().toLowerCase();
    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    merged.push(item);
  }

  return merged;
}

export async function getLegalPageContext(): Promise<{
  siteSetting: SiteSettingRecord;
  faqs: LegalFaqEntry[];
}> {
  try {
    await dbConnect();

    const [settingRecord, faqRecords] = await Promise.all([
      Setting.findOne({}).sort({ createdAt: -1 }).lean(),
      Faq.find({ active: true }).sort({ createdAt: -1 }).lean(),
    ]);

    const siteSetting = settingRecord
      ? normalizeSiteSetting(settingRecord)
      : DEFAULT_SITE_SETTING;

    const faqs = mergeFaqs(
      faqRecords
        .map((item) => normalizeFaq(item as Record<string, unknown>))
        .filter((item): item is LegalFaqEntry => Boolean(item)),
      DEFAULT_FAQ_ITEMS
    );

    return {
      siteSetting,
      faqs: faqs.length ? faqs : DEFAULT_FAQ_ITEMS,
    };
  } catch {
    return {
      siteSetting: DEFAULT_SITE_SETTING,
      faqs: DEFAULT_FAQ_ITEMS,
    };
  }
}
