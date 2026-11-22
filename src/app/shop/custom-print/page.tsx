import type { Metadata } from 'next';
import Link from 'next/link';
import NavbarShell from '@/components/NavbarShell';
import Footer from '@/components/Footer';
import { createAdminClient } from '@/lib/supabase';
import { getCustomPrintPricing } from '@/lib/custom-print-pricing';
import { CUSTOM_PRINT_TYPES, getCustomPrintType, type CustomPrintType } from '@/data/custom-prints';
import CustomPrintBuilder from './CustomPrintBuilder';

export const metadata: Metadata = {
  title: 'Custom Art Print of Your Place',
  description:
    'Order a custom art print of your golf course, airport, city, skyline, or F1 circuit. Pick a size, pay online, and we design it and send a proof before it prints.',
  alternates: { canonical: '/shop/custom-print' },
};

// Prices follow the live shop, so re-read them regularly rather than baking
// them in at build time.
export const revalidate = 300;

export default async function CustomPrintPage({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  const admin = createAdminClient();
  const pricing = await getCustomPrintPricing(admin);

  // One example image per type so the builder shows the style being ordered.
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

  const available = CUSTOM_PRINT_TYPES.filter((t) => pricing[t.type] && Object.keys(pricing[t.type]!).length > 0);
  const initialType = getCustomPrintType(searchParams.type)?.type ?? available[0]?.type ?? 'golf';

  return (
    <>
      <NavbarShell />

      <section className="bg-ink text-paper pt-32 md:pt-40 pb-12 md:pb-16">
        <div className="max-w-[1400px] mx-auto px-6">
          <p className="eyebrow text-paper/60 mb-6">The print shop</p>
          <h1 className="display text-[13vw] md:text-[7.5vw] xl:text-[120px] mb-6">
            Your place.
            <br />
            Your print.
          </h1>
          <p className="text-base md:text-xl text-paper/75 max-w-2xl leading-relaxed">
            Do not see your course, airport, or city in the shop? Order it here. Same sizes and prices as the
            shop. We design it, email you a proof, and print it once you approve.
          </p>
        </div>
      </section>

      <CustomPrintBuilder
        types={available}
        pricing={pricing}
        exampleImages={exampleImages}
        initialType={initialType}
      />

      <section className="border-t border-ink">
        <div className="max-w-[1400px] mx-auto px-6 py-12 md:py-16 grid md:grid-cols-3 gap-8">
          {[
            { n: '01', title: 'Order and pay', desc: 'Pick the print type and size, tell us the place, and check out.' },
            { n: '02', title: 'We design it', desc: 'We draw your place in the same style as the shop and email you a proof.' },
            { n: '03', title: 'Approve and we print', desc: 'Ask for changes until it is right. Then it prints and ships to you.' },
          ].map((s) => (
            <div key={s.n} className="border-t border-ink pt-5">
              <div className="display text-5xl text-ink/20 mb-4">{s.n}</div>
              <h2 className="text-lg font-bold text-ink mb-2">{s.title}</h2>
              <p className="text-sm text-mid leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="max-w-[1400px] mx-auto px-6 pb-14">
          <p className="text-sm text-mid">
            Want it on something other than paper, or need more than one?{' '}
            <Link href="/custom" className="text-ink underline underline-offset-2">
              Get a free quote
            </Link>{' '}
            instead.
          </p>
        </div>
      </section>

      <Footer />
    </>
  );
}
