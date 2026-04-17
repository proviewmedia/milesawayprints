'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { count, open } = useCart();

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
      <div className="max-w-[1280px] mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
        <Link href="/" className="text-[19px] font-extrabold tracking-tight text-ink no-underline whitespace-nowrap">
          Miles Away <span className="text-primary">Prints</span>
        </Link>

        <ul className="hidden md:flex items-center gap-7">
          <li>
            <Link href="/shop" className="text-sm font-medium text-mid hover:text-ink transition-colors">
              Shop
            </Link>
          </li>
          <li>
            <Link href="/prints/golf" className="text-sm font-medium text-mid hover:text-ink transition-colors">
              Custom
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
        </ul>

        <div className="flex items-center gap-2">
          <button
            onClick={open}
            aria-label="Open cart"
            className="relative w-10 h-10 rounded-full hover:bg-soft flex items-center justify-center transition-colors"
          >
            <ShoppingBag size={18} className="text-ink" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                {count}
              </span>
            )}
          </button>

          <Link
            href="/shop"
            className="hidden md:inline-flex bg-primary text-white px-5 py-2.5 rounded-full text-[13px] font-semibold hover:bg-primary-dark hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(79,109,245,0.3)] transition-all duration-200"
          >
            Shop Now
          </Link>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-border px-6 py-4 space-y-3">
          <Link href="/shop" className="block text-sm font-medium text-ink py-2" onClick={() => setMobileOpen(false)}>
            Shop
          </Link>
          <Link href="/prints/golf" className="block text-sm font-medium text-mid py-2" onClick={() => setMobileOpen(false)}>
            Custom
          </Link>
          <Link href="/#how" className="block text-sm font-medium text-mid py-2" onClick={() => setMobileOpen(false)}>
            How It Works
          </Link>
          <Link href="/#gift" className="block text-sm font-medium text-mid py-2" onClick={() => setMobileOpen(false)}>
            Gifts
          </Link>
          <Link
            href="/shop"
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
