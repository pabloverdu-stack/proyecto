// Compartido por el navegador y el servidor.
export const ATTRIBUTION_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'gbraid',
  'wbraid',
  'oppref',
] as const;

export type AttributionKey = (typeof ATTRIBUTION_KEYS)[number];
