'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search as SearchIcon, X, ArrowRight } from 'lucide-react';
import { useSearch } from '@/contexts/SearchContext';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import { SITE_PAGES, SitePage } from '@/data/site-pages';
import { PRINT_CONFIGS, PrintType } from '@/data/prints';

interface ProductHit {
  slug: string;
  name: string;
  location: string | null;
  description: string | null;
  tags: string[] | null;
  type: PrintType;
  image_url: string | null;
}

interface MarathonHit {
  slug: string;
  city: string;
  thumbnail_path: string | null;
}

const PRODUCT_LIMIT = 6;
const PAGE_LIMIT = 4;
const MARATHON_LIMIT = 4;

export default function SearchOverlay() {
  const { isOpen, close } = useSearch();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<ProductHit[]>([]);
  const [marathons, setMarathons] = useState<MarathonHit[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Load gallery + marathon catalogs lazily on first open
  useEffect(() => {
    if (!isOpen || loaded) return;
    const supabase = createSupabaseBrowserClient();
    Promise.all([
      supabase
        .from('gallery_items')
        .select('slug, name, location, description, tags, print_type_slug, image_url, featured, sort_order')
        .eq('active', true)
        .order('featured', { ascending: false })
        .order('sort_order', { ascending: true }),
      supabase
        .from('marathons')
        .select('slug, city, thumbnail_path')
        .eq('active', true)
        .order('sort_order', { ascending: true }),
    ]).then(([prodRes, marRes]) => {
      const rows = (prodRes.data ?? []) as Array<ProductHit & { print_type_slug: string; featured: boolean; sort_order: number }>;
      setProducts(
        rows.map((r) => ({
          slug: r.slug,
          name: r.name,
          location: r.location,
          description: r.description,
          tags: r.tags,
          type: r.print_type_slug as PrintType,
          image_url: r.image_url,
        })),
      );
      const marRows = (marRes.data ?? []) as MarathonHit[];
      setMarathons(marRows);
      setLoaded(true);
    });
  }, [isOpen, loaded]);

  // Body lock + autofocus when open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setTimeout(() => inputRef.current?.focus(), 30);
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setActiveIndex(0);
    }
  }, [isOpen]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let prodHits: ProductHit[];
    let pageHits: SitePage[];
    let marHits: MarathonHit[];

    if (!q) {
      prodHits = products.slice(0, PRODUCT_LIMIT);
      pageHits = SITE_PAGES.slice(0, PAGE_LIMIT);
      marHits = marathons.slice(0, MARATHON_LIMIT);
    } else {
      prodHits = products
        .filter((p) => {
          const cat = PRINT_CONFIGS[p.type]?.detailsLabel.toLowerCase() ?? '';
          return (
            p.name.toLowerCase().includes(q) ||
            (p.location?.toLowerCase().includes(q) ?? false) ||
            (p.description?.toLowerCase().includes(q) ?? false) ||
            (p.tags ?? []).some((t) => t.toLowerCase().includes(q)) ||
            cat.includes(q)
          );
        })
        .slice(0, PRODUCT_LIMIT);

      pageHits = SITE_PAGES.filter((page) => {
        const hay = `${page.title} ${page.keywords ?? ''} ${page.description ?? ''}`.toLowerCase();
        return hay.includes(q);
      }).slice(0, PAGE_LIMIT);

      marHits = marathons
        .filter((m) => {
          const hay = `${m.city} marathon`.toLowerCase();
          return hay.includes(q);
        })
        .slice(0, MARATHON_LIMIT);
    }

    return { prodHits, pageHits, marHits };
  }, [products, marathons, query]);

  // Flat list for keyboard nav — order: marathons → products → pages
  const flat = useMemo(() => {
    const items: Array<{ kind: 'marathon' | 'product' | 'page'; href: string }> = [];
    filtered.marHits.forEach((m) => items.push({ kind: 'marathon', href: `/marathons/${m.slug}` }));
    filtered.prodHits.forEach((p) => items.push({ kind: 'product', href: `/shop/${p.slug}` }));
    filtered.pageHits.forEach((p) => items.push({ kind: 'page', href: p.href }));
    return items;
  }, [filtered]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(flat.length - 1, 0)));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const target = flat[activeIndex];
      if (target) {
        router.push(target.href);
        close();
      }
    }
  };

  if (!isOpen) return null;

  const empty =
    filtered.prodHits.length === 0 &&
    filtered.pageHits.length === 0 &&
    filtered.marHits.length === 0;

  return (
    <div className="fixed inset-0 z-[100] bg-ink/40 flex items-start justify-center px-4 pt-20 md:pt-32" onClick={close}>
      <div
        className="w-full max-w-[640px] bg-paper rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[70vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <SearchIcon size={18} strokeWidth={1.75} className="text-mid flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search products and pages…"
            className="flex-1 bg-transparent text-base text-ink placeholder:text-light-mid focus:outline-none"
          />
          <kbd className="hidden md:inline text-[11px] text-mid border border-border rounded px-1.5 py-0.5">Esc</kbd>
          <button
            onClick={close}
            aria-label="Close search"
            className="md:hidden w-8 h-8 rounded-full hover:bg-soft flex items-center justify-center"
          >
            <X size={16} strokeWidth={1.75} className="text-ink" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {empty && (
            <p className="px-5 py-10 text-center text-sm text-mid">
              No matches for &ldquo;{query}&rdquo;.
            </p>
          )}

          {filtered.marHits.length > 0 && (
            <div>
              <div className="px-5 pt-4 pb-2 text-[11px] uppercase tracking-wider text-mid">
                Custom marathons
              </div>
              {filtered.marHits.map((m, i) => (
                <Link
                  key={`m-${m.slug}`}
                  href={`/marathons/${m.slug}`}
                  onClick={close}
                  className={`flex items-center gap-4 px-5 py-3 transition-colors ${
                    activeIndex === i ? 'bg-soft' : 'hover:bg-soft'
                  }`}
                >
                  <div className="w-12 h-14 flex-shrink-0 bg-soft overflow-hidden">
                    {m.thumbnail_path ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.thumbnail_path}
                        alt={`${m.city} Marathon`}
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-ink truncate">{m.city} Marathon</div>
                    <div className="text-[12px] text-mid truncate">Personalized print</div>
                  </div>
                  <ArrowRight size={14} strokeWidth={1.75} className="text-mid" />
                </Link>
              ))}
            </div>
          )}

          {filtered.prodHits.length > 0 && (
            <div>
              <div className="px-5 pt-4 pb-2 text-[11px] uppercase tracking-wider text-mid">
                Products
              </div>
              {filtered.prodHits.map((p, i) => {
                const idx = filtered.marHits.length + i;
                return (
                <Link
                  key={`p-${p.slug}`}
                  href={`/shop/${p.slug}`}
                  onClick={close}
                  className={`flex items-center gap-4 px-5 py-3 transition-colors ${
                    activeIndex === idx ? 'bg-soft' : 'hover:bg-soft'
                  }`}
                >
                  <div className="w-12 h-14 flex-shrink-0 bg-soft overflow-hidden">
                    {p.image_url ? (
                      <Image
                        src={p.image_url}
                        alt={p.name}
                        width={96}
                        height={120}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-ink truncate">{p.name}</div>
                    <div className="text-[12px] text-mid truncate">
                      {PRINT_CONFIGS[p.type]?.detailsLabel ?? p.type}
                    </div>
                  </div>
                  <ArrowRight size={14} strokeWidth={1.75} className="text-mid" />
                </Link>
                );
              })}
            </div>
          )}

          {filtered.pageHits.length > 0 && (
            <div>
              <div className="px-5 pt-4 pb-2 text-[11px] uppercase tracking-wider text-mid">
                Pages
              </div>
              {filtered.pageHits.map((page, i) => {
                const idx = filtered.marHits.length + filtered.prodHits.length + i;
                return (
                  <Link
                    key={`page-${page.href}`}
                    href={page.href}
                    onClick={close}
                    className={`flex items-center gap-4 px-5 py-3 transition-colors ${
                      activeIndex === idx ? 'bg-soft' : 'hover:bg-soft'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-ink truncate">{page.title}</div>
                      {page.description && (
                        <div className="text-[12px] text-mid truncate">{page.description}</div>
                      )}
                    </div>
                    <ArrowRight size={14} strokeWidth={1.75} className="text-mid" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-5 py-2 border-t border-border text-[11px] text-mid flex items-center gap-4">
          <span className="hidden md:inline">↑↓ to navigate</span>
          <span className="hidden md:inline">↵ to open</span>
          <span className="md:ml-auto">{flat.length} {flat.length === 1 ? 'result' : 'results'}</span>
        </div>
      </div>
    </div>
  );
}
