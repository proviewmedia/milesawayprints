'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import WallFrame from './WallFrame';
import PrintPreview from './PrintPreview';
import { DesignSummary } from '@/data/shop';
import { PRICING } from '@/data/prints';

interface Props {
  design: DesignSummary;
  onQuickShop?: (design: DesignSummary) => void;
  priority?: boolean;
}

const FAV_KEY = 'map-favs-v1';

export default function DesignCard({ design, onQuickShop }: Props) {
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

  const handleQuickShop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickShop?.(design);
  };

  const fromPrice = PRICING.sizes[0].digital;

  return (
    <Link href={`/shop/${design.slug}`} className="group block">
      <div className="relative">
        <WallFrame compact interactive>
          <PrintPreview type={design.type} values={design.values} />
        </WallFrame>

        {/* Heart (top-right) */}
        <button
          onClick={toggleFav}
          aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-md hover:bg-white transition-all hover:scale-110"
        >
          <Heart
            size={16}
            className={fav ? 'text-coral' : 'text-mid'}
            fill={fav ? 'currentColor' : 'none'}
          />
        </button>

        {/* Quick Shop (bottom, hover reveal) */}
        {onQuickShop && (
          <button
            onClick={handleQuickShop}
            className="absolute bottom-3 left-3 right-3 bg-ink text-white text-xs font-semibold py-2.5 rounded-full opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag size={14} /> Quick Shop
          </button>
        )}
      </div>

      <div className="mt-4 px-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="font-bold text-ink text-sm truncate">{design.name}</div>
            <div className="text-xs text-mid mt-0.5 truncate">{design.location}</div>
          </div>
          <div className="text-xs font-semibold text-ink whitespace-nowrap">
            from ${fromPrice}
          </div>
        </div>
      </div>
    </Link>
  );
}
