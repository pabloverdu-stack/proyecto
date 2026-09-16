import type { APIRoute } from 'astro';
import { GOOGLE_PLACES_API_KEY } from 'astro:env/server';

export const prerender = false;

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

interface PlacePrediction {
  placeId?: string;
  text?: { text?: string };
  structuredFormat?: { mainText?: { text?: string }; secondaryText?: { text?: string } };
}

// Sin clave de Google, en desarrollo se devuelven negocios de ejemplo para poder probar el flujo.
const demoResults = (query: string) => {
  const name = query.charAt(0).toUpperCase() + query.slice(1);
  return [
    { placeId: 'DEMO-1', name, address: 'Calle Mayor, 12, 46001 Valencia' },
    { placeId: 'DEMO-2', name: `${name} Centro`, address: 'Gran Vía, 30, 28013 Madrid' },
    { placeId: 'DEMO-3', name: `${name} Sevilla`, address: 'Calle Sierpes, 5, 41004 Sevilla' },
  ];
};

export const GET: APIRoute = async ({ url }) => {
  const query = (url.searchParams.get('q') ?? '').trim().slice(0, 120);
  const sessionToken = url.searchParams.get('session') ?? '';
  if (query.length < 3) return json({ results: [] });

  const key = GOOGLE_PLACES_API_KEY;
  if (!key) {
    if (import.meta.env.DEV) return json({ demo: true, results: demoResults(query) });
    return json({ error: 'El buscador no está disponible ahora mismo.' }, 503);
  }

  const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': key },
    body: JSON.stringify({
      input: query,
      languageCode: 'es',
      regionCode: 'es',
      includedRegionCodes: ['es'],
      ...(/^[\w-]{8,64}$/.test(sessionToken) ? { sessionToken } : {}),
    }),
  });

  if (!response.ok) {
    console.error('[places]', response.status, await response.text());
    return json({ error: 'No hemos podido buscar ahora mismo. Inténtalo de nuevo.' }, 502);
  }

  const data = (await response.json()) as { suggestions?: { placePrediction?: PlacePrediction }[] };
  const results = (data.suggestions ?? [])
    .map((suggestion) => suggestion.placePrediction)
    .filter((p): p is PlacePrediction => Boolean(p?.placeId))
    .slice(0, 5)
    .map((p) => ({
      placeId: p.placeId!,
      name: p.structuredFormat?.mainText?.text ?? p.text?.text ?? '',
      address: p.structuredFormat?.secondaryText?.text ?? '',
    }));

  return json({ results });
};
