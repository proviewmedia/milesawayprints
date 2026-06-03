import { createAdminClient } from '@/lib/supabase';
import type { PrintType } from '@/data/prints';

interface ReviewRow {
  customer_name: string;
  rating: number;
  content: string;
  print_type_slug: string | null;
  featured: boolean | null;
  created_at: string;
}

export interface ProductReviewSummary {
  /** Null when there are no real reviews — callers must then omit the
   *  AggregateRating from JSON-LD. Emitting a fabricated rating is a Google
   *  structured-data policy violation and risks a manual action. */
  aggregateRating: { ratingValue: number; reviewCount: number } | null;
  reviews: {
    author: string;
    rating: number;
    body: string;
    datePublished: string;
  }[];
}

/**
 * Returns (a) aggregate rating across the product's type — falling back
 * to site-wide reviews when per-type data is thin — and (b) up to 3
 * featured reviews to emit as `Review` entities. Both are required to
 * clear Google Search Console's "Missing review" + "Missing
 * aggregateRating" warnings on Product snippets / Merchant listings.
 *
 * Shared by `/shop/[slug]` (gallery products) and `/marathons/[slug]`
 * (custom marathon prints) so every product page emits the same shape.
 */
export async function getReviewData(type: PrintType): Promise<ProductReviewSummary> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('reviews')
    .select('customer_name, rating, content, print_type_slug, featured, created_at')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false });

  const all = ((data ?? []) as ReviewRow[]).filter(
    (r) => typeof r.rating === 'number' && r.rating > 0 && r.rating <= 5,
  );

  // Prefer type-matching reviews; fall back to site-wide when the type
  // has fewer than 3 reviews. Avoids Google warnings about thin data
  // while still surfacing relevant testimony where it exists.
  const typed = all.filter((r) => r.print_type_slug === type);
  const source = typed.length >= 3 ? typed : all;

  // No real reviews → emit nothing rather than a fake 5-star rating.
  if (source.length === 0) {
    return { aggregateRating: null, reviews: [] };
  }

  const reviewCount = source.length;
  const ratingValue = source.reduce((s, r) => s + r.rating, 0) / source.length;

  const reviews = source.slice(0, 3).map((r) => ({
    author: r.customer_name,
    rating: r.rating,
    body: r.content,
    datePublished: r.created_at.slice(0, 10),
  }));

  return {
    aggregateRating: { ratingValue, reviewCount },
    reviews,
  };
}
