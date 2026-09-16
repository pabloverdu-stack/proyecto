import { PUBLIC_GOOGLE_ADS_ID, PUBLIC_GOOGLE_ADS_PURCHASE_LABEL } from 'astro:env/client';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
    fvTrack?: typeof track;
  }
}

export type TrackEvent =
  | 'hero_cta_click'
  | 'pricing_view'
  | 'checkout_step_1'
  | 'business_selected'
  | 'checkout_redirect'
  | 'purchase';

/**
 * Registra un evento. Siempre se añade a window.dataLayer (no envía nada por sí solo);
 * solo sale del navegador si el visitante aceptó cookies y se cargó la etiqueta de Google.
 */
export function track(name: TrackEvent, params: Record<string, unknown> = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...params });
  if (!window.gtag) return;
  window.gtag('event', name, params);
  if (name === 'purchase' && PUBLIC_GOOGLE_ADS_ID && PUBLIC_GOOGLE_ADS_PURCHASE_LABEL) {
    window.gtag('event', 'conversion', {
      send_to: `${PUBLIC_GOOGLE_ADS_ID}/${PUBLIC_GOOGLE_ADS_PURCHASE_LABEL}`,
      value: params.value,
      currency: params.currency,
      transaction_id: params.transaction_id,
    });
  }
}

/** Dispara un evento una sola vez por visita (por ejemplo, la compra al recargar la página). */
export function trackOnce(key: string, name: TrackEvent, params: Record<string, unknown> = {}) {
  try {
    const storageKey = `fv_tracked_${key}`;
    if (sessionStorage.getItem(storageKey)) return;
    sessionStorage.setItem(storageKey, '1');
  } catch {
    // Si no hay sessionStorage, se registra igualmente.
  }
  track(name, params);
}
