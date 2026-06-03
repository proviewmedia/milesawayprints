'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const WELCOME_CODE_KEY = 'welcome-code';

/**
 * Captures `?code=XXX` from any URL into localStorage so the eventual
 * /checkout visit can auto-apply it via Stripe. Without this, the code
 * only works if it survives all the way to /checkout in the URL bar —
 * but customers typically browse a few pages between landing and
 * checkout, dropping the param.
 */
export default function WelcomeCodeStasher() {
  const params = useSearchParams();

  useEffect(() => {
    const code = params?.get('code')?.trim();
    if (!code) return;
    try {
      localStorage.setItem(WELCOME_CODE_KEY, code);
    } catch {}
  }, [params]);

  return null;
}
