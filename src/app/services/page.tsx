import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import NavbarShell from '@/components/NavbarShell';
import Footer from '@/components/Footer';
import ProductIcon from '@/components/ProductIcon';
import { CUSTOM_PRODUCTS } from '@/data/custom';

export const metadata: Metadata = {
  title: 'What We Print: Custom Apparel, Merch, Stickers, and Signs',
  description:
    'Custom printing on apparel, hats, bags, drinkware, stickers, posters, signs, and promo items. Free quotes and a proof before anything is printed.',
  alternates: { canonical: '/services' },
};

export default function ServicesPage() {
  return (
    <>
      <NavbarShell />

      <section className="bg-ink text-paper pt-32 md:pt-40 pb-14 md:pb-20">
        <div className="max-w-[1400px] mx-auto px-6">
          <p className="eyebrow text-paper/60 mb-6">Services</p>
          <h1 className="display text-[14vw] md:text-[8vw] xl:text-[128px]">What we print</h1>
          <p className="text-base md:text-xl text-paper/75 max-w-xl leading-relaxed mt-8">
            If it can hold a design, we can print it. Pick a product to start a free quote, or tell us about something
            that is not listed.
          </p>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="max-w-[1400px] mx-auto px-6">
          <ul className="border-t border-ink">
            {CUSTOM_PRODUCTS.map((p) => (
              <li key={p.slug} className="border-b border-ink">
                <Link
                  href={`/custom?product=${p.slug}`}
                  className="group grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1.2fr_1fr_1fr_auto] items-center gap-x-5 md:gap-x-8 gap-y-2 py-6 md:py-8 hover:bg-soft transition-colors px-2 -mx-2"
                >
                  <span className="w-12 h-12 rounded-full border border-ink flex items-center justify-center row-span-2 md:row-span-1">
                    <ProductIcon icon={p.icon} size={20} />
                  </span>
                  <span className="font-display font-black uppercase text-2xl md:text-3xl tracking-tight leading-none">
                    {p.name}
                  </span>
                  <span className="hidden md:block text-sm text-mid">{p.examples}</span>
                  <span className="hidden md:block text-sm">
                    <span className="text-mid">Methods: </span>
                    {p.methods}
                  </span>
                  <span className="inline-flex items-center gap-2 text-sm font-bold justify-self-end row-span-2 md:row-span-1">
                    <span className="hidden sm:inline">Get a quote</span>
                    <ArrowRight size={18} strokeWidth={2.25} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                  <span className="md:hidden col-start-2 text-[13px] text-mid leading-snug">{p.examples}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-12 grid md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border p-6 md:p-8">
              <h2 className="font-display font-black uppercase text-2xl tracking-tight mb-2">Not sure which method?</h2>
              <p className="text-mid mb-5 leading-relaxed">
                Screen printing, embroidery, DTG, and more, explained in plain language.
              </p>
              <Link href="/how-it-works#methods" className="btn-secondary font-bold">
                Compare print methods
              </Link>
            </div>
            <div className="rounded-xl bg-ink text-paper p-6 md:p-8">
              <h2 className="font-display font-black uppercase text-2xl tracking-tight mb-2">Ready to start?</h2>
              <p className="text-paper/70 mb-5 leading-relaxed">It takes about 2 minutes, and quotes are free.</p>
              <Link
                href="/custom"
                className="inline-flex items-center justify-center gap-2 bg-paper text-ink px-7 py-3.5 rounded-full font-bold text-sm hover:bg-soft transition-colors"
              >
                Get a free quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
