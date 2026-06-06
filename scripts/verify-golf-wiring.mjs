#!/usr/bin/env node
// Verify the 12 new golf prints are fully wired for purchase + fulfillment:
//   - active
//   - printful_prices  (Stripe charges this, server-side, per size)
//   - printful_variants (size -> Printful sync_variant_id; webhook fulfills with this)
//   - printful_catalog_variants (catalog variant id; shipping/tax)
//   - image_url
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
);
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const SLUGS = [
  'atlanta-national-golf-club', 'north-park-golf-club', 'osage-national-golf-course',
  'pelican-lakes-golf-course', 'houston-oaks-country-club-retreat', 'leroy-country-club',
  'avila-golf-country-club', 'bulls-bay-golf-club', 'longmeadow-country-club',
  'meadows-golf-club', 'cumberland-country-club', 'long-meadow-golf-club',
];

let allGood = true;
for (const slug of SLUGS) {
  const { data: d } = await admin
    .from('gallery_items')
    .select('slug, active, image_url, printful_product_id, printful_prices, printful_variants, printful_catalog_variants')
    .eq('slug', slug).maybeSingle();
  if (!d) { console.log(`✗ MISSING ROW  ${slug}`); allGood = false; continue; }
  const prices = Object.keys(d.printful_prices || {});
  const variants = Object.entries(d.printful_variants || {});
  // every priced size must have a matching Printful variant id, else that size can't be fulfilled
  const unfulfillable = prices.filter((sz) => !d.printful_variants?.[sz]);
  const sampleVid = variants[0]?.[1];
  const ok = d.active && prices.length > 0 && variants.length > 0 && unfulfillable.length === 0 && d.image_url;
  if (!ok) allGood = false;
  console.log(
    `${ok ? '✓' : '✗'}  ${slug}\n` +
    `     active=${d.active}  prices=${prices.length}  variants=${variants.length}  ` +
    `catalog=${Object.keys(d.printful_catalog_variants || {}).length}  img=${d.image_url ? 'yes' : 'NO'}  ` +
    `pf_product=${d.printful_product_id}\n` +
    `     sample sync_variant_id=${sampleVid}` +
    (unfulfillable.length ? `  ⚠ sizes priced but NOT fulfillable: ${unfulfillable.join(', ')}` : ''),
  );
}
console.log(`\n${allGood ? '✅ ALL 12 FULLY WIRED (price + Printful variant + image)' : '❌ issues above'}`);
