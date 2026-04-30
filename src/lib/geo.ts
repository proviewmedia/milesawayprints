import { headers } from 'next/headers';

export interface VisitorGeo {
  country: string | null;
  region: string | null;
  postalCode: string | null;
  city: string | null;
}

/** Reads Vercel's geolocation headers server-side. Free, no API call.
 *  Returns nulls in dev / on platforms that don't provide them. */
export function getVisitorGeo(): VisitorGeo {
  const h = headers();
  return {
    country: h.get('x-vercel-ip-country') || null,
    region: h.get('x-vercel-ip-country-region') || null,
    postalCode: h.get('x-vercel-ip-postal-code') || null,
    city: h.get('x-vercel-ip-city') || null,
  };
}
