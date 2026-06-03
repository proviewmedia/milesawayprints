'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Check, ChevronDown, ChevronRight, Minus, Plus, Star, Truck, ShieldCheck, Globe, Info } from 'lucide-react';
import WallFrame from '@/components/WallFrame';
import PrintPreview from '@/components/PrintPreview';
import DesignCard from '@/components/DesignCard';
import QuickShopModal from '@/components/QuickShopModal';
import { DesignSummary, getPhysicalSizes, priceCentsFor, formatSize } from '@/data/shop';
import { PRINT_CONFIGS } from '@/data/prints';
import { useCart } from '@/contexts/CartContext';
import { trackViewItem } from '@/lib/track';

export interface DesignDetailReview {
  author: string;
  rating: number;
  body: string;
  datePublished: string;
}

export interface DesignDetailFaq {
  q: string;
  a: string;
}

interface Props {
  design: DesignSummary;
  related: DesignSummary[];
  /** Optional reviews surfaced from the type-level review pool. Up to 3. */
  reviews?: DesignDetailReview[];
  /** Per-print-type FAQs rendered as expandable list + emitted as FAQPage JSON-LD by the parent. */
  faqs?: DesignDetailFaq[];
}

export default function DesignDetail({ design, related, reviews, faqs }: Props) {
  const physicalSizes = useMemo(() => getPhysicalSizes(design), [design]);
  // Format is always 'physical' now — digital sales are disabled.
  const format = 'physical' as const;
  const [size, setSize] = useState(physicalSizes[0] ?? '');
  const [quantity, setQuantity] = useState(1);
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [quickShopDesign, setQuickShopDesign] = useState<DesignSummary | null>(null);
  const [added, setAdded] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>('about');

  const { addItem, isOpen: cartOpen } = useCart();
  const addBtnRef = useRef<HTMLButtonElement | null>(null);
  const [stickyVisible, setStickyVisible] = useState(false);

  // Mobile sticky add-to-cart bar — appears once the primary button
  // scrolls out of view. Desktop unaffected since the bar is md:hidden.
  useEffect(() => {
    const btn = addBtnRef.current;
    if (!btn || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { rootMargin: '0px 0px -10% 0px' },
    );
    io.observe(btn);
    return () => io.disconnect();
  }, []);

  const priceCents = useMemo(() => priceCentsFor(design, format, size), [design, size, format]);
  const price = priceCents / 100;
  const canAdd = !!size && priceCents > 0;

  // Fire view_item once per design view (re-fires when navigating to a new
  // product page; doesn't re-fire when the same page just toggles size).
  useEffect(() => {
    if (priceCents <= 0) return;
    trackViewItem(
      [
        {
          id: design.slug,
          name: design.name,
          category: design.type,
          variant: size,
          price,
          quantity: 1,
        },
      ],
      price,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [design.slug]);

  const handleAdd = () => {
    if (!canAdd) return;
    addItem({
      slug: design.slug,
      type: design.type,
      name: design.name,
      location: design.location,
      format,
      size,
      priceCents,
      quantity,
      imageUrl: design.image_url,
      isGift,
      giftMessage: isGift ? giftMessage : undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const cfg = PRINT_CONFIGS[design.type];

  return (
    <>
      {/* Breadcrumb — semantic + visible + matches BreadcrumbList JSON-LD */}
      <section className="pt-28 md:pt-32 pb-2">
        <div className="max-w-[1400px] mx-auto px-6">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-[13px] text-mid flex-wrap">
              <li>
                <Link href="/" className="hover:text-ink">
                  Home
                </Link>
              </li>
              <ChevronRight size={12} strokeWidth={1.75} className="text-light-mid" />
              <li>
                <Link href="/shop" className="hover:text-ink">
                  Shop
                </Link>
              </li>
              <ChevronRight size={12} strokeWidth={1.75} className="text-light-mid" />
              <li>
                <Link
                  href={`/prints/${design.type}`}
                  className="hover:text-ink"
                >
                  {cfg.detailsLabel}
                </Link>
              </li>
              <ChevronRight size={12} strokeWidth={1.75} className="text-light-mid" />
              <li aria-current="page" className="text-ink truncate max-w-[200px] md:max-w-[300px]">
                {design.name}
              </li>
            </ol>
          </nav>
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
                    alt={`${design.name} — ${cfg.detailsLabel.toLowerCase()} art print${design.location ? `, ${design.location}` : ''}`}
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

              {/* Size */}
              {physicalSizes.length > 0 && (
                <div className="mb-7">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="text-[13px] font-medium text-ink">
                      Size: <span className="font-normal text-mid">{formatSize(size)}</span>
                    </div>
                    <button className="text-[13px] text-ink underline underline-offset-2 hover:opacity-70">
                      Size guide
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {physicalSizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSize(s)}
                        className={`min-h-[44px] py-3 rounded-lg border text-sm transition-colors ${
                          size === s ? 'border-ink text-ink' : 'border-border text-mid hover:text-ink'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity stepper */}
              <div className="mb-7">
                <div className="text-[13px] font-medium text-ink mb-2.5">Quantity</div>
                <div className="inline-flex items-center border border-border rounded-full overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                    className="w-11 h-11 flex items-center justify-center text-ink hover:bg-soft disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus size={14} strokeWidth={1.75} aria-hidden="true" />
                  </button>
                  <div
                    aria-live="polite"
                    aria-atomic="true"
                    className="w-10 text-center text-sm text-ink tabular-nums"
                  >
                    {quantity}
                  </div>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                    disabled={quantity >= 99}
                    aria-label="Increase quantity"
                    className="w-11 h-11 flex items-center justify-center text-ink hover:bg-soft disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus size={14} strokeWidth={1.75} aria-hidden="true" />
                  </button>
                </div>
              </div>

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

              {/* Add to cart — primary CTA. Turns green for 2.5s after
                  successful add so the customer sees confirmation in
                  addition to the cart drawer auto-opening. Disabled if
                  no size is selected (defensive — every active product
                  has sizes today but the safety net is cheap). */}
              <button
                ref={addBtnRef}
                onClick={handleAdd}
                disabled={!canAdd}
                aria-live="polite"
                className={`w-full py-4 rounded-full text-sm font-medium transition-colors mb-3 inline-flex items-center justify-center gap-2 ${
                  added
                    ? 'bg-mint text-paper'
                    : canAdd
                      ? 'bg-ink text-paper hover:bg-black'
                      : 'bg-soft text-mid cursor-not-allowed'
                }`}
              >
                {added ? (
                  <>
                    <Check size={16} strokeWidth={2} aria-hidden="true" /> Added to cart
                  </>
                ) : canAdd ? (
                  `Add to cart · $${(price * quantity).toFixed(2)}`
                ) : (
                  'Pick a size to continue'
                )}
              </button>
              <p className="text-center text-[13px] text-mid mb-8">
                Made-to-order · Ships in 3–5 business days
              </p>

              {/* Trust row */}
              <div className="grid grid-cols-3 gap-3 bg-soft -mx-2 p-5 mb-2 text-center">
                <div className="flex flex-col items-center gap-1.5">
                  <ShieldCheck size={16} strokeWidth={1.5} className="text-ink" />
                  <span className="text-[11px] text-ink">Museum quality</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <Truck size={16} strokeWidth={1.5} className="text-ink" />
                  <span className="text-[11px] text-ink">Made to order</span>
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
                  title="Shipping"
                  open={openSection === 'shipping'}
                  onToggle={() =>
                    setOpenSection(openSection === 'shipping' ? null : 'shipping')
                  }
                >
                  Made to order. Physical prints ship within 3–5 business days, with tracked delivery worldwide. Because every print is custom-made for you, all sales are final — but if anything arrives damaged or misprinted, contact us within 14 days and we&apos;ll replace it free.
                </ExpandSection>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews — surface 2 type-level reviews for social proof at the
          decision point. JSON-LD already exposes these for SEO; now
          customers see them too. Only renders when reviews exist. */}
      {reviews && reviews.length > 0 && (
        <section className="py-14 md:py-20 border-t border-border">
          <div className="max-w-[1100px] mx-auto px-6">
            <h2 className="text-xl md:text-2xl font-medium tracking-tight text-ink mb-8">
              What customers say
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {reviews.slice(0, 2).map((r, i) => (
                <article
                  key={i}
                  className="border border-border rounded-2xl p-5 md:p-6 bg-paper"
                >
                  <div
                    className="flex gap-0.5 text-warm mb-3"
                    aria-label={`${r.rating} out of 5 stars`}
                  >
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        size={14}
                        fill={j < r.rating ? 'currentColor' : 'none'}
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <p className="text-mid text-[15px] leading-relaxed mb-4">
                    &ldquo;{r.body}&rdquo;
                  </p>
                  <p className="text-[13px] text-ink">{r.author}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQs — visible, expandable. Server-component parent also emits
          FAQPage JSON-LD with the same items so Google rich results
          match what users see. */}
      {faqs && faqs.length > 0 && (
        <section className="py-14 md:py-20 border-t border-border">
          <div className="max-w-[860px] mx-auto px-6">
            <h2 className="text-xl md:text-2xl font-medium tracking-tight text-ink mb-6">
              Frequently asked questions
            </h2>
            <div className="border-t border-border">
              {faqs.map((f, i) => {
                const key = `faq-${i}`;
                return (
                  <ExpandSection
                    key={key}
                    title={f.q}
                    open={openSection === key}
                    onToggle={() =>
                      setOpenSection(openSection === key ? null : key)
                    }
                  >
                    {f.a}
                  </ExpandSection>
                );
              })}
            </div>
          </div>
        </section>
      )}

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

      {/* Mobile sticky add-to-cart bar — appears once the in-page button
          scrolls out of view. Hidden when cart drawer is open to avoid
          overlap with its trigger area. Desktop unaffected (md:hidden). */}
      <div
        aria-hidden={!stickyVisible || cartOpen}
        className={`md:hidden fixed left-0 right-0 bottom-0 z-40 bg-paper border-t border-border px-4 py-3 transition-transform duration-200 ${
          stickyVisible && !cartOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center gap-3 max-w-[640px] mx-auto">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] text-mid uppercase tracking-wider truncate">
              {design.name}
            </div>
            <div className="text-sm font-medium text-ink tabular-nums">
              {canAdd ? `$${(price * quantity).toFixed(2)}` : 'Pick a size'}
            </div>
          </div>
          <button
            onClick={handleAdd}
            disabled={!canAdd}
            className={`flex-shrink-0 px-5 h-11 rounded-full text-sm font-medium transition-colors inline-flex items-center justify-center gap-1.5 ${
              added
                ? 'bg-mint text-paper'
                : canAdd
                  ? 'bg-ink text-paper hover:bg-black'
                  : 'bg-soft text-mid cursor-not-allowed'
            }`}
          >
            {added ? (
              <>
                <Check size={14} strokeWidth={2} aria-hidden="true" /> Added
              </>
            ) : (
              'Add to cart'
            )}
          </button>
        </div>
      </div>
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
