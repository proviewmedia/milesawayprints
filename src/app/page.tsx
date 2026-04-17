import Link from 'next/link';
import { ArrowRight, Sparkles, Download, Truck, Gift, Star } from 'lucide-react';
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
    .select('id, print_type_slug, name, location, slug, description, tags, values, image_url, room_mockup_url')
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

      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-b from-soft to-white">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 bg-primary-light text-primary px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-6">
                <Sparkles size={14} /> Custom Location Art
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-ink leading-[1.05] mb-6">
                The places that
                <br />
                <span className="text-primary">mean the most</span>
                <br />
                to you.
              </h1>
              <p className="text-lg text-mid mb-8 max-w-md leading-relaxed">
                Custom art prints of stadiums, airports, marathons, city streets, and golf courses — personalized with your details, delivered your way.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/shop" className="btn-primary">
                  Shop the Collection <ArrowRight size={16} />
                </Link>
                <Link href="/prints/golf" className="btn-secondary">
                  Create Custom
                </Link>
              </div>
            </div>

            <div className="relative hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-light/40 to-mint-light/40 rounded-3xl blur-3xl" />
              <div className="relative grid grid-cols-2 gap-4">
                <div className="pt-8">
                  <WallFrame>
                    <PrintPreview type="golf" values={DEFAULT_GALLERY.golf[0].values} />
                  </WallFrame>
                </div>
                <div className="pb-8">
                  <WallFrame>
                    <PrintPreview type="stadium" values={DEFAULT_GALLERY.stadium[0].values} />
                  </WallFrame>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-y border-border bg-white">
        <div className="max-w-[1280px] mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Download, label: 'Instant digital delivery', bg: 'bg-primary-light', fg: 'text-primary' },
            { icon: Truck, label: 'Museum-quality printing', bg: 'bg-mint-light', fg: 'text-mint' },
            { icon: Gift, label: 'Perfect for gifts', bg: 'bg-coral-light', fg: 'text-coral' },
            { icon: Star, label: '500+ happy customers', bg: 'bg-warm-light', fg: 'text-warm' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 justify-center md:justify-start">
              <div className={`p-2 rounded-full ${item.bg}`}>
                <item.icon size={16} className={item.fg} />
              </div>
              <span className="text-sm font-medium text-ink">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Shop Ready-Made */}
      <section className="py-20 md:py-28">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
            <div>
              <div className="section-label">Shop ready-made</div>
              <h2 className="section-title">Popular right now.</h2>
              <p className="text-mid max-w-lg">
                Existing designs, ready to ship. Pick digital or physical, choose your size, done.
              </p>
            </div>
            <Link href="/shop" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
              See all designs <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {featured.map((d) => (
              <DesignCardWrapper key={d.slug} design={d} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories (custom create flow) */}
      <section className="py-20 md:py-24 bg-soft">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-14">
            <div className="section-label">Don&apos;t see your location?</div>
            <h2 className="section-title">Create a custom print from scratch.</h2>
            <p className="text-mid max-w-lg mx-auto mt-3">
              Pick a category, fill in your location and details, preview live, and we&apos;ll design it for you. 3–5 day turnaround.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {CATEGORY_ORDER.map((type) => {
              const cfg = PRINT_CONFIGS[type];
              const sample = DEFAULT_GALLERY[type][0];
              return (
                <Link
                  key={type}
                  href={`/prints/${cfg.slug}`}
                  className="group block bg-white rounded-2xl border border-border p-4 hover:border-primary hover:shadow-[0_12px_36px_rgba(79,109,245,0.12)] hover:-translate-y-1 transition-all duration-300"
                >
                  <WallFrame compact>
                    <PrintPreview type={type} values={sample.values} />
                  </WallFrame>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-ink text-sm">{cfg.detailsLabel}</div>
                      <div className="text-xs text-mid mt-0.5">{cfg.badge}</div>
                    </div>
                    <ArrowRight size={16} className="text-mid group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-20 md:py-28">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-14">
            <div className="section-label">How It Works</div>
            <h2 className="section-title">Pick, personalize, preview, enjoy.</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { n: '1', title: 'Pick your print', desc: 'Browse ready-made designs or start a custom print in one of five categories.', bg: 'bg-primary-light', fg: 'text-primary' },
              { n: '2', title: 'Add your details', desc: 'Customize required info. Optional fields let us fill in the rest.', bg: 'bg-mint-light', fg: 'text-mint' },
              { n: '3', title: 'Preview live', desc: 'See your print come to life with your exact details before you check out.', bg: 'bg-coral-light', fg: 'text-coral' },
              { n: '4', title: 'Enjoy', desc: 'Instant digital download or museum-quality print delivered to your door.', bg: 'bg-warm-light', fg: 'text-warm' },
            ].map((step) => (
              <div key={step.n} className="bg-white rounded-2xl p-6 border border-border">
                <div className={`w-10 h-10 rounded-full ${step.bg} ${step.fg} font-extrabold flex items-center justify-center mb-4`}>
                  {step.n}
                </div>
                <h3 className="font-bold text-ink mb-2">{step.title}</h3>
                <p className="text-sm text-mid leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gift Section */}
      <section id="gift" className="py-20 md:py-28 bg-soft">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="bg-gradient-to-br from-coral-light to-warm-light rounded-3xl p-8 md:p-16 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/70 text-coral px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase mb-4">
                <Gift size={14} /> Gifts, simplified
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-ink tracking-tight mb-4">
                Make it meaningful.
              </h2>
              <p className="text-mid text-lg mb-6 leading-relaxed">
                Every print can be a gift. Add a personal message, have it shipped directly to the recipient, and we&apos;ll leave the price off. Perfect for birthdays, anniversaries, and weddings.
              </p>
              <Link href="/shop" className="btn-primary">
                Find a Gift <ArrowRight size={16} />
              </Link>
            </div>
            <div className="relative">
              <WallFrame>
                <PrintPreview type="marathon" values={DEFAULT_GALLERY.marathon[0].values} />
              </WallFrame>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="py-20 md:py-28">
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="text-center mb-14">
              <div className="section-label">Reviews</div>
              <h2 className="section-title">What customers are saying.</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {reviews.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl p-6 border border-border">
                  <div className="flex gap-0.5 mb-3 text-warm">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
                    ))}
                  </div>
                  <p className="text-ink text-sm leading-relaxed mb-4">&ldquo;{r.content}&rdquo;</p>
                  <div>
                    <div className="font-bold text-ink text-sm">{r.customer_name}</div>
                    <div className="text-xs text-mid mt-0.5">{r.location_context}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-ink text-white">
        <div className="max-w-[1280px] mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Ready to make yours?
          </h2>
          <p className="text-white/70 mb-8 max-w-md mx-auto">
            Shop ready-to-ship designs or create something completely custom.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-white text-ink px-8 py-4 rounded-full font-semibold text-sm hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(255,255,255,0.2)] transition-all"
            >
              Shop the Collection <ArrowRight size={16} />
            </Link>
            <Link
              href="/prints/golf"
              className="inline-flex items-center gap-2 border border-white/20 text-white px-8 py-4 rounded-full font-semibold text-sm hover:bg-white/10 transition-all"
            >
              Create Custom
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
