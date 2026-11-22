import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import NavbarShell from '@/components/NavbarShell';
import Footer from '@/components/Footer';
import DesignCard from '@/components/DesignCard';
import { PRINT_CONFIGS, PrintType } from '@/data/prints';
import { createAdminClient } from '@/lib/supabase';
import {
  type DesignSummary,
  type GalleryItemWithMeta,
  toDesignSummary,
} from '@/data/shop';
import {
  breadcrumbJsonLd,
  collectionPageJsonLd,
  faqPageJsonLd,
} from '@/lib/seo';
import { isSiteBannerActive } from '@/data/site-banner';
import { getCustomPrintType } from '@/data/custom-prints';
import { ArrowRight } from 'lucide-react';
import CategoryFaq from './CategoryFaq';

const VALID_TYPES: PrintType[] = ['golf', 'stadium', 'airport', 'marathon', 'city', 'skyline', 'f1'];

// Keyword-rich anchor text for the cross-category "explore more" strip.
const TYPE_NAV_LABEL: Record<PrintType, string> = {
  golf: 'Golf course prints',
  stadium: 'Stadium prints',
  airport: 'Airport prints',
  marathon: 'Marathon prints',
  city: 'City map prints',
  skyline: 'City skyline prints',
  f1: 'F1 circuit prints',
};

function isValidType(t: string): t is PrintType {
  return VALID_TYPES.includes(t as PrintType);
}

export async function generateMetadata({
  params,
}: {
  params: { type: string };
}): Promise<Metadata> {
  if (!isValidType(params.type)) return {};
  const cfg = PRINT_CONFIGS[params.type];
  const ogImageUrl = `/api/og/category/${params.type}`;
  return {
    title: cfg.seoTitle,
    description: cfg.seoDescription,
    alternates: { canonical: `/prints/${params.type}` },
    openGraph: {
      title: cfg.seoTitle,
      description: cfg.seoDescription,
      url: `/prints/${params.type}`,
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

export async function generateStaticParams() {
  return VALID_TYPES.map((type) => ({ type }));
}

async function getProductsOfType(type: PrintType): Promise<DesignSummary[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('gallery_items')
    .select(
      'id, print_type_slug, name, location, slug, description, tags, values, image_url, room_mockup_url, printful_product_id, printful_variants, printful_prices, digital_price_cents',
    )
    .eq('print_type_slug', type)
    .eq('active', true)
    .order('sort_order', { ascending: true })
    .limit(100);
  return ((data ?? []) as GalleryItemWithMeta[]).map((r) =>
    toDesignSummary(r, type),
  );
}

export default async function PrintPage({ params }: { params: { type: string } }) {
  if (!isValidType(params.type)) notFound();
  const type = params.type;
  const config = PRINT_CONFIGS[type];
  const customType = getCustomPrintType(type);

  const products = await getProductsOfType(type);

  const breadcrumbsLd = breadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Shop', url: '/shop' },
    { name: config.detailsLabel, url: `/prints/${type}` },
  ]);

  const collectionLd = collectionPageJsonLd(
    config.seoTitle,
    config.seoDescription,
    `/prints/${type}`,
    products.map((p) => ({
      name: p.name,
      url: `/shop/${p.slug}`,
      imageUrl: p.image_url,
    })),
  );

  const faqLd = faqPageJsonLd(config.faqs);

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

      {/* Hero — H1 + lede. Visible breadcrumbs above for crawlers + users. */}
      <section className="bg-ink text-paper pt-32 md:pt-40 pb-12 md:pb-16 mb-12 md:mb-16">
        <div className="max-w-[1400px] mx-auto px-6">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-1.5 text-[13px] text-paper/60">
              <li>
                <Link href="/" className="hover:text-paper">
                  Home
                </Link>
              </li>
              <li aria-hidden>›</li>
              <li>
                <Link href="/shop" className="hover:text-paper">
                  Shop
                </Link>
              </li>
              <li aria-hidden>›</li>
              <li className="text-paper" aria-current="page">
                {config.detailsLabel}
              </li>
            </ol>
          </nav>
          <h1 className="display text-[11vw] md:text-[6.5vw] xl:text-[104px] mb-6 max-w-5xl">
            {config.title}
          </h1>
          <p className="text-paper/75 text-base md:text-xl max-w-2xl leading-relaxed">
            {config.lede}
          </p>
          {/* Date-windowed Father's Day cross-link, only on golf during the
              campaign. Drives evergreen "golf print" traffic into the
              time-sensitive gift funnel. */}
          {type === 'golf' && isSiteBannerActive() && (
            <Link
              href="/gifts/fathers-day"
              className="inline-flex items-center gap-2 mt-8 px-5 py-3 bg-paper text-ink rounded-full text-sm font-bold hover:bg-soft transition-colors"
            >
              Father&apos;s Day gift? See our 6 iconic course picks →
            </Link>
          )}
        </div>
      </section>

      {/* Featured products grid — internal linking to actual product pages */}
      {products.length > 0 && (
        <section className="pb-14 md:pb-20">
          <div className="max-w-[1400px] mx-auto px-6">
            <h2 className="display text-4xl md:text-6xl text-ink mb-10">
              Popular {config.detailsLabel.toLowerCase()} prints
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
              {products.slice(0, 8).map((d) => (
                <DesignCard key={d.slug} design={d} />
              ))}
            </div>
            {products.length > 8 && (
              <div className="mt-10 text-center">
                <Link
                  href={`/shop?category=${type}`}
                  className="inline-block bg-ink text-paper px-7 py-3.5 rounded-full text-sm font-bold hover:bg-black transition-colors"
                >
                  Browse all {products.length} {config.detailsLabel.toLowerCase()} prints
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Custom print CTA: the shop also makes prints of places not listed */}
      {customType && (
        <section className="border-y border-ink">
          <Link
            href={`/custom?start=map&type=${customType.type}`}
            className="group block bg-ink text-paper hover:bg-black transition-colors"
          >
            <div className="max-w-[1400px] mx-auto px-6 py-12 md:py-16 grid md:grid-cols-[1fr_auto] gap-6 md:items-center">
              <div>
                <p className="eyebrow text-paper/60 mb-4">Custom prints</p>
                <h2 className="display text-4xl md:text-6xl mb-4">
                  Don&apos;t see your {customType.label.toLowerCase()}?
                </h2>
                <p className="text-paper/75 max-w-xl leading-relaxed">
                  We will make it from scratch, with a proof before it prints.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 bg-paper text-ink px-7 py-4 rounded-full font-bold text-[15px] w-fit">
                Order a custom print
                <ArrowRight size={16} strokeWidth={2.25} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </section>
      )}

      {/* Why section — evergreen body copy for SEO */}
      <section className="py-14 md:py-20">
        <div className="max-w-[800px] mx-auto px-6">
          <h2 className="display text-4xl md:text-6xl text-ink mb-8">
            Why people love these
          </h2>
          <div className="space-y-5">
            {config.whyCopy.map((para, i) => (
              <p key={i} className="text-mid leading-relaxed">
                {para}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ — rendered + matched by FAQPage JSON-LD above */}
      <CategoryFaq faqs={config.faqs} />

      {/* Explore more — keyword-rich internal links across the category
          landing pages. Spreads crawl + authority sideways. */}
      <section className="py-14 md:py-20 border-t border-ink">
        <div className="max-w-[1100px] mx-auto px-6">
          <h2 className="display text-4xl md:text-6xl text-ink mb-8">
            More collections
          </h2>
          <div className="flex flex-wrap gap-3">
            {VALID_TYPES.filter((t) => t !== type).map((t) => (
              <Link
                key={t}
                href={`/prints/${t}`}
                className="px-5 py-2.5 rounded-full border-2 border-ink/15 text-sm font-bold text-ink hover:border-ink transition-colors"
              >
                {TYPE_NAV_LABEL[t]}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
