const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY || '';
const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export class TurnstileClient {
  async verify(token: string, remoteIp?: string): Promise<boolean> {
    const body = new URLSearchParams({
      secret: TURNSTILE_SECRET_KEY,
      response: token,
      ...(remoteIp ? { remoteip: remoteIp } : {}),
    });
    const response = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    if (!response.ok) {
      throw new Error(`Turnstile siteverify request failed: ${response.status}`);
    }
    const json = await response.json() as { success: boolean };
    return json.success;
  }
}
