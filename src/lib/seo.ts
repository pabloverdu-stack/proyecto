import { site } from '../config/site';
import type { FaqItem } from '../content/faq';
import { productUrl, unitsLabel, type Product } from './products';

const abs = (path: string, base: URL) => new URL(path, base).href;

export const organizationLd = (base: URL) => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: site.name,
  url: abs('/', base),
  email: site.email,
  logo: abs('/apple-touch-icon.png', base),
});

export const websiteLd = (base: URL) => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: site.name,
  url: abs('/', base),
  inLanguage: 'es-ES',
});

export const productLd = (product: Product, base: URL) => {
  const url = abs(productUrl(product), base);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.data.name,
    description: product.data.seo.description,
    brand: { '@type': 'Brand', name: site.name },
    url,
    // PROVISIONAL: sustituir por fotos reales del producto en cuanto existan.
    image: abs('/og.png', base),
    offers: product.data.packs.map((pack) => ({
      '@type': 'Offer',
      name: unitsLabel(product, pack.units),
      price: (pack.priceCents / 100).toFixed(2),
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      url: `${url}?pack=${pack.id}`,
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'EUR' },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'ES' },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
          transitTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 2, unitCode: 'DAY' },
        },
      },
    })),
  };
};

export const faqLd = (items: FaqItem[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
});

export const breadcrumbLd = (base: URL, trail: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: trail.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: abs(item.path, base),
  })),
});
