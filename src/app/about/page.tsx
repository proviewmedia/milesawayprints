import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import NavbarShell from '@/components/NavbarShell';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'About',
  description:
    'The INQ Press is a designer-led print studio in Las Vegas. Custom printing on apparel, merch, stickers, signs, and posters, plus our own collection of art prints. Started on Etsy in 2020.',
  alternates: { canonical: '/about' },
};

const STATS = [
  { stat: '2020', label: 'Started on Etsy' },
  { stat: '800+', label: 'Orders shipped on Etsy alone' },
  { stat: '4.7 / 5', label: 'Across 100+ Etsy reviews' },
  { stat: 'Las Vegas', label: 'Where the studio is based' },
];

const PRINCIPLES = [
  {
    n: '01',
    title: 'Designer-led',
    desc: 'A designer looks at every job. If your file needs work, we fix it or tell you before anything prints.',
  },
  {
    n: '02',
    title: 'Proof first',
    desc: 'You see a price and a proof before you pay. Nothing goes to print until you approve it.',
  },
  {
    n: '03',
    title: 'The right method',
    desc: 'Screen printing, embroidery, DTF, sublimation, or fine-art print. We pick what looks best for your product and budget.',
  },
  {
    n: '04',
    title: 'One piece or a hundred',
    desc: 'A single gift or a full run of team shirts. Same care either way.',
  },
];

export default function AboutPage() {
  return (
    <>
      <NavbarShell />

      {/* Hero: full-bleed black, same voice as the homepage */}
      <section className="bg-ink text-paper pt-32 md:pt-40 pb-14 md:pb-20">
        <div className="max-w-[1400px] mx-auto px-6 grid md:grid-cols-[1.2fr_1fr] gap-10 md:gap-16 items-end">
          <div>
            <p className="eyebrow text-paper/60 mb-6">About the studio</p>
            <h1 className="display text-[14vw] md:text-[7vw] xl:text-[112px] mb-8">
              Designed here.
              <br />
              Printed right.
            </h1>
            <p className="text-base md:text-xl text-paper/75 max-w-xl leading-relaxed">
              The INQ Press is a designer-led print studio in Las Vegas. We print your ideas on
              shirts, hats, stickers, signs, posters, and merch, and we design our own collection of
              art prints.
            </p>
          </div>
          <div className="relative aspect-[4/5] md:aspect-[4/5] overflow-hidden">
            <Image
              src="/lifestyle/maui-wall.jpg"
              alt="A framed INQ Press art print hanging on a wall"
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* Stats: ink-rule grid */}
      <section className="bg-ink border-b border-ink">
        {/* 1px gaps on an ink background draw the rules between cells */}
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-px">
          {STATS.map((s) => (
            <div key={s.label} className="bg-paper px-6 py-8 md:py-10">
              <div className="display text-3xl md:text-5xl">{s.stat}</div>
              <div className="text-[13px] text-mid mt-2 leading-snug">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="py-16 md:py-24">
        <div className="max-w-[1100px] mx-auto px-6 grid md:grid-cols-[1fr_1.3fr] gap-8 md:gap-16">
          <div>
            <p className="eyebrow text-mid mb-5">Our story</p>
            <h2 className="display text-5xl md:text-7xl">From one print to a print studio.</h2>
          </div>
          <div className="space-y-5 text-base md:text-lg leading-relaxed text-ink md:pt-10">
            <p>
              It started in 2020 with a single airport diagram on Etsy. People wanted prints of the
              places that meant something to them, so the shop grew: golf courses, marathon routes,
              F1 circuits, skylines, and stadiums. More than 800 Etsy orders later, the same
              question kept coming in. Can you print this for me?
            </p>
            <p>
              So we said yes. The INQ Press is the next step: a studio that brings the same design
              care to anything you want printed. Team shirts, event banners, stickers for your
              brand, a gift for one person. You bring the idea, we handle the rest.
            </p>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="py-16 md:py-24 bg-ink text-paper">
        <div className="max-w-[1400px] mx-auto px-6">
          <p className="eyebrow text-paper/60 mb-5">How we work</p>
          <h2 className="display text-5xl md:text-7xl mb-12">Care on every order.</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {PRINCIPLES.map((p) => (
              <div key={p.n} className="border-t border-paper/25 pt-6">
                <div className="display text-6xl text-paper/25 mb-5">{p.n}</div>
                <h3 className="text-lg font-bold mb-2">{p.title}</h3>
                <p className="text-sm text-paper/70 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="py-16 md:py-24">
        <div className="max-w-[1100px] mx-auto px-6 grid md:grid-cols-[1fr_1.3fr] gap-8 md:gap-16">
          <div>
            <p className="eyebrow text-mid mb-5">Founder</p>
            <h2 className="display text-5xl md:text-7xl">Melvin Morales</h2>
          </div>
          <div className="space-y-5 text-base md:text-lg leading-relaxed text-ink md:pt-10">
            <p>
              Melvin is a Puerto Rican-born designer based in Las Vegas. He studied design at
              Wentworth Institute of Technology in Boston, where he found a love for print that has
              shaped the studio ever since.
            </p>
            <p>
              By day he designs digital products. The INQ Press is where that eye for detail meets
              ink and paper. He answers messages himself and treats every order as a one-of-one.
            </p>
          </div>
        </div>
      </section>

      {/* Two paths: custom work and the print shop */}
      <section className="border-y border-ink">
        <div className="max-w-[1400px] mx-auto grid md:grid-cols-2">
          <Link
            href="/custom"
            className="group px-6 py-12 md:py-16 md:border-r border-b md:border-b-0 border-ink hover:bg-soft transition-colors"
          >
            <p className="eyebrow text-mid mb-4">Custom printing</p>
            <h3 className="display text-4xl md:text-6xl mb-4">Print your idea</h3>
            <p className="text-mid max-w-md mb-6">Free quote within 1 to 2 business days. You approve a proof first.</p>
            <span className="inline-flex items-center gap-2 font-bold">
              Get a free quote
              <ArrowRight size={16} strokeWidth={2.25} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
          <Link href="/shop" className="group px-6 py-12 md:py-16 hover:bg-soft transition-colors">
            <p className="eyebrow text-mid mb-4">The print shop</p>
            <h3 className="display text-4xl md:text-6xl mb-4">Shop art prints</h3>
            <p className="text-mid max-w-md mb-6">
              Golf courses, airports, skylines, marathons, and F1 circuits, made to order.
            </p>
            <span className="inline-flex items-center gap-2 font-bold">
              Browse the collection
              <ArrowRight size={16} strokeWidth={2.25} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
