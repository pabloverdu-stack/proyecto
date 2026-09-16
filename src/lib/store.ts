import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL } from 'astro:env/server';
import { generateCode } from './codes';

export type OrderStatus = 'paid' | 'needs_review' | 'programmed' | 'shipped' | 'delivered' | 'refunded';

export interface BusinessInput {
  placeId: string | null;
  name: string;
  address: string | null;
  reviewUrl: string;
  mapsUrl: string | null;
  needsManualReview: boolean;
}

export interface OrderInput {
  stripeSessionId: string;
  customerEmail: string | null;
  customerName: string | null;
  phone: string | null;
  taxId: string | null;
  billing: Record<string, unknown> | null;
  shippingAddress: Record<string, unknown> | null;
  productId: string;
  packId: string;
  units: number;
  amountTotal: number;
  currency: string;
  status: OrderStatus;
  notes: string | null;
  attribution: Record<string, string>;
  business: BusinessInput;
}

export interface OrderRecord {
  id: string;
  stripeSessionId: string;
  businessId: string;
  status: OrderStatus;
  notifiedAt: string | null;
  createdAt: string;
}

export interface CardRecord {
  id: string;
  code: string;
  orderId: string | null;
  businessId: string | null;
  productType: string;
  destinationUrl: string;
  active: boolean;
}

export interface OrderDetails {
  order: OrderRecord;
  input: OrderInput;
  cards: CardRecord[];
}

export interface Store {
  kind: 'supabase' | 'memory';
  saveOrder(input: OrderInput): Promise<{ order: OrderRecord; created: boolean }>;
  listCards(orderId: string): Promise<CardRecord[]>;
  createCard(order: OrderRecord, destinationUrl: string): Promise<CardRecord>;
  markNotified(orderId: string): Promise<void>;
  findCard(code: string): Promise<CardRecord | null>;
  recordTap(code: string): Promise<void>;
}

/* ---------- Supabase (producción) ---------- */

const ORDER_COLUMNS = 'id, stripe_session_id, business_id, status, notified_at, created_at';
const CARD_COLUMNS = 'id, code, order_id, business_id, product_type, destination_url, active';

type Row = Record<string, any>;

const mapOrder = (row: Row): OrderRecord => ({
  id: row.id,
  stripeSessionId: row.stripe_session_id,
  businessId: row.business_id,
  status: row.status,
  notifiedAt: row.notified_at,
  createdAt: row.created_at,
});

const mapCard = (row: Row): CardRecord => ({
  id: row.id,
  code: row.code,
  orderId: row.order_id,
  businessId: row.business_id,
  productType: row.product_type,
  destinationUrl: row.destination_url,
  active: row.active,
});

const UNIQUE_VIOLATION = '23505';

class SupabaseStore implements Store {
  readonly kind = 'supabase' as const;

  constructor(private readonly db: SupabaseClient) {}

  private async findOrder(sessionId: string) {
    const { data, error } = await this.db.from('orders').select(ORDER_COLUMNS).eq('stripe_session_id', sessionId).maybeSingle();
    if (error) throw new Error(`Supabase (orders): ${error.message}`);
    return data ? mapOrder(data) : null;
  }

  private async upsertBusiness(business: BusinessInput): Promise<string> {
    const row = {
      place_id: business.placeId,
      name: business.name,
      address: business.address,
      review_url: business.reviewUrl,
      maps_url: business.mapsUrl,
      needs_manual_review: business.needsManualReview,
    };
    const query = business.placeId
      ? this.db.from('businesses').upsert(row, { onConflict: 'place_id' })
      : this.db.from('businesses').insert(row);
    const { data, error } = await query.select('id').single();
    if (error) throw new Error(`Supabase (businesses): ${error.message}`);
    return data.id as string;
  }

  async saveOrder(input: OrderInput) {
    const existing = await this.findOrder(input.stripeSessionId);
    if (existing) return { order: existing, created: false };

    const businessId = await this.upsertBusiness(input.business);
    const { data, error } = await this.db
      .from('orders')
      .insert({
        stripe_session_id: input.stripeSessionId,
        customer_email: input.customerEmail,
        customer_name: input.customerName,
        phone: input.phone,
        tax_id: input.taxId,
        billing: input.billing,
        shipping_address: input.shippingAddress,
        product_id: input.productId,
        pack_id: input.packId,
        units: input.units,
        amount_total: input.amountTotal,
        currency: input.currency,
        status: input.status,
        notes: input.notes,
        attribution: input.attribution,
        business_id: businessId,
      })
      .select(ORDER_COLUMNS)
      .single();

    if (error) {
      // Otra entrega del mismo evento llegó a la vez: devolvemos el pedido que ya existe.
      if (error.code === UNIQUE_VIOLATION) {
        const again = await this.findOrder(input.stripeSessionId);
        if (again) return { order: again, created: false };
      }
      throw new Error(`Supabase (orders): ${error.message}`);
    }
    return { order: mapOrder(data), created: true };
  }

  async listCards(orderId: string) {
    const { data, error } = await this.db.from('cards').select(CARD_COLUMNS).eq('order_id', orderId).order('created_at');
    if (error) throw new Error(`Supabase (cards): ${error.message}`);
    return (data ?? []).map(mapCard);
  }

  async createCard(order: OrderRecord, destinationUrl: string) {
    for (let attempt = 0; attempt < 5; attempt++) {
      const { data, error } = await this.db
        .from('cards')
        .insert({ code: generateCode(), order_id: order.id, business_id: order.businessId, destination_url: destinationUrl })
        .select(CARD_COLUMNS)
        .single();
      if (!error) return mapCard(data);
      if (error.code !== UNIQUE_VIOLATION) throw new Error(`Supabase (cards): ${error.message}`);
    }
    throw new Error('No se pudo generar un código de tarjeta único');
  }

  async markNotified(orderId: string) {
    const { error } = await this.db.from('orders').update({ notified_at: new Date().toISOString() }).eq('id', orderId);
    if (error) throw new Error(`Supabase (orders): ${error.message}`);
  }

  async findCard(code: string) {
    const { data, error } = await this.db.from('cards').select(CARD_COLUMNS).eq('code', code).maybeSingle();
    if (error) throw new Error(`Supabase (cards): ${error.message}`);
    return data ? mapCard(data) : null;
  }

  async recordTap(code: string) {
    const { error } = await this.db.from('tap_events').insert({ card_code: code });
    if (error) console.error('[tap_events]', error.message);
  }
}

/* ---------- Memoria (solo modo demo en desarrollo) ---------- */

interface MemoryData {
  orders: Map<string, OrderDetails>;
  cards: Map<string, CardRecord>;
  taps: { code: string; at: string }[];
}

const memoryData: MemoryData = ((globalThis as { __fichaVivaDemo?: MemoryData }).__fichaVivaDemo ??= {
  orders: new Map(),
  cards: new Map(),
  taps: [],
} as MemoryData);

class MemoryStore implements Store {
  readonly kind = 'memory' as const;

  async saveOrder(input: OrderInput) {
    const existing = memoryData.orders.get(input.stripeSessionId);
    if (existing) return { order: existing.order, created: false };
    const order: OrderRecord = {
      id: crypto.randomUUID(),
      stripeSessionId: input.stripeSessionId,
      businessId: crypto.randomUUID(),
      status: input.status,
      notifiedAt: null,
      createdAt: new Date().toISOString(),
    };
    memoryData.orders.set(input.stripeSessionId, { order, input, cards: [] });
    return { order, created: true };
  }

  async listCards(orderId: string) {
    return [...memoryData.cards.values()].filter((card) => card.orderId === orderId);
  }

  async createCard(order: OrderRecord, destinationUrl: string) {
    let code = generateCode();
    while (memoryData.cards.has(code)) code = generateCode();
    const card: CardRecord = {
      id: crypto.randomUUID(),
      code,
      orderId: order.id,
      businessId: order.businessId,
      productType: 'google_review',
      destinationUrl,
      active: true,
    };
    memoryData.cards.set(code, card);
    const details = memoryData.orders.get(order.stripeSessionId);
    details?.cards.push(card);
    return card;
  }

  async markNotified(orderId: string) {
    for (const details of memoryData.orders.values()) {
      if (details.order.id === orderId) details.order.notifiedAt = new Date().toISOString();
    }
  }

  async findCard(code: string) {
    return memoryData.cards.get(code) ?? null;
  }

  async recordTap(code: string) {
    memoryData.taps.push({ code, at: new Date().toISOString() });
  }
}

export const getDemoOrder = (sessionId: string) => memoryData.orders.get(sessionId) ?? null;

/**
 * Supabase si hay credenciales. Sin ellas, en desarrollo se usa memoria (se borra al reiniciar)
 * y en producción no hay almacenamiento: devuelve null.
 */
export function getStore(): Store | null {
  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    return new SupabaseStore(
      createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } }),
    );
  }
  return import.meta.env.DEV ? new MemoryStore() : null;
}
