# Blackstar AI

A portfolio-grade, Vercel-Hobby-friendly AI workflow automation studio inspired by visual workflow builders, but designed around speed, inspectability and local-first execution.

## What makes it different
- Visual workflow canvas with typed nodes, branching and data inspection.
- Local-first persistence in IndexedDB/localStorage; no database required.
- TypeScript/React orchestration engine for browser execution.
- Python execution/analysis endpoint for Vercel Functions.
- Rust reference implementation for high-speed deterministic transforms.
- Built-in AI Copilot that can generate workflow blueprints from natural language.
- Optional free Hugging Face inference; the app remains functional without it.
- Light/dark Vercel-like theme.
- Import/export workflow JSON.
- Execution history, run inspector, validation and templates.

## Vercel Hobby architecture
The app is intentionally stateless on the server. Workflows live in the browser. Python is deployed as a Vercel Function under `/api`. This avoids a persistent backend/database. Vercel currently supports Python Functions and Rust runtimes; Python bundles are limited to 500 MB on the standard path. Hobby includes free function usage within its limits. See Vercel docs for current limits.

## Run locally
```bash
npm install
npm run dev
```
Open http://localhost:3000.

## Deploy
Push to GitHub, import the repository into Vercel, and deploy. No database is required. Optionally add `HF_TOKEN` and `HF_MODEL` for remote AI generation.

## Project structure
- `app/` Next.js application shell and API routes
- `components/` canvas, node library, inspector, command palette, UI
- `lib/` workflow engine, validation, AI providers, persistence helpers
- `python/` Python workflow utilities exposed as Vercel Functions
- `rust/` high-performance transform reference module
- `types/` shared workflow contracts
- `tests/` deterministic engine tests
