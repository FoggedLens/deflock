import { Type, Static } from '@sinclair/typebox';

const ZAMMAD_URL = process.env.ZAMMAD_URL || '';
const ZAMMAD_TOKEN = process.env.ZAMMAD_TOKEN || '';

export type ContactTopic =
  | 'website-support'
  | 'app-support'
  | 'local-groups'
  | 'media'
  | 'questions-comments';

export const ContactMessageBodySchema = Type.Object({
  name: Type.String({ minLength: 1 }),
  email: Type.String({ format: 'email' }),
  topic: Type.Union([
    Type.Literal('website-support'),
    Type.Literal('app-support'),
    Type.Literal('local-groups'),
    Type.Literal('media'),
    Type.Literal('questions-comments'),
  ]),
  subject: Type.String({ minLength: 1 }),
  message: Type.String({ minLength: 1 }),
  turnstileToken: Type.String({ minLength: 1 }),
});

export type ContactMessageBody = Static<typeof ContactMessageBodySchema>;

const TOPIC_GROUP_MAP: Record<ContactTopic, string> = {
  'website-support': 'Website Support',
  'app-support': 'App Support',
  'local-groups': 'Local Groups',
  'media': 'Media',
  'questions-comments': 'General Support',
};

export interface CreateTicketPayload {
  name: string;
  email: string;
  topic: ContactTopic;
  subject: string;
  message: string;
}

export class ZammadClient {
  private async upsertCustomer(name: string, email: string): Promise<number> {
    const normalizedEmail = email.toLowerCase();

    // Search for existing user by email
    const searchResponse = await fetch(
      `${ZAMMAD_URL}/api/v1/users/search?query=${encodeURIComponent(normalizedEmail)}&limit=1`,
      {
        headers: { 'Authorization': `Token token=${ZAMMAD_TOKEN}` },
      }
    );
    if (searchResponse.ok) {
      const users = await searchResponse.json() as Array<{ id: number; email: string }>;
      const match = users.find(u => u.email?.toLowerCase() === normalizedEmail);
      if (match) return match.id;
    }

    // Create the customer if not found
    const createResponse = await fetch(`${ZAMMAD_URL}/api/v1/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Token token=${ZAMMAD_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ firstname: name, email: normalizedEmail, roles: ['Customer'] }),
    });
    if (!createResponse.ok) {
      const text = await createResponse.text();
      throw new Error(`Zammad customer creation failed: ${createResponse.status} ${text}`);
    }
    const user = await createResponse.json() as { id: number };
    return user.id;
  }

  async createTicket(payload: CreateTicketPayload): Promise<void> {
    const { name, email, topic, subject, message } = payload;
    const group = TOPIC_GROUP_MAP[topic];

    const customerId = await this.upsertCustomer(name, email);

    const body = JSON.stringify({
      title: subject,
      group,
      priority: topic === 'media' ? '3 high' : '2 normal',
      customer_id: customerId,
      article: {
        subject,
        body: message,
        type: 'email',
        sender: 'Customer',
        from: `${name} <${email}>`,
        to: 'contact@deflock.org',
        internal: false,
      },
    });

    const response = await fetch(`${ZAMMAD_URL}/api/v1/tickets`, {
      method: 'POST',
      headers: {
        'Authorization': `Token token=${ZAMMAD_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body,
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Zammad ticket creation failed: ${response.status} ${text}`);
    }
  }
}
