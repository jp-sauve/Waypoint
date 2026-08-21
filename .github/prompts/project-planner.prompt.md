---
agent: agent
description: Generate a complete docs/design planning package from website-spec.md (or targeted scoping answers) before implementation begins.
---

This prompt is the planning pass. Do not implement application code.

1. Check for `website-spec.md` at repository root.
2. If `website-spec.md` exists, treat its covered fields as authoritative and ask only for genuine gaps required to make technical decisions.
3. If it does not exist, collect missing scope in one concise question set:
   - What is it (app/library/service) and who uses it?
   - Single package or monorepo? Frontend/backend/both?
   - Realtime needs (WebSockets/SSE) or request-response only?
   - Persistence/auth/roles needs?
   - Deployment target/hosting preference?
   - Working name (propose options if missing)
4. Lock decisions explicitly in `docs/design/tradeoffs.md` (no placeholders): language/runtime, package manager, architecture shape, framework choices, validation approach, database/ORM, testing, lint/format, deployment target, API versioning strategy (if external API), license, minimum Node/TypeScript versions.
5. Create `docs/design/` and generate a complete, internally consistent package with these always-required files:
   - `docs/design/00-index.md`
   - `docs/design/glossary.md`
   - `docs/design/vision.md`
   - `docs/design/architecture-overview.md`
   - `docs/design/data-model.md`
   - `docs/design/public-api.md`
   - `docs/design/folder-structure.md`
   - `docs/design/mvp-implementation-plan.md`
   - `docs/design/roadmap.md`
   - `docs/design/nongoals.md`
   - `docs/design/open-questions.md`
   - `docs/design/risks.md`
   - `docs/design/tradeoffs.md`
   - `docs/design/STATUS.md`
   - `docs/design/reference/review-checklist.md`
6. Create conditional docs only when applicable, and note include/omit reasons in `docs/design/00-index.md`:
   - `docs/design/realtime-protocol.md` (if realtime)
   - `docs/design/auth-and-roles.md` (if accounts/roles)
   - `docs/design/configuration-system.md` (if config-driven)
   - `docs/design/react-integration.md` or `docs/design/nextjs-integration.md` (if frontend)
   - `docs/design/module-spec.md` or `docs/design/manifest-spec.md` (if plugin/module composition)
   - `docs/design/ui.md` (if any user-facing UI and visual direction exists)
7. For decomposition quality:
   - Group `mvp-implementation-plan.md` into phases.
   - Steps must be atomic, independently verifiable, and produce a working/testable state after each step.
   - Every step must declare acceptance criteria and explicit out-of-scope boundaries.
   - `STATUS.md` must mirror the same phase grouping with initially unchecked steps.
8. Use templates from `.claude/skills/project-planner/templates/`:
   - `step-format.md` for per-step structure in `mvp-implementation-plan.md`
   - `status-template.md` for `STATUS.md`
   - `review-checklist.md` copied verbatim to `docs/design/reference/review-checklist.md`
9. Consistency and quality gates before completion:
   - No `TBD`, placeholders, or contradictory terminology/signatures/paths.
   - `public-api.md` is the single source of truth for signatures and endpoint/component shapes.
   - `glossary.md` terms are used consistently across all docs.
10. Report completion with:
   - Full list of files created
   - One-line summary of locked technical decisions
   - Explicit next step: run `.github/prompts/next-step.prompt.md`

If critical information is missing and cannot be safely inferred, ask targeted follow-ups instead of guessing.
