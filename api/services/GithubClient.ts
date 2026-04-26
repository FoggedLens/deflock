
import { Type, Static } from '@sinclair/typebox';
import { type Span, SpanKind, SpanStatusCode, context, trace } from '@opentelemetry/api';
import { tracer } from '../telemetry';

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
  async getSponsors(username: string, parentSpan?: Span): Promise<Sponsor[]> {
    const query = `query { user(login: "${username}") { sponsorshipsAsMaintainer(first: 100) { nodes { sponsor { login name avatarUrl url } } } } }`;
    const body = JSON.stringify({ query, variables: '' });
    const ctx = parentSpan ? trace.setSpan(context.active(), parentSpan) : context.active();
    const span = tracer.startSpan('github.getSponsors', {
      kind: SpanKind.CLIENT,
      attributes: { 'peer.service': 'github', 'http.request.method': 'POST' },
    }, ctx);
    try {
      const response = await fetch(graphQLEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'User-Agent': 'Shotgun',
          'Content-Type': 'application/json',
        },
        body,
      });
      span.setAttribute('http.response.status_code', response.status);
      if (!response.ok) {
        throw new Error(`Failed to get sponsors: ${response.status}`);
      }
      const json = await response.json();
      return json?.data?.user?.sponsorshipsAsMaintainer?.nodes || [];
    } catch (err) {
      span.recordException(err as Error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: (err as Error).message });
      span.setAttribute('error.type', 'upstream_error');
      throw err;
    } finally {
      span.end();
    }
  }
}
