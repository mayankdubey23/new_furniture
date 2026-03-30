export default function About() {
  const pillars = [
    {
      title: 'Material Depth',
      description: 'Velvet, saddle leather, brushed metals, and warm woods chosen for richness you can see and feel.',
    },
    {
      title: 'Tailored Comfort',
      description: 'Proportions and cushioning designed to feel indulgent in daily life, not just in the showroom.',
    },
    {
      title: 'Quiet Luxury',
      description: 'Forms that feel sculptural and refined, with enough restraint to live beautifully for years.',
    },
  ];

  return (
    <section id="about" className="px-6 py-24 md:px-10 md:py-32">
      <div className="section-shell mx-auto max-w-7xl rounded-[2rem] bg-theme-mist/70 px-8 py-12 dark:bg-theme-mist/25 md:px-12 md:py-16">
        <div className="grid gap-12 md:grid-cols-[0.95fr_1.05fr] md:items-end">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-theme-bronze">Design Ethos</p>
            <h2 className="font-display text-5xl leading-none text-theme-ink md:text-6xl">A furniture language built around warmth, shape, and permanence.</h2>
          </div>

          <div className="space-y-6 text-base leading-8 text-theme-walnut/78 dark:text-theme-ink/76 md:text-lg">
            <p>
              Luxe Decor is designed like an interior studio rather than a catalog. Every piece is chosen to balance
              tactile softness, clean architecture, and a collected residential mood.
            </p>
            <p>
              The result is a home that feels elevated without feeling formal, where the hero pieces are expressive but
              the atmosphere stays calm and livable.
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="premium-surface rounded-[1.75rem] p-6 md:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-theme-bronze">0{pillars.indexOf(pillar) + 1}</p>
              <h3 className="font-display mt-5 text-3xl text-theme-ink">{pillar.title}</h3>
              <p className="mt-4 text-sm leading-7 text-theme-walnut/76 dark:text-theme-ink/74 md:text-base">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
