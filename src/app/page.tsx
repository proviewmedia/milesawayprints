import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PrintPreview from '@/components/PrintPreview';
import WallFrame from '@/components/WallFrame';
import DesignCardWrapper from './DesignCardWrapper';
import { PRINT_CONFIGS, PrintType, DEFAULT_GALLERY } from '@/data/prints';
import { DesignSummary, toDesignSummary, GalleryItemWithMeta } from '@/data/shop';
import { supabase } from '@/lib/supabase';

const CATEGORY_ORDER: PrintType[] = ['golf', 'stadium', 'airport', 'marathon', 'city'];

async function getReviews() {
  const { data } = await supabase
    .from('reviews')
    .select('*')
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(3);
  return data ?? [];
}

async function getFeaturedDesigns(): Promise<DesignSummary[]> {
  const { data } = await supabase
    .from('gallery_items')
    .select('id, print_type_slug, name, location, slug, description, tags, values, image_url, room_mockup_url, printful_product_id, printful_variants, printful_prices, digital_price_cents')
    .eq('active', true)
    .eq('featured', true)
    .order('sort_order', { ascending: true })
    .limit(4);

  if (data && data.length > 0) {
    return data.map((r: GalleryItemWithMeta) => toDesignSummary(r, r.print_type_slug as PrintType));
  }

  // Fallback: first design from each type
  return CATEGORY_ORDER.slice(0, 4).map((type) => {
    const it = DEFAULT_GALLERY[type][0];
    return {
      slug: it.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
      name: it.name,
      location: it.location,
      type,
      values: it.values,
    };
  });
}

export default async function HomePage() {
  const [reviews, featured] = await Promise.all([getReviews(), getFeaturedDesigns()]);

  return (
    <>
      <Navbar />

      {/* Hero — split-screen, restrained type, lifestyle placeholder */}
      <section className="pt-28 md:pt-32 pb-10 md:pb-14">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid md:grid-cols-[0.85fr_1.15fr] gap-10 md:gap-12 items-stretch">
            <div className="flex flex-col justify-center py-4">
              <h1 className="text-4xl md:text-6xl font-medium tracking-tight text-ink leading-[1.02] mb-5">
                The places<br />you love.<br />Printed.
              </h1>
              <p className="text-base md:text-lg text-mid mb-7 max-w-md leading-relaxed">
                Custom map and skyline prints, made to last. Stadiums, airports, marathons, golf courses, and city streets — printed on archival paper.
              </p>
              <div className="flex flex-wrap items-center gap-5">
                <Link href="/shop" className="btn-primary">
                  Shop all
                </Link>
                <Link href="/prints/golf" className="text-sm font-medium text-ink underline underline-offset-4 hover:opacity-70">
                  Create custom
                </Link>
              </div>
              <div className="flex items-center gap-2 mt-7">
                <div className="flex gap-0.5 text-ink">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <span className="text-sm text-mid">4.9 / 5 · 500+ happy customers</span>
              </div>
            </div>

            {/* Right — lifestyle placeholder, landscape, fills the column. Replace once photos arrive. */}
            <div className="relative bg-soft aspect-[5/4] md:aspect-auto md:min-h-[460px] flex items-center justify-center overflow-hidden">
              <div className="grid grid-cols-3 gap-4 md:gap-6 w-[88%] py-8">
                <div className="pt-6">
                  <WallFrame compact>
                    <PrintPreview type="city" values={DEFAULT_GALLERY.city[0].values} />
                  </WallFrame>
                </div>
                <div className="pt-12">
                  <WallFrame compact>
                    <PrintPreview type="golf" values={DEFAULT_GALLERY.golf[0].values} />
                  </WallFrame>
                </div>
                <div className="pt-6">
                  <WallFrame compact>
                    <PrintPreview type="airport" values={DEFAULT_GALLERY.airport[0].values} />
                  </WallFrame>
                </div>
              </div>
              <span className="absolute bottom-3 right-3 text-[10px] uppercase tracking-wider text-mid">
                Lifestyle photo placeholder
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar — flat row, no colored chips */}
      <section className="border-y border-border bg-paper">
        <div className="max-w-[1400px] mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 text-center md:text-left">
          {[
            { title: 'Museum-quality finish', desc: 'Archival giclée, fine-art paper' },
            { title: 'Made-to-order', desc: 'Printed and shipped within 5 days' },
            { title: 'Ready to hang', desc: 'Frames arrive professionally assembled' },
            { title: 'Worldwide shipping', desc: 'Tracked, insured, and packed flat' },
          ].map((item) => (
            <div key={item.title}>
              <div className="text-sm font-medium text-ink">{item.title}</div>
              <div className="text-[13px] text-mid mt-1 leading-snug">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured prints */}
      <section className="py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-3">
            <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-ink">
              All Prints
            </h2>
            <Link href="/shop" className="btn-secondary py-2.5 px-5 text-[13px]">
              Shop all
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featured.map((d) => (
              <DesignCardWrapper key={d.slug} design={d} />
            ))}
          </div>
        </div>
      </section>

      {/* Lifestyle photography section — placeholders for now */}
      <section className="py-16 md:py-24 bg-soft">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="aspect-[4/5] bg-soft-2 flex items-center justify-center text-[11px] uppercase tracking-wider text-mid"
              >
                Lifestyle photo {n}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories — custom create flow */}
      <section className="py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-12 max-w-xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-ink mb-4">
              Don&apos;t see your place?
            </h2>
            <p className="text-mid">
              Start a custom print. Pick a category, add your details, preview live, and we&apos;ll design it from scratch.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {CATEGORY_ORDER.map((type) => {
              const cfg = PRINT_CONFIGS[type];
              const sample = DEFAULT_GALLERY[type][0];
              return (
                <Link
                  key={type}
                  href={`/prints/${cfg.slug}`}
                  className="group block"
                >
                  <div className="bg-soft aspect-[4/5] flex items-center justify-center p-6 md:p-8 overflow-hidden">
                    <div className="w-full transition-transform duration-500 group-hover:scale-[1.02]">
                      <WallFrame compact>
                        <PrintPreview type={type} values={sample.values} />
                      </WallFrame>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[15px] text-ink">{cfg.detailsLabel}</span>
                    <ArrowRight size={14} strokeWidth={1.75} className="text-mid group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works — minimal numbered steps */}
      <section id="how" className="py-20 md:py-28 bg-soft scroll-mt-40">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-14 max-w-xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-ink mb-3">
              Four steps. Done.
            </h2>
            <p className="text-mid">From idea to wall in under a week.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-10 md:gap-6">
            {[
              { n: '01', title: 'Pick your print', desc: 'Browse ready-made designs or start a custom print.' },
              { n: '02', title: 'Add your details', desc: 'Customize required info. Optional fields are filled for you.' },
              { n: '03', title: 'Preview live', desc: 'See your print render in real time before checkout.' },
              { n: '04', title: 'Enjoy', desc: 'Digital download or museum-quality print delivered.' },
            ].map((step) => (
              <div key={step.n} className="text-left">
                <div className="text-xs font-medium text-mid mb-3">{step.n}</div>
                <h3 className="text-[18px] font-medium text-ink mb-2">{step.title}</h3>
                <p className="text-sm text-mid leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gift Section — lavender pastel block */}
      <section id="gift" className="py-20 md:py-28 scroll-mt-40">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="bg-lavender-light p-10 md:p-20 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-medium text-ink tracking-tight leading-[1.05] mb-5">
                Make it<br />meaningful.
              </h2>
              <p className="text-mid text-base md:text-lg mb-7 leading-relaxed max-w-sm">
                Every print can be a gift. Add a personal message, ship it straight to the recipient, and we&apos;ll leave the price off. Perfect for birthdays, anniversaries, and weddings.
              </p>
              <Link href="/shop" className="btn-primary">
                Find a gift
              </Link>
            </div>
            <div className="bg-paper aspect-[4/5] max-w-[420px] mx-auto w-full flex items-center justify-center p-10">
              <div className="w-full">
                <WallFrame compact>
                  <PrintPreview type="marathon" values={DEFAULT_GALLERY.marathon[0].values} />
                </WallFrame>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="py-20 md:py-28">
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-ink">
                What customers are saying.
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {reviews.map((r) => (
                <div key={r.id} className="border-t border-ink pt-6">
                  <div className="flex gap-0.5 mb-4 text-ink">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
                    ))}
                  </div>
                  <p className="text-ink text-base leading-relaxed mb-5">&ldquo;{r.content}&rdquo;</p>
                  <div>
                    <div className="text-sm font-medium text-ink">{r.customer_name}</div>
                    <div className="text-[13px] text-mid mt-0.5">{r.location_context}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24 md:py-32 bg-ink text-paper">
        <div className="max-w-[900px] mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-medium tracking-tight leading-[1.05] mb-5">
            Ready to make yours?
          </h2>
          <p className="text-paper/70 mb-9 max-w-md mx-auto">
            Shop ready-to-ship designs, or start a custom print from scratch.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 bg-paper text-ink px-7 py-3.5 rounded-full font-medium text-sm hover:bg-soft transition-colors"
            >
              Shop the collection
            </Link>
            <Link
              href="/prints/golf"
              className="inline-flex items-center justify-center gap-2 border border-paper/30 text-paper px-7 py-3.5 rounded-full font-medium text-sm hover:bg-paper/10 transition-colors"
            >
              Create custom
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
