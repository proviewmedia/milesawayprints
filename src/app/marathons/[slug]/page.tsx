import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase';
import { loadSvgFromPublic } from '@/lib/marathon-svg';
import type { MarathonRow } from '@/data/marathons';
import MarathonCustomizer from './MarathonCustomizer';
import NavbarShell from '@/components/NavbarShell';
import Footer from '@/components/Footer';
import {
  breadcrumbJsonLd,
  productJsonLd as buildProductJsonLd,
} from '@/lib/seo';
import { getReviewData } from '@/lib/reviews';
import type { PrintType } from '@/data/prints';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-dynamic';

interface Props {
  params: { slug: string };
}

// Use the admin client — this is a server-only page and we want a direct
// read regardless of any RLS policy state on the marathons table.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('marathons')
    .select('city')
    .eq('slug', params.slug)
    .eq('active', true)
    .maybeSingle();
  if (!data) return { title: 'Marathon — Miles Away Prints' };
  const title = `${data.city} Marathon Print | Miles Away Prints`;
  const description = `Custom ${data.city} Marathon and Half Marathon prints — personalized with your name, bib, finish time, and race date.`;
  const ogImageUrl = `/api/og/marathon/${params.slug}`;
  return {
    title,
    description,
    alternates: { canonical: `/marathons/${params.slug}` },
    openGraph: {
      title,
      description,
      url: `/marathons/${params.slug}`,
      type: 'website',
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: `${data.city} Marathon Print` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function MarathonPage({ params }: Props) {
  const admin = createAdminClient();
  const { data: row, error } = await admin
    .from('marathons')
    .select('*')
    .eq('slug', params.slug)
    .eq('active', true)
    .maybeSingle();

  if (error) {
    console.error('[marathon page] supabase error', error);
  }
  if (!row) return notFound();

  const marathon = row as MarathonRow;

  const [fullSvg, halfSvg] = await Promise.all([
    marathon.full_svg_path ? safeLoad(marathon.full_svg_path) : Promise.resolve(null),
    marathon.half_svg_path ? safeLoad(marathon.half_svg_path) : Promise.resolve(null),
  ]);

  const prices = marathon.printful_prices ?? {};
  const offers = Object.entries(prices).map(([size, cents]) => ({
    name: `${marathon.city} Marathon Print — ${size}`,
    priceCents: cents,
  }));

  // Reviews use the same site-wide fallback as skylines (no per-marathon
  // reviews yet). Clears the Google "Missing review/aggregateRating"
  // warnings on this URL.
  const { aggregateRating, reviews } = await getReviewData('marathon' as PrintType);

  const productLd = buildProductJsonLd({
    name: `${marathon.city} Marathon Print`,
    description: `Custom ${marathon.city} Marathon (Full + Half) prints — personalized with your name, bib, finish time, and race date.`,
    imageUrl: marathon.thumbnail_path
      ? `${SITE_URL}${marathon.thumbnail_path}`
      : undefined,
    url: `/marathons/${marathon.slug}`,
    category: 'Marathon Print',
    offers,
    aggregateRating,
    reviews,
  });

  const breadcrumbsLd = breadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Marathons', url: '/prints/marathon' },
    { name: `${marathon.city} Marathon`, url: `/marathons/${marathon.slug}` },
  ]);

  return (
    <main className="bg-paper min-h-screen">
      {/* The marathon SVG templates were drawn in Josefin Sans. Load it on
          this route so the inlined SVG matches the source. */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@300;700&display=swap"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsLd) }}
      />
      <NavbarShell />
      <MarathonCustomizer marathon={marathon} fullSvg={fullSvg} halfSvg={halfSvg} />
      <Footer />
    </main>
  );
}

async function safeLoad(path: string): Promise<string | null> {
  try {
    return await loadSvgFromPublic(path);
  } catch {
    return null;
  }
}
