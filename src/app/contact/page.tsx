import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PolicyCTA from '@/components/PolicyCTA';
import ContactForm from './ContactForm';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Reach Miles Away Prints by email or contact form. We respond within 24–48 hours, M–F.',
};

export default function ContactPage() {
  return (
    <>
      <Navbar />

      <section className="pt-28 md:pt-32 pb-12">
        <div className="max-w-[800px] mx-auto px-6">
          <h1 className="text-4xl md:text-6xl font-medium tracking-tight text-ink leading-[1.05] mb-4">
            Contact.
          </h1>
          <p className="text-mid text-base md:text-lg leading-relaxed max-w-xl">
            The fastest way to reach us is email. For order-specific questions,
            include your order number — you&apos;ll find it on your{' '}
            <Link href="/account" className="text-ink underline underline-offset-2">
              order page
            </Link>{' '}
            or in your confirmation email.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-[800px] mx-auto px-6 grid md:grid-cols-[1fr_1.5fr] gap-12 items-start">
          <div>
            <h2 className="text-[13px] font-medium uppercase tracking-wider text-ink mb-4 border-t border-border pt-8">
              Email
            </h2>
            <p className="text-ink leading-relaxed">
              <a
                href="mailto:milesawayprintsllc@gmail.com"
                className="underline underline-offset-2"
              >
                milesawayprintsllc@gmail.com
              </a>
            </p>
            <p className="text-[13px] text-mid mt-2 leading-relaxed">
              We aim to reply within 24–48 hours, Monday through Friday.
            </p>

            <h2 className="text-[13px] font-medium uppercase tracking-wider text-ink mb-4 mt-12 border-t border-border pt-8">
              FAQ first?
            </h2>
            <p className="text-mid text-[13px] leading-relaxed">
              Most questions about sizing, shipping, returns, and custom prints
              are answered on the{' '}
              <Link href="/faq" className="text-ink underline underline-offset-2">
                FAQ
              </Link>
              .
            </p>
          </div>

          <div>
            <h2 className="text-[13px] font-medium uppercase tracking-wider text-ink mb-4 border-t border-border pt-8">
              Send a message
            </h2>
            <ContactForm />
          </div>
        </div>
      </section>

      <PolicyCTA />
      <Footer />
    </>
  );
}
