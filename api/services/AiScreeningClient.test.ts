import { describe, it, expect } from 'bun:test';
import { AiScreeningClient } from './AiScreeningClient';

function makeStubOpenAi(create: (...args: any[]) => Promise<any>) {
  return { chat: { completions: { create } } } as any;
}

const validResult = {
  ai_category: 'media_press',
  media_tier: 'big_media',
  confidence: 0.9,
  kb_reference: 'none',
  suggested_action: 'escalate_urgent',
  suggested_reply: '',
  internal_note: 'Reporter from a national outlet asking for comment, no stated deadline.',
  risk_flags: [],
};

function completionWith(content: string) {
  return { choices: [{ message: { content } }] };
}

describe('AiScreeningClient.screen', () => {
  it('sends the system prompt, structured response_format, and a user message with only topic/subject/message/senderEmailDomain', async () => {
    let capturedArgs: any;
    let capturedOptions: any;
    const create = async (args: any, options: any) => {
      capturedArgs = args;
      capturedOptions = options;
      return completionWith(JSON.stringify(validResult));
    };

    const client = new AiScreeningClient(makeStubOpenAi(create));
    await client.screen({
      topic: 'media',
      subject: 'Feature pitch',
      message: 'We would like to interview your team.',
      senderEmailDomain: 'nytimes.com',
    });

    expect(capturedArgs.messages[0].role).toBe('system');
    expect(capturedArgs.messages[0].content.length).toBeGreaterThan(0);
    expect(capturedArgs.response_format.type).toBe('json_schema');
    expect(capturedArgs.response_format.json_schema.strict).toBe(true);

    const userContent = JSON.parse(capturedArgs.messages[1].content);
    expect(userContent).toEqual({
      topic: 'media',
      subject: 'Feature pitch',
      message: 'We would like to interview your team.',
      senderEmailDomain: 'nytimes.com',
    });
    expect(capturedOptions.timeout).toBe(20_000);
  });

  it('constrains kb_reference to "none" plus whatever .md filenames are actually loaded from kb/', async () => {
    let capturedArgs: any;
    const create = async (args: any) => {
      capturedArgs = args;
      return completionWith(JSON.stringify(validResult));
    };

    const client = new AiScreeningClient(makeStubOpenAi(create));
    await client.screen({ topic: 'media', subject: 'x', message: 'y', senderEmailDomain: '' });

    const enumValues: string[] = capturedArgs.response_format.json_schema.schema.properties.kb_reference.enum;
    expect(enumValues).toContain('none');
    // Every non-"none" value must correspond to a real, loaded .md file — never an invented name.
    for (const value of enumValues) {
      if (value !== 'none') expect(value.endsWith('.md')).toBe(true);
    }
  });

  it('parses a valid structured response into a ScreeningResult', async () => {
    const create = async () => completionWith(JSON.stringify(validResult));
    const client = new AiScreeningClient(makeStubOpenAi(create));

    const result = await client.screen({
      topic: 'media',
      subject: 'x',
      message: 'y',
      senderEmailDomain: 'nytimes.com',
    });

    expect(result).toEqual(validResult);
  });

  it('throws when the SDK call rejects', async () => {
    const create = async () => { throw new Error('OpenAI request failed: 500 boom'); };
    const client = new AiScreeningClient(makeStubOpenAi(create));

    await expect(client.screen({ topic: 'media', subject: 'x', message: 'y', senderEmailDomain: '' }))
      .rejects.toThrow('OpenAI request failed: 500 boom');
  });

  it('throws when the response has no content', async () => {
    const create = async () => ({ choices: [{ message: {} }] });
    const client = new AiScreeningClient(makeStubOpenAi(create));

    await expect(client.screen({ topic: 'media', subject: 'x', message: 'y', senderEmailDomain: '' }))
      .rejects.toThrow('OpenAI screening response missing content');
  });

  it('throws when the content is not valid JSON', async () => {
    const create = async () => completionWith('not json');
    const client = new AiScreeningClient(makeStubOpenAi(create));

    await expect(client.screen({ topic: 'media', subject: 'x', message: 'y', senderEmailDomain: '' }))
      .rejects.toThrow('OpenAI screening response was not valid JSON');
  });

  it('throws when the parsed JSON fails schema validation', async () => {
    const { ai_category, ...incomplete } = validResult;
    const create = async () => completionWith(JSON.stringify(incomplete));
    const client = new AiScreeningClient(makeStubOpenAi(create));

    await expect(client.screen({ topic: 'media', subject: 'x', message: 'y', senderEmailDomain: '' }))
      .rejects.toThrow('OpenAI screening response failed schema validation');
  });

  it('throws when a value is outside the enum (e.g. an unrecognized ai_category)', async () => {
    const create = async () => completionWith(JSON.stringify({ ...validResult, ai_category: 'made_up_category' }));
    const client = new AiScreeningClient(makeStubOpenAi(create));

    await expect(client.screen({ topic: 'media', subject: 'x', message: 'y', senderEmailDomain: '' }))
      .rejects.toThrow('OpenAI screening response failed schema validation');
  });

  it('throws when internal_note is an empty string, rather than silently allowing a blank note', async () => {
    const create = async () => completionWith(JSON.stringify({ ...validResult, internal_note: '' }));
    const client = new AiScreeningClient(makeStubOpenAi(create));

    await expect(client.screen({ topic: 'media', subject: 'x', message: 'y', senderEmailDomain: '' }))
      .rejects.toThrow('OpenAI screening response failed schema validation');
  });

  it('throws when suggested_action is draft_response but suggested_reply is empty, rather than silently creating a blank shared draft', async () => {
    const create = async () => completionWith(JSON.stringify({
      ...validResult,
      ai_category: 'camera_report',
      suggested_action: 'draft_response',
      suggested_reply: '',
    }));
    const client = new AiScreeningClient(makeStubOpenAi(create));

    await expect(client.screen({ topic: 'media', subject: 'x', message: 'y', senderEmailDomain: '' }))
      .rejects.toThrow('OpenAI screening response has an empty suggested_reply for a draft_response category');
  });

  it('allows an empty suggested_reply for non-draft_response actions', async () => {
    const create = async () => completionWith(JSON.stringify(validResult)); // escalate_urgent, empty reply
    const client = new AiScreeningClient(makeStubOpenAi(create));

    const result = await client.screen({ topic: 'media', subject: 'x', message: 'y', senderEmailDomain: '' });
    expect(result.suggested_reply).toBe('');
  });

  it('passes when suggested_action is draft_response and suggested_reply is populated', async () => {
    const create = async () => completionWith(JSON.stringify({
      ...validResult,
      ai_category: 'camera_report',
      suggested_action: 'draft_response',
      suggested_reply: 'Here is how to report it yourself...',
    }));
    const client = new AiScreeningClient(makeStubOpenAi(create));

    const result = await client.screen({ topic: 'media', subject: 'x', message: 'y', senderEmailDomain: '' });
    expect(result.suggested_reply).toBe('Here is how to report it yourself...');
  });
});
