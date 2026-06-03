import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { sendStripeBrokenAlertEmail } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Hourly health check. Pings Stripe with the cheapest possible API call
 * (balance.retrieve) to confirm the secret key is still valid and the
 * account is reachable. If anything fails, emails the admin so they
 * find out within an hour instead of from a confused customer.
 *
 * Triggered by the Vercel cron entry in /vercel.json — runs at the top
 * of every hour. Also reachable manually via GET for ad-hoc checks.
 */
export async function GET() {
  try {
    const stripe = getStripe();
    const balance = await stripe.balance.retrieve();
    return NextResponse.json({
      ok: true,
      // Surface a tiny summary so a manual probe can see Stripe is alive
      // without exposing the full balance breakdown.
      available_currencies: balance.available.map((b) => b.currency),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    // Fire the alert email — don't await it bringing the response down
    // if Resend itself is also having a bad day; just log and continue.
    try {
      await sendStripeBrokenAlertEmail({ errorMessage });
    } catch (sendErr) {
      console.error('[health/stripe] alert email failed', sendErr);
    }
    return NextResponse.json(
      { ok: false, error: errorMessage, timestamp: new Date().toISOString() },
      { status: 500 },
    );
  }
}
