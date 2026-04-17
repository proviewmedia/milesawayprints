import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-soft">
      <div className="max-w-[1280px] mx-auto px-6 pt-14 pb-10">
        <div className="flex flex-col md:flex-row justify-between gap-10">
          <div>
            <Link href="/" className="text-[17px] font-extrabold text-ink no-underline">
              Miles Away <span className="text-primary">Prints</span>
            </Link>
            <p className="text-[13px] text-mid mt-2 max-w-[260px] leading-relaxed">
              Custom location art prints designed in Las Vegas. Your favorite places, beautifully printed.
            </p>
          </div>

          <div className="flex gap-12 flex-wrap">
            <div>
              <h4 className="text-xs font-bold tracking-wider uppercase text-ink mb-3.5">Prints</h4>
              <div className="space-y-2.5">
                <Link href="/prints/stadium" className="block text-[13px] text-mid hover:text-primary transition-colors">Stadiums</Link>
                <Link href="/prints/airport" className="block text-[13px] text-mid hover:text-primary transition-colors">Airports</Link>
                <Link href="/prints/marathon" className="block text-[13px] text-mid hover:text-primary transition-colors">Marathons</Link>
                <Link href="/prints/city" className="block text-[13px] text-mid hover:text-primary transition-colors">City Streets</Link>
                <Link href="/prints/golf" className="block text-[13px] text-mid hover:text-primary transition-colors">Golf Courses</Link>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold tracking-wider uppercase text-ink mb-3.5">Help</h4>
              <div className="space-y-2.5">
                <Link href="/faq" className="block text-[13px] text-mid hover:text-primary transition-colors">FAQ</Link>
                <Link href="/shipping" className="block text-[13px] text-mid hover:text-primary transition-colors">Shipping</Link>
                <Link href="/returns" className="block text-[13px] text-mid hover:text-primary transition-colors">Returns</Link>
                <Link href="/contact" className="block text-[13px] text-mid hover:text-primary transition-colors">Contact</Link>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold tracking-wider uppercase text-ink mb-3.5">Follow</h4>
              <div className="space-y-2.5">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="block text-[13px] text-mid hover:text-primary transition-colors">Instagram</a>
                <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="block text-[13px] text-mid hover:text-primary transition-colors">Pinterest</a>
                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="block text-[13px] text-mid hover:text-primary transition-colors">TikTok</a>
                <a href="https://www.etsy.com/shop/MilesAwayPrints" target="_blank" rel="noopener noreferrer" className="block text-[13px] text-mid hover:text-primary transition-colors">Etsy Shop</a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border text-center text-xs text-light-mid">
          &copy; {new Date().getFullYear()} Miles Away Prints. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
