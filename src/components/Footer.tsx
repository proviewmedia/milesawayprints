import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-paper">
      <div className="max-w-[1400px] mx-auto px-6 pt-16 pb-10">
        <div className="grid md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10">
          <div>
            <Link href="/" className="text-[18px] font-medium tracking-tight text-ink no-underline">
              Miles Away <span className="font-normal text-mid">Prints</span>
            </Link>
            <p className="text-sm text-mid mt-4 max-w-[280px] leading-relaxed">
              Custom location art prints. Stadiums, airports, marathons, golf courses, city streets — printed on archival paper, delivered worldwide.
            </p>
          </div>

          <div>
            <h4 className="text-[13px] font-medium text-ink mb-4">Shop</h4>
            <ul className="space-y-3">
              <li><Link href="/shop" className="text-sm text-mid hover:text-ink transition-colors">All Prints</Link></li>
              <li><Link href="/shop?category=stadium" className="text-sm text-mid hover:text-ink transition-colors">Stadiums</Link></li>
              <li><Link href="/shop?category=airport" className="text-sm text-mid hover:text-ink transition-colors">Airports</Link></li>
              <li><Link href="/shop?category=marathon" className="text-sm text-mid hover:text-ink transition-colors">Marathons</Link></li>
              <li><Link href="/shop?category=golf" className="text-sm text-mid hover:text-ink transition-colors">Golf Courses</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[13px] font-medium text-ink mb-4">Help</h4>
            <ul className="space-y-3">
              <li><Link href="/faq" className="text-sm text-mid hover:text-ink transition-colors">FAQ</Link></li>
              <li><Link href="/shipping" className="text-sm text-mid hover:text-ink transition-colors">Shipping</Link></li>
              <li><Link href="/returns" className="text-sm text-mid hover:text-ink transition-colors">Returns</Link></li>
              <li><Link href="/contact" className="text-sm text-mid hover:text-ink transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[13px] font-medium text-ink mb-4">Follow</h4>
            <ul className="space-y-3">
              <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-sm text-mid hover:text-ink transition-colors">Instagram</a></li>
              <li><a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="text-sm text-mid hover:text-ink transition-colors">Pinterest</a></li>
              <li><a href="https://www.etsy.com/shop/MilesAwayPrints" target="_blank" rel="noopener noreferrer" className="text-sm text-mid hover:text-ink transition-colors">Etsy Shop</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-mid">
          <p>&copy; {new Date().getFullYear()} Miles Away Prints. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-ink transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-ink transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
