import type { Metadata } from 'next';
import NavbarShell from '@/components/NavbarShell';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import { createAdminClient } from '@/lib/supabase';
import { getCustomPrintPricing } from '@/lib/custom-print-pricing';
import { CUSTOM_PRODUCTS } from '@/data/custom';
import { CUSTOM_PRINT_TYPES, getCustomPrintType, type CustomPrintType } from '@/data/custom-prints';
import OrderStart, { type Start } from './OrderStart';

export const metadata: Metadata = {
  title: 'Custom Printing: Order Prints or Get a Free Quote',
  description:
    'Order a custom map print or your own artwork online with clear prices, or get a free quote on shirts, hats, stickers, signs, and merch. One piece or hundreds.',
  alternates: { canonical: '/custom' },
};

// Example images come from the live shop, so re-read them regularly.
export const revalidate = 300;

const HOW = [
  {
    title: 'Prints',
    steps: ['Pick a size and pay online.', 'We design your print or check your file, and email a proof.', 'Approve it and it ships in 3 to 5 business days.'],
  },
  {
    title: 'Everything else',
    steps: ['Tell us what you need. Takes about 2 minutes.', 'We reply with a price and a proof in 1 to 2 business days.', 'Approve it and we print and ship it.'],
  },
];

function parseStart(start?: string, product?: string): Start | null {
  if (start === 'map' || start === 'artwork') return start;
  // Old /custom?product=posters links were about printing wall art.
  const slug = start ?? product;
  if (slug === 'posters' && !start) return 'artwork';
  return (CUSTOM_PRODUCTS.find((p) => p.slug === slug)?.slug as Start | undefined) ?? null;
}

export default async function CustomPage({
  searchParams,
}: {
  searchParams: { start?: string; product?: string; type?: string };
}) {
  const typeParam = getCustomPrintType(searchParams.type)?.type;
  const initialStart = parseStart(searchParams.start, searchParams.product) ?? (typeParam ? 'map' : null);

  const mapPricing = getCustomPrintPricing();
  const mapTypes = CUSTOM_PRINT_TYPES.filter((t) => Object.keys(mapPricing[t.type] ?? {}).length > 0);

  // One example image per map type so the builder shows the style being ordered.
  const admin = createAdminClient();
  const { data: examples } = await admin
    .from('gallery_items')
    .select('print_type_slug, image_url, sort_order')
    .eq('active', true)
    .not('image_url', 'is', null)
    .in('print_type_slug', CUSTOM_PRINT_TYPES.map((t) => t.type))
    .order('sort_order', { ascending: true });
  const exampleImages: Partial<Record<CustomPrintType, string>> = {};
  for (const row of (examples ?? []) as { print_type_slug: CustomPrintType; image_url: string }[]) {
    exampleImages[row.print_type_slug] ??= row.image_url;
  }
  // Marathons live in their own table, not gallery_items.
  exampleImages.marathon ??= '/marathons/las-vegas-marathon-new.png';

  return (
    <>
      <NavbarShell />

      <section className="bg-ink text-paper pt-32 md:pt-40 pb-12 md:pb-16">
        <div className="max-w-[1400px] mx-auto px-6">
          <Breadcrumbs items={[{ name: 'Custom printing', href: '/custom' }]} />
          <h1 className="display text-[13vw] md:text-8xl mb-6">Custom printing</h1>
          <p className="text-base md:text-xl text-paper/75 max-w-2xl leading-relaxed">
            Prints have prices and order online. Everything else gets a free quote. Either way you see a proof
            before anything is printed.
          </p>
        </div>
      </section>

      <OrderStart
        initialStart={initialStart}
        initialType={typeParam ?? mapTypes[0]?.type ?? 'golf'}
        mapTypes={mapTypes}
        mapPricing={mapPricing}
        exampleImages={exampleImages}
      />

      <section className="bg-ink text-paper">
        <div className="max-w-[1400px] mx-auto px-6 py-14 md:py-20">
          <h2 className="display text-4xl md:text-6xl mb-10">How ordering works</h2>
          <div className="grid md:grid-cols-2 gap-10">
            {HOW.map((h) => (
              <div key={h.title}>
                <h3 className="eyebrow text-paper/60 mb-5">{h.title}</h3>
                <ol className="space-y-4">
                  {h.steps.map((s, i) => (
                    <li key={s} className="flex gap-4 border-t border-paper/20 pt-4">
                      <span className="font-display font-black text-xl text-paper/40 tabular-nums">0{i + 1}</span>
                      <span className="text-[15px] text-paper/85 leading-relaxed">{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
