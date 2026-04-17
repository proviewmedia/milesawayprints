'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { X, Download, Truck, ArrowRight } from 'lucide-react';
import WallFrame from './WallFrame';
import PrintPreview from './PrintPreview';
import { DesignSummary } from '@/data/shop';
import { PRICING } from '@/data/prints';
import { useCart } from '@/contexts/CartContext';

type Format = 'digital' | 'physical';

interface Props {
  design: DesignSummary | null;
  onClose: () => void;
}

export default function QuickShopModal({ design, onClose }: Props) {
  const [format, setFormat] = useState<Format>('digital');
  const [size, setSize] = useState(PRICING.sizes[0].value);
  const { addItem } = useCart();

  useEffect(() => {
    if (!design) return;
    setFormat('digital');
    setSize(PRICING.sizes[0].value);
  }, [design]);

  useEffect(() => {
    if (!design) return;
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onEsc);
      document.body.style.overflow = '';
    };
  }, [design, onClose]);

  const price = useMemo(() => {
    const s = PRICING.sizes.find((x) => x.value === size) ?? PRICING.sizes[0];
    return format === 'digital' ? s.digital : s.physical;
  }, [size, format]);

  if (!design) return null;

  const handleAdd = () => {
    addItem({
      slug: design.slug,
      type: design.type,
      name: design.name,
      location: design.location,
      format,
      size,
      priceCents: price * 100,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-ink/60 backdrop-blur-sm p-0 md:p-6 animate-fade-up"
      onClick={onClose}
    >
      <div
        className="bg-white w-full md:max-w-4xl md:rounded-2xl rounded-t-2xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <div className="text-[10px] tracking-widest uppercase font-semibold text-primary">
              Quick Shop
            </div>
            <div className="font-bold text-ink text-sm mt-0.5">{design.name}</div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full hover:bg-soft flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid md:grid-cols-2 overflow-y-auto">
          <div className="p-6 bg-soft flex items-center justify-center">
            <div className="w-full max-w-xs">
              <WallFrame>
                <PrintPreview type={design.type} values={design.values} />
              </WallFrame>
            </div>
          </div>

          <div className="p-6 flex flex-col">
            <div className="mb-1 text-xs uppercase tracking-wider text-mid">
              {design.location}
            </div>
            <h3 className="font-extrabold text-xl text-ink mb-2">{design.name}</h3>
            {design.description && (
              <p className="text-sm text-mid leading-relaxed mb-5">{design.description}</p>
            )}

            <div className="mb-4">
              <div className="text-xs font-semibold text-ink mb-2">Format</div>
              <div className="grid grid-cols-2 gap-2">
                <FormatBtn
                  active={format === 'digital'}
                  onClick={() => setFormat('digital')}
                  icon={<Download size={14} />}
                  title="Digital"
                  sub="Instant"
                />
                <FormatBtn
                  active={format === 'physical'}
                  onClick={() => setFormat('physical')}
                  icon={<Truck size={14} />}
                  title="Physical"
                  sub="Shipped"
                />
              </div>
            </div>

            <div className="mb-5">
              <div className="text-xs font-semibold text-ink mb-2">Size</div>
              <div className="grid grid-cols-3 gap-2">
                {PRICING.sizes.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSize(s.value)}
                    className={`py-2 rounded-lg text-xs font-semibold border-[1.5px] transition-all ${
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

            <div className="mt-auto flex items-center justify-between pt-4 border-t border-border">
              <div>
                <div className="text-[10px] tracking-widest uppercase text-mid">Price</div>
                <div className="text-2xl font-extrabold text-ink">${price}</div>
              </div>
              <button
                onClick={handleAdd}
                className="btn-primary !py-3 !px-6"
              >
                Add to Cart <ArrowRight size={14} />
              </button>
            </div>
            <Link
              href={`/shop/${design.slug}`}
              className="text-center text-xs text-mid hover:text-primary mt-3"
              onClick={onClose}
            >
              View full details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormatBtn({
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
      className={`p-3 rounded-xl border-[1.5px] text-left transition-all ${
        active
          ? 'border-primary bg-primary-light'
          : 'border-border bg-white hover:border-primary/50'
      }`}
    >
      <div className={`flex items-center gap-2 ${active ? 'text-primary' : 'text-ink'}`}>
        {icon}
        <span className="font-bold text-sm">{title}</span>
      </div>
      <div className="text-[11px] text-mid mt-0.5">{sub}</div>
    </button>
  );
}
