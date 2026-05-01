'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import DesignCard from '@/components/DesignCard';
import QuickShopModal from '@/components/QuickShopModal';
import { Collection, DesignSummary } from '@/data/shop';

interface Props {
  designs: DesignSummary[];
  collections: Collection[];
}

export default function ShopClient({ designs, collections }: Props) {
  const [quickShopDesign, setQuickShopDesign] = useState<DesignSummary | null>(null);

  return (
    <>
      {/* Centered hero — quiet, no chrome */}
      <section className="pt-32 md:pt-40 pb-10 md:pb-14">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-medium tracking-tight text-ink leading-[1.05] mb-4">
            Shop
          </h1>
          <p className="text-mid text-base md:text-lg">
            Stadiums, airports, marathons, golf courses, cities, and skylines — printed on archival paper.
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

      {/* Grid */}
      <section className="pb-12 md:pb-16">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {designs.map((d) => (
              <DesignCard key={d.slug} design={d} onQuickShop={setQuickShopDesign} />
            ))}
          </div>
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
