'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { SITE_BANNER, isSiteBannerActive } from '@/data/site-banner';

const STORAGE_KEY = 'site-banner-dismissed-v1';

export default function SiteBanner() {
  const [hidden, setHidden] = useState(true); // start hidden to avoid SSR flash

  useEffect(() => {
    if (!isSiteBannerActive()) {
      setHidden(true);
      return;
    }
    // Tie dismissal to the active banner's endDate so a new campaign re-shows
    // automatically (we don't want a customer's dismissal of a March promo
    // to suppress the June one).
    const key = `${STORAGE_KEY}-${SITE_BANNER.endDate ?? 'evergreen'}`;
    if (localStorage.getItem(key) === '1') {
      setHidden(true);
    } else {
      setHidden(false);
    }
  }, []);

  const dismiss = () => {
    const key = `${STORAGE_KEY}-${SITE_BANNER.endDate ?? 'evergreen'}`;
    try {
      localStorage.setItem(key, '1');
    } catch {
      // localStorage unavailable; just hide for the session
    }
    setHidden(true);
  };

  if (hidden) return null;

  const content = (
    <span className="text-[12px] md:text-[13px] text-paper">
      {SITE_BANNER.message}
    </span>
  );

  return (
    <div className="bg-ink text-paper">
      <div className="max-w-[1400px] mx-auto px-6 py-2 flex items-center justify-center gap-4 relative">
        {SITE_BANNER.link ? (
          <Link
            href={SITE_BANNER.link}
            className="hover:underline underline-offset-2"
          >
            {content}
          </Link>
        ) : (
          content
        )}
        <button
          onClick={dismiss}
          aria-label="Dismiss banner"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-paper/70 hover:text-paper"
        >
          <X size={14} strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}
