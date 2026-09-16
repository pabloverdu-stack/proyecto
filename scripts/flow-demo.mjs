// Recorre el flujo completo en modo demo (sin claves): ficha, pedido, confirmación y redirección de la tarjeta.
// Uso: npm run dev (en otra terminal) y después npm run test:flujo
import { chromium } from 'playwright';

const base = process.env.BASE_URL || 'http://localhost:4321';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'es-ES' });
const events = [];
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));

const step = (text) => console.log(`- ${text}`);

await page.goto(`${base}/?utm_source=chatgpt&utm_medium=cpc&oppref=prueba123`);
step('Portada cargada');
await page.locator('label.pack', { hasText: '5 tarjetas' }).click();
await page.getByRole('button', { name: 'Pedir mi tarjeta' }).first().click();
await page.waitForURL(/\/pedido\?/);
const orderUrl = new URL(page.url());
step(`Pedido abierto con pack=${orderUrl.searchParams.get('pack')} y utm_source=${orderUrl.searchParams.get('utm_source')}`);

await page.getByLabel('Nombre del negocio y ciudad').fill('peluqueria nati');
await page.getByRole('option').first().waitFor();
await page.keyboard.press('ArrowDown');
await page.keyboard.press('Enter');
await page.locator('[data-selected]').waitFor({ state: 'visible' });
step(`Negocio elegido: ${await page.locator('[data-selected-name]').textContent()}`);

const submit = page.locator('[data-submit]');
step(`Botón final: "${await submit.textContent()}"`);
await submit.click();
await page.waitForURL(/\/pedido\/confirmado/);
step(`Confirmación: ${await page.locator('h1').textContent()}`);

events.push(...(await page.evaluate(() => (window.dataLayer || []).map((e) => e.event))));
const codes = await page.locator('.demo a').allTextContents();
step(`Tarjetas creadas: ${codes.join(', ')}`);

const tapUrl = `${base}${codes[0].trim()}`;
const response = await page.request.get(tapUrl, { maxRedirects: 0 });
step(`GET ${codes[0].trim()} → ${response.status()} ${response.headers()['location']} (cache: ${response.headers()['cache-control']})`);

const missing = await page.request.get(`${base}/t/NoExiste`, { maxRedirects: 0 });
step(`GET /t/NoExiste → ${missing.status()}`);

step(`Eventos en dataLayer de la confirmación: ${events.join(', ') || 'ninguno'}`);
console.log(errors.length ? `ERRORES:\n${errors.join('\n')}` : 'Sin errores de JavaScript');
await browser.close();
process.exit(response.status() === 302 && codes.length === 5 && !errors.length ? 0 : 1);
