
import { Type, Static } from '@sinclair/typebox';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const graphQLEndpoint = 'https://api.github.com/graphql';
const MAINTAINER_USERNAME = 'frillweeman';

export const SponsorSchema = Type.Object({
  sponsor: Type.Object({
    avatarUrl: Type.String(),
    login: Type.String(),
    name: Type.Union([Type.String(), Type.Null()]),
    url: Type.String(),
  }),
});

export type Sponsor = Static<typeof SponsorSchema>;

export const SponsorsResponseSchema = Type.Array(SponsorSchema);

// The maintainer's username is passed as a GraphQL variable rather than
// interpolated into the query string. It's a hardcoded constant today, but
// keeping this indirection means a future caller-supplied value can never
// break out of the query text the way the old string-interpolated version did.
export const buildSponsorsQuery = (): { query: string; variables: { username: string } } => ({
  query: `query($username: String!) { user(login: $username) { sponsorshipsAsMaintainer(first: 100) { nodes { sponsor { login name avatarUrl url } } } } }`,
  variables: { username: MAINTAINER_USERNAME },
});

export class GithubClient {
  async getSponsors(): Promise<Sponsor[]> {
    const { query, variables } = buildSponsorsQuery();
    const body = JSON.stringify({ query, variables });
    const response = await fetch(graphQLEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'User-Agent': 'Shotgun',
        'Content-Type': 'application/json',
      },
      body,
    });
    if (!response.ok) {
      throw new Error(`Failed to get sponsors: ${response.status}`);
    }
    const json = await response.json();
    return json?.data?.user?.sponsorshipsAsMaintainer?.nodes || [];
  }
}
