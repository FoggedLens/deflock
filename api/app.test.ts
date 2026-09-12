import { describe, it, expect, afterEach, mock } from 'bun:test';
import type { FastifyInstance } from 'fastify';
import { buildApp } from './app';

describe('DeFlock API routes', () => {
  let app: FastifyInstance;
  const originalFetch = global.fetch;

  const setup = async (): Promise<FastifyInstance> => {
    app = await buildApp();
    return app;
  };

  afterEach(async () => {
    global.fetch = originalFetch;
    await app?.close();
  });

  it('responds to /healthcheck with 200', async () => {
    await setup();
    const res = await app.inject({ method: 'HEAD', url: '/healthcheck' });
    expect(res.statusCode).toBe(200);
  });

  it('returns 404 for unknown routes', async () => {
    await setup();
    const res = await app.inject({ method: 'GET', url: '/does-not-exist' });
    expect(res.statusCode).toBe(404);
  });

  it('returns 400 with a useful message when the query param is missing', async () => {
    await setup();
    const res = await app.inject({ method: 'GET', url: '/geocode' });
    expect(res.statusCode).toBe(400);
    const body = res.json();
    // Client errors must not be reported as "Internal Server Error"
    expect(body.error).not.toBe('Internal Server Error');
    expect(body.error).toContain('query');
  });

  it('serves ZIP codes from the local dataset without hitting Nominatim', async () => {
    await setup();
    let nominatimCalled = false;
    global.fetch = mock(async () => {
      nominatimCalled = true;
      return new Response('{}', { status: 500 });
    }) as unknown as typeof fetch;

    const res = await app.inject({ method: 'GET', url: '/geocode?query=90210' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.addresstype).toBe('postcode');
    expect(body.name).toBe('90210');
    expect(nominatimCalled).toBe(false);
  });

  it('returns an array from /geocode/multi for a ZIP code', async () => {
    await setup();
    const res = await app.inject({ method: 'GET', url: '/geocode/multi?query=10001' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body[0]).toMatchObject({ addresstype: 'postcode', name: '10001' });
  });

  it('reports upstream Nominatim failures as 500 Internal Server Error', async () => {
    await setup();
    const uniqueQuery = `not-a-real-place-${Date.now()}`;
    global.fetch = mock(async () => new Response('', { status: 503 })) as unknown as typeof fetch;

    const res = await app.inject({ method: 'GET', url: `/geocode?query=${encodeURIComponent(uniqueQuery)}` });
    expect(res.statusCode).toBe(500);
    const body = res.json();
    expect(body.error).toBe('Internal Server Error');
  });

  it('surfaces a useful message for a thrown 4xx error', async () => {
    const server = await setup();
    server.get('/boom-4xx', async () => {
      const err = new Error('You cannot do that');
      throw Object.assign(err, { statusCode: 400 });
    });

    const res = await app.inject({ method: 'GET', url: '/boom-4xx' });
    expect(res.statusCode).toBe(400);
    expect(res.json()).toEqual({ error: 'You cannot do that' });
  });

  it('keeps 5xx responses generic to avoid leaking internals', async () => {
    const server = await setup();
    server.get('/boom-5xx', async () => {
      throw new Error('database password is hush-hush');
    });

    const res = await app.inject({ method: 'GET', url: '/boom-5xx' });
    expect(res.statusCode).toBe(500);
    expect(res.json()).toEqual({ error: 'Internal Server Error' });
  });
});
