import type { Metadata } from 'next';
import Link from 'next/link';
import NavbarShell from '@/components/NavbarShell';
import Footer from '@/components/Footer';
import PolicySection from '@/components/PolicySection';
import PolicyCTA from '@/components/PolicyCTA';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description:
    'Common questions about Miles Away Prints — sizing, shipping, returns, digital downloads, and gifts.',
};

interface QA {
  q: string;
  a: React.ReactNode;
}

function QAList({ items }: { items: QA[] }) {
  return (
    <div className="space-y-6">
      {items.map((item, i) => (
        <div key={i}>
          <p className="text-[15px] font-medium text-ink mb-1.5">{item.q}</p>
          <p className="text-mid leading-relaxed">{item.a}</p>
        </div>
      ))}
    </div>
  );
}

export default function FAQPage() {
  return (
    <>
      <NavbarShell />

      <section className="pt-28 md:pt-32 pb-12">
        <div className="max-w-[800px] mx-auto px-6">
          <h1 className="text-4xl md:text-6xl font-medium tracking-tight text-ink leading-[1.05] mb-4">
            Frequently asked
            <br />
            questions.
          </h1>
          <p className="text-mid text-base md:text-lg leading-relaxed max-w-xl">
            Everything you might want to know — and a few things you might not have
            thought to ask. If you can&apos;t find what you&apos;re looking for,{' '}
            <Link href="/contact" className="text-ink underline underline-offset-2">
              reach out
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-[800px] mx-auto px-6">
          <PolicySection title="Ordering & customization">
            <QAList
              items={[
                {
                  q: 'How long does my order take?',
                  a: 'Made-to-order prints leave the printer within 3–5 business days. Add 3–10 days of shipping depending on where you are. Digital downloads are delivered immediately by email after payment.',
                },
                {
                  q: 'Can I change my order after placing it?',
                  a: (
                    <>
                      Email{' '}
                      <a
                        href="mailto:milesawayprintsllc@gmail.com"
                        className="text-ink underline underline-offset-2"
                      >
                        milesawayprintsllc@gmail.com
                      </a>{' '}
                      with your order number as soon as you spot it. We can change or cancel
                      while the order is still in <strong className="text-ink">paid</strong>{' '}
                      status — once it moves to <strong className="text-ink">in
                      production</strong>, the printer has accepted the file and we can&apos;t
                      pull it back.
                    </>
                  ),
                },
                {
                  q: 'Can I add a personal message?',
                  a: 'Yes — toggle "This is a gift" on the print page and add a note. The price is hidden from the recipient and your message ships with the print.',
                },
              ]}
            />
          </PolicySection>

          <PolicySection title="Sizing & format">
            <QAList
              items={[
                {
                  q: 'What size should I pick?',
                  a: '8×10 fits a desk or shelf. 11×14 and 12×16 are great for a small wall space. 16×20 and 18×24 are statement pieces. 24×36 is a wall anchor — best in living rooms or large hallways.',
                },
                {
                  q: 'What\'s the difference between digital and physical?',
                  a: 'Physical prints are produced on archival fine-art paper and shipped to you. Digital downloads are high-resolution files (300 DPI) you can print at home, take to a local print shop, or use as wallpaper. Same artwork; different delivery.',
                },
                {
                  q: 'Can I order multiple sizes of the same print?',
                  a: 'Yes — add each size to your cart separately. Multi-size sets look great as a gallery wall.',
                },
              ]}
            />
          </PolicySection>

          <PolicySection title="Shipping">
            <QAList
              items={[
                {
                  q: 'Where do you ship?',
                  a: (
                    <>
                      All 50 U.S. states and 90+ countries through our fulfillment partner
                      Printful. See the{' '}
                      <Link href="/shipping" className="text-ink underline underline-offset-2">
                        shipping page
                      </Link>{' '}
                      for full details.
                    </>
                  ),
                },
                {
                  q: 'How long does shipping take?',
                  a: 'After production, U.S. orders ship in 3–5 business days, Canada and Europe 5–10, rest of the world 10–20.',
                },
                {
                  q: 'How do I track my order?',
                  a: 'You\'ll get an email with the tracking number as soon as your print ships. You can also see it on your order page.',
                },
                {
                  q: 'How is it packaged?',
                  a: 'Prints up to 16×20 ship flat in rigid mailers; 18×24 and larger ship rolled in protective tubes. All packaging is recyclable.',
                },
              ]}
            />
          </PolicySection>

          <PolicySection title="Returns & refunds">
            <QAList
              items={[
                {
                  q: 'Can I return a print?',
                  a: (
                    <>
                      Every print is made to order, so we can&apos;t take returns once a print
                      has been produced. Full policy on the{' '}
                      <Link href="/returns" className="text-ink underline underline-offset-2">
                        returns page
                      </Link>
                      .
                    </>
                  ),
                },
                {
                  q: 'What if it arrives damaged?',
                  a: 'Email us within 14 days of shipping with photos and we\'ll replace it at no cost.',
                },
              ]}
            />
          </PolicySection>

          <PolicySection title="Digital downloads">
            <QAList
              items={[
                {
                  q: 'What format do I get?',
                  a: 'A high-resolution file (PDF or PNG, 300 DPI) sized to print at 24×36 — works for any smaller size with no quality loss.',
                },
                {
                  q: 'Can I print it at home?',
                  a: 'Yes. The file is ready to print on any home printer or send to a local print shop.',
                },
                {
                  q: 'How long is my download link valid?',
                  a: 'Your unique download link is good for 30 days and can be used up to 5 times. Save the file locally as soon as you download it.',
                },
                {
                  q: 'Can I share the file?',
                  a: 'No — the download is licensed for personal use only. You can\'t share, resell, or distribute the file. Each digital purchase is keyed to one customer.',
                },
              ]}
            />
          </PolicySection>

          <PolicySection title="Gifts">
            <QAList
              items={[
                {
                  q: 'Can I send a gift?',
                  a: 'Yes — toggle "This is a gift" on the print page, ship to the recipient\'s address, and we\'ll hide the price.',
                },
                {
                  q: 'Can I include a personal message?',
                  a: 'Yes — add it on the same gift toggle. The message prints on a small card included with the print.',
                },
                {
                  q: 'Will the price be visible?',
                  a: 'No — gift orders ship without a packing slip showing the price.',
                },
              ]}
            />
          </PolicySection>
        </div>
      </section>

      <PolicyCTA />
      <Footer />
    </>
  );
}
