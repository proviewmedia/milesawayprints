import type { Metadata } from 'next';
import Link from 'next/link';
import NavbarShell from '@/components/NavbarShell';
import Footer from '@/components/Footer';
import PolicySection from '@/components/PolicySection';
import PolicyCTA from '@/components/PolicyCTA';

export const metadata: Metadata = {
  title: 'Damage & replacement policy',
  description:
    'Every print is made to order — all sales are final. If anything arrives damaged or misprinted, we replace it free within 14 days.',
  alternates: { canonical: '/returns' },
};

export default function ReturnsPage() {
  return (
    <>
      <NavbarShell />

      <section className="pt-28 md:pt-32 pb-12">
        <div className="max-w-[800px] mx-auto px-6">
          <h1 className="text-4xl md:text-6xl font-medium tracking-tight text-ink leading-[1.05] mb-4">
            Damage &amp; replacement policy.
          </h1>
          <p className="text-mid text-base md:text-lg leading-relaxed max-w-xl">
            Every print is made to order, so all sales are final — there are no
            returns. If anything arrives damaged or misprinted, we replace it
            free within 14 days. No need to ship anything back.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-[800px] mx-auto px-6">
          <div className="border border-accent/40 bg-accent/5 px-5 py-4 rounded-md mb-12 text-sm text-ink leading-relaxed">
            <strong>Important:</strong> once an order moves from{' '}
            <em>paid</em> to <em>in production</em>, the printer has accepted
            the file and started work. We can&apos;t cancel or refund after that
            point. Reach out fast if you spot an issue with what you ordered.
          </div>

          <PolicySection title="Canceling before production starts">
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

          <PolicySection title="Damaged or misprinted">
            <p>
              Things happen in shipping. If your print arrives damaged or
              misprinted, email us within{' '}
              <strong className="text-ink">14 days</strong> of the shipping
              notification with photos of the damage and the packaging.
              We&apos;ll send a free replacement at no cost — no need to ship
              anything back.
            </p>
          </PolicySection>

          <PolicySection title="Wrong item shipped">
            <p>
              On the rare occasion the wrong item arrives, email us with photos
              and we&apos;ll ship the correct one at no cost. You don&apos;t need
              to return the original.
            </p>
          </PolicySection>

          <PolicySection title="Change of mind">
            <p>
              Because every print is custom-made for you specifically, we
              don&apos;t accept change-of-mind cancellations after production
              starts. If you&apos;re unsure about size or details, message us
              before you order — we&apos;d rather help you pick the right one
              upfront than disappoint after.
            </p>
          </PolicySection>

          <PolicySection title="How to get a replacement">
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
              <li>What&apos;s wrong with the item</li>
              <li>Photos of the damage, misprint, or wrong item</li>
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
