import type { APIRoute } from 'astro';
import type Stripe from 'stripe';
import { STRIPE_WEBHOOK_SECRET } from 'astro:env/server';
import { getStripe, webhookCrypto } from '../../lib/stripe';
import { getStore } from '../../lib/store';
import { fulfillOrder, orderInputFromSession } from '../../lib/orders';

export const prerender = false;

const HANDLED = new Set(['checkout.session.completed', 'checkout.session.async_payment_succeeded']);

export const POST: APIRoute = async ({ request, site }) => {
  const stripe = getStripe();
  if (!stripe || !STRIPE_WEBHOOK_SECRET) return new Response('Webhook sin configurar', { status: 503 });

  const signature = request.headers.get('stripe-signature');
  if (!signature) return new Response('Falta la firma', { status: 400 });

  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(payload, signature, STRIPE_WEBHOOK_SECRET, undefined, webhookCrypto);
  } catch (error) {
    console.warn('[webhook] Firma no válida', error instanceof Error ? error.message : error);
    return new Response('Firma no válida', { status: 400 });
  }

  if (!HANDLED.has(event.type)) return Response.json({ received: true, ignored: event.type });

  const session = event.data.object as Stripe.Checkout.Session;
  if (session.payment_status !== 'paid') return Response.json({ received: true, pending: true });

  const store = getStore();
  if (!store) {
    console.error('[webhook] Falta configurar Supabase: Stripe reintentará el envío.');
    return new Response('Almacenamiento sin configurar', { status: 503 });
  }

  try {
    const siteUrl = (site ?? new URL(request.url)).origin;
    const result = await fulfillOrder(store, orderInputFromSession(session), siteUrl);
    return Response.json({ received: true, created: result.created, cards: result.cards.length });
  } catch (error) {
    // Un 500 hace que Stripe vuelva a intentarlo más tarde.
    console.error('[webhook]', error instanceof Error ? error.message : error);
    return new Response('Error al guardar el pedido', { status: 500 });
  }
};
