import Link from 'next/link';
import Image from 'next/image';
import { Star, ArrowRight, Shirt, HardHat, ShoppingBag, Coffee, Sticker, Image as ImageIcon, Signpost, Gift, Sparkles, type LucideIcon } from 'lucide-react';
import NavbarShell from '@/components/NavbarShell';
import Footer from '@/components/Footer';
import { PrintType } from '@/data/prints';
import { DesignSummary, toDesignSummary, GalleryItemWithMeta } from '@/data/shop';
import { CUSTOM_PRODUCTS, type CustomProduct } from '@/data/custom';
import { supabase, createAdminClient } from '@/lib/supabase';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { unstable_noStore as noStore } from 'next/cache';

const PRODUCT_ICONS: Record<CustomProduct['icon'], LucideIcon> = {
  shirt: Shirt,
  hardHat: HardHat,
  shoppingBag: ShoppingBag,
  coffee: Coffee,
  sticker: Sticker,
  frame: ImageIcon,
  signpost: Signpost,
  gift: Gift,
  sparkles: Sparkles,
};

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

/**
 * Up to N most popular prints of a single category for the
 * homepage scroll rows. Featured items first, then sort_order. Falls
 * back to whatever's active in the DB; no DEFAULT_GALLERY fallback
 * here — if no products are synced for the category yet, the row
 * simply doesn't render.
 */
async function getDesignsByType(type: PrintType, limit = 10): Promise<DesignSummary[]> {
  const { data } = await supabase
    .from('gallery_items')
    .select('id, print_type_slug, name, location, slug, description, tags, values, image_url, room_mockup_url, printful_product_id, printful_variants, printful_prices, digital_price_cents')
    .eq('active', true)
    .eq('print_type_slug', type)
    .order('featured', { ascending: false })
    .order('sort_order', { ascending: true })
    .limit(limit);

  return ((data ?? []) as GalleryItemWithMeta[]).map((row) => toDesignSummary(row, type));
}

export const dynamic = 'force-dynamic';

async function getMarathons() {
  const { data } = await supabase
    .from('marathons')
    .select('slug, city, full_svg_path, thumbnail_path, printful_prices')
    .eq('active', true)
    .order('sort_order', { ascending: true });
  return (data ?? []) as Array<{
    slug: string;
    city: string;
    full_svg_path: string | null;
    thumbnail_path: string | null;
    printful_prices: Record<string, number> | null;
  }>;
}

export default async function HomePage() {
  const [reviews, airports, golf, skylines, f1, city, marathons] = await Promise.all([
    getReviews(),
    getDesignsByType('airport', 10),
    getDesignsByType('golf', 10),
    getDesignsByType('skyline', 10),
    getDesignsByType('f1', 10),
    getDesignsByType('city', 10),
    getMarathons(),
  ]);

  // Las Vegas marathon poster anchors the Gift section.
  const giftMarathon = marathons.find((m) => m.slug === 'las-vegas') ?? marathons[0] ?? null;

  // Hero image: drop a JPG/PNG at /public/hero.jpg (or .png) and it
  // appears automatically. Otherwise we render a clean placeholder so
  // the page doesn't show a broken-image icon.
  const heroJpg = existsSync(join(process.cwd(), 'public', 'hero.jpg'));
  const heroPng = !heroJpg && existsSync(join(process.cwd(), 'public', 'hero.png'));
  const heroSrc = heroJpg ? '/hero.jpg' : heroPng ? '/hero.png' : null;

  return (
    <>
      <NavbarShell />

      {/* Hero: split-screen, content aligned with the navbar gutters
          (max-w-1400 + mx-auto + px-6). */}
      <section className="pt-28 md:pt-32 pb-10 md:pb-14">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid md:grid-cols-[1.1fr_1fr] gap-8 md:gap-12 items-center">
            <div className="flex flex-col justify-between py-6 md:py-2 gap-10">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-mid mb-5">
                  Custom print studio · Est. 2020
                </p>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-ink leading-[0.95] mb-6">
                  Your design,<br />printed on anything.
                </h1>
                <p className="text-base md:text-lg text-mid max-w-xl leading-relaxed">
                  Shirts, hats, stickers, posters, signs, and merch for brands, teams,
                  events, and gifts. Send us your idea, get a free quote, and we handle
                  the printing and shipping.
                </p>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-4 mb-7">
                  <Link href="/custom" className="btn-primary">
                    Get a free quote
                  </Link>
                  <Link
                    href="/shop"
                    className="text-sm font-medium text-ink underline underline-offset-4 decoration-1 hover:opacity-70 transition-opacity"
                  >
                    Or shop ready-made prints →
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5 text-warm" aria-label="4.9 out of 5 stars">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" strokeWidth={0} aria-hidden="true" />
                    ))}
                  </div>
                  <span className="text-sm text-mid">4.9 / 5 · 500+ happy customers</span>
                </div>
              </div>
            </div>

            <div className="relative bg-soft aspect-square overflow-hidden w-full">
              {heroSrc ? (
                <Image
                  src={heroSrc}
                  alt="Custom prints by The Inq Press"
                  fill
                  priority
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover object-center"
                />
              ) : (
                <span className="absolute bottom-3 right-3 text-[10px] uppercase tracking-wider text-mid">
                  Drop /public/hero.jpg to set hero
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar: flat row, no colored chips */}
      <section className="border-y border-border bg-paper">
        <div className="max-w-[1400px] mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 text-center md:text-left">
          {[
            { title: 'Free quotes', desc: 'A price within 1 to 2 business days' },
            { title: 'Proof before print', desc: 'Nothing is made until you approve' },
            { title: 'One piece or hundreds', desc: 'Small runs and bulk orders' },
            { title: 'No design? No problem', desc: 'We can design it with you' },
          ].map((item) => (
            <div key={item.title}>
              <div className="text-sm font-medium text-ink">{item.title}</div>
              <div className="text-[13px] text-mid mt-1 leading-snug">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* What we print: each card deep-links to the quote form with that
          product preselected, so the first step is already done. */}
      <section className="py-12 md:py-16">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-ink">What we print</h2>
              <p className="text-mid text-sm md:text-base mt-1">Pick a product to start your quote.</p>
            </div>
            <Link href="/how-it-works#methods" className="btn-secondary py-2.5 px-5 text-[13px]">
              Print methods
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {CUSTOM_PRODUCTS.filter((p) => p.slug !== 'other').map((p) => {
              const Icon = PRODUCT_ICONS[p.icon];
              return (
                <Link
                  key={p.slug}
                  href={`/custom?product=${p.slug}`}
                  className="group flex items-center gap-4 rounded-xl border border-border bg-paper p-5 hover:border-ink transition-colors"
                >
                  <div className="w-11 h-11 shrink-0 rounded-full bg-soft flex items-center justify-center">
                    <Icon size={18} strokeWidth={1.75} className="text-ink" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[15px] font-medium text-ink">{p.name}</div>
                    <div className="text-[13px] text-mid mt-0.5 leading-snug">{p.examples}</div>
                  </div>
                  <ArrowRight size={16} strokeWidth={1.75} className="text-mid shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              );
            })}
            <Link
              href="/custom?product=other"
              className="group flex items-center gap-4 rounded-xl bg-ink text-paper p-5 hover:bg-black transition-colors"
            >
              <div className="w-11 h-11 shrink-0 rounded-full bg-paper/10 flex items-center justify-center">
                <Sparkles size={18} strokeWidth={1.75} aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-medium">Something else?</div>
                <div className="text-[13px] text-paper/70 mt-0.5 leading-snug">If it can be printed, ask us.</div>
              </div>
              <ArrowRight size={16} strokeWidth={1.75} className="shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* How it works: minimal numbered steps */}
      <section id="how" className="py-12 md:py-16 bg-soft scroll-mt-40">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-10 max-w-xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-ink mb-3">
              Four steps. Done.
            </h2>
            <p className="text-mid">Everything happens online. You approve before we print.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-10 md:gap-6">
            {[
              { n: '01', title: 'Tell us what you need', desc: 'Pick a product, a quantity, and share your design or idea.' },
              { n: '02', title: 'Get a quote and proof', desc: 'We email a price and a preview within 1 to 2 business days.' },
              { n: '03', title: 'Approve it', desc: 'Ask for changes until it is right. Then it goes to print.' },
              { n: '04', title: 'We print and ship', desc: 'Your order arrives at your door with tracking.' },
            ].map((step) => (
              <div key={step.n} className="text-left">
                <div className="text-xs font-medium text-mid mb-3">{step.n}</div>
                <h3 className="text-[18px] font-medium text-ink mb-2">{step.title}</h3>
                <p className="text-sm text-mid leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/how-it-works" className="btn-secondary">
              See how it works
            </Link>
          </div>
        </div>
      </section>

      {/* Print collection: our own work, one tile per print type. Links to
          the /prints/[type] landing pages so their SEO authority is kept. */}
      <section className="py-12 md:py-16">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-ink">
                Our print collection
              </h2>
              <p className="text-mid text-sm md:text-base mt-1">
                Ready-made art prints we design in house. Order online and ship worldwide.
              </p>
            </div>
            <Link href="/shop" className="btn-secondary py-2.5 px-5 text-[13px]">
              Shop all prints
            </Link>
          </div>

          {(() => {
            const laSkyline =
              skylines.find((d) => d.slug === 'los-angeles-california') ??
              skylines.find((d) => d.slug.startsWith('los-angeles')) ??
              skylines[0];
            const denverAirport =
              airports.find((d) => d.slug === 'denver-international-airport') ??
              airports.find((d) => d.slug.startsWith('denver')) ??
              airports[0];
            const miamiF1 =
              f1.find((d) => d.slug === 'miami-grand-prix') ??
              f1.find((d) => d.slug.startsWith('miami')) ??
              f1[0];
            const miamiCity =
              city.find((d) => d.slug === 'miami-street-map-light') ??
              city.find((d) => d.slug.startsWith('miami-street-map')) ??
              city[0];
            // Link to the /prints/[type] landing pages (not /shop?category=)
            // so crawl + link authority concentrate on the rankable category
            // pages with their own copy, FAQs, and structured data.
            const tiles = [
              { name: 'Golf course prints', image: golf[0]?.image_url, href: '/prints/golf', isMarathon: false },
              { name: 'City skyline prints', image: laSkyline?.image_url, href: '/prints/skyline', isMarathon: false },
              { name: 'Airport prints', image: denverAirport?.image_url, href: '/prints/airport', isMarathon: false },
              { name: 'Marathon prints', image: giftMarathon?.thumbnail_path ?? null, href: '/prints/marathon', isMarathon: true },
              { name: 'F1 circuit prints', image: miamiF1?.image_url, href: '/prints/f1', isMarathon: false },
              { name: 'City map prints', image: miamiCity?.image_url, href: '/prints/city', isMarathon: false },
            ];
            return (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
            {tiles.map((c) => (
              <Link key={c.name} href={c.href} className="group block">
                {c.isMarathon ? (
                  // Marathon poster — white tile background with the poster
                  // scaled to ~85% width (visible white border on all sides)
                  // and a soft drop shadow underneath.
                  <div className="relative aspect-[4/5] overflow-hidden bg-white flex items-center justify-center">
                    {c.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.image}
                        alt={c.name}
                        className="w-[85%] h-auto object-contain drop-shadow-[0_3px_6px_rgba(26,26,46,0.06)] transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    ) : null}
                  </div>
                ) : (
                  <div className="relative aspect-[4/5] overflow-hidden bg-soft">
                    {c.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.image}
                        alt={c.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    ) : null}
                  </div>
                )}
                <div className="mt-4 text-[15px] text-ink text-center">{c.name}</div>
              </Link>
            ))}
          </div>
            );
          })()}
        </div>
      </section>

      {/* Lifestyle photography section */}
      <section className="py-10 md:py-14 border-y border-border">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            {[
              { src: '/lifestyle/ord-dresser.jpg', alt: 'Chicago O’Hare airport print displayed on a wood credenza', position: 'object-[center_35%]' },
              { src: '/lifestyle/maui-wall.jpg', alt: 'Maui Nui golf course print framed on a white wall', position: 'object-top' },
            ].map((p) => (
              <div
                key={p.src}
                className="aspect-[5/4] bg-soft-2 overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.src}
                  alt={p.alt}
                  className={`w-full h-full object-cover ${p.position}`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="py-12 md:py-16">
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="text-center mb-10">
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
      <section className="py-16 md:py-20 bg-ink text-paper">
        <div className="max-w-[900px] mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-medium tracking-tight leading-[1.05] mb-5">
            Have something in mind?
          </h2>
          <p className="text-paper/70 mb-9 max-w-md mx-auto">
            Tell us about it. Quotes are free, and you approve a proof before anything is printed.
          </p>
          <Link
            href="/custom"
            className="inline-flex items-center justify-center gap-2 bg-paper text-ink px-7 py-3.5 rounded-full font-medium text-sm hover:bg-soft transition-colors"
          >
            Get a free quote
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
