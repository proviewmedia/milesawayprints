'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, ArrowRight } from 'lucide-react';
import DesignCard from '@/components/DesignCard';
import QuickShopModal from '@/components/QuickShopModal';
import { Collection, DesignSummary } from '@/data/shop';
import { PRINT_CONFIGS, PrintType } from '@/data/prints';

interface Props {
  designs: DesignSummary[];
  collections: Collection[];
}

type FilterCategory = 'all' | PrintType;
type SortOption = 'featured' | 'name-asc' | 'name-desc';

const CATEGORIES: { value: FilterCategory; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'skyline', label: 'Skylines' },
  { value: 'f1', label: 'F1 Circuits' },
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

  return (
    <>
      {/* Centered hero — quiet, no chrome */}
      <section className="pt-32 md:pt-40 pb-10 md:pb-14">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-medium tracking-tight text-ink leading-[1.05] mb-4">
            Shop
          </h1>
          <p className="text-mid text-base md:text-lg">
            {designs.length} prints, ready to ship. Pick digital or physical, choose your size, done.
          </p>
        </div>
      </section>

      {/* Collections */}
      {collections.length > 0 && (
        <section className="pb-10 md:pb-14">
          <div className="max-w-[1400px] mx-auto px-6 space-y-12">
            {collections.map((col) => (
              <CollectionRow
                key={col.slug}
                collection={col}
                onQuickShop={(d) => setQuickShopDesign(d)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Filter bar — text buttons, no pills */}
      <section id="grid" className="border-y border-border bg-paper sticky top-[96px] z-30">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide flex-1 min-w-0">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`relative px-3 py-2 text-sm whitespace-nowrap transition-opacity ${
                  category === c.value
                    ? 'text-ink'
                    : 'text-mid hover:text-ink'
                }`}
              >
                {c.label}
                {category === c.value && (
                  <span className="absolute left-3 right-3 -bottom-[17px] h-px bg-ink" />
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="relative">
              <Search size={14} strokeWidth={1.75} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search locations"
                className="bg-paper border border-border rounded-full pl-9 pr-4 py-2 text-sm placeholder:text-light-mid w-48 focus:w-60 focus:outline-none focus:border-ink transition-all"
              />
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="bg-paper border border-border rounded-full px-4 py-2 text-sm text-ink focus:outline-none focus:border-ink"
            >
              <option value="featured">Featured</option>
              <option value="name-asc">A–Z</option>
              <option value="name-desc">Z–A</option>
            </select>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12 md:py-16">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <p className="text-sm text-mid">
              <span className="text-ink">{filtered.length}</span>{' '}
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
                className="text-sm text-mid hover:text-ink transition-colors underline underline-offset-2"
              >
                Clear filters
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="py-20 text-center max-w-md mx-auto">
              <h3 className="text-xl font-medium text-ink mb-2">No designs match those filters</h3>
              <p className="text-sm text-mid mb-6">
                Try a different category, or create a custom print of your location.
              </p>
              <Link href="/prints/golf" className="btn-primary">
                Create custom
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
              {filtered.map((d) => (
                <DesignCard key={d.slug} design={d} onQuickShop={setQuickShopDesign} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 bg-ink text-paper">
        <div className="max-w-[900px] mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-medium tracking-tight leading-[1.05] mb-5">
            Don&apos;t see your place?
          </h2>
          <p className="text-paper/70 mb-9 max-w-md mx-auto">
            Every print is custom. Tell us where and we&apos;ll design it from scratch.
          </p>
          <Link
            href="/prints/golf"
            className="inline-flex items-center justify-center gap-2 bg-paper text-ink px-7 py-3.5 rounded-full font-medium text-sm hover:bg-soft transition-colors"
          >
            Start custom order
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
      <div className="flex items-end justify-between mb-6">
        <div>
          <h3 className="text-2xl md:text-3xl font-medium text-ink tracking-tight">
            {collection.name}
          </h3>
          {collection.description && (
            <p className="text-sm text-mid mt-1 max-w-lg">{collection.description}</p>
          )}
        </div>
        <a href="#grid" className="hidden md:inline-flex items-center gap-1 text-sm text-ink underline underline-offset-2 hover:opacity-70">
          See all <ArrowRight size={14} strokeWidth={1.75} />
        </a>
      </div>
      <div className="flex gap-6 overflow-x-auto pb-3 -mx-6 px-6 scrollbar-hide">
        {collection.designs.map((d) => (
          <div key={d.slug} className="flex-shrink-0 w-64">
            <DesignCard design={d} onQuickShop={onQuickShop} />
          </div>
        ))}
      </div>
    </div>
  );
}
