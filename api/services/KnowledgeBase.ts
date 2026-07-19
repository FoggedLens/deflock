import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const KB_DIR = join(__dirname, '../kb');

export interface KbDocument {
  filename: string;
  content: string;
}

export function loadKnowledgeBase(dir: string = KB_DIR): KbDocument[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    // CLAUDE.md documents this directory's conventions for engineers — it's not grounding
    // content and must never be citable as a kb_reference.
    .filter(f => f.endsWith('.md') && f.toUpperCase() !== 'CLAUDE.MD')
    .sort()
    .map(filename => ({ filename, content: readFileSync(join(dir, filename), 'utf-8') }));
}

export function formatKnowledgeBaseForPrompt(docs: KbDocument[]): string {
  if (docs.length === 0) {
    return [
      '## Knowledge base',
      '',
      'No knowledge base documents are currently loaded. Always set kb_reference to "none". For',
      'donation, api_data, camera_correction, and other, this means you cannot ground a reply',
      'in policy yet — set suggested_action to internal_note_only rather than inventing an answer.',
    ].join('\n');
  }
  const sections = docs.map(d => `### ${d.filename}\n\n${d.content}`).join('\n\n---\n\n');
  return `## Knowledge base\n\nCite the filename of the document you draw from as kb_reference. If none of these\ndocuments cover the question, set kb_reference to "none".\n\n${sections}`;
}
