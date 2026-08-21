# Repository Instructions

This project is implemented incrementally by a lightweight model (cheap API model or local model) from a planning package under `docs/design/`, written by a separate, more capable planning pass. You are the implementer, not the planner. Follow this protocol on every session.

## Before touching any code

1. Read `docs/design/STATUS.md`. Find the first unchecked step.
2. Read only that step's entry in `docs/design/mvp-implementation-plan.md`, plus any doc it names by name (e.g. `public-api.md`, `data-model.md`). Do not read the entire `docs/design/` corpus — it isn't necessary and wastes context.
3. If `STATUS.md` or the named step doesn't exist, or the repo has no `docs/design/` directory:
	- If the user is asking to start a new project or plan first, run `.github/prompts/gather-requirements.prompt.md` (to produce `website-spec.md`) and then `.github/prompts/project-planner.prompt.md` (to produce `docs/design/`).
	- Otherwise stop and say the planning package is missing rather than guessing at scope.

## While implementing

- **Patch minimally.** Only change what the current step requires. If you think a larger rewrite is warranted, say so and ask — don't do it unprompted.
- Match every signature, type, and file path to what's specified in `public-api.md` / `data-model.md` exactly. If the step's instructions and a referenced doc disagree, the referenced doc wins — flag the discrepancy instead of silently picking one.
- Stay inside the step's declared "Files to create/modify" list and "Out of scope" boundary. If you discover the step is impossible without touching a file outside that list, stop and explain why rather than expanding scope silently.
- Add tests for new functionality: at minimum the happy path and one error path. Do not add snapshot tests or exhaustive edge-case suites unless the step asks for it — avoid test bloat.
- Include error handling and loading/empty states for anything user-facing; do not add speculative error handling for cases that can't occur.
- Responsive/accessible by default for anything UI-facing: labels on interactive elements, focus visible, reduced-motion fallback for animation, mobile-first layout.

## After implementing a step

1. Verify the step's acceptance criteria concretely (run the named test file/command; don't eyeball it).
2. Run through `docs/design/reference/review-checklist.md` if present (see the `/review-step` prompt).
3. Check the box for this step in `docs/design/STATUS.md`, update "Last updated" and "Current step," and log any deviation from the plan in the Notes section.
4. Commit: one commit per step, message `Step N: <short title>` matching the step's title in `mvp-implementation-plan.md`. Include the STATUS.md update in the same commit — never leave it uncommitted or bundled with the next step's work.
5. Stop. Do not cascade into the next step in the same session unless explicitly asked to — one step, one session, one reviewable diff.

## Stack conventions (defaults — defer to `docs/design/tradeoffs.md` if this repo's differ)

- TypeScript, strict mode, ESM only.
- pnpm for package management; pnpm workspaces + Turborepo if this is a monorepo.
- Next.js App Router for frontend. Default to a static build/export with no backend (see [Next.js: Deploying](https://nextjs.org/docs/app/getting-started/deploying)) — do not add API routes, Fastify, or Express unless `tradeoffs.md` states a concrete reason for a backend (auth, database writes, server-only secrets, realtime). If it does, use the normal or standalone Next.js build with Fastify (or Express if integrating with existing Express infra) for backend services.
- Zod for all validation — manifests, config, API boundaries, env vars alike. No hand-rolled validation.
- Postgres or SQLite for persistence (see `docs/design/tradeoffs.md` for which and why), via Drizzle or Prisma.
- Vitest + Testing Library + jest-dom for tests. For a plain HTML/CSS/JS project scoped per `docs/design/tradeoffs.md` (no build step), follow whatever lighter verification approach that doc states instead — Vitest assumes a Node toolchain the project may not have.
- ESLint + Prettier; do not hand-format around the linter's rules — fix the code or fix the config, not both ad hoc.
- SCSS modules or Tailwind per this repo's `tradeoffs.md` — do not mix both in the same component tree.

## After the MVP is complete

Once every step in `docs/design/STATUS.md` is checked, further small additions or fixes go through `.github/prompts/small-change.prompt.md`, not a full `project-planner` re-run. It follows the same patch-minimally discipline as `next-step.prompt.md`, but for one-off post-MVP work: it updates `public-api.md`/`data-model.md` if the change touches them, adds tests, and logs itself in `STATUS.md`'s "Post-MVP Changes" section instead of the phase checklist.

## Golden rule

If a prompt in this session asks for more than one step at once, implement only the first and say why you stopped there. If information needed to proceed is missing from `STATUS.md` and the referenced docs, ask rather than inventing a decision that should have been made during planning.
