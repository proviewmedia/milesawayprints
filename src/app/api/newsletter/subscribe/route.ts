import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { createAdminClient } from '@/lib/supabase';
import { getStripe } from '@/lib/stripe';
import { sendNewsletterWelcomeEmail } from '@/lib/email';
import { rateLimit, clientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// This endpoint mints a live Stripe coupon + promotion code per new email, so
// it's an abuse/cost vector. Cap per-IP requests, plus a global backstop in
// case an attacker rotates IPs. See lib/rate-limit.ts for the durable-store
// follow-up (limits are per-instance for now).
const WINDOW_MS = 10 * 60 * 1000;
const PER_IP_LIMIT = 5;
const GLOBAL_LIMIT = 100;

interface SubscribeBody {
  email?: string;
  source?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: SubscribeBody;
  try {
    body = (await req.json()) as SubscribeBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const email = (body.email ?? '').trim().toLowerCase();
  const source = (body.source ?? 'unknown').slice(0, 40);

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  const now = Date.now();
  const ip = clientIp(req);
  const perIp = rateLimit(`newsletter:ip:${ip}`, PER_IP_LIMIT, WINDOW_MS, now);
  const global = rateLimit('newsletter:global', GLOBAL_LIMIT, WINDOW_MS, now);
  if (!perIp.ok || !global.ok) {
    const retryAfterMs = Math.max(perIp.retryAfterMs, global.retryAfterMs);
    return NextResponse.json(
      { error: 'Too many requests. Please try again in a few minutes.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } },
    );
  }

  const admin = createAdminClient();

  // Already subscribed? Re-send their existing code (don't create a duplicate).
  const { data: existing } = await admin
    .from('newsletter_subscribers')
    .select('email, promo_code')
    .eq('email', email)
    .maybeSingle();

  if (existing?.promo_code) {
    try {
      await sendNewsletterWelcomeEmail({ to: email, promoCode: existing.promo_code });
    } catch (err) {
      console.error('[newsletter] resend welcome failed', err);
    }
    return NextResponse.json({ ok: true, alreadySubscribed: true });
  }

  // Generate a unique promo code (e.g., WELCOME-A1B2C3D4) — Stripe requires
  // unique promotion code strings across the account.
  const promoCode = `WELCOME-${randomBytes(4).toString('hex').toUpperCase()}`;

  // Create the Stripe coupon + promotion code so the customer can type
  // `promoCode` at checkout and get 10% off. The coupon is one-time and
  // restricted to the customer's first transaction.
  let stripeOk = false;
  try {
    const stripe = getStripe();
    const coupon = await stripe.coupons.create({
      percent_off: 10,
      duration: 'once',
      name: 'WELCOME10 — Newsletter signup',
      max_redemptions: 1,
      metadata: { source, email },
    });
    await stripe.promotionCodes.create({
      coupon: coupon.id,
      code: promoCode,
      max_redemptions: 1,
      restrictions: { first_time_transaction: true },
      metadata: { source, email },
    });
    stripeOk = true;
  } catch (err) {
    console.error('[newsletter] stripe coupon failed', err);
    return NextResponse.json(
      { error: 'Could not generate discount code. Try again later.' },
      { status: 500 },
    );
  }

  if (!stripeOk) {
    return NextResponse.json({ error: 'Discount code unavailable' }, { status: 500 });
  }

  // Persist subscription (after Stripe success so we never store a code
  // that doesn't actually exist on Stripe).
  const { error: insertErr } = await admin
    .from('newsletter_subscribers')
    .insert({ email, source, promo_code: promoCode });

  if (insertErr) {
    // Edge case: another request raced us — re-fetch the existing row.
    const { data: raced } = await admin
      .from('newsletter_subscribers')
      .select('promo_code')
      .eq('email', email)
      .maybeSingle();
    if (raced?.promo_code) {
      return NextResponse.json({ ok: true, alreadySubscribed: true });
    }
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  // Welcome email — don't fail the request if Resend hiccups; the row is
  // saved and the user can be re-emailed later.
  try {
    await sendNewsletterWelcomeEmail({ to: email, promoCode });
  } catch (err) {
    console.error('[newsletter] welcome email send failed', err);
  }

  return NextResponse.json({ ok: true });
}
