# Repository Instructions (Augure) — developing Waypoint itself

This file describes how to work **on** Waypoint, the toolkit. It intentionally
contains no distributable skills or commands of its own — Waypoint's installed
Augure configuration lives under `methodology/`, `commands/`, and `manifest.yaml`,
and is built by `pnpm build`.

This mirrors `CLAUDE.md` and `.github/copilot-instructions.md`. If you edit one,
update the others to match.

## Where things live

- `methodology/**` and `commands/**` — canonical, platform-neutral source. Cross-artifact
  references use `{{artifact:...}}` / `{{command:...}}` tokens resolved from `manifest.yaml`.
- `manifest.yaml` — the artifact registry for Claude, Copilot, and Augure installs.
- `adapters/{claude,copilot,augure}/build.ts` — pure per-platform transforms.
- `scripts/{build,install,update,uninstall}.ts` — build and lifecycle CLI.
- `dist/` — generated. Never hand-edit it; run `pnpm build`.

## While making a change

- Update `manifest.yaml` first when adding or renaming artifacts.
- Add a `{{token}}` rather than hardcoding a platform-specific path in canonical source.
- Run `pnpm typecheck`, `pnpm build`, and `pnpm test` before considering work complete.
- Bump `manifest.yaml`'s `version` whenever installed output changes.
