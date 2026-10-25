<img src="logo.svg" alt="Waypoint logo" width="120">

# Waypoint

A reusable starting point for AI-assisted projects: requirements gathering for a new
project or codebase inspection for an existing one, project planning, an engineering
checklist, verified UI component and layout pattern references, and an implementer
protocol — installable into Claude Code, GitHub Copilot, and/or Augure.

Waypoint's own canonical source is plain, platform-neutral Markdown under
`methodology/` and `commands/`. It does **not** live under `.claude/` or `.github/` —
those directories only ever hold *installed* output, in this repo or a consumer's,
so that working on Waypoint never causes Claude Code or Copilot to load Waypoint's own
distributable Skills/commands as if they were this repo's live configuration. See
`docs/restructure-plan.md` for the full rationale and design.

## What's in the box

- **Start Project** (`methodology/start-project.md`) — interviews the user before any
  design or code work begins, and writes `website-spec.md` at the target project's
  repo root.
- **Extend Project** (`methodology/extend-project.md`) — for a project that already
  has code, inspects it (stack, architecture, conventions, extension points) and
  writes `project-context.md` at the target project's repo root, so a new feature or
  subsystem is planned against what's actually there instead of assumed from scratch.
- **Planner** (`methodology/project-planning.md` + `methodology/project-planning/templates/`)
  — turns a rough idea, or better, `website-spec.md` or `project-context.md`, into a
  complete `docs/design/` package: vision, architecture, data model, public API,
  atomic implementation steps, and a `STATUS.md` progress tracker.
- **Checklist** (`methodology/engineering-checklist.md` + `methodology/engineering-checklist/references/`)
  — security (OWASP)/privacy (GDPR-CCPA)/accessibility (WCAG)/performance/reliability
  checks, run throughout implementation rather than once up front.
- **UI component references** (`methodology/ui-components.md` +
  `methodology/ui-components/references/`) — verified, accessible reference
  implementations (modal, dropdown menu, toast, scroll-behavior header variants), each
  with a vanilla HTML/CSS/JS counterpart alongside the React one, to adapt instead of
  reinventing focus management and keyboard handling from scratch.
- **Layout & page pattern references** (`methodology/layout-patterns.md` +
  `methodology/layout-patterns/references/`) — verified implementations across two
  axes: page flow (document flow, snapped/overlapping viewport sections,
  paged/slides, an SPA application shell, a sticky split-scroll narrative, a pan/zoom
  canvas, a progressively-loaded feed) and spatial composition (single/multi-column,
  grid variants incl. offset and masonry, a uniform flex row, bento, sidebar +
  content, layered, asymmetric), to adapt instead of reinventing scroll mechanics or
  layout structure from scratch.
- **Game engineering checklist** (`methodology/game-engineering-checklist.md` +
  `methodology/game-engineering/references/`) — for projects whose core is a
  rules-governed interactive game: keeping game rules in one authoritative rules
  engine (`GameState + Action -> GameState'`), rules-review/adversarial testing,
  multiplayer server authority and synchronization, replay/simulation, and
  game-specific UX/playtesting. Self-selecting by diff — a non-game project's
  changes simply never trigger it. The planner also produces `game-design.md`
  (and, for networked multiplayer, `multiplayer-architecture.md`) when the project
  is a game, and decomposes game features into the atomic phase progression this
  checklist's sections map to (state → legal actions → transitions → terminal
  conditions → server authority → sync → reconnect → persistence → UI → AI player).
- **Implementer** (`methodology/implementer/*.md` + `commands/*.md`) — the always-on
  repo conventions and the `STATUS.md` protocol that drives a project one step at a
  time: `next-step`, `review-step`, `small-change`.

## How it gets to a consumer repo

```
methodology/*.md, commands/*.md, manifest.yaml   (canonical source, edit these)
        │  pnpm build
        ▼
adapters/{claude,copilot,augure}/build.ts        (pure transform, no new content)
        │
        ▼
dist/{claude,copilot,augure}/**                  (rendered, platform-shaped files)
        │  node scripts/install.js <targetDir> --platform=claude,copilot,augure
        ▼
<consumer repo>/{CLAUDE.md, .claude/**, .github/**, AGENTS.md, .augure/**, .waypoint/install-manifest.json}
```

`manifest.yaml` is the single registry of what each artifact is, which platform(s) it
targets, and exactly where it installs — see it directly for the full list. Three
artifacts (`start-project`, `extend-project`, `project-planning`) install once,
globally, for Claude Code and Augure (`~/.claude/skills/` and `~/.augure/skills/`),
since they're useful before a project repo even exists (or before Waypoint is installed
into one); GitHub Copilot has no global mechanism, so its version of everything
installs per-project. The engineering
checklist's deep-dive reference files install once, at a platform-neutral
`.waypoint/checklist/references/` path, so both a Claude Skill and a Copilot prompt
read the exact same installed files rather than two separately duplicated copies.

## Using Waypoint on your own machine

```bash
pnpm install   # once, in this repo
pnpm build     # canonical source -> dist/claude/**, dist/copilot/**, dist/augure/**
pnpm test      # build + install + update + uninstall + separation checks

# install into a project you're starting:
node scripts/install.ts /path/to/your-project --platform=claude,copilot,augure

# later, after Waypoint has changed:
node scripts/update.ts /path/to/your-project --platform=claude,copilot,augure

# or remove everything Waypoint installed there:
node scripts/uninstall.ts /path/to/your-project
```

`install`/`update` never overwrite a file you've hand-edited since the last install —
they track a sha256 checksum per installed file in `.waypoint/install-manifest.json`
and report a conflict instead, unless you pass `--force`. `uninstall` removes exactly
the files Waypoint's own install record says it put there, and nothing else.

A published `npx waypoint install` entry point is planned (see `docs/restructure-plan.md`
§12, Phase 6) but not yet released — for now, run the scripts above directly from a
clone of this repo.

## Using Waypoint for a new project

1. Describe the idea to Claude, Copilot, or Augure. Run the requirements pass (the
   `start-project` Skill, or Copilot's `start-project.prompt.md`) to
   produce `website-spec.md` at repo root.
2. Install Waypoint into that repo (see above).
3. Run the planning pass (the `project-planner` Skill, or Copilot's
   `project-planner.prompt.md`) to generate `docs/design/` — it reads
   `website-spec.md` automatically if present.
4. Review the generated `tradeoffs.md` and `mvp-implementation-plan.md` — this is the
   point to object before implementation starts.
5. Run `/next-step` repeatedly (one session per step) to implement. Run
   `/review-step` after any step you want a second look at before moving on.
6. Once `STATUS.md` is fully checked, use `/small-change` for further small additions
   or fixes rather than re-running the planner.

## Using Waypoint on an existing project

1. In the project's own repo, run the extend pass (the `extend-project` Skill, or
   Copilot's `extend-project.prompt.md`) to inspect the codebase and produce
   `project-context.md` at repo root.
2. Install Waypoint into that repo (see above), if it isn't already.
3. Run the planning pass (the `project-planner` Skill, or Copilot's
   `project-planner.prompt.md`) to generate `docs/design/` for the new feature or
   subsystem — it reads `project-context.md` automatically if present, and matches
   its detected stack instead of proposing a fresh one.
4. From here, follow the same review → `/next-step` → `/small-change` flow as a new
   project (steps 4-6 above).

## Developing Waypoint itself

See `CLAUDE.md` / `.github/copilot-instructions.md` (dev-only conventions for this
repo) and `docs/restructure-plan.md` (the full design and migration record).
