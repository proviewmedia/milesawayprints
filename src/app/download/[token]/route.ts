import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SIGNED_URL_TTL_SECONDS = 300; // 5 minutes; redirect is followed immediately

export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const token = params.token;
  if (!token || token.length < 32) {
    return notFound('Invalid download link.');
  }

  const admin = createAdminClient();

  // Look up the order by its per-customer token
  const { data: order } = await admin
    .from('orders')
    .select(
      'id, status, cart_snapshot, digital_download_expires_at, digital_download_max, digital_download_count',
    )
    .eq('digital_download_token', token)
    .maybeSingle();

  if (!order) return notFound('We couldn\'t find that download link.');

  // Expired?
  if (
    order.digital_download_expires_at &&
    new Date(order.digital_download_expires_at) < new Date()
  ) {
    return gone(
      'This download link has expired. If you still need the file, reach out to support@milesawayprints.com and we\'ll help.',
    );
  }

  // Used up?
  if (
    order.digital_download_max != null &&
    order.digital_download_count != null &&
    order.digital_download_count >= order.digital_download_max
  ) {
    return gone(
      'This download link has been used the maximum number of times. Reach out to support@milesawayprints.com if you need help.',
    );
  }

  // Find the digital item in the cart and resolve its file path
  const cart = (order.cart_snapshot as Array<{ slug: string; format: string }> | null) ?? [];
  const digital = cart.find((it) => it.format === 'digital');
  if (!digital) return notFound('No digital item on this order.');

  const { data: design } = await admin
    .from('gallery_items')
    .select('digital_file_path, name')
    .eq('slug', digital.slug)
    .maybeSingle();

  if (!design?.digital_file_path) {
    return gone(
      'Your digital file isn\'t ready yet. Reach out to support@milesawayprints.com — we\'ll get it sent over.',
    );
  }

  // Sign a short-lived URL and increment the counter
  const { data: signed, error: signErr } = await admin
    .storage
    .from('digital-prints')
    .createSignedUrl(design.digital_file_path, SIGNED_URL_TTL_SECONDS, {
      download: design.name ? `${design.name}.${guessExt(design.digital_file_path)}` : true,
    });

  if (signErr || !signed?.signedUrl) {
    return NextResponse.json(
      { error: 'Could not sign the download URL', detail: signErr?.message },
      { status: 500 },
    );
  }

  await admin
    .from('orders')
    .update({ digital_download_count: (order.digital_download_count ?? 0) + 1 })
    .eq('id', order.id);

  return NextResponse.redirect(signed.signedUrl, { status: 302 });
}

function notFound(message: string) {
  return new NextResponse(htmlMessage('Not found', message), {
    status: 404,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

function gone(message: string) {
  return new NextResponse(htmlMessage('Link unavailable', message), {
    status: 410,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

function htmlMessage(title: string, message: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:480px;margin:80px auto;padding:0 24px;color:#0e0e0e}h1{font-weight:500;letter-spacing:-.02em}p{color:#6b6b6b;line-height:1.5}a{color:#0e0e0e}</style></head><body><h1>${title}</h1><p>${message}</p><p><a href="/">Back to Miles Away Prints</a></p></body></html>`;
}

function guessExt(path: string): string {
  const m = path.match(/\.([a-z0-9]+)$/i);
  return m?.[1] ?? 'pdf';
}
