
import { createCache, Cache } from 'cache-manager';
import { Type, Static } from '@sinclair/typebox';
import { type Span, SpanKind, SpanStatusCode, context, trace } from '@opentelemetry/api';
import { tracer, otelLogger, SeverityNumber } from '../telemetry';
import { isZipCode, lookupZipCode } from './ZipCodeService';
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
  address: Type.Optional(Type.Object({
    house_number: Type.Optional(Type.String()),
    road: Type.Optional(Type.String()),
    neighbourhood: Type.Optional(Type.String()),
    suburb: Type.Optional(Type.String()),
    city: Type.Optional(Type.String()),
    town: Type.Optional(Type.String()),
    village: Type.Optional(Type.String()),
    county: Type.Optional(Type.String()),
    state: Type.Optional(Type.String()),
    postcode: Type.Optional(Type.String()),
    country: Type.Optional(Type.String()),
    country_code: Type.Optional(Type.String()),
  })),
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

  async geocodePhrase(query: string, includeGeoJson: boolean = false, parentSpan?: Span): Promise<NominatimResult[]> {
    // Short-circuit for ZIP codes — serve from local data, no Nominatim call needed
    if (isZipCode(query)) {
      const zipResult = lookupZipCode(query.trim());
      return zipResult ? [zipResult] : [];
    }

    const cacheKey = `geocode:${query}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return cached as NominatimResult[];
    }
    const geojsonParam = includeGeoJson ? '&polygon_geojson=1' : '';
    const url = `${this.baseUrl}?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=8&countrycodes=us&dedupe=1${geojsonParam}`;
    const ctx = parentSpan ? trace.setSpan(context.active(), parentSpan) : context.active();
    const span = tracer.startSpan('nominatim.geocode', {
      kind: SpanKind.CLIENT,
      attributes: { 'peer.service': 'nominatim', 'http.request.method': 'GET' },
    }, ctx);
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'DeFlock/1.2' },
      });
      span.setAttribute('http.response.status_code', response.status);
      if (!response.ok) {
        const body = await response.text();
        otelLogger.emit({
          severityNumber: SeverityNumber.ERROR,
          severityText: 'ERROR',
          body: `Nominatim error: ${response.status}`,
          attributes: {
            'nominatim.status_code': response.status,
            'nominatim.response_body': body,
            'http.url': url,
          },
          context: trace.setSpan(context.active(), span),
        });
        throw new Error(`Failed to geocode phrase: ${response.status}`);
      }
      const json = await response.json();
      await cache.set(cacheKey, json);
      return json;
    } catch (err) {
      span.recordException(err as Error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: (err as Error).message });
      span.setAttribute('error.type', 'upstream_error');
      throw err;
    } finally {
      span.end();
    }
  }

  async geocodeSingleResult(query: string, parentSpan?: Span): Promise<NominatimResult | null> {
    const results = await this.geocodePhrase(query, true, parentSpan);
    
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
