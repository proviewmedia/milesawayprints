'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowRight, Check, FileUp, PenTool } from 'lucide-react';
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

/**
 * What the customer picked. Kept as the `?start=` URL value:
 *   prints  -> Prints, how-to-make not chosen yet
 *   artwork -> Prints, print my file or photo
 *   map     -> Prints, design one for me
 *   <product slug> -> that product's free quote
 */
export type Start = 'prints' | 'map' | 'artwork' | ProductSlug;

interface Props {
  initialStart: Start | null;
  initialType: CustomPrintType;
  mapTypes: CustomPrintTypeConfig[];
  mapPricing: CustomPrintPricing;
  exampleImages: Partial<Record<CustomPrintType, string>>;
}

const isPrints = (s: Start | null) => s === 'prints' || s === 'map' || s === 'artwork';

export default function OrderStart({ initialStart, initialType, mapTypes, mapPricing, exampleImages }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [start, setStart] = useState<Start | null>(initialStart);
  const [bulkDetails, setBulkDetails] = useState('');
  const step2 = useRef<HTMLDivElement>(null);

  const fileFrom = fromPrice(ARTWORK_PRINT_PRICES);
  const designFrom = Math.min(...mapTypes.map((t) => fromPrice(mapPricing[t.type] ?? { x: 99900 })));
  const printsFrom = Math.min(fileFrom, designFrom);

  const choose = (next: Start, details = '', scroll = true) => {
    setStart(next);
    setBulkDetails(details);
    // Keep the choice in the URL so back, refresh, and shared links work.
    router.replace(`${pathname}?start=${next}`, { scroll: false });
    if (scroll) requestAnimationFrame(() => step2.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const bulkQuote = (details: string) => choose('posters', details);
  const quoteProduct = QUOTE_PRODUCTS.find((p) => p.slug === start);
  const isQuote = !!start && !isPrints(start);

  const tileClass = (active: boolean) =>
    `group text-left flex flex-col justify-between gap-6 min-h-[150px] md:min-h-[170px] p-5 md:p-6 border-2 transition-colors ${
      active ? 'bg-ink text-paper border-ink' : 'border-ink/15 hover:border-ink'
    }`;

  const howOption = (key: 'artwork' | 'map', Icon: typeof FileUp, title: string, desc: string, from: number) => {
    const active = start === key;
    return (
      <button
        type="button"
        role="radio"
        aria-checked={active}
        onClick={() => choose(key, '', false)}
        className={`text-left flex items-start gap-4 p-5 border-2 transition-colors ${
          active ? 'border-ink bg-ink text-paper' : 'border-ink/15 hover:border-ink'
        }`}
      >
        <Icon size={22} strokeWidth={1.75} className="shrink-0 mt-0.5" aria-hidden="true" />
        <span className="flex-1">
          <span className="flex items-baseline justify-between gap-3">
            <span className="font-bold text-[16px]">{title}</span>
            <span className={`text-[13px] font-bold shrink-0 ${active ? 'text-paper/80' : 'text-ink'}`}>From ${from}</span>
          </span>
          <span className={`block text-[13px] mt-1 leading-snug ${active ? 'text-paper/70' : 'text-mid'}`}>{desc}</span>
        </span>
      </button>
    );
  };

  return (
    <>
      {/* Step 1: one choice, every product equal */}
      <section className="py-12 md:py-16">
        <div className="max-w-[1400px] mx-auto px-6">
          <h2 className="display text-4xl md:text-6xl mb-3">What are we making?</h2>
          <p className="text-mid mb-8 max-w-2xl">
            Prints order online with set prices. Everything else gets a free quote. One piece or hundreds.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => choose('prints')}
              aria-pressed={isPrints(start)}
              className={`${tileClass(isPrints(start))} col-span-2 lg:col-span-1`}
            >
              <div className="flex items-start justify-between">
                <ProductIcon icon="frame" size={24} />
                {isPrints(start) && <Check size={20} strokeWidth={2.25} aria-hidden="true" />}
              </div>
              <div>
                <h3 className="font-bold text-[17px] leading-tight">Prints</h3>
                <p className={`text-[13px] mt-1 leading-snug ${isPrints(start) ? 'text-paper/70' : 'text-mid'}`}>
                  Photos, art, posters, and custom designs
                </p>
                <p className="text-[13px] font-bold mt-3">Order online · from ${printsFrom}</p>
              </div>
            </button>

            {QUOTE_PRODUCTS.map((p) => {
              const active = start === p.slug;
              return (
                <button
                  key={p.slug}
                  type="button"
                  onClick={() => choose(p.slug)}
                  aria-pressed={active}
                  className={tileClass(active)}
                >
                  <div className="flex items-start justify-between">
                    <ProductIcon icon={p.icon} size={24} />
                    {active && <Check size={20} strokeWidth={2.25} aria-hidden="true" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-[17px] leading-tight">{p.slug === 'other' ? 'Something else' : p.name}</h3>
                    <p className={`text-[13px] mt-1 leading-snug ${active ? 'text-paper/70' : 'text-mid'}`}>{p.examples}</p>
                    <p className={`text-[13px] font-bold mt-3 ${active ? 'text-paper' : 'text-mid'}`}>Free quote</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Step 2: the options for what they picked */}
      <section ref={step2} className="border-t border-ink scroll-mt-28">
        <div className="max-w-[1400px] mx-auto px-6 py-12 md:py-16">
          {!start && (
            <p className="flex items-center gap-2 text-mid">
              <ArrowRight size={16} className="-rotate-90" aria-hidden="true" />
              Pick what you want made to see your options.
            </p>
          )}

          {isPrints(start) && (
            <>
              <h2 className="display text-3xl md:text-5xl mb-6">How do you want it made?</h2>
              <div className="grid md:grid-cols-2 gap-3 max-w-4xl" role="radiogroup" aria-label="How do you want it made?">
                {howOption('artwork', FileUp, 'Print my photo or file', 'Upload a photo, artwork, or design and pick a size.', fileFrom)}
                {howOption(
                  'map',
                  PenTool,
                  'Design one for me',
                  'A print of your golf course, race, airport, city, or stadium, drawn by us.',
                  designFrom,
                )}
              </div>
              <p className="text-[13px] text-mid mt-4">
                Want something already made?{' '}
                <Link href="/shop" className="text-ink font-medium underline underline-offset-2">
                  Browse the print shop
                </Link>
              </p>

              {start === 'artwork' && (
                <div className="mt-12">
                  <ArtworkPrintBuilder onBulkQuote={bulkQuote} />
                </div>
              )}
              {start === 'map' && (
                <div className="mt-12">
                  <CustomPrintBuilder
                    types={mapTypes}
                    pricing={mapPricing}
                    exampleImages={exampleImages}
                    initialType={initialType}
                    onBulkQuote={bulkQuote}
                  />
                </div>
              )}
            </>
          )}

          {isQuote && (
            <>
              <h2 className="display text-3xl md:text-5xl mb-2">
                {quoteProduct
                  ? `Free quote: ${quoteProduct.slug === 'other' ? 'something else' : quoteProduct.name}`
                  : 'Free quote: bulk prints'}
              </h2>
              <p className="text-mid mb-8 max-w-2xl">
                Tell us what you need. We reply with a price and a proof within 1 to 2 business days, and nothing is
                printed until you approve it.
              </p>
              <div className="grid lg:grid-cols-[1fr_300px] gap-10 items-start">
                <QuoteForm key={`${start}-${bulkDetails}`} initialProduct={start as ProductSlug} initialDetails={bulkDetails} />
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
