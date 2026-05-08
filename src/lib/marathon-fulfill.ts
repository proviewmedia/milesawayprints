import type { SupabaseClient } from '@supabase/supabase-js';
import type { PrintfulOrderItem } from '@/lib/printful';
import type { MarathonCustomization, MarathonRow } from '@/data/marathons';
import { renderAndUploadMarathonPng } from '@/lib/marathon-render';

interface MarathonCartItem {
  slug: string;
  type: string;
  size: string;
  name: string;
  customization?: Record<string, string> | null;
}

/** Identify cart items that come from the marathon flow. */
export function isMarathonCartItem(item: MarathonCartItem): boolean {
  if (item.type !== 'marathon') return false;
  return Boolean(item.customization && item.customization.marathon_slug);
}

/** For each marathon item in the cart, render the personalized print file,
 *  upload it to Vercel Blob, and return Printful order items ready to be
 *  appended to the order payload. Items that fail to render are skipped
 *  and the failure is reported in `errors`. */
export async function buildMarathonPrintfulItems(
  admin: SupabaseClient,
  items: MarathonCartItem[],
  orderToken: string,
): Promise<{ items: PrintfulOrderItem[]; errors: string[] }> {
  const marathonItems = items.filter(isMarathonCartItem);
  if (marathonItems.length === 0) return { items: [], errors: [] };

  const slugs = Array.from(
    new Set(marathonItems.map((it) => it.customization?.marathon_slug).filter(Boolean) as string[]),
  );

  const { data: rows } = await admin
    .from('marathons')
    .select('*')
    .in('slug', slugs);

  const bySlug = new Map<string, MarathonRow>(
    ((rows ?? []) as MarathonRow[]).map((r) => [r.slug, r]),
  );

  const result: PrintfulOrderItem[] = [];
  const errors: string[] = [];

  for (const it of marathonItems) {
    const c = it.customization as MarathonCustomization | undefined;
    if (!c?.marathon_slug) continue;
    const marathon = bySlug.get(c.marathon_slug);
    if (!marathon) {
      errors.push(`Unknown marathon slug ${c.marathon_slug}`);
      continue;
    }
    const catalogVariantId = marathon.printful_catalog_variants?.[it.size];
    if (!catalogVariantId) {
      errors.push(`No catalog variant for ${marathon.slug} ${it.size}`);
      continue;
    }

    try {
      const { url } = await renderAndUploadMarathonPng(marathon, c, { orderToken });
      result.push({
        variant_id: Number(catalogVariantId),
        quantity: 1,
        name: `${marathon.city} ${c.variant === 'half' ? 'Half ' : ''}Marathon — ${c.first_name} ${c.last_name} ${it.size}`,
        files: [{ url, filename: `${orderToken}-${marathon.slug}-${c.variant}.png` }],
      });
    } catch (err) {
      errors.push(
        `Render failed for ${marathon.slug}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  return { items: result, errors };
}
