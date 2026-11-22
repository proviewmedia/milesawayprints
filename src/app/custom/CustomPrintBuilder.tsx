'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Check } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import {
  BULK_PRINT_THRESHOLD,
  CUSTOM_PRINT_FLAG,
  MAX_DETAILS_LENGTH,
  MAX_PLACE_LENGTH,
  sortSizes,
  type CustomPrintPricing,
  type CustomPrintType,
  type CustomPrintTypeConfig,
} from '@/data/custom-prints';
import { formatSize } from '@/data/shop';

interface Props {
  types: CustomPrintTypeConfig[];
  pricing: CustomPrintPricing;
  exampleImages: Partial<Record<CustomPrintType, string>>;
  initialType: CustomPrintType;
  /** Switch to the quote form with these details prefilled. */
  onBulkQuote: (details: string) => void;
}

export default function CustomPrintBuilder({ types, pricing, exampleImages, initialType, onBulkQuote }: Props) {
  const { addItem } = useCart();
  const [type, setType] = useState<CustomPrintType>(initialType);
  const [place, setPlace] = useState('');
  const [details, setDetails] = useState('');
  const [size, setSize] = useState('');
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cfg = types.find((t) => t.type === type) ?? types[0];
  const prices = useMemo(() => pricing[type] ?? {}, [pricing, type]);
  const sizes = useMemo(() => sortSizes(Object.keys(prices)), [prices]);
  const priceCents = size ? prices[size] : undefined;

  if (!cfg) {
    return <p className="text-mid">Custom prints are not available right now.</p>;
  }

  const chooseType = (t: CustomPrintType) => {
    setType(t);
    // Size ladders differ by type (city prints use 8x12, 11x17...), so keep
    // the chosen size only if the new type offers it.
    if (size && !(pricing[t] ?? {})[size]) setSize('');
    setError(null);
  };

  const handleAdd = () => {
    const trimmedPlace = place.trim();
    if (!trimmedPlace) return setError(`Tell us the ${cfg.placeLabel.toLowerCase()}.`);
    if (!size || !priceCents) return setError('Pick a size.');
    setError(null);
    addItem({
      slug: `custom-${type}-${Date.now()}`,
      type,
      name: `Custom ${cfg.label.toLowerCase()} print`,
      location: trimmedPlace,
      format: 'physical',
      size,
      priceCents,
      quantity: 1,
      imageUrl: exampleImages[type],
      isCustom: true,
      customization: {
        [CUSTOM_PRINT_FLAG]: 'true',
        custom_type: type,
        place: trimmedPlace.slice(0, MAX_PLACE_LENGTH),
        details: details.trim().slice(0, MAX_DETAILS_LENGTH),
      },
    });
    setAdded(true);
    setPlace('');
    setDetails('');
    setTimeout(() => setAdded(false), 2500);
  };

  const example = exampleImages[type];

  return (
    <div className="grid md:grid-cols-[1fr_1.1fr] gap-10 md:gap-16 items-start">
        {/* Example of the style being ordered */}
        <div className="md:sticky md:top-28">
          <div className="relative aspect-[4/5] bg-soft border border-ink overflow-hidden">
            {example ? (
              <Image
                src={example}
                alt={`Example ${cfg.label.toLowerCase()} print from the shop`}
                fill
                sizes="(min-width: 768px) 45vw, 100vw"
                className="object-contain p-8"
              />
            ) : null}
          </div>
          <p className="text-[13px] text-mid mt-3">
            Example from the shop. Yours is drawn for your place in the same style.
          </p>
        </div>

        <div>
          {/* 01 Type */}
          <fieldset className="mb-8">
            <legend className="eyebrow text-mid mb-3">01 · Print type</legend>
            <div className="flex flex-wrap gap-2" role="radiogroup">
              {types.map((t) => (
                <button
                  key={t.type}
                  type="button"
                  role="radio"
                  aria-checked={type === t.type}
                  onClick={() => chooseType(t.type)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold border-2 transition-colors ${
                    type === t.type ? 'bg-ink text-paper border-ink' : 'border-ink/15 text-ink hover:border-ink'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* 02 Place */}
          <div className="mb-8">
            <label htmlFor="cp-place" className="eyebrow text-mid mb-3 block">
              02 · {cfg.placeLabel}
            </label>
            <input
              id="cp-place"
              type="text"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              maxLength={MAX_PLACE_LENGTH}
              placeholder={cfg.placePlaceholder}
              className="input-field"
              autoComplete="off"
            />
            <label htmlFor="cp-details" className="block text-[13px] font-medium text-ink mt-4 mb-2">
              Anything else? <span className="font-normal text-mid">Optional</span>
            </label>
            <textarea
              id="cp-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              maxLength={MAX_DETAILS_LENGTH}
              rows={3}
              placeholder={cfg.detailsPlaceholder}
              className="input-field resize-y"
            />
          </div>

          {/* 03 Size */}
          <fieldset className="mb-8">
            <legend className="eyebrow text-mid mb-3">
              03 · Size {size && <span className="normal-case tracking-normal font-normal">({formatSize(size)})</span>}
            </legend>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSize(s);
                    setError(null);
                  }}
                  aria-pressed={size === s}
                  className={`min-h-[52px] px-3 py-2 rounded-lg border-2 text-left transition-colors ${
                    size === s ? 'border-ink bg-ink text-paper' : 'border-ink/15 text-ink hover:border-ink'
                  }`}
                >
                  <span className="block text-sm font-bold">{s}</span>
                  <span className={`block text-[13px] ${size === s ? 'text-paper/75' : 'text-mid'}`}>
                    ${(prices[s] / 100).toFixed(0)}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          <button
            type="button"
            onClick={handleAdd}
            aria-live="polite"
            className={`w-full py-4 rounded-full text-sm font-bold transition-colors inline-flex items-center justify-center gap-2 ${
              added ? 'bg-mint text-paper' : 'bg-ink text-paper hover:bg-black'
            }`}
          >
            {added ? (
              <>
                <Check size={16} strokeWidth={2.25} aria-hidden="true" /> Added to cart
              </>
            ) : priceCents ? (
              `Add to cart · $${(priceCents / 100).toFixed(2)}`
            ) : (
              'Add to cart'
            )}
          </button>
          {error && (
            <p className="text-[13px] text-coral mt-3" role="alert">
              {error}
            </p>
          )}
          <p className="text-[13px] text-mid mt-4 leading-relaxed">
            Proof by email within 1 to 2 business days. Printing starts after you approve it, then it ships in
            3 to 5 business days.
          </p>
          <p className="text-[13px] text-mid mt-2">
            Need {BULK_PRINT_THRESHOLD} or more?{' '}
            <button
              type="button"
              onClick={() =>
                onBulkQuote(
                  `Bulk custom ${cfg.label.toLowerCase()} prints${place.trim() ? ` of ${place.trim()}` : ''}${
                    size ? `, ${size}` : ''
                  }.${details.trim() ? ` ${details.trim()}` : ''}`,
                )
              }
              className="text-ink underline underline-offset-2 font-medium"
            >
              Get a quote
            </button>
          </p>
        </div>
    </div>
  );
}
