# DeFlock API

A Fastify-based API service for DeFlock handling non-OSM related backend logic.

## Endpoints
- `/geocode?query=...` — Geocode a location
- `/sponsors/github?username=...` — Get GitHub sponsors
- `/healthcheck` — Health check

## Development

### Prerequisites
- [Bun](https://bun.sh/) installed

### Install dependencies
```sh
bun install
```

### Run locally
```sh
bun server.ts
```

## Deployment

Deployed via GitHub Actions on push to `master`.

## Environment Variables
Create a `.env` file in this directory with:
- `GITHUB_TOKEN` — Required for GitHub Sponsors endpoint
