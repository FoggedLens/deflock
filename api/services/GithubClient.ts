
import { Type, Static } from '@sinclair/typebox';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const graphQLEndpoint = 'https://api.github.com/graphql';

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

// Pass the username as a GraphQL variable rather than interpolating it into the
// query string, so a value containing quotes or other GraphQL syntax cannot
// break out of the string literal and alter the query.
export const buildSponsorsQuery = (username: string): { query: string; variables: { login: string } } => ({
  query: `query($login: String!) { user(login: $login) { sponsorshipsAsMaintainer(first: 100) { nodes { sponsor { login name avatarUrl url } } } } }`,
  variables: { login: username },
});

export class GithubClient {
  async getSponsors(username: string): Promise<Sponsor[]> {
    const { query, variables } = buildSponsorsQuery(username);
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
