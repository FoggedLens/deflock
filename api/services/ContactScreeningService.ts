import { TOPIC_GROUP_MAP, type ContactTopic, type ZammadClient } from './ZammadClient';
import type { AiScreeningClient, ScreeningResult } from './AiScreeningClient';
import { endOfWorkdayEasternIso } from './BusinessHours';

const KB_GROUNDED_CATEGORIES = new Set(['donation', 'api_data', 'other', 'camera_correction', 'camera_report', 'local_group_request']);

export interface ZammadActionPlan {
  ticketAttribute: { ai_category: string };
  tags: string[];
  sharedDraft: { body: string; type: 'email'; internal: false } | null;
  state: 'pending close' | null;
  pendingTime: string | null;
  noteBody: string;
  priorityUpdate: '1 low' | '3 high' | null;
  groupOverride: string | null;
}

export function planZammadActions(result: ScreeningResult): ZammadActionPlan {
  const tags = ['ai-screened'];
  for (const flag of result.risk_flags) tags.push(`risk:${flag}`);

  if (result.ai_category === 'technical_bug') tags.push('technical-bug');
  if (result.ai_category === 'camera_correction') tags.push('camera-correction');
  if (result.ai_category === 'media_press') {
    tags.push('media');
    if (result.media_tier === 'big_media') tags.push('media-big');
    if (result.media_tier === 'small_media') tags.push('media-small');
  }
  if (result.ai_category === 'legal') tags.push('legal');
  if (KB_GROUNDED_CATEGORIES.has(result.ai_category) && result.kb_reference === 'none') {
    tags.push('kb-gap');
  }

  const sharedDraft = result.suggested_action === 'draft_response'
    ? { body: result.suggested_reply, type: 'email' as const, internal: false as const }
    : null;

  const priorityUpdate = result.suggested_action === 'escalate_urgent'
    ? '3 high' as const
    : (result.suggested_action === 'auto_delete' || result.suggested_action === 'scheduled_close')
      ? '1 low' as const
      : null;

  // Sender may have picked the wrong topic on the form (e.g. contacted General Support by
  // mistake) — route media inquiries to the Media group regardless of what they chose.
  const groupOverride = result.ai_category === 'media_press' ? TOPIC_GROUP_MAP.media : null;

  const isPendingClose = result.suggested_action === 'scheduled_close' || result.suggested_action === 'auto_delete';
  const state = isPendingClose ? 'pending close' as const : null;
  const pendingTime = isPendingClose ? endOfWorkdayEasternIso() : null;

  return {
    ticketAttribute: { ai_category: result.ai_category },
    tags,
    sharedDraft,
    state,
    pendingTime,
    // Always populated (internal_note is required and non-empty per the schema) — even
    // draft_response categories get a note now, so an agent reviewing a shared draft still
    // gets a quick summary of the AI's reasoning without opening the compose box.
    noteBody: result.internal_note,
    priorityUpdate,
    groupOverride,
  };
}

export interface ScreenContactSubmissionInput {
  ticketId: number;
  topic: ContactTopic;
  subject: string;
  message: string;
  senderEmailDomain: string;
  // Recipient(s) for the shared draft reply. replyTo is the customer's address (used whenever
  // there's nothing richer to reply-all to); replyCc carries any other correspondents on the
  // ticket so the draft doesn't drop people who were already on the thread.
  replyTo: string;
  replyCc?: string;
}

export interface ScreenContactSubmissionDeps {
  aiClient: AiScreeningClient;
  zammadClient: ZammadClient;
}

export interface ScreenContactSubmissionResult {
  result: ScreeningResult;
  plan: ZammadActionPlan;
  appliedTags: string[];
  noteWritten: boolean;
}

export async function screenContactSubmission(
  input: ScreenContactSubmissionInput,
  deps: ScreenContactSubmissionDeps,
): Promise<ScreenContactSubmissionResult> {
  const result = await deps.aiClient.screen({
    topic: input.topic,
    subject: input.subject,
    message: input.message,
    senderEmailDomain: input.senderEmailDomain,
  });

  const plan = planZammadActions(result);

  const ticketFields: Record<string, unknown> = { ai_category: plan.ticketAttribute.ai_category };
  if (plan.priorityUpdate) ticketFields.priority = plan.priorityUpdate;
  if (plan.state) ticketFields.state = plan.state;
  if (plan.pendingTime) ticketFields.pending_time = plan.pendingTime;
  if (plan.groupOverride) ticketFields.group = plan.groupOverride;
  await deps.zammadClient.setTicketFields(input.ticketId, ticketFields);

  const tags = [...plan.tags];
  let noteBody = plan.noteBody
    ? `🤖 AI Triage:\n\n${plan.noteBody}`
    : null;

  if (plan.sharedDraft) {
    try {
      await deps.zammadClient.upsertSharedDraft(input.ticketId, plan.sharedDraft.body, {
        to: input.replyTo,
        cc: input.replyCc,
      });
    } catch {
      tags.push('draft-fallback');
      noteBody = `🤖 AI-drafted reply (shared draft failed — unreviewed, edit/approve before sending):\n\n${plan.sharedDraft.body}` +
        (plan.noteBody ? `\n\n---\n${plan.noteBody}` : '');
    }
  }

  await Promise.all(tags.map(tag => deps.zammadClient.addTag(input.ticketId, tag)));

  if (noteBody) {
    await deps.zammadClient.addInternalNote(input.ticketId, noteBody);
  }

  return { result, plan, appliedTags: tags, noteWritten: Boolean(noteBody) };
}
