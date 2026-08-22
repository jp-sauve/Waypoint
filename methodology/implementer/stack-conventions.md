# Stack conventions

Defaults — defer to `docs/design/tradeoffs.md` if a given project's differ.

- TypeScript, strict mode, ESM only.
- pnpm for package management; pnpm workspaces + Turborepo if this is a monorepo.
- Next.js App Router for frontend. Default to a static build/export with no backend (see [Next.js: Deploying](https://nextjs.org/docs/app/getting-started/deploying)) — do not add API routes, Fastify, or Express unless `tradeoffs.md` states a concrete reason for a backend (auth, database writes, server-only secrets, realtime). If it does, use the normal or standalone Next.js build with Fastify (or Express if integrating with existing Express infra) for backend services.
- Zod for all validation — manifests, config, API boundaries, env vars alike. No hand-rolled validation.
- Postgres or SQLite for persistence (see `docs/design/tradeoffs.md` for which and why), via Drizzle or Prisma.
- Vitest + Testing Library + jest-dom for tests. For a plain HTML/CSS/JS project scoped per `docs/design/tradeoffs.md` (no build step), follow whatever lighter verification approach that doc states instead — Vitest assumes a Node toolchain the project may not have.
- ESLint + Prettier; do not hand-format around the linter's rules — fix the code or fix the config, not both ad hoc.
- SCSS modules or Tailwind per this repo's `tradeoffs.md` — do not mix both in the same component tree.
