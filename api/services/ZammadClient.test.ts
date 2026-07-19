import { describe, it, expect, afterEach, mock } from 'bun:test';
import { ZammadClient } from './ZammadClient';

describe('ZammadClient.createTicket', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('creates a customer (when none exists) then the ticket, and returns its id', async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    global.fetch = mock(async (url: string, init?: RequestInit) => {
      calls.push({ url, init });
      if (url.includes('/users/search')) {
        return new Response(JSON.stringify([]));
      }
      if (url.includes('/users') && init?.method === 'POST') {
        return new Response(JSON.stringify({ id: 42 }));
      }
      if (url.includes('/tickets') && init?.method === 'POST') {
        return new Response(JSON.stringify({ id: 99 }));
      }
      throw new Error(`Unexpected fetch: ${url}`);
    }) as unknown as typeof fetch;

    const client = new ZammadClient();
    const result = await client.createTicket({
      name: 'Jane Doe',
      email: 'jane@example.com',
      topic: 'media',
      subject: 'Story inquiry',
      message: 'Hello',
    });

    expect(result).toEqual({ id: 99 });

    const ticketCall = calls.find(c => c.url.includes('/tickets') && c.init?.method === 'POST');
    const body = JSON.parse(ticketCall!.init!.body as string);
    expect(body.priority).toBe('2 normal');
    expect(body.customer_id).toBe(42);
  });

  it('throws a descriptive error when ticket creation fails', async () => {
    global.fetch = mock(async (url: string) => {
      if (url.includes('/users/search')) return new Response(JSON.stringify([{ id: 1, email: 'jane@example.com' }]));
      if (url.includes('/tickets')) return new Response('boom', { status: 500 });
      throw new Error(`Unexpected fetch: ${url}`);
    }) as unknown as typeof fetch;

    const client = new ZammadClient();
    await expect(client.createTicket({
      name: 'Jane Doe',
      email: 'jane@example.com',
      topic: 'app-support',
      subject: 'Bug',
      message: 'It broke',
    })).rejects.toThrow('Zammad ticket creation failed: 500 boom');
  });
});

describe('ZammadClient.addTag', () => {
  const originalFetch = global.fetch;
  afterEach(() => { global.fetch = originalFetch; });

  it('POSTs to /api/v1/tags/add with the tag under "item" (Zammad ignores "tag" and leaves it nil)', async () => {
    let captured: { url: string; body: any } | undefined;
    global.fetch = mock(async (url: string, init?: RequestInit) => {
      captured = { url, body: JSON.parse(init!.body as string) };
      return new Response('{}');
    }) as unknown as typeof fetch;

    const client = new ZammadClient();
    await client.addTag(99, 'ai-screened');

    expect(captured!.url).toContain('/api/v1/tags/add');
    expect(captured!.body).toEqual({ item: 'ai-screened', object: 'Ticket', o_id: 99 });
  });

  it('throws a descriptive error on failure', async () => {
    global.fetch = mock(async () => new Response('nope', { status: 422 })) as unknown as typeof fetch;
    const client = new ZammadClient();
    await expect(client.addTag(99, 'ai-screened')).rejects.toThrow('Zammad tag creation failed for tag "ai-screened" on ticket 99: 422 nope');
  });
});

describe('ZammadClient.addInternalNote', () => {
  const originalFetch = global.fetch;
  afterEach(() => { global.fetch = originalFetch; });

  it('POSTs to /api/v1/ticket_articles as an internal note', async () => {
    let captured: { url: string; body: any } | undefined;
    global.fetch = mock(async (url: string, init?: RequestInit) => {
      captured = { url, body: JSON.parse(init!.body as string) };
      return new Response('{}');
    }) as unknown as typeof fetch;

    const client = new ZammadClient();
    await client.addInternalNote(99, 'note body');

    expect(captured!.url).toContain('/api/v1/ticket_articles');
    expect(captured!.body).toEqual({ ticket_id: 99, body: 'note body', type: 'note', internal: true });
  });

  it('throws a descriptive error on failure', async () => {
    global.fetch = mock(async () => new Response('nope', { status: 500 })) as unknown as typeof fetch;
    const client = new ZammadClient();
    await expect(client.addInternalNote(99, 'note body')).rejects.toThrow('Zammad internal note creation failed: 500 nope');
  });
});

describe('ZammadClient.setTicketFields', () => {
  const originalFetch = global.fetch;
  afterEach(() => { global.fetch = originalFetch; });

  it('PUTs to /api/v1/tickets/{id} with the given fields, whatever they are', async () => {
    let captured: { url: string; method?: string; body: any } | undefined;
    global.fetch = mock(async (url: string, init?: RequestInit) => {
      captured = { url, method: init?.method, body: JSON.parse(init!.body as string) };
      return new Response('{}');
    }) as unknown as typeof fetch;

    const client = new ZammadClient();
    await client.setTicketFields(99, {
      ai_category: 'media_press',
      priority: '3 high',
      state: 'pending close',
      pending_time: '2026-07-16T21:00:00.000Z',
    });

    expect(captured!.url).toContain('/api/v1/tickets/99');
    expect(captured!.method).toBe('PUT');
    expect(captured!.body).toEqual({
      ai_category: 'media_press',
      priority: '3 high',
      state: 'pending close',
      pending_time: '2026-07-16T21:00:00.000Z',
    });
  });

  it('throws a descriptive error on failure', async () => {
    global.fetch = mock(async () => new Response('nope', { status: 500 })) as unknown as typeof fetch;
    const client = new ZammadClient();
    await expect(client.setTicketFields(99, { priority: '3 high' })).rejects.toThrow('Zammad ticket fields update failed: 500 nope');
  });
});

describe('ZammadClient.upsertSharedDraft', () => {
  const originalFetch = global.fetch;
  afterEach(() => { global.fetch = originalFetch; });

  it('PUTs to /api/v1/tickets/{id}/shared_draft with the body nested under new_article (Zammad strips top-level keys)', async () => {
    let captured: { url: string; method?: string; body: any } | undefined;
    global.fetch = mock(async (url: string, init?: RequestInit) => {
      captured = { url, method: init?.method, body: JSON.parse(init!.body as string) };
      return new Response('{}');
    }) as unknown as typeof fetch;

    const client = new ZammadClient();
    await client.upsertSharedDraft(99, 'Draft reply text', { to: 'jane@example.com', cc: 'other@example.com' });

    expect(captured!.url).toContain('/api/v1/tickets/99/shared_draft');
    expect(captured!.method).toBe('PUT');
    expect(captured!.body).toEqual({
      new_article: { body: 'Draft reply text', type: 'email', internal: false, to: 'jane@example.com', cc: 'other@example.com' },
      ticket_attributes: {},
    });
  });

  it('defaults cc to an empty string when not provided', async () => {
    let captured: { body: any } | undefined;
    global.fetch = mock(async (_url: string, init?: RequestInit) => {
      captured = { body: JSON.parse(init!.body as string) };
      return new Response('{}');
    }) as unknown as typeof fetch;

    const client = new ZammadClient();
    await client.upsertSharedDraft(99, 'Draft reply text', { to: 'jane@example.com' });

    expect(captured!.body.new_article.cc).toBe('');
  });

  it('throws a descriptive error on failure', async () => {
    global.fetch = mock(async () => new Response('nope', { status: 422 })) as unknown as typeof fetch;
    const client = new ZammadClient();
    await expect(client.upsertSharedDraft(99, 'text', { to: 'jane@example.com' })).rejects.toThrow('Zammad shared draft update failed: 422 nope');
  });
});

describe('ZammadClient.getTicket', () => {
  const originalFetch = global.fetch;
  afterEach(() => { global.fetch = originalFetch; });

  it('GETs /api/v1/tickets/{id} and returns the parsed ticket', async () => {
    global.fetch = mock(async () =>
      new Response(JSON.stringify({ id: 99, title: 'Story inquiry', group: 'Media', customer_id: 42 }))
    ) as unknown as typeof fetch;

    const client = new ZammadClient();
    const ticket = await client.getTicket(99);

    expect(ticket).toEqual({ id: 99, title: 'Story inquiry', group: 'Media', customer_id: 42 });
  });

  it('throws a descriptive error on failure', async () => {
    global.fetch = mock(async () => new Response('nope', { status: 404 })) as unknown as typeof fetch;
    const client = new ZammadClient();
    await expect(client.getTicket(99)).rejects.toThrow('Zammad ticket fetch failed: 404 nope');
  });
});

describe('ZammadClient.getTicketArticles', () => {
  const originalFetch = global.fetch;
  afterEach(() => { global.fetch = originalFetch; });

  it('GETs /api/v1/ticket_articles/by_ticket/{id} and returns the parsed articles', async () => {
    const articles = [{ body: '<p>Hello</p>', content_type: 'text/html' }];
    global.fetch = mock(async (url: string) => {
      expect(url).toContain('/api/v1/ticket_articles/by_ticket/99');
      return new Response(JSON.stringify(articles));
    }) as unknown as typeof fetch;

    const client = new ZammadClient();
    const result = await client.getTicketArticles(99);

    expect(result).toEqual(articles);
  });

  it('throws a descriptive error on failure', async () => {
    global.fetch = mock(async () => new Response('nope', { status: 500 })) as unknown as typeof fetch;
    const client = new ZammadClient();
    await expect(client.getTicketArticles(99)).rejects.toThrow('Zammad ticket articles fetch failed: 500 nope');
  });
});

describe('ZammadClient.getUser', () => {
  const originalFetch = global.fetch;
  afterEach(() => { global.fetch = originalFetch; });

  it('GETs /api/v1/users/{id} and returns the parsed user', async () => {
    global.fetch = mock(async (url: string) => {
      expect(url).toContain('/api/v1/users/42');
      return new Response(JSON.stringify({ email: 'jane@nytimes.com' }));
    }) as unknown as typeof fetch;

    const client = new ZammadClient();
    const user = await client.getUser(42);

    expect(user).toEqual({ email: 'jane@nytimes.com' });
  });

  it('throws a descriptive error on failure', async () => {
    global.fetch = mock(async () => new Response('nope', { status: 404 })) as unknown as typeof fetch;
    const client = new ZammadClient();
    await expect(client.getUser(42)).rejects.toThrow('Zammad user fetch failed: 404 nope');
  });
});
