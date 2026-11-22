import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { createAdminClient } from '@/lib/supabase';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { ARTWORK_ACCEPT, ARTWORK_BUCKET, ARTWORK_MAX_BYTES, ARTWORK_PREFIX } from '@/data/custom-prints';

/**
 * Hands the browser a one-time signed upload URL for a customer's artwork
 * file. The file goes straight to Supabase storage (private bucket), which
 * avoids Vercel's ~4.5 MB request body limit. Checkout later verifies the
 * object exists before charging.
 */
export async function POST(req: Request) {
  const limit = rateLimit(`artwork-upload:${clientIp(req)}`, 10, 10 * 60_000, Date.now());
  if (!limit.ok) {
    return NextResponse.json({ error: 'Too many uploads. Please wait a few minutes and try again.' }, { status: 429 });
  }

  let body: { fileName?: unknown; contentType?: unknown; size?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const contentType = typeof body.contentType === 'string' ? body.contentType : '';
  const size = typeof body.size === 'number' ? body.size : 0;
  const ext = ARTWORK_ACCEPT[contentType];
  if (!ext) {
    return NextResponse.json({ error: 'Upload a JPG, PNG, TIFF, or PDF file.' }, { status: 400 });
  }
  if (size <= 0 || size > ARTWORK_MAX_BYTES) {
    return NextResponse.json({ error: 'Files can be up to 50 MB.' }, { status: 413 });
  }

  const rawName = typeof body.fileName === 'string' ? body.fileName : `artwork.${ext}`;
  const base = rawName
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'artwork';
  const month = new Date().toISOString().slice(0, 7);
  const path = `${ARTWORK_PREFIX}${month}/${randomUUID()}-${base}.${ext}`;

  const admin = createAdminClient();
  const { data, error } = await admin.storage.from(ARTWORK_BUCKET).createSignedUploadUrl(path);
  if (error || !data) {
    console.error('[uploads/artwork] signed url failed', error);
    return NextResponse.json({ error: 'Upload is not available right now. Please try again.' }, { status: 500 });
  }

  return NextResponse.json({ path: data.path, token: data.token });
}
