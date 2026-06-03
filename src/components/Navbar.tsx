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
            <li>
              <Link href="/shop" className="text-[15px] font-normal text-ink hover:opacity-60 transition-opacity">
                Shop
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
          <div className="md:hidden bg-paper border-t border-border px-6 py-5 space-y-4">
            <Link href="/shop" className="block text-base font-normal text-ink" onClick={() => setMobileOpen(false)}>
              Shop
            </Link>
            <Link href="/about" className="block text-base font-normal text-ink" onClick={() => setMobileOpen(false)}>
              About
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
