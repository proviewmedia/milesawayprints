'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import PrintPreview from './PrintPreview';
import WallFrame from './WallFrame';

export default function CartDrawer() {
  const { items, isOpen, close, removeItem, subtotalCents, count } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('keydown', onEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, close]);

  return (
    <>
      <div
        className={`fixed inset-0 bg-ink/40 z-[60] transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={close}
      />

      <aside
        className={`fixed top-0 right-0 bottom-0 w-full sm:w-[440px] bg-paper z-[61] flex flex-col transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h3 className="text-base text-ink">
            Cart {count > 0 && <span className="text-mid">({count})</span>}
          </h3>
          <button
            onClick={close}
            aria-label="Close cart"
            className="w-9 h-9 rounded-full hover:bg-soft flex items-center justify-center"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        {count === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <p className="text-ink mb-2">Your cart is empty.</p>
            <p className="text-sm text-mid mb-7 max-w-[260px]">
              Every great wall starts with one print.
            </p>
            <Link href="/shop" onClick={close} className="btn-primary">
              Browse the shop
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {items.map((it) => (
                <div key={it.id} className="flex gap-4 pb-5 border-b border-border last:border-b-0">
                  <div className="w-20 h-24 flex-shrink-0 bg-soft overflow-hidden flex items-center justify-center">
                    {it.imageUrl ? (
                      <Image
                        src={it.imageUrl}
                        alt={it.name}
                        width={160}
                        height={200}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full p-2">
                        <WallFrame compact>
                          <PrintPreview
                            type={it.type}
                            values={it.customization ?? { name: it.name, location: it.location }}
                          />
                        </WallFrame>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm text-ink truncate">{it.name}</div>
                        <div className="text-[12px] text-mid mt-0.5">
                          {it.format === 'digital' ? 'Digital' : it.size}
                          {it.isGift && ' · Gift'}
                          {it.isCustom && ' · Custom'}
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(it.id)}
                        aria-label="Remove"
                        className="text-mid hover:text-ink transition-colors -mt-0.5"
                      >
                        <Trash2 size={14} strokeWidth={1.75} />
                      </button>
                    </div>
                    <div className="mt-2 text-sm text-ink">
                      ${(it.priceCents / 100).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border px-6 py-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-mid">Subtotal</span>
                <span className="text-base text-ink">
                  ${(subtotalCents / 100).toFixed(2)}
                </span>
              </div>
              <p className="text-[12px] text-mid">
                Shipping and taxes calculated at checkout.
              </p>
              <Link
                href="/checkout"
                onClick={close}
                className="btn-primary w-full"
              >
                Checkout
              </Link>
              <button
                onClick={close}
                className="w-full text-sm text-mid hover:text-ink underline underline-offset-2 py-1"
              >
                Continue shopping
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
