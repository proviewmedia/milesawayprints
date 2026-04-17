import { NextResponse } from 'next/server';
import { listStoreProducts, getStoreProduct } from '@/lib/printful';

/**
 * GET /api/printful/products
 *   → list all products in your Printful store
 *
 * GET /api/printful/products?id=<syncProductId>
 *   → full details for one product including all variants and their IDs
 *
 * Use the second form to find the variant_id for each size, then paste
 * those into gallery_items.printful_variants like:
 *   { "8x10": 4011, "11x14": 4012, "16x20": 4013 }
 *
 * TODO before going live: gate this behind admin auth (currently public).
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (id) {
      const data = await getStoreProduct(id);
      return NextResponse.json(data);
    }

    const data = await listStoreProducts();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
