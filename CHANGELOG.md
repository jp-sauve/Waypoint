# Changelog

All notable changes to Waypoint are documented here. Format loosely follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow semver
and track `manifest.yaml`'s `version` field, which is the source of truth.

## 0.4.0 — Spatial composition patterns

### Added
- `methodology/layout-patterns/references/{single-column,multi-column,grid-normal,
  grid-offset,grid-masonry,uniform-flex-row,bento,sidebar-content,layered,
  asymmetric}.md` — ten new references in the `layout-pattern-references` library
  covering the spatial-composition axis (how content is arranged within a region),
  alongside the page-flow axis added in 0.3.0. Includes a JS-computed masonry
  implementation with a native `grid-template-rows: masonry` progressive
  enhancement and an explicit callout about masonry's visual-vs-DOM reading-order
  mismatch for screen-reader users, and a sidebar-content off-canvas drawer with the
  same focus-management discipline as `ui-components/references/modal.md`.
- `methodology/layout-patterns.md` now documents both axes (page flow and spatial
  composition) with a table each, and notes the two compose independently — a
  page-flow pattern and a spatial-composition pattern are separate choices, not one
  combined decision.
- The four `{{artifact:layout-patterns}}` hooks (`core-protocol.md`,
  `small-change.md`, `review-step.md`, `review-checklist.md` template) now also
  cover spatial-composition diffs, not just page-flow ones.

## 0.3.0 — Layout & page pattern reference library

### Added
- `methodology/layout-patterns.md` + `methodology/layout-patterns/references/` — a new
  `layout-pattern-references` Skill (Claude) / shared references (Copilot) covering
  page-flow architecture: document flow (the default), hard-snap/soft-snap/overlapping
  full-height viewport sections, a paged/slides sequence, an SPA application shell
  (static/scrolled/paged content region), a sticky-panel scrolling narrative
  ("scrollytelling" split screen), a pan/zoom canvas, and a progressively-loaded feed.
  Each reference calls out its own accessibility failure mode and how the
  implementation avoids it (mandatory snap trapping zoomed-in users, autoplay with no
  pause control, infinite auto-load disorienting screen-reader users, a pointer-only
  canvas with no keyboard path). Spatial composition patterns (single/multi-column,
  grid variants, bento, sidebar + content, layered, asymmetric, uniform flex row) are
  a planned follow-up to this library, not yet added.
- A new `{{artifact:layout-patterns}}` token, and pointers to it from
  `core-protocol.md` (before deciding a new page/route's scroll or navigation
  behavior), `small-change.md` and `review-step.md` (for a diff touching page-flow
  mechanics), and the `review-checklist.md` planning template — the same four hooks
  `{{artifact:ui-components}}` already has.

## 0.2.0 — UI component reference library

### Added
- `methodology/ui-components.md` + `methodology/ui-components/references/` — a new
  `ui-component-references` Skill (Claude) / shared references (Copilot) with verified,
  accessible implementations of a modal, a dropdown menu, a toast notification, and
  three header scroll-behavior variants (scrolls with the page, fixed to the top,
  shrinks on scroll), each with an explicit "adapt to this project" list for the
  values (z-index, design tokens, portal target) that are necessarily project-specific
  rather than pre-decided here. The modal, dropdown menu, and toast each have a
  vanilla HTML/CSS/JS counterpart (`modal-vanilla.md`, `dropdown-menu-vanilla.md`,
  `toast-vanilla.md`) for projects with no build step — the modal and dropdown are
  built on `<dialog>` and `popover` respectively, so they need no `z-index` or manual
  focus trap at all.
- A new `{{artifact:ui-components}}` token, and explicit pointers to it from
  `core-protocol.md` (before writing new UI interaction logic), `small-change.md` and
  `review-step.md` (for a diff touching one of these patterns), and the
  `review-checklist.md` planning template — previously the library was installed but
  never referenced anywhere in the actual implementer workflow, unlike
  `engineering-checklist`, which already had all four of those hooks.

## 0.1.0 — restructure to a canonical-source / installed-config split

The toolkit's source moved out of `.claude/` and `.github/` (which it previously used
as both its own canonical source *and* the literal payload copied into consumer repos)
and into platform-neutral `methodology/` and `commands/`, built into installable form
by a small adapter + CLI pipeline. See `docs/restructure-plan.md` for the full design
and migration record.

### Added
- `methodology/`, `commands/`, `manifest.yaml` — canonical, platform-neutral source and
  artifact registry, replacing the previous hand-maintained duplication between
  `.claude/skills/*` + `.claude/commands/*` and `.github/instructions/*` +
  `.github/prompts/*`.
- `adapters/{claude,copilot}/build.ts` + `adapters/lib/*` — pure transforms from
  canonical source to each platform's installed shape.
- `scripts/{build,install,update,uninstall,cli}.ts` and a published `waypoint` CLI
  (`bin/waypoint.js`) — `waypoint install|update|uninstall <targetDir>`, checksum-aware
  so a consumer's local edits are never silently overwritten.
- `tests/` — build, install, update, uninstall, CLI, and separation test suites (27
  tests) against fixture projects.
- `CLAUDE.md` / `.github/copilot-instructions.md` at the toolkit root now describe
  developing the toolkit itself, with no agents/skills/commands of their own.

### Changed
- The engineering checklist's deep-dive references (`owasp-top10.md`,
  `wcag-checklist.md`, `privacy-checklist.md`) now install once, to a shared
  `.waypoint/checklist/references/` path read by both a Claude Skill and Copilot
  prompts — previously, Copilot's prompts pointed directly at a
  `.claude/skills/web-engineering-checklist/references/` path meant for Claude.
- `project-planner`'s templates are no longer reached by a Copilot prompt reaching
  into `.claude/skills/project-planner/templates/` — they install to
  `.waypoint/planning-templates/` for Copilot and stay bundled inside the Skill folder
  for Claude.
- `CLAUDE.md`'s implementer instructions now include the test conventions
  (`methodology/implementer/tests.md`) alongside API-route and React conventions —
  previously only the latter two were mirrored in from the Copilot-side
  `.instructions.md` files; test conventions were Copilot-only.

### Removed
- `.claude/settings.local.json` — existed only to grant edit permission on
  `.claude/skills/project-planner/**`, which was needed only because developing the
  toolkit meant editing its own live Claude Skill configuration. No longer applicable
  once canonical source moved to `methodology/`.
