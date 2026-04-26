import { readFileSync } from 'fs';
import { join } from 'path';
import { NominatimResult } from './NominatimClient';

// [lat, lon, city, stateAbbr]
type ZipEntry = [number, number, string, string];
type ZipData = Record<string, ZipEntry>;

// Load data synchronously at module init — 1.7MB uncompressed, fast
const zipData: ZipData = JSON.parse(
  readFileSync(join(__dirname, '../data/zipcodes-us.json'), 'utf-8')
);

const ZIP_PATTERN = /^\d{5}$/;

export function isZipCode(query: string): boolean {
  return ZIP_PATTERN.test(query.trim());
}

/**
 * Look up a 5-digit US ZIP code and return a Nominatim-compatible result,
 * or null if the ZIP is not found in the local dataset.
 */
export function lookupZipCode(zip: string): NominatimResult | null {
  const normalized = zip.trim().slice(0, 5);
  const entry = zipData[normalized];

  if (!entry) return null;

  const [lat, lon, city, state] = entry;
  const latStr = String(lat);
  const lonStr = String(lon);

  return {
    addresstype: 'postcode',
    boundingbox: [
      String(lat - 0.1),
      String(lat + 0.1),
      String(lon - 0.1),
      String(lon + 0.1),
    ],
    class: 'place',
    display_name: `${normalized}, ${city}, ${state}, United States`,
    importance: 0.3,
    lat: latStr,
    licence: 'Local ZIP Code Data',
    lon: lonStr,
    name: normalized,
    address: {
      postcode: normalized,
      city,
      state,
      country: 'United States',
      country_code: 'us',
    },
    place_rank: 11,
    type: 'postcode',
  };
}
