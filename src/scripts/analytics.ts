import { PUBLIC_GA4_ID, PUBLIC_GOOGLE_ADS_ID, PUBLIC_OPENAI_PIXEL_ID } from 'astro:env/client';
import { CONSENT_EVENT, readConsent, type Consent } from './consent';

let googleScriptAdded = false;
let openAiReady = false;

function ensureGtag() {
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function gtag() {
      // gtag.js necesita el objeto arguments, no un array.
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer.push(arguments);
    };
    window.gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
  }
}

function applyGoogle(consent: Consent) {
  const ids = [consent.analytics ? PUBLIC_GA4_ID : undefined, consent.marketing ? PUBLIC_GOOGLE_ADS_ID : undefined].filter(
    (id): id is string => Boolean(id),
  );
  if (!ids.length && !googleScriptAdded) return;

  ensureGtag();
  const marketing = consent.marketing ? 'granted' : 'denied';
  window.gtag!('consent', 'update', {
    analytics_storage: consent.analytics ? 'granted' : 'denied',
    ad_storage: marketing,
    ad_user_data: marketing,
    ad_personalization: marketing,
  });
  if (!ids.length) return;

  if (!googleScriptAdded) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ids[0]!)}`;
    document.head.append(script);
    window.gtag!('js', new Date());
    googleScriptAdded = true;
  }
  ids.forEach((id) => window.gtag!('config', id));
}

function applyOpenAi(consent: Consent) {
  if (!consent.marketing || !PUBLIC_OPENAI_PIXEL_ID || openAiReady) return;
  openAiReady = true;
  // HUECO PREPARADO para el OpenAI Pixel de ChatGPT Ads.
  // Pega aquí el fragmento oficial que da Ads Manager, usando PUBLIC_OPENAI_PIXEL_ID como identificador.
  // Este bloque solo se ejecuta si el visitante aceptó las cookies de publicidad.
  window.dispatchEvent(new CustomEvent('fv:openai-pixel', { detail: { id: PUBLIC_OPENAI_PIXEL_ID } }));
}

function apply(consent: Consent | null) {
  if (!consent) return;
  applyGoogle(consent);
  applyOpenAi(consent);
}

apply(readConsent());
window.addEventListener(CONSENT_EVENT, (event) => apply((event as CustomEvent<Consent>).detail));
