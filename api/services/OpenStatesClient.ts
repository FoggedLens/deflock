import { createCache, Cache } from 'cache-manager';
import { Type, Static } from '@sinclair/typebox';
import { otelLogger, SeverityNumber } from '../telemetry';
const { DiskStore } = require('cache-manager-fs-hash');

const OPENSTATES_API_KEY = process.env.OPENSTATES_API_KEY || '';

export const LegislatorSchema = Type.Object({
  name: Type.String(),
  party: Type.String(),
  chamber: Type.String(),
  district: Type.String(),
  image: Type.String(),
  email: Type.String(),
  phone: Type.String(),
  openstatesUrl: Type.String(),
});

export const LegislatorsResponseSchema = Type.Object({
  legislators: Type.Array(LegislatorSchema),
});

export type Legislator = Static<typeof LegislatorSchema>;

// Shape of the Open States /people.geo response, per https://v3.openstates.org/docs/
interface OpenStatesPerson {
  name: string;
  party?: string;
  current_role?: {
    title?: string;
    org_classification?: string;
    district?: string | number;
  };
  image?: string;
  email?: string;
  openstates_url?: string;
  offices?: Array<{
    classification?: string;
    voice?: string;
  }>;
}

const cache: Cache = createCache({
  stores: [new DiskStore({
    path: '/tmp/openstates-cache',
    ttl: 3600 * 24, // 24 hours
    maxsize: 1000 * 1000 * 100, // 100MB
    subdirs: true,
    zip: false,
  })]
});

export function toLegislator(person: OpenStatesPerson): Legislator {
  const offices = person.offices ?? [];
  const phone =
    offices.find((o) => o.classification === 'capitol')?.voice ||
    offices.find((o) => o.voice)?.voice ||
    '';
  return {
    name: person.name,
    party: person.party ?? '',
    chamber: person.current_role?.org_classification ?? '',
    district: String(person.current_role?.district ?? ''),
    image: person.image ?? '',
    email: person.email ?? '',
    phone,
    openstatesUrl: person.openstates_url ?? '',
  };
}

export class OpenStatesClient {
  baseUrl = 'https://v3.openstates.org/people.geo';

  isConfigured(): boolean {
    return OPENSTATES_API_KEY !== '';
  }

  async legislatorsAtPoint(lat: number, lng: number): Promise<Legislator[]> {
    const cacheKey = `officials:${lat},${lng}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return cached as Legislator[];
    }

    const url = `${this.baseUrl}?lat=${lat}&lng=${lng}&include=offices`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'DeFlock/1.2',
        'X-API-KEY': OPENSTATES_API_KEY,
      },
    });
    if (!response.ok) {
      const body = await response.text();
      otelLogger.emit({
        severityNumber: SeverityNumber.ERROR,
        severityText: 'ERROR',
        body: `Open States error: ${response.status}`,
        attributes: {
          'openstates.status_code': response.status,
          'openstates.response_body': body,
        },
      });
      throw new Error(`Failed to fetch legislators: ${response.status}`);
    }

    const json = await response.json() as { results?: OpenStatesPerson[] };
    const legislators = (json.results ?? []).map(toLegislator);
    await cache.set(cacheKey, legislators);
    return legislators;
  }
}
