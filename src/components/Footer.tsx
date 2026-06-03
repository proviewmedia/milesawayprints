import Link from 'next/link';
import NewsletterSignup from './NewsletterSignup';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-paper">
      <div className="max-w-[1400px] mx-auto px-6 pt-16 pb-10">
        {/* Newsletter row — brand on the left, signup on the right */}
        <div className="grid md:grid-cols-[1.4fr_1.6fr] gap-10 pb-12 border-b border-border mb-12">
          <div>
            <Link
              href="/"
              className="text-[18px] font-medium tracking-tight text-ink no-underline"
            >
              Miles Away{' '}
              <span className="font-normal text-mid">Prints</span>
            </Link>
            <p className="text-sm text-mid mt-4 max-w-[320px] leading-relaxed">
              Custom location art prints. Stadiums, airports, marathons, golf courses, city streets — printed on archival paper, delivered worldwide.
            </p>

            {/* Google Customer Reviews badge — platform.js (loaded in
                layout.tsx) auto-renders this <g:ratingbadge> custom element.
                Shows the seller star rating aggregated from verified
                post-purchase surveys; renders nothing until Google has enough. */}
            <div
              className="mt-6"
              aria-label="Google Customer Reviews rating"
              dangerouslySetInnerHTML={{
                __html:
                  '<g:ratingbadge merchant_id="5790411058"></g:ratingbadge>',
              }}
            />
          </div>
          <div>
            <h4 className="text-[13px] font-medium text-ink mb-2">
              10% off your first print
            </h4>
            <p className="text-sm text-mid mb-4 leading-relaxed">
              Get the code in your inbox, plus first looks at new releases.
            </p>
            <NewsletterSignup source="footer" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
          <div>
            <h4 className="text-[13px] font-medium text-ink mb-4">Shop</h4>
            <ul className="space-y-3">
              <li><Link href="/shop" className="text-sm text-mid hover:text-ink transition-colors">All Prints</Link></li>
              <li><Link href="/prints/skyline" className="text-sm text-mid hover:text-ink transition-colors">City Skyline Prints</Link></li>
              <li><Link href="/prints/airport" className="text-sm text-mid hover:text-ink transition-colors">Airport Map Prints</Link></li>
              <li><Link href="/prints/golf" className="text-sm text-mid hover:text-ink transition-colors">Golf Course Prints</Link></li>
              <li><Link href="/prints/marathon" className="text-sm text-mid hover:text-ink transition-colors">Marathon Prints</Link></li>
              <li><Link href="/prints/stadium" className="text-sm text-mid hover:text-ink transition-colors">Stadium Prints</Link></li>
              <li><Link href="/prints/f1" className="text-sm text-mid hover:text-ink transition-colors">F1 Circuit Prints</Link></li>
              <li><Link href="/prints/city" className="text-sm text-mid hover:text-ink transition-colors">City Street Prints</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[13px] font-medium text-ink mb-4">Gifts</h4>
            <ul className="space-y-3">
              <li><Link href="/gifts" className="text-sm text-mid hover:text-ink transition-colors">All Gift Guides</Link></li>
              <li><Link href="/gifts/fathers-day" className="text-sm text-mid hover:text-ink transition-colors">Father&apos;s Day</Link></li>
              <li><Link href="/gifts/birthday" className="text-sm text-mid hover:text-ink transition-colors">Birthdays</Link></li>
              <li><Link href="/gifts/anniversary" className="text-sm text-mid hover:text-ink transition-colors">Anniversaries</Link></li>
              <li><Link href="/gifts/holiday" className="text-sm text-mid hover:text-ink transition-colors">Holiday Gifts</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[13px] font-medium text-ink mb-4">Help</h4>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-sm text-mid hover:text-ink transition-colors">About</Link></li>
              <li><Link href="/faq" className="text-sm text-mid hover:text-ink transition-colors">FAQ</Link></li>
              <li><Link href="/shipping" className="text-sm text-mid hover:text-ink transition-colors">Shipping</Link></li>
              <li><Link href="/returns" className="text-sm text-mid hover:text-ink transition-colors">Damage policy</Link></li>
              <li><Link href="/contact" className="text-sm text-mid hover:text-ink transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[13px] font-medium text-ink mb-4">Follow</h4>
            <ul className="space-y-3">
              <li><a href="https://www.etsy.com/shop/MilesAwayPrintsLLC" target="_blank" rel="noopener noreferrer" className="text-sm text-mid hover:text-ink transition-colors">Etsy Shop</a></li>
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
