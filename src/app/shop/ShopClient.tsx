'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Sparkles, ArrowRight, SlidersHorizontal } from 'lucide-react';
import DesignCard from '@/components/DesignCard';
import QuickShopModal from '@/components/QuickShopModal';
import WallFrame from '@/components/WallFrame';
import PrintPreview from '@/components/PrintPreview';
import { Collection, DesignSummary } from '@/data/shop';
import { PRINT_CONFIGS, PrintType } from '@/data/prints';

interface Props {
  designs: DesignSummary[];
  collections: Collection[];
}

type FilterCategory = 'all' | PrintType;
type SortOption = 'featured' | 'name-asc' | 'name-desc';

const CATEGORIES: { value: FilterCategory; label: string }[] = [
  { value: 'all', label: 'All Prints' },
  { value: 'golf', label: 'Golf' },
  { value: 'stadium', label: 'Stadium' },
  { value: 'airport', label: 'Airport' },
  { value: 'marathon', label: 'Marathon' },
  { value: 'city', label: 'City' },
];

export default function ShopClient({ designs, collections }: Props) {
  const [category, setCategory] = useState<FilterCategory>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortOption>('featured');
  const [quickShopDesign, setQuickShopDesign] = useState<DesignSummary | null>(null);

  const filtered = useMemo(() => {
    let list = designs;
    if (category !== 'all') list = list.filter((d) => d.type === category);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.location.toLowerCase().includes(q) ||
          (d.description?.toLowerCase().includes(q) ?? false) ||
          (d.tags?.some((t) => t.toLowerCase().includes(q)) ?? false),
      );
    }
    if (sort === 'name-asc') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'name-desc') list = [...list].sort((a, b) => b.name.localeCompare(a.name));
    return list;
  }, [designs, category, query, sort]);

  const featured = designs.slice(0, 3);

  return (
    <>
      {/* Shop hero */}
      <section className="pt-28 pb-10 md:pt-36 md:pb-14 bg-gradient-to-b from-soft to-white">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary-light text-primary px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-5">
                <Sparkles size={14} /> Ready to ship
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-ink leading-[1.05] mb-4">
                Shop the
                <br />
                <span className="text-primary">full collection.</span>
              </h1>
              <p className="text-lg text-mid max-w-lg leading-relaxed mb-6">
                Every golf course, stadium, airport, marathon, and city we&apos;ve designed — {designs.length} prints ready to order today. Pick digital or physical, your size, and done.
              </p>
              <div className="flex gap-3">
                <a href="#grid" className="btn-primary">
                  Browse All <ArrowRight size={16} />
                </a>
                <Link href="/prints/golf" className="btn-secondary">
                  Create Custom
                </Link>
              </div>
            </div>
            <div className="hidden md:grid grid-cols-3 gap-3">
              {featured.map((d, i) => (
                <Link
                  key={d.slug}
                  href={`/shop/${d.slug}`}
                  className="group"
                  style={{ paddingTop: `${i * 32}px` }}
                >
                  <WallFrame compact interactive>
                    <PrintPreview type={d.type} values={d.values} />
                  </WallFrame>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Collections */}
      {collections.length > 0 && (
        <section className="py-8 md:py-14">
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="mb-8">
              <div className="section-label">Curated</div>
              <h2 className="section-title">Shop by collection.</h2>
            </div>
            <div className="space-y-10">
              {collections.map((col) => (
                <CollectionRow
                  key={col.slug}
                  collection={col}
                  onQuickShop={(d) => setQuickShopDesign(d)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main grid with sticky filter bar */}
      <section id="grid" className="pt-8 pb-24 bg-soft">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="sticky top-[64px] z-30 -mx-6 px-6 py-4 bg-soft/95 backdrop-blur-lg border-b border-border mb-8">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide flex-1 min-w-0">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setCategory(c.value)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                      category === c.value
                        ? 'bg-ink text-white'
                        : 'bg-white text-mid hover:text-ink border border-border'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search locations…"
                    className="bg-white border border-border rounded-full pl-9 pr-4 py-2 text-xs font-medium placeholder:text-light-mid w-44 focus:w-60 focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  className="bg-white border border-border rounded-full px-3 py-2 text-xs font-semibold text-ink focus:outline-none focus:border-primary"
                >
                  <option value="featured">Featured</option>
                  <option value="name-asc">Name A–Z</option>
                  <option value="name-desc">Name Z–A</option>
                </select>
              </div>
            </div>
          </div>

          {/* Result count */}
          <div className="flex items-center justify-between mb-6 px-1">
            <p className="text-sm text-mid">
              <span className="font-semibold text-ink">{filtered.length}</span>{' '}
              {filtered.length === 1 ? 'design' : 'designs'}
              {category !== 'all' && ` in ${PRINT_CONFIGS[category].detailsLabel}`}
              {query && ` matching "${query}"`}
            </p>
            {(category !== 'all' || query) && (
              <button
                onClick={() => {
                  setCategory('all');
                  setQuery('');
                }}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-border">
              <div className="w-14 h-14 rounded-full bg-soft flex items-center justify-center mx-auto mb-4">
                <SlidersHorizontal size={20} className="text-mid" />
              </div>
              <h3 className="font-bold text-ink mb-2">No designs match those filters</h3>
              <p className="text-sm text-mid mb-5 max-w-sm mx-auto">
                Try a different category, or — if you know the location you want — create a custom print.
              </p>
              <Link href="/prints/golf" className="btn-primary">
                Create Custom <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-7">
              {filtered.map((d) => (
                <DesignCard
                  key={d.slug}
                  design={d}
                  onQuickShop={setQuickShopDesign}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-ink text-white">
        <div className="max-w-[1280px] mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Don&apos;t see your location?
          </h2>
          <p className="text-white/70 mb-8 max-w-md mx-auto">
            Every print is custom. Tell us where and we&apos;ll design it from scratch.
          </p>
          <Link
            href="/prints/golf"
            className="inline-flex items-center gap-2 bg-white text-ink px-8 py-4 rounded-full font-semibold text-sm hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(255,255,255,0.2)] transition-all"
          >
            Start Custom Order <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <QuickShopModal design={quickShopDesign} onClose={() => setQuickShopDesign(null)} />
    </>
  );
}

function CollectionRow({
  collection,
  onQuickShop,
}: {
  collection: Collection;
  onQuickShop: (d: DesignSummary) => void;
}) {
  if (collection.designs.length === 0) return null;
  return (
    <div>
      <div className="flex items-end justify-between mb-4">
        <div>
          <h3 className="text-xl md:text-2xl font-extrabold text-ink tracking-tight">
            {collection.name}
          </h3>
          {collection.description && (
            <p className="text-sm text-mid mt-1 max-w-lg">{collection.description}</p>
          )}
        </div>
        <a
          href="#grid"
          className="hidden md:inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          See all <ArrowRight size={12} />
        </a>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-3 -mx-6 px-6 scrollbar-hide">
        {collection.designs.map((d) => (
          <div key={d.slug} className="flex-shrink-0 w-60">
            <DesignCard design={d} onQuickShop={onQuickShop} />
          </div>
        ))}
      </div>
    </div>
  );
}
