import Link from 'next/link';
import { Star } from 'lucide-react';
import NavbarShell from '@/components/NavbarShell';
import Footer from '@/components/Footer';
import DesignCardWrapper from './DesignCardWrapper';
import MarathonCard from '@/components/MarathonCard';
import { PrintType } from '@/data/prints';
import { DesignSummary, toDesignSummary, GalleryItemWithMeta } from '@/data/shop';
import { supabase, createAdminClient } from '@/lib/supabase';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { unstable_noStore as noStore } from 'next/cache';

const CATEGORY_ORDER: PrintType[] = ['golf', 'skyline', 'airport', 'marathon', 'city'];

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
  const [reviews, airports, golf, skylines, marathons] = await Promise.all([
    getReviews(),
    getDesignsByType('airport', 10),
    getDesignsByType('golf', 10),
    getDesignsByType('skyline', 10),
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

      {/* Hero — split-screen, content aligned with the navbar gutters
          (max-w-1400 + mx-auto + px-6) so the left edge of the headline
          matches the wordmark and the right edge of the image matches the
          cart icon. */}
      <section className="pt-28 md:pt-32 pb-10 md:pb-14">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid md:grid-cols-[1.1fr_1fr] gap-8 md:gap-12 items-center">
            <div className="flex flex-col justify-between py-6 md:py-2 gap-10">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-mid mb-5">
                  Custom location art · Est. 2020
                </p>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-ink leading-[0.95] mb-6">
                  The places you love,<br />printed.
                </h1>
                <p className="text-base md:text-lg text-mid max-w-xl leading-relaxed">
                  Custom airport, marathon, golf course, and skyline prints —
                  drawn from scratch in our Mojave studio, produced on archival
                  fine-art paper through our American production partner, and
                  shipped worldwide within a week.
                </p>
              </div>

              <div>
                <ul className="flex flex-wrap gap-x-3 gap-y-2 text-[13px] text-mid mb-7">
                  {['Airports', 'Marathons', 'Golf courses', 'City skylines', 'F1 circuits'].map((c, i, arr) => (
                    <li key={c} className="flex items-center gap-3">
                      <span>{c}</span>
                      {i < arr.length - 1 && <span className="text-light-mid">·</span>}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap items-center gap-4 mb-7">
                  <Link href="/shop" className="btn-primary">
                    Shop the collection
                  </Link>
                  <Link
                    href="/marathons/las-vegas"
                    className="text-sm font-medium text-ink underline underline-offset-4 decoration-1 hover:opacity-70 transition-opacity"
                  >
                    Or start a custom print →
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5 text-ink">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
                    ))}
                  </div>
                  <span className="text-sm text-mid">4.9 / 5 · 500+ happy customers</span>
                </div>
              </div>
            </div>

            <div className="relative bg-soft aspect-square overflow-hidden w-full">
              {heroSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={heroSrc}
                  alt="Miles Away Prints — custom location art"
                  className="absolute inset-0 w-full h-full object-cover object-center"
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

      {/* Featured categories — one tile per print type, not individual SKUs */}
      <section className="py-12 md:py-16">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
            <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-ink">
              Shop by category
            </h2>
            <Link href="/shop" className="btn-secondary py-2.5 px-5 text-[13px]">
              Shop all
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Golf courses', image: golf[0]?.image_url, href: '/shop?category=golf', isMarathon: false },
              { name: 'City skylines', image: skylines[0]?.image_url, href: '/shop?category=skyline', isMarathon: false },
              { name: 'Airports', image: airports[0]?.image_url, href: '/shop?category=airport', isMarathon: false },
              { name: 'Marathons', image: giftMarathon?.thumbnail_path ?? null, href: '/shop?category=marathon', isMarathon: true },
            ].map((c) => (
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
                        className="w-[85%] h-auto object-contain drop-shadow-[0_10px_18px_rgba(26,26,46,0.20)] transition-transform duration-500 group-hover:scale-[1.02]"
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
        </div>
      </section>

      {/* Marathon prints — personalized posters from a separate table */}
      {marathons.length > 0 && (
        <section id="marathons" className="py-10 md:py-14 bg-soft scroll-mt-32">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
              <div>
                <div
                  className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase mb-2"
                  style={{ background: '#fee2e2', color: '#dc2626' }}
                >
                  For Runners
                </div>
                <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-ink">
                  Marathon prints
                </h2>
                <p className="text-mid text-sm md:text-base mt-1">
                  Personalize with your bib, finish time, and race date.
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-6 px-6 max-w-[1400px] mx-auto">
              {marathons.map((m) => {
                const prices = (m.printful_prices ?? {}) as Record<string, number>;
                const fromCents = Object.values(prices)
                  .filter((n) => typeof n === 'number')
                  .sort((a, b) => a - b)[0];
                return (
                  <div key={m.slug} className="flex-shrink-0 w-56 md:w-64">
                    <MarathonCard
                      slug={m.slug}
                      city={m.city}
                      thumbnailPath={m.thumbnail_path}
                      fromCents={fromCents}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Airport prints — horizontal scroll row */}
      <CategoryRow
        heading="Airport prints"
        viewAllHref="/shop?category=airport"
        designs={airports}
      />

      {/* Skyline prints — horizontal scroll row */}
      <CategoryRow
        heading="City skylines"
        viewAllHref="/shop?category=skyline"
        designs={skylines}
      />

      {/* Golf course prints — horizontal scroll row */}
      <CategoryRow
        heading="Golf course prints"
        viewAllHref="/shop?category=golf"
        designs={golf}
      />

      {/* Lifestyle photography section */}
      <section className="py-10 md:py-14 border-y border-border">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            {[
              { src: '/lifestyle/ord-dresser.jpg', alt: 'Chicago O’Hare airport print displayed on a wood credenza' },
              { src: '/lifestyle/maui-wall.jpg', alt: 'Maui Nui golf course print framed on a white wall' },
            ].map((p) => (
              <div
                key={p.src}
                className="aspect-[5/4] bg-soft-2 overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.src}
                  alt={p.alt}
                  className="w-full h-full object-cover object-top"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works — minimal numbered steps */}
      <section id="how" className="py-12 md:py-16 bg-soft scroll-mt-40">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-10 max-w-xl mx-auto">
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
            Ready to make yours?
          </h2>
          <p className="text-paper/70 mb-9 max-w-md mx-auto">
            Shop ready-to-ship designs printed on archival paper.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 bg-paper text-ink px-7 py-3.5 rounded-full font-medium text-sm hover:bg-soft transition-colors"
          >
            Shop the collection
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}

/**
 * Heading row + horizontal-scroll strip of DesignCards. Used for the
 * homepage's per-category sections (airports, golf, etc.). Cards are
 * 256px wide; the strip side-scrolls past the right edge of the
 * container. Renders nothing if `designs` is empty.
 */
function CategoryRow({
  heading,
  viewAllHref,
  designs,
}: {
  heading: string;
  viewAllHref: string;
  designs: DesignSummary[];
}) {
  if (designs.length === 0) return null;

  return (
    <section className="py-10 md:py-14">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-ink">
            {heading}
          </h2>
          <Link href={viewAllHref} className="btn-secondary py-2.5 px-5 text-[13px]">
            Show all
          </Link>
        </div>
      </div>

      {/* Scroll strip — overflows the container so cards bleed
          comfortably to the viewport edge. */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-6 px-6 max-w-[1400px] mx-auto">
          {designs.map((d) => (
            <div key={d.slug} className="flex-shrink-0 w-56 md:w-64">
              <DesignCardWrapper design={d} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
