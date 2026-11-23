import type { Metadata } from 'next';
import NavbarShell from '@/components/NavbarShell';
import Footer from '@/components/Footer';
import PolicySection from '@/components/PolicySection';
import PolicyCTA from '@/components/PolicyCTA';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How The INQ Press handles your information — what we collect, who we share with, and your rights.',
  alternates: { canonical: '/privacy' },
};

const LAST_UPDATED = 'April 29, 2026';

export default function PrivacyPage() {
  return (
    <>
      <NavbarShell />

      <section className="pt-28 md:pt-32 pb-12">
        <div className="max-w-[800px] mx-auto px-6">
          <Breadcrumbs tone="light" className="mb-2" items={[{ name: 'Privacy', href: '/privacy' }]} />
          <h1 className="display text-[2.5rem] sm:text-5xl md:text-7xl text-ink pt-3 mb-4">
            Privacy.
          </h1>
          <p className="text-mid text-base md:text-lg leading-relaxed max-w-xl">
            Plain-English version of how The INQ Press handles your
            information.
          </p>
          <p className="text-[12px] uppercase tracking-wider text-mid mt-6">
            Last updated: {LAST_UPDATED}
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-[800px] mx-auto px-6">
          <PolicySection title="What we collect">
            <p>
              When you place an order or create an account, we collect your name,
              email address, shipping address, order history, and payment
              information. Card details are handled by Stripe — we never see or
              store full card numbers.
            </p>
            <p>
              When you browse the site, we collect basic device, browser, and
              IP information through analytics cookies, plus session cookies
              that keep you signed in.
            </p>
          </PolicySection>

          <PolicySection title="How we use it">
            <ul className="list-disc list-inside text-mid space-y-1.5 ml-2">
              <li>Fulfilling and shipping your orders</li>
              <li>Customer service (replying to email, processing refunds)</li>
              <li>Fraud prevention and account security</li>
              <li>Site analytics — understanding which prints people like</li>
              <li>Occasional marketing email (only if you opt in at checkout)</li>
            </ul>
          </PolicySection>

          <PolicySection title="Service providers we share with">
            <p>
              To run the store we share the minimum necessary information with
              these partners:
            </p>
            <ul className="list-disc list-inside text-mid space-y-1.5 ml-2">
              <li><span className="text-ink">Stripe</span> — payment processing</li>
              <li><span className="text-ink">Printful</span> — printing & shipping (receives your name and shipping address)</li>
              <li><span className="text-ink">Supabase</span> — database hosting (where order records live)</li>
              <li><span className="text-ink">Resend</span> — email delivery</li>
              <li><span className="text-ink">Vercel</span> — web hosting</li>
              <li><span className="text-ink">Google Analytics</span> — site usage measurement</li>
            </ul>
            <p className="text-mid">
              Each only receives what they need to do their job. None of them are
              allowed to use your data to market you on our behalf.
            </p>
          </PolicySection>

          <PolicySection title="What we don't do">
            <ul className="list-disc list-inside text-mid space-y-1.5 ml-2">
              <li>Sell your data</li>
              <li>Share with third-party advertisers</li>
              <li>Use you as training data for AI models</li>
            </ul>
          </PolicySection>

          <PolicySection title="Cookies & analytics">
            <p>
              We use two kinds of cookies:
            </p>
            <ul className="list-disc list-inside text-mid space-y-1.5 ml-2">
              <li>
                <span className="text-ink">Essential</span> — keep you signed in,
                remember your cart. The site doesn&apos;t work without these.
              </li>
              <li>
                <span className="text-ink">Analytics</span> — Google Analytics
                cookies for page views, visitor counts, and traffic sources. You
                can decline these via the consent banner on your first visit, or
                disable cookies in your browser at any time.
              </li>
            </ul>
            <p className="mt-4">
              If you decline, Google Analytics still receives anonymous, cookieless signals (Google Consent
              Mode), such as that a page was viewed. No cookies are stored and no advertising data is used.
            </p>
          </PolicySection>

          <PolicySection title="Affiliate links">
            <p>
              Some links on this site may earn us a small commission if you make
              a purchase (for example, links to framing products or photography
              gear). It never costs you anything extra, and never affects which
              prints we recommend.
            </p>
          </PolicySection>

          <PolicySection title="Data retention">
            <p>
              Order records are kept for 7 years to satisfy tax and accounting
              requirements. Account profile data is deleted on request, except
              what we&apos;re legally required to keep.
            </p>
          </PolicySection>

          <PolicySection title="Your rights">
            <p>
              You can ask us to:
            </p>
            <ul className="list-disc list-inside text-mid space-y-1.5 ml-2">
              <li>Send you a copy of the personal data we hold about you</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account (subject to legal retention)</li>
              <li>Opt out of marketing email at any time</li>
            </ul>
            <p className="text-mid">
              Email{' '}
              <a
                href="mailto:milesawayprintsllc@gmail.com"
                className="text-ink underline underline-offset-2"
              >
                milesawayprintsllc@gmail.com
              </a>{' '}
              with the request and your account email.
            </p>
          </PolicySection>

          <PolicySection title="California (CCPA) and EU/UK (GDPR)">
            <p>
              If you live in California, you have the right to know what data
              we hold, request deletion, and opt out of any sale of personal
              information (we don&apos;t sell). If you live in the EU or UK,
              you have the same plus rights to portability and to object to
              processing. Same email request process — see Your rights.
            </p>
          </PolicySection>

          <PolicySection title="Children">
            <p>
              The site isn&apos;t intended for children under 13. If you
              believe a child has provided us with personal information,
              email us and we&apos;ll delete it.
            </p>
          </PolicySection>

          <PolicySection title="Security">
            <p>
              We use HTTPS site-wide, encrypted database storage at Supabase,
              and PCI-compliant payment processing through Stripe. No system
              is perfectly secure, so we won&apos;t pretend ours is — but we
              follow modern best practice.
            </p>
          </PolicySection>

          <PolicySection title="Changes to this policy">
            <p>
              We&apos;ll post updates here with a new &ldquo;Last updated&rdquo;
              date at the top of the page. Continued use of the site after a
              change means you accept the new version.
            </p>
          </PolicySection>

          <PolicySection title="Contact">
            <p>
              Questions about privacy?{' '}
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
