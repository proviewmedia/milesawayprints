'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { X, Trash2, ArrowRight, Gift, Download, Truck, ShoppingBag } from 'lucide-react';
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
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-ink/50 backdrop-blur-sm z-[60] transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={close}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-white z-[61] shadow-2xl flex flex-col transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-ink" />
            <h3 className="font-bold text-ink">Your Cart</h3>
            {count > 0 && (
              <span className="bg-primary-light text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                {count}
              </span>
            )}
          </div>
          <button onClick={close} aria-label="Close cart" className="w-9 h-9 rounded-full hover:bg-soft flex items-center justify-center">
            <X size={18} />
          </button>
        </div>

        {count === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-soft flex items-center justify-center mb-4">
              <ShoppingBag size={24} className="text-mid" />
            </div>
            <p className="text-ink font-semibold mb-1">Your cart is empty</p>
            <p className="text-sm text-mid mb-6">Every great wall starts with one print.</p>
            <Link href="/shop" onClick={close} className="btn-primary">
              Browse the Shop <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {items.map((it) => (
                <div key={it.id} className="flex gap-3 pb-4 border-b border-border last:border-b-0">
                  <div className="w-20 flex-shrink-0">
                    <WallFrame compact>
                      <PrintPreview
                        type={it.type}
                        values={it.customization ?? { name: it.name, location: it.location }}
                      />
                    </WallFrame>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-bold text-ink text-sm truncate">{it.name}</div>
                        <div className="text-xs text-mid truncate">{it.location}</div>
                      </div>
                      <button
                        onClick={() => removeItem(it.id)}
                        aria-label="Remove"
                        className="text-mid hover:text-coral transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="flex items-center flex-wrap gap-2 mt-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-soft text-mid uppercase tracking-wider">
                        {it.format === 'digital' ? <Download size={10} /> : <Truck size={10} />}
                        {it.format}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-soft text-mid">
                        {it.size}
                      </span>
                      {it.isGift && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-coral-light text-coral uppercase tracking-wider">
                          <Gift size={10} /> Gift
                        </span>
                      )}
                      {it.isCustom && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary-light text-primary uppercase tracking-wider">
                          Custom
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-sm font-bold text-ink">
                      ${(it.priceCents / 100).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border px-5 py-4 space-y-3 bg-soft">
              <div className="flex items-center justify-between">
                <span className="text-sm text-mid">Subtotal</span>
                <span className="text-lg font-extrabold text-ink">
                  ${(subtotalCents / 100).toFixed(2)}
                </span>
              </div>
              <p className="text-[11px] text-light-mid text-center">
                Shipping and taxes calculated at checkout.
              </p>
              <Link
                href="/checkout"
                onClick={close}
                className="btn-primary w-full justify-center"
              >
                Checkout <ArrowRight size={14} />
              </Link>
              <button
                onClick={close}
                className="w-full text-xs text-mid hover:text-ink py-1"
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
