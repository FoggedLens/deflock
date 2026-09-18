import { describe, it, expect, afterEach, mock } from 'bun:test';
import { NominatimClient } from './NominatimClient';

// The disk cache lives at a fixed path and survives between runs, so each test
// uses a query it has never cached before.
function uniqueQuery(label: string): string {
  return `${label} ${Date.now()} ${Math.random()}`;
}

function stubFetch(urls: string[]) {
  global.fetch = mock(async (url: string) => {
    urls.push(String(url));
    const result: Record<string, unknown> = {
      addresstype: 'city',
      boundingbox: ['1', '2', '3', '4'],
      class: 'place',
      display_name: 'Springfield, IL, United States',
      importance: 0.5,
      lat: '39.8',
      licence: 'test',
      lon: '-89.6',
      name: 'Springfield',
      place_rank: 16,
      type: 'city',
    };
    if (String(url).includes('polygon_geojson=1')) {
      result.geojson = { type: 'Polygon', coordinates: [[[0, 0]]] };
    }
    return new Response(JSON.stringify([result]));
  }) as unknown as typeof fetch;
}

describe('NominatimClient.geocodePhrase', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('does not serve a cached geojson-free result to a caller that asked for geojson', async () => {
    const urls: string[] = [];
    stubFetch(urls);
    const query = uniqueQuery('Springfield');
    const client = new NominatimClient();

    await client.geocodePhrase(query, false);
    const withGeoJson = await client.geocodePhrase(query, true);

    expect(urls.length).toBe(2);
    expect(urls[1]).toContain('polygon_geojson=1');
    expect(withGeoJson[0]?.geojson).toBeDefined();
  });

  it('still serves repeat requests for the same variant from the cache', async () => {
    const urls: string[] = [];
    stubFetch(urls);
    const query = uniqueQuery('Springfield');
    const client = new NominatimClient();

    await client.geocodePhrase(query, true);
    await client.geocodePhrase(query, true);

    expect(urls.length).toBe(1);
  });
});
