import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase';
import NavbarShell from '@/components/NavbarShell';
import Footer from '@/components/Footer';
import MarathonCard from '@/components/MarathonCard';
import type { MarathonRow } from '@/data/marathons';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Custom Marathon Prints | Miles Away Prints',
  description:
    'Custom marathon route prints for Las Vegas, Chicago, and more — personalized with your bib, name, finish time, and race date.',
};

export default async function MarathonsIndexPage() {
  const admin = createAdminClient();
  const { data } = await admin
    .from('marathons')
    .select('slug, city, full_svg_path, printful_prices')
    .eq('active', true)
    .order('sort_order', { ascending: true });

  const races = (data ?? []) as Array<
    Pick<MarathonRow, 'slug' | 'city' | 'full_svg_path' | 'printful_prices'>
  >;

  return (
    <main className="bg-paper min-h-screen">
      <NavbarShell />

      <section className="pt-32 md:pt-36 pb-10">
        <div className="max-w-[1280px] mx-auto px-6">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase mb-4"
            style={{ background: '#fee2e2', color: '#dc2626' }}
          >
            For Runners
          </div>
          <h1 className="text-3xl md:text-5xl font-medium tracking-tight text-ink mb-3">
            Custom marathon prints
          </h1>
          <p className="text-mid text-base md:text-lg max-w-xl leading-relaxed">
            Pick your race, add your bib and finish time, and we&apos;ll print the
            poster you ran for. Live preview as you fill it out — what you see
            is what gets shipped.
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-[1280px] mx-auto px-6">
          {races.length === 0 ? (
            <p className="text-mid text-sm">No marathons available yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {races.map((r) => {
                const prices = (r.printful_prices ?? {}) as Record<string, number>;
                const fromCents = Object.values(prices).filter((n) => typeof n === 'number')
                  .sort((a, b) => a - b)[0];
                return (
                  <MarathonCard
                    key={r.slug}
                    slug={r.slug}
                    city={r.city}
                    svgPath={r.full_svg_path ?? ''}
                    fromCents={fromCents}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
