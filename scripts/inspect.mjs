#!/usr/bin/env node
// Diagnostic: dump existing golf pricing + probe the failing airport products.
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
);
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const PF = 'https://api.printful.com';
const pfHeaders = () => ({
  Authorization: `Bearer ${env.PRINTFUL_API_KEY}`,
  'Content-Type': 'application/json',
  ...(env.PRINTFUL_STORE_ID ? { 'X-PF-Store-Id': env.PRINTFUL_STORE_ID } : {}),
});

// 1. Existing golf pricing
const { data: golf } = await admin
  .from('gallery_items')
  .select('slug, name, printful_prices, location')
  .eq('print_type_slug', 'golf')
  .order('created_at', { ascending: true });

console.log('=== GOLF pricing in gallery_items ===');
for (const g of golf) {
  const prices = g.printful_prices || {};
  const has = Object.keys(prices).length;
  console.log(`${has ? '✓' : '✗ NO PRICES'}  ${g.slug}  loc=${JSON.stringify(g.location)}  prices=${JSON.stringify(prices)}`);
}

// 2. Probe airport products in Printful
console.log('\n=== Probing Printful airport products ===');
let all = [], offset = 0;
for (;;) {
  const r = await fetch(`${PF}/store/products?limit=100&offset=${offset}`, { headers: pfHeaders() });
  const d = await r.json();
  if (!Array.isArray(d.result)) { console.log('list error', JSON.stringify(d)); break; }
  all.push(...d.result);
  if (d.result.length < 100) break;
  offset += 100;
}
const airports = all.filter((p) => /airport/i.test(p.name));
console.log(`Found ${airports.length} airport products in Printful.`);
for (const p of airports) {
  const r = await fetch(`${PF}/store/products/${p.id}`, { headers: pfHeaders() });
  const d = await r.json();
  const variants = d.result?.sync_variants?.length ?? 0;
  console.log(`  id=${p.id}  code=${d.code}  variants=${variants}  "${p.name}"${d.code >= 400 ? '  ERROR: ' + JSON.stringify(d.error || d.result || d) : ''}`);
  await new Promise((res) => setTimeout(res, 600)); // gentle, avoid rate limit
}
