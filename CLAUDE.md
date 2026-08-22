# Repository Instructions (Claude Code) — developing Waypoint itself

This file describes how to work **on** Waypoint, the toolkit. It intentionally
contains no agents, skills, or commands of its own — Waypoint's distributable
Skills/commands/instructions live under `methodology/` and `commands/`, and are built
into installable form by `pnpm build`, not loaded live while this repo is open. See
`docs/restructure-plan.md` for why this separation exists and how the build works.

This mirrors `.github/copilot-instructions.md`, written for GitHub Copilot. Both
files describe developing the toolkit, not conventions for a project *using*
Waypoint — if you edit one, update the other to match.

## Where things live

- `methodology/**` and `commands/**` — canonical, platform-neutral source. This is
  what you edit. Cross-artifact references use `{{artifact:...}}` / `{{command:...}}`
  tokens (e.g. `{{artifact:engineering-checklist}}`), resolved per platform from
  `manifest.yaml`'s `tokens` map — never hardcode a Claude- or Copilot-specific path
  or name in these files.
- `manifest.yaml` — the artifact registry: what each artifact is, which platforms it
  targets, where it installs, and the token resolution table.
- `adapters/{claude,copilot}/build.ts` — pure transforms from canonical source to
  each platform's shape. No methodology content originates here.
- `scripts/{build,install,update,uninstall}.ts` — the CLI. `scripts/build.ts` writes
  `dist/`; the other three read/write a consumer repo (or, for global artifacts,
  a Claude home directory).
- `dist/` — generated, gitignored. **Never hand-edit it** — edit `methodology/`,
  `commands/`, or `manifest.yaml` and run `pnpm build` instead. A hand-edit to `dist/`
  is silently discarded on the next build.
- `tests/` — `build.test.ts`, `install.test.ts`, `update.test.ts`, `uninstall.test.ts`,
  `separation.test.ts`, against `tests/fixtures/*`. Every fixture-based test copies
  its fixture into a temp directory first and passes an explicit `globalHome` override
  — never the real home directory.

## While making a change

- Patch minimally, same discipline Waypoint itself teaches downstream: change only
  what the task requires.
- If you add or rename an artifact, update `manifest.yaml` first — the adapters and
  installer are driven entirely by it, not by scanning the filesystem.
- If you add a new cross-artifact reference in prose, add a `{{...}}` token and its
  per-platform resolution to `manifest.yaml`'s `tokens` map rather than writing a
  platform-specific name or path directly into `methodology/`/`commands/`.
- Run `pnpm build` after touching `methodology/**`, `commands/**`, `manifest.yaml`, or
  either adapter, and skim the relevant `dist/<platform>/**` output before moving on.
- Run `pnpm typecheck` and `pnpm test` before considering a change done. `build.test.ts`
  will fail loudly on an unresolved `{{token}}` or a canonical-source path leaking into
  `dist/` — don't silence it, fix the underlying cause.
- Bump `manifest.yaml`'s `version` on any change that affects installed output
  (methodology content, commands, adapters, or the manifest's artifact list itself).

## Golden rule

If asked for more than one restructure phase at once (see `docs/restructure-plan.md`
§12), implement only the next one and say why you stopped there — each phase is sized
to land as its own reviewable diff.
