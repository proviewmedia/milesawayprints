import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/require-admin';
import { listStoreProducts, getStoreProduct } from '@/lib/printful';
import { PrintType } from '@/data/prints';

/**
 * POST /api/printful/sync
 *
 * Pulls every product from your Printful store and upserts a gallery_items
 * row per product. Maps variants to a size-keyed dictionary so each design's
 * printful_variants = { "8x10": <sync_variant_id>, ... }.
 *
 * Run this any time you add or change a product in Printful and want the
 * site to reflect it. Idempotent — re-run is safe.
 *
 * Admin-only: uses the service-role client, so it's gated by requireAdmin().
 */

interface PrintfulListItem {
  id: number;
  name: string;
  external_id?: string;
  thumbnail_url?: string;
  synced: number;
  is_ignored?: boolean;
}

interface PrintfulSyncVariant {
  id: number;
  variant_id: number;
  name: string;
  size?: string | null;
  retail_price?: string;
  product?: { image?: string };
  files?: Array<{ type?: string; preview_url?: string; url?: string }>;
}

interface PrintfulProductDetail {
  sync_product: { id: number; name: string; thumbnail_url?: string };
  sync_variants: PrintfulSyncVariant[];
}

function inferType(name: string): PrintType {
  const n = name.toLowerCase();
  if (n.includes('skyline')) return 'skyline';
  if (n.includes('grand prix') || n.includes('f1') || n.includes('circuit')) return 'f1';
  if (n.includes('golf') || n.includes('course') || n.includes('tpc') || n.includes('club')) return 'golf';
  if (n.includes('stadium') || n.includes('park') || n.includes('field')) return 'stadium';
  if (n.includes('airport')) return 'airport';
  if (n.includes('marathon')) return 'marathon';
  return 'city';
}

/** Parse display name + location from a Printful product name */
function parseName(raw: string): { name: string; location: string } {
  // Strip anything after "|" (e.g. " | Physical Poster", " | Circuit Print")
  let cleaned = raw.split('|')[0].trim();

  // Repeatedly strip trailing noise words: Print, Poster, Map
  for (let i = 0; i < 5; i++) {
    const next = cleaned.replace(/\s+(Print|Poster|Map)\s*$/i, '').trim();
    if (next === cleaned) break;
    cleaned = next;
  }

  // F1: "F1 Monaco Grand Prix" -> "Monaco Grand Prix"
  const f1Match = cleaned.match(/^F1\s+(.+?)\s+(Grand Prix|GP)$/i);
  if (f1Match) {
    return { name: `${f1Match[1]} ${f1Match[2]}`, location: '' };
  }
  // Skyline: "New York Skyline" -> "New York"
  const skyMatch = cleaned.match(/^(.+?)\s+Skyline$/i);
  if (skyMatch) {
    return { name: skyMatch[1].trim(), location: '' };
  }
  return { name: cleaned, location: '' };
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Map a Printful variant name to our canonical size label (e.g. "8x10") */
function canonicalSize(variantName: string, rawSize?: string | null): string | null {
  // Prefer the explicit size field; fall back to parsing from the name.
  const src = rawSize || variantName || '';
  // Match two numbers separated by any non-digit characters (handles 11″×14″, 12×16, 8"x10", A3, etc.)
  const m = src.match(/(\d{1,2})[^0-9]+(\d{1,2})/);
  if (m) return `${m[1]}x${m[2]}`;
  return null;
}

export async function POST() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const admin = createAdminClient();

    // 1. Ensure our two new print_types exist (defensive — migration 003 handles this too)
    await admin.from('print_types').upsert(
      [
        { slug: 'skyline', name: 'City Skyline', sort_order: 6 },
        { slug: 'f1', name: 'F1 Circuit', sort_order: 7 },
      ],
      { onConflict: 'slug', ignoreDuplicates: true },
    );

    // 2. List all products from Printful
    const listResp = (await listStoreProducts()) as { code: number; result: PrintfulListItem[] };
    if (listResp.code >= 400 || !listResp.result) {
      return NextResponse.json({ error: 'Failed to list Printful products', detail: listResp }, { status: 502 });
    }

    const products = listResp.result.filter((p) => !p.is_ignored);
    const report: Array<{ name: string; action: 'created' | 'updated' | 'skipped'; slug: string; type: string; sizes: string[]; reason?: string }> = [];

    // 3. For each product, fetch details + upsert
    for (const p of products) {
      const detailResp = (await getStoreProduct(p.id)) as { code: number; result: PrintfulProductDetail };
      if (detailResp.code >= 400 || !detailResp.result) {
        report.push({ name: p.name, action: 'skipped', slug: '', type: '', sizes: [], reason: 'Failed to fetch variants' });
        continue;
      }

      const { sync_product: sp, sync_variants: svs } = detailResp.result;
      const type = inferType(sp.name);
      const parsed = parseName(sp.name);
      const slug = slugify(parsed.name);

      // Build size → sync_variant_id, size → catalog variant_id, size → price
      const variantMap: Record<string, number> = {};
      const catalogVariantMap: Record<string, number> = {};
      const priceMap: Record<string, number> = {};
      const sizesFound: string[] = [];
      for (const v of svs) {
        const sz = canonicalSize(v.name, v.size);
        if (sz && !variantMap[sz]) {
          variantMap[sz] = v.id; // sync_variant_id — used for placing orders
          catalogVariantMap[sz] = v.variant_id; // catalog variant_id — used for shipping rates and tax calculations
          const priceStr = v.retail_price;
          if (priceStr) {
            const cents = Math.round(parseFloat(priceStr) * 100);
            if (!isNaN(cents)) priceMap[sz] = cents;
          }
          sizesFound.push(sz);
        }
      }

      // Pick best image: prefer explicit product thumbnail, else first variant's preview
      let image =
        sp.thumbnail_url ??
        p.thumbnail_url ??
        svs[0]?.files?.find((f) => f.type === 'preview')?.preview_url ??
        svs[0]?.product?.image ??
        null;

      // Branch on existing row so we never clobber user-set retail prices.
      // - New product (no row with this printful_product_id): INSERT with
      //   Printful's default retail as the initial price map.
      // - Existing product: UPDATE everything that mirrors Printful's
      //   source of truth (slug, name, image, variant IDs) but PRESERVE
      //   printful_prices — those are the retail prices the operator has
      //   standardized in Supabase. Resyncing must not undo manual price
      //   work (which is what happened on 2026-05-21 when bringing in
      //   Pebble Beach + St. Andrews silently reset every product's
      //   retail to Printful's defaults).
      const { data: existingRow } = await admin
        .from('gallery_items')
        .select('id')
        .eq('printful_product_id', String(sp.id))
        .maybeSingle();

      let upErr: { message: string } | null = null;
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
            // printful_prices intentionally omitted — see comment above
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
        report.push({
          name: parsed.name,
          action: existingRow ? 'updated' : 'created',
          slug,
          type,
          sizes: sizesFound,
        });
      }
    }

    return NextResponse.json({
      ok: true,
      total_fetched: products.length,
      synced: report.filter((r) => r.action !== 'skipped').length,
      report,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  // Allow GET for convenience during setup
  return POST();
}
