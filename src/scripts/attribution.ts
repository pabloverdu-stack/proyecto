import { hasConsent } from './consent';
import { ATTRIBUTION_KEYS, type AttributionKey } from '../lib/attribution-keys';

export { ATTRIBUTION_KEYS };
export type Attribution = Partial<Record<AttributionKey, string>>;

const KEY = 'fv_attribution';

function fromUrl(search = location.search): Attribution {
  const params = new URLSearchParams(search);
  const found: Attribution = {};
  for (const key of ATTRIBUTION_KEYS) {
    const value = params.get(key);
    if (value) found[key] = value.slice(0, 200);
  }
  return found;
}

/**
 * Parámetros de campaña que viajan hasta la metadata de Stripe.
 * Sin consentimiento de marketing solo pasan de página en página dentro de la URL.
 * Con consentimiento se recuerdan durante la visita para no perderlos al navegar.
 */
export function getAttribution(): Attribution {
  const current = fromUrl();
  if (!hasConsent('marketing')) return current;
  try {
    const stored = JSON.parse(sessionStorage.getItem(KEY) || '{}') as Attribution;
    const merged = { ...stored, ...current };
    if (Object.keys(current).length) sessionStorage.setItem(KEY, JSON.stringify(merged));
    return merged;
  } catch {
    return current;
  }
}
