'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Truck, Gift } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import {
  MARATHON_SIZES,
  SVG_PLACEHOLDERS,
  type MarathonRow,
  type MarathonVariant,
  type MarathonCustomization,
  formatMarathonName,
  formatRaceDate,
} from '@/data/marathons';

interface Props {
  marathon: MarathonRow;
  fullSvg: string | null;
  halfSvg: string | null;
}

export default function MarathonCustomizer({ marathon, fullSvg, halfSvg }: Props) {
  const { addItem } = useCart();

  const [variant, setVariant] = useState<MarathonVariant>(fullSvg ? 'full' : 'half');
  const [bib, setBib] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [raceDate, setRaceDate] = useState('');
  const [finishTime, setFinishTime] = useState('');
  const [size, setSize] = useState<string>(() => {
    const sizes = Object.keys(marathon.printful_prices ?? {});
    return sizes.includes('16x20') ? '16x20' : sizes[0] ?? '11x14';
  });
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');

  const svgWrapRef = useRef<HTMLDivElement | null>(null);

  // Each SVG (full or half) is the artwork as designed — including its
  // own "MARATHON" / "HALF MARATHON" label and route map. The customizer
  // only mutates personalized fields (name, bib, time, date) and the
  // distance (26.2 ↔ 13.1, since the half source happens to ship with
  // 26.2 baked in).
  const activeSvg = variant === 'half' ? halfSvg : fullSvg;
  const variantAvailable = { full: !!fullSvg, half: !!halfSvg };

  const priceCents = marathon.printful_prices?.[size] ?? 0;

  // After the SVG is injected (or when variant swaps), apply current values
  // to the placeholder text nodes. Keep this effect cheap — only runs on
  // variant change. Per-keystroke updates use a separate effect below.
  useEffect(() => {
    applyAllToDom(svgWrapRef.current, {
      variant,
      bib,
      firstName,
      lastName,
      raceDate,
      finishTime,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant, activeSvg]);

  // Live mutation: each input change rewrites just the relevant tspan text.
  useEffect(() => {
    applyAllToDom(svgWrapRef.current, {
      variant,
      bib,
      firstName,
      lastName,
      raceDate,
      finishTime,
    });
  }, [bib, firstName, lastName, raceDate, finishTime, variant]);

  const handleAddToCart = () => {
    if (!firstName.trim() || !lastName.trim() || !bib.trim() || !raceDate || !finishTime.trim()) {
      return;
    }
    const customization: MarathonCustomization = {
      marathon_slug: marathon.slug,
      variant,
      bib: bib.replace(/^#/, ''),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      race_date: raceDate,
      finish_time: finishTime.trim(),
    };
    addItem({
      slug: `marathon-${marathon.slug}-${Date.now()}`,
      type: 'marathon',
      name: formatMarathonName(customization, marathon.city),
      location: `${variant === 'half' ? 'Half Marathon' : 'Marathon'}`,
      format: 'physical',
      size,
      priceCents,
      isCustom: true,
      customization,
      isGift,
      giftMessage: isGift ? giftMessage : undefined,
    });
  };

  const formValid = useMemo(
    () =>
      firstName.trim().length > 0 &&
      lastName.trim().length > 0 &&
      bib.trim().length > 0 &&
      raceDate.length > 0 &&
      finishTime.trim().length > 0,
    [firstName, lastName, bib, raceDate, finishTime],
  );

  return (
    <section className="pt-32 md:pt-36 pb-16">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Live preview — white matted poster lifted off the page with a
              soft drop shadow. Capped at ~420px so the whole product page
              fits the viewport without much scrolling. */}
          <div className="md:sticky md:top-32 md:self-start">
            <div className="max-w-[420px] mx-auto md:mx-0">
              {activeSvg ? (
                <div className="bg-white p-[5%] shadow-[0_40px_80px_-20px_rgba(26,26,46,0.35),0_18px_36px_-12px_rgba(26,26,46,0.20)] rounded-sm">
                  <div
                    ref={svgWrapRef}
                    className="marathon-svg-wrap"
                    dangerouslySetInnerHTML={{ __html: activeSvg }}
                  />
                </div>
              ) : (
                <div className="aspect-[3/4] flex items-center justify-center text-sm text-mid bg-soft rounded-xl">
                  {variant === 'half' ? 'Half marathon design coming soon.' : 'Loading…'}
                </div>
              )}
              <p className="text-center text-xs text-light-mid mt-4 italic">
                Live preview — updates as you type
              </p>
            </div>
          </div>

          {/* Form */}
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase mb-4"
              style={{ background: '#fee2e2', color: '#dc2626' }}
            >
              For Runners
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-ink mb-3">
              {marathon.city} Marathon Print
            </h1>
            <p className="text-mid leading-relaxed mb-8">
              Personalize your finish. Enter your bib, name, finish time, and race date —
              every detail you see in the preview prints exactly that way.
            </p>

            {/* Variant toggle */}
            <div className="mb-6">
              <div className="text-xs font-semibold text-ink mb-2">Race</div>
              <div className="grid grid-cols-2 gap-2">
                <VariantOption
                  active={variant === 'full'}
                  disabled={!variantAvailable.full}
                  onClick={() => setVariant('full')}
                  title="Full"
                  sub="26.2 miles"
                />
                <VariantOption
                  active={variant === 'half'}
                  disabled={!variantAvailable.half}
                  onClick={() => setVariant('half')}
                  title="Half"
                  sub="13.1 miles"
                />
              </div>
            </div>

            {/* Form fields */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="First name"
                  required
                  value={firstName}
                  onChange={setFirstName}
                  placeholder="John"
                />
                <Field
                  label="Last name"
                  required
                  value={lastName}
                  onChange={setLastName}
                  placeholder="Doe"
                />
              </div>
              <Field
                label="Bib number"
                required
                value={bib}
                onChange={(v) => setBib(v.replace(/^#/, ''))}
                placeholder="11456"
              />
              <Field
                label="Race date"
                required
                type="date"
                value={raceDate}
                onChange={setRaceDate}
              />
              <Field
                label="Finish time"
                required
                value={finishTime}
                onChange={setFinishTime}
                placeholder="02:30:22"
              />
            </div>

            {/* Size picker */}
            <div className="mb-6">
              <div className="text-xs font-semibold text-ink mb-2">Size</div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {MARATHON_SIZES.filter((s) =>
                  Object.prototype.hasOwnProperty.call(marathon.printful_prices, s.value),
                ).map((s) => (
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
                <div className="text-3xl font-extrabold">
                  ${(priceCents / 100).toFixed(2)}
                </div>
                <div className="text-[10px] uppercase text-white/60 flex items-center gap-1 mt-1">
                  <Truck size={11} /> Ships within 5 business days
                </div>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={!formValid}
                className="inline-flex items-center gap-2 bg-white text-ink px-6 py-3 rounded-full text-sm font-semibold hover:bg-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to Cart <ArrowRight size={14} />
              </button>
            </div>
            {!formValid && (
              <p className="text-[11px] text-center text-light-mid mt-3">
                Fill in all fields to continue.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function VariantOption({
  active,
  disabled,
  onClick,
  title,
  sub,
}: {
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  title: string;
  sub: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-4 rounded-xl border-[1.5px] text-left transition-all ${
        active
          ? 'border-primary bg-primary-light'
          : 'border-border bg-white hover:border-primary/50'
      } ${disabled ? 'opacity-50 cursor-not-allowed hover:border-border' : ''}`}
    >
      <div className={`font-bold text-sm ${active ? 'text-primary' : 'text-ink'}`}>{title}</div>
      <div className="text-xs text-mid mt-1">{sub}</div>
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  type,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-ink mb-1.5">
        {label} {required && <span className="text-coral">*</span>}
      </label>
      <input
        type={type ?? 'text'}
        className="input-field"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

/**
 * Apply customer values to the inline SVG by mutating the textContent of the
 * placeholder tspan elements. The placeholder strings ("John Doe", "#11456",
 * etc.) are unique within the SVG, so we find them by exact text match.
 *
 * This keeps the SVG itself source-of-truth (no required IDs, no preprocessing).
 */
function applyAllToDom(
  wrap: HTMLDivElement | null,
  values: {
    variant: 'full' | 'half';
    bib: string;
    firstName: string;
    lastName: string;
    raceDate: string;
    finishTime: string;
  },
) {
  if (!wrap) return;
  const tspans = wrap.querySelectorAll('tspan');

  const fullName = `${values.firstName || 'John'} ${values.lastName || 'Doe'}`.trim() || 'John Doe';
  const bibText = values.bib ? `#${values.bib.replace(/^#/, '')}` : SVG_PLACEHOLDERS.bib;
  const finish = values.finishTime || SVG_PLACEHOLDERS.finishTime;
  const date = values.raceDate ? formatRaceDate(values.raceDate) : SVG_PLACEHOLDERS.date;

  const distance =
    values.variant === 'half' ? SVG_PLACEHOLDERS.distanceHalf : SVG_PLACEHOLDERS.distanceFull;

  for (const t of Array.from(tspans)) {
    const original = t.dataset.originalText ?? t.textContent ?? '';
    if (!t.dataset.originalText) t.dataset.originalText = original;

    switch (original) {
      case SVG_PLACEHOLDERS.name:
        t.textContent = fullName;
        break;
      case SVG_PLACEHOLDERS.bib:
        t.textContent = bibText;
        break;
      case SVG_PLACEHOLDERS.finishTime:
        t.textContent = finish;
        break;
      case SVG_PLACEHOLDERS.date:
        t.textContent = date;
        break;
      case SVG_PLACEHOLDERS.distanceFull:
      case SVG_PLACEHOLDERS.distanceHalf:
        t.textContent = distance;
        break;
      default:
        // Static — LAS VEGAS, MARATHON / HALF MARATHON labels (already in
        // the SVG as designed), and any other decorative text.
        break;
    }
  }
}
