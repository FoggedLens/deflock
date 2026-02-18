# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

DeFlock is a crowdsourced tool for locating and reporting Automatic License Plate Reader (ALPR) cameras, built on OpenStreetMap data. Live at https://deflock.org.

## Quick Start

```bash
# Frontend
cd webapp && npm install && npm run dev        # http://localhost:5173

# API (requires Bun)
cd api && bun install && bun server.ts         # http://localhost:3000
```

## Build & Check

```bash
# Frontend
cd webapp
npm run build            # Production build (Vite)
npm run type-check       # vue-tsc

# Serverless (Python 3.14)
cd serverless/alpr_counts/src && pip install -r requirements.txt && python alpr_counts.py
cd serverless/alpr_cache/src  && pip install -r requirements.txt && python alpr_cache.py
cd serverless/blog_scraper && uv sync && uv run main.py

# Infrastructure
cd terraform && terraform plan && terraform apply
```

## Repo Layout

```
webapp/          Vue 3 + TypeScript + Vuetify frontend (npm/Vite)
api/             Fastify + TypeScript API (Bun runtime)
serverless/
  alpr_counts/   Python — hourly ALPR count aggregation
  alpr_cache/    Python — daily map tile cache generation
  blog_scraper/  Python (uv) — RSS-to-Directus CMS sync
terraform/       AWS infra (Lambda, S3, CloudWatch, SNS)
scripts/         Utilities (Directus backup)
```

## Conventions

- Functional patterns; simple and readable over clever
- No tracking, analytics, or telemetry; never log PII
- No placeholder logic; use `TODO` comments for unknowns
- The Scala backend (`shotgun/`) is deprecated and deleted; do not recreate it

### Frontend-specific

- Vue 3 Composition API; local-first state (Pinia only when truly global)
- Vuetify helper classes over custom CSS; always scoped styles
- Pages in `src/views/`, shared components in `src/components/`
- Wrap pages in `DefaultLayout.vue`; use `Hero` component for page headings

## Architecture

### Data Flow

```
Overpass API ──daily──▶ alpr_cache Lambda ──▶ S3 tile JSONs ──▶ Leaflet map (webapp)
Overpass API ──hourly─▶ alpr_counts Lambda ─▶ S3 counts JSON ─▶ ALPRCounter (webapp)
RSS feed ──30 min────▶ blog_scraper Lambda ─▶ Directus CMS ───▶ Blog views (webapp)
```

The frontend reads pre-cached data from S3 and Directus — it never queries Overpass directly.

### Frontend (webapp/)

- Leaflet with marker clustering (`LeafletMap.vue`) renders ALPR locations from S3 tile JSONs
- Types in `src/types.ts` (ALPR, LprVendor); constants in `src/constants.ts`
- Stores in `src/stores/` — `global`, `tiles`, `vendorStore`

### API (api/)

- Fastify with TypeBox schema validation
- `/geocode?query=...` — Nominatim proxy with file-based 24-hour cache
- `/sponsors/github?username=...` — GitHub GraphQL (requires `GITHUB_TOKEN` in `.env`)
- `/healthcheck` — HEAD only

### Serverless Functions

All are Python 3.14 AWS Lambdas deployed via Terraform (not GitHub Actions).

- **alpr_counts** — Queries Overpass for US ALPR counts, fetches "recent wins" from Directus, writes JSON to S3. Uses threading.
- **alpr_cache** — Queries Overpass for all ALPR nodes globally, segments into 20-degree tiles, filters to whitelisted OSM tags, uploads per-tile JSONs + index to S3. Uses ThreadPoolExecutor.
- **blog_scraper** — Parses `haveibeenflocked.com/feed.xml` RSS, syncs to Directus `blog` collection. Idempotent: creates, updates, deletes. Preserves manually-created posts (those without `externalUrl`).

## Deployment

- **Frontend**: Static build (`npm run build` produces `dist/`)
- **API**: GitHub Actions on push to `master` — rsync to VPS, restart `deflock-api` systemd service
- **Lambdas**: `terraform apply` from `terraform/` (target individual modules with `-target=module.<name>`)

## Environment Variables

| Component | Variable | Required | Notes |
|---|---|---|---|
| api/ | `GITHUB_TOKEN` | Yes | GitHub sponsors endpoint |
| blog_scraper | `DIRECTUS_API_TOKEN` | Yes | Directus CMS access |
| blog_scraper | `DIRECTUS_BASE_URL` | No | Defaults to `https://cms.deflock.me` |
| terraform/ | `directus_api_token` | Yes | In `terraform.tfvars` (gitignored) |
| terraform/ | `alarm_phone_number` | Yes | SNS failure alerts |
