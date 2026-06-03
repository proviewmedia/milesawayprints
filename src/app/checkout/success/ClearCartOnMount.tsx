'use client';

import { useEffect, useRef } from 'react';
import { useCart } from '@/contexts/CartContext';
import { trackPurchase } from '@/lib/track';

interface PurchaseItem {
  id: string;
  name: string;
  category?: string;
  variant?: string;
  price: number;
  quantity: number;
}

interface Props {
  /** Skip the purchase event if absent (e.g. order lookup failed). */
  purchase?: {
    orderId: string;
    items: PurchaseItem[];
    valueUsd: number;
  };
}

const FIRED_KEY_PREFIX = 'purchase-fired:';

export default function ClearCartOnMount({ purchase }: Props) {
  const { clear } = useCart();
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    clear();
    try {
      localStorage.removeItem('welcome-code');
    } catch {}

    // De-dupe purchase event across refreshes (e.g. customer reloads the
    // success page) by keying on orderId in sessionStorage.
    if (purchase) {
      const key = `${FIRED_KEY_PREFIX}${purchase.orderId}`;
      try {
        if (!sessionStorage.getItem(key)) {
          trackPurchase(purchase);
          sessionStorage.setItem(key, '1');
        }
      } catch {
        trackPurchase(purchase);
      }
    }
  }, [clear, purchase]);

  return null;
}
