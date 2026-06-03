import type { PrintType } from './prints';

export interface ProductFaq {
  q: string;
  a: string;
}

const COMMON: ProductFaq[] = [
  {
    q: 'What sizes are available?',
    a: 'Standard sizes are 8×10, 11×14, 12×16, 16×20, 18×24, and 24×36 inches. Pricing is shown on the product page; larger sizes scale up cleanly because every design is built as vector art.',
  },
  {
    q: 'What paper do you print on?',
    a: 'Archival-quality matte fine-art paper, 200gsm. Acid-free with a soft surface that reads true-to-design without gloss glare. Each print is made-to-order through our partner Printful in the US.',
  },
  {
    q: 'How long does shipping take?',
    a: 'Production runs 3–5 business days, then 3–5 business days for US delivery. International shipping typically arrives in 7–14 business days. You\'ll get tracking by email once the order ships.',
  },
  {
    q: 'Do you offer returns?',
    a: 'Because every print is made-to-order, we don\'t accept returns. If your print arrives damaged or with a print defect, email us within 14 days and we\'ll send a free replacement.',
  },
];

const PER_TYPE: Partial<Record<PrintType, ProductFaq[]>> = {
  airport: [
    {
      q: 'Is the airport diagram accurate?',
      a: 'Yes — every airport diagram is built from real FAA / ICAO airfield data. Runways are labeled with their actual headings, taxiway letters match the airport directory, and major terminals and hangars are placed to scale.',
    },
    {
      q: 'Can you do an airport not in the catalog?',
      a: 'For most US and international airports, yes. Email us with the ICAO/IATA code and we\'ll quote a one-time custom design. Lead time is 5–7 business days for the design plus normal production.',
    },
  ],
  marathon: [
    {
      q: 'Can you personalize my finish time and bib number?',
      a: 'Yes — that\'s the entire point. Your name, bib number, finish time, and race date are typeset onto the poster before printing. Marathon and half-marathon variants are available for every race in the catalog.',
    },
    {
      q: 'What if my race isn\'t listed?',
      a: 'We add new races constantly — reach out and we\'ll usually have it built within a week. World Marathon Majors and the major US races are all live.',
    },
  ],
  golf: [
    {
      q: 'Are the course holes accurate?',
      a: 'Yes — each course is mapped from official scorecard data. Hole numbers, par values, and yardages match the real course. Hazards and greens are placed to match the satellite layout.',
    },
    {
      q: 'Can you print a course not in the catalog?',
      a: 'For most well-photographed courses, yes. Send the course name and we\'ll quote a custom build — usually 5–7 business days to design.',
    },
  ],
  skyline: [
    {
      q: 'How is the skyline drawn?',
      a: 'Each city skyline is hand-illustrated, not photographed — landmark buildings are recognizable and labeled where helpful. The horizon line is consistent across cities so prints from the same series look unified hung together.',
    },
    {
      q: 'Can you add a custom date or message?',
      a: 'Yes. For most skylines we can typeset a date, address, or short message into the bottom band. Mention it at checkout in the gift-message field or email us before ordering.',
    },
  ],
  stadium: [
    {
      q: 'Does the stadium print show the field layout?',
      a: 'Yes — the field, infield markings, and seating bowl footprint are drawn from real stadium plans. Section labels match the real stadium where space allows.',
    },
    {
      q: 'Can you commemorate a specific game or event?',
      a: 'For most stadiums we can add a game date, opponent, and final score into the lower band. Send the details before ordering and we\'ll typeset it for you.',
    },
  ],
  f1: [
    {
      q: 'Is the F1 circuit drawn to scale?',
      a: 'Yes — every track is drafted from the official FIA layout file. Corner numbers, DRS zones, and the start/finish line are marked. Length and proportions match the real circuit.',
    },
    {
      q: 'Can you do a historic layout?',
      a: 'For the major heritage circuits (old Hockenheim, old Spa, Imola pre-2006), yes — email us with which layout you want and we\'ll build it.',
    },
  ],
  city: [
    {
      q: 'How is the street grid drawn?',
      a: 'From OpenStreetMap data, hand-curated for emphasis. Major arteries are weighted heavier than residential streets, parks are filled, and waterways are styled to match the rest of the print series.',
    },
    {
      q: 'Can you add a custom address callout?',
      a: 'Yes — for most cities we can add a small marker at a specific address (home, where you met, etc.) with a short label. Mention it at checkout or email before ordering.',
    },
  ],
};

export function getProductFaqs(type: PrintType): ProductFaq[] {
  const specific = PER_TYPE[type] ?? [];
  return [...specific, ...COMMON];
}
