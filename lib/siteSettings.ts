import { SITE_CONTACT_EMAIL, SITE_NAME } from '@/lib/brand';
import { cleanString, getId, toIsoDateString } from '@/lib/server/legacyApi';

export interface SiteSettingRecord {
  id: string;
  _id: string;
  map1: string;
  map2: string;
  address: string;
  siteName: string;
  email: string;
  phone: string;
  whatsapp: string;
  facebook: string;
  youtube: string;
  instagram: string;
  linkedin: string;
  twitter: string;
  createdAt?: string;
  updatedAt?: string;
}

export const DEFAULT_SITE_SETTING: SiteSettingRecord = {
  id: 'default-setting',
  _id: 'default-setting',
  map1: 'https://maps.google.com/?q=Indiranagar+Bengaluru',
  map2: 'https://maps.google.com/?q=Noida+Uttar+Pradesh',
  address: '12 Gallery Lane, Indiranagar, Bengaluru',
  siteName: SITE_NAME,
  email: SITE_CONTACT_EMAIL,
  phone: '+91 98765 43210',
  whatsapp: '+91 98765 43210',
  facebook: 'https://facebook.com/furniturelele',
  youtube: 'https://youtube.com/@furniturelele',
  instagram: 'https://instagram.com/furniturelele',
  linkedin: 'https://linkedin.com/company/furniturelele',
  twitter: 'https://x.com/furniturelele',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function normalizeSiteSetting(value: unknown) {
  const source = isRecord(value) ? value : {};
  const id = getId(source._id ?? source.id) || DEFAULT_SITE_SETTING.id;
  const createdAt = toIsoDateString(source.createdAt);
  const updatedAt = toIsoDateString(source.updatedAt);

  return {
    id,
    _id: id,
    map1: cleanString(source.map1) || DEFAULT_SITE_SETTING.map1,
    map2: cleanString(source.map2) || DEFAULT_SITE_SETTING.map2,
    address: cleanString(source.address) || DEFAULT_SITE_SETTING.address,
    siteName: cleanString(source.siteName) || DEFAULT_SITE_SETTING.siteName,
    email: cleanString(source.email) || DEFAULT_SITE_SETTING.email,
    phone: cleanString(source.phone) || DEFAULT_SITE_SETTING.phone,
    whatsapp: cleanString(source.whatsapp) || DEFAULT_SITE_SETTING.whatsapp,
    facebook: cleanString(source.facebook) || DEFAULT_SITE_SETTING.facebook,
    youtube: cleanString(source.youtube) || DEFAULT_SITE_SETTING.youtube,
    instagram: cleanString(source.instagram) || DEFAULT_SITE_SETTING.instagram,
    linkedin: cleanString(source.linkedin) || DEFAULT_SITE_SETTING.linkedin,
    twitter: cleanString(source.twitter) || DEFAULT_SITE_SETTING.twitter,
    ...(createdAt ? { createdAt } : {}),
    ...(updatedAt ? { updatedAt } : {}),
  } satisfies SiteSettingRecord;
}
