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
  async createTicket(payload: CreateTicketPayload): Promise<void> {
    const { name, email, topic, subject, message } = payload;
    const group = TOPIC_GROUP_MAP[topic];

    const body = JSON.stringify({
      title: subject,
      group,
      priority: topic === 'media' ? '3 high' : '2 normal',
      customer: email,
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
