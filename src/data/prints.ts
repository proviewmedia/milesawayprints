export type PrintType = 'golf' | 'stadium' | 'airport' | 'marathon' | 'city' | 'skyline' | 'f1';

export interface PrintField {
  id: string;
  label: string;
  placeholder: string;
  required?: boolean;
}

export interface GalleryItem {
  id?: string;
  name: string;
  location: string;
  image_url?: string;
  values: Record<string, string>;
}

export interface PrintFaq {
  q: string;
  a: string;
}

export interface PrintConfig {
  type: PrintType;
  slug: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: { bg: string; text: string };
  detailsLabel: string;
  fields: PrintField[];
  statFields: PrintField[];
  statLabels: string[];
  defaults: Record<string, string>;
  seoTitle: string;
  seoDescription: string;
  /** SEO lede paragraph displayed at the top of /prints/[type]. */
  lede: string;
  /** 2-3 short paragraphs displayed in the "Why" section of /prints/[type]. */
  whyCopy: string[];
  /** Per-type FAQ used for both rendered content + FAQPage JSON-LD. */
  faqs: PrintFaq[];
}

const SHARED_FAQS: PrintFaq[] = [
  {
    q: 'What sizes are available?',
    a: '8×10, 11×14, 12×16, 16×20, 18×24, and 24×36 inches. Smaller sizes fit a shelf or desk; 16×20 and up are statement pieces for a wall.',
  },
  {
    q: 'How long does shipping take?',
    a: 'Made-to-order prints leave the printer in 3–5 business days. U.S. delivery adds another 3–5 business days; Canada and Europe 5–10; rest of the world 10–20. Digital downloads arrive instantly by email.',
  },
  {
    q: 'Can I customize the title or details?',
    a: 'Yes — every print is personalized. Pick the location, add a title, name, or date, and we render the artwork live so you see exactly what ships.',
  },
  {
    q: 'How is the print made?',
    a: 'Printed on archival fine-art paper through our fulfillment partner Printful. Up to 16×20 ships flat in a rigid mailer; 18×24 and larger ships rolled in a protective tube. Packaging is recyclable.',
  },
];

export const PRINT_CONFIGS: Record<PrintType, PrintConfig> = {
  golf: {
    type: 'golf',
    slug: 'golf',
    title: 'Custom Golf Course Print',
    subtitle: 'Your favorite course, beautifully mapped and personalized. Every fairway, green, and bunker captured in art.',
    badge: 'Best Seller',
    badgeColor: { bg: '#d1fae5', text: '#059669' },
    detailsLabel: 'Course',
    fields: [
      { id: 'name', label: 'Course Name', placeholder: 'e.g. Pebble Beach Golf Links', required: true },
      { id: 'location', label: 'Location', placeholder: 'e.g. Pebble Beach, California', required: true },
    ],
    statFields: [
      { id: 'stat1', label: 'Length', placeholder: '7,040 yds' },
      { id: 'stat2', label: 'Par', placeholder: '72' },
      { id: 'stat3', label: 'Rating', placeholder: '73.5' },
    ],
    statLabels: ['Length', 'Par', 'Rating'],
    defaults: { name: 'Custom Golf Course', location: 'Location', stat1: '7,040 yds', stat2: '72', stat3: '73.5' },
    seoTitle: 'Custom Golf Course Art Prints — Pebble Beach, St. Andrews & More',
    seoDescription: 'Custom golf course art prints — Pebble Beach Golf Links, Old Course at St. Andrews, TPC Sawgrass, Tokyo Golf Course, Quintero, Coeur d\'Alene. Personalized with course name, location, and stats. Made-to-order on archival paper.',
    lede: "Pebble Beach. Old Course at St. Andrews. TPC Sawgrass. And your home course in the suburbs. Custom golf course prints rendered from real course data — every fairway, green, and bunker drawn with precision.",
    whyCopy: [
      "Built from real course maps, not generic clip art. Pebble Beach Golf Links on the California coast. Old Course at St. Andrews — the literal birthplace of golf in Scotland. TPC Sawgrass with the legendary 17th island green. Every layout is faithful to the actual course, drawn from public course data and rendered with precision.",
      "Personalize it with course name, location, yardage, par, and rating. Print it to mark a milestone round, a hole-in-one, a course you traveled across the country to play, or as the rare Father's Day gift that actually earns wall space.",
      "Printed on archival fine-art paper, packaged carefully, and shipped worldwide. Don't see your home course? Contact us — we can build it from public course data and add it to the catalog.",
    ],
    faqs: [
      {
        q: 'Can I order a print of my home course?',
        a: 'Yes — request any course in the world. If we don\'t have it pre-mapped, contact us and we\'ll build it from public course data.',
      },
      ...SHARED_FAQS,
    ],
  },
  stadium: {
    type: 'stadium',
    slug: 'stadium',
    title: 'Custom Stadium Art Print',
    subtitle: 'Your stadium, iconic and timeless. Every seat, every detail, captured from above in stunning minimal art.',
    badge: 'Fan Favorite',
    badgeColor: { bg: '#e8ecfe', text: '#4f6df5' },
    detailsLabel: 'Stadium',
    fields: [
      { id: 'name', label: 'Stadium Name', placeholder: 'e.g. Yankee Stadium', required: true },
      { id: 'location', label: 'Location', placeholder: 'e.g. Bronx, New York', required: true },
    ],
    statFields: [
      { id: 'stat1', label: 'Capacity', placeholder: '54,251' },
      { id: 'stat2', label: 'Opened', placeholder: '2009' },
      { id: 'stat3', label: 'Coordinates', placeholder: '40.8296° N' },
    ],
    statLabels: ['Capacity', 'Opened', 'Location'],
    defaults: { name: 'Custom Stadium', location: 'Location', stat1: '54,251', stat2: '2009', stat3: '40.8296° N' },
    seoTitle: 'Custom Stadium Art Print | Personalized Sports Gift',
    seoDescription: 'Create a custom stadium art print of your favorite venue. Personalized with stadium name, capacity, and location. Digital download or museum-quality print.',
    lede: 'Custom stadium art prints of the ballparks, arenas, and pitches you love. Drawn from above in minimalist line work — Yankee Stadium, Fenway, Wrigley, and any venue you request.',
    whyCopy: [
      'Stadiums are sacred to fans. We render the architecture, the seat bowl, and the field with the same care as the games played inside.',
      'Personalize it with the stadium name, opened-year, capacity, and coordinates. Perfect for season-ticket holders, opening-day memories, or rookie-card-collector dads.',
      'Museum-quality archival paper. Digital file or physical print, shipped worldwide.',
    ],
    faqs: [
      {
        q: 'Which stadiums do you cover?',
        a: 'MLB, NFL, NBA, NHL, MLS, NCAA, Premier League, La Liga, Bundesliga, and more. We can also build any minor-league or college venue on request.',
      },
      ...SHARED_FAQS,
    ],
  },
  airport: {
    type: 'airport',
    slug: 'airport',
    title: 'Custom Airport Map Print',
    subtitle: 'Runways, taxiways, and terminals mapped in striking detail. A must-have for aviation enthusiasts and frequent flyers.',
    badge: 'Aviation Art',
    badgeColor: { bg: '#f3f4f6', text: '#374151' },
    detailsLabel: 'Airport',
    fields: [
      { id: 'name', label: 'Airport Name', placeholder: 'e.g. Los Angeles International', required: true },
      { id: 'location', label: 'City, State', placeholder: 'e.g. Los Angeles, California', required: true },
    ],
    statFields: [
      { id: 'stat1', label: 'IATA Code', placeholder: 'LAX' },
      { id: 'stat2', label: 'Runways', placeholder: '4' },
      { id: 'stat3', label: 'Elevation', placeholder: '128 ft' },
    ],
    statLabels: ['Code', 'Runways', 'Elevation'],
    defaults: { name: 'Custom Airport', location: 'City, State', stat1: 'IATA', stat2: '4', stat3: '128 ft' },
    seoTitle: 'Custom Airport Map Print | Aviation Wall Art',
    seoDescription: 'Create a custom airport map print showing runways and terminals. Personalized with airport name and details. Digital download or museum-quality print.',
    lede: 'Custom airport map prints — every runway, taxiway, and terminal in minimalist line work. From LAX and JFK to your hometown regional, drawn faithfully from real aviation data.',
    whyCopy: [
      'For pilots, frequent flyers, aviation geeks, and anyone with a sense of place tied to a particular airport. We map every runway and taxiway from FAA / AIP data.',
      'Personalize it with the IATA code, runway count, and elevation. A great gift for first solos, retirements, or the family member always on a plane.',
      'Printed on archival paper. Digital download or physical print, shipped worldwide.',
    ],
    faqs: [
      {
        q: 'Which airports do you have?',
        a: 'Every IATA-coded commercial airport worldwide, plus most regional and general aviation fields. If you don\'t see yours, request it.',
      },
      ...SHARED_FAQS,
    ],
  },
  marathon: {
    type: 'marathon',
    slug: 'marathon',
    title: 'Custom Marathon Map Print',
    subtitle: 'Celebrate every mile. Your race route mapped and personalized with your name, time, and finish stats.',
    badge: 'For Runners',
    badgeColor: { bg: '#fee2e2', text: '#dc2626' },
    detailsLabel: 'Race',
    fields: [
      { id: 'name', label: 'Marathon Name', placeholder: 'e.g. Boston Marathon', required: true },
      { id: 'location', label: 'Date', placeholder: 'e.g. April 15, 2024', required: true },
    ],
    statFields: [
      { id: 'stat1', label: 'Finish Time', placeholder: '3:45:22' },
      { id: 'stat2', label: 'Distance', placeholder: '26.2' },
      { id: 'stat3', label: 'Pace', placeholder: '8:35/mi' },
    ],
    statLabels: ['Finish', 'Distance', 'Pace'],
    defaults: { name: 'Marathon Name', location: 'Date', stat1: '3:45:22', stat2: '26.2', stat3: '8:35/mi' },
    seoTitle: 'Custom Marathon Map Print | Personalized Runner Gift',
    seoDescription: 'Create a custom marathon route map print. Personalized with race name, finish time, and pace. The perfect gift for runners. Digital or physical print.',
    lede: 'Custom marathon prints celebrating every mile. The actual race route, personalized with your name, bib number, finish time, and date. Las Vegas, Chicago, Boston, NYC — and more.',
    whyCopy: [
      'Built race-by-race from the real course. The route on the print is the route you ran — not a generic loop.',
      'Personalized live: your name, bib number, finish time, race date. Type, see, ship. The way every commemorative print should work.',
      'Marathon prints are hand-built by us, not auto-generated. Ships in 5 business days; expect 8–12 days door-to-door.',
    ],
    faqs: [
      {
        q: 'Which marathons do you offer?',
        a: 'Currently Las Vegas (Full + Half) and Chicago, with more added each season. If your race isn\'t listed, contact us — we add new courses based on demand.',
      },
      {
        q: 'Can I order before I run the race?',
        a: 'Yes — many runners pre-order with their goal time, then we ship after the race so the finish time prints correctly. Just email us your actual chip time.',
      },
      ...SHARED_FAQS,
    ],
  },
  city: {
    type: 'city',
    slug: 'city',
    title: 'Custom City Street Map',
    subtitle: 'The streets that tell your story. Any city in the world, beautifully rendered with your personal coordinates.',
    badge: 'Most Custom',
    badgeColor: { bg: '#ede9fe', text: '#7c3aed' },
    detailsLabel: 'City',
    fields: [
      { id: 'name', label: 'City Name', placeholder: 'e.g. San Francisco', required: true },
      { id: 'location', label: 'Country / State', placeholder: 'e.g. California, USA', required: true },
    ],
    statFields: [
      { id: 'stat1', label: 'Latitude', placeholder: '37.7749° N' },
      { id: 'stat2', label: 'Longitude', placeholder: '122.4194° W' },
      { id: 'stat3', label: 'Founded', placeholder: '1776' },
    ],
    statLabels: ['Lat', 'Long', 'Founded'],
    defaults: { name: 'Your City', location: 'Country', stat1: '37.77° N', stat2: '122.42° W', stat3: '1776' },
    seoTitle: 'Custom City Street Map Print | Personalized Map Art',
    seoDescription: 'Create a custom city street map print of any city in the world. Personalized with coordinates and details. Digital download or museum-quality print.',
    lede: 'Custom city street map prints — the streets that tell your story. Any city in the world, beautifully rendered with your personal coordinates and a title of your choice.',
    whyCopy: [
      'Streets-only minimalist style. We render the road network with elegant linework, no clutter, no logos — just the city you love.',
      'Personalize the title (your favorite neighborhood, anniversary date, an inside joke) and the coordinates. Great for housewarmings, weddings, and where-we-met memorabilia.',
      'Printed on archival paper. Digital download or physical print, shipped worldwide.',
    ],
    faqs: [
      {
        q: 'Which cities can you do?',
        a: 'Any city in the world with OpenStreetMap coverage. From major capitals down to small towns and villages.',
      },
      ...SHARED_FAQS,
    ],
  },
  skyline: {
    type: 'skyline',
    slug: 'skyline',
    title: 'City Skyline Print',
    subtitle: 'Iconic cities in minimalist silhouette. Your skyline, hanging on your wall.',
    badge: 'New',
    badgeColor: { bg: '#fef3c7', text: '#b45309' },
    detailsLabel: 'Skyline',
    fields: [
      { id: 'name', label: 'City Name', placeholder: 'e.g. New York', required: true },
      { id: 'location', label: 'Country', placeholder: 'e.g. United States', required: true },
    ],
    statFields: [
      { id: 'stat1', label: 'Population', placeholder: '8.3M' },
      { id: 'stat2', label: 'Founded', placeholder: '1624' },
      { id: 'stat3', label: 'Coordinates', placeholder: '40.71° N' },
    ],
    statLabels: ['Population', 'Founded', 'Location'],
    defaults: { name: 'City Skyline', location: 'Country', stat1: '—', stat2: '—', stat3: '—' },
    seoTitle: 'City Skyline Art Print | Minimalist Skyline Poster',
    seoDescription: 'City skyline prints of iconic cities around the world — minimalist silhouette posters. Digital download or museum-quality print.',
    lede: 'Iconic city skylines in minimalist silhouette. New York, Chicago, Paris, Tokyo, and dozens more — each rendered as a clean profile against an open sky.',
    whyCopy: [
      'A skyline is shorthand for a city. We draw each one as a sharp silhouette, no clutter, faithful to the actual buildings.',
      'Personalize the city name and details — population, founded date, coordinates. Hang it solo or build a gallery wall of cities you\'ve loved.',
      'Printed on archival paper. Available as a digital download or physical print.',
    ],
    faqs: [
      {
        q: 'Which cities are available?',
        a: 'Major U.S. and international cities. If you don\'t see yours in the shop, request it — we add new skylines based on demand.',
      },
      ...SHARED_FAQS,
    ],
  },
  f1: {
    type: 'f1',
    slug: 'f1',
    title: 'F1 Circuit Print',
    subtitle: 'Grand Prix tracks mapped with precision. For the tifosi, the paddock club kids, and everyone who loves the sound of lights out.',
    badge: 'Racing',
    badgeColor: { bg: '#fee2e2', text: '#b91c1c' },
    detailsLabel: 'F1 Circuit',
    fields: [
      { id: 'name', label: 'Race Name', placeholder: 'e.g. Monaco Grand Prix', required: true },
      { id: 'location', label: 'Location', placeholder: 'e.g. Monte Carlo, Monaco', required: true },
    ],
    statFields: [
      { id: 'stat1', label: 'Length', placeholder: '3.337 km' },
      { id: 'stat2', label: 'Laps', placeholder: '78' },
      { id: 'stat3', label: 'First Held', placeholder: '1950' },
    ],
    statLabels: ['Length', 'Laps', 'First Held'],
    defaults: { name: 'Grand Prix', location: 'Circuit', stat1: '—', stat2: '—', stat3: '—' },
    seoTitle: 'F1 Circuit Art Print | Grand Prix Track Poster',
    seoDescription: 'F1 Grand Prix circuit art prints — the legendary tracks of Formula 1. Digital download or museum-quality print.',
    lede: 'F1 Grand Prix circuit prints — the legendary layouts of Formula 1. Monaco, Silverstone, Suzuka, Spa, COTA, and every track on the calendar, rendered with precision.',
    whyCopy: [
      'Built from real track data. Every corner, every chicane, every DRS zone — drawn to scale so you can actually trace the racing line.',
      'Personalized with the race name, circuit length, lap count, and first-held year. The perfect gift for the F1 fan or paddock-pass dreamer in your life.',
      'Museum-quality print or instant digital download. Ships worldwide.',
    ],
    faqs: [
      {
        q: 'Which tracks do you have?',
        a: 'Every current and most historic F1 circuits — Monaco, Silverstone, Suzuka, Monza, Spa, COTA, Imola, Interlagos, Yas Marina, and more.',
      },
      ...SHARED_FAQS,
    ],
  },
};

export const PRICING = {
  sizes: [
    { label: '8×10"', value: '8x10', digital: 12, physical: 25 },
    { label: '11×14"', value: '11x14', digital: 12, physical: 30 },
    { label: '16×20"', value: '16x20', digital: 15, physical: 35 },
    { label: '18×24"', value: '18x24', digital: 15, physical: 40 },
    { label: '24×36"', value: '24x36', digital: 18, physical: 50 },
  ],
};

// Default gallery items (will be replaced by Supabase data)
export const DEFAULT_GALLERY: Record<PrintType, GalleryItem[]> = {
  golf: [
    { name: 'Pebble Beach', location: 'Pebble Beach, CA', values: { name: 'Pebble Beach Golf Links', location: 'Pebble Beach, California', stat1: '6,828 yds', stat2: '72', stat3: '74.7' }},
    { name: 'Augusta National', location: 'Augusta, GA', values: { name: 'Augusta National', location: 'Augusta, Georgia', stat1: '7,545 yds', stat2: '72', stat3: '78.1' }},
    { name: 'St Andrews', location: 'Scotland', values: { name: 'St Andrews Old Course', location: 'St Andrews, Scotland', stat1: '7,305 yds', stat2: '72', stat3: '77.1' }},
  ],
  stadium: [
    { name: 'Yankee Stadium', location: 'Bronx, NY', values: { name: 'Yankee Stadium', location: 'Bronx, New York', stat1: '54,251', stat2: '2009', stat3: '40.8296° N' }},
    { name: 'Wrigley Field', location: 'Chicago, IL', values: { name: 'Wrigley Field', location: 'Chicago, Illinois', stat1: '41,649', stat2: '1914', stat3: '41.9484° N' }},
    { name: 'Fenway Park', location: 'Boston, MA', values: { name: 'Fenway Park', location: 'Boston, Massachusetts', stat1: '37,755', stat2: '1912', stat3: '42.3467° N' }},
  ],
  airport: [
    { name: 'LAX', location: 'Los Angeles, CA', values: { name: 'Los Angeles International', location: 'Los Angeles, California', stat1: 'LAX', stat2: '4', stat3: '128 ft' }},
    { name: 'JFK', location: 'New York, NY', values: { name: 'John F. Kennedy International', location: 'New York, New York', stat1: 'JFK', stat2: '4', stat3: '13 ft' }},
    { name: "O'Hare", location: 'Chicago, IL', values: { name: "O'Hare International", location: 'Chicago, Illinois', stat1: 'ORD', stat2: '8', stat3: '672 ft' }},
  ],
  marathon: [
    { name: 'Boston Marathon', location: 'Boston, MA', values: { name: 'Boston Marathon', location: 'April 15, 2024', stat1: '3:32:10', stat2: '26.2', stat3: '8:05/mi' }},
    { name: 'NYC Marathon', location: 'New York, NY', values: { name: 'New York City Marathon', location: 'November 3, 2024', stat1: '4:12:45', stat2: '26.2', stat3: '9:37/mi' }},
    { name: 'Chicago Marathon', location: 'Chicago, IL', values: { name: 'Chicago Marathon', location: 'October 13, 2024', stat1: '3:55:08', stat2: '26.2', stat3: '8:58/mi' }},
  ],
  city: [
    { name: 'San Francisco', location: 'California', values: { name: 'San Francisco', location: 'California, USA', stat1: '37.7749° N', stat2: '122.4194° W', stat3: '1776' }},
    { name: 'Paris', location: 'France', values: { name: 'Paris', location: 'France', stat1: '48.8566° N', stat2: '2.3522° E', stat3: '3rd C. BC' }},
    { name: 'Tokyo', location: 'Japan', values: { name: 'Tokyo', location: 'Japan', stat1: '35.6762° N', stat2: '139.6503° E', stat3: '1457' }},
  ],
  skyline: [],
  f1: [],
};
