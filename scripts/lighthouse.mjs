// Auditoría Lighthouse en móvil (4G simulado) de las páginas principales.
// Uso: npm run build && npm run preview (en otra terminal) y después npm run lighthouse
// Por defecto audita http://localhost:4322; cambia BASE_URL para otra dirección.
import { chromium } from 'playwright';
import lighthouse from 'lighthouse';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.BASE_URL || 'http://localhost:4322';
const paths = process.argv.slice(2).length ? process.argv.slice(2) : ['/', '/productos/soporte-nfc-resenas-google', '/pedido', '/condiciones'];
const port = 9333;

await mkdir('qa/lighthouse', { recursive: true });
const browser = await chromium.launch({ args: [`--remote-debugging-port=${port}`] });
let failed = false;

for (const path of paths) {
  const result = await lighthouse(`${base}${path}`, { port, output: 'html', logLevel: 'error' }, undefined);
  const lhr = result.lhr;
  const slug = path === '/' ? 'inicio' : path.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');
  await writeFile(`qa/lighthouse/${slug}.html`, result.report);

  const scores = Object.values(lhr.categories).map((c) => `${c.title} ${Math.round(c.score * 100)}`);
  const metrics = ['largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift', 'total-byte-weight']
    .map((id) => `${lhr.audits[id].title}: ${lhr.audits[id].displayValue}`)
    .join(' | ');
  const weak = Object.values(lhr.audits)
    .filter((a) => typeof a.score === 'number' && a.score < 0.9 && !['informative', 'manual', 'notApplicable'].includes(a.scoreDisplayMode))
    .map((a) => `${a.id} (${a.score})`);

  console.log(`\n${path}\n  ${scores.join(' | ')}\n  ${metrics}\n  Por mejorar: ${weak.join(', ') || 'nada'}`);
  if (Object.values(lhr.categories).some((c) => c.score < 0.9)) failed = true;
}

await browser.close();
process.exit(failed ? 1 : 0);
