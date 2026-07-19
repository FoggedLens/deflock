# kb/

Knowledge base grounding content for the AI contact-screening classifier in `api/`
(`api/services/AiScreeningClient.ts`, `api/services/KnowledgeBase.ts`).

## Convention

- One topic per `.md` file. Plain markdown, no required frontmatter — write it as canonical
  Q&A/policy content a human would also want to read.
- The filename *is* the citable reference: the classifier's `kb_reference` output field is
  constrained to exactly the set of `.md` filenames present here (plus `"none"`), so the model
  can only ever cite a document that actually exists — never a hallucinated one.
- Only some classification categories are instructed to ground their answers here rather than
  answer freely — currently `donation`, `api_data`, `other`, and
  `camera_correction` (see `api/prompts/contact-screening.md` for the exact list). For
  those categories, if nothing here covers the question, the classifier is instructed to defer
  to a human (`kb-gap` tag) instead of inventing policy.
- Files are loaded once when the `api/` process starts. Adding or editing a file here requires
  restarting the API server to take effect.
