import { describe, it, expect, afterEach, mock } from 'bun:test';
import { NominatimClient } from './NominatimClient';

const sampleReverse = {
  osm_type: 'relation',
  osm_id: 1411339,
  lat: '39.7392364',
  lon: '-104.9848623',
  addresstype: 'city',
  name: 'Denver',
  display_name: 'Denver, Colorado, United States',
  address: { city: 'Denver', state: 'Colorado', country_code: 'us' },
};

describe('NominatimClient.reverseGeocode', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  // The shared disk cache at /tmp/nominatim-cache outlives test runs, so each
  // test uses coordinates it hasn't cached before
  const freshLat = () => 39 + Math.random();

  it('rounds coordinates to two decimals before they reach Nominatim', async () => {
    let capturedUrl = '';
    global.fetch = mock(async (url: string) => {
      capturedUrl = url;
      return new Response(JSON.stringify(sampleReverse));
    }) as unknown as typeof fetch;

    const client = new NominatimClient();
    const lat = freshLat();
    const result = await client.reverseGeocode(lat, -104.98486229);

    expect(capturedUrl).toContain(`lat=${lat.toFixed(2)}`);
    expect(capturedUrl).toContain('lon=-104.98');
    expect(capturedUrl).toContain('zoom=10');
    expect(result).toEqual(sampleReverse);
  });

  it('serves repeat lookups near the same point from the cache', async () => {
    let upstreamCalls = 0;
    global.fetch = mock(async () => {
      upstreamCalls++;
      return new Response(JSON.stringify(sampleReverse));
    }) as unknown as typeof fetch;

    const client = new NominatimClient();
    // Snap to two decimals so the small offsets below can't straddle a rounding boundary
    const lat = Number(freshLat().toFixed(2));
    await client.reverseGeocode(lat + 0.001, -104.98);
    // A second point within rounding distance maps to the same cache entry
    await client.reverseGeocode(lat + 0.004, -104.98);

    expect(upstreamCalls).toBe(1);
  });

  it('returns null when Nominatim finds nothing at the point', async () => {
    global.fetch = mock(async () =>
      new Response(JSON.stringify({ error: 'Unable to geocode' }))
    ) as unknown as typeof fetch;

    const client = new NominatimClient();
    const result = await client.reverseGeocode(freshLat(), -140.5);

    expect(result).toBeNull();
  });
});
