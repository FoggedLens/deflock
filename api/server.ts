
import Fastify, { FastifyInstance, FastifyError } from 'fastify';
import cors from '@fastify/cors';
import { NominatimClient, NominatimResultSchema } from './services/NominatimClient';
import { GithubClient, SponsorsResponseSchema } from './services/GithubClient';

const start = async () => {
  const server: FastifyInstance = Fastify({
    logger: {
      level: 'error',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    },
    trustProxy: true,
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

  // Coors Banquet Config
  await server.register(cors, {
    origin: (origin, cb) => {
      const allowedOrigins = [
        'http://localhost:5173', // DeFlock Legacy
        'http://localhost:3000', // FlockHopper
        'https://deflock.org',
        'https://www.deflock.org',
        'https://maps.deflock.org'
      ];
      
      if (!origin || allowedOrigins.includes(origin) || /^https:\/\/.*\.deflock\.pages\.dev$/.test(origin)) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    },
    methods: ['GET', 'HEAD'],
  });

  const nominatim = new NominatimClient();
  const githubClient = new GithubClient();

  const shutdown = async () => {
    server.log.info("Shutting down");
    await server.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  server.get('/geocode', {
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
    reply.header('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    const result = await nominatim.geocodeSingleResult(query);
    return result;
  });

  server.get('/geocode/multi', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          query: { type: 'string' },
        },
        required: ['query'],
      },
      response: {
        200: {
          type: 'array',
          items: NominatimResultSchema,
        },
        500: { type: 'object', properties: { error: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    const { query } = request.query as { query: string };
    reply.header('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    const result = await nominatim.geocodePhrase(query);
    return result;
  });

  server.get('/sponsors/github', {
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
    reply.header('Cache-Control', 'public, max-age=60, s-maxage=600');
    const result = await githubClient.getSponsors(username || 'frillweeman');
    return result;
  });

  server.head('/healthcheck', async (request, reply) => {
    reply.status(200).send();
  });

  try {
    const defaultPort = process.env.NODE_ENV === 'development' ? 3420 : 3000;
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : defaultPort;
    await server.listen({ host: '0.0.0.0', port });
    console.log(`Server listening on port ${port}`);
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