// Capturas de QA a 390×844 (móvil) y 1440×900 (escritorio).
// Uso: npm run shots            (todas las páginas)
//      npm run shots -- / /pedido   (solo las indicadas)
// Necesita el servidor de desarrollo en marcha (npm run dev) o BASE_URL apuntando a otra URL.
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const base = process.env.BASE_URL || 'http://localhost:4321';
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const withSections = process.argv.includes('--secciones');
const paths = args.length
  ? args
  : [
      '/',
      '/productos',
      '/productos/soporte-nfc-resenas-google',
      '/pedido?producto=tarjeta-nfc-resenas-google&pack=2',
      '/pedido/confirmado',
      '/aviso-legal',
      '/privacidad',
      '/cookies',
      '/condiciones',
      '/t/NoExiste',
      '/pagina-que-no-existe',
    ];

const viewports = [
  { name: 'movil', width: 390, height: 844, mobile: true },
  { name: 'escritorio', width: 1440, height: 900, mobile: false },
];

const slugOf = (path) => (path === '/' ? 'inicio' : path.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, ''));

await mkdir('qa/capturas', { recursive: true });
const browser = await chromium.launch();

for (const vp of viewports) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
    locale: 'es-ES',
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  for (const path of paths) {
    const response = await page.goto(base + path, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const slug = slugOf(path);
    await page.screenshot({ path: `qa/capturas/${vp.name}-${slug}-pantalla.png` });
    await page.screenshot({ path: `qa/capturas/${vp.name}-${slug}-completa.png`, fullPage: true });
    if (withSections) {
      const sections = await page.locator('main > section').all();
      for (const [index, section] of sections.entries()) {
        await section.screenshot({ path: `qa/capturas/${vp.name}-${slug}-seccion-${index + 1}.png` });
      }
    }
    console.log(`${vp.name.padEnd(10)} ${String(response?.status()).padEnd(4)} ${path}`);
  }
  await context.close();
}

await browser.close();
