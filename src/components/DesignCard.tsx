'use client';

import Link from 'next/link';
import Image from 'next/image';
import WallFrame from './WallFrame';
import PrintPreview from './PrintPreview';
import { DesignSummary, DEFAULT_DIGITAL_PRICE_CENTS } from '@/data/shop';
import { PRINT_CONFIGS } from '@/data/prints';

interface Props {
  design: DesignSummary;
  onQuickShop?: (design: DesignSummary) => void;
  priority?: boolean;
}

export default function DesignCard({ design }: Props) {
  // Cheapest of digital or smallest physical for "From $X"
  const digital = (design.digital_price_cents ?? DEFAULT_DIGITAL_PRICE_CENTS) / 100;
  const physicalPrices = Object.values(design.printful_prices ?? {}).map((c) => c / 100);
  const cheapestPhysical = physicalPrices.length ? Math.min(...physicalPrices) : Infinity;
  const fromPrice = Math.min(digital, cheapestPhysical);

  const typeLabel = PRINT_CONFIGS[design.type]?.detailsLabel ?? '';

  // Routing rules:
  //   - marathon items live in the marathons table; click goes to the
  //     customizer page (/marathons/<slug>) not the static shop SKU page
  //   - `prints/<type>` placeholder slugs (no real product synced for this
  //     type yet) route to the filtered shop view
  //   - everything else routes to the standard /shop/<slug>
  const href =
    design.type === 'marathon'
      ? `/marathons/${design.slug}`
      : design.slug.startsWith('prints/')
        ? `/shop?category=${design.type}`
        : `/shop/${design.slug}`;

  const isMarathon = design.type === 'marathon';

  return (
    <Link href={href} className="group block">
      {/* Image tile.
          - Marathon items: render the supplied PNG poster contained inside
            a matted, drop-shadowed frame. Tile aspect matches the other
            cards so heights line up.
          - Printful product images: full-bleed `object-cover` over bg-soft.
          - SVG previews (no image_url): WallFrame + PrintPreview fallback. */}
      {isMarathon && design.image_url ? (
        <div className="relative aspect-[4/5] flex items-center justify-center px-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={design.image_url}
            alt={`${design.name} — ${design.location}`}
            className="block w-full max-h-full object-contain bg-white p-[6%] shadow-[0_24px_40px_-12px_rgba(26,26,46,0.30),0_8px_16px_-8px_rgba(26,26,46,0.18)] transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </div>
      ) : (
        <div className="relative aspect-[4/5] overflow-hidden bg-soft">
          {design.image_url ? (
            <Image
              src={design.image_url}
              alt={`${design.name} — ${design.location}`}
              width={800}
              height={1000}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center p-8 md:p-10">
              <div className="w-full transition-transform duration-500 group-hover:scale-[1.02]">
                <WallFrame compact>
                  <PrintPreview type={design.type} values={design.values} />
                </WallFrame>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Caption */}
      <div className="mt-4">
        <div className="text-[15px] text-ink truncate">{design.name}</div>
        <div className="text-[13px] text-mid mt-0.5 truncate">{typeLabel}</div>
        <div className="text-[13px] text-ink mt-1.5">
          <span className="text-mid">From</span> ${fromPrice}
        </div>
      </div>
    </Link>
  );
}
