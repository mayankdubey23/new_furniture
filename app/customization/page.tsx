import Link from 'next/link';

export const metadata = {
  title: 'Customization | Luxe Decor',
  description: 'Personalize upholstery, finishes, proportions, and styling details for your Luxe Decor furniture pieces.',
};

const customizationSteps = [
  {
    title: 'Choose the silhouette',
    description: 'Start with a sofa, chair, recliner, or accent piece that matches the room mood and seating plan.',
  },
  {
    title: 'Refine materials',
    description: 'Compare velvet, boucle, leather, wood stains, and metal finishes with guidance from our design team.',
  },
  {
    title: 'Approve the final edit',
    description: 'Review dimensions, comfort preferences, and styling notes before production begins.',
  },
];

const customizationOptions = [
  'Fabric and leather swatches',
  'Wood stain and leg finish options',
  'Seat depth and firmness guidance',
  'Accent piping and seam detailing',
  'Room styling consultation',
  'Delivery and placement planning',
];

export default function CustomizationPage() {
  return (
    <main className="min-h-screen bg-transparent px-6 pb-16 pt-32 md:px-10">
      <div className="mx-auto max-w-7xl">
        <section className="section-shell rounded-[2rem] px-8 py-12 md:px-12 md:py-16">
          <div className="grid gap-12 md:grid-cols-[1.05fr_0.95fr] md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-theme-bronze">Customization Studio</p>
              <h1 className="font-display mt-5 text-5xl leading-none text-theme-ink md:text-7xl">
                Design a piece that feels made for your room, not pulled from a shelf.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-theme-walnut/78 dark:text-theme-ink/76 md:text-lg">
                Our customization process helps you shape upholstery, finishes, comfort, and detailing around the way
                you live. From quiet neutrals to statement textures, each choice is curated to stay cohesive and premium.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/#contact"
                  className="rounded-full bg-theme-ink px-8 py-4 text-center text-sm font-semibold uppercase tracking-[0.28em] text-theme-ivory transition duration-300 hover:bg-theme-bronze"
                >
                  Book A Consultation
                </Link>
                <Link
                  href="/"
                  className="rounded-full border border-theme-line px-8 py-4 text-center text-sm font-semibold uppercase tracking-[0.28em] text-theme-walnut transition duration-300 hover:border-theme-bronze hover:text-theme-bronze dark:text-theme-ink"
                >
                  Back To Collection
                </Link>
              </div>
            </div>

            <div className="premium-surface rounded-[2rem] p-7 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-theme-bronze">Available Options</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {customizationOptions.map((option) => (
                  <div key={option} className="rounded-[1.5rem] border border-theme-line px-5 py-5 text-sm font-medium text-theme-walnut dark:text-theme-ink">
                    {option}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-3">
          {customizationSteps.map((step, index) => (
            <div key={step.title} className="premium-surface rounded-[1.8rem] p-6 md:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-theme-bronze">Step 0{index + 1}</p>
              <h2 className="font-display mt-5 text-3xl text-theme-ink">{step.title}</h2>
              <p className="mt-4 text-sm leading-7 text-theme-walnut/76 dark:text-theme-ink/74 md:text-base">{step.description}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
