import CheckoutClient from './CheckoutClient';
import { getVisitorGeo } from '@/lib/geo';
import { countryName, findCountry } from '@/data/countries';

export const dynamic = 'force-dynamic';

export default function CheckoutPage() {
  const geo = getVisitorGeo();
  // Only pre-fill country if we accept it; otherwise default to US
  const accepted = findCountry(geo.country) ? geo.country!.toUpperCase() : 'US';
  return (
    <CheckoutClient
      initialCountry={accepted}
      initialState={geo.region ?? ''}
      initialZip={geo.postalCode ?? ''}
      navbarCountry={countryName(geo.country)}
    />
  );
}
