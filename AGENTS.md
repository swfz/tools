# AGENTS.md

## Repository overview

This repository is a Next.js service containing small browser tools. It is deployed to Vercel.

## Setup

Use the versions pinned by `.node-version` and `package.json#packageManager`.

```shell
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
```

Environment variables and their local defaults are documented in `.env.example` when present. Never commit real credentials.

## Development and validation

```shell
pnpm dev
pnpm lint
pnpm lint:format
pnpm exec tsc --noEmit
pnpm test:ci
pnpm test:e2e
pnpm build
```

Run the relevant tests first, then run every validation command above before committing. Add tests for new behavior and regression tests for bug fixes. Do not deploy while validating a change.

## Architecture

- `pages/`: page entry points and API routes
- `src/components/`: shared UI and contribution-view components
- `src/lib/`: reusable application logic
- `e2e/`: Playwright tests; `mock-server.mjs` replaces external APIs
- `.github/workflows/`: CI and lint workflows
- `public/`: static assets and the timer service worker

## Deployment and observability

Vercel hosts production. Inspect deployment and runtime logs in the Vercel project dashboard or through the authenticated Vercel CLI. GitHub Actions logs cover build, unit-test, and lint failures. Do not run `vercel deploy` or other deployment commands from an agent task.

Application logs are written through `src/lib/logger.ts` as one-line JSON (`{"level","msg","ts",...fields}`), so runtime logs can be filtered by `level` (`debug` / `info` / `warn` / `error`). Do not call `console.*` directly outside the logger.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
