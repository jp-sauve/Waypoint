---
name: project-planner
description: Generate a complete docs/design/ planning package (glossary, architecture, public API, atomic implementation steps, STATUS.md) for a new software project before implementation begins. Use when the user wants to plan a new project, write a spec or "prompt sheet" for AI-assisted implementation, or design a system's architecture before writing code.
---

# Project Planner

Turns a rough project idea into a complete, internally-consistent `docs/design/` package that a separate, stateless, lightweight model (cheap API model, local model, or GitHub Copilot) can implement incrementally across many sessions with no shared memory. This skill IS the planning pass; it does not write application code.

## When to use this

The user wants to plan before implementing: "help me design X," "write a spec for Y," "I want a prompt sheet for Z," "let's figure out the architecture before we start coding." Not for small, one-file changes to an existing project — this is for standing up a new project or a substantial new subsystem.

## Step 0 — Establish scope

If a `website-spec.md` file exists at the project root (produced by the
`gather-requirements` skill), read it first. Treat its answers — purpose, audience,
pages, features, platform, hosting, domain, visual direction, timeline, and
out-of-scope items — as authoritative; do not re-ask anything it already covers. Only ask about genuine gaps or the technical
decisions it doesn't cover (monorepo shape, realtime, auth/roles beyond what it states,
etc.).

If the user hasn't already answered these, ask (batch into one question set, don't interrogate one at a time):

1. **What is it?** App, library, service, or a mix. One-paragraph description of what it does and who uses it.
2. **Shape**: single package or monorepo? Frontend, backend, or both?
3. **Realtime?** WebSockets/SSE/live collaboration involved, or request/response only?
4. **Persistence/auth?** Does it need a database, user accounts, roles?
5. **Deployment target**: where does this actually run? If `website-spec.md` gave a hosting answer, use it — see Step 1 for how each option (Vercel, GitHub/GitLab Pages, self-managed, AWS) maps to a build/deploy strategy. Otherwise default assumption is Vercel (static export or full build, whichever the project needs) unless told otherwise — see Step 1 for why Vercel is the default and when AWS is warranted instead.
6. **Working name.** If the user doesn't have one, propose 2-3 options and pick one — state it explicitly and use it consistently in every doc, package name, and folder name from that point on.

Do not proceed to generating documents until scope is clear enough to make the technical decisions in Step 1 without guessing. Genuinely open strategic questions (not blocking ones) go in `open-questions.md`, not back to the user as a blocker.

## Step 1 — Lock technical decisions

Every technical decision must be made and stated explicitly in `tradeoffs.md` — never left open, never "TBD." Use these as defaults (this user is a full-stack TypeScript engineer who works with Next.js, Express, Fastify, SCSS, and AWS); deviate only if the project shape genuinely calls for it, and say why in `tradeoffs.md` when you do:

If `website-spec.md` specifies **plain HTML/CSS/JS** as the platform, the
frontend-related defaults below (TypeScript, Next.js, frontend Zod validation,
SCSS/Tailwind) don't apply — state a minimal stack instead (plain HTML/CSS/JS, no
framework, no build step unless one is genuinely needed) explicitly in `tradeoffs.md`,
and skip `nextjs-integration.md`/`react-integration.md` accordingly. The Test framework
default below (Vitest + Testing Library + jest-dom) doesn't apply either in that case —
it assumes a Node toolchain a no-build-step site doesn't have. State the actual
verification approach instead (manual in-browser checks, or a minimal script only if
the project has real logic worth unit-testing) explicitly in `tradeoffs.md`. If it
specifies **Next.js**, or no platform preference was given, the defaults below apply as
usual.

- **Language**: TypeScript, strict mode, ESM only.
- **Package manager**: pnpm.
- **Monorepo tooling** (if monorepo): pnpm workspaces + Turborepo.
- **Frontend framework** (if applicable): Next.js, App Router, latest stable React.
- **Backend framework** (if applicable): Fastify for new services (lighter, schema-first); Express only if integrating with existing Express infra.
- **Styling** (if applicable): SCSS modules, or Tailwind if the project is component/design-system heavy — pick one and say why.
- **Validation/schema**: Zod, used for manifests, config, API boundaries, and env vars alike — one library, one pattern, everywhere.
- **Database** (if the project persists data, via Drizzle or Prisma — state which and why): if the user named a specific engine in scoping, use it. Otherwise, if they said the project needs "a database" without naming one, default to Postgres (assume real multi-user/concurrent-write needs once persistence is explicitly called out). If persistence wasn't explicitly called out at all and you're inferring it's needed from the project shape, default to SQLite — the lower-ops-overhead choice for a scope that hasn't earned Postgres yet. Pick one, state it and the reasoning explicitly in `tradeoffs.md` — don't leave "the database" generic.
- **Test framework**: Vitest + Testing Library + jest-dom matchers.
- **Lint/format**: ESLint + Prettier, shared config at the repo root.
- **Deployment target**: if `website-spec.md` states a hosting preference, it governs:
  - **Vercel, or no preference given** — default to Vercel for every new Waypoint project unless something below overrides it. Native Next.js hosting, supports both a static export and a full standalone/server build, so it's compatible with a backend if one turns out to be needed, and needs no cloud console or IAM setup from the user. This is the starting assumption specifically because most Waypoint users aren't managing their own cloud infrastructure — don't default to AWS just because the stack conventions mention Fastify/Express elsewhere.
  - **GitHub Pages** / **GitLab Pages** — static hosting only. If the spec also calls for a backend, that's a conflict: note it in `open-questions.md`, recommend Vercel instead, and say why.
  - **AWS** — only when the user names it explicitly (an existing AWS account/infra, a stated preference, or a requirement Vercel genuinely can't meet). State the specific services for the build shape actually needed: `output: 'export'` to S3/CloudFront for a static site with no backend, or ECS/Lambda + RDS/DynamoDB + S3/CloudFront once a backend is earned (auth, database writes/reads at request time, server-only secrets, realtime) — don't leave this generic.
  - **Self-managed / other** — state the specific host named; if genuinely unclear, ask.

  If `website-spec.md` mentions a custom domain, add a one-line advisory note in `tradeoffs.md` that DNS records will need to be pointed at the chosen host once it's live — this is user guidance, not a technical decision to implement.
- **API versioning strategy** (if the project exposes a REST/WS API consumed by anything other than its own frontend in the same deploy): URL-path (`/v1/...`) vs header-based versioning, and a stated deprecation window for breaking changes. If there's a single consumer deployed in lockstep with the API (e.g. a monorepo frontend+backend with no external clients), "no versioning — breaking changes ship atomically with the consumer" is a valid answer, but it must be stated explicitly, not left implicit.
- **License**: ask if this is going to be open-sourced; default MIT if the user doesn't care.
- **Minimum Node.js / TypeScript versions**: latest LTS Node, latest stable TypeScript, stated as exact numbers, not "latest."

## Step 2 — Write the documents

Write everything under `docs/design/` in the target project (create the directory if needed). Every document must be internally consistent with every other — same terminology (defined once in `glossary.md`), same API signatures (defined once in `public-api.md`), same file paths everywhere they're mentioned. Re-read your own output for contradictions before finishing. No placeholder sections ("TBD," "to be filled in later") — anything genuinely out of scope goes in `nongoals.md` with a one-line reason, anything genuinely undecided goes in `open-questions.md` with the options considered.

### Always produce

- `00-index.md` — table of contents linking every doc written, in reading order, one-sentence summary each. Must match the actual files on disk exactly.
- `glossary.md` — every domain term defined once. Every other document uses these terms exactly; no synonyms introduced elsewhere.
- `vision.md` — problem statement, who this is for, why it needs to exist, brief comparison to existing alternatives if any exist.
- `architecture-overview.md` — high-level architecture, package/module boundaries, a Mermaid system diagram.
- `data-model.md` — domain entities, relationships, lifecycle/state machines, written in enough detail to generate a schema from directly (include a Mermaid ER or state diagram), expressed as tables/columns/foreign keys matching the ORM schema style chosen in `tradeoffs.md` (Postgres or SQLite). Skip only if the project truly has no persistent domain data — say so in `nongoals.md` if omitted.
- `public-api.md` — the single source of truth for every public function signature, type, REST/WS endpoint, or component prop surface. Every code example in every other doc must match this exactly. If the project has an external API, state the versioning/deprecation policy from `tradeoffs.md` at the top of this doc.
- `folder-structure.md` — the full concrete folder/file layout, as it will exist on disk.
- `mvp-implementation-plan.md` — see **Step 3** below. The most important document; everything else exists to support it.
- `roadmap.md` — future features explicitly deferred past the MVP, each with enough detail that a future session could pick one up and plan it.
- `nongoals.md` — what the MVP explicitly does not do, and why (not "later," an actual reason: complexity, scope, unclear demand, etc.).
- `open-questions.md` — genuinely unresolved questions, each with the options considered and why it's deferred rather than decided now.
- `risks.md` — technical and adoption/maintenance risks, each with a mitigation or an explicit "accepted risk."
- `tradeoffs.md` — every decision from Step 1, plus any project-specific ones, each with the alternatives considered and why this one won.
- `STATUS.md` — see **Step 3**.
- `reference/review-checklist.md` — copy verbatim from this skill's `templates/review-checklist.md`. This is what the implementer's `/review-step` prompt checks the diff against after every step.

### Produce if the project shape calls for it (state in `00-index.md` why included or omitted)

- `realtime-protocol.md` — if the project has WebSockets/SSE: message types (as concrete Zod schemas or TS interfaces), room/channel naming convention, reconnection/backoff behavior, rate limits. Model this on a message-type table (type name → payload shape) plus a room-naming scheme, e.g. `resource:{id}` / `resource:{id}:sub:{subId}`.
- `auth-and-roles.md` — if the project has accounts/roles: session strategy, role model, where authorization is enforced (middleware vs. per-route), password/credential handling.
- `configuration-system.md` — if the project is config-or-manifest-driven: config typing, validation, defaults, environment overrides, per-module scoping.
- `react-integration.md` / `nextjs-integration.md` — if there's a frontend: provider/hook surface, server/client component boundary, error boundaries, loading states.
- `module-spec.md` / `manifest-spec.md` — only for plugin/module-composition systems (not typical full-stack CRUD apps).
- `ui.md` — if the project has any user-facing UI — a Next.js frontend or a plain HTML/CSS/JS site alike — and any visual direction was specified (colors, typography, tone, reference sites, brand assets — typically from `website-spec.md`'s Visual Direction section, or given directly by the user): state a concrete palette (hex values or token names, not just a mood word — translate a mood into an actual palette here), typography choices, tone/voice, what to borrow from any named reference sites, where brand assets live, and any contrast/accessibility notes. Every step in `mvp-implementation-plan.md` that builds UI must cite this doc by name, the same way UI steps cite `public-api.md` for component props.

Do not add doc files beyond this list without a reason stated in `00-index.md` — more files than the project needs is as much a failure mode as too few.

## Step 3 — Task decomposition (`mvp-implementation-plan.md` + `STATUS.md`)

This is what the lightweight downstream model actually executes from, one step at a time, with no memory of this planning session or of any other step. Read `templates/step-format.md` in this skill folder for the exact per-step template, and `templates/status-template.md` for the STATUS.md skeleton — use them verbatim rather than inventing a new format.

Rules:

- Group steps into phases (e.g., Phase 0: tooling/scaffolding, Phase 1: data model, Phase 2: core domain logic, Phase 3: API layer, Phase 4: frontend, Phase 5: realtime, Phase 6: hardening/deploy). Mirror the phase grouping exactly in `STATUS.md`.
- Steps must be atomic: completable and independently verifiable in one focused session. Prefer more, smaller steps over fewer, large ones.
- Order steps so the project is in a working, testable state at the end of every step — no "big bang" integration step at the end.
- Every step must be self-contained enough to implement by reading only: `STATUS.md`, that step's entry, and whichever specific reference doc(s) the step names. The implementing session will not read the rest of the design corpus — write accordingly.
- Every step needs concrete, checkable acceptance criteria (a specific test file passing, a specific error class being thrown, a specific route returning a specific status code) — not "works correctly."
- Every step lists explicit "out of scope" items to block scope creep into later steps.
- If `ui.md` exists, every step that builds UI must cite it by name as a reference doc, the same way steps cite `public-api.md`.

## Step 4 — Optional: flat milestone-prompt export

If the user says they'll be pasting instructions directly into a chat-only tool (no filesystem access, no STATUS.md-reading agent), also generate a single flat file — e.g. `docs/design/milestone-prompts.txt` — that condenses `mvp-implementation-plan.md` into numbered milestones, each a self-contained "User Instruction:" block with explicit file paths, mirroring the shape of a prior example the user has used successfully: numbered milestones each completable as a standalone Copilot prompt, followed by a gap-filling micro-prompt list, a component/protocol quick-reference section, and a manual review checklist to run after each milestone. Only produce this when asked — it's a derived artifact, not a replacement for the `docs/design/` package.

## Definition of done

- Every file in the applicable lists above exists under `docs/design/`.
- `00-index.md` links every document and matches the files actually written, including a stated reason for any conditional doc included or omitted.
- No contradictions in terminology, signatures, or file paths across documents — spot-check against `glossary.md` and `public-api.md` before finishing.
- `mvp-implementation-plan.md` is atomic steps per Step 3, and `STATUS.md` has a matching, initially-unchecked checklist grouped by the same phases.
- No placeholder or "TBD" content anywhere — unresolved items are in `open-questions.md` with rationale.
- Report back to the user with the file list and a one-line summary of the technical decisions locked in Step 1, so they can object before implementation starts.
