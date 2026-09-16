import type { APIRoute } from 'astro';
import { site } from '../../config/site';
import { getActiveProducts, productUrl, unitsLabel } from '../../lib/products';

const escapeXml = (value: string) =>
  value.replace(/[<>&'"]/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[char]!);

// Feed de productos para Google Merchant Center (fichas gratuitas y Shopping).
// Un artículo por pack. IMPORTANTE: Google exige fotos reales del producto en image_link;
// no des de alta el feed hasta sustituir /og.png por fotos.
export const GET: APIRoute = async ({ site: siteUrl }) => {
  const base = siteUrl ?? new URL('https://fichaviva.es');
  const products = await getActiveProducts();
  const items = products.flatMap((product) =>
    product.data.packs.map((pack) => {
      const title = `${product.data.name}${pack.units > 1 ? `, pack de ${unitsLabel(product, pack.units)}` : ''}`;
      const link = `${new URL(productUrl(product), base).href}?pack=${pack.id}`;
      return `    <item>
      <g:id>${escapeXml(`${product.id}-${pack.id}`)}</g:id>
      <g:title>${escapeXml(title)}</g:title>
      <g:description>${escapeXml(product.data.seo.description)}</g:description>
      <g:link>${escapeXml(link)}</g:link>
      <g:image_link>${escapeXml(new URL('/og.png', base).href)}</g:image_link>
      <g:availability>in_stock</g:availability>
      <g:condition>new</g:condition>
      <g:price>${(pack.priceCents / 100).toFixed(2)} EUR</g:price>
      <g:brand>${escapeXml(site.name)}</g:brand>
      <g:identifier_exists>no</g:identifier_exists>
${pack.units > 1 ? `      <g:multipack>${pack.units}</g:multipack>\n` : ''}      <g:item_group_id>${escapeXml(product.id)}</g:item_group_id>
      <g:shipping>
        <g:country>ES</g:country>
        <g:price>0.00 EUR</g:price>
      </g:shipping>
    </item>`;
    }),
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(site.name)}</title>
    <link>${escapeXml(new URL('/', base).href)}</link>
    <description>${escapeXml(site.description)}</description>
${items.join('\n')}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
