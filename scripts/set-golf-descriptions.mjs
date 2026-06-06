#!/usr/bin/env node
// Set unique, SEO-rich descriptions on the 12 new golf prints. Idempotent.
// The description flows into the meta description, the on-page paragraph
// (lib/product-copy prefers a manual description), Product JSON-LD, and the
// Merchant feed. No invented locations/stats — keyword-rich but factually safe.
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
);
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const DESCRIPTIONS = {
  'atlanta-national-golf-club':
    "Atlanta National Golf Club rendered as clean, minimalist course-map art, drawn faithfully from the real routing — every fairway, green, and bunker to scale. Personalize this custom golf course print with the club name and your best round, printed on archival fine-art paper. Golf wall art that actually earns a frame.",
  'north-park-golf-club':
    "A custom golf course print of North Park Golf Club, the full layout drawn in crisp minimalist line work. Add your name, the date, and your score to mark a memorable round. Made to order on museum-quality archival paper — a thoughtful gift for the golfer who's walked these holes.",
  'osage-national-golf-course':
    "Osage National Golf Course as elegant minimalist course-map art, true to the real layout. Personalize this golf course print with the course name and your finest round; printed to order on archival fine-art paper. Understated golf wall art for the clubhouse, study, or a milestone gift.",
  'pelican-lakes-golf-course':
    "A personalized golf course print of Pelican Lakes Golf Course — the routing rendered in gallery-ready line work. Customize it with your name and score, printed on archival fine-art paper. A standout gift for members and anyone who loves the course.",
  'houston-oaks-country-club-retreat':
    "Houston Oaks Country Club & Retreat mapped as refined minimalist golf art from the real course routing. Personalize with the club name and your best day on the course; made to order on archival fine-art paper. Distinctive golf wall art worth framing.",
  'leroy-country-club':
    "A custom golf course print of Leroy Country Club, every hole drawn faithfully in clean line art. Add your name, the date, and your score to commemorate a round that mattered. Archival fine-art paper, made to order — a memorable gift for any member.",
  'avila-golf-country-club':
    "Avila Golf & Country Club as minimalist course-map wall art, true to the real layout. Personalize this golf course print with the club name and your best round, printed on archival fine-art paper. The rare golf gift that gets hung, not stashed away.",
  'bulls-bay-golf-club':
    "A personalized golf course print of Bulls Bay Golf Club — the routing drawn to scale in striking minimalist line work. Customize it with your name and score; museum-quality archival paper, made to order. Distinctive golf wall art for the home, office, or as a gift.",
  'longmeadow-country-club':
    "Longmeadow Country Club rendered as clean, gallery-ready golf course art from the real layout. Add the club name, your name, and your best round, and we print it on archival fine-art paper. A thoughtful, framable gift for members and longtime players.",
  'meadows-golf-club':
    "A custom golf course print of Meadows Golf Club, every fairway and green mapped faithfully. Personalize it with your name, the date, and your score to mark a great round. Archival fine-art paper, made to order — understated golf wall art that earns a frame.",
  'cumberland-country-club':
    "Cumberland Country Club as minimalist course-map art, drawn from the real routing. Personalize this golf course print with the club name and your finest round; made to order on archival fine-art paper. A memorable gift for the golfer who calls this course home.",
  'long-meadow-golf-club':
    "A personalized golf course print of Long Meadow Golf Club — the full course rendered in crisp minimalist line work. Add your name and score to commemorate the round, printed on archival fine-art paper. Refined golf wall art for the clubhouse, study, or a standout gift.",
};

for (const [slug, description] of Object.entries(DESCRIPTIONS)) {
  const { error } = await admin
    .from('gallery_items')
    .update({ description })
    .eq('slug', slug)
    .eq('print_type_slug', 'golf');
  console.log(`${error ? '✗ ' + error.message : '✓ described'}  ${slug}`);
}
console.log('\nDone.');
