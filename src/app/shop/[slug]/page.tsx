import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import NavbarShell from '@/components/NavbarShell';
import Footer from '@/components/Footer';
import DesignDetail from './DesignDetail';
import { supabase } from '@/lib/supabase';
import { DEFAULT_GALLERY, PRINT_CONFIGS, PrintType } from '@/data/prints';
import {
  DesignSummary,
  toDesignSummary,
  GalleryItemWithMeta,
} from '@/data/shop';
import {
  breadcrumbJsonLd,
  productJsonLd as buildProductJsonLd,
  faqPageJsonLd,
} from '@/lib/seo';
import { getReviewData } from '@/lib/reviews';
import { getProductFaqs } from '@/data/product-faqs';

async function getDesign(slug: string): Promise<{
  design: DesignSummary;
  related: DesignSummary[];
} | null> {
  const { data } = await supabase
    .from('gallery_items')
    .select('id, print_type_slug, name, location, slug, description, tags, values, image_url, room_mockup_url, printful_product_id, printful_variants, printful_prices, digital_price_cents')
    .eq('slug', slug)
    .eq('active', true)
    .maybeSingle();

  if (data) {
    const design = toDesignSummary(data as GalleryItemWithMeta, data.print_type_slug as PrintType);

    const { data: rel } = await supabase
      .from('gallery_items')
      .select('id, print_type_slug, name, location, slug, description, tags, values, image_url, room_mockup_url, printful_product_id, printful_variants, printful_prices, digital_price_cents')
      .eq('print_type_slug', data.print_type_slug)
      .eq('active', true)
      .neq('slug', slug)
      .limit(4);

    return {
      design,
      related: (rel ?? []).map((r: GalleryItemWithMeta) =>
        toDesignSummary(r, r.print_type_slug as PrintType),
      ),
    };
  }

  // Fallback to seed data
  for (const type of Object.keys(DEFAULT_GALLERY) as PrintType[]) {
    const match = DEFAULT_GALLERY[type].find(
      (it) => it.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') === slug,
    );
    if (match) {
      const design: DesignSummary = {
        slug,
        name: match.name,
        location: match.location,
        type,
        values: match.values,
      };
      const related: DesignSummary[] = DEFAULT_GALLERY[type]
        .filter((it) => it.name !== match.name)
        .map((it) => ({
          slug: it.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
          name: it.name,
          location: it.location,
          type,
          values: it.values,
        }));
      return { design, related };
    }
  }

  return null;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const result = await getDesign(params.slug);
  if (!result) return {};
  const { design } = result;

  const typeLabel = PRINT_CONFIGS[design.type]?.detailsLabel ?? 'art print';
  const description =
    design.description ??
    `${design.name} — a ${typeLabel.toLowerCase()} print from Miles Away Prints. Made-to-order, archival fine-art paper, shipped worldwide.`;
  const title = `${design.name} ${typeLabel} Print`;
  const url = `/shop/${design.slug}`;
  // Use the dynamic OG route so the social preview shows the brand-chromed
  // social card instead of just the raw product photo at 800×1000.
  const ogImageUrl = `/api/og/product/${design.slug}`;

  // Cheapest physical size for product:price OG tag (Pinterest Rich Pins
  // + Facebook/Instagram Shopping). Digital is no longer sold.
  const physicalPrices = Object.values(design.printful_prices ?? {}).map((c) => c / 100);
  const cheapest = physicalPrices.length ? Math.min(...physicalPrices) : 0;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${design.name} | Miles Away Prints`,
      description,
      url,
      type: 'website',
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: design.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${design.name} | Miles Away Prints`,
      description,
      images: [ogImageUrl],
    },
    // Pinterest Rich Pins + Facebook Shop / Instagram Shopping read these
    // OG product tags directly. Without them, pins/posts of the URL show
    // as plain images instead of shoppable product cards.
    other: {
      'product:price:amount': cheapest.toFixed(2),
      'product:price:currency': 'USD',
      'product:availability': 'in stock',
      'product:condition': 'new',
      'product:brand': 'Miles Away Prints',
      'product:retailer_item_id': design.slug,
    },
  };
}

export default async function DesignPage({ params }: { params: { slug: string } }) {
  const result = await getDesign(params.slug);
  if (!result) notFound();
  const { design, related } = result;
  const { aggregateRating, reviews } = await getReviewData(design.type);

  const typeLabel = PRINT_CONFIGS[design.type]?.detailsLabel ?? 'Art Print';
  const productLd = buildProductJsonLd({
    name: design.name,
    description:
      design.description ??
      `${design.name} — ${typeLabel} from Miles Away Prints.`,
    imageUrl: design.image_url,
    url: `/shop/${design.slug}`,
    category: typeLabel,
    offers: Object.entries(design.printful_prices ?? {}).map(([size, cents]) => ({
      name: `Physical print — ${size}`,
      priceCents: cents,
    })),
    aggregateRating,
    reviews,
  });

  const breadcrumbsLd = breadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Shop', url: '/shop' },
    { name: typeLabel, url: `/prints/${design.type}` },
    { name: design.name, url: `/shop/${design.slug}` },
  ]);

  const faqs = getProductFaqs(design.type);
  const faqLd = faqPageJsonLd(faqs);

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <NavbarShell />
      <DesignDetail design={design} related={related} reviews={reviews} faqs={faqs} />
      <Footer />
    </>
  );
}
