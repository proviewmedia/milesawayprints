'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { PrintType } from '@/data/prints';
import { trackAddToCart } from '@/lib/track';

export interface CartItem {
  id: string; // unique: slug + format + size + gift
  slug: string; // gallery item slug OR 'custom-{type}-{ts}' for custom orders
  type: PrintType;
  name: string;
  location: string;
  format: 'digital' | 'physical';
  size: string;
  priceCents: number;
  /** Number of units the customer wants. Custom/marathon items keep
   *  quantity=1 because each personalization is unique. */
  quantity: number;
  /** Real product image (Printful sync). Falls back to SVG preview if absent. */
  imageUrl?: string;
  isCustom?: boolean;
  customization?: Record<string, string>;
  isGift?: boolean;
  giftMessage?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

interface CartContextValue extends CartState {
  /** Add an item to the cart. If the same SKU+gift combo already exists
   *  and is NOT a custom (personalized) item, the quantity is summed
   *  rather than creating a duplicate row. */
  addItem: (item: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  /** Set the absolute quantity for an item. Clamped to ≥1; pass via
   *  removeItem to delete entirely. Custom items can't be quantified
   *  this way — their quantity is locked to 1. */
  setQuantity: (id: string, quantity: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  subtotalCents: number;
  count: number;
}

const STORAGE_KEY = 'map-cart-v2';
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        // Migrate legacy items that pre-date the `quantity` field.
        const parsed = JSON.parse(raw) as CartItem[];
        const migrated = parsed.map((it) => ({
          ...it,
          quantity: typeof it.quantity === 'number' && it.quantity > 0 ? it.quantity : 1,
        }));
        setItems(migrated);
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, hydrated]);

  const addItem: CartContextValue['addItem'] = useCallback((raw) => {
    const id = `${raw.slug}:${raw.format}:${raw.size}:${raw.isGift ? 'g' : 'n'}`;
    const addQty = Math.max(1, raw.quantity ?? 1);
    setItems((prev) => {
      // Custom (personalized) items always create a fresh row — each
      // print has its own name/bib/etc.
      if (raw.isCustom) {
        return [...prev, { ...raw, quantity: addQty, id }];
      }
      const existingIdx = prev.findIndex((it) => it.id === id);
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = {
          ...next[existingIdx],
          quantity: next[existingIdx].quantity + addQty,
        };
        return next;
      }
      return [...prev, { ...raw, quantity: addQty, id }];
    });
    setIsOpen(true);
    trackAddToCart(
      [
        {
          id: raw.slug,
          name: raw.name,
          category: raw.type,
          variant: raw.size,
          price: raw.priceCents / 100,
          quantity: addQty,
        },
      ],
      (raw.priceCents * addQty) / 100,
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }, []);

  const setQuantity = useCallback((id: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((it) => {
          if (it.id !== id) return it;
          // Custom items stay at 1 — each is a unique personalized print.
          if (it.isCustom) return it;
          const next = Math.max(1, Math.floor(quantity));
          return { ...it, quantity: next };
        })
        .filter(Boolean),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const subtotalCents = items.reduce(
    (acc, it) => acc + it.priceCents * (it.quantity || 1),
    0,
  );
  const count = items.reduce((acc, it) => acc + (it.quantity || 1), 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        addItem,
        removeItem,
        setQuantity,
        clear,
        open,
        close,
        subtotalCents,
        count,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
