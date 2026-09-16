-- Esquema inicial de Ficha Viva.
-- Cómo usarlo: Supabase > SQL Editor > New query > pega este archivo entero > Run.
-- Seguridad: RLS activado en todas las tablas y SIN políticas. Solo el servidor, con la clave
-- service_role, puede leer y escribir. La clave anon no tiene acceso a nada.

create extension if not exists pgcrypto;

-- Negocios para los que se programan tarjetas
create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  place_id text unique,                 -- null si el cliente pegó el enlace a mano
  name text not null,
  address text,
  review_url text not null,             -- ventana de reseña de Google o enlace pegado por el cliente
  maps_url text,
  needs_manual_review boolean not null default false,
  created_at timestamptz not null default now()
);

create type public.order_status as enum ('paid', 'needs_review', 'programmed', 'shipped', 'delivered', 'refunded');

-- Pedidos pagados (los crea el webhook de Stripe)
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text not null unique,  -- garantiza que un mismo pago no se guarda dos veces
  customer_email text,
  customer_name text,
  phone text,
  tax_id text,
  billing jsonb,
  shipping_address jsonb,
  product_id text not null,
  pack_id text not null,
  units integer not null check (units > 0),
  amount_total integer not null,           -- en céntimos
  currency text not null default 'eur',
  status public.order_status not null default 'paid',
  notes text,
  attribution jsonb not null default '{}'::jsonb,  -- UTM, gclid, gbraid, wbraid, oppref y consentimiento
  business_id uuid not null references public.businesses (id),
  notified_at timestamptz,
  shipped_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Una fila por tarjeta o soporte físico. Su código es lo que se graba en el chip y en el QR.
create table public.cards (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[0-9A-Za-z]{8}$'),
  order_id uuid references public.orders (id) on delete set null,
  business_id uuid references public.businesses (id),
  product_type text not null default 'google_review',
  destination_url text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Lecturas de tarjetas, sin IP, sin user agent y sin ningún dato personal
create table public.tap_events (
  id bigint generated always as identity primary key,
  card_code text not null,
  created_at timestamptz not null default now()
);

create index orders_status_idx on public.orders (status, created_at desc);
create index cards_order_idx on public.cards (order_id);
create index tap_events_card_idx on public.tap_events (card_code, created_at desc);

-- updated_at automático
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();
create trigger cards_updated_at before update on public.cards
  for each row execute function public.set_updated_at();

-- Al marcar un pedido como enviado se guarda la fecha
create or replace function public.set_shipped_at() returns trigger
language plpgsql as $$
begin
  if new.status = 'shipped' and old.status is distinct from 'shipped' and new.shipped_at is null then
    new.shipped_at = now();
  end if;
  return new;
end;
$$;

create trigger orders_shipped_at before update on public.orders
  for each row execute function public.set_shipped_at();

alter table public.businesses enable row level security;
alter table public.orders enable row level security;
alter table public.cards enable row level security;
alter table public.tap_events enable row level security;

-- Vista de trabajo para el día a día (solo accesible desde el panel de Supabase)
create view public.pending_orders with (security_invoker = true) as
select
  o.created_at,
  o.status,
  o.notes,
  b.name as business,
  b.review_url,
  o.units,
  o.customer_name,
  o.customer_email,
  o.phone,
  o.shipping_address,
  (select string_agg(c.code, ', ' order by c.created_at) from public.cards c where c.order_id = o.id) as card_codes,
  o.id as order_id
from public.orders o
join public.businesses b on b.id = o.business_id
where o.status in ('paid', 'needs_review', 'programmed')
order by o.created_at;
