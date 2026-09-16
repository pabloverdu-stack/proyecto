import type { APIRoute } from 'astro';
import { faq } from '../content/faq';
import { formatEuros, site } from '../config/site';
import { getActiveProducts, productUrl, unitsLabel } from '../lib/products';

// Resumen en texto plano para asistentes de IA (formato llms.txt).
export const GET: APIRoute = async ({ site: siteUrl }) => {
  const base = siteUrl ?? new URL('https://fichaviva.es');
  const products = await getActiveProducts();
  const lines = [
    `# ${site.name}`,
    '',
    `> ${site.description} El cliente del negocio acerca el móvil a la tarjeta o al soporte y se abre la ventana para escribir una reseña en Google, sin instalar ninguna app. Incluye código QR para móviles sin NFC.`,
    '',
    '## Productos',
    ...products.map((product) => {
      const packs = product.data.packs.map((pack) => `${unitsLabel(product, pack.units)} por ${formatEuros(pack.priceCents)}`).join('; ');
      return `- [${product.data.name}](${new URL(productUrl(product), base).href}): ${packs}. IVA incluido.`;
    }),
    '',
    '## Envío',
    `- Gratis a la ${site.shipping.zone}, entrega en ${site.shipping.time} laborables. No se envía a ${site.shipping.excluded}.`,
    '',
    '## Preguntas frecuentes',
    ...faq.map((item) => `- ${item.question} ${item.answer}`),
    '',
    '## Aviso',
    `- ${site.name} ${site.disclaimer}`,
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
