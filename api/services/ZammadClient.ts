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
  aiScreeningOptOut: Type.Optional(Type.Boolean({ default: false })),
});

export type ContactMessageBody = Static<typeof ContactMessageBodySchema>;

export const TOPIC_GROUP_MAP: Record<ContactTopic, string> = {
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

  async createTicket(payload: CreateTicketPayload): Promise<{ id: number }> {
    const { name, email, topic, subject, message } = payload;
    const group = TOPIC_GROUP_MAP[topic];

    const customerId = await this.upsertCustomer(name, email);

    const body = JSON.stringify({
      title: subject,
      group,
      priority: '2 normal',
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
    const ticket = await response.json() as { id: number };
    return { id: ticket.id };
  }

  async getTicket(ticketId: number): Promise<{ id: number; title: string; group: string; customer_id: number }> {
    const response = await fetch(`${ZAMMAD_URL}/api/v1/tickets/${ticketId}`, {
      headers: { 'Authorization': `Token token=${ZAMMAD_TOKEN}` },
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Zammad ticket fetch failed: ${response.status} ${text}`);
    }
    return response.json();
  }

  async getTicketArticles(ticketId: number): Promise<Array<{ body: string; content_type: string; from: string; to: string; cc: string; sender: string }>> {
    const response = await fetch(`${ZAMMAD_URL}/api/v1/ticket_articles/by_ticket/${ticketId}`, {
      headers: { 'Authorization': `Token token=${ZAMMAD_TOKEN}` },
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Zammad ticket articles fetch failed: ${response.status} ${text}`);
    }
    return response.json();
  }

  async getUser(userId: number): Promise<{ email: string }> {
    const response = await fetch(`${ZAMMAD_URL}/api/v1/users/${userId}`, {
      headers: { 'Authorization': `Token token=${ZAMMAD_TOKEN}` },
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Zammad user fetch failed: ${response.status} ${text}`);
    }
    return response.json();
  }

  async addTag(ticketId: number, tag: string): Promise<void> {
    const response = await fetch(`${ZAMMAD_URL}/api/v1/tags/add`, {
      method: 'POST',
      headers: {
        'Authorization': `Token token=${ZAMMAD_TOKEN}`,
        'Content-Type': 'application/json',
      },
      // Zammad's tag-add endpoint reads the tag name from "item", not "tag" — sending the
      // wrong key leaves it nil server-side and crashes Zammad's own tag_add with an
      // unhandled NoMethodError (500) rather than a clean validation error.
      body: JSON.stringify({ item: tag, object: 'Ticket', o_id: ticketId }),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Zammad tag creation failed for tag "${tag}" on ticket ${ticketId}: ${response.status} ${text}`);
    }
  }

  async addInternalNote(ticketId: number, body: string): Promise<void> {
    const response = await fetch(`${ZAMMAD_URL}/api/v1/ticket_articles`, {
      method: 'POST',
      headers: {
        'Authorization': `Token token=${ZAMMAD_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ticket_id: ticketId, body, type: 'note', internal: true }),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Zammad internal note creation failed: ${response.status} ${text}`);
    }
  }

  async setTicketFields(ticketId: number, fields: Record<string, unknown>): Promise<void> {
    const response = await fetch(`${ZAMMAD_URL}/api/v1/tickets/${ticketId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Token token=${ZAMMAD_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fields),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Zammad ticket fields update failed: ${response.status} ${text}`);
    }
  }

  async upsertSharedDraft(ticketId: number, body: string, recipients: { to: string; cc?: string }): Promise<void> {
    const response = await fetch(`${ZAMMAD_URL}/api/v1/tickets/${ticketId}/shared_draft`, {
      method: 'PUT',
      headers: {
        'Authorization': `Token token=${ZAMMAD_TOKEN}`,
        'Content-Type': 'application/json',
      },
      // TicketSharedDraftZoomController#draft_params only permits nested "new_article" /
      // "ticket_attributes" keys (params.permit ticket_attributes: {}, new_article: {}) —
      // top-level body/type/internal are silently stripped by Rails strong params, which
      // creates/updates the draft with an empty article and no error at all.
      body: JSON.stringify({
        new_article: { body, type: 'email', internal: false, to: recipients.to, cc: recipients.cc ?? '' },
        ticket_attributes: {},
      }),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Zammad shared draft update failed: ${response.status} ${text}`);
    }
  }
}
