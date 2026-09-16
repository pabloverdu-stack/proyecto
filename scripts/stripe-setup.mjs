// Crea en Stripe los productos y precios de src/content/products (modo test por defecto).
// Uso: npm run stripe:setup
// Se puede repetir sin miedo: si un precio ya existe con el mismo importe, no hace nada;
// si cambió el importe, crea uno nuevo y le pasa la lookup_key.
import { readdir, readFile } from 'node:fs/promises';
import Stripe from 'stripe';

try {
  process.loadEnvFile('.env');
} catch {
  // Sin .env: se usan las variables del sistema.
}

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error('Falta STRIPE_SECRET_KEY en el archivo .env');
  process.exit(1);
}
if (key.startsWith('sk_live') && !process.argv.includes('--live')) {
  console.error('Esa es una clave LIVE. Si de verdad quieres crear los precios reales, ejecuta: npm run stripe:setup -- --live');
  process.exit(1);
}

const stripe = new Stripe(key);
const dir = 'src/content/products';
const files = (await readdir(dir)).filter((file) => file.endsWith('.json'));

for (const file of files) {
  const id = file.replace(/\.json$/, '');
  const product = JSON.parse(await readFile(`${dir}/${file}`, 'utf8'));
  if (product.status === 'draft') continue;

  const found = await stripe.products.search({ query: `metadata['site_id']:'${id}'` });
  const stripeProduct =
    found.data[0] ??
    (await stripe.products.create({
      name: product.name,
      description: product.seo.description,
      metadata: { site_id: id },
      tax_code: 'txcd_99999999',
    }));
  if (found.data[0] && found.data[0].name !== product.name) {
    await stripe.products.update(stripeProduct.id, { name: product.name });
  }
  console.log(`Producto: ${product.name} (${stripeProduct.id})`);

  for (const pack of product.packs) {
    const existing = (await stripe.prices.list({ lookup_keys: [pack.stripeLookupKey], active: true, limit: 1 })).data[0];
    if (existing && existing.unit_amount === pack.priceCents && existing.product === stripeProduct.id) {
      console.log(`  = ${pack.stripeLookupKey}: ${pack.priceCents / 100} € (ya existía)`);
      continue;
    }
    const nickname = `${pack.units} ${pack.units === 1 ? product.unit.singular : product.unit.plural}`;
    await stripe.prices.create({
      product: stripeProduct.id,
      currency: 'eur',
      unit_amount: pack.priceCents,
      tax_behavior: 'inclusive',
      nickname,
      lookup_key: pack.stripeLookupKey,
      transfer_lookup_key: true,
      metadata: { site_id: id, pack: pack.id, units: String(pack.units) },
    });
    if (existing) await stripe.prices.update(existing.id, { active: false });
    console.log(`  + ${pack.stripeLookupKey}: ${pack.priceCents / 100} € (${existing ? 'actualizado' : 'creado'})`);
  }
}

console.log('\nListo. Recuerda configurar en Stripe la URL de las condiciones (Configuración > Detalles públicos).');
