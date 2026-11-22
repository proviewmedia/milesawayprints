import type { Metadata } from 'next';
import Link from 'next/link';
import NavbarShell from '@/components/NavbarShell';
import Footer from '@/components/Footer';
import { DECORATION_METHODS, ARTWORK_GUIDELINES, CUSTOM_FAQS } from '@/data/custom';
import { faqPageJsonLd, jsonLdScript } from '@/lib/seo';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'How Custom Orders Work',
  description:
    'How custom printing works at The INQ Press: send a request, get a free quote and proof, approve it, and we print and ship. Print methods, artwork tips, and FAQs.',
  alternates: { canonical: '/how-it-works' },
};

const PROCESS = [
  {
    n: '01',
    title: 'Tell us what you need',
    desc: 'Fill out the quote form with the product, quantity, and your design or idea. It takes about 2 minutes.',
  },
  {
    n: '02',
    title: 'Get your quote and proof',
    desc: 'Within 1 to 2 business days we email a price and a digital proof showing exactly how it will look.',
  },
  {
    n: '03',
    title: 'Approve it',
    desc: 'Ask for changes until it is right. Once you approve and pay, your order goes into production.',
  },
  {
    n: '04',
    title: 'We print and ship',
    desc: 'Your order is printed, checked, and shipped to you with tracking.',
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <NavbarShell />
      <script {...jsonLdScript(faqPageJsonLd(CUSTOM_FAQS))} />

      <section className="bg-ink text-paper pt-32 md:pt-40 pb-14 md:pb-20">
        <div className="max-w-[1100px] mx-auto px-6">
          <Breadcrumbs items={[{ name: 'How it works', href: '/how-it-works' }]} />
          <h1 className="display text-[12vw] md:text-8xl mb-6 max-w-4xl">Idea to finished product</h1>
          <p className="text-base md:text-lg text-paper/75 max-w-xl leading-relaxed">
            Everything happens online and by email. You see the price and a proof before anything is printed.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-[1100px] mx-auto px-6">
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PROCESS.map((s) => (
              <li key={s.n} className="rounded-xl border border-border p-6">
                <div className="display text-5xl text-ink/20 mb-4">{s.n}</div>
                <h2 className="text-[17px] font-bold text-ink mb-2">{s.title}</h2>
                <p className="text-sm text-mid leading-relaxed">{s.desc}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8">
            <Link href="/custom" className="btn-primary font-bold">
              Get started
            </Link>
          </div>
        </div>
      </section>

      <section id="methods" className="py-12 md:py-16 bg-soft scroll-mt-32">
        <div className="max-w-[1100px] mx-auto px-6">
          <h2 className="display text-4xl md:text-6xl mb-4">Print methods</h2>
          <p className="text-mid mb-8 max-w-xl">
            You do not need to choose one. We recommend the best method for your product, design, and quantity.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DECORATION_METHODS.map((m) => (
              <div key={m.name} className="rounded-xl bg-paper border border-border p-6">
                <h3 className="font-display font-black uppercase text-xl tracking-tight">{m.name}</h3>
                <p className="text-[13px] font-medium text-mid mt-1 mb-3">Best for: {m.bestFor}</p>
                <p className="text-sm text-mid leading-relaxed">{m.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="artwork" className="py-12 md:py-16 scroll-mt-32">
        <div className="max-w-[1100px] mx-auto px-6">
          <h2 className="display text-4xl md:text-6xl mb-4">Sending artwork</h2>
          <p className="text-mid mb-8 max-w-xl">Any of these work. If you are unsure, send what you have.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ARTWORK_GUIDELINES.map((g) => (
              <div key={g.title} className="rounded-xl border border-border p-6">
                <h3 className="text-[15px] font-medium text-ink mb-2">{g.title}</h3>
                <p className="text-sm text-mid leading-relaxed">{g.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-12 md:py-16 bg-soft scroll-mt-32">
        <div className="max-w-[800px] mx-auto px-6">
          <h2 className="display text-4xl md:text-6xl mb-8">Common questions</h2>
          <div className="space-y-3">
            {CUSTOM_FAQS.map((f) => (
              <details key={f.q} className="group rounded-xl bg-paper border border-border">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none p-5 text-[15px] font-medium text-ink">
                  {f.q}
                  <span aria-hidden="true" className="text-mid text-xl leading-none transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="px-5 pb-5 -mt-1 text-sm text-mid leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
          <p className="text-sm text-mid mt-8">
            Questions about the print collection, shipping, or an existing order? See the{' '}
            <Link href="/faq" className="text-ink underline underline-offset-2">
              full FAQ
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-ink text-paper">
        <div className="max-w-[900px] mx-auto px-6 text-center">
          <h2 className="display text-5xl md:text-8xl mb-6">Ready when you are</h2>
          <p className="text-paper/70 mb-9 max-w-md mx-auto">Free quotes. No commitment until you approve a proof.</p>
          <Link
            href="/custom"
            className="inline-flex items-center justify-center gap-2 bg-paper text-ink px-7 py-3.5 rounded-full font-medium text-sm hover:bg-soft transition-colors"
          >
            Get started
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
