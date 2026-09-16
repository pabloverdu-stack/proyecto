// Genera public/og.png (1200×630, para compartir en redes) y public/apple-touch-icon.png (180×180).
// Toma la escena SVG de la portada, así que necesita el servidor de desarrollo en marcha.
// Uso: npm run dev (en otra terminal) y después npm run imagenes
import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';

const base = process.env.BASE_URL || 'http://localhost:4321';
const font = (await readFile('node_modules/@fontsource-variable/chivo/files/chivo-latin-wght-normal.woff2')).toString('base64');
const fontFace = `@font-face{font-family:'Chivo Variable';src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:100 900}`;

const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto(base);
const scene = await page.locator('#escena-producto').evaluate((svg) => svg.outerHTML);
const headline = await page.locator('h1').first().innerText();
const brand = await page.locator('.site-header .brand').innerText();

await page.setViewportSize({ width: 1200, height: 630 });
await page.setContent(`<!doctype html><html><head><style>${fontFace}
  *{box-sizing:border-box;margin:0}
  body{width:1200px;height:630px;background:#f4f5f2;color:#17191a;font-family:'Chivo Variable',sans-serif;display:grid;grid-template-columns:1fr 560px;align-items:center;gap:48px;padding:64px}
  .brand{font-size:30px;font-weight:700;letter-spacing:-.02em}
  h1{margin-top:28px;font-size:60px;line-height:1.05;font-weight:650;letter-spacing:-.025em}
  p{margin-top:24px;font-size:26px;color:#5b6166}
  svg{width:560px;height:420px;border-radius:24px}
</style></head><body><div><div class="brand">${brand}</div><h1>${headline}</h1><p>Tarjeta NFC de reseñas de Google</p></div>${scene}</body></html>`);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: 'public/og.png' });

await page.setViewportSize({ width: 180, height: 180 });
await page.setContent(`<!doctype html><html><body style="margin:0;width:180px;height:180px;background:#17191a;display:grid;place-items:center">
<svg width="120" height="120" viewBox="0 0 64 64"><circle cx="32" cy="32" r="17" fill="none" stroke="#f4f5f2" stroke-width="4.5"/><circle cx="32" cy="32" r="5.5" fill="#f4f5f2"/></svg></body></html>`);
await page.screenshot({ path: 'public/apple-touch-icon.png' });

await browser.close();
console.log('Creados public/og.png y public/apple-touch-icon.png');
