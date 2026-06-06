#!/usr/bin/env node
// Set the 12 newly-synced golf prints to the standard golf price map
// (they came in with Printful's low default retail). Idempotent.
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
);
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

// Standard golf pricing (cents) — matches pebble-beach-golf-links, tpc-sawgrass, etc.
const STANDARD = { '5x7': 2800, '8x10': 3000, '11x14': 3200, '12x16': 3400, '12x18': 3600, '16x20': 3800, '18x24': 4000, '24x36': 4200 };

const SLUGS = [
  'atlanta-national-golf-club', 'north-park-golf-club', 'osage-national-golf-course',
  'pelican-lakes-golf-course', 'houston-oaks-country-club-retreat', 'leroy-country-club',
  'avila-golf-country-club', 'bulls-bay-golf-club', 'longmeadow-country-club',
  'meadows-golf-club', 'cumberland-country-club', 'long-meadow-golf-club',
];

for (const slug of SLUGS) {
  const { error } = await admin
    .from('gallery_items')
    .update({ printful_prices: STANDARD })
    .eq('slug', slug)
    .eq('print_type_slug', 'golf');
  console.log(`${error ? '✗ ' + error.message : '✓ priced'}  ${slug}`);
}
console.log('\nDone. Standard map:', JSON.stringify(STANDARD));
