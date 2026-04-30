import type { Metadata } from 'next';
import Link from 'next/link';
import NavbarShell from '@/components/NavbarShell';
import Footer from '@/components/Footer';
import PolicySection from '@/components/PolicySection';
import PolicyCTA from '@/components/PolicyCTA';

export const metadata: Metadata = {
  title: 'Shipping',
  description:
    'How Miles Away Prints ships your order — production times, delivery windows, tracking, packaging, and international rules.',
};

export default function ShippingPage() {
  return (
    <>
      <NavbarShell />

      <section className="pt-28 md:pt-32 pb-12">
        <div className="max-w-[800px] mx-auto px-6">
          <h1 className="text-4xl md:text-6xl font-medium tracking-tight text-ink leading-[1.05] mb-4">
            Shipping.
          </h1>
          <p className="text-mid text-base md:text-lg leading-relaxed max-w-xl">
            Made-to-order prints, packed flat or rolled, shipped from the printer
            closest to you. Here&apos;s how it works.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-[800px] mx-auto px-6">
          <PolicySection title="Where we ship">
            <p>
              All 50 U.S. states and 90+ countries through our fulfillment partner
              Printful. Printful operates a global print network with facilities in
              the U.S., Canada, Mexico, the U.K., Spain, Latvia, Australia, and Japan.
              Your order prints at the facility closest to your shipping address —
              that keeps delivery fast and cuts the carbon cost of getting it to
              you.
            </p>
          </PolicySection>

          <PolicySection title="Production time">
            <p>
              Every print is made to order. Most prints leave the printer within{' '}
              <strong className="text-ink">3–5 business days</strong>. Specialty
              sizes (24×36, 20×30) can take up to 7. Production starts as soon as
              your order is paid, and you&apos;ll see the status update on your{' '}
              <Link href="/account" className="text-ink underline underline-offset-2">
                order page
              </Link>
              .
            </p>
          </PolicySection>

          <PolicySection title="Delivery time">
            <p>Once your order ships:</p>
            <ul className="list-disc list-inside text-mid space-y-1.5 ml-2">
              <li><span className="text-ink">United States:</span> 3–5 business days</li>
              <li><span className="text-ink">Canada:</span> 5–10 business days</li>
              <li><span className="text-ink">Europe & UK:</span> 5–10 business days</li>
              <li><span className="text-ink">Rest of the world:</span> 10–20 business days</li>
            </ul>
            <p className="text-mid">
              Add the production window above to estimate the full timeline. Holiday
              and peak-season volumes can push these by a few days.
            </p>
          </PolicySection>

          <PolicySection title="Tracking">
            <p>
              As soon as your print ships, we&apos;ll email you a tracking number.
              You can also find it on your{' '}
              <Link href="/account" className="text-ink underline underline-offset-2">
                order page
              </Link>{' '}
              (signed in) or via the link in your order confirmation email.
            </p>
          </PolicySection>

          <PolicySection title="Packaging">
            <p>
              Prints up to 16×20 ship flat in rigid cardboard mailers. 18×24 and
              larger ship rolled in protective tubes. All packaging is recyclable
              cardboard and paper — no foam, no plastic film.
            </p>
          </PolicySection>

          <PolicySection title="Customs & duties">
            <p>
              International orders may incur customs fees on arrival, charged by
              your country&apos;s customs office. These are{' '}
              <strong className="text-ink">not included</strong> in the order total
              and are the recipient&apos;s responsibility. Most countries have a
              de minimis threshold below which fees aren&apos;t charged — check
              your local rules if you&apos;re unsure.
            </p>
          </PolicySection>

          <PolicySection title="Lost or damaged in transit">
            <p>
              If your print arrives damaged, or doesn&apos;t arrive within 30 days
              of the shipping notification, email us within{' '}
              <strong className="text-ink">14 days</strong> at{' '}
              <a
                href="mailto:milesawayprintsllc@gmail.com"
                className="text-ink underline underline-offset-2"
              >
                milesawayprintsllc@gmail.com
              </a>{' '}
              with your order number and photos (for damage). We&apos;ll make it
              right at no cost — replacement or full refund, your pick.
            </p>
          </PolicySection>

          <PolicySection title="Shipping cost">
            <p>
              Rates depend on where the order ships, how many prints are in the
              box, and the largest size in the order (16×20 and up ship in a
              bigger tube). The first print covers most of the cost; each
              additional print adds a small per-item bump.
            </p>
            <p className="mt-4 text-sm text-ink font-medium">
              Standard sizes (5×7 through 12×18)
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-ink">
              <li>· United States — <strong>$7</strong> first print, <strong>+$3</strong> each additional</li>
              <li>· Canada — <strong>$11</strong> first print, <strong>+$3</strong> each additional</li>
              <li>· United Kingdom & EU — <strong>$14</strong> first print, <strong>+$3</strong> each additional</li>
              <li>· Rest of world — <strong>$20</strong> first print, <strong>+$4</strong> each additional</li>
            </ul>
            <p className="mt-4 text-sm text-ink font-medium">
              Mid-size (16×20, 18×24)
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-ink">
              <li>· United States — <strong>$7.50</strong> first print, <strong>+$3</strong> each additional</li>
              <li>· Canada — <strong>$11.50</strong> first print, <strong>+$3</strong> each additional</li>
              <li>· United Kingdom & EU — <strong>$14.50</strong> first print, <strong>+$3</strong> each additional</li>
              <li>· Rest of world — <strong>$21</strong> first print, <strong>+$4</strong> each additional</li>
            </ul>
            <p className="mt-4 text-sm text-ink font-medium">
              Large (20×30, 24×36)
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-ink">
              <li>· United States — <strong>$9</strong> first print, <strong>+$4</strong> each additional</li>
              <li>· Canada — <strong>$13</strong> first print, <strong>+$4</strong> each additional</li>
              <li>· United Kingdom & EU — <strong>$16</strong> first print, <strong>+$4</strong> each additional</li>
              <li>· Rest of world — <strong>$24</strong> first print, <strong>+$5</strong> each additional</li>
            </ul>
            <p className="mt-4 text-sm text-mid">
              Mixed-size carts ship at the rate of the largest item, with each
              additional print added at its own per-item bump. Digital downloads
              are delivered instantly and have no shipping fee.
            </p>
          </PolicySection>
        </div>
      </section>

      <PolicyCTA />
      <Footer />
    </>
  );
}
