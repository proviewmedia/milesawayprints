'use client';

import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import { Bookmark } from 'lucide-react';
import WallFrame from './WallFrame';
import PrintPreview from './PrintPreview';
import { DesignSummary, DEFAULT_DIGITAL_PRICE_CENTS } from '@/data/shop';
import { PRINT_CONFIGS } from '@/data/prints';

interface Props {
  design: DesignSummary;
  onQuickShop?: (design: DesignSummary) => void;
  priority?: boolean;
}

const FAV_KEY = 'map-favs-v1';

export default function DesignCard({ design }: Props) {
  const [fav, setFav] = useState(false);

  const toggleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFav((f) => {
      const next = !f;
      try {
        const raw = localStorage.getItem(FAV_KEY);
        const arr: string[] = raw ? JSON.parse(raw) : [];
        const updated = next
          ? Array.from(new Set([...arr, design.slug]))
          : arr.filter((s) => s !== design.slug);
        localStorage.setItem(FAV_KEY, JSON.stringify(updated));
      } catch {}
      return next;
    });
  };

  // Cheapest of digital or smallest physical for "From $X"
  const digital = (design.digital_price_cents ?? DEFAULT_DIGITAL_PRICE_CENTS) / 100;
  const physicalPrices = Object.values(design.printful_prices ?? {}).map((c) => c / 100);
  const cheapestPhysical = physicalPrices.length ? Math.min(...physicalPrices) : Infinity;
  const fromPrice = Math.min(digital, cheapestPhysical);

  const typeLabel = PRINT_CONFIGS[design.type]?.detailsLabel ?? '';

  return (
    <Link href={`/shop/${design.slug}`} className="group block">
      {/* Off-white tile housing the frame/image */}
      <div className="relative bg-soft aspect-[4/5] flex items-center justify-center p-8 md:p-10 overflow-hidden">
        {design.image_url ? (
          <Image
            src={design.image_url}
            alt={`${design.name} — ${design.location}`}
            width={600}
            height={800}
            className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
            unoptimized
          />
        ) : (
          <div className="w-full transition-transform duration-500 group-hover:scale-[1.02]">
            <WallFrame compact>
              <PrintPreview type={design.type} values={design.values} />
            </WallFrame>
          </div>
        )}
      </div>

      {/* Caption */}
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[15px] text-ink truncate">{design.name}</div>
          <div className="text-[13px] text-mid mt-0.5 truncate">{typeLabel}</div>
          <div className="text-[13px] text-ink mt-1.5">
            <span className="text-mid">From</span> ${fromPrice}
          </div>
        </div>
        <button
          onClick={toggleFav}
          aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
          className="flex-shrink-0 w-8 h-8 -mr-1 flex items-center justify-center hover:opacity-70 transition-opacity"
        >
          <Bookmark
            size={16}
            strokeWidth={1.75}
            className="text-ink"
            fill={fav ? 'currentColor' : 'none'}
          />
        </button>
      </div>
    </Link>
  );
}
