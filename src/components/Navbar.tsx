'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, ShoppingBag } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-[0_1px_12px_rgba(0,0,0,0.04)]'
          : 'bg-white/88 backdrop-blur-xl'
      } border-b border-border/60`}
    >
      <div className="max-w-[1280px] mx-auto px-6 py-3.5 flex items-center justify-between">
        <Link href="/" className="text-[19px] font-extrabold tracking-tight text-ink no-underline">
          Miles Away <span className="text-primary">Prints</span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-8">
          <li>
            <Link href="/prints/golf" className="text-sm font-medium text-mid hover:text-ink transition-colors">
              Prints
            </Link>
          </li>
          <li>
            <Link href="/#how" className="text-sm font-medium text-mid hover:text-ink transition-colors">
              How It Works
            </Link>
          </li>
          <li>
            <Link href="/#gift" className="text-sm font-medium text-mid hover:text-ink transition-colors">
              Gifts
            </Link>
          </li>
          <li>
            <Link href="/#pricing" className="text-sm font-medium text-mid hover:text-ink transition-colors">
              Pricing
            </Link>
          </li>
          <li>
            <Link
              href="/prints/golf"
              className="bg-primary text-white px-6 py-2.5 rounded-full text-[13px] font-semibold
                         hover:bg-primary-dark hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(79,109,245,0.3)]
                         transition-all duration-200"
            >
              Shop Now
            </Link>
          </li>
        </ul>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-border px-6 py-4 space-y-3">
          <Link href="/prints/golf" className="block text-sm font-medium text-ink py-2" onClick={() => setMobileOpen(false)}>
            Prints
          </Link>
          <Link href="/#how" className="block text-sm font-medium text-mid py-2" onClick={() => setMobileOpen(false)}>
            How It Works
          </Link>
          <Link href="/#gift" className="block text-sm font-medium text-mid py-2" onClick={() => setMobileOpen(false)}>
            Gifts
          </Link>
          <Link href="/#pricing" className="block text-sm font-medium text-mid py-2" onClick={() => setMobileOpen(false)}>
            Pricing
          </Link>
          <Link
            href="/prints/golf"
            className="block bg-primary text-white text-center px-6 py-3 rounded-full text-sm font-semibold mt-2"
            onClick={() => setMobileOpen(false)}
          >
            Shop Now
          </Link>
        </div>
      )}
    </nav>
  );
}
