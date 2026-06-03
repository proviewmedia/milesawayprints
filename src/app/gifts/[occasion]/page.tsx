import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock } from 'lucide-react';
import NavbarShell from '@/components/NavbarShell';
import Footer from '@/components/Footer';
import DesignCard from '@/components/DesignCard';
import NewsletterSignup from '@/components/NewsletterSignup';
import CategoryFaq from '@/app/prints/[type]/CategoryFaq';
import CourseSpotlight from './CourseSpotlight';
import { GIFT_CONFIGS, GIFT_ORDER, type GiftOccasion } from '@/data/gifts';
import { createAdminClient } from '@/lib/supabase';
import {
  type DesignSummary,
  type GalleryItemWithMeta,
  toDesignSummary,
} from '@/data/shop';
import type { PrintType } from '@/data/prints';
import {
  breadcrumbJsonLd,
  collectionPageJsonLd,
  faqPageJsonLd,
} from '@/lib/seo';

export const dynamic = 'force-dynamic';

function isValidOccasion(s: string): s is GiftOccasion {
  return (GIFT_ORDER as string[]).includes(s);
}

export async function generateStaticParams() {
  return GIFT_ORDER.map((occasion) => ({ occasion }));
}

export async function generateMetadata({
  params,
}: {
  params: { occasion: string };
}): Promise<Metadata> {
  if (!isValidOccasion(params.occasion)) return {};
  const cfg = GIFT_CONFIGS[params.occasion];
  const ogImageUrl = `/api/og/gifts/${params.occasion}`;
  return {
    title: cfg.seoTitle,
    description: cfg.seoDescription,
    alternates: { canonical: `/gifts/${params.occasion}` },
    openGraph: {
      title: cfg.seoTitle,
      description: cfg.seoDescription,
      url: `/gifts/${params.occasion}`,
      type: 'website',
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: cfg.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: cfg.seoTitle,
      description: cfg.seoDescription,
      images: [ogImageUrl],
    },
  };
}

async function getCuratedDesigns(
  featuredSlugs: string[],
  fallbackTypes: PrintType[],
  marathonSlugs: string[] | undefined,
): Promise<DesignSummary[]> {
  const admin = createAdminClient();
  const SELECT =
    'id, print_type_slug, name, location, slug, description, tags, values, image_url, room_mockup_url, printful_product_id, printful_variants, printful_prices, digital_price_cents';

  const [featuredRes, fallbackRes, marathonRes] = await Promise.all([
    featuredSlugs.length
      ? admin
          .from('gallery_items')
          .select(SELECT)
          .in('slug', featuredSlugs)
          .eq('active', true)
      : Promise.resolve({ data: [] as GalleryItemWithMeta[] }),
    fallbackTypes.length
      ? admin
          .from('gallery_items')
          .select(SELECT)
          .in('print_type_slug', fallbackTypes)
          .eq('active', true)
          .order('sort_order', { ascending: true })
          .limit(12)
      : Promise.resolve({ data: [] as GalleryItemWithMeta[] }),
    marathonSlugs?.length
      ? admin
          .from('marathons')
          .select('slug, city, thumbnail_path, printful_catalog_variants, printful_prices, sort_order')
          .in('slug', marathonSlugs)
          .eq('active', true)
      : Promise.resolve({ data: [] }),
  ]);

  // Order by the original featuredSlugs array so the curated picks appear
  // in the order the merchandiser intended (config order = display order).
  const slugOrder = new Map(featuredSlugs.map((s, i) => [s, i]));
  const featured = ((featuredRes.data ?? []) as GalleryItemWithMeta[])
    .map((r) => toDesignSummary(r, r.print_type_slug as PrintType))
    .sort(
      (a, b) =>
        (slugOrder.get(a.slug) ?? Infinity) -
        (slugOrder.get(b.slug) ?? Infinity),
    );

  // Marathons → DesignSummary so they render in the same grid.
  const marathons: DesignSummary[] = (marathonRes.data ?? []).map((m) => ({
    slug: (m as { slug: string }).slug,
    name: `${(m as { city: string }).city} Marathon`,
    location: 'Personalized print',
    type: 'marathon' as PrintType,
    values: {},
    image_url: (m as { thumbnail_path?: string | null }).thumbnail_path ?? undefined,
    printful_variants: (m as { printful_catalog_variants?: Record<string, number> }).printful_catalog_variants,
    printful_prices: (m as { printful_prices?: Record<string, number> }).printful_prices,
  }));

  // De-dupe against the featured list to avoid showing the same product twice.
  const featuredSlugSet = new Set(featured.map((d) => d.slug));
  const fallback = ((fallbackRes.data ?? []) as GalleryItemWithMeta[])
    .map((r) => toDesignSummary(r, r.print_type_slug as PrintType))
    .filter((d) => !featuredSlugSet.has(d.slug));

  return [...featured, ...marathons, ...fallback].slice(0, 16);
}

export default async function GiftOccasionPage({
  params,
}: {
  params: { occasion: string };
}) {
  if (!isValidOccasion(params.occasion)) notFound();
  const cfg = GIFT_CONFIGS[params.occasion];

  const designs = await getCuratedDesigns(
    cfg.featuredSlugs,
    cfg.fallbackTypes,
    cfg.featuredMarathonSlugs,
  );

  const breadcrumbsLd = breadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Gifts', url: '/gifts' },
    { name: cfg.title, url: `/gifts/${cfg.slug}` },
  ]);

  const collectionLd = collectionPageJsonLd(
    cfg.seoTitle,
    cfg.seoDescription,
    `/gifts/${cfg.slug}`,
    designs.map((d) => ({
      name: d.name,
      url: d.type === 'marathon' ? `/marathons/${d.slug}` : `/shop/${d.slug}`,
      imageUrl: d.image_url,
    })),
  );

  const faqLd = faqPageJsonLd(cfg.faqs);

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
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
              <li>
                <Link href="/gifts" className="hover:text-ink">
                  Gifts
                </Link>
              </li>
              <li aria-hidden>›</li>
              <li className="text-ink" aria-current="page">
                {cfg.title}
              </li>
            </ol>
          </nav>
          <h1 className="text-4xl md:text-6xl font-medium tracking-tight text-ink leading-[1.05] mb-4">
            {cfg.title}
          </h1>
          <p className="text-mid text-base md:text-lg max-w-2xl leading-relaxed">
            {cfg.lede}
          </p>
          {cfg.urgentCopy && (
            <div className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-coral-light/50 text-coral rounded-full text-sm">
              <Clock size={14} strokeWidth={1.75} />
              {cfg.urgentCopy}
            </div>
          )}
        </div>
      </section>

      {/* Curated product grid */}
      {designs.length > 0 && (
        <section className="pb-14 md:pb-20">
          <div className="max-w-[1400px] mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-medium text-ink tracking-tight mb-8">
              Our picks
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
              {designs.map((d) => (
                <DesignCard key={`${d.type}-${d.slug}`} design={d} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Father's Day-only editorial section: short blurb per course,
          linked to the matching product page. Compounds keyword density
          ("Pebble Beach", "St. Andrews", "Father's Day") + internal
          linking for the SEO push. */}
      {cfg.slug === 'fathers-day' && <CourseSpotlight />}

      {/* Why this works */}
      <section className="py-14 md:py-20 border-t border-border">
        <div className="max-w-[800px] mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-medium text-ink tracking-tight mb-6">
            Why these work as gifts
          </h2>
          <div className="space-y-5 mb-10">
            {cfg.whyCopy.map((para, i) => (
              <p key={i} className="text-mid leading-relaxed">
                {para}
              </p>
            ))}
          </div>
          <NewsletterSignup source="gift-page" variant="banner" />
        </div>
      </section>

      <CategoryFaq faqs={cfg.faqs} />

      <Footer />
    </>
  );
}
