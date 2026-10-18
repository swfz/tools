# tools

Collection of web tools for personal use. This is a Next.js application deployed to Vercel.

## Requirements

- Node.js: see `.node-version`
- pnpm: see `package.json#packageManager`

## Setup

```shell
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
```

Environment variables are optional for the default local setup. See `.env.example` when it exists; the application currently provides local defaults for external URLs and analytics.

## Development

Copy `.env.example` to `.env.local` only when overriding the optional local defaults. Vercel provides `VERCEL_URL` automatically in deployed environments.

```shell
pnpm dev
```

The development server is available at <http://localhost:3000>.

## Validation

```shell
pnpm lint
pnpm lint:format
pnpm exec tsc --noEmit
pnpm test:ci
pnpm test:e2e
pnpm build
```

## Structure

- `pages/`: Next.js pages and API routes
- `src/components/`: shared UI and GitHub contribution components
- `src/lib/`: reusable application logic
- `e2e/`: Playwright tests and the local external-API mock server
- `styles/`: global Tailwind CSS
- `public/`: static assets and the timer service worker

## Deployment and logs

Production is deployed to Vercel. Deployment and runtime logs are available from the Vercel project dashboard or with the Vercel CLI after authentication. Do not run deploy commands as part of local validation.
