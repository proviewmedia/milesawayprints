import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/**
 * Editorial "course spotlight" section for the Father's Day gift page.
 *
 * Why it's here: keyword density + internal linking + content depth all
 * matter for ranking on "Father's Day golf print" / "Pebble Beach gift" /
 * "St. Andrews print" searches. The 2-sentence blurb per course is also
 * the kind of contextual content Google rewards on commerce pages — it
 * differentiates us from cookie-cutter print-on-demand sites that have
 * no editorial voice.
 *
 * Each block is an internal link to the product page, in-context with
 * the course's reputation cue (Bing Crosby for Pebble, birthplace-of-
 * golf for St. Andrews, etc.). Compounds with the product grid above
 * by linking to the same product through different anchor text.
 */
interface CourseBlock {
  slug: string;
  name: string;
  location: string;
  blurb: string;
}

const COURSES: CourseBlock[] = [
  {
    slug: 'pebble-beach-golf-links',
    name: 'Pebble Beach Golf Links',
    location: 'Pebble Beach, California',
    blurb:
      'Maybe the most-photographed golf course on earth. Home to the AT&T Pebble Beach Pro-Am and multiple U.S. Opens, with seven holes that hug the Pacific cliffs. If he\'s ever bucket-listed a round at Pebble, this is the print.',
  },
  {
    slug: 'old-course-at-st-andrews',
    name: 'Old Course at St. Andrews',
    location: 'St. Andrews, Scotland',
    blurb:
      'The literal birthplace of golf. Played since the 15th century, home of The Open Championship, and the only course every serious golfer dreams of teeing it up at. The 18th green with the iconic Swilcan Bridge is on this print.',
  },
  {
    slug: 'tpc-sawgrass',
    name: 'TPC Sawgrass',
    location: 'Ponte Vedra Beach, Florida',
    blurb:
      'Home of THE PLAYERS Championship and the most famous par-3 in the world: the island green 17th. A bucket-list course for any serious golfer, and one of the most recognizable layouts on the PGA Tour calendar.',
  },
  {
    slug: 'tokyo-golf-course',
    name: 'Tokyo Golf Course',
    location: 'Sayama, Japan',
    blurb:
      'One of Japan\'s most respected courses, founded in 1914 and hosting the Japan Open twelve times. The perfect gift for the golfer who appreciates Japanese craft, or who has a connection to playing in Asia.',
  },
  {
    slug: 'quintero-golf-club',
    name: 'Quintero Golf Club',
    location: 'Peoria, Arizona',
    blurb:
      'A desert gem northwest of Phoenix — dramatic elevation changes, granite outcroppings, and 360-degree mountain views. A favorite of golfers who chase the southwest desert-course aesthetic.',
  },
  {
    slug: 'coeur-d-alene-golf-course',
    name: 'Coeur d\'Alene Resort Golf Course',
    location: 'Coeur d\'Alene, Idaho',
    blurb:
      'Famous for the floating 14th green on Lake Coeur d\'Alene — the world\'s only floating green, moved daily to vary the yardage. A signature destination round for any golfer headed to the Pacific Northwest.',
  },
];

export default function CourseSpotlight() {
  return (
    <section className="py-14 md:py-20 border-t border-border bg-soft">
      <div className="max-w-[1100px] mx-auto px-6">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-medium text-ink tracking-tight mb-3">
            The six courses, briefly
          </h2>
          <p className="text-mid leading-relaxed">
            A quick read on each course before you pick. Every print is personalized with his name and the stats from his round.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-10">
          {COURSES.map((c) => (
            <article key={c.slug} className="border-l-2 border-border pl-5">
              <div className="text-[11px] font-medium tracking-widest uppercase text-mid mb-1">
                {c.location}
              </div>
              <h3 className="text-lg md:text-xl font-medium text-ink mb-2 tracking-tight">
                {c.name}
              </h3>
              <p className="text-mid text-[15px] leading-relaxed mb-4">
                {c.blurb}
              </p>
              <Link
                href={`/shop/${c.slug}`}
                className="inline-flex items-center gap-1.5 text-sm text-ink hover:opacity-70 underline underline-offset-2"
              >
                See the {c.name} print <ArrowRight size={13} strokeWidth={1.75} />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
