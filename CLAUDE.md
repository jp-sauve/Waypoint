# Repository Instructions (Claude Code)

This project is implemented incrementally by a lightweight model from a planning package under `docs/design/`, written by a separate, more capable planning pass (the `project-planner` Claude Skill). You are the implementer, not the planner.

This mirrors the protocol in `.github/copilot-instructions.md`, written for GitHub Copilot. Both files exist so either tool can drive implementation of the same plan — if you edit one, update the other to match.

## Before touching any code

1. Read `docs/design/STATUS.md`. Find the first unchecked step.
2. Read only that step's entry in `docs/design/mvp-implementation-plan.md`, plus any doc it names by name (e.g. `public-api.md`, `data-model.md`). Do not read the entire `docs/design/` corpus — it isn't necessary and wastes context.
3. If `STATUS.md` or the named step doesn't exist, or the repo has no `docs/design/` directory, stop and say so rather than guessing at scope.

## While implementing

- **Patch minimally.** Only change what the current step requires. If a larger rewrite seems warranted, say so and ask — don't do it unprompted.
- Match every signature, type, and file path to what's specified in `public-api.md` / `data-model.md` exactly. If the step's instructions and a referenced doc disagree, the referenced doc wins — flag the discrepancy instead of silently picking one.
- Stay inside the step's declared "Files to create/modify" list and "Out of scope" boundary. If the step is impossible without touching a file outside that list, stop and explain why rather than expanding scope silently.
- Add tests for new functionality: at minimum the happy path and one error path. Do not add snapshot tests or exhaustive edge-case suites unless the step asks for it.
- Include error handling and loading/empty states for anything user-facing; do not add speculative error handling for cases that can't occur.
- Responsive/accessible by default for anything UI-facing: labels on interactive elements, focus visible, reduced-motion fallback for animation, mobile-first layout. The `web-engineering-checklist` skill triggers automatically on route/DB/auth/UI diffs — let it run rather than re-deriving its checks by hand.

## After implementing a step

1. Verify the step's acceptance criteria concretely (run the named test file/command; don't eyeball it).
2. Run through `docs/design/reference/review-checklist.md` if present.
3. Check the box for this step in `docs/design/STATUS.md`, update "Last updated" and "Current step," and log any deviation from the plan in the Notes section.
4. Commit: one commit per step, message `Step N: <short title>` matching the step's title in `mvp-implementation-plan.md`. Include the STATUS.md update in the same commit.
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

## API route conventions (Next.js API routes, Fastify, Express)

Mirrors `.github/instructions/api-routes.instructions.md` — Copilot gets that file auto-attached by path; Claude Code has no equivalent path-scoped mechanism, so it's inlined here instead. Keep both in sync.

- Validate every request body, query param, and path param with a Zod schema before touching it. Reject with a 400 and a structured error body on failure — never trust `any`-typed input past the boundary.
- Authorization checks (session validity, role/permission) happen before any data access, not interleaved with business logic. Prefer a shared middleware/utility (e.g. `requireRole()`) over inline checks repeated per route.
- Never leak internal error details (stack traces, DB error messages) in the response body — log them server-side, return a generic message plus an error code the client can key off of.
- Rate limiting on any route that's unauthenticated, mutates data, or could be abused for enumeration (login, password verification, invite/join-by-code flows).
- Return consistent status codes: 400 validation, 401 unauthenticated, 403 unauthorized, 404 not found, 409 conflict (e.g. optimistic concurrency version mismatch), 429 rate limited, 500 unexpected.
- Idempotency: if a route can plausibly be retried by a client (network blip, double-submit), make it safe to call twice or document why it isn't.
- Match every request/response shape to `public-api.md` exactly — if a route needs to diverge from the documented shape, update `public-api.md` in the same change, don't let them drift apart.

## React/Next.js component conventions

Mirrors `.github/instructions/react-components.instructions.md`, for the same reason as above.

- Functional components only; no class components.
- Server Components by default in `app/`; add `"use client"` only when the component needs state, effects, or browser APIs.
- Every interactive element (button, input, link acting as a control) needs an accessible name — visible text, `aria-label`, or `aria-labelledby`. Don't add `aria-label` to elements that already have visible text conveying the same thing.
- Respect `prefers-reduced-motion` for any animation or transition beyond simple color/opacity — provide a static fallback.
- Focus must be visible and reach every interactive element via keyboard; do not remove focus outlines without replacing them.
- Mobile-first: base styles target the smallest breakpoint, larger breakpoints layer on via min-width media queries or the project's Tailwind/SCSS breakpoint tokens — not the reverse.
- Loading and empty states are part of the component, not an afterthought — if a component fetches or receives async data, it needs a loading state and an empty/zero-result state, not just a happy-path render.
- Wrap components that render untrusted or external data (iframes, markdown, user-submitted HTML) in an error boundary; don't let a render error in one panel take down the page.
- Props and exported component types live in `public-api.md` if the component is part of a published package's public surface — match them exactly, don't drift.

### React 19 features — use these instead of the pre-19 workarounds

Waypoint defaults to latest-stable React (React 19+, see `tradeoffs.md`). Prefer these over the older patterns they replace; don't reach for the old pattern out of habit.

- **Forms/mutations**: use Actions — pass a function directly to `<form action={fn}>` (or `formAction` on a button for multiple actions in one form) instead of manual `onSubmit` + `preventDefault` + hand-wired `useState` for pending/error. Pair with `useActionState` to get `[state, formAction, isPending]` instead of separate `useState` calls for result and pending.
- **Submit/pending UI inside a form**: use `useFormStatus` in a child component to read the parent `<form>`'s pending/data/action state — don't prop-drill an `isSubmitting` boolean down from the page component.
- **Optimistic UI**: use `useOptimistic` for anything that should appear to succeed immediately (posting a comment, toggling a like, sending a chat message) while the real mutation is in flight — don't hand-roll a shadow state variable that you reconcile manually.
- **Reading a promise or context conditionally**: use the `use()` API — it can be called inside conditionals/loops (unlike `useContext`/hooks) and can unwrap a promise with Suspense. Prefer it over `useEffect` + `useState` for consuming a promise passed from a Server Component.
- **Server Components passing data to Client Components**: pass promises down and unwrap with `use()` in the client boundary, rather than `await`-ing everything in the Server Component and blocking the initial render.
- **Server mutations**: Server Actions (`"use server"`) are the default for form submissions and mutations from Client Components — don't stand up a Next.js Route Handler for a mutation a Server Action can express directly, unless something external needs to call that endpoint too.
- **Refs on custom components**: accept `ref` as a normal prop — do not wrap components in `forwardRef`, it's no longer necessary.
- **Document metadata**: render `<title>`, `<meta>`, and `<link>` directly in the component that owns that data (React hoists them into `<head>` automatically) instead of a separate head-management library or a metadata-only parent component. In Next.js App Router, prefer the framework's `metadata`/`generateMetadata` export for route-level metadata; use inline metadata tags only for metadata that's genuinely component-local (e.g. a reusable card component that sets `<link rel="canonical">` for its own embedded content).
- **Preloading known-critical resources**: use `preload`/`preinit`/`preconnect`/`prefetchDNS` from `react-dom` for third-party fonts/scripts/connections you know you'll need, instead of hand-written `<link>` tags.
- **Context provider syntax**: write `<MyContext value={...}>` directly instead of `<MyContext.Provider value={...}>`.
- Do not use any of the above on a component explicitly marked as needing to run on React 18 or earlier (e.g. a shared package with a wider peer-dependency range) — check `tradeoffs.md` before assuming 19 is safe to target in a library package.

## After the MVP is complete

Once every step in `docs/design/STATUS.md` is checked, further small additions or fixes go through `/small-change` (`.claude/commands/small-change.md`), not a full `project-planner` re-run. It follows the same patch-minimally discipline as `/next-step`, but for one-off post-MVP work: it updates `public-api.md`/`data-model.md` if the change touches them, adds tests, and logs itself in `STATUS.md`'s "Post-MVP Changes" section instead of the phase checklist.

## Golden rule

If asked for more than one step at once, implement only the first and say why you stopped there. If information needed to proceed is missing from `STATUS.md` and the referenced docs, ask rather than inventing a decision that should have been made during planning.
