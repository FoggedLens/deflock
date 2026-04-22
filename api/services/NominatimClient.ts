
import { createCache, Cache } from 'cache-manager';
import { Type, Static } from '@sinclair/typebox';
const { DiskStore } = require('cache-manager-fs-hash');

export const NominatimResultSchema = Type.Object({
  addresstype: Type.String(),
  boundingbox: Type.Tuple([Type.String(), Type.String(), Type.String(), Type.String()]),
  class: Type.String(),
  display_name: Type.String(),
  geojson: Type.Optional(Type.Object({
    coordinates: Type.Any(),
    type: Type.String(),
  })),
  importance: Type.Number(),
  lat: Type.String(),
  licence: Type.String(),
  lon: Type.String(),
  name: Type.String(),
  osm_id: Type.Optional(Type.Number()),
  osm_type: Type.Optional(Type.String()),
  place_id: Type.Optional(Type.Number()),
  place_rank: Type.Number(),
  type: Type.String(),
});

export type NominatimResult = Static<typeof NominatimResultSchema>;

const cache: Cache = createCache({
  stores: [new DiskStore({
    path: '/tmp/nominatim-cache',
    ttl: 3600 * 24, // 24 hours
    maxsize: 1000 * 1000 * 100, // 100MB
    subdirs: true,
    zip: false,
  })]
});

export class NominatimClient {
  baseUrl = 'https://nominatim.openstreetmap.org/search';

  async geocodePhrase(query: string, includeGeoJson: boolean = false): Promise<NominatimResult[]> {
    const cacheKey = `geocode:${query}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return cached as NominatimResult[];
    }
    const geojsonParam = includeGeoJson ? '&polygon_geojson=1' : '';
    const url = `${this.baseUrl}?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=8&countrycodes=us&dedupe=1${geojsonParam}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'DeFlock/1.2',
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to geocode phrase: ${response.status}`);
    }
    const json = await response.json();
    await cache.set(cacheKey, json);
    return json;
  }

  async geocodeSingleResult(query: string): Promise<NominatimResult | null> {
    const results = await this.geocodePhrase(query, true);
    
    if (!results.length) return null;

    const cityStatePattern = /(.+),\s*(\w{2})/;
    const postalCodePattern = /\d{5}/;

    if (cityStatePattern.test(query)) {
      const cityStateResults = results.filter((result: NominatimResult) => 
        ["city", "town", "village", "hamlet", "suburb", "quarter", "neighbourhood", "borough"].includes(result.addresstype)
      );
      if (cityStateResults.length) {
        return cityStateResults[0];
      }
    }

    if (postalCodePattern.test(query)) {
      const postalCodeResults = results.filter((result: NominatimResult) => result.addresstype === "postcode");
      if (postalCodeResults.length) {
        return postalCodeResults[0];
      }
    }

    return results[0];
  }
}
