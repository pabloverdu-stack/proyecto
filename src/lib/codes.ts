const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/** Código de tarjeta: 8 caracteres base62. */
export const CODE_PATTERN = /^[0-9A-Za-z]{8}$/;

/**
 * Genera un código aleatorio con el generador criptográfico del sistema.
 * Descarta bytes ≥ 248 para que los 62 caracteres salgan con la misma probabilidad.
 */
export function generateCode(length = 8): string {
  const out: string[] = [];
  const bytes = new Uint8Array(length * 2);
  while (out.length < length) {
    crypto.getRandomValues(bytes);
    for (const byte of bytes) {
      if (byte >= 248) continue;
      out.push(ALPHABET[byte % 62]!);
      if (out.length === length) break;
    }
  }
  return out.join('');
}

export const reviewUrlFor = (placeId: string) =>
  `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`;

const GOOGLE_MAPS_HOSTS = [
  'maps.app.goo.gl',
  'goo.gl',
  'g.page',
  'g.co',
  'google.com',
  'www.google.com',
  'maps.google.com',
  'google.es',
  'www.google.es',
  'maps.google.es',
  'search.google.com',
];

/** Acepta solo enlaces https de Google Maps o de la ficha de Google. */
export function isGoogleMapsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && GOOGLE_MAPS_HOSTS.includes(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}
