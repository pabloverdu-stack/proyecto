// Datos de la marca en un solo sitio. Cambiar el nombre aquí lo cambia en toda la web.
export const site = {
  name: 'Ficha Viva',
  description: 'Tarjetas NFC para que los negocios locales consigan más reseñas en Google.',
  // PROVISIONAL: el dominio y el email no existen hasta que se compre el dominio.
  email: 'hola@fichaviva.es',
  locale: 'es-ES',
  shipping: {
    zone: 'península',
    time: '48 h',
    excluded: 'Baleares, Canarias, Ceuta ni Melilla',
    // Prefijos de código postal fuera de la zona de envío.
    excludedPostalPrefixes: ['07', '35', '38', '51', '52'],
  },
  disclaimer: 'no está afiliada ni patrocinada por Google. Google es una marca de Google LLC.',
} as const;

export const formatEuros = (cents: number) =>
  new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
