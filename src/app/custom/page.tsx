import type { Metadata } from 'next';
import Link from 'next/link';
import NavbarShell from '@/components/NavbarShell';
import Footer from '@/components/Footer';
import QuoteForm from './QuoteForm';
import { CUSTOM_PRODUCTS, type ProductSlug } from '@/data/custom';

export const metadata: Metadata = {
  title: 'Get a Free Quote for Custom Printing',
  description:
    'Custom shirts, hats, stickers, posters, signs, and merch. Tell us what you need, get a free quote and proof, and we handle the printing and shipping.',
  alternates: { canonical: '/custom' },
};

const STEPS = [
  { n: '01', title: 'Send your request', desc: 'Takes about 2 minutes. No design needed.' },
  { n: '02', title: 'Get a quote and proof', desc: 'Within 1 to 2 business days, by email.' },
  { n: '03', title: 'Approve and we print', desc: 'Then we ship it to your door.' },
];

export default function CustomPage({ searchParams }: { searchParams: { product?: string } }) {
  const initialProduct = CUSTOM_PRODUCTS.find((p) => p.slug === searchParams.product)?.slug as
    | ProductSlug
    | undefined;

  return (
    <>
      <NavbarShell />

      <section className="bg-ink text-paper pt-32 md:pt-40 pb-12 md:pb-16">
        <div className="max-w-[1100px] mx-auto px-6">
          <p className="eyebrow text-paper/60 mb-6">Custom orders</p>
          <h1 className="display text-[13vw] md:text-8xl mb-6">Get a free quote</h1>
          <p className="text-base md:text-lg text-paper/75 max-w-xl leading-relaxed">
            Tell us what you want printed, whether it is one piece or a few hundred. We reply with a price and a
            proof, and nothing is printed until you approve it.
          </p>

          <ol className="grid sm:grid-cols-3 gap-6 mt-12">
            {STEPS.map((s) => (
              <li key={s.n} className="border-t border-paper/30 pt-4">
                <div className="font-display font-black text-2xl text-paper/30 mb-2">{s.n}</div>
                <div className="text-[15px] font-bold">{s.title}</div>
                <div className="text-[13px] text-paper/60 mt-1 leading-snug">{s.desc}</div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="max-w-[1100px] mx-auto px-6 grid lg:grid-cols-[1fr_300px] gap-10 items-start">
          <QuoteForm initialProduct={initialProduct} />

          <aside className="space-y-4 lg:sticky lg:top-32">
            <div className="rounded-xl border border-border p-5">
              <h2 className="text-[15px] font-bold text-ink mb-2">Not sure what you need?</h2>
              <p className="text-[13px] text-mid leading-relaxed">
                Pick the closest option and describe the rest. We will recommend the right product and print method.
              </p>
            </div>
            <div className="rounded-xl border border-border p-5">
              <h2 className="text-[15px] font-bold text-ink mb-2">Questions first?</h2>
              <p className="text-[13px] text-mid leading-relaxed mb-3">
                See how it works, print methods, and artwork tips.
              </p>
              <Link href="/how-it-works" className="text-sm font-medium text-ink underline underline-offset-4">
                How it works
              </Link>
            </div>
            <div className="rounded-xl border border-border p-5">
              <h2 className="text-[15px] font-bold text-ink mb-2">Prefer email?</h2>
              <p className="text-[13px] text-mid leading-relaxed">
                <a href="mailto:milesawayprintsllc@gmail.com" className="text-ink underline underline-offset-2 break-all">
                  milesawayprintsllc@gmail.com
                </a>
              </p>
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </>
  );
}
