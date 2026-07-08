import { describe, it, expect, afterEach, mock } from 'bun:test';
import { GithubClient, buildSponsorsQuery } from './GithubClient';

describe('buildSponsorsQuery', () => {
  it('parameterizes the username via a $username GraphQL variable instead of interpolating it', () => {
    const { query, variables } = buildSponsorsQuery();
    expect(query).toContain('query($username: String!)');
    expect(query).toContain('user(login: $username)');
    expect(variables).toEqual({ username: 'frillweeman' });
  });

  it('requests sponsorships and the expected sponsor fields', () => {
    const { query } = buildSponsorsQuery();
    expect(query).toContain('sponsorshipsAsMaintainer(first: 100)');
    for (const field of ['login', 'name', 'avatarUrl', 'url']) {
      expect(query).toContain(field);
    }
  });
});

describe('GithubClient.getSponsors', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('sends exactly the query and variables built by buildSponsorsQuery', async () => {
    let capturedBody: any;
    global.fetch = mock(async (_url: string, init: RequestInit) => {
      capturedBody = JSON.parse(init.body as string);
      return new Response(JSON.stringify({ data: { user: { sponsorshipsAsMaintainer: { nodes: [] } } } }));
    }) as unknown as typeof fetch;

    const client = new GithubClient();
    await client.getSponsors();

    expect(capturedBody).toEqual(buildSponsorsQuery());
  });

  it('returns the sponsor nodes from the response', async () => {
    const nodes = [{ sponsor: { login: 'someone', name: 'Someone', avatarUrl: 'https://example.com/a.png', url: 'https://github.com/someone' } }];
    global.fetch = mock(async () =>
      new Response(JSON.stringify({ data: { user: { sponsorshipsAsMaintainer: { nodes } } } }))
    ) as unknown as typeof fetch;

    const client = new GithubClient();
    const result = await client.getSponsors();

    expect(result).toEqual(nodes);
  });

  it('throws when the GitHub API responds with a non-OK status', async () => {
    global.fetch = mock(async () => new Response('', { status: 500 })) as unknown as typeof fetch;

    const client = new GithubClient();

    await expect(client.getSponsors()).rejects.toThrow('Failed to get sponsors: 500');
  });
});