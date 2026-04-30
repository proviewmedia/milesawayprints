import type { Metadata } from 'next';
import Link from 'next/link';
import NavbarShell from '@/components/NavbarShell';
import Footer from '@/components/Footer';
import PolicySection from '@/components/PolicySection';
import PolicyCTA from '@/components/PolicyCTA';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Terms of using Miles Away Prints — purchase license, intellectual property, custom prints, liability, governing law.',
};

const LAST_UPDATED = 'April 29, 2026';

export default function TermsPage() {
  return (
    <>
      <NavbarShell />

      <section className="pt-28 md:pt-32 pb-12">
        <div className="max-w-[800px] mx-auto px-6">
          <h1 className="text-4xl md:text-6xl font-medium tracking-tight text-ink leading-[1.05] mb-4">
            Terms.
          </h1>
          <p className="text-mid text-base md:text-lg leading-relaxed max-w-xl">
            The rules of using Miles Away Prints — written in plain English so
            you can actually read them.
          </p>
          <p className="text-[12px] uppercase tracking-wider text-mid mt-6">
            Last updated: {LAST_UPDATED}
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-[800px] mx-auto px-6">
          <PolicySection title="Agreement">
            <p>
              By using milesawayprints.com or placing an order, you accept these
              Terms and the{' '}
              <Link href="/privacy" className="text-ink underline underline-offset-2">
                Privacy Policy
              </Link>
              . If you don&apos;t agree, don&apos;t use the site.
            </p>
          </PolicySection>

          <PolicySection title="Eligibility">
            <p>
              You must be at least 18 to make a purchase, or have a parent or
              guardian&apos;s consent if younger.
            </p>
          </PolicySection>

          <PolicySection title="Pricing & availability">
            <p>
              Prices are listed in U.S. dollars and may change without notice;
              we honor the price shown at checkout. We may cancel an order with
              full refund in the event of an obvious pricing error, suspected
              fraud, or stock issues with our printing partners.
            </p>
          </PolicySection>

          <PolicySection title="Made-to-order policy">
            <p>
              Every print is produced after you order. Refund and replacement
              rules are on the{' '}
              <Link href="/returns" className="text-ink underline underline-offset-2">
                returns page
              </Link>
              .
            </p>
          </PolicySection>

          <PolicySection title="Intellectual property">
            <p>
              All artwork, designs, photography, and site content are owned by
              Miles Away Prints (or its licensors) and protected by copyright
              and trademark law.
            </p>
            <p>
              When you buy a print, you receive a{' '}
              <strong className="text-ink">personal-use license</strong>: it&apos;s
              yours to display in your home or office, frame, photograph, and
              gift to a friend. You may{' '}
              <strong className="text-ink">not</strong> resell, mass-reproduce,
              redistribute the digital file, or use the design commercially
              without our written permission.
            </p>
          </PolicySection>

          <PolicySection title="Custom prints — your warranty to us">
            <p>
              When you order a custom print of a place, course, stadium,
              airport, or marathon, you represent that you have the right to
              use any names, marks, or details you ask us to include.
            </p>
            <p>
              Trademarks (team logos, league marks, brand names) are{' '}
              <strong className="text-ink">not</strong> reproduced. If we
              receive a custom request that would require us to copy a
              protected logo or design, we&apos;ll decline and refund.
            </p>
          </PolicySection>

          <PolicySection title="Acceptable use">
            <p>
              Don&apos;t scrape, reverse engineer, attack, or abuse the site or
              its API. Don&apos;t use the site to break the law. Don&apos;t
              try to acquire prints fraudulently (e.g. with stolen card details);
              we cooperate with Stripe and law enforcement on chargeback fraud.
            </p>
          </PolicySection>

          <PolicySection title="Third-party services">
            <p>
              Our payment processing, fulfillment, and analytics use third-party
              services (Stripe, Printful, Google Analytics). Their terms apply
              to those parts of the experience.
            </p>
          </PolicySection>

          <PolicySection title="Affiliate links">
            <p>
              From time to time we may include affiliate links to third-party
              products. If you click and buy, we may earn a small commission
              at no additional cost to you. We only link to things we&apos;d
              recommend regardless of the affiliate relationship — and the
              FTC requires us to tell you that, which we just did.
            </p>
          </PolicySection>

          <PolicySection title="Disclaimer of warranties">
            <p>
              The site and the prints are provided <strong className="text-ink">&ldquo;as
              is.&rdquo;</strong> Slight color or trim variation between the
              digital preview and the printed result is inherent to printing on
              fine-art paper and is not a defect.
            </p>
          </PolicySection>

          <PolicySection title="Limitation of liability">
            <p>
              To the fullest extent permitted by law, our total liability for
              any claim arising out of or related to your use of the site or a
              print is limited to the amount you paid for the order in
              question. We are not liable for indirect, incidental,
              consequential, or punitive damages.
            </p>
          </PolicySection>

          <PolicySection title="Indemnification">
            <p>
              You agree to defend and indemnify Miles Away Prints from any
              third-party claim arising out of content you supply for a custom
              print (for example, if you ask us to print someone else&apos;s
              trademarked name without permission).
            </p>
          </PolicySection>

          <PolicySection title="Governing law & disputes">
            <p>
              These Terms are governed by the laws of the State of Wyoming, USA.
              Any dispute arising out of these Terms or your use of the site
              will be resolved in the courts of Laramie County, Wyoming — unless
              we mutually agree to a different process.
            </p>
          </PolicySection>

          <PolicySection title="Severability & changes">
            <p>
              If any clause of these Terms is held unenforceable, the rest
              remain in effect. We may update these Terms by posting a new
              version with a new &ldquo;Last updated&rdquo; date; continued use
              of the site constitutes acceptance of the updated Terms.
            </p>
          </PolicySection>

          <PolicySection title="Contact">
            <p>
              Questions about these Terms?{' '}
              <a
                href="mailto:milesawayprintsllc@gmail.com"
                className="text-ink underline underline-offset-2"
              >
                milesawayprintsllc@gmail.com
              </a>
            </p>
          </PolicySection>
        </div>
      </section>

      <PolicyCTA />
      <Footer />
    </>
  );
}
