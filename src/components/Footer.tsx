import Link from 'next/link';
import NewsletterSignup from './NewsletterSignup';
import { QUOTE_PRODUCTS } from '@/data/custom';

const LINK = 'text-sm text-paper/60 hover:text-paper transition-colors';
const HEADING = 'eyebrow text-paper mb-5';

export default function Footer() {
  return (
    <footer className="bg-ink text-paper">
      <div className="max-w-[1400px] mx-auto px-6 pt-16 pb-10">
        {/* Brand + quote CTA on the left, newsletter on the right */}
        <div className="grid md:grid-cols-[1.4fr_1.6fr] gap-10 pb-12 border-b border-paper/15 mb-12">
          <div>
            <Link href="/" aria-label="The INQ Press home" className="inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/inq-logo-white.png" alt="INQ Press" width={951} height={303} className="h-12 w-auto" />
            </Link>
            <p className="text-sm text-paper/60 mt-5 max-w-[340px] leading-relaxed">
              Custom printing on apparel, merch, signs, and more, plus a shop of art prints we design in house.
            </p>
            <Link
              href="/custom"
              className="inline-flex items-center justify-center mt-6 bg-paper text-ink px-6 py-3 rounded-full font-bold text-sm hover:bg-soft transition-colors"
            >
              Get started
            </Link>
          </div>
          <div>
            <h4 className="text-[13px] font-bold mb-2">10% off your first print</h4>
            <p className="text-sm text-paper/60 mb-4 leading-relaxed">
              Get the code in your inbox, plus first looks at new releases.
            </p>
            <NewsletterSignup source="footer" onDark />
            {/* Google Customer Reviews badge: platform.js (loaded in layout.tsx)
                auto-renders this element once Google has enough surveys. */}
            <div
              className="mt-6"
              aria-label="Google Customer Reviews rating"
              dangerouslySetInnerHTML={{
                __html: '<g:ratingbadge merchant_id="5790411058"></g:ratingbadge>',
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
          <div>
            <h4 className={HEADING}>Custom printing</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/custom?start=map" className={LINK}>
                  Map art prints
                </Link>
              </li>
              <li>
                <Link href="/custom?start=artwork" className={LINK}>
                  Print your artwork
                </Link>
              </li>
              {QUOTE_PRODUCTS.filter((p) => p.slug !== 'other').map((p) => (
                <li key={p.slug}>
                  <Link href={`/custom?start=${p.slug}`} className={LINK}>
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className={HEADING}>Resources</h4>
            <ul className="space-y-3">
              <li><Link href="/resources" className={LINK}>Printing guides</Link></li>
              <li><Link href="/resources/print-size-calculator" className={LINK}>Print size calculator</Link></li>
              <li><Link href="/how-it-works" className={LINK}>How it works</Link></li>
              <li><Link href="/how-it-works#methods" className={LINK}>Print methods</Link></li>
              <li><Link href="/how-it-works#artwork" className={LINK}>Sending artwork</Link></li>
              <li><Link href="/how-it-works#faq" className={LINK}>Custom order FAQ</Link></li>
              <li><Link href="/about" className={LINK}>About</Link></li>
              <li><Link href="/contact" className={LINK}>Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className={HEADING}>Print shop</h4>
            <ul className="space-y-3">
              <li><Link href="/shop" className={LINK}>All prints</Link></li>
              <li><Link href="/prints/golf" className={LINK}>Golf courses</Link></li>
              <li><Link href="/prints/airport" className={LINK}>Airports</Link></li>
              <li><Link href="/prints/skyline" className={LINK}>City skylines</Link></li>
              <li><Link href="/prints/marathon" className={LINK}>Marathons</Link></li>
              <li><Link href="/prints/stadium" className={LINK}>Stadiums</Link></li>
              <li><Link href="/prints/f1" className={LINK}>F1 circuits</Link></li>
              <li><Link href="/prints/city" className={LINK}>City streets</Link></li>
              <li><Link href="/gifts" className={LINK}>Gift guides</Link></li>
            </ul>
          </div>

          <div>
            <h4 className={HEADING}>Orders</h4>
            <ul className="space-y-3">
              <li><Link href="/account" className={LINK}>My account</Link></li>
              <li><Link href="/faq" className={LINK}>Shop FAQ</Link></li>
              <li><Link href="/shipping" className={LINK}>Shipping</Link></li>
              <li><Link href="/returns" className={LINK}>Damage policy</Link></li>
              <li>
                <a href="https://www.etsy.com/shop/TheInqPress" target="_blank" rel="noopener noreferrer" className={LINK}>
                  Etsy shop
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-paper/15 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-paper/50">
          <p>&copy; {new Date().getFullYear()} The INQ Press. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-paper transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-paper transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
