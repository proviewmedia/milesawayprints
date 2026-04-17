'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, Download, Truck, Gift, MapPin, Tag } from 'lucide-react';
import WallFrame from '@/components/WallFrame';
import PrintPreview from '@/components/PrintPreview';
import DesignCard from '@/components/DesignCard';
import QuickShopModal from '@/components/QuickShopModal';
import { DesignSummary } from '@/data/shop';
import { PRICING, PRINT_CONFIGS } from '@/data/prints';
import { useCart } from '@/contexts/CartContext';

type Format = 'digital' | 'physical';

interface Props {
  design: DesignSummary;
  related: DesignSummary[];
}

export default function DesignDetail({ design, related }: Props) {
  const [format, setFormat] = useState<Format>('digital');
  const [size, setSize] = useState(PRICING.sizes[0].value);
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [quickShopDesign, setQuickShopDesign] = useState<DesignSummary | null>(null);
  const [added, setAdded] = useState(false);

  const { addItem } = useCart();

  const price = useMemo(() => {
    const s = PRICING.sizes.find((x) => x.value === size) ?? PRICING.sizes[0];
    return format === 'digital' ? s.digital : s.physical;
  }, [size, format]);

  const handleAdd = () => {
    addItem({
      slug: design.slug,
      type: design.type,
      name: design.name,
      location: design.location,
      format,
      size,
      priceCents: price * 100,
      isGift,
      giftMessage: isGift ? giftMessage : undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const cfg = PRINT_CONFIGS[design.type];

  return (
    <>
      {/* Breadcrumb */}
      <section className="pt-24 pb-4 bg-white border-b border-border">
        <div className="max-w-[1280px] mx-auto px-6">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-mid hover:text-ink"
          >
            <ArrowLeft size={12} /> Back to shop
          </Link>
        </div>
      </section>

      {/* Main product */}
      <section className="py-10 md:py-16">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
            {/* Preview */}
            <div className="md:sticky md:top-28 md:self-start">
              <WallFrame>
                <PrintPreview type={design.type} values={design.values} />
              </WallFrame>
              <p className="text-center text-xs text-light-mid mt-4 italic">
                Shown framed on wall — frame not included with physical order.
              </p>
            </div>

            {/* Details */}
            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase mb-4"
                style={{ background: cfg.badgeColor.bg, color: cfg.badgeColor.text }}
              >
                {cfg.detailsLabel}
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-ink leading-tight mb-2">
                {design.name}
              </h1>
              <p className="inline-flex items-center gap-1.5 text-mid mb-5">
                <MapPin size={14} /> {design.location}
              </p>

              {design.description && (
                <p className="text-mid leading-relaxed mb-6">{design.description}</p>
              )}

              {design.tags && design.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {design.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 bg-soft text-mid text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider"
                    >
                      <Tag size={10} /> {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Format */}
              <div className="mb-6">
                <div className="text-xs font-semibold text-ink mb-2">Format</div>
                <div className="grid grid-cols-2 gap-2">
                  <FormatOption
                    active={format === 'digital'}
                    onClick={() => setFormat('digital')}
                    icon={<Download size={14} />}
                    title="Digital"
                    sub="Download instantly. Print anywhere."
                  />
                  <FormatOption
                    active={format === 'physical'}
                    onClick={() => setFormat('physical')}
                    icon={<Truck size={14} />}
                    title="Physical"
                    sub="Museum-quality print, shipped."
                  />
                </div>
              </div>

              {/* Size */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-semibold text-ink">Size</div>
                  <button className="text-[11px] text-primary hover:underline">Size guide</button>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {PRICING.sizes.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setSize(s.value)}
                      className={`py-2.5 rounded-lg text-xs font-semibold border-[1.5px] transition-all ${
                        size === s.value
                          ? 'border-primary bg-primary-light text-primary'
                          : 'border-border bg-white text-ink hover:border-primary/50'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gift toggle */}
              <label className="flex items-start gap-3 p-4 bg-soft rounded-xl cursor-pointer mb-6">
                <input
                  type="checkbox"
                  checked={isGift}
                  onChange={(e) => setIsGift(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-primary"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <Gift size={14} className="text-coral" /> This is a gift
                  </div>
                  <p className="text-xs text-mid mt-1">
                    Add a personal message. We&apos;ll hide the price on the recipient&apos;s copy.
                  </p>
                  {isGift && (
                    <textarea
                      className="input-field mt-3 min-h-[72px] resize-none"
                      placeholder="Your personal message…"
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                    />
                  )}
                </div>
              </label>

              {/* Price + CTA */}
              <div className="flex items-center justify-between p-5 bg-ink text-white rounded-2xl">
                <div>
                  <div className="text-[10px] tracking-widest uppercase text-white/60">Total</div>
                  <div className="text-3xl font-extrabold">${price}</div>
                  <div className="text-[11px] text-white/50 mt-0.5">
                    {format === 'digital' ? 'Instant download after purchase' : 'Ships in 3–5 business days'}
                  </div>
                </div>
                <button
                  onClick={handleAdd}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all ${
                    added
                      ? 'bg-mint text-white'
                      : 'bg-white text-ink hover:bg-primary hover:text-white'
                  }`}
                >
                  {added ? 'Added ✓' : (
                    <>
                      Add to Cart <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>

              {/* Custom CTA */}
              <div className="mt-8 p-5 border border-border rounded-2xl">
                <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                  Want something different?
                </div>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-mid">
                    Create a custom {design.type} print with your own location and details.
                  </p>
                  <Link
                    href={`/prints/${design.type}`}
                    className="text-xs font-semibold text-primary whitespace-nowrap hover:underline inline-flex items-center gap-1"
                  >
                    Create Custom <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related designs */}
      {related.length > 0 && (
        <section className="py-16 bg-soft border-t border-border">
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="mb-8">
              <div className="section-label">Keep browsing</div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-ink">
                You might also like
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {related.map((d) => (
                <DesignCard key={d.slug} design={d} onQuickShop={setQuickShopDesign} />
              ))}
            </div>
          </div>
        </section>
      )}

      <QuickShopModal design={quickShopDesign} onClose={() => setQuickShopDesign(null)} />
    </>
  );
}

function FormatOption({
  active,
  onClick,
  icon,
  title,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl border-[1.5px] text-left transition-all ${
        active ? 'border-primary bg-primary-light' : 'border-border bg-white hover:border-primary/50'
      }`}
    >
      <div className={`flex items-center gap-2 ${active ? 'text-primary' : 'text-ink'}`}>
        {icon}
        <span className="font-bold text-sm">{title}</span>
      </div>
      <div className="text-xs text-mid mt-1">{sub}</div>
    </button>
  );
}
