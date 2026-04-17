export type PrintType = 'golf' | 'stadium' | 'airport' | 'marathon' | 'city';

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
}

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
    seoTitle: 'Custom Golf Course Art Print | Personalized Golf Gift',
    seoDescription: 'Create a custom golf course art print with your favorite course. Personalized with course name, location, and stats. Digital download or museum-quality physical print.',
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
};
