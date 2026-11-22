'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Search, ArrowRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import DesignCard from '@/components/DesignCard';
import QuickShopModal from '@/components/QuickShopModal';
import { Collection, DesignSummary } from '@/data/shop';
import { PRINT_CONFIGS, PrintType } from '@/data/prints';
import Breadcrumbs from '@/components/Breadcrumbs';

/**
 * Measures the fixed <header> (the navbar) at runtime and returns its
 * current height. The sticky filter bar uses this for its `top` offset
 * so it pins exactly flush against the navbar's bottom — no gap, no
 * overlap — regardless of whether the SiteBanner is visible, the
 * utility bar has content, or the viewport is mobile vs desktop.
 */
function useNavbarHeight(): number {
  const [height, setHeight] = useState(80);
  useEffect(() => {
    const navbar = document.querySelector('header');
    if (!navbar) return;
    const update = () => setHeight(navbar.getBoundingClientRect().height);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(navbar);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);
  return height;
}

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

const VALID_CATEGORIES = new Set(CATEGORIES.map((c) => c.value));

function parseCategory(raw: string | null): FilterCategory {
  if (raw && VALID_CATEGORIES.has(raw as FilterCategory)) return raw as FilterCategory;
  return 'all';
}

export default function ShopClient({ designs, collections }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Initialize category from the ?category= URL param so links from the
  // homepage's "Shop by category" tiles land on a pre-filtered view.
  const [category, setCategory] = useState<FilterCategory>(() =>
    parseCategory(searchParams?.get('category') ?? null),
  );
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortOption>('featured');
  const [quickShopDesign, setQuickShopDesign] = useState<DesignSummary | null>(null);
  const navHeight = useNavbarHeight();

  // Keep state in sync if the user navigates between filters via the URL
  // (e.g. browser back/forward, or another internal link to /shop?category=…).
  useEffect(() => {
    const next = parseCategory(searchParams?.get('category') ?? null);
    setCategory(next);
  }, [searchParams]);

  // Reflect filter changes back into the URL so the active state is
  // shareable + survives reload.
  useEffect(() => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    if (category === 'all') params.delete('category');
    else params.set('category', category);
    const qs = params.toString();
    const target = qs ? `${pathname}?${qs}` : pathname;
    const current = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`;
    if (target !== current) router.replace(target, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

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
      {/* Compact hero — sits flush against the navbar so the filter bar
          can dock immediately under it without an empty band in between. */}
      <section className="bg-ink text-paper pt-32 md:pt-40 pb-12 md:pb-16">
        <div className="max-w-[1400px] mx-auto px-6 grid md:grid-cols-[1fr_auto] gap-8 md:items-end">
          <div>
            <Breadcrumbs items={[{ name: 'Print shop', href: '/shop' }]} />
            <h1 className="display text-[14vw] md:text-[8vw] xl:text-[128px] mb-6">Art prints</h1>
            <p className="text-base md:text-xl text-paper/75 max-w-xl leading-relaxed">
              Golf courses, airports, skylines, cities, marathons, and F1 circuits, designed in house and
              printed to order on archival paper.
            </p>
          </div>
          <Link
            href="/custom?start=map"
            className="group inline-flex items-center justify-between gap-6 border-2 border-paper px-6 py-5 hover:bg-paper hover:text-ink transition-colors md:max-w-xs"
          >
            <span>
              <span className="block font-display font-black uppercase text-xl tracking-tight">Don&apos;t see your place?</span>
              <span className="block text-sm opacity-75 mt-1">Order a custom print of it</span>
            </span>
            <ArrowRight size={20} strokeWidth={2.25} aria-hidden="true" className="flex-shrink-0 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* Collections */}
      {collections.length > 0 && (
        <section className="pt-12 md:pt-16 pb-10 md:pb-14">
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

      {/* Filter bar — text buttons, no pills. Sticky offsets match the
          actual navbar heights so it pins flush against the navbar's
          bottom border (no content bleed-through gap, no overlap).
          Mobile navbar: utility bar 12px padding (empty content) +
            main nav 24px padding + 40px icon buttons + 1px border ≈ 80px.
          Desktop navbar: similar, utility bar shows country/about text. */}
      <section
        id="grid"
        className="border-y border-ink bg-paper sticky z-30"
        style={{ top: `${navHeight}px` }}
      >
        <div className="max-w-[1400px] mx-auto px-6 py-5 md:py-4 flex flex-col md:flex-row md:flex-wrap md:items-center md:justify-between gap-3 md:gap-4">
          {/* Category chips — horizontally scrollable on mobile. The
              right-edge fade signals more chips off-screen so customers
              know to swipe right. */}
          <div className="relative flex-1 min-w-0">
            <div
              role="tablist"
              aria-label="Filter prints by category"
              className="flex gap-1 overflow-x-auto overflow-y-hidden scrollbar-hide touch-pan-x overscroll-x-contain"
            >
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  role="tab"
                  aria-selected={category === c.value}
                  onClick={() => setCategory(c.value)}
                  className={`relative px-4 py-2 rounded-full font-display font-black uppercase text-[13px] tracking-tight whitespace-nowrap transition-colors ${
                    category === c.value ? 'bg-ink text-paper' : 'text-ink/60 hover:text-ink'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            {/* Right-edge fade indicator: only visible on mobile (md:hidden)
                since on desktop the full chip row fits and a fade would
                imply hidden content that doesn't exist. */}
            <div
              aria-hidden
              className="md:hidden pointer-events-none absolute top-0 right-0 bottom-0 w-12 bg-gradient-to-l from-paper to-transparent"
            />
          </div>

          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <div className="relative flex-1 md:flex-none">
              <Search size={14} strokeWidth={1.75} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-mid" />
              <input
                type="search"
                aria-label="Search locations"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search locations"
                className="bg-paper border-2 border-ink/15 rounded-full pl-9 pr-4 py-2 text-sm placeholder:text-light-mid w-full md:w-48 md:focus:w-60 focus:outline-none focus:border-ink transition-all"
              />
            </div>

            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="appearance-none bg-paper border-2 border-ink/15 rounded-full pl-4 pr-9 py-2 text-sm font-bold text-ink focus:outline-none focus:border-ink cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="name-asc">A–Z</option>
                <option value="name-desc">Z–A</option>
              </select>
              <ChevronDown
                size={14}
                strokeWidth={1.75}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-mid pointer-events-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12 md:py-16">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <p className="text-sm text-mid">
              <span className="text-ink font-bold">{filtered.length}</span>{' '}
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
              <h3 className="font-display font-black uppercase text-2xl tracking-tight text-ink mb-2">No designs match</h3>
              <p className="text-sm text-mid mb-6">
                Try a different category, or{' '}
                <Link href="/custom?start=map" className="text-ink underline underline-offset-2">
                  order a custom print
                </Link>{' '}
                of the place you are looking for.
              </p>
              <button
                onClick={() => {
                  setCategory('all');
                  setQuery('');
                }}
                className="btn-secondary"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-12">
              {filtered.map((d) => (
                <DesignCard key={d.slug} design={d} onQuickShop={setQuickShopDesign} />
              ))}
            </div>
          )}
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
          <h2 className="display text-3xl md:text-5xl text-ink">
            {collection.name}
          </h2>
          {collection.description && (
            <p className="text-sm text-mid mt-1 max-w-lg">{collection.description}</p>
          )}
        </div>
        <a href="#grid" className="hidden md:inline-flex items-center gap-1.5 text-sm font-bold text-ink hover:opacity-70">
          See all <ArrowRight size={15} strokeWidth={2.25} />
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
