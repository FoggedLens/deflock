
import './telemetry';
import { tracer, otelLogger, SeverityNumber, meter } from './telemetry';
import { type Span, SpanKind, SpanStatusCode, context, trace } from '@opentelemetry/api';
import Fastify, { FastifyInstance, FastifyError } from 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    span?: Span;
    traceId?: string;
    errorHandled?: boolean;
  }
}

function classifyError(error: FastifyError): string {
  if (error.code === 'FST_ERR_VALIDATION') return 'validation_error';
  const msg = error.message.toLowerCase();
  if (msg.includes('geocode') || msg.includes('nominatim')) return 'upstream_error:nominatim';
  if (msg.includes('sponsors') || msg.includes('github')) return 'upstream_error:github';
  if (msg.includes('zammad') || msg.includes('ticket')) return 'upstream_error:zammad';
  if (msg.includes('turnstile') || msg.includes('siteverify')) return 'upstream_error:turnstile';
  return 'internal_error';
}

function classifyByStatus(statusCode: number): string {
  if (statusCode === 404) return 'not_found';
  if (statusCode === 400) return 'client_error';
  if (statusCode === 401 || statusCode === 403) return 'auth_error';
  if (statusCode >= 400 && statusCode < 500) return 'client_error';
  return 'internal_error';
}
import cors from '@fastify/cors';
import { NominatimClient, NominatimResultSchema } from './services/NominatimClient';
import { GithubClient, SponsorsResponseSchema } from './services/GithubClient';
import { TurnstileClient } from './services/TurnstileClient';
import { ZammadClient, ContactMessageBodySchema, ContactMessageBody } from './services/ZammadClient';

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
    const errorType = classifyError(error);
    const statusCode = error.statusCode ?? 500;
    const { span } = request;

    if (span) {
      span.setAttribute('error.type', errorType);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      span.recordException(error);
    }

    otelLogger.emit({
      severityNumber: SeverityNumber.ERROR,
      severityText: 'ERROR',
      body: error.message,
      attributes: {
        'error.type': errorType,
        'http.route': (request.routeOptions as { url?: string })?.url ?? '',
        'http.request.method': request.method,
        'http.response.status_code': statusCode,
        'exception.message': error.message,
        'exception.stacktrace': error.stack ?? '',
        'trace.id': request.traceId ?? '',
      },
    });

    request.errorHandled = true;

    server.log.error({
      url: request.url,
      method: request.method,
      traceId: request.traceId,
      error: error.message,
      stack: error.stack,
    }, 'Request error');

    reply.status(statusCode).send({ error: 'Internal Server Error' });
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
    methods: ['GET', 'HEAD', 'POST'],
  });

  server.addHook('onRequest', (request, _reply, done) => {
    const route = (request.routeOptions as { url?: string })?.url ?? request.url.split('?')[0];
    const span = tracer.startSpan(`${request.method} ${route}`, {
      kind: SpanKind.SERVER,
      attributes: {
        'http.request.method': request.method,
        'http.route': route,
        'http.url': request.url,
        'network.peer.address': request.ip,
      },
    });
    request.span = span;
    request.traceId = span.spanContext().traceId;
    done();
  });

  server.addHook('onResponse', (request, reply, done) => {
    const { span } = request;
    if (span) {
      const statusCode = reply.statusCode;
      const route = (request.routeOptions as { url?: string })?.url ?? request.url.split('?')[0];
      requestCounter.add(1, {
        'http.route': route,
        'http.request.method': request.method,
        'http.response.status_code': statusCode,
      });
      span.setAttribute('http.response.status_code', statusCode);
      if (statusCode >= 500) {
        span.setStatus({ code: SpanStatusCode.ERROR });
      }
      if (!request.errorHandled && statusCode >= 400) {
        otelLogger.emit({
          severityNumber: statusCode >= 500 ? SeverityNumber.ERROR : SeverityNumber.WARN,
          severityText: statusCode >= 500 ? 'ERROR' : 'WARN',
          body: `HTTP ${statusCode} ${request.method} ${(request.routeOptions as { url?: string })?.url ?? request.url}`,
          attributes: {
            'error.type': classifyByStatus(statusCode),
            'http.route': (request.routeOptions as { url?: string })?.url ?? '',
            'http.request.method': request.method,
            'http.response.status_code': statusCode,
            'trace.id': request.traceId ?? '',
          },
        });
      }
      span.end();
    }
    done();
  });

  const requestCounter = meter.createCounter('http.server.requests.total', {
    description: 'Total number of HTTP requests, by route, method, and status code',
  });

  const nominatim = new NominatimClient();
  const githubClient = new GithubClient();
  const turnstileClient = new TurnstileClient();
  const zammadClient = new ZammadClient();

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
        404: { type: 'object', properties: { error: { type: 'string' } } },
        500: { type: 'object', properties: { error: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    const { query } = request.query as { query: string };
    reply.header('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    const result = await nominatim.geocodeSingleResult(query, request.span);
    if (!result) {
      return reply.status(404).send({ error: 'No results found' });
    }
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
    const result = await nominatim.geocodePhrase(query, false, request.span);
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
    const result = await githubClient.getSponsors(username || 'frillweeman', request.span);
    return result;
  });

  server.post('/contact/message', {
    schema: {
      body: ContactMessageBodySchema,
      response: {
        201: { type: 'object', properties: {} },
        400: { type: 'object', properties: { error: { type: 'string' } } },
        500: { type: 'object', properties: { error: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    const { name, email, topic, subject, message, turnstileToken } = request.body as ContactMessageBody;

    const remoteIp = request.ip;
    const valid = await turnstileClient.verify(turnstileToken, remoteIp, request.span);
    if (!valid) {
      return reply.status(400).send({ error: 'Invalid captcha' });
    }

    await zammadClient.createTicket({ name, email, topic, subject, message }, request.span);
    return reply.status(201).send({});
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