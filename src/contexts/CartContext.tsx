'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { PrintType } from '@/data/prints';

export interface CartItem {
  id: string; // unique: slug + format + size
  slug: string; // gallery item slug OR 'custom-{type}-{ts}' for custom orders
  type: PrintType;
  name: string;
  location: string;
  format: 'digital' | 'physical';
  size: string;
  priceCents: number;
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
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  subtotalCents: number;
  count: number;
}

const STORAGE_KEY = 'map-cart-v1';
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
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
    setItems((prev) => {
      if (prev.some((it) => it.id === id && !it.isCustom)) return prev; // avoid dupe for non-custom
      return [...prev, { ...raw, id }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const subtotalCents = items.reduce((acc, it) => acc + it.priceCents, 0);
  const count = items.length;

  return (
    <CartContext.Provider
      value={{ items, isOpen, addItem, removeItem, clear, open, close, subtotalCents, count }}
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
