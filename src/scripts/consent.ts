// Guarda la elección de cookies del visitante. Nada no esencial se carga sin ella.
export type ConsentCategory = 'analytics' | 'marketing';
export interface Consent {
  analytics: boolean;
  marketing: boolean;
  version: 1;
  updatedAt: string;
}

const KEY = 'fv_consent';
export const CONSENT_EVENT = 'fv:consent';

export function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Consent) : null;
  } catch {
    return null;
  }
}

export function saveConsent(choice: Pick<Consent, ConsentCategory>) {
  const consent: Consent = { ...choice, version: 1, updatedAt: new Date().toISOString() };
  try {
    localStorage.setItem(KEY, JSON.stringify(consent));
  } catch {
    // Sin almacenamiento disponible: la elección vale solo para esta visita.
  }
  window.dispatchEvent(new CustomEvent<Consent>(CONSENT_EVENT, { detail: consent }));
  return consent;
}

export const hasConsent = (category: ConsentCategory) => readConsent()?.[category] === true;
