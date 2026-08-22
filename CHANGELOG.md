# Changelog

All notable changes to Waypoint are documented here. Format loosely follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow semver
and track `manifest.yaml`'s `version` field, which is the source of truth.

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
