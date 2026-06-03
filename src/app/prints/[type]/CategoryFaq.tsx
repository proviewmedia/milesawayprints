'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { PrintFaq } from '@/data/prints';

interface Props {
  faqs: PrintFaq[];
}

export default function CategoryFaq({ faqs }: Props) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="pb-20 border-t border-border">
      <div className="max-w-[800px] mx-auto px-6 pt-14 md:pt-20">
        <h2 className="text-2xl md:text-3xl font-medium text-ink tracking-tight mb-8">
          Frequently asked questions
        </h2>
        <div className="border-t border-border">
          {faqs.map((it, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="border-b border-border">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-[15px] text-ink">{it.q}</span>
                  <ChevronDown
                    size={16}
                    strokeWidth={1.75}
                    className={`text-mid transition-transform flex-shrink-0 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="pb-5 text-mid text-[15px] leading-relaxed">
                    {it.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
