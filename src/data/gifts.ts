import type { PrintType, PrintFaq } from './prints';

export type GiftOccasion =
  | 'fathers-day'
  | 'holiday'
  | 'birthday'
  | 'anniversary';

export interface GiftConfig {
  slug: GiftOccasion;
  /** Hero H1 — e.g., "Father's Day Prints". */
  title: string;
  /** Page-level meta title for `<title>`. */
  seoTitle: string;
  /** Page-level meta description. */
  seoDescription: string;
  /** Hero lede paragraph. */
  lede: string;
  /** Optional time-sensitive banner copy under the hero (e.g., "Order by June 12…"). */
  urgentCopy?: string;
  /** Curated product slugs (from gallery_items.slug). Rendered first, in order. */
  featuredSlugs: string[];
  /** Marathon slugs (from marathons.slug) to mix in. Optional. */
  featuredMarathonSlugs?: string[];
  /** Fallback categories — if a featured slug is unavailable, pull more from these types. */
  fallbackTypes: PrintType[];
  /** 2-3 short paragraphs for the "Why this works as a gift" section. */
  whyCopy: string[];
  /** FAQs for the page + FAQPage schema. */
  faqs: PrintFaq[];
}

const SHIPPING_FAQ: PrintFaq = {
  q: 'How long does shipping take?',
  a: 'Made-to-order prints leave the printer in 3–5 business days. U.S. delivery adds 3–5 business days; international is 5–20. Need it sooner? Digital downloads arrive instantly by email.',
};

const PERSONALIZATION_FAQ: PrintFaq = {
  q: 'Can I personalize it?',
  a: 'Yes — every print can be customized: course name, airport code, city title, finish time, race date, coordinates. Type, see, ship.',
};

const GIFT_TOGGLE_FAQ: PrintFaq = {
  q: 'Can I send it as a gift?',
  a: 'Toggle "This is a gift" on the print page, add a personal message, and ship straight to the recipient. We hide the price on the packing slip.',
};

const RETURN_FAQ: PrintFaq = {
  q: 'What if the recipient doesn\'t love it?',
  a: 'If anything arrives damaged or incorrect, we replace it free within 14 days. Made-to-order prints aren\'t returnable, but we\'ll always make a damaged or misprinted one right.',
};

export const GIFT_CONFIGS: Record<GiftOccasion, GiftConfig> = {
  'fathers-day': {
    slug: 'fathers-day',
    title: "Father's Day prints",
    seoTitle:
      "Father's Day Golf Prints — Pebble Beach, St. Andrews & More",
    seoDescription:
      "Personalized Father's Day golf prints — Pebble Beach, Old Course at St. Andrews, TPC Sawgrass, and more. Custom airport and marathon prints too. Made to order, shipped in 5 business days. Order by June 12 for Father's Day arrival.",
    lede:
      "Pebble Beach, Old Course at St. Andrews, TPC Sawgrass — the courses he loves, custom-printed with his name. Plus the airport he flies through and the marathon he ran. The Father's Day gift that actually gets framed.",
    urgentCopy: 'Order by June 12 for arrival before Father\'s Day (June 21).',
    featuredSlugs: [
      // Lead with the iconic ones — Pebble Beach + St. Andrews are the
      // two most famous courses in the world, perfect for dad's wall.
      'pebble-beach-golf-links',
      'old-course-at-st-andrews',
      'tpc-sawgrass',
      'tokyo-golf-course',
      'quintero-golf-club',
      'coeur-d-alene-golf-course',
      'denver-international-airport',
      'chicago-o-hare-international-airport',
      'los-angeles-international-airport',
      'newark-liberty-international-airport',
    ],
    featuredMarathonSlugs: ['chicago', 'las-vegas'],
    fallbackTypes: ['golf', 'airport', 'marathon'],
    whyCopy: [
      "A golf course print is the rare Father's Day gift that actually earns wall space. Dads who play already have the clubs, the gloves, the rangefinder. What they don't have is a Pebble Beach or Augusta-level course rendered as art — drawn from real course data, every fairway, green, and bunker faithful to the layout.",
      "Personalize it with his name, the course details, his best round's stats. Six iconic courses ready to ship: Pebble Beach Golf Links on the California coast, Old Course at St. Andrews (the literal birthplace of golf in Scotland), TPC Sawgrass with the legendary 17th island green, Tokyo Golf Course, Quintero Golf Club, and Coeur d'Alene Golf Course with its floating 14th green. Don't see his home course? Contact us — we can build it from public course data.",
      "Each Father's Day print is made-to-order on archival fine-art paper, packaged carefully, and arrives ready for a frame. Order by June 12 for U.S. delivery before Father's Day (June 21). Toggle \"This is a gift\" at checkout — we hide the price and include a personal note in the package.",
    ],
    faqs: [
      {
        q: "Which golf courses do you have for Father's Day?",
        a: "Six courses ready to personalize: Pebble Beach Golf Links, Old Course at St. Andrews, TPC Sawgrass, Tokyo Golf Course, Quintero Golf Club, and Coeur d'Alene Golf Course. If you don't see his home course, contact us — we can build it from public course data and ship it in time.",
      },
      {
        q: "When do I need to order to get it in time for Father's Day?",
        a: "Order by June 12 for U.S. delivery before Father's Day on June 21 (5-day production + 5-day shipping buffer). Earlier is safer; international orders need ~3 weeks. After June 12, contact us about expedited options.",
      },
      PERSONALIZATION_FAQ,
      GIFT_TOGGLE_FAQ,
      SHIPPING_FAQ,
    ],
  },

  holiday: {
    slug: 'holiday',
    title: 'Holiday gift prints',
    seoTitle: 'Holiday Gift Prints | Custom Skyline, Airport & Map Art',
    seoDescription:
      'Personalized holiday gifts — custom city skyline prints, airport map art, golf course prints, and marathon prints. Shipped in time for the holidays. 10% off your first order.',
    lede:
      "The cities they've lived in. The airports they fly through. The course they swear by. Custom prints that turn the personal into wall art — perfect under the tree.",
    urgentCopy: 'Order by December 14 for arrival before December 24.',
    featuredSlugs: [
      'new-york-new-york',
      'london-uk',
      'paris-france',
      'rome-italy',
      'chicago-illinois',
      'los-angeles-california',
      'tpc-sawgrass',
      'denver-international-airport',
      'barcelona-spain',
      'tokyo-golf-course',
    ],
    featuredMarathonSlugs: ['chicago', 'las-vegas'],
    fallbackTypes: ['skyline', 'airport', 'golf', 'marathon'],
    whyCopy: [
      "The best holiday gifts aren't the most expensive — they're the most personal. A print of the city someone calls home, the airport they grew up flying into, the golf course they've been playing for 30 years.",
      "Every print is made to order: customized with their name, location, and details, printed on archival paper, and shipped ready to frame. No mass-produced anything.",
      'Toggle "This is a gift" at checkout to ship straight to the recipient with a personal message and a hidden price. Make sure to order by December 14 for U.S. arrival before Christmas — after that, the digital download still makes a beautiful last-minute gift.',
    ],
    faqs: [
      {
        q: 'When do I need to order for the holidays?',
        a: 'Order by December 14 for U.S. delivery by December 24. International orders need ~3 weeks. After December 14, choose Digital — instant download, printable at any local print shop.',
      },
      PERSONALIZATION_FAQ,
      GIFT_TOGGLE_FAQ,
      SHIPPING_FAQ,
    ],
  },

  birthday: {
    slug: 'birthday',
    title: 'Birthday gift prints',
    seoTitle: 'Birthday Gift Prints | Custom Location Art Prints',
    seoDescription:
      'Personalized birthday gifts — custom skyline, golf, airport, and marathon prints. Add their name, city, date, and details. Ships in 5 business days.',
    lede:
      'Move past the gift card. A custom print of the place they call home, the city they grew up in, or the moment they\'re most proud of — personalized with their name, date, and the details that make it theirs.',
    featuredSlugs: [
      'new-york-new-york',
      'paris-france',
      'london-uk',
      'los-angeles-california',
      'tpc-sawgrass',
      'tokyo-golf-course',
      'denver-international-airport',
      'rome-italy',
    ],
    featuredMarathonSlugs: ['chicago', 'las-vegas'],
    fallbackTypes: ['skyline', 'golf', 'airport', 'marathon'],
    whyCopy: [
      "A birthday print works for the friend who's hard to buy for, the colleague you barely know, and the family member who already has everything. Specificity wins.",
      "Pick a city they love, the airport they fly through every week, the course they play on Sundays, or the marathon they finally finished — we'll personalize it with their name, the date, and the details that make it theirs.",
      "Shipped ready to frame. Toggle the gift option at checkout to add a personal message and hide the price.",
    ],
    faqs: [
      PERSONALIZATION_FAQ,
      GIFT_TOGGLE_FAQ,
      SHIPPING_FAQ,
      RETURN_FAQ,
    ],
  },

  anniversary: {
    slug: 'anniversary',
    title: 'Anniversary gift prints',
    seoTitle: 'Anniversary Gift Prints | Where It All Started — Custom Skyline & Map Art',
    seoDescription:
      'Personalized anniversary gifts — custom city skyline prints of where you met, got engaged, or got married. Made to order on archival paper, shipped worldwide.',
    lede:
      "The city you met in. The neighborhood you got engaged in. The skyline you watched on your honeymoon. Custom prints of the places that mark the moments — personalized with names, dates, and a title only you'd write.",
    featuredSlugs: [
      'new-york-new-york',
      'paris-france',
      'rome-italy',
      'london-uk',
      'barcelona-spain',
      'amsterdam-netherlands',
      'lisbon-portugal',
      'los-angeles-california',
      'chicago-illinois',
      'tokyo-golf-course',
    ],
    fallbackTypes: ['skyline'],
    whyCopy: [
      "Where it all started is the gift no one else can give. A skyline of the city you met in, with your names and the date you'd never forget — it's the kind of gift that earns a frame, not a closet.",
      "Pick a city, set the title (\"Where we met,\" the date you proposed, an inside joke only the two of you get), and we render the artwork live so you see exactly what ships.",
      "Made to order on archival paper, packaged carefully, and ready to frame. Add a personal note at checkout if it's going straight to them.",
    ],
    faqs: [
      {
        q: 'Can I add our names and the date?',
        a: 'Yes — every skyline print can be customized with the title text, names, coordinates, and a "founded" / anniversary date. Type it in, see it render live, ship.',
      },
      PERSONALIZATION_FAQ,
      GIFT_TOGGLE_FAQ,
      SHIPPING_FAQ,
    ],
  },
};

export const GIFT_ORDER: GiftOccasion[] = [
  'fathers-day',
  'birthday',
  'anniversary',
  'holiday',
];
