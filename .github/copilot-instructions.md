# Copilot Instructions

DeFlock — crowdsourced ALPR mapping tool. See `CLAUDE.md` for full project documentation, commands, architecture, and data flow.

## Conventions

- Functional patterns; simple and readable over clever
- No tracking, analytics, or telemetry; never log PII
- No placeholder logic; use `TODO` comments for unknowns
- The Scala backend (`shotgun/`) is deprecated and deleted; do not recreate it

### Frontend (webapp/)

- Vue 3 Composition API; local-first state (Pinia only when truly global)
- Vuetify helper classes over custom CSS; always scoped styles
- Pages in `src/views/`, shared components in `src/components/`
- Wrap pages in `DefaultLayout.vue`; use `Hero` component for page headings

### API (api/)

Fastify + TypeScript on Bun. See `api/README.md` for endpoints.

### Serverless (serverless/)

Python 3.14 AWS Lambda functions. Deployed via Terraform.

### Infrastructure (terraform/)

Terraform for AWS resource management.
