# Waypoint

A reusable starting point for AI-assisted projects, split into three halves that work as a set:

## Requirements — `.claude/skills/gather-requirements/` and `.github/prompts/gather-requirements.prompt.md`

Use the Claude Skill or the Copilot prompt before any design or code work begins, whenever the ask is a new website/app and not already a full spec. Both interview in plain language (no assumed web/design jargon), gather missing requirements adaptively, and write `website-spec.md` at the new project's repo root.

## Planner — `.claude/skills/project-planner/` and `.github/prompts/project-planner.prompt.md`

Use the Claude Skill or the Copilot prompt to turn a rough idea — or, better, the `website-spec.md` from the requirements pass — into a complete `docs/design/` package: vision, architecture, data model, public API, atomic implementation steps, and a `STATUS.md` progress tracker, with no placeholders and no contradictions.

## Checklist — `.claude/skills/web-engineering-checklist/`

A second Claude Skill, used throughout implementation rather than once up front. It auto-triggers in Claude Code whenever a diff touches API routes, DB queries, auth, or user-facing UI, and walks the relevant security (OWASP)/accessibility (WCAG)/performance/reliability checks before the work is considered done. `references/owasp-top10.md` and `references/wcag-checklist.md` are deep-dive versions for a thorough pass (new component library, pre-launch review) — the condensed version of the same checks is mirrored in `docs/design/reference/review-checklist.md` (see below) for the Copilot side, which can't invoke a Skill directly.

## Implementer — `.github/` (Copilot) and `CLAUDE.md` + `.claude/commands/` (Claude Code)

Two parallel implementer surfaces, kept in sync, so either tool can drive the same `docs/design/` plan one step at a time as a lightweight, stateless-per-session model:

- `.github/copilot-instructions.md` / `CLAUDE.md` — always-on repo conventions and the STATUS.md protocol, one per tool.
- `.github/instructions/*.instructions.md` — scoped rules for React components, API routes, and tests, auto-attached by file path (Copilot only; Claude Code has no path-scoped equivalent, so the same React/API conventions are inlined directly into `CLAUDE.md` instead — keep both in sync).
- `.github/prompts/next-step.prompt.md` / `.claude/commands/next-step.md` — run this each session: reads `STATUS.md`, implements exactly the next unchecked step, updates `STATUS.md`, commits, stops.
- `.github/prompts/review-step.prompt.md` / `.claude/commands/review-step.md` — reviews the diff from the last step against `docs/design/reference/review-checklist.md` (or the `web-engineering-checklist` skill, from Claude Code).
- `.github/prompts/small-change.prompt.md` / `.claude/commands/small-change.md` — once `STATUS.md` is fully checked, run this for one small addition or fix at a time, instead of re-running `project-planner` for work that doesn't need a replan.

If you edit the conventions or protocol in one tool's files, update the other's to match — they're meant to describe the same process.

## Installing this Waypoint package

`gather-requirements` and `project-planner` do their job *before* a project repo is really set up, and their output (`website-spec.md`, `docs/design/`) doesn't depend on which tool produced it.

- Claude path: install the two skills once as user-level Claude Skills (`~/.claude/skills/`) so they're available the moment an idea comes up.
- Copilot path: use `.github/prompts/gather-requirements.prompt.md` and `.github/prompts/project-planner.prompt.md` directly in the target repo.

Everything else — `CLAUDE.md`, `.claude/commands/`, `.claude/skills/web-engineering-checklist/`, and `.github/` — is per-project: copy it into each new project's repo. The implementer protocol reads and writes that specific repo's `docs/design/STATUS.md`, and Copilot needs the checklist reference files physically present in the repo to read them (it can't invoke a Skill directly).

## Using Waypoint for a new project

1. Describe the idea to Claude or Copilot. Run the requirements pass (`gather-requirements` skill or `.github/prompts/gather-requirements.prompt.md`) to produce `website-spec.md` at repo root.
2. Copy `.claude/commands/`, `.claude/skills/web-engineering-checklist/`, `.github/`, and `CLAUDE.md` into that repo (see "Installing this Waypoint package" above).
3. Run the planning pass (`project-planner` skill or `.github/prompts/project-planner.prompt.md`) to generate `docs/design/` — it reads `website-spec.md` automatically if present.
4. Review the generated `tradeoffs.md` and `mvp-implementation-plan.md` — this is the point to object before implementation starts.
5. Run `/next-step` repeatedly (one session per step) to implement. Run `/review-step` after any step you want a second look at before moving on.
6. Once `STATUS.md` is fully checked, use `/small-change` for further small additions or fixes rather than re-running `project-planner`.
