import { describe, it, expect, mock } from 'bun:test';
import { planZammadActions, screenContactSubmission } from './ContactScreeningService';
import type { ScreeningResult } from './AiScreeningClient';

const base: ScreeningResult = {
  ai_category: 'other',
  media_tier: 'not_applicable',
  confidence: 0.5,
  kb_reference: 'none',
  suggested_action: 'internal_note_only',
  suggested_reply: '',
  internal_note: 'Unclear request.',
  risk_flags: [],
};

function makeDeps(screenResult: ScreeningResult) {
  const addTag = mock(async () => {});
  const addInternalNote = mock(async () => {});
  const setTicketFields = mock(async () => {});
  const upsertSharedDraft = mock(async () => {});
  const aiClient = { screen: mock(async () => screenResult) } as any;
  const zammadClient = { addTag, addInternalNote, setTicketFields, upsertSharedDraft } as any;
  return { aiClient, zammadClient, addTag, addInternalNote, setTicketFields, upsertSharedDraft };
}

describe('planZammadActions', () => {
  it('media_press (big_media): escalates, tags media + media-big, bumps priority, routes to Media group, no shared draft, writes a note', () => {
    const plan = planZammadActions({
      ...base,
      ai_category: 'media_press',
      media_tier: 'big_media',
      suggested_action: 'escalate_urgent',
      internal_note: 'AP reporter, deadline Friday.',
    });

    expect(plan.tags).toEqual(expect.arrayContaining(['ai-screened', 'media', 'media-big']));
    expect(plan.tags).not.toContain('media-small');
    expect(plan.priorityUpdate).toBe('3 high');
    expect(plan.groupOverride).toBe('Media');
    expect(plan.sharedDraft).toBeNull();
    expect(plan.noteBody).toBe('AP reporter, deadline Friday.');
    expect(plan.state).toBeNull();
  });

  it('media_press (small_media): tags media + media-small, still escalates and routes to Media group', () => {
    const plan = planZammadActions({ ...base, ai_category: 'media_press', media_tier: 'small_media', suggested_action: 'escalate_urgent' });

    expect(plan.tags).toContain('media-small');
    expect(plan.tags).not.toContain('media-big');
    expect(plan.groupOverride).toBe('Media');
    expect(plan.priorityUpdate).toBe('3 high');
  });

  it('legal: escalates, tags legal, bumps priority, does not route to Media group', () => {
    const plan = planZammadActions({ ...base, ai_category: 'legal', suggested_action: 'escalate_urgent' });
    expect(plan.tags).toContain('legal');
    expect(plan.priorityUpdate).toBe('3 high');
    expect(plan.groupOverride).toBeNull();
  });

  it('camera_correction: tags camera-correction and is KB-grounded (kb-gap when uncited)', () => {
    const plan = planZammadActions({ ...base, ai_category: 'camera_correction', suggested_action: 'draft_response', kb_reference: 'none' });
    expect(plan.tags).toContain('camera-correction');
    expect(plan.tags).toContain('kb-gap');
  });

  it('technical_bug: writes both a shared draft and an internal note', () => {
    const plan = planZammadActions({ ...base, ai_category: 'technical_bug', suggested_action: 'draft_response', internal_note: 'Map fails to load on Safari.' });
    expect(plan.sharedDraft).not.toBeNull();
    expect(plan.noteBody).toBe('Map fails to load on Safari.');
    expect(plan.tags).toContain('technical-bug');
  });

  it('local_group_request: writes both a shared draft and an internal note summary', () => {
    const plan = planZammadActions({ ...base, ai_category: 'local_group_request', suggested_action: 'draft_response', internal_note: 'Wants to start a group in Ohio.' });
    expect(plan.sharedDraft).not.toBeNull();
    expect(plan.noteBody).toBe('Wants to start a group in Ohio.');
  });

  it('opinion_no_action: schedules a pending close, no draft, priority set to low', () => {
    const plan = planZammadActions({ ...base, ai_category: 'opinion_no_action', suggested_action: 'scheduled_close', internal_note: 'Unsolicited opinion.' });
    expect(plan.sharedDraft).toBeNull();
    expect(plan.state).toBe('pending close');
    expect(plan.pendingTime).not.toBeNull();
    expect(plan.priorityUpdate).toBe('1 low');
    expect(plan.noteBody).toBe('Unsolicited opinion.');
  });

  it('spam_bounce: schedules a pending close via auto_delete, priority set to low', () => {
    const plan = planZammadActions({ ...base, ai_category: 'spam_bounce', suggested_action: 'auto_delete', internal_note: 'Spam.' });
    expect(plan.state).toBe('pending close');
    expect(plan.pendingTime).not.toBeNull();
    expect(plan.sharedDraft).toBeNull();
    expect(plan.priorityUpdate).toBe('1 low');
  });

  it('donation/api_data/other/camera_correction: tag kb-gap when kb_reference is none', () => {
    const plan = planZammadActions({ ...base, ai_category: 'donation', suggested_action: 'internal_note_only', kb_reference: 'none' });
    expect(plan.tags).toContain('kb-gap');
  });

  it('camera_report and local_group_request are also KB-grounded and tag kb-gap when kb_reference is none', () => {
    const cameraReport = planZammadActions({ ...base, ai_category: 'camera_report', suggested_action: 'draft_response', kb_reference: 'none' });
    expect(cameraReport.tags).toContain('kb-gap');

    const localGroup = planZammadActions({ ...base, ai_category: 'local_group_request', suggested_action: 'draft_response', kb_reference: 'none' });
    expect(localGroup.tags).toContain('kb-gap');
  });

  it('does not tag kb-gap when a kb_reference was cited', () => {
    const plan = planZammadActions({ ...base, ai_category: 'donation', suggested_action: 'draft_response', kb_reference: 'donations.md' });
    expect(plan.tags).not.toContain('kb-gap');
  });

  it('does not tag kb-gap for categories that are not KB-grounded', () => {
    const plan = planZammadActions({ ...base, ai_category: 'technical_bug', suggested_action: 'draft_response', kb_reference: 'none' });
    expect(plan.tags).not.toContain('kb-gap');
  });

  it('prefixes risk_flags as stackable tags', () => {
    const plan = planZammadActions({ ...base, risk_flags: ['abusive_or_threatening'] });
    expect(plan.tags).toContain('risk:abusive_or_threatening');
  });

  it('always includes the ai_category ticket attribute', () => {
    const plan = planZammadActions({ ...base, ai_category: 'donation' });
    expect(plan.ticketAttribute).toEqual({ ai_category: 'donation' });
  });

  it('does not route non-media categories to the Media group', () => {
    const plan = planZammadActions({ ...base, ai_category: 'donation' });
    expect(plan.groupOverride).toBeNull();
  });
});

describe('screenContactSubmission', () => {
  it('sets ticket fields, applies tags, writes the shared draft, and still leaves an internal note summary', async () => {
    const deps = makeDeps({ ...base, ai_category: 'local_group_request', suggested_action: 'draft_response', suggested_reply: 'Here is how to start a group...', internal_note: 'Wants to start a group in Ohio.' });

    await screenContactSubmission(
      { ticketId: 1, topic: 'local-groups', subject: 's', message: 'm', senderEmailDomain: '', replyTo: 'jane@example.com' },
      deps,
    );

    expect(deps.setTicketFields).toHaveBeenCalledWith(1, { ai_category: 'local_group_request' });
    expect(deps.upsertSharedDraft).toHaveBeenCalledWith(1, 'Here is how to start a group...', { to: 'jane@example.com', cc: undefined });
    expect(deps.addInternalNote).toHaveBeenCalledTimes(1);
    expect(deps.addInternalNote.mock.calls[0][1]).toContain('Wants to start a group in Ohio.');
    const appliedTags = deps.addTag.mock.calls.map(c => c[1]);
    expect(appliedTags).toContain('ai-screened');
    expect(appliedTags).not.toContain('draft-fallback');
  });

  it('returns the classification result and plan for the caller to log/inspect', async () => {
    const deps = makeDeps({ ...base, ai_category: 'local_group_request', suggested_action: 'draft_response', suggested_reply: 'Draft text' });

    const outcome = await screenContactSubmission(
      { ticketId: 1, topic: 'local-groups', subject: 's', message: 'm', senderEmailDomain: '', replyTo: 'jane@example.com' },
      deps,
    );

    expect(outcome.result.ai_category).toBe('local_group_request');
    expect(outcome.plan.sharedDraft).not.toBeNull();
    expect(outcome.appliedTags).toContain('ai-screened');
    expect(outcome.noteWritten).toBe(true);
  });

  it('falls back to an internal note with a draft-fallback tag when the shared draft write fails', async () => {
    const deps = makeDeps({ ...base, ai_category: 'local_group_request', suggested_action: 'draft_response', suggested_reply: 'Draft text' });
    deps.upsertSharedDraft.mockImplementation(async () => { throw new Error('shared_drafts not enabled on this group'); });

    await screenContactSubmission(
      { ticketId: 2, topic: 'local-groups', subject: 's', message: 'm', senderEmailDomain: '', replyTo: 'jane@example.com' },
      deps,
    );

    const appliedTags = deps.addTag.mock.calls.map(c => c[1]);
    expect(appliedTags).toContain('draft-fallback');
    expect(deps.addInternalNote).toHaveBeenCalledTimes(1);
    const noteBody = deps.addInternalNote.mock.calls[0][1];
    expect(noteBody).toContain('Draft text');
  });

  it('includes priority/group in the single ticket-fields update for a big media inquiry', async () => {
    const deps = makeDeps({ ...base, ai_category: 'media_press', media_tier: 'big_media', suggested_action: 'escalate_urgent' });

    await screenContactSubmission(
      { ticketId: 3, topic: 'questions-comments', subject: 's', message: 'm', senderEmailDomain: '', replyTo: 'jane@example.com' },
      deps,
    );

    const fields = deps.setTicketFields.mock.calls[0][1];
    expect(fields.ai_category).toBe('media_press');
    expect(fields.priority).toBe('3 high');
    expect(fields.group).toBe('Media');
  });

  it('sets low priority and pending close for spam_bounce', async () => {
    const deps = makeDeps({ ...base, ai_category: 'spam_bounce', suggested_action: 'auto_delete' });

    await screenContactSubmission(
      { ticketId: 4, topic: 'questions-comments', subject: 's', message: 'm', senderEmailDomain: '', replyTo: 'jane@example.com' },
      deps,
    );

    const fields = deps.setTicketFields.mock.calls[0][1];
    expect(fields.priority).toBe('1 low');
    expect(fields.state).toBe('pending close');
  });

  it('propagates a rejection from the AI client without swallowing it', async () => {
    const zammadClient = {
      addTag: mock(async () => {}),
      addInternalNote: mock(async () => {}),
      setTicketFields: mock(async () => {}),
      upsertSharedDraft: mock(async () => {}),
    } as any;
    const aiClient = { screen: mock(async () => { throw new Error('OpenAI down'); }) } as any;

    await expect(screenContactSubmission(
      { ticketId: 5, topic: 'media', subject: 's', message: 'm', senderEmailDomain: '', replyTo: 'jane@example.com' },
      { aiClient, zammadClient },
    )).rejects.toThrow('OpenAI down');

    expect(zammadClient.setTicketFields).not.toHaveBeenCalled();
  });
});
