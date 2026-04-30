import Navbar from './Navbar';
import { getVisitorGeo } from '@/lib/geo';
import { countryName } from '@/data/countries';

/**
 * Server-side wrapper that reads the visitor's country from Vercel's
 * geolocation headers and passes it down to the (client) Navbar.
 * Use this anywhere you'd previously have rendered <Navbar /> directly
 * inside a server component.
 */
export default function NavbarShell() {
  const geo = getVisitorGeo();
  return <Navbar defaultCountry={countryName(geo.country)} />;
}
