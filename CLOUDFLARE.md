# Cloudflare Pages deployment

This project uses a server-rendered Vinext Worker, not a static Next.js export.
The original `build` command remains available for Sites hosting.

## Git integration

- Repository: Venkatanithinp/venkata-nithin-portfolio
- Project name: venkata-nithin-p-portfolio-a1b2c3d4e5f6 (subject to availability)
- Production branch: main
- Framework preset: None
- Build command: npm run build:pages
- Output directory: dist/pages
- Root directory: repository root (leave empty)
- Build variables: NODE_VERSION=24.19.0 and PNPM_VERSION=11.25.0

In the Pages project's runtime settings, set compatibility date `2026-05-15`
and compatibility flag `nodejs_compat` for production and preview. If the initial
build starts before runtime settings can be changed, set these and retry it.

The build generates a Pages advanced-mode `_worker.js` module directory and
`_routes.json`. Static assets bypass the Worker. Do not upload `dist/server`
or use its placeholder database/storage bindings for production.

## Required backend setup

Before treating the migration as complete:

1. Create a D1 database in your Cloudflare account and bind it as `DB`.
2. Apply the SQL migrations in `drizzle/` in filename order.
3. Create a private R2 bucket and bind it as `BUCKET`.
4. Configure new server-side secrets `ADMIN_AUTH_SECRET`, `ADMIN_SETUP_HASH`,
   and `ADMIN_SETUP_EXPIRES`. The setup hash is SHA-256 of a random one-time
   setup code; expiry is a future Unix timestamp in milliseconds.
5. Redeploy after changing bindings or secrets. Open `/admin` to initialize
   your own username/password and optional authenticator using the setup code.
6. Verify contact submission, pending/approved feedback, admin login, and
   resume upload/publish/download on the deployed URL.

Secrets, setup codes, database contents, and uploaded resumes must never be
committed to GitHub. The old host's data and credentials do not automatically
move to Cloudflare. Export/import them securely if preserving that data.
No paid LLM API is needed for the approved-information assistant.

## Local verification

Run `npm run build:pages`, `npm run typecheck`, and
`node scripts/check-server.mjs`. To serve the Pages package locally:

```sh
npx wrangler pages dev dist/pages --compatibility-date=2026-05-15 --compatibility-flag=nodejs_compat --d1=DB --r2=BUCKET
```

A fresh local database needs migrations before database endpoints can succeed.
