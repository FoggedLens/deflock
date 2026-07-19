import { readFileSync } from 'fs';
import { join } from 'path';
import { Type, Static } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import OpenAI from 'openai';
import type { ContactTopic } from './ZammadClient';
import { loadKnowledgeBase, formatKnowledgeBaseForPrompt } from './KnowledgeBase';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

const PROMPT_TEMPLATE = readFileSync(join(__dirname, '../prompts/contact-screening.md'), 'utf-8');

const KB_DOCS = loadKnowledgeBase();
const KB_FILENAMES = KB_DOCS.map(d => d.filename);
const KB_REFERENCE_VALUES = [...KB_FILENAMES, 'none'] as const;

const SYSTEM_PROMPT = `${PROMPT_TEMPLATE}\n\n${formatKnowledgeBaseForPrompt(KB_DOCS)}`;

export const AI_CATEGORIES = [
  'local_group_request',
  'camera_report',
  'camera_correction',
  'technical_bug',
  'media_press',
  'legal',
  'donation',
  'api_data',
  'opinion_no_action',
  'spam_bounce',
  'other',
] as const;

// Only meaningful when ai_category is media_press; not_applicable otherwise.
export const MEDIA_TIER_VALUES = ['big_media', 'small_media', 'not_applicable'] as const;

export const RISK_FLAG_VALUES = [
  'prompt_injection_suspected',
  'abusive_or_threatening',
  'spam_or_irrelevant',
] as const;

export const SUGGESTED_ACTION_VALUES = [
  'draft_response',
  'internal_note_only',
  'escalate_urgent',
  'auto_delete',
  'scheduled_close',
] as const;

function literalUnion<T extends readonly string[]>(values: T) {
  return Type.Union(values.map(v => Type.Literal(v)) as any);
}

export const ScreeningResultSchema = Type.Object({
  ai_category: literalUnion(AI_CATEGORIES),
  media_tier: literalUnion(MEDIA_TIER_VALUES),
  confidence: Type.Number(),
  kb_reference: literalUnion(KB_REFERENCE_VALUES),
  suggested_action: literalUnion(SUGGESTED_ACTION_VALUES),
  suggested_reply: Type.String(),
  // Required and non-empty: the schema only guarantees the key is present, so without
  // minLength the model can (and did) satisfy "required" with an empty string. This is
  // enforced locally by Value.Check below regardless of whether OpenAI's strict mode honors
  // minLength on its end — an empty note now fails loudly instead of silently writing nothing.
  internal_note: Type.String({ minLength: 1 }),
  risk_flags: Type.Array(literalUnion(RISK_FLAG_VALUES)),
});
export type ScreeningResult = Static<typeof ScreeningResultSchema>;

export interface ScreeningInput {
  topic: ContactTopic;
  subject: string;
  message: string;
  senderEmailDomain: string;
}

// Mirrors ScreeningResultSchema. OpenAI Structured Outputs strict mode requires every
// property to be listed in "required" and additionalProperties: false throughout.
const OPENAI_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    ai_category: { type: 'string', enum: AI_CATEGORIES },
    media_tier: { type: 'string', enum: MEDIA_TIER_VALUES },
    confidence: { type: 'number', minimum: 0, maximum: 1 },
    kb_reference: { type: 'string', enum: KB_REFERENCE_VALUES },
    suggested_action: { type: 'string', enum: SUGGESTED_ACTION_VALUES },
    suggested_reply: { type: 'string' },
    internal_note: { type: 'string', minLength: 1 },
    risk_flags: { type: 'array', items: { type: 'string', enum: RISK_FLAG_VALUES } },
  },
  required: [
    'ai_category',
    'media_tier',
    'confidence',
    'kb_reference',
    'suggested_action',
    'suggested_reply',
    'internal_note',
    'risk_flags',
  ],
};

export class AiScreeningClient {
  private readonly openai: OpenAI;

  constructor(openai: OpenAI = new OpenAI({ apiKey: OPENAI_API_KEY })) {
    this.openai = openai;
  }

  async screen(input: ScreeningInput): Promise<ScreeningResult> {
    const response = await this.openai.chat.completions.create(
      {
        model: OPENAI_MODEL,
        temperature: 0.2,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: JSON.stringify({
              topic: input.topic,
              subject: input.subject,
              message: input.message,
              senderEmailDomain: input.senderEmailDomain,
            }),
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: { name: 'contact_screening_result', strict: true, schema: OPENAI_JSON_SCHEMA },
        },
      },
      { timeout: 20_000 },
    );

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI screening response missing content');
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error('OpenAI screening response was not valid JSON');
    }

    if (!Value.Check(ScreeningResultSchema, parsed)) {
      throw new Error('OpenAI screening response failed schema validation');
    }

    // suggested_reply is legitimately empty for non-draft categories (media_press, legal,
    // opinion_no_action, spam_bounce), so it can't just be minLength'd in the schema like
    // internal_note was. But when suggested_action is draft_response, an empty reply means an
    // empty Zammad shared draft gets silently created with no error — enforce it here instead.
    if (parsed.suggested_action === 'draft_response' && !parsed.suggested_reply.trim()) {
      throw new Error('OpenAI screening response has an empty suggested_reply for a draft_response category');
    }

    return parsed;
  }
}
