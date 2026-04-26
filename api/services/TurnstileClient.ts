import { type Span, SpanKind, SpanStatusCode, context, trace } from '@opentelemetry/api';
import { tracer } from '../telemetry';

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY || '';
const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export class TurnstileClient {
  async verify(token: string, remoteIp?: string, parentSpan?: Span): Promise<boolean> {
    const body = new URLSearchParams({
      secret: TURNSTILE_SECRET_KEY,
      response: token,
      ...(remoteIp ? { remoteip: remoteIp } : {}),
    });
    const ctx = parentSpan ? trace.setSpan(context.active(), parentSpan) : context.active();
    const span = tracer.startSpan('turnstile.verify', {
      kind: SpanKind.CLIENT,
      attributes: { 'peer.service': 'turnstile', 'http.request.method': 'POST' },
    }, ctx);
    try {
      const response = await fetch(SITEVERIFY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      span.setAttribute('http.response.status_code', response.status);
      if (!response.ok) {
        throw new Error(`Turnstile siteverify request failed: ${response.status}`);
      }
      const json = await response.json() as { success: boolean };
      const success = json.success === true;
      if (!success) {
        span.setAttribute('error.type', 'captcha_failure');
        span.setStatus({ code: SpanStatusCode.ERROR, message: 'Captcha verification failed' });
      }
      return success;
    } catch (err) {
      span.recordException(err as Error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: (err as Error).message });
      if (!(err instanceof Error && err.message.startsWith('Turnstile'))) {
        span.setAttribute('error.type', 'upstream_error');
      }
      throw err;
    } finally {
      span.end();
    }
  }
}
