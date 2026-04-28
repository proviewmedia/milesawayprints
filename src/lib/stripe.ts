import Stripe from 'stripe';

const secret = process.env.STRIPE_SECRET_KEY;

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!secret) {
    throw new Error('STRIPE_SECRET_KEY not set');
  }
  if (!_stripe) {
    _stripe = new Stripe(secret, {
      apiVersion: '2024-06-20',
      typescript: true,
    });
  }
  return _stripe;
}
