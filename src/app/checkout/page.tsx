import CheckoutClient from './CheckoutClient';
import { getVisitorGeo } from '@/lib/geo';
import { countryName, findCountry } from '@/data/countries';

export const dynamic = 'force-dynamic';

export default function CheckoutPage() {
  const geo = getVisitorGeo();
  const accepted = findCountry(geo.country) ? geo.country!.toUpperCase() : 'US';
  return (
    <CheckoutClient
      initialCountry={accepted}
      navbarCountry={countryName(geo.country)}
    />
  );
}
