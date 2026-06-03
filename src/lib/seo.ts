/**
 * JSON-LD builders. Each returns a plain object that the page renders
 * inside `<script type="application/ld+json">`. Centralized so every
 * page emits the same shape Google validates against.
 */

import { SITE_URL, SITE_NAME } from './site';
export { SITE_URL, SITE_NAME };

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url.startsWith('http') ? it.url : `${SITE_URL}${it.url}`,
    })),
  };
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    name: SITE_NAME,
    alternateName: 'MAP',
    url: SITE_URL,
    logo: `${SITE_URL}/icon`,
    image: `${SITE_URL}/apple-icon`,
    description:
      'Custom location art prints — airports, city skylines, marathon routes, golf courses, stadiums, and F1 circuits. Personalized and shipped worldwide.',
    sameAs: [
      'https://www.etsy.com/shop/MilesAwayPrintsLLC',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'milesawayprintsllc@gmail.com',
      areaServed: 'Worldwide',
      availableLanguage: ['English'],
    },
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/shop?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

interface ProductOffer {
  name: string;
  priceCents: number;
}

/**
 * Offer.priceValidUntil — Google requires a forward-looking date for
 * Merchant rich results. We anchor to Dec 31 of next year so the same
 * value stays valid as the year ticks over.
 */
function priceValidUntil(): string {
  const y = new Date().getUTCFullYear() + 1;
  return `${y}-12-31`;
}

interface AggregateRating {
  ratingValue: number;
  reviewCount: number;
  bestRating?: number;
  worstRating?: number;
}

export interface ProductReview {
  author: string;
  rating: number;
  body: string;
  datePublished?: string;
}

interface ProductJsonLdArgs {
  name: string;
  description: string;
  imageUrl?: string;
  url: string;
  category?: string;
  offers: ProductOffer[];
  aggregateRating?: AggregateRating | null;
  reviews?: ProductReview[];
}

/**
 * Shared Offer-level fields that Google Merchant requires for rich
 * "Merchant listings" experiences. Centralized so all offers on a
 * product get identical values.
 */
const OFFER_SHIPPING_DETAILS = {
  '@type': 'OfferShippingDetails' as const,
  shippingRate: {
    '@type': 'MonetaryAmount' as const,
    value: 7.0,
    currency: 'USD',
  },
  shippingDestination: {
    '@type': 'DefinedRegion' as const,
    addressCountry: 'US',
  },
  deliveryTime: {
    '@type': 'ShippingDeliveryTime' as const,
    handlingTime: {
      '@type': 'QuantitativeValue' as const,
      minValue: 3,
      maxValue: 5,
      unitCode: 'DAY' as const,
    },
    transitTime: {
      '@type': 'QuantitativeValue' as const,
      minValue: 3,
      maxValue: 5,
      unitCode: 'DAY' as const,
    },
  },
};

const MERCHANT_RETURN_POLICY = {
  '@type': 'MerchantReturnPolicy' as const,
  applicableCountry: 'US',
  // Made-to-order — no returns. Damaged or misprinted items are replaced
  // free within 14 days (handled outside the schema since Google's schema
  // doesn't model "no returns + damage replacement" as a single value).
  returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
  merchantReturnLink: `${SITE_URL}/returns`,
};

export function productJsonLd({
  name,
  description,
  imageUrl,
  url,
  category,
  offers,
  aggregateRating,
  reviews,
}: ProductJsonLdArgs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    ...(imageUrl ? { image: imageUrl } : {}),
    url: url.startsWith('http') ? url : `${SITE_URL}${url}`,
    brand: { '@type': 'Brand', name: SITE_NAME },
    ...(category ? { category } : {}),
    ...(aggregateRating
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: aggregateRating.ratingValue.toFixed(1),
            reviewCount: aggregateRating.reviewCount,
            bestRating: aggregateRating.bestRating ?? 5,
            worstRating: aggregateRating.worstRating ?? 1,
          },
        }
      : {}),
    ...(reviews && reviews.length > 0
      ? {
          review: reviews.map((r) => ({
            '@type': 'Review',
            reviewRating: {
              '@type': 'Rating',
              ratingValue: r.rating,
              bestRating: 5,
              worstRating: 1,
            },
            author: { '@type': 'Person', name: r.author },
            reviewBody: r.body,
            ...(r.datePublished ? { datePublished: r.datePublished } : {}),
          })),
        }
      : {}),
    offers: offers.map((o) => ({
      '@type': 'Offer',
      name: o.name,
      price: (o.priceCents / 100).toFixed(2),
      priceCurrency: 'USD',
      priceValidUntil: priceValidUntil(),
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      url: url.startsWith('http') ? url : `${SITE_URL}${url}`,
      shippingDetails: OFFER_SHIPPING_DETAILS,
      hasMerchantReturnPolicy: MERCHANT_RETURN_POLICY,
    })),
  };
}

interface FaqQA {
  q: string;
  a: string;
}

export function faqPageJsonLd(items: FaqQA[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: it.a,
      },
    })),
  };
}

interface CollectionItem {
  name: string;
  url: string;
  imageUrl?: string;
}

export function collectionPageJsonLd(
  name: string,
  description: string,
  url: string,
  items: CollectionItem[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url: url.startsWith('http') ? url : `${SITE_URL}${url}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: items.map((it, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: it.url.startsWith('http') ? it.url : `${SITE_URL}${it.url}`,
        name: it.name,
        ...(it.imageUrl ? { image: it.imageUrl } : {}),
      })),
    },
  };
}

/** Convenience wrapper that returns the props to spread on a `<script>` tag. */
export function jsonLdScript(obj: object) {
  return {
    type: 'application/ld+json' as const,
    dangerouslySetInnerHTML: { __html: JSON.stringify(obj) },
  };
}
