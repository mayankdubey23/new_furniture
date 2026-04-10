export interface SiteVideoAsset {
  src: string;
  type: string;
  poster?: string;
  preload?: 'auto' | 'metadata' | 'none';
}

export interface HeroTitleRow {
  text: string;
  className: string;
}

export interface HeroContent {
  eyebrow: string;
  titleRows: HeroTitleRow[];
  description: string;
  scrollHint: string;
  video: SiteVideoAsset;
}

export interface FooterContent {
  brandLabel: string;
  brandName: string;
  description: string;
  tags: string[];
  newsletterHeading: string;
  newsletterDescription: string;
  burstVideo: SiteVideoAsset;
}

export interface SiteContent {
  hero: HeroContent;
  footer: FooterContent;
}

const DEFAULT_HERO_TITLE_ROWS: HeroTitleRow[] = [
  { text: 'Furniture', className: 'hero-piece hero-piece-left text-theme-ivory' },
  { text: 'that', className: 'hero-piece hero-piece-top text-theme-ivory/88' },
  { text: 'arrives', className: 'hero-piece hero-piece-right text-theme-bronze' },
  { text: 'like', className: 'hero-piece hero-piece-bottom text-theme-ivory/88' },
  { text: 'art.', className: 'hero-piece hero-piece-depth text-theme-ivory' },
];

export const DEFAULT_SITE_CONTENT: SiteContent = {
  hero: {
    eyebrow: 'Sculpted Interiors',
    titleRows: DEFAULT_HERO_TITLE_ROWS,
    description:
      'Discover statement seating, tactile finishes, and gallery-inspired furniture designed to make every room feel curated.',
    scrollHint: 'Scroll to uncover the collection',
    video: {
      src: '/Furniture_Assembles.mp4',
      type: 'video/mp4',
      poster: '/hero-poster.jpg',
      preload: 'none',
    },
  },
  footer: {
    brandLabel: 'Luxe Atelier',
    brandName: 'LUXE',
    description:
      'Curated seating, tactile materials, and atmospheric product storytelling for homes that want to feel composed and elevated.',
    tags: ['Furniture', 'SVG Gallery'],
    newsletterHeading: 'Stay Informed',
    newsletterDescription:
      'Get first access to new drops, design notes, and private consultation openings.',
    burstVideo: {
      src: '/Luxury_Pillow_Burst_Animation_Video.footer.mp4',
      type: 'video/mp4',
      preload: 'metadata',
    },
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readString(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function readStringArray(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const normalized = value
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter(Boolean);

  return normalized.length ? normalized : fallback;
}

function normalizeVideo(value: unknown, fallback: SiteVideoAsset): SiteVideoAsset {
  const source = isRecord(value) ? value : {};

  return {
    src: readString(source.src, fallback.src),
    type: readString(source.type, fallback.type),
    poster: readString(source.poster, fallback.poster || ''),
    preload: readString(source.preload, fallback.preload || 'metadata') as SiteVideoAsset['preload'],
  };
}

function normalizeTitleRows(value: unknown, fallback: HeroTitleRow[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const rows = value
    .map((entry) => {
      const row = isRecord(entry) ? entry : {};
      const text = readString(row.text, '');
      const className = readString(row.className, '');

      if (!text || !className) {
        return null;
      }

      return { text, className };
    })
    .filter((entry): entry is HeroTitleRow => Boolean(entry));

  return rows.length ? rows : fallback;
}

export function normalizeSiteContent(value: unknown): SiteContent {
  const source = isRecord(value) ? value : {};
  const heroSource = isRecord(source.hero) ? source.hero : {};
  const footerSource = isRecord(source.footer) ? source.footer : {};

  return {
    hero: {
      eyebrow: readString(heroSource.eyebrow, DEFAULT_SITE_CONTENT.hero.eyebrow),
      titleRows: normalizeTitleRows(heroSource.titleRows, DEFAULT_SITE_CONTENT.hero.titleRows),
      description: readString(heroSource.description, DEFAULT_SITE_CONTENT.hero.description),
      scrollHint: readString(heroSource.scrollHint, DEFAULT_SITE_CONTENT.hero.scrollHint),
      video: normalizeVideo(heroSource.video, DEFAULT_SITE_CONTENT.hero.video),
    },
    footer: {
      brandLabel: readString(footerSource.brandLabel, DEFAULT_SITE_CONTENT.footer.brandLabel),
      brandName: readString(footerSource.brandName, DEFAULT_SITE_CONTENT.footer.brandName),
      description: readString(footerSource.description, DEFAULT_SITE_CONTENT.footer.description),
      tags: readStringArray(footerSource.tags, DEFAULT_SITE_CONTENT.footer.tags),
      newsletterHeading: readString(
        footerSource.newsletterHeading,
        DEFAULT_SITE_CONTENT.footer.newsletterHeading
      ),
      newsletterDescription: readString(
        footerSource.newsletterDescription,
        DEFAULT_SITE_CONTENT.footer.newsletterDescription
      ),
      burstVideo: normalizeVideo(footerSource.burstVideo, DEFAULT_SITE_CONTENT.footer.burstVideo),
    },
  };
}
