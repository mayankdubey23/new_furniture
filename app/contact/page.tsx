import Link from 'next/link';
import AnimatedHeading from '@/components/AnimatedHeading';

export const metadata = {
  title: 'Contact | Luxe Decor',
  description: 'Get in touch with Luxe Decor for bespoke furniture consultations, orders, and support.',
};

const contactDetails = [
  { label: 'Studio Email', value: 'hello@luxedecor.com', href: 'mailto:hello@luxedecor.com' },
  { label: 'Phone', value: '+91 98765 43210', href: 'tel:+919876543210' },
  { label: 'Hours', value: 'Mon - Sat, 10:00 AM - 7:00 PM' },
  { label: 'Studio', value: '12 Gallery Lane, Indiranagar, Bengaluru' },
];

export default function ContactPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-transparent px-6 pb-20 pt-32 md:px-10 lg:px-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(circle_at_top_left,rgba(165,106,63,0.22),transparent_24%),linear-gradient(115deg,rgba(18,14,11,0.92)_12%,rgba(48,32,23,0.72)_45%,rgba(18,14,11,0.92)_100%)]" />
      <div className="pointer-events-none absolute left-[-8rem] top-[6rem] h-[20rem] w-[20rem] rounded-full bg-theme-bronze/20 blur-[120px]" />
      <div className="pointer-events-none absolute right-[-4rem] top-[8rem] h-[18rem] w-[18rem] rounded-full bg-theme-olive/14 blur-[110px]" />

      <section className="relative z-10 mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="section-shell rounded-[2rem] border border-white/10 bg-[rgba(18,14,11,0.34)] px-8 py-12 text-theme-ivory backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-theme-bronze">
              Contact Luxe Decor
            </p>
            <AnimatedHeading as="h1" className="mt-4 font-display text-5xl text-theme-ivory md:text-6xl">
              Let&apos;s shape your space.
            </AnimatedHeading>
            <p className="mt-6 max-w-2xl text-lg text-theme-ivory/74">
              Reach out for custom furniture consultations, order support, material guidance, or private appointments.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {contactDetails.map((item) => (
                <div key={item.label} className="premium-surface rounded-[1.5rem] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-theme-bronze">
                    {item.label}
                  </p>
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="mt-3 block text-lg font-semibold text-theme-ink transition-colors hover:text-theme-bronze"
                    >
                      {item.value}
                    </Link>
                  ) : (
                    <p className="mt-3 text-lg font-semibold text-theme-ink">{item.value}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="premium-surface rounded-[2rem] p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-theme-bronze">
              Quick Actions
            </p>
            <AnimatedHeading as="h2" className="mt-4 font-display text-3xl text-theme-ink">
              How can we help?
            </AnimatedHeading>
            <div className="mt-8 space-y-4">
              <Link
                href="/customization"
                className="block rounded-[1.5rem] border border-theme-line px-5 py-4 text-sm font-semibold uppercase tracking-[0.24em] text-theme-walnut transition-colors hover:border-theme-bronze hover:text-theme-bronze dark:text-theme-ink"
              >
                Open Customization Studio
              </Link>
              <Link
                href="/#collections"
                className="block rounded-[1.5rem] bg-theme-bronze px-5 py-4 text-sm font-semibold uppercase tracking-[0.24em] text-white transition-colors hover:bg-theme-ink"
              >
                Browse Collection
              </Link>
            </div>

            <div className="mt-10 rounded-[1.5rem] border border-theme-line bg-white/55 p-5 dark:bg-white/5">
              <p className="text-sm leading-7 text-theme-walnut/75 dark:text-theme-ink/70">
                Custom orders usually take 6-8 weeks depending on fabric availability and finish selection. Share your room size,
                preferred materials, and timeline, and the team can recommend the best configuration.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
