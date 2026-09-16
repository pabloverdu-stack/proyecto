import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from 'astro:env/server';

// Cliente basado en fetch y Web Crypto: funciona igual en Cloudflare Workers que en Node.
export function getStripe(): Stripe | null {
  if (!STRIPE_SECRET_KEY) return null;
  return new Stripe(STRIPE_SECRET_KEY, {
    httpClient: Stripe.createFetchHttpClient(),
    maxNetworkRetries: 2,
  });
}

export const webhookCrypto = Stripe.createSubtleCryptoProvider();

export async function findPriceByLookupKey(stripe: Stripe, lookupKey: string) {
  const prices = await stripe.prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 });
  return prices.data[0] ?? null;
}

/** Stripe limita cada valor de metadata a 500 caracteres. */
export const clip = (value: string | null | undefined, max = 480) => (value ?? '').slice(0, max);
