import { getCollection, type CollectionEntry } from 'astro:content';
import { formatEuros } from '../config/site';

export type Product = CollectionEntry<'products'>;
export type Pack = Product['data']['packs'][number];

export async function getActiveProducts(): Promise<Product[]> {
  const all = await getCollection('products', (p) => p.data.status === 'active');
  return all.sort((a, b) => a.data.order - b.data.order);
}

export async function getFeaturedProduct(): Promise<Product> {
  const products = await getActiveProducts();
  const featured = products.find((p) => p.data.featured) ?? products[0];
  if (!featured) throw new Error('No hay ningún producto activo en src/content/products');
  return featured;
}

export const productUrl = (p: Product) => (p.data.featured ? '/' : `/productos/${p.id}`);

export const recommendedPack = (p: Product): Pack =>
  p.data.packs.find((pack) => pack.recommended) ?? p.data.packs[0]!;

export const unitsLabel = (p: Product, units: number) =>
  `${units} ${units === 1 ? p.data.unit.singular : p.data.unit.plural}`;

export const eachLabel = (p: Product, pack: Pack) =>
  `${formatEuros(Math.round(pack.priceCents / pack.units))} cada ${p.data.unit.gender === 'f' ? 'una' : 'uno'}`;

export const fromPrice = (p: Product) =>
  Math.min(...p.data.packs.map((pack) => Math.round(pack.priceCents / pack.units)));

/** Datos mínimos que necesita el navegador en /pedido. */
export const toClientCatalog = (products: Product[]) =>
  products.map((p) => ({
    id: p.id,
    name: p.data.name,
    featured: p.data.featured,
    url: productUrl(p),
    unit: p.data.unit,
    packs: p.data.packs.map(({ id, units, priceCents, recommended }) => ({ id, units, priceCents, recommended })),
  }));

export type ClientCatalog = ReturnType<typeof toClientCatalog>;
