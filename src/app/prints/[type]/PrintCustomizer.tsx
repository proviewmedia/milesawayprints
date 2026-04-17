'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Download, Gift, Info, Truck } from 'lucide-react';
import PrintPreview from '@/components/PrintPreview';
import { PrintConfig, GalleryItem, PRICING, PRINT_CONFIGS, PrintType } from '@/data/prints';

type Format = 'digital' | 'physical';

interface Props {
  config: PrintConfig;
  gallery: GalleryItem[];
}

const OTHER_CATEGORIES: PrintType[] = ['golf', 'stadium', 'airport', 'marathon', 'city'];

export default function PrintCustomizer({ config, gallery }: Props) {
  const [values, setValues] = useState<Record<string, string>>(() => ({ ...config.defaults }));
  const [format, setFormat] = useState<Format>('digital');
  const [size, setSize] = useState(PRICING.sizes[0].value);
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');

  const price = useMemo(() => {
    const s = PRICING.sizes.find((x) => x.value === size) ?? PRICING.sizes[0];
    return format === 'digital' ? s.digital : s.physical;
  }, [size, format]);

  const update = (id: string, v: string) => setValues((prev) => ({ ...prev, [id]: v }));

  const applyGallery = (item: GalleryItem) => setValues({ ...config.defaults, ...item.values });

  return (
    <>
      {/* Category pill nav */}
      <section className="pt-24 pb-6 bg-white border-b border-border">
        <div className="max-w-[1280px] mx-auto px-6 overflow-x-auto">
          <div className="flex gap-2 whitespace-nowrap">
            {OTHER_CATEGORIES.map((t) => {
              const c = PRINT_CONFIGS[t];
              const active = t === config.type;
              return (
                <Link
                  key={t}
                  href={`/prints/${c.slug}`}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                    active
                      ? 'bg-ink text-white'
                      : 'bg-soft text-mid hover:bg-soft-2 hover:text-ink'
                  }`}
                >
                  {c.detailsLabel}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main product layout */}
      <section className="py-12 md:py-16">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Preview — sticky on desktop */}
            <div className="md:sticky md:top-24 md:self-start">
              <div
                className="rounded-2xl p-[8%] shadow-[0_20px_60px_rgba(26,26,46,0.12)]"
                style={{ background: 'linear-gradient(180deg, #faf8f3 0%, #f4efe4 100%)' }}
              >
                <PrintPreview type={config.type} values={values} />
              </div>
              <p className="text-center text-xs text-light-mid mt-4 italic">
                Live preview — updates as you type
              </p>
            </div>

            {/* Form */}
            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase mb-4"
                style={{ background: config.badgeColor.bg, color: config.badgeColor.text }}
              >
                {config.badge}
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-ink mb-3">
                {config.title}
              </h1>
              <p className="text-mid leading-relaxed mb-8">{config.subtitle}</p>

              {/* Required fields */}
              <div className="space-y-4 mb-6">
                {config.fields.map((f) => (
                  <div key={f.id}>
                    <label className="block text-xs font-semibold text-ink mb-1.5">
                      {f.label} {f.required && <span className="text-coral">*</span>}
                    </label>
                    <input
                      className="input-field"
                      placeholder={f.placeholder}
                      value={values[f.id] ?? ''}
                      onChange={(e) => update(f.id, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              {/* Optional stat fields */}
              <div className="bg-soft rounded-xl p-4 mb-6">
                <div className="flex items-start gap-2 mb-3 text-mid">
                  <Info size={14} className="mt-0.5 flex-shrink-0" />
                  <p className="text-xs leading-relaxed">
                    Optional. We&apos;ll look these up if you don&apos;t have them.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {config.statFields.map((f) => (
                    <div key={f.id}>
                      <label className="block text-[10px] font-semibold tracking-wider uppercase text-mid mb-1">
                        {f.label}
                      </label>
                      <input
                        className="input-field !text-xs !px-2 !py-2"
                        placeholder={f.placeholder}
                        value={values[f.id] ?? ''}
                        onChange={(e) => update(f.id, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Format toggle */}
              <div className="mb-6">
                <div className="text-xs font-semibold text-ink mb-2">Format</div>
                <div className="grid grid-cols-2 gap-2">
                  <FormatOption
                    active={format === 'digital'}
                    onClick={() => setFormat('digital')}
                    icon={<Download size={14} />}
                    title="Digital"
                    sub="Instant download"
                  />
                  <FormatOption
                    active={format === 'physical'}
                    onClick={() => setFormat('physical')}
                    icon={<Truck size={14} />}
                    title="Physical"
                    sub="Shipped to you"
                  />
                </div>
              </div>

              {/* Size picker */}
              <div className="mb-6">
                <div className="text-xs font-semibold text-ink mb-2">Size</div>
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
                </div>
                <button
                  className="inline-flex items-center gap-2 bg-white text-ink px-6 py-3 rounded-full text-sm font-semibold hover:bg-primary hover:text-white transition-colors"
                  disabled
                  title="Checkout coming soon"
                >
                  Add to Cart <ArrowRight size={14} />
                </button>
              </div>
              <p className="text-[11px] text-center text-light-mid mt-3">
                Secure checkout coming soon — Stripe integration in progress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery of past designs */}
      <section className="py-16 bg-soft border-t border-border">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="section-label">Inspiration</div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-ink">
                Past {config.detailsLabel.toLowerCase()} designs
              </h2>
              <p className="text-mid text-sm mt-2">Tap any to auto-fill your details.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {gallery.map((item, i) => (
              <button
                key={item.id ?? `${item.name}-${i}`}
                onClick={() => applyGallery(item)}
                className="text-left group"
              >
                <div
                  className="rounded-xl p-[10%] shadow-[0_12px_36px_rgba(26,26,46,0.10)] group-hover:shadow-[0_16px_48px_rgba(26,26,46,0.16)] group-hover:-translate-y-1 transition-all duration-300"
                  style={{ background: 'linear-gradient(180deg, #f0e8db 0%, #dfd2b8 100%)' }}
                >
                  <PrintPreview type={config.type} values={item.values} />
                </div>
                <div className="mt-3 px-1">
                  <div className="font-bold text-ink text-sm">{item.name}</div>
                  <div className="text-xs text-mid mt-0.5">{item.location}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-sm text-mid mb-3">Don&apos;t see yours? Every print is custom.</p>
            <p className="text-xs text-light-mid">
              Just fill in the form above with your location and we&apos;ll design it for you.
            </p>
          </div>
        </div>
      </section>
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
        active
          ? 'border-primary bg-primary-light'
          : 'border-border bg-white hover:border-primary/50'
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
