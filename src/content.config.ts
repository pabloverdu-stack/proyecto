import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Cada producto es un JSON en src/content/products. El nombre del archivo es su URL.
const products = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/products' }),
  schema: z.object({
    name: z.string(),
    listName: z.string(),
    unit: z.object({ singular: z.string(), plural: z.string(), gender: z.enum(['f', 'm']) }),
    order: z.number(),
    // El producto destacado vive en la portada (/).
    featured: z.boolean().default(false),
    status: z.enum(['active', 'draft']).default('active'),
    productType: z.enum(['google_review']).default('google_review'),
    visual: z.enum(['card', 'stand']),
    headline: z.string(),
    subheadline: z.string(),
    seo: z.object({
      title: z.string().max(47),
      description: z.string().max(155),
    }),
    packs: z
      .array(
        z.object({
          id: z.string(),
          units: z.number().int().positive(),
          priceCents: z.number().int().positive(),
          stripeLookupKey: z.string(),
          recommended: z.boolean().default(false),
          note: z.string().optional(),
        }),
      )
      .min(1),
    // Precio pendiente de confirmar por el propietario: se avisa en desarrollo.
    provisionalPrice: z.boolean().default(false),
    includes: z.array(z.string()),
    specs: z.array(z.object({ label: z.string(), value: z.string() })),
    crossSell: z.object({ slug: z.string(), text: z.string(), title: z.string(), body: z.string() }).optional(),
  }),
});

export const collections = { products };
