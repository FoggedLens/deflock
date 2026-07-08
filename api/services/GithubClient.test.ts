import { describe, it, expect } from 'bun:test';
import { buildSponsorsQuery } from './GithubClient';

describe('buildSponsorsQuery', () => {
  it('parameterizes the username instead of interpolating it', () => {
    const { query, variables } = buildSponsorsQuery('frillweeman');
    expect(query).toContain('query($login: String!)');
    expect(query).toContain('user(login: $login)');
    expect(variables).toEqual({ login: 'frillweeman' });
  });

  it('never places the raw username inside the query string', () => {
    const { query } = buildSponsorsQuery('octocat');
    // The query is fixed and only references the $login variable — the caller's
    // value must not appear in the query text itself.
    expect(query).not.toContain('octocat');
  });

  it('keeps GraphQL-breaking input confined to the variables (injection guard)', () => {
    // A username containing a quote used to break out of the interpolated
    // string literal. It must now travel only in `variables.login`.
    const hostile = '") { viewer { login } } #';
    const { query, variables } = buildSponsorsQuery(hostile);
    expect(variables.login).toBe(hostile);
    expect(query).not.toContain(hostile);
    expect(query).not.toContain('viewer');
  });

  it('requests sponsorships and the expected sponsor fields', () => {
    const { query } = buildSponsorsQuery('frillweeman');
    expect(query).toContain('sponsorshipsAsMaintainer(first: 100)');
    for (const field of ['login', 'name', 'avatarUrl', 'url']) {
      expect(query).toContain(field);
    }
  });
});
