#!/usr/bin/env bun
// Runs the AI contact-screening pipeline against an EXISTING Zammad ticket, for spot-testing
// against a real Zammad instance (whichever ZAMMAD_URL/ZAMMAD_TOKEN in .env point at). This
// writes real tags/notes/shared-draft/priority/group changes to that ticket — it is not a
// dry run. See api/server.ts's POST /contact/message/dry-run if you just want to preview a
// classification without touching Zammad at all.
//
// Usage: bun scripts/screen-ticket.ts <ticketId> [--yes]
//   --yes   skip the confirmation prompt (useful for scripting)

import { createInterface } from 'node:readline/promises';
import { ZammadClient, TOPIC_GROUP_MAP, type ContactTopic } from '../services/ZammadClient';
import { AiScreeningClient } from '../services/AiScreeningClient';
import { screenContactSubmission } from '../services/ContactScreeningService';

const [, , ticketIdArg, ...flags] = process.argv;
const ticketId = Number(ticketIdArg);
const skipConfirm = flags.includes('--yes');

if (!ticketId || Number.isNaN(ticketId)) {
  console.error('Usage: bun scripts/screen-ticket.ts <ticketId> [--yes]');
  process.exit(1);
}

const REVERSE_TOPIC_MAP = Object.fromEntries(
  Object.entries(TOPIC_GROUP_MAP).map(([topic, group]) => [group, topic]),
) as Record<string, ContactTopic>;

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

const zammadClient = new ZammadClient();
const aiClient = new AiScreeningClient();

const ticket = await zammadClient.getTicket(ticketId);
const articles = await zammadClient.getTicketArticles(ticketId);
const message = stripHtml(articles[0]?.body ?? '');
const customer = await zammadClient.getUser(ticket.customer_id);
const senderEmailDomain = customer.email?.split('@')[1] ?? '';
// topic is only soft context for the classifier (planZammadActions no longer branches on it),
// so an imperfect reverse-lookup from the ticket's current group is fine.
const topic = REVERSE_TOPIC_MAP[ticket.group] ?? 'questions-comments';

console.log(`Target Zammad: ${process.env.ZAMMAD_URL || '(ZAMMAD_URL not set)'}`);
console.log(`Ticket #${ticketId}: "${ticket.title}" (group: ${ticket.group} -> inferred topic: ${topic})`);
console.log(`Message: ${message.slice(0, 300)}${message.length > 300 ? '...' : ''}`);
console.log('This will write real tags/notes/shared-draft/priority/group changes to this ticket.');

if (!skipConfirm) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question('Proceed? (y/N) ');
  rl.close();
  if (answer.trim().toLowerCase() !== 'y') {
    console.log('Aborted.');
    process.exit(0);
  }
}

await screenContactSubmission(
  { ticketId, topic, subject: ticket.title, message, senderEmailDomain, replyTo: customer.email },
  { aiClient, zammadClient },
);

console.log('Done — check the ticket in Zammad for tags/notes/shared draft.');
