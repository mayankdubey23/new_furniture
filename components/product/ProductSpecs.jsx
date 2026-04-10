'use client';

import { motion } from 'framer-motion';
import AnimatedHeading from '../AnimatedHeading';

const SECTION_ICONS = {
  dimensions: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M4 8V4h4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 16v4h-4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 8V4h-4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 16v4h4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 4h8M8 20h8M4 8v8M20 8v8" strokeLinecap="round" />
    </svg>
  ),
  material: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M4 14c4-8 12-8 16 0" strokeLinecap="round" />
      <path d="M6 14c0 4 2.7 6 6 6s6-2 6-6" />
      <path d="M12 6v4" strokeLinecap="round" />
    </svg>
  ),
  'general specifications': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M7 4h10l3 3v13H4V4h3z" />
      <path d="M8 11h8M8 15h6" strokeLinecap="round" />
    </svg>
  ),
  'comfort & construction': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M4 13h16v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4z" />
      <path d="M6 13V9a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v4" />
    </svg>
  ),
  'design & utility': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M5 8h14v10H5z" />
      <path d="M8 8V6a4 4 0 0 1 8 0v2" />
      <path d="M12 12v3" strokeLinecap="round" />
    </svg>
  ),
  'warranty & care': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M12 3l7 3v6c0 5-3 7.5-7 9-4-1.5-7-4-7-9V6l7-3z" />
      <path d="M9.5 12l1.7 1.7L15 10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  'manufacturer details': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M4 20V9l8-5 8 5v11" />
      <path d="M9 20v-5h6v5M8 11h.01M16 11h.01" strokeLinecap="round" />
    </svg>
  ),
  'customer care': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M5 12a7 7 0 0 1 14 0" />
      <path d="M4 13v3a2 2 0 0 0 2 2h2v-5H6a2 2 0 0 0-2 2zM20 13v3a2 2 0 0 1-2 2h-2v-5h2a2 2 0 0 1 2 2z" />
      <path d="M12 19v1" strokeLinecap="round" />
    </svg>
  ),
};

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeKey(value) {
  return normalizeText(value).toLowerCase();
}

function getSectionIcon(title) {
  return (
    SECTION_ICONS[normalizeKey(title)] || (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4l3 3" strokeLinecap="round" />
      </svg>
    )
  );
}

function buildLegacySections(specs) {
  const sections = [];

  if (normalizeText(specs?.dimensions)) {
    sections.push({
      title: 'Dimensions',
      items: [{ label: 'Dimensions', value: specs.dimensions }],
    });
  }

  const materialItems = [
    normalizeText(specs?.material) ? { label: 'Material', value: specs.material } : null,
    normalizeText(specs?.foam) ? { label: 'Foam & Fill', value: specs.foam } : null,
  ].filter(Boolean);

  if (materialItems.length) {
    sections.push({
      title: 'Material',
      items: materialItems,
    });
  }

  const additionalItems = [
    normalizeText(specs?.weight) ? { label: 'Weight', value: specs.weight } : null,
    normalizeText(specs?.warranty) ? { label: 'Warranty', value: specs.warranty } : null,
  ].filter(Boolean);

  if (additionalItems.length) {
    sections.push({
      title: 'Additional Details',
      items: additionalItems,
    });
  }

  return sections;
}

function resolveItemValue(label, value, productName, currentColorName) {
  const normalizedLabel = normalizeKey(label);

  if (normalizedLabel === 'product' && normalizeText(productName)) {
    return productName;
  }

  if (normalizedLabel === 'color' && normalizeText(currentColorName)) {
    return currentColorName;
  }

  return value;
}

function SectionCard({ section, index, productName, currentColorName }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-[1.7rem] border border-theme-line/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.8),rgba(246,237,227,0.55))] p-5 shadow-[0_18px_44px_rgba(49,30,21,0.05)] dark:bg-[linear-gradient(180deg,rgba(48,37,31,0.48),rgba(23,17,14,0.7))] md:p-6"
    >
      <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full bg-theme-bronze/10 blur-3xl" />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-theme-bronze/20 bg-white/78 text-theme-bronze shadow-[0_10px_24px_rgba(49,30,21,0.06)] dark:bg-white/8">
              {getSectionIcon(section.title)}
            </div>
            <div>
              <p className="text-[0.58rem] font-semibold uppercase tracking-[0.34em] text-theme-bronze/82">
                {String(index + 1).padStart(2, '0')}
              </p>
              <h3 className="mt-1 font-display text-[1.45rem] leading-none text-theme-ink dark:text-theme-ivory md:text-[1.7rem]">
                {section.title}
              </h3>
            </div>
          </div>

          <div className="rounded-full border border-theme-line/60 bg-white/74 px-3 py-1.5 text-[0.56rem] font-semibold uppercase tracking-[0.28em] text-theme-walnut/62 dark:bg-white/6 dark:text-theme-ivory/60">
            {section.items.length} items
          </div>
        </div>

        <dl className="mt-5 divide-y divide-theme-line/40">
          {section.items.map((item) => (
            <div
              key={`${section.title}-${item.label}`}
              className="grid gap-1 py-3.5 md:grid-cols-[minmax(10rem,0.75fr)_1fr] md:gap-5"
            >
              <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-theme-walnut/54 dark:text-theme-ivory/54">
                {item.label}
              </dt>
              <dd className="text-sm leading-7 text-theme-ink/82 dark:text-theme-ivory/82 md:text-[0.95rem]">
                {resolveItemValue(item.label, item.value, productName, currentColorName)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </motion.article>
  );
}

export default function ProductSpecs({
  specs,
  productName = '',
  currentColorName = '',
}) {
  if (!specs) return null;

  const sections =
    Array.isArray(specs.sections) && specs.sections.length
      ? specs.sections.filter((section) => normalizeText(section?.title) && Array.isArray(section?.items) && section.items.length)
      : buildLegacySections(specs);

  if (!sections.length) return null;

  const totalEntries = sections.reduce((count, section) => count + section.items.length, 0);

  return (
    <section className="relative overflow-hidden rounded-[2.2rem] border border-white/55 bg-[linear-gradient(165deg,rgba(255,255,255,0.48),rgba(246,238,229,0.82))] p-5 shadow-[0_34px_100px_rgba(49,30,21,0.08)] dark:border-white/10 dark:bg-[linear-gradient(165deg,rgba(43,33,28,0.58),rgba(20,15,12,0.84))] md:p-7">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(165,106,63,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(214,194,170,0.16),transparent_24%)]" />

      <div className="relative z-10">
        <div className="mb-6 grid gap-5 border-b border-theme-line/45 pb-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.38em] text-theme-bronze">
              Specification Sheet
            </p>
            <AnimatedHeading as="h3" className="mt-3 font-display text-[2rem] leading-[0.94] text-theme-ink dark:text-theme-ivory md:text-[2.9rem]">
              Crafted details,
              {'\n'}
              arranged clearly.
            </AnimatedHeading>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-theme-walnut/70 dark:text-theme-ivory/65 md:text-base">
              Structured product information for dimensions, material, care, origin, and day-to-day use.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-[1.25rem] border border-theme-line/55 bg-white/72 px-4 py-3 shadow-[0_10px_28px_rgba(49,30,21,0.05)] dark:bg-white/6">
              <p className="text-[0.56rem] font-semibold uppercase tracking-[0.3em] text-theme-walnut/55 dark:text-theme-ivory/52">
                Sections
              </p>
              <p className="mt-1 text-lg font-semibold text-theme-ink dark:text-theme-ivory">
                {String(sections.length).padStart(2, '0')}
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-theme-line/55 bg-white/72 px-4 py-3 shadow-[0_10px_28px_rgba(49,30,21,0.05)] dark:bg-white/6">
              <p className="text-[0.56rem] font-semibold uppercase tracking-[0.3em] text-theme-walnut/55 dark:text-theme-ivory/52">
                Detail Rows
              </p>
              <p className="mt-1 text-lg font-semibold text-theme-ink dark:text-theme-ivory">
                {String(totalEntries).padStart(2, '0')}
              </p>
            </div>
            {normalizeText(currentColorName) ? (
              <div className="rounded-[1.25rem] border border-theme-bronze/18 bg-theme-bronze/8 px-4 py-3 shadow-[0_10px_28px_rgba(49,30,21,0.04)]">
                <p className="text-[0.56rem] font-semibold uppercase tracking-[0.3em] text-theme-bronze/72">
                  Finish
                </p>
                <p className="mt-1 text-sm font-semibold uppercase tracking-[0.18em] text-theme-ink">
                  {currentColorName}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {sections.map((section, index) => (
            <SectionCard
              key={`${section.title}-${index}`}
              section={section}
              index={index}
              productName={productName}
              currentColorName={currentColorName}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
