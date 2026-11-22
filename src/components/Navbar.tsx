'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, ShoppingBag, Search, User } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useSearch } from '@/contexts/SearchContext';
import { NAV_LINKS, START_HREF, START_LABEL, isActive } from '@/data/nav';

interface NavbarProps {
  /** Visitor's country for the top-left utility-bar label. Defaults to United States. */
  defaultCountry?: string;
}

export default function Navbar({ defaultCountry = 'United States' }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { count, open } = useCart();
  const { open: openSearch } = useSearch();
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Top utility bar — current campaign promo. Visible on mobile +
          desktop. Move About to the footer. */}
      <div className="bg-ink text-paper text-xs">
        <div className="max-w-[1400px] mx-auto px-6 py-2 flex items-center justify-center">
          <Link
            href="/custom"
            className="opacity-90 hover:opacity-100 text-center"
          >
            Order prints online, or get a free quote on shirts, hats, stickers, and more →
          </Link>
        </div>
      </div>

      {/* Main nav */}
      <nav className="bg-paper border-b border-border">
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between gap-6">
          <Link href="/" className="shrink-0" aria-label="The INQ Press home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/inq-logo-black.png" alt="INQ Press" width={951} height={303} className="h-8 md:h-9 w-auto" />
          </Link>

          <ul className="hidden lg:flex items-center gap-7">
            {NAV_LINKS.map((l) => {
              const active = isActive(l, pathname);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={active ? 'page' : undefined}
                    className={`text-[15px] font-semibold text-ink transition-opacity underline-offset-[10px] decoration-2 ${
                      active ? 'underline' : 'hover:opacity-60'
                    }`}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-1">
            <Link
              href={START_HREF}
              aria-current={pathname?.startsWith(START_HREF) ? 'page' : undefined}
              className={`hidden md:inline-flex btn-primary font-bold py-2.5 px-5 text-[13px] mr-2 ${
                pathname?.startsWith(START_HREF) ? 'ring-2 ring-ink ring-offset-2 ring-offset-paper' : ''
              }`}
            >
              {START_LABEL}
            </Link>
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
              className="lg:hidden w-10 h-10 flex items-center justify-center"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden bg-paper border-t border-border px-6 py-5 space-y-4">
            {NAV_LINKS.map((l) => {
              const active = isActive(l, pathname);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-3 font-display font-black uppercase text-2xl tracking-tight ${
                    active ? 'text-ink' : 'text-ink/45'
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {active && <span aria-hidden="true" className="w-2 h-2 bg-ink rounded-full" />}
                  {l.label}
                </Link>
              );
            })}
            <Link href={START_HREF} className="btn-primary font-bold w-full" onClick={() => setMobileOpen(false)}>
              {START_LABEL}
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
