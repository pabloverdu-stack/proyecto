import type { APIRoute } from 'astro';
import { z } from 'astro/zod';
import { isGoogleMapsUrl, reviewUrlFor, generateCode } from '../../lib/codes';
import { ATTRIBUTION_KEYS } from '../../lib/attribution-keys';
import { getActiveProducts, unitsLabel } from '../../lib/products';
import { clip, findPriceByLookupKey, getStripe } from '../../lib/stripe';
import { getStore } from '../../lib/store';
import { fulfillOrder } from '../../lib/orders';
import { site } from '../../config/site';

export const prerender = false;

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

const bodySchema = z.object({
  productId: z.string().max(80),
  packId: z.string().max(20),
  business: z.object({
    placeId: z.string().max(300).nullable(),
    name: z.string().trim().min(1).max(200),
    address: z.string().max(300).nullable(),
    mapsUrl: z.string().max(500).nullable(),
  }),
  attribution: z.record(z.string(), z.string().max(200)).default({}),
  consent: z.object({ analytics: z.boolean(), marketing: z.boolean() }).nullable().default(null),
});

export const POST: APIRoute = async ({ request }) => {
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return json({ error: 'Faltan datos del pedido. Recarga la página e inténtalo de nuevo.' }, 400);
  }

  const products = await getActiveProducts();
  const product = products.find((p) => p.id === body.productId);
  const pack = product?.data.packs.find((p) => p.id === body.packId);
  if (!product || !pack) return json({ error: 'Ese producto ya no está disponible.' }, 404);

  const { placeId, mapsUrl } = body.business;
  const isDemoPlace = placeId?.startsWith('DEMO-') ?? false;
  if (isDemoPlace && !import.meta.env.DEV) return json({ error: 'Negocio no válido.' }, 400);
  if (!placeId && !(mapsUrl && isGoogleMapsUrl(mapsUrl))) {
    return json({ error: 'Elige tu negocio de la lista o pega el enlace de tu ficha de Google Maps.' }, 400);
  }

  const manualReview = !placeId;
  const reviewUrl = placeId ? reviewUrlFor(placeId) : mapsUrl!;
  const attribution = Object.fromEntries(
    ATTRIBUTION_KEYS.filter((key) => body.attribution[key]).map((key) => [key, clip(body.attribution[key], 200)]),
  );
  const origin = new URL(request.url).origin;
  const stripe = getStripe();

  // Modo demo: sin claves de Stripe y solo en desarrollo, se simula un pago correcto.
  if (!stripe) {
    if (!import.meta.env.DEV) return json({ error: 'Los pagos no están disponibles ahora mismo.' }, 503);
    const store = getStore()!;
    const sessionId = `demo_${generateCode(16)}`;
    await fulfillOrder(
      store,
      {
        stripeSessionId: sessionId,
        customerEmail: 'cliente@ejemplo.es',
        customerName: 'Cliente de prueba',
        phone: null,
        taxId: null,
        billing: null,
        shippingAddress: { line1: 'Calle de prueba, 1', postal_code: '28001', city: 'Madrid', country: 'ES' },
        productId: product.id,
        packId: pack.id,
        units: pack.units,
        amountTotal: pack.priceCents,
        currency: 'eur',
        status: manualReview ? 'needs_review' : 'paid',
        notes: manualReview ? 'Negocio indicado con enlace manual: comprobar la ficha antes de programar.' : null,
        attribution,
        business: { ...body.business, reviewUrl, needsManualReview: manualReview },
      },
      origin,
    );
    return json({ url: `/pedido/confirmado?demo=${sessionId}` });
  }

  try {
    const price = await findPriceByLookupKey(stripe, pack.stripeLookupKey);
    if (!price) {
      console.error(`[checkout] No existe en Stripe el precio "${pack.stripeLookupKey}". Ejecuta: npm run stripe:setup`);
      return json({ error: 'No podemos cobrar este pack ahora mismo. Escríbenos y lo resolvemos.' }, 500);
    }
    if (price.unit_amount !== pack.priceCents) {
      console.warn(`[checkout] El precio de Stripe (${price.unit_amount}) no coincide con la web (${pack.priceCents}) en ${pack.stripeLookupKey}`);
    }

    const metadata: Record<string, string> = {
      product: product.id,
      pack: pack.id,
      units: String(pack.units),
      place_id: clip(placeId),
      business_name: clip(body.business.name),
      business_address: clip(body.business.address),
      maps_url: clip(mapsUrl),
      review_url: clip(reviewUrl),
      manual_review: manualReview ? '1' : '0',
      consent_analytics: body.consent?.analytics ? '1' : '0',
      consent_marketing: body.consent?.marketing ? '1' : '0',
      ...attribution,
    };

    const returnParams = new URLSearchParams({ producto: product.id, pack: pack.id, cancelado: '1', ...attribution });
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      locale: 'es',
      line_items: [{ price: price.id, quantity: 1 }],
      billing_address_collection: 'required',
      phone_number_collection: { enabled: true },
      tax_id_collection: { enabled: true },
      shipping_address_collection: { allowed_countries: ['ES'] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            display_name: `Envío gratis a la ${site.shipping.zone}`,
            fixed_amount: { amount: 0, currency: 'eur' },
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 1 },
              maximum: { unit: 'business_day', value: 2 },
            },
          },
        },
      ],
      consent_collection: { terms_of_service: 'required' },
      custom_text: {
        shipping_address: { message: `Solo enviamos a la ${site.shipping.zone}. No enviamos a ${site.shipping.excluded}.` },
        terms_of_service_acceptance: { message: `Acepto las [condiciones de compra](${origin}/condiciones).` },
        submit: { message: `Pedido: ${unitsLabel(product, pack.units)} para ${clip(body.business.name, 120)}.` },
      },
      metadata,
      payment_intent_data: { metadata },
      success_url: `${origin}/pedido/confirmado?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pedido?${returnParams}`,
    });

    return json({ url: session.url });
  } catch (error) {
    console.error('[checkout]', error instanceof Error ? error.message : error);
    return json({ error: 'No hemos podido abrir el pago. Inténtalo de nuevo en un momento.' }, 502);
  }
};
