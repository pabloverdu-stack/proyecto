// @ts-check
import { defineConfig, envField } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

// Dominio público. Cámbialo en .env (SITE_URL) cuando compres el dominio definitivo.
const site = process.env.SITE_URL || 'https://fichaviva.es';

export default defineConfig({
  site,
  output: 'static',
  adapter: cloudflare({ imageService: 'compile' }),
  session: false,
  devToolbar: { enabled: false },
  compressHTML: true,
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'always' },
  integrations: [
    sitemap({
      filter: (page) => !/\/(pedido|t|api)(\/|$)/.test(new URL(page).pathname),
    }),
  ],
  env: {
    schema: {
      STRIPE_SECRET_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      STRIPE_WEBHOOK_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
      SUPABASE_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
      SUPABASE_SERVICE_ROLE_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      GOOGLE_PLACES_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      EMAIL_FROM: envField.string({ context: 'server', access: 'secret', optional: true }),
      OWNER_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),
      N8N_WEBHOOK_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
      PUBLIC_GA4_ID: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_GOOGLE_ADS_ID: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_GOOGLE_ADS_PURCHASE_LABEL: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_OPENAI_PIXEL_ID: envField.string({ context: 'client', access: 'public', optional: true }),
    },
  },
});
