import type { Metadata } from 'next';
import Link from 'next/link';
import NavbarShell from '@/components/NavbarShell';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'About — Miles Away Prints',
  description:
    'Miles Away Prints is a designer-led print studio creating custom location art — airports, marathons, golf courses, skylines, and city streets — printed on archival paper through our American production partner in Detroit.',
};

export default function AboutPage() {
  return (
    <>
      <NavbarShell />

      {/* Hero */}
      <section className="pt-28 md:pt-32">
        <div className="bg-soft">
          <div className="max-w-[1400px] mx-auto px-6 py-14 md:py-20 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-mid mb-5">
                About the studio
              </p>
              <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-ink leading-[1.02] mb-6">
                Designed for<br />the places that<br />stayed with you.
              </h1>
              <p className="text-base md:text-lg text-ink leading-relaxed max-w-md">
                Miles Away Prints is a designer-led studio making custom
                location art — finish lines, fairways, terminals, skylines,
                circuits — printed on archival paper and shipped worldwide.
              </p>
            </div>

            <div className="bg-paper aspect-[5/4] flex items-center justify-center">
              <span className="text-[11px] uppercase tracking-wider text-mid">
                Studio photo placeholder
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-border bg-paper">
        <div className="max-w-[1400px] mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {[
            { stat: 'Est. 2020', label: 'Founded on Etsy, now shipping direct' },
            { stat: '750+', label: 'Custom prints delivered worldwide' },
            { stat: '4.9 / 5', label: 'Across 90+ verified reviews' },
            { stat: 'Detroit', label: 'Made in America by our production partner' },
          ].map((v) => (
            <div key={v.label}>
              <div className="text-2xl md:text-3xl font-medium text-ink tracking-tight">
                {v.stat}
              </div>
              <div className="text-[13px] text-mid mt-1.5 leading-snug">{v.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="py-14 md:py-20">
        <div className="max-w-[800px] mx-auto px-6">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-mid mb-5">
            Our story
          </p>
          <h2 className="text-3xl md:text-5xl font-medium text-ink tracking-tight leading-[1.05] mb-8">
            From a side passion to a print studio.
          </h2>
          <div className="space-y-5 text-base md:text-lg leading-relaxed text-ink">
            <p>
              Miles Away Prints began in 2020 with a single hand-drawn airport
              diagram and a hunch — that the places people travel to are the
              places they want to remember. Five years later, the studio has
              shipped more than 750 custom prints to runners, pilots, golfers,
              and travelers across the world.
            </p>
            <p>
              The catalog has grown beyond airports — into golf courses,
              marathon routes, F1 circuits, city skylines, and stadium maps —
              but the design language hasn&apos;t. Every print is built to feel
              like art, not data: minimalist, well-spaced, quietly typographic,
              and made to live on a wall for a long time.
            </p>
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="py-14 md:py-20 bg-soft">
        <div className="max-w-[1100px] mx-auto px-6 grid md:grid-cols-[1fr_1.4fr] gap-10 md:gap-16 items-start">
          <div className="aspect-[4/5] bg-paper flex items-center justify-center">
            <span className="text-[11px] uppercase tracking-wider text-mid">
              Founder portrait placeholder
            </span>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-mid mb-5">
              Founder
            </p>
            <h2 className="text-3xl md:text-4xl font-medium text-ink tracking-tight leading-[1.1] mb-5">
              Melvin Morales
            </h2>
            <div className="space-y-5 text-base leading-relaxed text-ink">
              <p>
                Melvin is a Puerto Rican-born industrial designer based in the
                Mojave Desert. He studied design at Wentworth Institute of
                Technology in Boston, where he discovered a passion for print
                that has shaped the studio ever since.
              </p>
              <p>
                He works in user-interface and digital product design by day;
                Miles Away Prints is the side of the practice where the lines
                slow down. Every poster, frame layout, and color decision in
                the catalog runs through him personally.
              </p>
              <p>
                He answers customer messages himself, takes on custom commissions
                directly, and treats every order as a one-of-one. If you want a
                print of a place that isn&apos;t in the shop yet — write in.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How we make it */}
      <section className="py-14 md:py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-mid mb-5">
            How it&apos;s made
          </p>
          <h2 className="text-3xl md:text-5xl font-medium text-ink tracking-tight leading-[1.05] mb-10 max-w-2xl">
            Designed in the studio. Printed in Detroit.
          </h2>
          <div className="grid md:grid-cols-3 gap-10 md:gap-12">
            {[
              {
                title: 'Designed in-house',
                desc: 'Every print type — airports, courses, skylines, circuits, marathons — is drawn from scratch in a single visual system. No templates, no clip-art.',
              },
              {
                title: 'Made-to-order',
                desc: 'Nothing sits in a warehouse. Every poster is produced and packed when ordered, on archival fine-art paper our partner has been printing for nearly a decade.',
              },
              {
                title: 'American production',
                desc: 'Physical orders are fulfilled by an American production partner based in Detroit, dedicated to quality output and a domestic workforce. Frames arrive professionally assembled.',
              },
            ].map((v) => (
              <div key={v.title}>
                <h3 className="text-[18px] font-medium text-ink mb-2">{v.title}</h3>
                <p className="text-sm text-mid leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Custom commissions callout */}
      <section className="py-14 md:py-20 bg-soft">
        <div className="max-w-[900px] mx-auto px-6 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-mid mb-5">
            Custom commissions
          </p>
          <h2 className="text-3xl md:text-5xl font-medium text-ink tracking-tight leading-[1.05] mb-5">
            A place we haven&apos;t made yet?
          </h2>
          <p className="text-mid text-base md:text-lg max-w-xl mx-auto leading-relaxed mb-8">
            Almost every print in the catalog started as a custom request.
            If you have a finish line, a tee box, a terminal, or a corner of
            a city in mind, get in touch and we&apos;ll design it for you.
          </p>
          <Link href="/contact" className="btn-primary">
            Start a commission
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-ink text-paper">
        <div className="max-w-[900px] mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-medium tracking-tight leading-[1.05] mb-5">
            Make your place.
          </h2>
          <p className="text-paper/70 mb-9 max-w-md mx-auto">
            Browse the collection of ready-to-ship prints, or start your own.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 bg-paper text-ink px-7 py-3.5 rounded-full font-medium text-sm hover:bg-soft transition-colors"
          >
            Shop the collection
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
