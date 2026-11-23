import type { Metadata } from 'next';
import Link from 'next/link';
import { Star, ArrowRight, ArrowUpRight } from 'lucide-react';
import NavbarShell from '@/components/NavbarShell';
import Footer from '@/components/Footer';
import ProductIcon from '@/components/ProductIcon';
import { PrintType } from '@/data/prints';
import { DesignSummary, toDesignSummary, GalleryItemWithMeta } from '@/data/shop';
import { QUOTE_PRODUCTS, AUDIENCES, DECORATION_METHODS } from '@/data/custom';
import { ARTWORK_PRINT_PRICES, CUSTOM_PRINT_PRICES, fromPrice } from '@/data/custom-prints';
import { supabase, createAdminClient } from '@/lib/supabase';
import { unstable_noStore as noStore } from 'next/cache';

async function getReviews() {
  // Bust Next.js fetch cache so DB edits to reviews show up immediately
  // without needing a fresh deploy.
  noStore();
  const admin = createAdminClient();
  const { data } = await admin
    .from('reviews')
    .select('*')
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(3);
  return data ?? [];
}

/** First active design of a category, preferring a given slug prefix. */
async function getCover(type: PrintType, prefer?: string): Promise<DesignSummary | undefined> {
  const { data } = await supabase
    .from('gallery_items')
    .select('id, print_type_slug, name, location, slug, description, tags, values, image_url, room_mockup_url, printful_product_id, printful_variants, printful_prices, digital_price_cents')
    .eq('active', true)
    .eq('print_type_slug', type)
    .order('featured', { ascending: false })
    .order('sort_order', { ascending: true })
    .limit(20);
  const designs = ((data ?? []) as GalleryItemWithMeta[]).map((row) => toDesignSummary(row, type));
  return (prefer && designs.find((d) => d.slug.startsWith(prefer))) || designs[0];
}

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

const PRINT_TILES = [
  {
    href: '/custom?start=prints',
    name: 'Prints',
    desc: 'Photos, art, posters, and custom designs',
    from: Math.min(fromPrice(ARTWORK_PRINT_PRICES), ...Object.values(CUSTOM_PRINT_PRICES).map(fromPrice)),
  },
];

const STEPS = [
  { n: '01', title: 'Tell us what you need', desc: 'Pick a product and quantity, and share your design or idea.' },
  { n: '02', title: 'Get a quote and proof', desc: 'We email a price and a preview within 1 to 2 business days.' },
  { n: '03', title: 'Approve it', desc: 'Ask for changes until it is right. Then it goes to print.' },
  { n: '04', title: 'We print and ship', desc: 'Your order arrives at your door with tracking.' },
];

export default async function HomePage() {
  const [reviews, golf, airport, skyline, f1] = await Promise.all([
    getReviews(),
    getCover('golf'),
    getCover('airport', 'denver'),
    getCover('skyline', 'los-angeles'),
    getCover('f1', 'miami'),
  ]);

  const collection = [
    { name: 'Golf courses', image: golf?.image_url, href: '/prints/golf' },
    { name: 'Airports', image: airport?.image_url, href: '/prints/airport' },
    { name: 'Skylines', image: skyline?.image_url, href: '/prints/skyline' },
    { name: 'F1 circuits', image: f1?.image_url, href: '/prints/f1' },
  ];

  return (
    <>
      <NavbarShell />

      {/* Hero: full-bleed black, logo-weight type. One primary action. */}
      <section className="bg-ink text-paper pt-32 md:pt-40 pb-16 md:pb-24">
        <div className="max-w-[1400px] mx-auto px-6">
          <p className="eyebrow text-paper/60 mb-6">Custom print studio</p>
          <h1 className="display text-[13.5vw] md:text-[9.5vw] xl:text-[150px]">
            Your idea.
            <br />
            Printed on
            <br />
            anything.
          </h1>
          <div className="mt-10 md:mt-14 grid md:grid-cols-[1fr_auto] gap-8 md:items-end">
            <p className="text-base md:text-xl text-paper/75 max-w-xl leading-relaxed">
              Shirts, hats, stickers, signs, prints, and merch. Order just one for yourself or hundreds
              for your team. Prints order online, everything else gets a free quote.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/custom"
                className="inline-flex items-center justify-center gap-2 bg-paper text-ink px-8 py-4 rounded-full font-bold text-[15px] hover:bg-soft transition-colors"
              >
                Get started
                <ArrowRight size={16} strokeWidth={2.25} aria-hidden="true" />
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full font-bold text-[15px] border border-paper/40 hover:border-paper transition-colors"
              >
                Shop prints
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Proof points: four short promises; 1px gaps over ink draw the rules */}
      <section className="border-b border-ink">
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-px bg-ink">
          {[
            { title: 'Free quotes', desc: 'A price within 1 to 2 business days' },
            { title: 'Proof first', desc: 'Nothing prints until you approve' },
            { title: 'Order just one', desc: 'Or hundreds. No order is too small' },
            { title: 'Design help', desc: 'No file? We design it with you' },
          ].map((item) => (
            <div key={item.title} className="bg-paper px-6 py-7 md:py-9">
              <div className="font-display font-black uppercase text-lg md:text-2xl tracking-tight">{item.title}</div>
              <div className="text-[13px] md:text-sm text-mid mt-1 leading-snug">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* What we print: print tiles open the online order builders, the rest
          open the quote form with that product picked (all on /custom) */}
      <section className="py-16 md:py-24">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-end justify-between gap-6 flex-wrap mb-10">
            <div>
              <p className="eyebrow text-mid mb-4">Services</p>
              <h2 className="display text-5xl md:text-7xl">What we print</h2>
            </div>
            <p className="text-mid max-w-sm">
              Prints have prices and order online. Everything else starts with a free quote. If it can be printed, we can do it.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-ink">
            {PRINT_TILES.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="group relative flex flex-col justify-between min-h-[170px] md:min-h-[200px] p-6 md:p-8 border-r border-b border-ink transition-colors hover:bg-ink hover:text-paper"
              >
                <div className="flex items-start justify-between">
                  <ProductIcon icon="frame" size={26} />
                  <span className="text-[13px] font-bold">From ${t.from}</span>
                </div>
                <div>
                  <h3 className="font-display font-black uppercase text-2xl md:text-3xl tracking-tight leading-none">
                    {t.name}
                  </h3>
                  <p className="text-sm mt-2 text-mid group-hover:text-paper/70">{t.desc}</p>
                </div>
              </Link>
            ))}
            {QUOTE_PRODUCTS.map((p) => {
              const isOther = p.slug === 'other';
              return (
                <Link
                  key={p.slug}
                  href={`/custom?start=${p.slug}`}
                  className={`group relative flex flex-col justify-between min-h-[170px] md:min-h-[200px] p-6 md:p-8 border-r border-b border-ink transition-colors ${
                    isOther ? 'bg-ink text-paper hover:bg-black' : 'hover:bg-ink hover:text-paper'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <ProductIcon icon={p.icon} size={26} />
                    <ArrowUpRight
                      size={22}
                      strokeWidth={2}
                      className="opacity-40 group-hover:opacity-100 transition-opacity"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <h3 className="font-display font-black uppercase text-2xl md:text-3xl tracking-tight leading-none">
                      {isOther ? 'Something else' : p.name}
                    </h3>
                    <p className={`text-sm mt-2 ${isOther ? 'text-paper/70' : 'text-mid group-hover:text-paper/70'}`}>
                      {p.examples}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Who it's for: lets visitors recognize their own use case */}
      <section className="py-16 md:py-24 bg-soft">
        <div className="max-w-[1400px] mx-auto px-6">
          <p className="eyebrow text-mid mb-4">Who we print for</p>
          <h2 className="display text-5xl md:text-7xl mb-10">Made for</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {AUDIENCES.map((a) => (
              <div key={a.name} className="rounded-xl bg-paper border border-border p-6">
                <h3 className="font-display font-black uppercase text-xl tracking-tight leading-tight">{a.name}</h3>
                <p className="text-sm text-mid mt-2 leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works: big numbers, four steps */}
      <section id="how" className="py-16 md:py-24 bg-ink text-paper scroll-mt-32">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-end justify-between gap-6 flex-wrap mb-12">
            <div>
              <p className="eyebrow text-paper/60 mb-4">How it works</p>
              <h2 className="display text-5xl md:text-7xl">Four steps.</h2>
            </div>
            <Link href="/how-it-works" className="inline-flex items-center gap-2 font-bold text-[15px] underline underline-offset-4">
              The full process
              <ArrowRight size={16} strokeWidth={2.25} aria-hidden="true" />
            </Link>
          </div>
          <ol className="grid md:grid-cols-4 gap-10 md:gap-8">
            {STEPS.map((s) => (
              <li key={s.n} className="border-t border-paper/30 pt-6">
                <div className="display text-6xl md:text-7xl text-paper/25 mb-5">{s.n}</div>
                <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                <p className="text-sm text-paper/70 leading-relaxed">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Print methods teaser */}
      <section className="py-16 md:py-24">
        <div className="max-w-[1400px] mx-auto px-6 grid lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-16 items-start">
          <div>
            <p className="eyebrow text-mid mb-4">Print methods</p>
            <h2 className="display text-5xl md:text-7xl mb-6">The right method for the job.</h2>
            <p className="text-mid max-w-md leading-relaxed mb-8">
              You do not need to know the difference. Tell us the product and quantity, and we recommend the method
              that looks best for the price.
            </p>
            <Link href="/how-it-works#methods" className="btn-secondary font-bold">
              Compare print methods
            </Link>
          </div>
          <ul className="border-t border-ink">
            {DECORATION_METHODS.map((m) => (
              <li key={m.name} className="flex items-baseline justify-between gap-6 py-5 border-b border-ink">
                <span className="font-display font-black uppercase text-xl md:text-2xl tracking-tight">{m.name}</span>
                <span className="text-sm text-mid text-right">{m.bestFor}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* The shop is a side offering: our own ready-made prints */}
      <section className="py-16 md:py-24 bg-soft">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-end justify-between gap-6 flex-wrap mb-10">
            <div>
              <p className="eyebrow text-mid mb-4">Also from the studio</p>
              <h2 className="display text-5xl md:text-7xl">The print shop</h2>
              <p className="text-mid mt-4 max-w-lg">
                Ready-made art prints we design in house: golf courses, airports, skylines, F1 circuits, and more.
                Order online and ship worldwide.
              </p>
            </div>
            <Link href="/shop" className="btn-secondary font-bold">
              Shop all prints
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {collection.map((c) => (
              <Link key={c.name} href={c.href} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden bg-paper">
                  {c.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.image}
                      alt={`${c.name} print`}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  ) : null}
                </div>
                <div className="mt-3 text-[15px] font-bold">{c.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="flex items-end justify-between gap-6 flex-wrap mb-10">
              <div>
                <p className="eyebrow text-mid mb-4">Reviews</p>
                <h2 className="display text-5xl md:text-7xl">Customers say</h2>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5 text-ink" aria-label="4.7 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" strokeWidth={0} aria-hidden="true" />
                  ))}
                </div>
                <span className="text-sm font-bold">4.7 / 5 from 100+ Etsy reviews</span>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {reviews.map((r) => (
                <div key={r.id} className="border-t-2 border-ink pt-6">
                  <div className="flex gap-0.5 mb-4 text-ink">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
                    ))}
                  </div>
                  <p className="text-ink text-base leading-relaxed mb-5">&ldquo;{r.content}&rdquo;</p>
                  <div>
                    <div className="text-sm font-bold text-ink">{r.customer_name}</div>
                    <div className="text-[13px] text-mid mt-0.5">{r.location_context}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Closing CTA */}
      <section className="py-20 md:py-28 bg-ink text-paper">
        <div className="max-w-[1400px] mx-auto px-6">
          <h2 className="display text-[14vw] md:text-[8vw] xl:text-[120px] mb-10">
            Got an idea?
            <br />
            Let&apos;s print it.
          </h2>
          <div className="flex flex-wrap items-center gap-6">
            <Link
              href="/custom"
              className="inline-flex items-center justify-center gap-2 bg-paper text-ink px-8 py-4 rounded-full font-bold text-[15px] hover:bg-soft transition-colors"
            >
              Get started
              <ArrowRight size={16} strokeWidth={2.25} aria-hidden="true" />
            </Link>
            <p className="text-paper/70 text-sm">Free, no commitment. You approve a proof before anything is printed.</p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
