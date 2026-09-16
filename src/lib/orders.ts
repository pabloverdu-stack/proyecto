import type Stripe from 'stripe';
import { site } from '../config/site';
import { getActiveProducts, unitsLabel } from './products';
import { sendOrderNotifications } from './notify';
import type { OrderInput, OrderRecord, Store } from './store';
import { ATTRIBUTION_KEYS } from './attribution-keys';

const isExcludedPostalCode = (postalCode: string | null | undefined) =>
  Boolean(postalCode && site.shipping.excludedPostalPrefixes.some((prefix) => postalCode.trim().startsWith(prefix)));

/** Convierte una sesión pagada de Stripe Checkout en los datos del pedido. */
export function orderInputFromSession(session: Stripe.Checkout.Session): OrderInput {
  const md = session.metadata ?? {};
  const customer = session.customer_details;
  const shipping = session.collected_information?.shipping_details ?? null;
  const postalCode = shipping?.address?.postal_code;
  const manualReview = md.manual_review === '1';

  const notes: string[] = [];
  if (manualReview) notes.push('Negocio indicado con enlace manual: comprobar la ficha antes de programar.');
  if (isExcludedPostalCode(postalCode)) {
    notes.push(`Código postal ${postalCode} fuera de la península: contactar con el cliente o reembolsar.`);
  }

  const attribution: Record<string, string> = {};
  for (const key of [...ATTRIBUTION_KEYS, 'consent_analytics', 'consent_marketing']) {
    if (md[key]) attribution[key] = md[key];
  }

  return {
    stripeSessionId: session.id,
    customerEmail: customer?.email ?? null,
    customerName: customer?.name ?? null,
    phone: customer?.phone ?? null,
    taxId: customer?.tax_ids?.map((t) => t.value).join(', ') || null,
    billing: customer
      ? { name: customer.name, business_name: customer.business_name, address: customer.address, tax_ids: customer.tax_ids }
      : null,
    shippingAddress: shipping ? { name: shipping.name, ...shipping.address } : null,
    productId: md.product ?? '',
    packId: md.pack ?? '',
    units: Number(md.units) || 1,
    amountTotal: session.amount_total ?? 0,
    currency: session.currency ?? 'eur',
    status: notes.length ? 'needs_review' : 'paid',
    notes: notes.join(' ') || null,
    attribution,
    business: {
      placeId: md.place_id || null,
      name: md.business_name || 'Sin nombre',
      address: md.business_address || null,
      reviewUrl: md.review_url ?? '',
      mapsUrl: md.maps_url || null,
      needsManualReview: manualReview,
    },
  };
}

const RECOVERY_AFTER_MS = 60_000;

/**
 * Guarda el pedido, crea las tarjetas y avisa. Es idempotente: si Stripe reenvía el mismo
 * evento, no se duplica nada. Si una ejecución anterior se cortó sin crear las tarjetas,
 * pasado un minuto las crea.
 */
export async function fulfillOrder(store: Store, input: OrderInput, siteUrl: string) {
  const { order, created } = await store.saveOrder(input);
  let cards = await store.listCards(order.id);

  const stale = Date.now() - new Date(order.createdAt).getTime() > RECOVERY_AFTER_MS;
  if (cards.length < input.units && (created || stale)) {
    while (cards.length < input.units) {
      cards = [...cards, await store.createCard(order, input.business.reviewUrl)];
    }
  }

  if (!order.notifiedAt && cards.length >= input.units) {
    const products = await getActiveProducts();
    const product = products.find((p) => p.id === input.productId);
    await sendOrderNotifications({
      order,
      input,
      cards,
      productName: product?.data.name ?? input.productId,
      unitsText: product ? unitsLabel(product, input.units) : `${input.units} unidades`,
      siteUrl,
    });
    await store.markNotified(order.id);
  }

  return { order, cards, created } satisfies { order: OrderRecord; cards: unknown[]; created: boolean };
}
