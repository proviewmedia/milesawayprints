'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, Star, Truck, ShieldCheck, Globe, Info } from 'lucide-react';
import WallFrame from '@/components/WallFrame';
import PrintPreview from '@/components/PrintPreview';
import DesignCard from '@/components/DesignCard';
import QuickShopModal from '@/components/QuickShopModal';
import { DesignSummary, getPhysicalSizes, priceCentsFor, formatSize } from '@/data/shop';
import { PRINT_CONFIGS } from '@/data/prints';
import { useCart } from '@/contexts/CartContext';

type Format = 'digital' | 'physical';

interface Props {
  design: DesignSummary;
  related: DesignSummary[];
}

export default function DesignDetail({ design, related }: Props) {
  const physicalSizes = useMemo(() => getPhysicalSizes(design), [design]);
  const [format, setFormat] = useState<Format>('physical');
  const [size, setSize] = useState(physicalSizes[0] ?? '');
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [quickShopDesign, setQuickShopDesign] = useState<DesignSummary | null>(null);
  const [added, setAdded] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>('about');

  const { addItem } = useCart();

  const priceCents = useMemo(() => priceCentsFor(design, format, size), [design, size, format]);
  const price = priceCents / 100;

  const handleAdd = () => {
    addItem({
      slug: design.slug,
      type: design.type,
      name: design.name,
      location: design.location,
      format,
      size,
      priceCents,
      imageUrl: design.image_url,
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
      <section className="pt-28 md:pt-32 pb-2">
        <div className="max-w-[1400px] mx-auto px-6">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-[13px] text-mid hover:text-ink"
          >
            <ArrowLeft size={14} strokeWidth={1.75} /> Back to shop
          </Link>
        </div>
      </section>

      {/* Main product */}
      <section className="pb-16 md:pb-24">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid md:grid-cols-[1.2fr_1fr] gap-10 lg:gap-16">
            {/* Preview — Printful images fill the tile; SVG previews sit inside it */}
            <div className="md:sticky md:top-32 md:self-start">
              <div className="bg-soft min-h-[60vh] flex items-center justify-center overflow-hidden">
                {design.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={design.image_url}
                    alt={design.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-[70%] max-w-[420px] py-12">
                    <WallFrame>
                      <PrintPreview type={design.type} values={design.values} />
                    </WallFrame>
                  </div>
                )}
              </div>
            </div>

            {/* Details */}
            <div>
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-ink">
                  {design.name}
                </h1>
                <div className="text-2xl md:text-3xl font-medium text-ink whitespace-nowrap">
                  ${price}
                </div>
              </div>
              <Link
                href={`/prints/${design.type}`}
                className="text-sm text-mid underline underline-offset-2 hover:text-ink"
              >
                {cfg.detailsLabel}
              </Link>
              <div className="flex items-center gap-2 mt-3 mb-8">
                <div className="flex gap-0.5 text-ink">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <span className="text-[13px] text-mid">4.9 / 5</span>
              </div>

              {/* Material */}
              <div className="mb-7">
                <div className="text-[13px] font-medium text-ink mb-2.5">Material</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFormat('physical')}
                    className={`px-5 py-3 rounded-lg border text-sm transition-colors ${
                      format === 'physical' ? 'border-ink text-ink' : 'border-border text-mid hover:text-ink'
                    }`}
                  >
                    Art print
                  </button>
                  <button
                    onClick={() => setFormat('digital')}
                    className={`px-5 py-3 rounded-lg border text-sm transition-colors ${
                      format === 'digital' ? 'border-ink text-ink' : 'border-border text-mid hover:text-ink'
                    }`}
                  >
                    Digital
                  </button>
                </div>
              </div>

              {/* Size */}
              {format === 'physical' && physicalSizes.length > 0 && (
                <div className="mb-7">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="text-[13px] font-medium text-ink">
                      Size: <span className="font-normal text-mid">{formatSize(size)}</span>
                    </div>
                    <button className="text-[13px] text-ink underline underline-offset-2 hover:opacity-70">
                      Size guide
                    </button>
                  </div>
                  <div className="grid grid-cols-4 md:grid-cols-5 gap-2">
                    {physicalSizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSize(s)}
                        className={`py-3 rounded-lg border text-sm transition-colors ${
                          size === s ? 'border-ink text-ink' : 'border-border text-mid hover:text-ink'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Gift toggle */}
              <label className="flex items-start gap-3 mb-7 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isGift}
                  onChange={(e) => setIsGift(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-ink"
                />
                <div className="flex-1">
                  <div className="text-sm text-ink flex items-center gap-1.5">
                    This is a gift
                    <span
                      className="text-mid cursor-help"
                      title="If your order has more than one print, the whole package ships as a gift with a single personal note and one packing slip. Order each print separately if you need different messages or recipients."
                    >
                      <Info size={12} strokeWidth={1.75} />
                    </span>
                  </div>
                  <p className="text-[13px] text-mid mt-0.5">
                    Add a personal message. We&apos;ll hide the price on the recipient&apos;s copy.
                  </p>
                  {isGift && (
                    <>
                      <textarea
                        className="input-field mt-3 min-h-[72px] resize-none"
                        placeholder="Your personal message…"
                        value={giftMessage}
                        onChange={(e) => setGiftMessage(e.target.value)}
                      />
                      <p className="text-[12px] text-mid mt-2 leading-relaxed">
                        Multiple prints in one order ship together as a single
                        gift with one note and one packing slip. Place separate
                        orders if you need different messages or recipients.
                      </p>
                    </>
                  )}
                </div>
              </label>

              {/* Add to cart — full-width black pill */}
              <button
                onClick={handleAdd}
                className="w-full bg-ink text-paper py-4 rounded-full text-sm font-medium hover:bg-black transition-colors mb-3"
              >
                {added ? 'Added ✓' : `Add to cart · $${price}`}
              </button>
              <p className="text-center text-[13px] text-mid mb-8">
                {format === 'digital'
                  ? 'Instant download after purchase'
                  : 'Made-to-order · Ships in 3–5 business days'}
              </p>

              {/* Trust row */}
              <div className="grid grid-cols-3 gap-3 bg-soft -mx-2 p-5 mb-2 text-center">
                <div className="flex flex-col items-center gap-1.5">
                  <Truck size={16} strokeWidth={1.5} className="text-ink" />
                  <span className="text-[11px] text-ink">30 day returns</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <ShieldCheck size={16} strokeWidth={1.5} className="text-ink" />
                  <span className="text-[11px] text-ink">Museum quality</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <Globe size={16} strokeWidth={1.5} className="text-ink" />
                  <span className="text-[11px] text-ink">Worldwide shipping</span>
                </div>
              </div>

              {/* Expandable info sections */}
              <div className="mt-6 border-t border-border">
                <ExpandSection
                  title="About the piece"
                  open={openSection === 'about'}
                  onToggle={() =>
                    setOpenSection(openSection === 'about' ? null : 'about')
                  }
                >
                  {design.description ?? `A custom ${cfg.detailsLabel.toLowerCase()} print of ${design.name}. Each piece is printed on archival fine-art paper for a gallery-quality finish.`}
                </ExpandSection>
                <ExpandSection
                  title="Delivery and returns"
                  open={openSection === 'shipping'}
                  onToggle={() =>
                    setOpenSection(openSection === 'shipping' ? null : 'shipping')
                  }
                >
                  Made to order. Physical prints ship within 3–5 business days, with tracked delivery worldwide. Free returns within 30 days. Digital files are available for download immediately after purchase.
                </ExpandSection>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="py-16 md:py-24 border-t border-border">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-ink">
                You might also like
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
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

function ExpandSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 text-left text-sm text-ink hover:opacity-70"
      >
        {title}
        <ChevronDown
          size={16}
          strokeWidth={1.5}
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="pb-4 text-[13px] text-mid leading-relaxed">{children}</div>
      )}
    </div>
  );
}
