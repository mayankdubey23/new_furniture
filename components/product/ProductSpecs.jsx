'use client';

const SPEC_ICONS = {
  material: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M3 7l9-4 9 4v10l-9 4-9-4V7z" />
      <path d="M3 7l9 4 9-4" />
      <path d="M12 11v10" />
    </svg>
  ),
  foam: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" />
    </svg>
  ),
  dimensions: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M3 3h18v18H3z" />
      <path d="M3 9h18M9 3v18" strokeLinecap="round" />
    </svg>
  ),
  weight: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <circle cx="12" cy="8" r="3" />
      <path d="M7 8H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-2" />
    </svg>
  ),
  warranty: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
};

const SPEC_LABELS = {
  material: 'Material',
  foam: 'Foam & Fill',
  dimensions: 'Dimensions',
  weight: 'Weight',
  warranty: 'Warranty',
};

export default function ProductSpecs({ specs }) {
  if (!specs) return null;

  const entries = Object.entries(specs);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-display text-2xl text-theme-ink md:text-3xl mb-1">Crafted Detail</h3>
        <p className="text-sm text-theme-walnut/65 dark:text-theme-ink/55">
          Every dimension, material, and finish — specified.
        </p>
      </div>

      <div className="premium-surface rounded-2xl overflow-hidden">
        {entries.map(([key, value], idx) => {
          const icon = SPEC_ICONS[key.toLowerCase()] || (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4l3 3" strokeLinecap="round" />
            </svg>
          );
          const label = SPEC_LABELS[key.toLowerCase()] ?? key.replace(/_/g, ' ');
          return (
            <div
              key={key}
              className={`flex items-center gap-5 px-6 py-5 transition-colors hover:bg-theme-bronze/4 ${
                idx < entries.length - 1 ? 'border-b border-theme-line' : ''
              }`}
            >
              <div className="shrink-0 text-theme-bronze">{icon}</div>
              <div className="flex flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.28em] text-theme-walnut/60 dark:text-theme-ink/50 capitalize">
                  {label}
                </span>
                <span className="text-sm font-semibold text-theme-ink">{value}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
