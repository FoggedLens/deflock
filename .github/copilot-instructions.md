# Copilot Instructions

This monorepo contains multiple subprojects. Below are the specific instructions for each.

## Web Application
/webapp

This is a TypeScript + Vue 3 + Vuetify application.

### Architecture
- Vue 3 (Composition API)
- State management is local-first; avoid global stores unless required
- Vuetify for UI components and styling

### Page Structure
- Each page resides in `src/views`
- Shared components go in `src/components`
- Styles are scoped to components; avoid global styles unless necessary
- Prefer helper classes (provided by Vuetify) for styling over CSS rules
- Wrap most pages in DefaultLayout.vue for consistent headers/footers
- Use the Hero component for prominent page headings

### Coding Style
- Prefer functional patterns

### Security & Privacy
- Never log PII
- Do not introduce tracking, analytics, or telemetry

### General Rules
- Do not generate placeholder logic
- If something is unknown, leave a TODO comment
- Prefer simple, readable solutions over clever ones

## Backend Service
/shotgun

This is being deprecated. No new features should be added. Backend functionality should be migrated to serverless functions where possible.

## Terraform
/terraform

This contains Terraform code for infrastructure management.

## Serverless Functions
/serverless

This contains serverless functions to support the web application.