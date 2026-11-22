import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Ruler } from 'lucide-react';
import NavbarShell from '@/components/NavbarShell';
import Footer from '@/components/Footer';
import { GUIDES, RESOURCE_TOOLS } from '@/data/resources';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Free Printing Guides and Tools',
  description:
    'Free guides on print methods, where to get something printed, preparing artwork, choosing shirts, paper and poster sizes, plus a print size calculator.',
  alternates: { canonical: '/resources' },
};

export default function ResourcesPage() {
  const tool = RESOURCE_TOOLS[0];

  return (
    <>
      <NavbarShell />

      <section className="bg-ink text-paper pt-32 md:pt-40 pb-14 md:pb-20">
        <div className="max-w-[1400px] mx-auto px-6">
          <Breadcrumbs items={[{ name: 'Resources', href: '/resources' }]} />
          <h1 className="display text-[14vw] md:text-[8vw] xl:text-[128px]">Learn to print</h1>
          <p className="text-base md:text-xl text-paper/75 max-w-xl leading-relaxed mt-8">
            Free guides for anyone getting something printed. Print methods, where to print, artwork, and sizing, in
            plain language.
          </p>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="max-w-[1400px] mx-auto px-6">
          <h2 className="eyebrow text-mid mb-6">Guides</h2>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-ink border border-ink">
            {GUIDES.map((g) => (
              <li key={g.slug} className="bg-paper">
                <Link
                  href={`/resources/${g.slug}`}
                  className="group flex flex-col h-full min-h-[220px] p-6 md:p-8 hover:bg-ink hover:text-paper transition-colors"
                >
                  <span className="eyebrow text-mid group-hover:text-paper/60 mb-4">
                    {g.category} · {g.readMinutes} min read
                  </span>
                  <span className="font-display font-black uppercase text-2xl md:text-3xl tracking-tight leading-none mb-3">
                    {g.title}
                  </span>
                  <span className="text-sm text-mid group-hover:text-paper/70 leading-relaxed">{g.summary}</span>
                  <span className="mt-auto pt-6 inline-flex items-center gap-2 text-sm font-bold">
                    Read guide
                    <ArrowRight size={16} strokeWidth={2.25} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <h2 className="eyebrow text-mid mt-14 mb-6">Tools</h2>
          <Link
            href={`/resources/${tool.slug}`}
            className="group flex flex-col md:flex-row md:items-center gap-5 md:gap-8 rounded-xl bg-ink text-paper p-6 md:p-8"
          >
            <span className="w-14 h-14 shrink-0 rounded-full border border-paper/40 flex items-center justify-center">
              <Ruler size={22} aria-hidden="true" />
            </span>
            <span className="flex-1">
              <span className="block font-display font-black uppercase text-2xl md:text-3xl tracking-tight leading-none mb-2">
                {tool.title}
              </span>
              <span className="block text-sm text-paper/70">{tool.summary}</span>
            </span>
            <span className="inline-flex items-center gap-2 text-sm font-bold">
              Open calculator
              <ArrowRight size={16} strokeWidth={2.25} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </Link>

          <div className="mt-14 rounded-xl border border-border p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <h2 className="font-display font-black uppercase text-2xl tracking-tight mb-1">Rather have us handle it?</h2>
              <p className="text-mid">Tell us what you need and we will recommend the method, the blank, and the price.</p>
            </div>
            <Link href="/custom" className="btn-primary font-bold shrink-0">
              Get started
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
