
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

export class GithubClient {
  async getSponsors(username: string): Promise<Sponsor[]> {
    const query = `query { user(login: \"${username}\") { sponsorshipsAsMaintainer(first: 100) { nodes { sponsor { login name avatarUrl url } } } } }`;
    const body = JSON.stringify({ query, variables: '' });
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
