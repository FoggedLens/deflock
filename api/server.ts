
import Fastify, { FastifyInstance, FastifyError } from 'fastify';
import cors from '@fastify/cors';
import { NominatimClient, NominatimResultSchema } from './services/NominatimClient';
import { GithubClient, SponsorsResponseSchema } from './services/GithubClient';

const start = async () => {
  const server: FastifyInstance = Fastify({
    logger: {
      level: 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    },
  });

  // Global error handler
  server.setErrorHandler((error: FastifyError, request, reply) => {
    server.log.error({
      url: request.url,
      method: request.method,
      error: error.message,
      stack: error.stack,
    }, 'Request error');
    
    reply.status(error.statusCode || 500).send({
      error: 'Internal Server Error',
    });
  });

  // CORS config
  await server.register(cors, {
    origin: [
      'http://localhost:8080',
      'http://localhost:5173',
      'https://deflock.me',
      'https://www.deflock.me',
    ],
    methods: ['GET', 'HEAD'],
  });

  const nominatim = new NominatimClient();
  const githubClient = new GithubClient();

server.get('/api/geocode', {
  schema: {
    querystring: {
      type: 'object',
      properties: {
        query: { type: 'string' },
      },
      required: ['query'],
    },
    response: {
      200: NominatimResultSchema,
      500: { type: 'object', properties: { error: { type: 'string' } } },
    },
  },
}, async (request, reply) => {
  const { query } = request.query as { query: string };
  const result = await nominatim.geocodeSingleResult(query);
  return result;
});

server.get('/api/sponsors/github', {
  schema: {
    querystring: {
      type: 'object',
      properties: {
        username: { type: 'string', default: 'frillweeman' },
      },
    },
    response: {
      200: SponsorsResponseSchema,
      500: { type: 'object', properties: { error: { type: 'string' } } },
    },
  },
}, async (request, reply) => {
  const { username } = request.query as { username?: string };
  const result = await githubClient.getSponsors(username || 'frillweeman');
  return result;
});

  server.head('/api/healthcheck', async (request, reply) => {
    reply.status(200).send();
  });

  try {
    await server.listen({ host: '0.0.0.0', port: 3000 });
    console.log('Server listening on port 3000');
  } catch (err) {
    console.error('Failed to start server:', err);
    server.log.error(err);
    process.exit(1);
  }
};

start().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});