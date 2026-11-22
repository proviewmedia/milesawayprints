import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Mail, Package, HelpCircle } from 'lucide-react';
import NavbarShell from '@/components/NavbarShell';
import Footer from '@/components/Footer';
import ContactForm from './ContactForm';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contact The INQ Press. Get a free quote for custom printing, ask about an order, or send us a message. We reply within 1 to 2 business days.',
  alternates: { canonical: '/contact' },
};

const EMAIL = 'milesawayprintsllc@gmail.com';

export default function ContactPage() {
  return (
    <>
      <NavbarShell />

      <section className="bg-ink text-paper pt-32 md:pt-40 pb-14 md:pb-20">
        <div className="max-w-[1400px] mx-auto px-6">
          <p className="eyebrow text-paper/60 mb-6">Contact</p>
          <h1 className="display text-[15vw] md:text-[9vw] xl:text-[140px] mb-8">Let&apos;s talk.</h1>
          <p className="text-base md:text-xl text-paper/75 max-w-xl leading-relaxed">
            A real person reads every message. We reply within 1 to 2 business days, Monday through
            Friday.
          </p>
        </div>
      </section>

      {/* Routing: send people to the right place first */}
      <section className="bg-ink border-b border-ink">
        <div className="max-w-[1400px] mx-auto grid md:grid-cols-3 gap-px">
          <Link href="/custom" className="group bg-paper px-6 py-8 md:py-10 hover:bg-soft transition-colors">
            <Package size={22} strokeWidth={1.75} aria-hidden="true" className="mb-6" />
            <h2 className="font-display font-black uppercase text-2xl tracking-tight mb-2">Custom printing</h2>
            <p className="text-sm text-mid leading-relaxed mb-5">
              Shirts, hats, stickers, signs, and more. The quote form gets you a price fastest.
            </p>
            <span className="inline-flex items-center gap-2 text-sm font-bold">
              Get a free quote
              <ArrowRight size={15} strokeWidth={2.25} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
          <Link href="/account" className="group bg-paper px-6 py-8 md:py-10 hover:bg-soft transition-colors">
            <Mail size={22} strokeWidth={1.75} aria-hidden="true" className="mb-6" />
            <h2 className="font-display font-black uppercase text-2xl tracking-tight mb-2">An existing order</h2>
            <p className="text-sm text-mid leading-relaxed mb-5">
              Include your order number. You will find it in your confirmation email or on your
              order page.
            </p>
            <span className="inline-flex items-center gap-2 text-sm font-bold">
              View your orders
              <ArrowRight size={15} strokeWidth={2.25} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
          <Link href="/faq" className="group bg-paper px-6 py-8 md:py-10 hover:bg-soft transition-colors">
            <HelpCircle size={22} strokeWidth={1.75} aria-hidden="true" className="mb-6" />
            <h2 className="font-display font-black uppercase text-2xl tracking-tight mb-2">Quick questions</h2>
            <p className="text-sm text-mid leading-relaxed mb-5">
              Sizing, shipping, returns, and digital downloads are covered in the FAQ.
            </p>
            <span className="inline-flex items-center gap-2 text-sm font-bold">
              Read the FAQ
              <ArrowRight size={15} strokeWidth={2.25} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-[1100px] mx-auto px-6 grid md:grid-cols-[1fr_1.4fr] gap-12 md:gap-16 items-start">
          <div>
            <h2 className="display text-5xl md:text-6xl mb-6">Send a message</h2>
            <p className="text-mid leading-relaxed mb-8">
              For anything else, use the form or email us directly.
            </p>
            <div className="border-t border-ink pt-6">
              <p className="eyebrow text-mid mb-2">Email</p>
              <a href={`mailto:${EMAIL}`} className="text-ink font-medium underline underline-offset-2 break-all">
                {EMAIL}
              </a>
            </div>
            <div className="border-t border-ink pt-6 mt-6">
              <p className="eyebrow text-mid mb-2">Studio</p>
              <p className="text-ink">Las Vegas, Nevada</p>
              <p className="text-[13px] text-mid mt-1">Online studio. Every order ships to your door.</p>
            </div>
          </div>
          <div>
            <ContactForm />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
