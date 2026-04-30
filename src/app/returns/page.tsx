import type { Metadata } from 'next';
import Link from 'next/link';
import NavbarShell from '@/components/NavbarShell';
import Footer from '@/components/Footer';
import PolicySection from '@/components/PolicySection';
import PolicyCTA from '@/components/PolicyCTA';

export const metadata: Metadata = {
  title: 'Returns',
  description:
    'Made-to-order means we can\'t take returns once a print is produced. Refunds before production and replacements for damage — full policy.',
};

export default function ReturnsPage() {
  return (
    <>
      <NavbarShell />

      <section className="pt-28 md:pt-32 pb-12">
        <div className="max-w-[800px] mx-auto px-6">
          <h1 className="text-4xl md:text-6xl font-medium tracking-tight text-ink leading-[1.05] mb-4">
            Returns.
          </h1>
          <p className="text-mid text-base md:text-lg leading-relaxed max-w-xl">
            Every print is made to order, so we can&apos;t take returns once one
            has been produced. We can refund any order that hasn&apos;t been sent
            to the printer yet, and we replace anything that arrives damaged.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-[800px] mx-auto px-6">
          <div className="border border-accent/40 bg-accent/5 px-5 py-4 rounded-md mb-12 text-sm text-ink leading-relaxed">
            <strong>Important:</strong> once an order moves from{' '}
            <em>paid</em> to <em>in production</em>, the printer has accepted
            the file and started work. We can&apos;t cancel or refund after that
            point.
          </div>

          <PolicySection title="Refund window — before production">
            <p>
              If your order is still showing <strong className="text-ink">paid</strong> on your{' '}
              <Link href="/account" className="text-ink underline underline-offset-2">
                order page
              </Link>{' '}
              (it hasn&apos;t moved to <em>in production</em> yet), email us at{' '}
              <a
                href="mailto:milesawayprintsllc@gmail.com"
                className="text-ink underline underline-offset-2"
              >
                milesawayprintsllc@gmail.com
              </a>{' '}
              with your order number and we&apos;ll cancel and refund it in full.
            </p>
            <p className="text-mid">
              Refunds typically appear on your statement within 5–10 business
              days, depending on your bank.
            </p>
          </PolicySection>

          <PolicySection title="Damaged in transit">
            <p>
              Things happen in shipping. If your print arrives damaged, email us
              within <strong className="text-ink">14 days</strong> of the
              shipping notification with photos of the damage and the
              packaging. We&apos;ll send a free replacement or refund the order
              in full — your call.
            </p>
          </PolicySection>

          <PolicySection title="Wrong item shipped">
            <p>
              On the rare occasion the wrong item arrives, email us with photos
              and we&apos;ll ship the correct one at no cost. You don&apos;t need
              to return the original.
            </p>
          </PolicySection>

          <PolicySection title="Buyer's remorse">
            <p>
              Made-to-order prints can&apos;t be resold, so we don&apos;t accept
              returns for change-of-mind. If you&apos;re uncertain about size or
              format, message us before you order — we&apos;d rather help you
              pick than process a no-go return that won&apos;t happen.
            </p>
          </PolicySection>

          <PolicySection title="Custom prints">
            <p>
              Once a custom design is started, we can&apos;t refund the design
              work. If you spot a typo or want to change details, email us
              within <strong className="text-ink">24 hours</strong> of placing
              the custom order — we&apos;ll catch it before production.
            </p>
          </PolicySection>

          <PolicySection title="Digital downloads">
            <p>
              Once a digital download link is delivered to your email, the
              product has been delivered. <strong className="text-ink">Digital
              downloads are not refundable.</strong> If there&apos;s a technical
              issue accessing the file, email us — we&apos;ll get the file to
              you another way.
            </p>
          </PolicySection>

          <PolicySection title="How to start a return or refund">
            <p>
              Email{' '}
              <a
                href="mailto:milesawayprintsllc@gmail.com"
                className="text-ink underline underline-offset-2"
              >
                milesawayprintsllc@gmail.com
              </a>{' '}
              with:
            </p>
            <ul className="list-disc list-inside text-mid space-y-1.5 ml-2">
              <li>Your order number</li>
              <li>What&apos;s wrong (or what you&apos;d like to do)</li>
              <li>Photos if it&apos;s a damage or wrong-item issue</li>
            </ul>
            <p className="text-mid">
              We aim to respond within 24–48 hours, M–F.
            </p>
          </PolicySection>
        </div>
      </section>

      <PolicyCTA />
      <Footer />
    </>
  );
}
