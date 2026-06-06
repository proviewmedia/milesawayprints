#!/usr/bin/env node
// Sync Printful store products -> Supabase gallery_items.
//
// This is a 1:1 port of src/app/api/printful/sync/route.ts (same inferType /
// parseName / canonicalSize / slugify and the same insert-vs-update branching
// that PRESERVES operator-set printful_prices on existing rows). Idempotent.
//
// Usage: node scripts/sync-printful.mjs
//
// NB: the web endpoint (/api/printful/sync) is the canonical path and is
// admin-gated; this script exists so a sync can also be run from a trusted
// machine that has .env.local (service-role key + Printful key).

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const envFile = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
const env = Object.fromEntries(
  envFile
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
);

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const PRINTFUL_API_KEY = env.PRINTFUL_API_KEY;
const PRINTFUL_STORE_ID = env.PRINTFUL_STORE_ID;

if (!SUPABASE_URL || !SERVICE_KEY || !PRINTFUL_API_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / PRINTFUL_API_KEY in .env.local');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY);

// ---------- Printful client (mirrors src/lib/printful.ts) ----------
const PF = 'https://api.printful.com';
function pfHeaders() {
  const h = { Authorization: `Bearer ${PRINTFUL_API_KEY}`, 'Content-Type': 'application/json' };
  if (PRINTFUL_STORE_ID) h['X-PF-Store-Id'] = PRINTFUL_STORE_ID;
  return h;
}
async function pfGet(url, attempt = 0) {
  const res = await fetch(url, { headers: pfHeaders() });
  if ((res.status === 429 || res.status >= 500) && attempt < 5) {
    const ra = Number(res.headers.get('retry-after'));
    const waitSec = ra > 0 ? ra : Math.min(2 ** attempt, 20);
    await new Promise((r) => setTimeout(r, waitSec * 1000));
    return pfGet(url, attempt + 1);
  }
  return res.json();
}
async function listStoreProducts() {
  const all = [];
  const limit = 100;
  let offset = 0;
  let lastCode = 200;
  for (;;) {
    const data = await pfGet(`${PF}/store/products?limit=${limit}&offset=${offset}`);
    lastCode = data.code;
    if (data.code >= 400 || !Array.isArray(data.result)) return data;
    all.push(...data.result);
    if (data.result.length < limit) break;
    offset += limit;
  }
  return { code: lastCode, result: all };
}
async function getStoreProduct(productId) {
  return await pfGet(`${PF}/store/products/${productId}`);
}

// ---------- ported verbatim from the route ----------
function inferType(name) {
  const n = name.toLowerCase();
  if (n.includes('skyline')) return 'skyline';
  if (n.includes('grand prix') || n.includes('f1') || n.includes('circuit')) return 'f1';
  if (n.includes('golf') || n.includes('course') || n.includes('tpc') || n.includes('club')) return 'golf';
  if (n.includes('stadium') || n.includes('park') || n.includes('field')) return 'stadium';
  if (n.includes('airport')) return 'airport';
  if (n.includes('marathon')) return 'marathon';
  return 'city';
}
function parseName(raw) {
  let cleaned = raw.split('|')[0].trim();
  for (let i = 0; i < 5; i++) {
    const next = cleaned.replace(/\s+(Print|Poster|Map)\s*$/i, '').trim();
    if (next === cleaned) break;
    cleaned = next;
  }
  const f1Match = cleaned.match(/^F1\s+(.+?)\s+(Grand Prix|GP)$/i);
  if (f1Match) return { name: `${f1Match[1]} ${f1Match[2]}`, location: '' };
  const skyMatch = cleaned.match(/^(.+?)\s+Skyline$/i);
  if (skyMatch) return { name: skyMatch[1].trim(), location: '' };
  return { name: cleaned, location: '' };
}
function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
function canonicalSize(variantName, rawSize) {
  const src = rawSize || variantName || '';
  const m = src.match(/(\d{1,2})[^0-9]+(\d{1,2})/);
  if (m) return `${m[1]}x${m[2]}`;
  return null;
}

async function main() {
  await admin.from('print_types').upsert(
    [
      { slug: 'skyline', name: 'City Skyline', sort_order: 6 },
      { slug: 'f1', name: 'F1 Circuit', sort_order: 7 },
    ],
    { onConflict: 'slug', ignoreDuplicates: true },
  );

  const listResp = await listStoreProducts();
  if (listResp.code >= 400 || !listResp.result) {
    console.error('Failed to list Printful products', JSON.stringify(listResp));
    process.exit(1);
  }
  const products = listResp.result.filter((p) => !p.is_ignored);
  const report = [];

  for (const p of products) {
    const detailResp = await getStoreProduct(p.id);
    if (detailResp.code >= 400 || !detailResp.result) {
      report.push({ name: p.name, action: 'skipped', slug: '', type: '', sizes: [], reason: 'Failed to fetch variants' });
      continue;
    }
    const { sync_product: sp, sync_variants: svs } = detailResp.result;
    const type = inferType(sp.name);
    const parsed = parseName(sp.name);
    const slug = slugify(parsed.name);

    const variantMap = {};
    const catalogVariantMap = {};
    const priceMap = {};
    const sizesFound = [];
    for (const v of svs) {
      const sz = canonicalSize(v.name, v.size);
      if (sz && !variantMap[sz]) {
        variantMap[sz] = v.id;
        catalogVariantMap[sz] = v.variant_id;
        const priceStr = v.retail_price;
        if (priceStr) {
          const cents = Math.round(parseFloat(priceStr) * 100);
          if (!isNaN(cents)) priceMap[sz] = cents;
        }
        sizesFound.push(sz);
      }
    }

    const image =
      sp.thumbnail_url ??
      p.thumbnail_url ??
      svs[0]?.files?.find((f) => f.type === 'preview')?.preview_url ??
      svs[0]?.product?.image ??
      null;

    const { data: existingRow } = await admin
      .from('gallery_items')
      .select('id')
      .eq('printful_product_id', String(sp.id))
      .maybeSingle();

    let upErr = null;
    if (existingRow) {
      const { error } = await admin
        .from('gallery_items')
        .update({
          slug,
          print_type_slug: type,
          name: parsed.name,
          location: parsed.location || '—',
          image_url: image,
          printful_variants: variantMap,
          printful_catalog_variants: catalogVariantMap,
          active: true,
        })
        .eq('printful_product_id', String(sp.id));
      upErr = error;
    } else {
      const { error } = await admin.from('gallery_items').insert({
        slug,
        print_type_slug: type,
        name: parsed.name,
        location: parsed.location || '—',
        image_url: image,
        values: {},
        printful_product_id: String(sp.id),
        printful_variants: variantMap,
        printful_catalog_variants: catalogVariantMap,
        printful_prices: priceMap,
        active: true,
        featured: false,
        sort_order: 0,
      });
      upErr = error;
    }

    if (upErr) {
      report.push({ name: parsed.name, action: 'skipped', slug, type, sizes: sizesFound, reason: upErr.message });
    } else {
      report.push({ name: parsed.name, action: existingRow ? 'updated' : 'created', slug, type, sizes: sizesFound });
    }
  }

  const created = report.filter((r) => r.action === 'created');
  const updated = report.filter((r) => r.action === 'updated');
  const skipped = report.filter((r) => r.action === 'skipped');

  console.log(`\nFetched ${products.length} Printful products.`);
  console.log(`Created: ${created.length} | Updated: ${updated.length} | Skipped: ${skipped.length}\n`);
  if (created.length) {
    console.log('CREATED:');
    for (const r of created) console.log(`  + [${r.type}] ${r.name}  (${r.slug})  sizes: ${r.sizes.join(', ')}`);
  }
  if (skipped.length) {
    console.log('\nSKIPPED:');
    for (const r of skipped) console.log(`  ! ${r.name || '(unknown)'} — ${r.reason}`);
  }
  // Spotlight golf so we can confirm the 12 new ones landed + classified right.
  const golf = report.filter((r) => r.type === 'golf' && r.action !== 'skipped');
  console.log(`\nGOLF designs now in gallery_items: ${golf.length}`);
  for (const r of golf) console.log(`  • ${r.name}  (${r.slug})  sizes: ${r.sizes.join(', ') || 'NONE'}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
