# api/

Fastify server run directly on Bun (no build step — Bun executes the TypeScript as-is).
Deployed as a long-running process on a VPS via systemd (see `.github/workflows/`), **not**
serverless. That's a load-bearing fact for how background work is structured below.

Handles everything for DeFlock that isn't OpenStreetMap map data: geocoding proxy
(Nominatim), GitHub sponsors, and the contact form.

## Conventions

- No ORM/DB. Every external service gets its own thin client class in `services/` that talks
  to that service's HTTP API directly via native `fetch` (or, where the service already has an
  official SDK in use elsewhere in this org, that SDK — e.g. `AiScreeningClient` uses the
  `openai` package). See `ZammadClient`, `NominatimClient`, `GithubClient`, `TurnstileClient`.
- Config/data that isn't a secret is checked into git and read at startup, not hardcoded and
  not fetched at runtime — e.g. `data/zipcodes-us.json`, `prompts/contact-screening.md`, and
  `../kb/*.md`. Editing these requires a server restart to take effect (loaded once at module
  init).
- OpenTelemetry (`telemetry.ts`) exports logs/metrics to Grafana Cloud via a local otelcol
  sidecar. Errors are bucketed by a substring-matching `classifyErrorMessage()` in `server.ts`
  — new upstream integrations should extend that rather than inventing a separate error-typing
  scheme.
- Tests use `bun:test`. Prefer dependency injection (pass a stub client/SDK instance into the
  constructor or function) over mocking `global.fetch` when the thing being tested isn't
  itself an HTTP client — see `ContactScreeningService.test.ts` vs `ZammadClient.test.ts`.

## Contact form + AI screening

**Intent**: the volunteer support team gets more contact-form messages than they can
individually triage. Every submission that passes Cloudflare Turnstile gets a first pass from
an AI classifier before a human sees it — unless the sender explicitly opts out via a
checkbox on the form. The AI never sends anything to a customer directly; it only drafts,
tags, and prioritizes for a human to review in Zammad.

**Ordering matters**: the Zammad ticket is always created synchronously and the user gets
their success response immediately. AI screening then runs as fire-and-forget background work
*after* the response is sent — it relies on this process staying alive to finish, which is
only safe because this is a persistent server, not a serverless function. A screening failure
(OpenAI down, bad response, Zammad write failure) never blocks ticket creation or crashes the
process — it just gets tagged/logged and a human handles that ticket without AI assistance,
same as before this feature existed.

**Where the classification logic lives**: the taxonomy, tone, and per-category instructions
are entirely in `prompts/contact-screening.md` (checked into git, not in TypeScript) so
non-engineers can review/iterate on classifier behavior like any other reviewed change. Code
(`ContactScreeningService.ts`) only translates the AI's structured output into Zammad actions
(tags, priority, group, shared draft vs. internal note, scheduled close) — it deliberately
does *not* contain classification judgment calls itself, except for hard safety backstops
(e.g. force-tagging) that shouldn't depend on the model remembering a rule. When product
behavior changes (new category, new disposition), expect to change the prompt first and the
plan/orchestration code second — they're meant to stay in sync but are two different kinds of
change (policy vs. mechanism).

**Dry-run endpoint**: `POST /contact/message/dry-run` runs the same classifier + planning
logic with no Turnstile check and no Zammad writes, for testing prompt/taxonomy changes
quickly. It has no auth — fine for local dev, but don't expose it publicly without adding
some, since it's a free OpenAI-call relay otherwise.
