import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DesignDetail from './DesignDetail';
import { supabase } from '@/lib/supabase';
import { DEFAULT_GALLERY, PRINT_CONFIGS, PrintType } from '@/data/prints';
import {
  DesignSummary,
  toDesignSummary,
  GalleryItemWithMeta,
  DEFAULT_DIGITAL_PRICE_CENTS,
} from '@/data/shop';

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
  const ogImages = design.image_url
    ? [{ url: design.image_url, width: 800, height: 1000, alt: design.name }]
    : undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${design.name} | Miles Away Prints`,
      description,
      url,
      type: 'website',
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${design.name} | Miles Away Prints`,
      description,
      images: design.image_url ? [design.image_url] : undefined,
    },
  };
}

export default async function DesignPage({ params }: { params: { slug: string } }) {
  const result = await getDesign(params.slug);
  if (!result) notFound();
  const { design, related } = result;

  // JSON-LD Product schema
  const offers: Array<Record<string, unknown>> = [
    {
      '@type': 'Offer',
      name: 'Digital download',
      price: ((design.digital_price_cents ?? DEFAULT_DIGITAL_PRICE_CENTS) / 100).toFixed(2),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  ];
  const sizesPriced = design.printful_prices ?? {};
  for (const [size, cents] of Object.entries(sizesPriced)) {
    offers.push({
      '@type': 'Offer',
      name: `Physical print — ${size}`,
      price: (cents / 100).toFixed(2),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    });
  }

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: design.name,
    description:
      design.description ??
      `${design.name} — ${PRINT_CONFIGS[design.type]?.detailsLabel ?? 'art print'} from Miles Away Prints.`,
    ...(design.image_url ? { image: design.image_url } : {}),
    brand: { '@type': 'Brand', name: 'Miles Away Prints' },
    category: PRINT_CONFIGS[design.type]?.detailsLabel ?? undefined,
    offers,
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <Navbar />
      <DesignDetail design={design} related={related} />
      <Footer />
    </>
  );
}
