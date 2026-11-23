/**
 * Service areas for local SEO. The INQ Press is an online studio based in
 * Las Vegas: every order ships, and there is no public storefront address,
 * so these are service-area pages, not branch locations. Copy must stay
 * true: no claims of local pickup, offices, or past clients we don't have.
 *
 * Each page links real shop prints of that area (gallery slugs) so it is
 * useful on its own, not a city-name swap.
 */
import type { CustomPrintType } from './custom-prints';

export interface ServiceArea {
  slug: string;
  /** Short name used in headings: "Houston". */
  name: string;
  /** "Houston, Texas" for titles and copy. */
  full: string;
  /** Cities and regions for schema.org areaServed. */
  areaServed: { type: 'City' | 'State'; name: string }[];
  seoTitle: string;
  seoDescription: string;
  intro: string;
  /** Who we print for here: short, specific, true. */
  uses: { title: string; desc: string }[];
  /** Active gallery_items slugs from this area. */
  featuredSlugs: string[];
  /** Ideas for a custom print of the area, opening the builder. */
  printIdeas: { label: string; type: CustomPrintType }[];
  faqs: { q: string; a: string }[];
}

const SHIPPING_FAQ = (place: string) => ({
  q: `How long does an order take to reach ${place}?`,
  a: 'Prints ship within 3 to 5 business days after you approve the proof, then arrive in 3 to 5 business days by tracked shipping within the US. Apparel, stickers, signs, and other custom items get a turnaround date with your quote. If you have a deadline, add it to your quote request.',
});

const MINIMUM_FAQ = {
  q: 'Is there a minimum order?',
  a: 'No. You can order a single shirt or one print, or hundreds for a team or event. Larger quantities lower the price per piece.',
};

export const SERVICE_AREAS: ServiceArea[] = [
  {
    slug: 'college-station',
    name: 'College Station',
    full: 'College Station, Texas',
    areaServed: [
      { type: 'City', name: 'College Station, TX' },
      { type: 'City', name: 'Bryan, TX' },
      { type: 'State', name: 'Texas' },
    ],
    seoTitle: 'Custom Printing in College Station, TX: Shirts, Stickers, Prints',
    seoDescription:
      'Custom shirts, hats, stickers, signs, and prints for Bryan and College Station. Student orgs, game day, local businesses, and gifts. Free quotes and a proof before anything prints.',
    intro:
      'Shirts, hats, stickers, signs, and prints for Bryan and College Station. One piece for yourself or a full run for your student org, team, or business, with a free quote and a proof before anything prints.',
    uses: [
      { title: 'Student organizations', desc: 'Chapter shirts, rush and philanthropy event merch, stickers, and banners.' },
      { title: 'Game day', desc: 'Shirts, hats, and koozies in your group’s own design.' },
      { title: 'Local businesses', desc: 'Staff shirts, hats, signage, and branded stickers for shops and restaurants.' },
      { title: 'Graduation gifts', desc: 'A custom print of a favorite course, city, or the place it all happened.' },
    ],
    featuredSlugs: ['houston-oaks-country-club-retreat'],
    printIdeas: [
      { label: 'College Station street map', type: 'city' },
      { label: 'Your home golf course', type: 'golf' },
      { label: 'Your stadium', type: 'stadium' },
    ],
    faqs: [
      {
        q: 'Can you print Texas A&M logos?',
        a: 'University names and logos are trademarked and need a licensed vendor, so we can’t print official marks. We print your organization’s own designs, and we can help you create one.',
      },
      SHIPPING_FAQ('College Station'),
      MINIMUM_FAQ,
    ],
  },
  {
    slug: 'houston',
    name: 'Houston',
    full: 'Houston, Texas',
    areaServed: [
      { type: 'City', name: 'Houston, TX' },
      { type: 'City', name: 'The Woodlands, TX' },
      { type: 'City', name: 'Katy, TX' },
      { type: 'City', name: 'Sugar Land, TX' },
      { type: 'State', name: 'Texas' },
    ],
    seoTitle: 'Custom Printing in Houston, TX: Shirts, Merch, Signs, Prints',
    seoDescription:
      'Custom printing for Houston: shirts, hats, stickers, banners, and merch for businesses, events, teams, and running clubs, plus custom map and airport prints. Free quotes and proofs.',
    intro:
      'Custom shirts, hats, stickers, banners, and prints for Houston businesses, events, teams, and running clubs. Tell us what you need, get a free quote and a proof, and it ships to your door.',
    uses: [
      { title: 'Businesses and restaurants', desc: 'Staff uniforms, hats, window and yard signs, and branded stickers.' },
      { title: 'Events and conferences', desc: 'Banners, booth signage, giveaways, and event shirts.' },
      { title: 'Teams and running clubs', desc: 'Race-day shirts, club hats, and finisher gifts.' },
      { title: 'Gifts', desc: 'A print of your neighborhood, your golf course, or IAH or Hobby for the traveler.' },
    ],
    featuredSlugs: ['houston-oaks-country-club-retreat'],
    printIdeas: [
      { label: 'Houston street map', type: 'city' },
      { label: 'IAH or Hobby airport', type: 'airport' },
      { label: 'Your Houston marathon finish', type: 'marathon' },
      { label: 'Houston skyline', type: 'skyline' },
    ],
    faqs: [
      SHIPPING_FAQ('Houston'),
      {
        q: 'Can you handle a rush order?',
        a: 'Often, yes. Add your deadline to the quote request and we will tell you up front whether we can make it and what it costs.',
      },
      MINIMUM_FAQ,
    ],
  },
  {
    slug: 'las-vegas',
    name: 'Las Vegas',
    full: 'Las Vegas, Nevada',
    areaServed: [
      { type: 'City', name: 'Las Vegas, NV' },
      { type: 'City', name: 'Henderson, NV' },
      { type: 'City', name: 'North Las Vegas, NV' },
      { type: 'State', name: 'Nevada' },
    ],
    seoTitle: 'Custom Printing in Las Vegas, NV: Shirts, Stickers, Signs, Prints',
    seoDescription:
      'A Las Vegas print studio for custom shirts, hats, stickers, banners, and merch, plus Las Vegas map, Grand Prix, and marathon prints. Free quotes and a proof before anything prints.',
    intro:
      'Our studio is in Las Vegas. We print shirts, hats, stickers, banners, and merch for local businesses, events, and celebrations, plus prints of the city we call home.',
    uses: [
      { title: 'Events and conventions', desc: 'Booth banners, signage, and giveaways that travel well.' },
      { title: 'Weddings and celebrations', desc: 'Bachelor and bachelorette shirts, hats, and favors.' },
      { title: 'Local businesses', desc: 'Uniforms, hats, stickers, and signs for shops, gyms, and restaurants.' },
      { title: 'Runners and race fans', desc: 'A personalized Las Vegas Marathon print or a Grand Prix circuit print.' },
    ],
    featuredSlugs: ['las-vegas-street-map-dark', 'las-vegas-street-map-light', 'las-vegas-grand-prix'],
    printIdeas: [
      { label: 'Your Las Vegas neighborhood', type: 'city' },
      { label: 'LAS airport', type: 'airport' },
      { label: 'Your local golf course', type: 'golf' },
    ],
    faqs: [
      {
        q: 'Are you based in Las Vegas?',
        a: 'Yes. The INQ Press is designed in Las Vegas. Every order ships to your door, including local Las Vegas addresses.',
      },
      SHIPPING_FAQ('Las Vegas'),
      MINIMUM_FAQ,
    ],
  },
  {
    slug: 'boston-rhode-island',
    name: 'Boston and Rhode Island',
    full: 'Boston and Rhode Island',
    areaServed: [
      { type: 'City', name: 'Boston, MA' },
      { type: 'City', name: 'Cambridge, MA' },
      { type: 'City', name: 'Providence, RI' },
      { type: 'City', name: 'Newport, RI' },
      { type: 'State', name: 'Massachusetts' },
      { type: 'State', name: 'Rhode Island' },
    ],
    seoTitle: 'Custom Printing in Boston and Rhode Island: Shirts, Merch, Prints',
    seoDescription:
      'Custom shirts, hats, stickers, signs, and prints for Boston, Providence, and Rhode Island. Student groups, running clubs, businesses, and gifts. Free quotes and proofs.',
    intro:
      'Custom shirts, hats, stickers, signs, and prints for Boston, Providence, and the rest of Rhode Island. Our founder studied design in Boston, and New England is still close to home.',
    uses: [
      { title: 'Student groups', desc: 'Club shirts, event merch, and stickers for campus organizations.' },
      { title: 'Running clubs', desc: 'Training shirts, hats, and race-route prints for your marathon.' },
      { title: 'Businesses', desc: 'Uniforms, signage, and branded merch for shops, studios, and offices.' },
      { title: 'Gifts', desc: 'Boston and Providence street map prints, or your own course or airport.' },
    ],
    featuredSlugs: [
      'boston-street-map-dark',
      'boston-street-map-white',
      'providence-ri-street-map-black',
      'providence-ri-street-map-light',
    ],
    printIdeas: [
      { label: 'Your Boston Marathon finish', type: 'marathon' },
      { label: 'BOS or PVD airport', type: 'airport' },
      { label: 'Your ballpark or stadium', type: 'stadium' },
    ],
    faqs: [SHIPPING_FAQ('Boston and Rhode Island'), MINIMUM_FAQ],
  },
  {
    slug: 'florida',
    name: 'Florida',
    full: 'Florida',
    areaServed: [
      { type: 'City', name: 'Miami, FL' },
      { type: 'City', name: 'Orlando, FL' },
      { type: 'City', name: 'Tampa, FL' },
      { type: 'City', name: 'Jacksonville, FL' },
      { type: 'State', name: 'Florida' },
    ],
    seoTitle: 'Custom Printing in Florida: Miami, Orlando, Tampa, Jacksonville',
    seoDescription:
      'Custom shirts, hats, stickers, signs, and merch shipped across Florida, plus Miami, Orlando, Tampa, TPC Sawgrass, and Miami Grand Prix prints. Free quotes and proofs.',
    intro:
      'Custom shirts, hats, stickers, signs, and prints shipped anywhere in Florida, from Miami and Tampa to Orlando and Jacksonville.',
    uses: [
      { title: 'Golf gifts', desc: 'A print of TPC Sawgrass or your home course, plus custom hats for the group.' },
      { title: 'Race fans', desc: 'Miami Grand Prix circuit prints and race-weekend shirts.' },
      { title: 'Events and reunions', desc: 'Matching shirts, hats, and banners for family and group trips.' },
      { title: 'Local businesses', desc: 'Uniforms, signage, and branded stickers.' },
    ],
    featuredSlugs: [
      'tpc-sawgrass',
      'miami-grand-prix',
      'miami-street-map-dark',
      'orlando-street-map-dark',
      'tampa-street-map-dark',
      'miami-street-map-light',
    ],
    printIdeas: [
      { label: 'Your Florida golf course', type: 'golf' },
      { label: 'MCO, MIA, or TPA airport', type: 'airport' },
      { label: 'Your Florida city', type: 'city' },
    ],
    faqs: [SHIPPING_FAQ('Florida'), MINIMUM_FAQ],
  },
];

export function getServiceArea(slug: string): ServiceArea | undefined {
  return SERVICE_AREAS.find((a) => a.slug === slug);
}
