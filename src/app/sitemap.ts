import type { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

const BASE = 'https://milesawayprints.com';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/shop`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/sign-in`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ];

  // Print-type custom flows
  const types = ['golf', 'stadium', 'airport', 'marathon', 'city', 'skyline', 'f1'];
  const customFlows: MetadataRoute.Sitemap = types.map((t) => ({
    url: `${BASE}/prints/${t}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // All active products
  const { data: products } = await supabase
    .from('gallery_items')
    .select('slug, created_at')
    .eq('active', true);

  const productRoutes: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
    url: `${BASE}/shop/${p.slug}`,
    lastModified: p.created_at ? new Date(p.created_at) : now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...customFlows, ...productRoutes];
}
