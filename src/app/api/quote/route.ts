import { NextResponse } from 'next/server';
import { sendQuoteRequestEmails } from '@/lib/email';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { CUSTOM_PRODUCTS, QUANTITY_OPTIONS, ARTWORK_OPTIONS, MAX_UPLOAD_BYTES, MAX_FILES } from '@/data/custom';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MIN_FORM_FILL_MS = 3_000; // bots submit instantly; humans take seconds

function text(form: FormData, key: string, max: number): string {
  const v = form.get(key);
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

export async function POST(req: Request) {
  const limit = rateLimit(`quote:${clientIp(req)}`, 5, 10 * 60_000, Date.now());
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a few minutes and try again.' },
      { status: 429 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: 'Your files are too large. Keep uploads under 4 MB in total, or paste a link instead.' },
      { status: 413 },
    );
  }

  // Honeypot and submit-timing guard: pretend success so bots learn nothing.
  const openedAt = Number(form.get('openedAt'));
  if (text(form, 'website', 200) !== '' || (openedAt && Date.now() - openedAt < MIN_FORM_FILL_MS)) {
    return NextResponse.json({ ok: true });
  }

  const name = text(form, 'name', 100);
  const email = text(form, 'email', 200);
  const phone = text(form, 'phone', 40);
  const organization = text(form, 'organization', 120);
  const quantity = text(form, 'quantity', 40);
  const neededBy = text(form, 'neededBy', 20);
  const artworkValue = text(form, 'artwork', 20);
  const artworkLink = text(form, 'artworkLink', 500);
  const details = text(form, 'details', 5000);

  const productNames = form
    .getAll('products')
    .map((p) => CUSTOM_PRODUCTS.find((c) => c.slug === p)?.name)
    .filter((p): p is string => Boolean(p));
  const artwork = ARTWORK_OPTIONS.find((a) => a.value === artworkValue)?.label;

  if (productNames.length === 0) {
    return NextResponse.json({ error: 'Choose at least one product.' }, { status: 400 });
  }
  if (!(QUANTITY_OPTIONS as readonly string[]).includes(quantity)) {
    return NextResponse.json({ error: 'Choose a quantity.' }, { status: 400 });
  }
  if (!artwork) {
    return NextResponse.json({ error: 'Tell us where your design stands.' }, { status: 400 });
  }
  if (!name) {
    return NextResponse.json({ error: 'Add your name.' }, { status: 400 });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: 'Add a valid email so we can send your quote.' }, { status: 400 });
  }

  const files = form.getAll('files').filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length > MAX_FILES) {
    return NextResponse.json({ error: `Attach up to ${MAX_FILES} files.` }, { status: 400 });
  }
  const totalBytes = files.reduce((n, f) => n + f.size, 0);
  if (totalBytes > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: 'Your files are too large. Keep uploads under 4 MB in total, or paste a link instead.' },
      { status: 413 },
    );
  }
  const attachments = await Promise.all(
    files.map(async (f) => ({
      filename: f.name.replace(/[^\w.\- ]+/g, '_').slice(0, 120) || 'artwork',
      content: Buffer.from(await f.arrayBuffer()),
    })),
  );

  try {
    await sendQuoteRequestEmails({
      name,
      email,
      phone: phone || undefined,
      organization: organization || undefined,
      products: productNames,
      quantity,
      neededBy: neededBy || undefined,
      artwork,
      artworkLink: artworkLink || undefined,
      details: details || undefined,
      attachments,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[quote] send failed', err);
    return NextResponse.json(
      { error: 'We could not send your request. Please try again, or email us at milesawayprintsllc@gmail.com.' },
      { status: 500 },
    );
  }
}
