'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, Minus, Plus } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import PrintPreview from './PrintPreview';
import WallFrame from './WallFrame';

export default function CartDrawer() {
  const { items, isOpen, close, removeItem, setQuantity, subtotalCents, count } = useCart();
  const drawerRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Remember whichever element triggered the open so we can return
    // focus there on close (keyboard a11y).
    previousFocusRef.current = document.activeElement as HTMLElement | null;

    const drawer = drawerRef.current;
    // Move focus into the drawer when it opens. Pick the first focusable
    // element (typically the close button) so screen readers + keyboard
    // users land somewhere meaningful inside.
    const firstFocusable = drawer?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    firstFocusable?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        return;
      }
      // Focus trap: when Tab/Shift+Tab would leave the drawer, wrap.
      if (e.key !== 'Tab' || !drawer) return;
      const focusables = drawer.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && active === first) {
        last.focus();
        e.preventDefault();
      } else if (!e.shiftKey && active === last) {
        first.focus();
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      // Return focus to whichever element opened the drawer.
      previousFocusRef.current?.focus();
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
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
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
                    ) : it.type === 'marathon' ? (
                      // Marathon items: PrintPreview doesn't know how to
                      // render the marathon customization shape, so it
                      // produces garbled letters. Show a clean labeled
                      // tile instead until the user re-adds the item.
                      <div className="w-full h-full bg-ink text-paper flex flex-col items-center justify-center text-center px-1">
                        <span className="text-[8px] tracking-widest uppercase opacity-60">
                          Custom
                        </span>
                        <span className="text-[10px] font-medium leading-tight mt-0.5">
                          {it.customization?.first_name
                            ? `${it.customization.first_name}'s Print`
                            : 'Marathon Print'}
                        </span>
                      </div>
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
                        aria-label={`Remove ${it.name}`}
                        className="text-mid hover:text-ink transition-colors -mt-0.5 w-8 h-8 flex items-center justify-center"
                      >
                        <Trash2 size={14} strokeWidth={1.75} aria-hidden="true" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      {it.isCustom ? (
                        <span className="text-[12px] text-mid">Qty 1</span>
                      ) : (
                        <div className="inline-flex items-center border border-border rounded-full">
                          <button
                            onClick={() => setQuantity(it.id, it.quantity - 1)}
                            disabled={it.quantity <= 1}
                            aria-label={`Decrease quantity of ${it.name}`}
                            className="w-8 h-8 flex items-center justify-center text-ink hover:bg-soft disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Minus size={12} strokeWidth={1.75} aria-hidden="true" />
                          </button>
                          <span
                            className="w-7 text-center text-[13px] text-ink tabular-nums"
                            aria-live="polite"
                          >
                            {it.quantity}
                          </span>
                          <button
                            onClick={() => setQuantity(it.id, it.quantity + 1)}
                            disabled={it.quantity >= 99}
                            aria-label={`Increase quantity of ${it.name}`}
                            className="w-8 h-8 flex items-center justify-center text-ink hover:bg-soft disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Plus size={12} strokeWidth={1.75} aria-hidden="true" />
                          </button>
                        </div>
                      )}
                      <div className="text-sm text-ink whitespace-nowrap">
                        ${((it.priceCents * it.quantity) / 100).toFixed(2)}
                      </div>
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
