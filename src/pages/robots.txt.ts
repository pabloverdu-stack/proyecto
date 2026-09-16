import type { APIRoute } from 'astro';

const privatePaths = ['/pedido', '/api/', '/t/'].map((path) => `Disallow: ${path}`).join('\n');

export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL('/sitemap-index.xml', site ?? 'https://fichaviva.es').href;
  const body = `User-agent: *
${privatePaths}

# Buscador de ChatGPT: permitido para que pueda citar la web.
User-agent: OAI-SearchBot
${privatePaths}

Sitemap: ${sitemap}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
