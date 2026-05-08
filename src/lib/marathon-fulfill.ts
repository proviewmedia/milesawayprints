import type { SupabaseClient } from '@supabase/supabase-js';
import { sendMarathonFulfillmentEmail } from '@/lib/email';
import type { MarathonCustomization } from '@/data/marathons';

interface MarathonCartItem {
  slug: string;
  type: string;
  size: string;
  name: string;
  priceCents: number;
  customization?: Record<string, string> | null;
}

/** Identify cart items that come from the marathon flow. */
export function isMarathonCartItem(item: MarathonCartItem): boolean {
  if (item.type !== 'marathon') return false;
  return Boolean(item.customization && item.customization.marathon_slug);
}

interface NotifyArgs {
  admin: SupabaseClient;
  items: MarathonCartItem[];
  orderNumber: string | number;
  orderToken: string;
  customer: { name: string; email: string };
  shipping?: {
    name: string;
    line1: string;
    line2?: string | null;
    city: string;
    state?: string | null;
    postalCode: string;
    country: string;
  };
}

/** For each marathon item in the cart, look up the race and send an admin
 *  email with the personalization details so the print can be built and
 *  submitted to Printful manually. Returns true if at least one marathon
 *  item was processed (caller uses this to flag the order as needing
 *  manual fulfillment). */
export async function notifyMarathonOrder({
  admin,
  items,
  orderNumber,
  orderToken,
  customer,
  shipping,
}: NotifyArgs): Promise<{ count: number; errors: string[] }> {
  const marathonItems = items.filter(isMarathonCartItem);
  if (marathonItems.length === 0) return { count: 0, errors: [] };

  const slugs = Array.from(
    new Set(marathonItems.map((it) => it.customization?.marathon_slug).filter(Boolean) as string[]),
  );

  const { data: rows } = await admin
    .from('marathons')
    .select('slug, city')
    .in('slug', slugs);

  const cityBySlug = new Map<string, string>(
    ((rows ?? []) as { slug: string; city: string }[]).map((r) => [r.slug, r.city]),
  );

  const errors: string[] = [];
  for (const it of marathonItems) {
    const c = it.customization as MarathonCustomization | undefined;
    if (!c?.marathon_slug) continue;
    const city = cityBySlug.get(c.marathon_slug) ?? c.marathon_slug;
    try {
      await sendMarathonFulfillmentEmail({
        orderNumber,
        orderToken,
        customer,
        shipping,
        city,
        variant: c.variant,
        size: it.size,
        pricePaidCents: it.priceCents,
        customization: {
          bib: c.bib,
          firstName: c.first_name,
          lastName: c.last_name,
          raceDate: c.race_date,
          finishTime: c.finish_time,
        },
      });
    } catch (err) {
      errors.push(
        `Notify failed for ${c.marathon_slug}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  return { count: marathonItems.length, errors };
}
