import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Check } from 'lucide-react';
import NavbarShell from '@/components/NavbarShell';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import DesignCard from '@/components/DesignCard';
import ProductIcon from '@/components/ProductIcon';
import { SERVICE_AREAS, getServiceArea } from '@/data/locations';
import { QUOTE_PRODUCTS } from '@/data/custom';
import { type GalleryItemWithMeta, toDesignSummary } from '@/data/shop';
import type { PrintType } from '@/data/prints';
import { createAdminClient } from '@/lib/supabase';
import { faqPageJsonLd, serviceAreaJsonLd } from '@/lib/seo';
import { PHONE_DISPLAY, PHONE_E164 } from '@/lib/site';

export const revalidate = 3600;

export function generateStaticParams() {
  return SERVICE_AREAS.map((a) => ({ city: a.slug }));
}

export function generateMetadata({ params }: { params: { city: string } }): Metadata {
  const area = getServiceArea(params.city);
  if (!area) return {};
  const url = `/custom-printing/${area.slug}`;
  return {
    title: area.seoTitle,
    description: area.seoDescription,
    alternates: { canonical: url },
    openGraph: { title: `${area.seoTitle} | The INQ Press`, description: area.seoDescription, url },
  };
}

async function getFeatured(slugs: string[]) {
  if (slugs.length === 0) return [];
  const { data } = await createAdminClient()
    .from('gallery_items')
    .select(
      'id, print_type_slug, name, location, slug, description, tags, values, image_url, room_mockup_url, printful_product_id, printful_variants, printful_prices, digital_price_cents',
    )
    .in('slug', slugs)
    .eq('active', true);
  const rows = (data ?? []) as (GalleryItemWithMeta & { print_type_slug: PrintType })[];
  // Keep the order the page lists them in.
  return slugs
    .map((s) => rows.find((r) => r.slug === s))
    .filter((r): r is GalleryItemWithMeta & { print_type_slug: PrintType } => !!r)
    .map((r) => toDesignSummary(r, r.print_type_slug));
}

export default async function ServiceAreaPage({ params }: { params: { city: string } }) {
  const area = getServiceArea(params.city);
  if (!area) notFound();
  const featured = await getFeatured(area.featuredSlugs);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceAreaJsonLd(area)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd(area.faqs)) }}
      />
      <NavbarShell />

      <section className="bg-ink text-paper pt-32 md:pt-40 pb-14 md:pb-20">
        <div className="max-w-[1400px] mx-auto px-6">
          <Breadcrumbs
            items={[
              { name: 'Where we print', href: '/custom-printing' },
              { name: area.name, href: `/custom-printing/${area.slug}` },
            ]}
          />
          <h1 className="display text-[12vw] md:text-[7vw] xl:text-[112px] mb-6 max-w-5xl">
            Custom printing in {area.name}
          </h1>
          <p className="text-base md:text-xl text-paper/75 max-w-2xl leading-relaxed">{area.intro}</p>
          <div className="flex flex-wrap gap-3 mt-10">
            <Link
              href="/custom"
              className="inline-flex items-center gap-2 bg-paper text-ink px-7 py-3.5 rounded-full font-bold text-[15px] hover:bg-soft transition-colors"
            >
              Get started <ArrowRight size={16} strokeWidth={2.25} aria-hidden="true" />
            </Link>
            <a
              href={`tel:${PHONE_E164}`}
              className="inline-flex items-center px-7 py-3.5 rounded-full font-bold text-[15px] border border-paper/40 hover:border-paper transition-colors"
            >
              Call {PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </section>

      {/* What we print here */}
      <section className="py-14 md:py-20">
        <div className="max-w-[1400px] mx-auto px-6">
          <h2 className="display text-4xl md:text-6xl mb-3">What we print for {area.name}</h2>
          <p className="text-mid mb-8 max-w-2xl">
            Prints order online with set prices. Everything else gets a free quote. One piece or hundreds.
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <Link
              href="/custom?start=prints"
              className="col-span-2 lg:col-span-1 flex flex-col justify-between gap-6 min-h-[140px] p-5 border-2 border-ink/15 hover:border-ink transition-colors"
            >
              <ProductIcon icon="frame" size={22} />
              <span>
                <span className="block font-bold text-[16px]">Prints</span>
                <span className="block text-[13px] text-mid mt-1">Photos, art, posters, and custom designs</span>
                <span className="block text-[13px] font-bold mt-3">Order online</span>
              </span>
            </Link>
            {QUOTE_PRODUCTS.filter((p) => p.slug !== 'other').map((p) => (
              <Link
                key={p.slug}
                href={`/custom?start=${p.slug}`}
                className="flex flex-col justify-between gap-6 min-h-[140px] p-5 border-2 border-ink/15 hover:border-ink transition-colors"
              >
                <ProductIcon icon={p.icon} size={22} />
                <span>
                  <span className="block font-bold text-[16px]">{p.name}</span>
                  <span className="block text-[13px] text-mid mt-1">{p.examples}</span>
                  <span className="block text-[13px] font-bold text-mid mt-3">Free quote</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Who we print for here */}
      <section className="bg-ink text-paper">
        <div className="max-w-[1400px] mx-auto px-6 py-14 md:py-20">
          <h2 className="display text-4xl md:text-6xl mb-10">Popular in {area.name}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-paper/20 border border-paper/20">
            {area.uses.map((u) => (
              <div key={u.title} className="bg-ink p-6">
                <Check size={18} strokeWidth={2.25} className="mb-4" aria-hidden="true" />
                <h3 className="font-bold text-[17px] mb-2">{u.title}</h3>
                <p className="text-sm text-paper/70 leading-relaxed">{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Local prints */}
      <section className="py-14 md:py-20">
        <div className="max-w-[1400px] mx-auto px-6">
          <h2 className="display text-4xl md:text-6xl mb-3">Prints of {area.name}</h2>
          <p className="text-mid mb-8 max-w-2xl">
            Ready-made prints from the shop, or a custom one designed for your place.
          </p>
          {featured.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10 mb-10">
              {featured.map((d) => (
                <DesignCard key={d.slug} design={d} />
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {area.printIdeas.map((idea) => (
              <Link
                key={idea.label}
                href={`/custom?start=map&type=${idea.type}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border-2 border-ink/15 hover:border-ink text-sm font-bold transition-colors"
              >
                {idea.label} <ArrowRight size={14} strokeWidth={2.25} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-ink">
        <div className="max-w-[900px] mx-auto px-6 py-14 md:py-20">
          <h2 className="display text-4xl md:text-5xl mb-8">Common questions</h2>
          <div className="divide-y divide-ink/15 border-y border-ink/15">
            {area.faqs.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="cursor-pointer list-none flex justify-between gap-4 font-bold text-[16px]">
                  {f.q}
                  <span aria-hidden="true" className="text-mid group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <p className="text-mid leading-relaxed mt-3">{f.a}</p>
              </details>
            ))}
          </div>
          <p className="text-sm text-mid mt-8">
            Other areas we serve:{' '}
            {SERVICE_AREAS.filter((a) => a.slug !== area.slug).map((a, i, arr) => (
              <span key={a.slug}>
                <Link href={`/custom-printing/${a.slug}`} className="text-ink underline underline-offset-2">
                  {a.name}
                </Link>
                {i < arr.length - 1 ? ', ' : '.'}
              </span>
            ))}{' '}
            We ship everywhere in the US.
          </p>
        </div>
      </section>

      <Footer />
    </>
  );
}
