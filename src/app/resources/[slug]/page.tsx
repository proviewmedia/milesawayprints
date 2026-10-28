import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import NavbarShell from '@/components/NavbarShell';
import Footer from '@/components/Footer';
import { GUIDES, type GuideBlock } from '@/data/resources';
import { breadcrumbJsonLd, jsonLdScript, SITE_NAME } from '@/lib/seo';

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const guide = GUIDES.find((g) => g.slug === params.slug);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.summary,
    alternates: { canonical: `/resources/${guide.slug}` },
  };
}

function Block({ block }: { block: GuideBlock }) {
  switch (block.type) {
    case 'h2':
      return <h2 className="display text-3xl md:text-5xl mt-14 mb-5">{block.text}</h2>;
    case 'p':
      return <p className="text-[17px] text-ink/85 leading-relaxed mb-5">{block.text}</p>;
    case 'list':
      return (
        <ul className="mb-6 space-y-3">
          {block.items.map((item) => (
            <li key={item} className="flex gap-3 text-[16px] text-ink/85 leading-relaxed">
              <span aria-hidden="true" className="mt-[0.6em] w-1.5 h-1.5 shrink-0 bg-ink" />
              {item}
            </li>
          ))}
        </ul>
      );
    case 'table':
      return (
        <div className="my-8 overflow-x-auto border border-ink rounded-xl">
          <table className="w-full text-left text-sm min-w-[560px]">
            <thead className="bg-ink text-paper">
              <tr>
                {block.head.map((h) => (
                  <th key={h} scope="col" className="px-4 py-3 eyebrow">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row[0]} className="border-t border-border align-top">
                  {row.map((cell, i) => (
                    <td key={i} className={`px-4 py-3 leading-relaxed ${i === 0 ? 'font-bold text-ink' : 'text-mid'}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'callout':
      return (
        <div className="my-8 border-l-4 border-ink bg-soft rounded-r-xl p-5 md:p-6">
          <div className="text-[15px] font-bold text-ink mb-1">{block.title}</div>
          <p className="text-[15px] text-ink/80 leading-relaxed">{block.text}</p>
        </div>
      );
  }
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const index = GUIDES.findIndex((g) => g.slug === params.slug);
  if (index === -1) notFound();
  const guide = GUIDES[index];
  const next = GUIDES[(index + 1) % GUIDES.length];

  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.summary,
    publisher: { '@type': 'Organization', name: SITE_NAME },
  };

  return (
    <>
      <NavbarShell />
      <script {...jsonLdScript(article)} />
      <script
        {...jsonLdScript(
          breadcrumbJsonLd([
            { name: 'Resources', url: '/resources' },
            { name: guide.title, url: `/resources/${guide.slug}` },
          ]),
        )}
      />

      <section className="bg-ink text-paper pt-32 md:pt-40 pb-12 md:pb-16">
        <div className="max-w-[820px] mx-auto px-6">
          <Link href="/resources" className="inline-flex items-center gap-2 text-sm text-paper/60 hover:text-paper mb-8">
            <ArrowLeft size={16} aria-hidden="true" />
            All resources
          </Link>
          <p className="eyebrow text-paper/60 mb-5">
            {guide.category} · {guide.readMinutes} min read
          </p>
          <h1 className="display text-[11vw] md:text-7xl mb-6">{guide.title}</h1>
          <p className="text-base md:text-lg text-paper/75 leading-relaxed">{guide.summary}</p>
        </div>
      </section>

      <article className="py-12 md:py-16">
        <div className="max-w-[820px] mx-auto px-6">
          {guide.blocks.map((b, i) => (
            <Block key={i} block={b} />
          ))}

          <div className="mt-16 grid md:grid-cols-2 gap-4">
            <Link href={`/resources/${next.slug}`} className="group rounded-xl border border-ink p-6 hover:bg-ink hover:text-paper transition-colors">
              <span className="eyebrow text-mid group-hover:text-paper/60">Next guide</span>
              <span className="flex items-center justify-between gap-4 mt-3">
                <span className="font-display font-black uppercase text-xl tracking-tight leading-none">{next.title}</span>
                <ArrowRight size={18} strokeWidth={2.25} aria-hidden="true" />
              </span>
            </Link>
            <div className="rounded-xl bg-ink text-paper p-6">
              <span className="eyebrow text-paper/60">Ready to print?</span>
              <p className="text-sm text-paper/75 mt-3 mb-4">Free quotes, and a proof before anything is printed.</p>
              <Link
                href="/custom"
                className="inline-flex items-center justify-center bg-paper text-ink px-6 py-3 rounded-full font-bold text-sm hover:bg-soft transition-colors"
              >
                Get a free quote
              </Link>
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </>
  );
}
