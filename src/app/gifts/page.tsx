import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import NavbarShell from '@/components/NavbarShell';
import Footer from '@/components/Footer';
import { GIFT_CONFIGS, GIFT_ORDER } from '@/data/gifts';
import { breadcrumbJsonLd, collectionPageJsonLd } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Gift Prints for Every Occasion',
  description:
    'Personalized location art prints for Father\'s Day, holidays, birthdays, and anniversaries. Curated picks, made to order, shipped worldwide.',
  alternates: { canonical: '/gifts' },
  openGraph: {
    title: 'Gift Prints for Every Occasion | Miles Away Prints',
    description:
      'Personalized prints curated for the occasion. Father\'s Day, holidays, birthdays, anniversaries.',
    url: '/gifts',
    images: [{ url: '/api/og/home', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/api/og/home'],
  },
};

export default function GiftsIndexPage() {
  const occasions = GIFT_ORDER.map((slug) => GIFT_CONFIGS[slug]);

  const breadcrumbsLd = breadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Gifts', url: '/gifts' },
  ]);

  const collectionLd = collectionPageJsonLd(
    'Gift Prints for Every Occasion',
    'Personalized location art prints curated for Father\'s Day, holidays, birthdays, and anniversaries.',
    '/gifts',
    occasions.map((o) => ({ name: o.title, url: `/gifts/${o.slug}` })),
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      <NavbarShell />

      <section className="pt-28 md:pt-32 pb-10 md:pb-14">
        <div className="max-w-[1100px] mx-auto px-6">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-1.5 text-[13px] text-mid">
              <li>
                <Link href="/" className="hover:text-ink">
                  Home
                </Link>
              </li>
              <li aria-hidden>›</li>
              <li className="text-ink" aria-current="page">
                Gifts
              </li>
            </ol>
          </nav>
          <h1 className="text-4xl md:text-6xl font-medium tracking-tight text-ink leading-[1.05] mb-4">
            Gift prints for every occasion.
          </h1>
          <p className="text-mid text-base md:text-lg max-w-2xl leading-relaxed">
            Personalized location art for the people who already have everything. Curated picks by occasion, made to order, shipped worldwide.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-6">
            {occasions.map((o) => (
              <Link
                key={o.slug}
                href={`/gifts/${o.slug}`}
                className="group block border border-border rounded-2xl p-8 hover:border-ink transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h2 className="text-2xl md:text-3xl font-medium text-ink tracking-tight">
                    {o.title}
                  </h2>
                  <ArrowRight
                    size={20}
                    strokeWidth={1.75}
                    className="text-mid group-hover:text-ink group-hover:translate-x-1 transition-all flex-shrink-0 mt-1"
                  />
                </div>
                <p className="text-sm text-mid leading-relaxed line-clamp-3">
                  {o.lede}
                </p>
                {o.urgentCopy && (
                  <p className="text-[12px] text-coral mt-4 font-medium">
                    {o.urgentCopy}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
