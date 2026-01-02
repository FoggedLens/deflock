import axios from 'axios';

interface GithubSponsor {
  login: string;
  name: string | null;
  avatarUrl: string;
  url: string;
}

interface GithubSponsorsResponse {
  data: {
    user: {
      sponsorshipsAsMaintainer: {
        nodes: Array<{
          sponsor: GithubSponsor;
        }>;
      };
    };
  };
}

export class GithubClient {
  private readonly graphQLEndpoint = 'https://api.github.com/graphql';
  private readonly githubApiToken: string;

  constructor() {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error('GITHUB_TOKEN environment variable is required');
    }
    this.githubApiToken = token;
  }

  async getSponsors(username: string): Promise<GithubSponsor[]> {
    const query = `
      query {
        user(login: "${username}") {
          sponsorshipsAsMaintainer(first: 100) {
            nodes {
              sponsor {
                login
                name
                avatarUrl
                url
              }
            }
          }
        }
      }
    `;

    try {
      const response = await axios.post<GithubSponsorsResponse>(
        this.graphQLEndpoint,
        {
          query,
          variables: {}
        },
        {
          headers: {
            'Authorization': `Bearer ${this.githubApiToken}`,
            'User-Agent': 'DeFlock Backend',
            'Content-Type': 'application/json'
          }
        }
      );

      const nodes = response.data.data.user.sponsorshipsAsMaintainer.nodes;
      return nodes.map(node => node.sponsor);
    } catch (error) {
      console.error('Failed to fetch GitHub sponsors:', error);
      throw new Error('Failed to fetch GitHub sponsors');
    }
  }
}
