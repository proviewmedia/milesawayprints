'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowRight, ArrowUpRight, Check, FileUp, Map as MapIcon } from 'lucide-react';
import ProductIcon from '@/components/ProductIcon';
import { QUOTE_PRODUCTS, type ProductSlug } from '@/data/custom';
import {
  ARTWORK_PRINT_PRICES,
  fromPrice,
  type CustomPrintPricing,
  type CustomPrintType,
  type CustomPrintTypeConfig,
} from '@/data/custom-prints';
import CustomPrintBuilder from './CustomPrintBuilder';
import ArtworkPrintBuilder from './ArtworkPrintBuilder';
import QuoteForm from './QuoteForm';

/** What the customer picked in "What are we making?". */
export type Start = 'map' | 'artwork' | ProductSlug;

interface Props {
  initialStart: Start | null;
  initialType: CustomPrintType;
  mapTypes: CustomPrintTypeConfig[];
  mapPricing: CustomPrintPricing;
  exampleImages: Partial<Record<CustomPrintType, string>>;
}

export default function OrderStart({ initialStart, initialType, mapTypes, mapPricing, exampleImages }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [start, setStart] = useState<Start | null>(initialStart);
  const [bulkDetails, setBulkDetails] = useState('');
  const step2 = useRef<HTMLDivElement>(null);

  const mapFrom = Math.min(
    ...mapTypes.map((t) => fromPrice(mapPricing[t.type] ?? { x: 99900 })),
  );
  const artworkFrom = fromPrice(ARTWORK_PRINT_PRICES);

  const choose = (next: Start, details = '') => {
    setStart(next);
    setBulkDetails(details);
    // Keep the choice in the URL so back, refresh, and shared links work.
    router.replace(`${pathname}?start=${next}`, { scroll: false });
    requestAnimationFrame(() => step2.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const bulkQuote = (details: string) => choose('posters', details);
  const isQuote = start && start !== 'map' && start !== 'artwork';
  const quoteProduct = QUOTE_PRODUCTS.find((p) => p.slug === start);

  const printTile = (
    key: 'map' | 'artwork',
    Icon: typeof MapIcon,
    title: string,
    desc: string,
    from: number,
  ) => {
    const active = start === key;
    return (
      <button
        type="button"
        onClick={() => choose(key)}
        aria-pressed={active}
        className={`group text-left flex flex-col justify-between min-h-[180px] p-6 border-2 transition-colors ${
          active ? 'bg-ink text-paper border-ink' : 'border-ink hover:bg-soft'
        }`}
      >
        <div className="flex items-start justify-between">
          <Icon size={26} strokeWidth={1.75} aria-hidden="true" />
          {active ? (
            <Check size={22} strokeWidth={2.25} aria-hidden="true" />
          ) : (
            <span className="text-[13px] font-bold">From ${from}</span>
          )}
        </div>
        <div>
          <h3 className="font-display font-black uppercase text-2xl tracking-tight leading-none">{title}</h3>
          <p className={`text-sm mt-2 ${active ? 'text-paper/70' : 'text-mid'}`}>{desc}</p>
        </div>
      </button>
    );
  };

  return (
    <>
      {/* What are we making? */}
      <section className="py-12 md:py-16">
        <div className="max-w-[1400px] mx-auto px-6">
          <h2 className="display text-4xl md:text-6xl mb-10">What are we making?</h2>

          <div className="mb-10">
            <div className="flex items-baseline justify-between gap-4 flex-wrap mb-4">
              <h3 className="eyebrow text-ink">Prints</h3>
              <p className="text-[13px] text-mid">See the price, pick a size, and order online.</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {printTile('map', MapIcon, 'Map art print', 'Golf courses, marathons, airports, cities, stadiums, and more. We design it.', mapFrom)}
              {printTile('artwork', FileUp, 'Your artwork or photo', 'Upload your own photo or design and we print it.', artworkFrom)}
              <Link
                href="/shop"
                className="group flex flex-col justify-between min-h-[180px] p-6 border-2 border-ink hover:bg-soft transition-colors"
              >
                <div className="flex items-start justify-between">
                  <ProductIcon icon="frame" size={26} />
                  <ArrowUpRight size={22} strokeWidth={2} className="opacity-40 group-hover:opacity-100" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-display font-black uppercase text-2xl tracking-tight leading-none">Ready-made designs</h3>
                  <p className="text-sm mt-2 text-mid">Browse finished prints in the print shop.</p>
                </div>
              </Link>
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between gap-4 flex-wrap mb-4">
              <h3 className="eyebrow text-ink">Everything else</h3>
              <p className="text-[13px] text-mid">Free quote and proof. No commitment, one piece or hundreds.</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {QUOTE_PRODUCTS.map((p) => {
                const active = start === p.slug;
                return (
                  <button
                    key={p.slug}
                    type="button"
                    onClick={() => choose(p.slug)}
                    aria-pressed={active}
                    className={`text-left flex flex-col gap-3 p-4 md:p-5 border-2 transition-colors ${
                      active ? 'bg-ink text-paper border-ink' : 'border-ink/15 hover:border-ink'
                    }`}
                  >
                    <ProductIcon icon={p.icon} size={22} />
                    <span>
                      <span className="block font-bold text-[15px] leading-tight">
                        {p.slug === 'other' ? 'Something else' : p.name}
                      </span>
                      <span className={`block text-[13px] mt-1 leading-snug ${active ? 'text-paper/70' : 'text-mid'}`}>
                        {p.examples}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Step 2: the options for what they picked */}
      <section ref={step2} className="border-t border-ink scroll-mt-28">
        <div className="max-w-[1400px] mx-auto px-6 py-12 md:py-16">
          {!start && (
            <p className="flex items-center gap-2 text-mid">
              <ArrowRight size={16} className="-rotate-90" aria-hidden="true" />
              Pick one above to see sizes and prices, or to start a free quote.
            </p>
          )}

          {start === 'map' && (
            <>
              <h2 className="display text-3xl md:text-5xl mb-8">Your map print</h2>
              <CustomPrintBuilder
                types={mapTypes}
                pricing={mapPricing}
                exampleImages={exampleImages}
                initialType={initialType}
                onBulkQuote={bulkQuote}
              />
            </>
          )}

          {start === 'artwork' && (
            <>
              <h2 className="display text-3xl md:text-5xl mb-8">Your artwork, printed</h2>
              <ArtworkPrintBuilder onBulkQuote={bulkQuote} />
            </>
          )}

          {isQuote && (
            <>
              <h2 className="display text-3xl md:text-5xl mb-2">
                {quoteProduct ? `Free quote: ${quoteProduct.slug === 'other' ? 'something else' : quoteProduct.name}` : 'Free quote: bulk prints'}
              </h2>
              <p className="text-mid mb-8 max-w-2xl">
                Tell us what you need. We reply with a price and a proof within 1 to 2 business days, and nothing is
                printed until you approve it.
              </p>
              <div className="grid lg:grid-cols-[1fr_300px] gap-10 items-start">
                <QuoteForm
                  key={`${start}-${bulkDetails}`}
                  initialProduct={start as ProductSlug}
                  initialDetails={bulkDetails}
                />
                <aside className="space-y-4 lg:sticky lg:top-32">
                  <div className="border-2 border-ink p-5">
                    <h3 className="text-[15px] font-bold text-ink mb-2">Not sure what you need?</h3>
                    <p className="text-[13px] text-mid leading-relaxed">
                      Pick the closest option and describe the rest. We will recommend the right product and print
                      method.
                    </p>
                  </div>
                  <div className="border-2 border-ink p-5">
                    <h3 className="text-[15px] font-bold text-ink mb-2">Questions first?</h3>
                    <p className="text-[13px] text-mid leading-relaxed mb-3">
                      See the process, print methods, and artwork tips.
                    </p>
                    <Link href="/how-it-works" className="text-sm font-bold text-ink underline underline-offset-4">
                      How it works
                    </Link>
                  </div>
                  <div className="border-2 border-ink p-5">
                    <h3 className="text-[15px] font-bold text-ink mb-2">Prefer email?</h3>
                    <a
                      href="mailto:milesawayprintsllc@gmail.com"
                      className="text-[13px] text-ink underline underline-offset-2 break-all"
                    >
                      milesawayprintsllc@gmail.com
                    </a>
                  </div>
                </aside>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
