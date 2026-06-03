'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CopyInline({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore — clipboard API may be blocked in some contexts
    }
  };

  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1 text-[11px] text-mid hover:text-ink transition-colors"
    >
      {copied ? (
        <>
          <Check size={12} /> Copied
        </>
      ) : (
        <>
          <Copy size={12} /> Copy
        </>
      )}
    </button>
  );
}
