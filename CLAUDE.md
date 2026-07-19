# DeFlock

DeFlock is a privacy-advocacy project that maps automated license plate readers (ALPRs)
being deployed across the US (and beyond). The goal is to make mass ALPR surveillance
visible to the public.

## Where the data actually lives

ALPR locations are **not** stored in a DeFlock-owned database — they live in OpenStreetMap
itself, tagged with a standardized ALPR schema, and anyone can add/edit one directly via the
DeFlock app or OSM's iD editor. This repo's frontend reads that data (via Overpass / map
tiles); it doesn't own it. Keep this in mind before assuming any "camera data" lives in this
repo or behind an API here — it doesn't.

## Repo layout

- `webapp/` — Vue 3 + Vuetify + MapLibre GL frontend (the public site at deflock.org).
- `api/` — Fastify/Bun backend for everything that *isn't* OSM map data: geocoding, GitHub
  sponsors, and the contact form (including AI-assisted triage into Zammad). See
  `api/CLAUDE.md`.
- `kb/` — knowledge base markdown consumed by the AI contact-screening classifier in `api/`.
  See `kb/CLAUDE.md`.
- `cms/` — Directus CMS (content management for site content, e.g. blog).
- `serverless/`, `terraform/` — AWS Lambda batch jobs (scheduled, not request-driven) for
  ALPR stats/counts and caching, provisioned via Terraform.
- `scripts/` — misc one-off/maintenance scripts.

## Support workflow

User contact/support runs through a Zammad helpdesk instance (`pigeon.deflock.org`), not
through this repo's own storage. The webapp's contact form posts to `api/`, which creates the
Zammad ticket and (unless the sender opts out) kicks off AI triage. Support volume is high
relative to the (volunteer) team size, which is the entire reason the AI screening subsystem
in `api/` exists — see `api/CLAUDE.md` for how that's structured.

## Dev environment

Both `api/` and `webapp/` use [Bun](https://bun.sh/) (`bun install`, `bun dev`). There's no
monorepo tool tying them together — each has its own `package.json` and is developed/deployed
independently.
