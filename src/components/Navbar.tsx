'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, ShoppingBag, Search, User } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useSearch } from '@/contexts/SearchContext';

interface NavbarProps {
  /** Visitor's country for the top-left utility-bar label. Defaults to United States. */
  defaultCountry?: string;
}

// Keyword-rich internal links to the rankable /prints/[type] landing pages.
// Anchor text is the search phrase ("Airport Prints"), not the on-page H1.
const CATEGORY_LINKS = [
  { label: 'Airport Prints', href: '/prints/airport' },
  { label: 'Golf Course Prints', href: '/prints/golf' },
  { label: 'City Skyline Prints', href: '/prints/skyline' },
  { label: 'City Street Map Prints', href: '/prints/city' },
  { label: 'Stadium Prints', href: '/prints/stadium' },
  { label: 'Marathon Prints', href: '/prints/marathon' },
  { label: 'F1 Circuit Prints', href: '/prints/f1' },
];

const GIFT_LINKS = [
  { label: "Father's Day Gifts", href: '/gifts/fathers-day' },
  { label: "Mother's Day Gifts", href: '/gifts/mothers-day' },
  { label: "Valentine's Day Gifts", href: '/gifts/valentines-day' },
  { label: 'Birthday Gifts', href: '/gifts/birthday' },
  { label: 'Anniversary Gifts', href: '/gifts/anniversary' },
  { label: 'Wedding Gifts', href: '/gifts/wedding' },
  { label: 'Graduation Gifts', href: '/gifts/graduation' },
  { label: 'Christmas Gifts', href: '/gifts/christmas' },
];

export default function Navbar({ defaultCountry = 'United States' }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { count, open } = useCart();
  const { open: openSearch } = useSearch();

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Top utility bar — current campaign promo. Visible on mobile +
          desktop. Move About to the footer. */}
      <div className="bg-ink text-paper text-xs">
        <div className="max-w-[1400px] mx-auto px-6 py-2 flex items-center justify-center">
          <Link
            href="/gifts/fathers-day"
            className="opacity-90 hover:opacity-100 text-center"
          >
            Father&apos;s Day golf prints available — Pebble Beach, St. Andrews &amp; more →
          </Link>
        </div>
      </div>

      {/* Main nav */}
      <nav className="bg-paper border-b border-border">
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between gap-6">
          <Link
            href="/"
            className="text-[19px] font-medium tracking-tight text-ink no-underline whitespace-nowrap"
          >
            Miles Away <span className="font-normal text-mid">Prints</span>
          </Link>

          <ul className="hidden md:flex items-center gap-8">
            {/* Prints + Gifts open on hover (pointer) and focus-within
                (keyboard) — no JS, links stay in the DOM for crawlers. */}
            <li className="group relative">
              <Link href="/shop" className="text-[15px] font-normal text-ink hover:opacity-60 transition-opacity">
                Prints
              </Link>
              <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-opacity absolute left-1/2 -translate-x-1/2 top-full pt-3 z-10">
                <div className="bg-paper border border-border rounded-xl shadow-[0_12px_40px_-12px_rgba(0,0,0,0.18)] p-2 w-56">
                  {CATEGORY_LINKS.map((l) => (
                    <Link key={l.href} href={l.href} className="block px-3 py-2 rounded-lg text-sm text-ink hover:bg-soft transition-colors">
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            </li>
            <li className="group relative">
              <Link href="/gifts" className="text-[15px] font-normal text-ink hover:opacity-60 transition-opacity">
                Gifts
              </Link>
              <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-opacity absolute left-1/2 -translate-x-1/2 top-full pt-3 z-10">
                <div className="bg-paper border border-border rounded-xl shadow-[0_12px_40px_-12px_rgba(0,0,0,0.18)] p-2 w-56">
                  {GIFT_LINKS.map((l) => (
                    <Link key={l.href} href={l.href} className="block px-3 py-2 rounded-lg text-sm text-ink hover:bg-soft transition-colors">
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            </li>
            <li>
              <Link href="/shop" className="text-[15px] font-normal text-ink hover:opacity-60 transition-opacity">
                Shop all
              </Link>
            </li>
          </ul>

          <div className="flex items-center gap-1">
            <button
              onClick={openSearch}
              aria-label="Search"
              className="hidden md:flex w-10 h-10 rounded-full hover:bg-soft items-center justify-center transition-colors"
            >
              <Search size={18} strokeWidth={1.75} className="text-ink" />
            </button>

            <Link
              href="/account"
              aria-label="Account"
              className="hidden md:flex w-10 h-10 rounded-full hover:bg-soft items-center justify-center transition-colors"
            >
              <User size={18} strokeWidth={1.75} className="text-ink" />
            </Link>

            <button
              onClick={open}
              aria-label={count > 0 ? `Open cart, ${count} item${count === 1 ? '' : 's'}` : 'Open cart'}
              className="relative w-10 h-10 rounded-full hover:bg-soft flex items-center justify-center transition-colors"
            >
              <ShoppingBag size={18} strokeWidth={1.75} className="text-ink" aria-hidden="true" />
              {count > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute top-1 right-1 min-w-[16px] h-[16px] bg-ink text-paper text-[10px] font-medium rounded-full flex items-center justify-center px-1"
                >
                  {count}
                </span>
              )}
            </button>

            <button
              onClick={openSearch}
              aria-label="Search"
              className="md:hidden w-10 h-10 rounded-full hover:bg-soft flex items-center justify-center transition-colors"
            >
              <Search size={18} strokeWidth={1.75} className="text-ink" />
            </button>

            <button
              className="md:hidden w-10 h-10 flex items-center justify-center"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-paper border-t border-border px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
            <Link href="/shop" className="block text-base font-medium text-ink" onClick={() => setMobileOpen(false)}>
              Shop all prints
            </Link>

            <div>
              <div className="text-[11px] font-medium uppercase tracking-widest text-mid mb-2">Prints</div>
              <div className="space-y-2">
                {CATEGORY_LINKS.map((l) => (
                  <Link key={l.href} href={l.href} className="block text-[15px] text-ink" onClick={() => setMobileOpen(false)}>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-medium uppercase tracking-widest text-mid mb-2">Gifts</div>
              <div className="space-y-2">
                {GIFT_LINKS.map((l) => (
                  <Link key={l.href} href={l.href} className="block text-[15px] text-ink" onClick={() => setMobileOpen(false)}>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            <Link href="/about" className="block text-base font-normal text-ink" onClick={() => setMobileOpen(false)}>
              About
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
