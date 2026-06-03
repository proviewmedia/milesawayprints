'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, Check, Truck, Gift } from 'lucide-react';
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

function splitFinish(t: string | null): [string, string, string] {
  if (!t) return ['', '', ''];
  const parts = t.split(':');
  return [parts[0] ?? '', parts[1] ?? '', parts[2] ?? ''];
}

export default function MarathonCustomizer({ marathon, fullSvg, halfSvg }: Props) {
  const { addItem } = useCart();
  // Read URL params once at mount so the admin's "Build print file" deep
  // link from /admin/orders/<token> lands here with every field already
  // filled in, ready to export the PDF for Printful upload.
  const searchParams = useSearchParams();
  const initial = useMemo(() => {
    const variantParam = (searchParams.get('variant') as MarathonVariant | null) ?? null;
    const [h, m, s] = splitFinish(searchParams.get('finishTime'));
    return {
      variant: variantParam === 'half' || variantParam === 'full' ? variantParam : null,
      bib: searchParams.get('bib') ?? '',
      firstName: searchParams.get('firstName') ?? '',
      lastName: searchParams.get('lastName') ?? '',
      raceDate: searchParams.get('raceDate') ?? '',
      finishHours: h,
      finishMinutes: m,
      finishSeconds: s,
      size: searchParams.get('size') ?? '',
    };
    // Intentional one-shot: only honor params on first render so the form
    // is editable afterwards without URL re-syncing weirdness.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const defaultVariant: MarathonVariant =
    initial.variant ?? (fullSvg ? 'full' : 'half');
  const [variant, setVariant] = useState<MarathonVariant>(defaultVariant);
  const [bib, setBib] = useState(initial.bib);
  const [firstName, setFirstName] = useState(initial.firstName);
  const [lastName, setLastName] = useState(initial.lastName);
  const [raceDate, setRaceDate] = useState(initial.raceDate);
  const [finishHours, setFinishHours] = useState(initial.finishHours);
  const [finishMinutes, setFinishMinutes] = useState(initial.finishMinutes);
  const [finishSeconds, setFinishSeconds] = useState(initial.finishSeconds);
  const finishTime = useMemo(() => {
    if (!finishHours && !finishMinutes && !finishSeconds) return '';
    const pad = (s: string) => s.padStart(2, '0');
    return `${pad(finishHours || '0')}:${pad(finishMinutes || '0')}:${pad(finishSeconds || '0')}`;
  }, [finishHours, finishMinutes, finishSeconds]);
  const [size, setSize] = useState<string>(() => {
    const sizes = Object.keys(marathon.printful_prices ?? {});
    if (initial.size && sizes.includes(initial.size)) return initial.size;
    return sizes.includes('16x20') ? '16x20' : sizes[0] ?? '11x14';
  });
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [added, setAdded] = useState(false);

  const svgWrapRef = useRef<HTMLDivElement | null>(null);

  // Each SVG (full or half) is the artwork as designed — including its
  // own "MARATHON" / "HALF MARATHON" label and route map. The customizer
  // only mutates personalized fields (name, bib, time, date) and the
  // distance (26.2 ↔ 13.1, since the half source happens to ship with
  // 26.2 baked in).
  const activeSvg = variant === 'half' ? halfSvg : fullSvg;
  const variantAvailable = { full: !!fullSvg, half: !!halfSvg };

  const priceCents = marathon.printful_prices?.[size] ?? 0;

  // Inject the SVG once per variant change via innerHTML — never via
  // dangerouslySetInnerHTML. React would otherwise re-set innerHTML on
  // every parent re-render (e.g. picking a size), which wipes the live
  // text mutations and snaps the preview back to placeholders.
  useEffect(() => {
    const wrap = svgWrapRef.current;
    if (!wrap) return;
    if (activeSvg) {
      wrap.innerHTML = activeSvg;
    } else {
      wrap.innerHTML = '';
    }
    applyAllToDom(wrap, {
      variant,
      bib,
      firstName,
      lastName,
      raceDate,
      finishTime,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSvg]);

  // Live mutation: each form-field change rewrites just the relevant tspan
  // text in place. Does not touch innerHTML so re-renders on size/gift/etc.
  // are no-ops for the preview DOM.
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
      // Marathon items are unique per personalization — quantity stays
      // at 1. If a customer wants two, they go through the customizer
      // again so each gift can have its own bib/name/etc.
      quantity: 1,
      // Show the marathon poster in the cart instead of falling back to
      // the generic PrintPreview placeholder.
      imageUrl: marathon.thumbnail_path ?? undefined,
      isCustom: true,
      customization,
      isGift,
      giftMessage: isGift ? giftMessage : undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const formValid = useMemo(
    () =>
      firstName.trim().length > 0 &&
      lastName.trim().length > 0 &&
      bib.trim().length > 0 &&
      raceDate.length > 0 &&
      // require at least minutes — runners with sub-1-hour halves still
      // have minutes; an all-zero time is almost certainly an empty form.
      (finishHours.length > 0 || finishMinutes.length > 0),
    [firstName, lastName, bib, raceDate, finishHours, finishMinutes],
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
                  <div ref={svgWrapRef} className="marathon-svg-wrap" />
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
              <div className="text-sm font-semibold text-ink mb-2">Race</div>
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
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">
                  Finish time <span className="text-coral">*</span>
                </label>
                {/* Mobile: simple 3-col grid (no visual colon separators
                    — the placeholders HH/MM/SS already convey the format).
                    Tablet+: revert to the original colon-separated layout. */}
                <div className="grid grid-cols-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2">
                  <input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={2}
                    aria-label="Hours"
                    placeholder="HH"
                    className="input-field text-center"
                    value={finishHours}
                    onChange={(e) => setFinishHours(e.target.value.replace(/\D/g, '').slice(0, 2))}
                  />
                  <span className="hidden sm:inline text-mid font-semibold" aria-hidden="true">:</span>
                  <input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={2}
                    aria-label="Minutes"
                    placeholder="MM"
                    className="input-field text-center"
                    value={finishMinutes}
                    onChange={(e) => setFinishMinutes(e.target.value.replace(/\D/g, '').slice(0, 2))}
                  />
                  <span className="hidden sm:inline text-mid font-semibold" aria-hidden="true">:</span>
                  <input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={2}
                    aria-label="Seconds"
                    placeholder="SS"
                    className="input-field text-center"
                    value={finishSeconds}
                    onChange={(e) => setFinishSeconds(e.target.value.replace(/\D/g, '').slice(0, 2))}
                  />
                </div>
              </div>
            </div>

            {/* Size picker */}
            <div className="mb-6">
              <div className="text-sm font-semibold text-ink mb-2">Size</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {MARATHON_SIZES.filter((s) =>
                  Object.prototype.hasOwnProperty.call(marathon.printful_prices, s.value),
                ).map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSize(s.value)}
                    className={`min-h-[44px] py-2.5 rounded-lg text-xs font-semibold border-[1.5px] transition-all ${
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
                aria-live="polite"
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  added
                    ? 'bg-mint text-paper'
                    : 'bg-white text-ink hover:bg-primary hover:text-white'
                }`}
              >
                {added ? (
                  <>
                    <Check size={14} strokeWidth={2} aria-hidden="true" /> Added
                  </>
                ) : (
                  <>
                    Add to Cart <ArrowRight size={14} aria-hidden="true" />
                  </>
                )}
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
      <label className="block text-sm font-semibold text-ink mb-1.5">
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
 * placeholder tspan elements. Different city posters can ship with slightly
 * different placeholder values (Las Vegas uses `02:30:22`, Chicago uses
 * `03:02:22`, etc.) — so we identify each tspan's role by *pattern* the
 * first time we see it, store the role on the element, and after that just
 * write the customer's value (or fall back to the SVG's original placeholder
 * when the field is empty).
 *
 * Conventions a marathon SVG must follow for the customizer to wire up:
 *   - Name placeholder must be exactly "John Doe"
 *   - Bib placeholder matches /^#\d+$/  (e.g. "#11456")
 *   - Finish-time placeholder matches /^\d{1,2}:\d{2}:\d{2}$/  (e.g. "02:30:22")
 *   - Date placeholder matches /^\d{1,2}\s*·\s*\d{1,2}\s*·\s*\d{2,4}$/ (e.g. "01 · 10 · 27")
 *   - Distance placeholder is "26.2" (full) or "13.1" (half), as in LV
 */

const RE_BIB = /^#\d+$/;
const RE_TIME = /^\d{1,2}:\d{2}:\d{2}$/;
const RE_DATE = /^\d{1,2}\s*·\s*\d{1,2}\s*·\s*\d{2,4}$/;

type TspanRole = 'name' | 'bib' | 'time' | 'date' | 'distance';

function classifyOriginal(orig: string): TspanRole | null {
  if (orig === SVG_PLACEHOLDERS.name) return 'name';
  if (orig === SVG_PLACEHOLDERS.distanceFull || orig === SVG_PLACEHOLDERS.distanceHalf) return 'distance';
  if (RE_BIB.test(orig)) return 'bib';
  if (RE_TIME.test(orig)) return 'time';
  if (RE_DATE.test(orig)) return 'date';
  return null;
}

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

  const fullName = `${values.firstName} ${values.lastName}`.trim();
  const bibText = values.bib ? `#${values.bib.replace(/^#/, '')}` : '';
  const finish = values.finishTime;
  const date = values.raceDate ? formatRaceDate(values.raceDate) : '';

  const distance =
    values.variant === 'half' ? SVG_PLACEHOLDERS.distanceHalf : SVG_PLACEHOLDERS.distanceFull;

  for (const t of Array.from(tspans)) {
    if (!t.dataset.originalText) {
      const orig = t.textContent ?? '';
      t.dataset.originalText = orig;
      const role = classifyOriginal(orig);
      if (role) t.dataset.role = role;
    }

    const original = t.dataset.originalText ?? '';
    const role = (t.dataset.role as TspanRole | undefined) ?? null;

    switch (role) {
      case 'name':
        t.textContent = fullName || original;
        break;
      case 'bib':
        t.textContent = bibText || original;
        break;
      case 'time':
        t.textContent = finish || original;
        break;
      case 'date':
        t.textContent = date || original;
        break;
      case 'distance':
        t.textContent = distance;
        break;
      default:
        // Static — LAS VEGAS, MARATHON / HALF MARATHON labels (already in
        // the SVG as designed), and any other decorative text.
        break;
    }
  }
}
