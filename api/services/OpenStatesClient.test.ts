import { describe, it, expect, afterEach, mock } from 'bun:test';
import { OpenStatesClient, toLegislator } from './OpenStatesClient';

const samplePerson = {
  name: 'Jane Example',
  party: 'Independent',
  current_role: { title: 'Senator', org_classification: 'upper', district: 31 },
  image: 'https://example.com/jane.jpg',
  email: 'jane.example@state.example.gov',
  openstates_url: 'https://openstates.org/person/jane-example',
  offices: [
    { classification: 'district', voice: '555-0100' },
    { classification: 'capitol', voice: '555-0199' },
  ],
};

describe('toLegislator', () => {
  it('maps the Open States person shape to the slim response shape', () => {
    expect(toLegislator(samplePerson)).toEqual({
      name: 'Jane Example',
      party: 'Independent',
      chamber: 'upper',
      district: '31',
      image: 'https://example.com/jane.jpg',
      email: 'jane.example@state.example.gov',
      phone: '555-0199',
      openstatesUrl: 'https://openstates.org/person/jane-example',
    });
  });

  it('prefers the capitol office phone but falls back to any office with one', () => {
    const districtOnly = { ...samplePerson, offices: [{ classification: 'district', voice: '555-0100' }] };
    expect(toLegislator(districtOnly).phone).toBe('555-0100');
  });

  it('tolerates people with no role, image, email, or offices', () => {
    expect(toLegislator({ name: 'Mystery Person' })).toEqual({
      name: 'Mystery Person',
      party: '',
      chamber: '',
      district: '',
      image: '',
      email: '',
      phone: '',
      openstatesUrl: '',
    });
  });
});

describe('OpenStatesClient.legislatorsAtPoint', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('requests people.geo with the coordinates and offices included', async () => {
    let capturedUrl = '';
    global.fetch = mock(async (url: string) => {
      capturedUrl = url;
      return new Response(JSON.stringify({ results: [samplePerson] }));
    }) as unknown as typeof fetch;

    const client = new OpenStatesClient();
    // Coordinates vary per test run below the cache's precision, so use a
    // fresh point to avoid the shared disk cache at /tmp/openstates-cache
    const lat = 10 + Math.random();
    const legislators = await client.legislatorsAtPoint(lat, -100);

    expect(capturedUrl).toContain('https://v3.openstates.org/people.geo');
    expect(capturedUrl).toContain(`lat=${lat}`);
    expect(capturedUrl).toContain('lng=-100');
    expect(capturedUrl).toContain('include=offices');
    expect(legislators).toEqual([toLegislator(samplePerson)]);
  });

  it('serves repeat lookups for the same point from the cache', async () => {
    let upstreamCalls = 0;
    global.fetch = mock(async () => {
      upstreamCalls++;
      return new Response(JSON.stringify({ results: [samplePerson] }));
    }) as unknown as typeof fetch;

    const client = new OpenStatesClient();
    const lat = 20 + Math.random();
    await client.legislatorsAtPoint(lat, -100);
    await client.legislatorsAtPoint(lat, -100);

    expect(upstreamCalls).toBe(1);
  });

  it('throws when Open States responds with a non-OK status', async () => {
    global.fetch = mock(async () => new Response('', { status: 401 })) as unknown as typeof fetch;

    const client = new OpenStatesClient();
    const lat = 30 + Math.random();

    await expect(client.legislatorsAtPoint(lat, -100)).rejects.toThrow('Failed to fetch legislators: 401');
  });
});
