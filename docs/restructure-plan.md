# Waypoint Restructure Plan — Toolkit Source vs. Distributable AI Configuration

Status: **Phase 0 decided, Phase 1 complete.** Phases 2-6 not yet implemented.
Author: planning pass (Claude), 2026-08-21.
Branch: `restructure-for-dev`.

**Phase 0 decisions (locked in, 2026-08-21):**
- Build pipeline: **Node/TS CLI** (§11 risk 1, option A) — not the static-adapters alternative.
- `dist/`: **gitignored**, built into the npm tarball via `prepublishOnly` (§11 risk 3) — not committed.
- Checklist reference location and dev-only-slash-commands decisions (§11 risks 6-7): the
  plan's recommendations (`.waypoint/checklist/references/`; no dev-only slash commands, use
  plain `package.json` scripts) stand as proposed — not separately re-confirmed, revisit if desired.

**Phase 1 complete:** `methodology/**` and `commands/**` now hold the canonical, platform-neutral
source (see §4 migration map for the exact mapping). The original `.claude/**` and `.github/**`
files are **untouched** — both still fully function today; nothing consumer-facing has changed.
Editorial note beyond a pure move: the four near-duplicate "always-on instructions" bodies
(`CLAUDE.md` and `.github/copilot-instructions.md`'s shared sections) were merged into one
`methodology/implementer/core-protocol.md`. Cross-artifact references (e.g. "run the
`project-planner` Skill" / "read `.github/prompts/project-planner.prompt.md`") were replaced
with explicit `{{artifact:...}}` / `{{command:...}}` tokens, resolved per-platform from
`manifest.yaml`'s `tokens` map at build time — this is more mechanical than the fuzzy
prose-neutralization originally sketched here, and is what `adapters/lib/template.ts`
(Phase 2) actually implements.

**Phase 2 complete:** `package.json`, `manifest.yaml`, `adapters/{claude,copilot}/build.ts`,
`adapters/lib/{manifest,template,types}.ts`, and `scripts/build.ts` exist; `pnpm build`
produces `dist/claude/**` and `dist/copilot/**` matching the shape in §5/§7 exactly.
`tests/build.test.ts` (8 tests) verifies the tree shape, that no canonical source paths or
unresolved `{{tokens}}` leak into installed output, that Copilot's scoped instructions get
real `applyTo` frontmatter while Claude's don't, and that `CLAUDE.md` correctly folds in
api-routes/react-components/tests (fixing the asymmetry noted in the original repo, where
`tests.instructions.md` was never mirrored into `CLAUDE.md` at all). One real bug was caught
and fixed before landing: the Copilot adapter was placing `gather-requirements`/
`project-planner` under a `global/` scope, which doesn't exist for Copilot at all
(`globalInstallSupported: false`) — fixed by clamping Copilot's scope resolution to `project`
regardless of the artifact's stated `installScope`.

**Phase 3 complete:** `adapters/lib/{checksum,installRecord,installer}.ts` and
`scripts/{install,update,uninstall}.ts` exist, using `.waypoint/install-manifest.json`
(project) / `<globalInstallRoot>/.waypoint-meta.json` (global) with per-file sha256 checksums
to distinguish "unchanged since install, safe to overwrite" from "the consumer edited this,
leave it alone." `tests/{install,update,uninstall}.test.ts` (10 tests) run against
`tests/fixtures/{empty,claude-only,copilot-only}-project/` in temp-copied directories (never
the real fixtures, never the real home directory — every test passes an explicit `globalHome`
override). Two real bugs were caught and fixed by these tests: (1) the global-scope bug above,
surfaced again here as a wrong install path; (2) `uninstallFiles` left phantom record entries
and empty directory skeletons behind — `engineering-checklist`'s references are tracked once
per platform (`claude:...`/`copilot:...` record keys) but point at the *same* shared physical
path (`.waypoint/checklist/references/`), so removing the file via the first key made the
second key's existence check silently no-op without clearing it from the record, which in turn
kept `.waypoint/` from ever being pruned. Fixed by treating an already-gone file as "removed"
for record-keeping purposes, and by walking up removing now-empty parent directories after
each real removal.

**Phase 4 complete:** the superseded `.claude/skills/*`, `.claude/commands/*`,
`.github/instructions/*`, `.github/prompts/*`, and `.claude/settings.local.json` are removed
(via `git rm`, so the history stays intact); the toolkit-root `CLAUDE.md` and
`.github/copilot-instructions.md` are rewritten as dev-only guidance (§9) with no
agents/skills/commands of their own; `README.md` describes the new source layout and the
`pnpm build` / `scripts/install.ts` / `scripts/update.ts` / `scripts/uninstall.ts` workflow in
place of the old manual-copy instructions; `tests/separation.test.ts` (4 tests) now guards
against this exact duplication ever recurring. Full suite: **22 tests passing** across
`build`, `install`, `update`, `uninstall`, and `separation`. The self-interference problem
from §2 is now structurally closed: this repo has no `.claude/skills`, `.claude/commands`,
`.github/instructions`, or `.github/prompts` at all — a Claude Code or Copilot session
working on Waypoint sees only the dev-only `CLAUDE.md`/`copilot-instructions.md` above,
never Waypoint's own distributable content.

**Phase 6 complete** (done out of order, at the user's request, ahead of Phase 5):
- `scripts/cli.ts` + `bin/waypoint.js` — a real `waypoint` CLI (`build`/`install`/`update`/
  `uninstall` subcommands), runnable via `node bin/waypoint.js ...` today and via
  `npx waypoint ...` once published. The bin wrapper resolves `tsx` through Node's own
  module resolution (`createRequire(...).resolve("tsx/cli")`), not a guessed
  `node_modules/.bin` path, so it works regardless of hoisting.
- `package.json`: added `bin`, `files` (whitelisting exactly `bin/ scripts/ adapters/
  methodology/ commands/ manifest.yaml README.md LICENSE` — verified with `npm pack
  --dry-run`, 35 files, no `tests/`/`docs/`/`dist/`/dev-only content leaked in),
  `repository`/`homepage`/`bugs`, and `prepublishOnly` (`typecheck && build && test`).
  `tsx`/`js-yaml`/`zod` moved from `devDependencies` to `dependencies` since the CLI
  needs them at runtime once installed from the registry, not just in this repo.
  **`"private": true` was removed** — this is the one change that actually permits
  `npm publish` to succeed; nothing was published, and that action needs the user's own
  explicit go-ahead.
- `LICENSE` (MIT, matching `package.json`'s already-declared license) and
  `CHANGELOG.md` (0.1.0 entry covering this whole restructure) added.
- `.github/workflows/ci.yml` — installs, typechecks, builds, tests on push/PR. (A
  GitHub Actions workflow is unrelated to the `.claude`/`.github`-as-AI-config problem
  this restructure exists to fix — it's a different GitHub mechanism entirely.)
- `tests/cli.test.ts` (5 tests) covers the dispatcher directly (unknown command, missing
  args, and correct routing for install/update/uninstall). Full suite: **27 tests**.

Remaining, not yet done: **Phase 5** (`reference-resolution.test.ts` — cross-references from
installed files into a consumer's future `docs/design/*` resolve correctly; most of Phase 5's
other goal, platform-specific-output assertions, ended up already covered by `build.test.ts`).
Lower-priority test coverage, not required for the core restructuring goal, which is done.

---

## 1. Current architecture

Waypoint is **not** an "architecture agent" toolkit in the generic sense (no `architect`,
`domain-modeller`, ADR-writer agents). It is a small, 100% Markdown, four-part protocol for
running a project through Claude Code and/or GitHub Copilot:

| Part | Claude Code surface | Copilot surface |
|---|---|---|
| **Requirements** — interview → `website-spec.md` | `.claude/skills/gather-requirements/SKILL.md` | `.github/prompts/gather-requirements.prompt.md` |
| **Planner** — idea/spec → `docs/design/*` package | `.claude/skills/project-planner/SKILL.md` + `templates/{step-format,status-template,review-checklist}.md` | `.github/prompts/project-planner.prompt.md` |
| **Checklist** — security/privacy/a11y/perf/reliability | `.claude/skills/web-engineering-checklist/SKILL.md` + `references/{owasp-top10,privacy-checklist,wcag-checklist}.md` | no direct equivalent (Copilot can't invoke a Skill) — reached indirectly via generated `docs/design/reference/review-checklist.md` and by the review/small-change prompts reading the Claude skill's reference files directly |
| **Implementer** — STATUS.md loop, stack conventions, API/React/test conventions | `CLAUDE.md` (root, all conventions inlined) + `.claude/commands/{next-step,review-step,small-change}.md` | `.github/copilot-instructions.md` (core protocol + stack conventions only) + `.github/instructions/{api-routes,react-components,tests}.instructions.md` (path-scoped, `applyTo` frontmatter) + `.github/prompts/{next-step,review-step,small-change}.prompt.md` |

There is **no code** in this repo: no `package.json`, no build step, no tests, no CI, no
manifest, no version file. Distribution today (per `README.md`, "Installing this Waypoint
package") is entirely manual:

- `gather-requirements` / `project-planner`: installed once as **user-level, global** Claude
  Skills (`~/.claude/skills/`); Copilot has no global mechanism, so its prompt files are
  copied **per-project** into `.github/prompts/`.
- Everything else (`CLAUDE.md`, `.claude/commands/`, `.claude/skills/web-engineering-checklist/`,
  all of `.github/`): copied **per-project** into each new consumer repo, by hand, for both tools.

Application-facing artifacts produced *by* the toolkit — `website-spec.md` at a consumer
repo's root, and `docs/design/*` (glossary, vision, architecture-overview, data-model,
public-api, folder-structure, mvp-implementation-plan, roadmap, nongoals, open-questions,
risks, tradeoffs, STATUS.md, `reference/review-checklist.md`, plus conditional docs) — are
**already cleanly separate** from AI configuration. This part of the user's desired
architecture (distinguishing toolkit/AI config from the target application's own design
artifacts) is already solved in this repo and does not need a new `.architecture/` directory.

## 2. Problems with the current structure

1. **Self-interference (the core problem).** The toolkit's canonical source *is*
   `.claude/skills/*`, `.claude/commands/*`, and `.github/*` — the exact directories Claude
   Code and Copilot auto-load as live configuration. Editing the toolkit *is* editing your own
   active AI config. Direct evidence: `.claude/settings.local.json`, committed in the very
   first commit, exists solely to grant `Edit()` permission on `.claude/skills/project-planner/**`
   — a permission a session needs only because it's simultaneously the developer *and* the
   subject of its own skill definitions.
2. **Hand-maintained duplication.** Every one of the four parts above exists as two
   independently-authored copies (Claude form + Copilot form), kept in sync by convention
   ("if you edit one, update the other to match" — stated three times) with no tooling
   enforcing it. The Copilot prompt bodies for `gather-requirements` and `project-planner`
   are not mechanical reformats of the Skill bodies — they're separately condensed rewrites,
   already showing drift (e.g. the Skill's "What NOT to do" section has no Copilot analogue).
3. **A real cross-reference bug caused by this coupling.** `.github/prompts/project-planner.prompt.md`
   step 8 tells a **Copilot** session to read templates from
   `.claude/skills/project-planner/templates/` — a Claude-namespaced path — because the
   templates only physically exist there today.
4. **Same bug, worse, for the checklist.** The checklist has no Copilot-native form at all.
   `.github/prompts/review-step.prompt.md` and `small-change.prompt.md` tell a Copilot session
   to read `.claude/skills/web-engineering-checklist/references/owasp-top10.md` directly. The
   deep-dive reference material is de facto shared, platform-neutral content, but it only has
   a Claude-shaped home.
5. **No distribution mechanism.** "Copy these files into your repo" has no versioning, no
   update path, no uninstall, no way to detect an existing install, and no protection against
   clobbering a consumer's local edits to (e.g.) their project's `CLAUDE.md`.
6. **No tests.** Nothing verifies the two hand-maintained copies stay equivalent, that a
   fresh install produces a working tree, or that cross-references (like the two bugs above)
   resolve.
7. **Discoverability is fine today only because the repo is small.** As soon as a third
   platform or a fifth skill is added, the manual-sync approach gets materially worse, not
   linearly worse.

## 3. Proposed architecture

```
waypoint/                                  (toolkit repo root)
├── README.md                              rewritten: build/install/update/uninstall workflow
├── CLAUDE.md                              rewritten: DEV-ONLY — instructions for editing the toolkit
├── .github/copilot-instructions.md        rewritten: DEV-ONLY — Copilot side of the same
├── package.json                           new
├── manifest.yaml                          new — canonical artifact registry (§8)
├── logo.svg                               unchanged
│
├── methodology/                           CANONICAL SOURCE — platform-neutral prose
│   ├── requirements-gathering.md              (was gather-requirements/SKILL.md body)
│   ├── project-planning.md                    (was project-planner/SKILL.md body)
│   ├── project-planning/templates/
│   │   ├── step-format.md
│   │   ├── status-template.md
│   │   └── review-checklist.md
│   ├── engineering-checklist.md                (was web-engineering-checklist/SKILL.md body)
│   ├── engineering-checklist/references/
│   │   ├── owasp-top10.md
│   │   ├── privacy-checklist.md
│   │   └── wcag-checklist.md
│   └── implementer/
│       ├── core-protocol.md                    (STATUS.md loop, shared by both tools)
│       ├── stack-conventions.md
│       ├── api-routes.md                       (was api-routes.instructions.md body)
│       ├── react-components.md                 (was react-components.instructions.md body)
│       └── tests.md                            (was tests.instructions.md body)
│
├── commands/                              CANONICAL SOURCE — command bodies
│   ├── next-step.md
│   ├── review-step.md
│   └── small-change.md
│
├── adapters/                              BUILD LOGIC — canonical → platform shape
│   ├── claude/build.ts                        skills, commands, single-file CLAUDE.md
│   ├── copilot/build.ts                       copilot-instructions.md, scoped instructions, prompts
│   └── lib/template.ts                        shared frontmatter/substitution helpers
│
├── scripts/                               INSTALLER CLI
│   ├── build.ts       canonical → dist/<platform>
│   ├── install.ts      dist/<platform> → target repo (+ .waypoint/install-manifest.json)
│   ├── update.ts        checksum-aware re-install
│   └── uninstall.ts     manifest-driven removal
│
├── dist/                                  GENERATED, gitignored (see §11 decision)
│   ├── claude/...
│   └── copilot/...
│
└── tests/
    ├── build.test.ts
    ├── install.test.ts
    ├── update.test.ts
    ├── uninstall.test.ts
    ├── separation.test.ts                 guards against §2 problem #1 recurring
    └── fixtures/{empty,claude-only,copilot-only}-project/
```

- **Canonical toolkit source** = `methodology/`, `commands/`, `manifest.yaml`.
- **Platform adapters** = `adapters/*`, pure transforms, no methodology content of their own.
- **Generated/installed AI configuration** = everything under `dist/` and everything an
  install writes into a consumer repo (`CLAUDE.md`, `.claude/`, `.github/`).
- **Application architecture artifacts** = unchanged: `website-spec.md` and `docs/design/*`
  in the *consumer's* repo, produced by running the requirements/planner artifacts — not
  toolkit output in the sense above, but the target application's own design record.
- **Development-only tooling** = the toolkit repo's own root `CLAUDE.md` /
  `copilot-instructions.md`. These describe how to *edit the toolkit* (don't hand-edit
  `dist/`, run `pnpm build` after touching `methodology/`, run `pnpm test` before committing)
  and contain **zero** agents/skills/commands — so a Claude Code or Copilot session working
  in this repo sees only generic dev guidance, never the distributable skills it's building.

## 4. Migration map

| Current path | Proposed path | Action | Reason |
|---|---|---|---|
| `README.md` | `README.md` | rewrite | describe build/install/update/uninstall instead of manual copy |
| `CLAUDE.md` (implementer protocol) | `CLAUDE.md` (dev-only) | rewrite | same path, entirely different purpose — stops being distributable payload |
| `logo.svg` | `logo.svg` | keep | unrelated to restructure |
| `.claude/settings.local.json` | — | delete | artifact of the exact self-interference bug this plan fixes; not meaningful once `.claude/skills/project-planner` no longer exists at repo root |
| `.claude/commands/next-step.md` | `commands/next-step.md` | move (content preserved) | canonical, platform-neutral home |
| `.claude/commands/review-step.md` | `commands/review-step.md` | move | " |
| `.claude/commands/small-change.md` | `commands/small-change.md` | move | " |
| `.claude/skills/gather-requirements/SKILL.md` | `methodology/requirements-gathering.md` | move, strip Claude frontmatter (moves to `manifest.yaml`) | canonical source, no platform coupling |
| `.claude/skills/project-planner/SKILL.md` | `methodology/project-planning.md` | move, strip frontmatter | " |
| `.claude/skills/project-planner/templates/step-format.md` | `methodology/project-planning/templates/step-format.md` | move | consumed by the planner artifact regardless of platform |
| `.claude/skills/project-planner/templates/status-template.md` | `methodology/project-planning/templates/status-template.md` | move | " |
| `.claude/skills/project-planner/templates/review-checklist.md` | `methodology/project-planning/templates/review-checklist.md` | move | " |
| `.claude/skills/web-engineering-checklist/SKILL.md` | `methodology/engineering-checklist.md` | move, strip frontmatter | canonical |
| `.claude/skills/web-engineering-checklist/references/owasp-top10.md` | `methodology/engineering-checklist/references/owasp-top10.md` | move | fixes problem #4 — now genuinely platform-neutral |
| `.claude/skills/web-engineering-checklist/references/privacy-checklist.md` | `methodology/engineering-checklist/references/privacy-checklist.md` | move | " |
| `.claude/skills/web-engineering-checklist/references/wcag-checklist.md` | `methodology/engineering-checklist/references/wcag-checklist.md` | move | " |
| `.github/copilot-instructions.md` | `methodology/implementer/core-protocol.md` + `methodology/implementer/stack-conventions.md` | split, de-duplicate against `CLAUDE.md`'s equivalent content | single canonical source instead of two hand-synced files |
| `.github/instructions/api-routes.instructions.md` | `methodology/implementer/api-routes.md` | move, strip `applyTo` (moves to `manifest.yaml`) | canonical; `applyTo` is Copilot-specific install metadata, not content |
| `.github/instructions/react-components.instructions.md` | `methodology/implementer/react-components.md` | move | " |
| `.github/instructions/tests.instructions.md` | `methodology/implementer/tests.md` | move | " |
| `.github/prompts/gather-requirements.prompt.md` | — | delete, superseded | regenerated by Copilot adapter from `methodology/requirements-gathering.md`; retires the hand-condensed duplicate |
| `.github/prompts/project-planner.prompt.md` | — | delete, superseded | regenerated; also fixes the `.claude/...templates/` cross-reference bug automatically |
| `.github/prompts/next-step.prompt.md` | — | delete, superseded | regenerated from `commands/next-step.md` |
| `.github/prompts/review-step.prompt.md` | — | delete, superseded | regenerated from `commands/review-step.md`; fixes the checklist-reference-path bug |
| `.github/prompts/small-change.prompt.md` | — | delete, superseded | regenerated from `commands/small-change.md` |
| — | `package.json` | create | npm package, `bin` entry for the installer CLI |
| — | `manifest.yaml` | create | artifact registry (§8) |
| — | `adapters/claude/build.ts`, `adapters/copilot/build.ts`, `adapters/lib/template.ts` | create | canonical → platform transform |
| — | `scripts/{build,install,update,uninstall}.ts` | create | CLI |
| — | `tests/**`, `tests/fixtures/**` | create | §10 |
| — | `.gitignore` | create | repo has none today; must exclude `dist/`, `node_modules/` |
| — | `CHANGELOG.md` | create (optional, Phase 6) | version tracking |

No content is being rewritten for methodology reasons — only frontmatter/path metadata is
being separated from prose, and the two hand-condensed Copilot prompt bodies are being
retired in favor of adapter-generated output from the one canonical version (see §11, risk 5,
for the wording-drift tradeoff this implies).

## 5. Installation architecture

Two install scopes, preserved from today's (already-reasoned) split:

- **Global** (Claude only — Copilot has no global mechanism): `requirements-gathering` and
  `project-planning`, installed once to `~/.claude/skills/{gather-requirements,project-planner}/`.
- **Project**: everything else, installed into the target repo.

Example, running `npx waypoint install --platform claude,copilot` inside `my-app/`:

```
Before                          After
my-app/                         my-app/
├── src/                        ├── src/
└── package.json                ├── package.json
                                 ├── CLAUDE.md
                                 ├── .claude/
                                 │   ├── commands/
                                 │   │   ├── next-step.md
                                 │   │   ├── review-step.md
                                 │   │   └── small-change.md
                                 │   └── skills/web-engineering-checklist/
                                 │       ├── SKILL.md
                                 │       └── references/*.md
                                 ├── .github/
                                 │   ├── copilot-instructions.md
                                 │   ├── instructions/*.instructions.md
                                 │   └── prompts/*.prompt.md
                                 └── .waypoint/
                                     └── install-manifest.json
```

(`website-spec.md` and `docs/design/*` are not part of install — they're generated later,
when the requirements/planner skills are actually *run*, not when the toolkit is installed.)

**Copy, not symlink or live-reference.** A consumer's `CLAUDE.md` etc. must remain editable
and committable in their own repo, independent of the toolkit's install location — a symlink
would break the moment the toolkit is uninstalled, moved, or the consumer forks their repo
without it. Every install action copies rendered files and records a checksum in
`.waypoint/install-manifest.json` for later update/uninstall safety (§8).

## 6. Build/distribution architecture

```
methodology/*.md, commands/*.md, manifest.yaml     (canonical source)
        │  pnpm build
        ▼
adapters/{claude,copilot}/build.ts                 (pure transform, no new content)
        │
        ▼
dist/{claude,copilot}/**                           (rendered, platform-shaped files)
        │  npx waypoint install
        ▼
<consumer repo>/{CLAUDE.md, .claude/**, .github/**, .waypoint/install-manifest.json}
```

`dist/` is **generated only** — never hand-edited (enforced by a header comment plus the
separation guard test in §10). It is gitignored in the toolkit repo (§11) but built and
bundled automatically into the published npm tarball via a `prepublishOnly` script, so
`npx waypoint@latest install` never requires a consumer to run a build themselves.

## 7. Platform support

| Capability | Claude Code | Copilot |
|---|---|---|
| Skills (auto-triggering by description) | yes → `requirements-gathering`, `project-planning`, `engineering-checklist` become real Skills | no equivalent → become prompt files, manually invoked |
| Slash commands | yes → `commands/*.md` | analogous "prompt files," same shape |
| Path-scoped auto-attached instructions | **no** | yes (`applyTo` frontmatter) → `api-routes.md`/`react-components.md`/`tests.md` become separate `.github/instructions/*.instructions.md` files |
| Always-on repo instructions | `CLAUDE.md` | `.github/copilot-instructions.md` |
| Global (user-level) install | yes (`~/.claude/skills/`) | no |

Because Claude has no path-scoped mechanism, its adapter concatenates
`core-protocol.md` + `stack-conventions.md` + `api-routes.md` + `react-components.md` +
`tests.md` into one `CLAUDE.md` (mirrors today's inlined layout exactly). The Copilot
adapter emits `core-protocol.md` + `stack-conventions.md` as `copilot-instructions.md`, and
each of the other three as its own `applyTo`-scoped file — this is a real capability
difference in the platforms as they exist today, not a gap to paper over, so **no** invented
generic third mechanism is needed. A `generic/` adapter is deliberately **not** proposed —
nothing in this repo targets a platform beyond Claude Code and Copilot, and inventing one
speculatively would violate "don't add abstractions beyond what's needed."

## 8. Manifest/versioning design

`manifest.yaml` (toolkit repo, canonical registry):

```yaml
name: waypoint
version: 0.1.0
platforms:
  claude:   { globalInstallSupported: true,  globalInstallRoot: "~/.claude/skills" }
  copilot:  { globalInstallSupported: false }

artifacts:
  - id: requirements-gathering
    kind: skill
    source: methodology/requirements-gathering.md
    installScope: global
    platforms:
      claude:  { type: skill,  installPath: "skills/gather-requirements" }
      copilot: { type: prompt, installPath: ".github/prompts/gather-requirements.prompt.md" }

  - id: project-planning
    kind: skill
    source: methodology/project-planning.md
    bundledFiles:
      - methodology/project-planning/templates/step-format.md
      - methodology/project-planning/templates/status-template.md
      - methodology/project-planning/templates/review-checklist.md
    installScope: global
    platforms:
      claude:  { type: skill,  installPath: "skills/project-planner" }
      copilot: { type: prompt, installPath: ".github/prompts/project-planner.prompt.md" }

  - id: engineering-checklist
    kind: skill
    source: methodology/engineering-checklist.md
    bundledFiles:
      - methodology/engineering-checklist/references/owasp-top10.md
      - methodology/engineering-checklist/references/privacy-checklist.md
      - methodology/engineering-checklist/references/wcag-checklist.md
    installScope: project
    platforms:
      claude:  { type: skill,       installPath: ".claude/skills/web-engineering-checklist" }
      copilot: { type: references,  installPath: ".waypoint/checklist/references" }   # see §11 risk 6

  - id: implementer-instructions
    kind: instructions
    installScope: project
    platforms:
      claude:  { type: always-on, installPath: "CLAUDE.md",
                 includes: [core-protocol, stack-conventions, api-routes, react-components, tests] }
      copilot: { type: always-on, installPath: ".github/copilot-instructions.md",
                 includes: [core-protocol, stack-conventions] }

  - id: api-routes-instructions
    kind: scoped-instructions
    source: methodology/implementer/api-routes.md
    installScope: project
    platforms:
      copilot: { type: scoped, installPath: ".github/instructions/api-routes.instructions.md",
                 applyTo: "**/api/**/*.ts,**/routes/**/*.ts,**/*.route.ts" }
      # claude: none — folded into CLAUDE.md above instead

  # react-components-instructions, tests-instructions: same shape

  - id: next-step-command
    kind: command
    source: commands/next-step.md
    installScope: project
    platforms:
      claude:  { type: command, installPath: ".claude/commands/next-step.md" }
      copilot: { type: prompt,  installPath: ".github/prompts/next-step.prompt.md" }

  # review-step-command, small-change-command: same shape
```

**Versioning in a consumer repo**, `.waypoint/install-manifest.json` (written by
`scripts/install.ts`, read by `update`/`uninstall`):

```json
{
  "toolkitVersion": "0.1.0",
  "installedAt": "2026-08-21T00:00:00Z",
  "platforms": ["claude", "copilot"],
  "artifacts": {
    "implementer-instructions:claude": { "path": "CLAUDE.md", "checksum": "sha256:…" },
    "engineering-checklist:claude": { "path": ".claude/skills/web-engineering-checklist", "checksumDir": "sha256:…" }
  }
}
```

`update` recomputes each installed path's checksum; unchanged files are safely overwritten
with the new version, changed files (the consumer edited them) are left in place with a
reported conflict rather than silently clobbered. `uninstall` removes exactly the paths this
manifest recorded, with the same conflict check. Global installs get their own sibling
marker (`~/.claude/skills/.waypoint-meta.json`) since they aren't scoped to one project.

The toolkit's own `version` in `manifest.yaml` is the single source of truth for semver;
bump it on any change to `methodology/`, `commands/`, or the adapters.

## 9. Development workflow

Working on Waypoint itself (methodology, commands, adapters, installer, tests) is now a
plain TypeScript/Markdown repo with **no active Claude/Copilot skills or commands of its
own** — `CLAUDE.md` and `.github/copilot-instructions.md` at the toolkit root are rewritten
to contain only dev-repo conventions (run `pnpm build` after editing `methodology/**` or
`commands/**`, never hand-edit `dist/**`, run `pnpm test` before committing, bump
`manifest.yaml`'s version on any content change). There is no `.claude/skills/` directory
at the toolkit root at all, so a Claude Code session opened here never has `gather-requirements`,
`project-planner`, or `engineering-checklist` auto-loaded as its own active skills — the
exact bug `settings.local.json` was working around disappears because the thing it was
protecting no longer lives where Claude looks for live skills.

Recommendation (flagged in §11 as a decision point): don't add toolkit-dev slash commands
under `.claude/commands/` either, even for build/release convenience — reuse plain
`package.json` scripts (`pnpm build`, `pnpm test`, `pnpm install:local <path>`) instead, so
there is never a naming collision between "a command for developing Waypoint" and "a command
Waypoint installs into consumers."

## 10. Testing strategy

```
tests/
├── build.test.ts        pnpm build produces dist/claude/** and dist/copilot/** matching
│                         manifest.yaml's declared installPaths; no methodology/**, commands/**,
│                         adapters/**, or scripts/** paths leak into dist/ verbatim.
├── install.test.ts       install into tests/fixtures/empty-project → resulting tree matches
│                         manifest exactly; every file the manifest says should exist, does.
├── reference-resolution.test.ts
│                         every cross-reference a generated file makes (e.g. "see
│                         references/owasp-top10.md", "see docs/design/public-api.md") is
│                         checked against a per-artifact link list in manifest.yaml and
│                         resolved against the installed tree (application-level docs like
│                         docs/design/* are only asserted to be *referenced correctly*, not
│                         to exist, since they're generated later by running the skill).
├── update.test.ts        install v1 fixture output, hand-edit one file, rebuild v2, run
│                         update → untouched files upgrade, the edited file is reported as a
│                         conflict and left alone (not clobbered).
├── uninstall.test.ts      install then uninstall → every manifest path removed; files that
│                         pre-existed in the fixture and weren't installed by Waypoint are
│                         untouched.
├── platform-output.test.ts
│                         Claude output never contains a `.github/instructions/*.instructions.md`
│                         file (no path-scoped mechanism); CLAUDE.md contains the inlined
│                         api-routes/react-components/tests sections; Copilot output never
│                         contains a `.claude/skills/web-engineering-checklist` Skill.
└── separation.test.ts     meta-test run against the toolkit repo itself: fails if
                          `.claude/skills/**` or `.github/prompts/**` reappear at the toolkit
                          root matching any manifest artifact id — guards against problem #1
                          in §2 recurring.

tests/fixtures/
├── empty-project/        bare repo, nothing installed
├── claude-only-project/  pre-existing unrelated .claude/skills/some-other-skill/, to prove
│                         install/uninstall never touches content it didn't put there
└── copilot-only-project/ same, for .github/
```

## 11. Risks and alternatives

1. **TypeScript/npm build pipeline vs. no-build static adapters.** *Recommended:* Option A
   (this plan) — a small Node/TS package (`package.json`, `scripts/*.ts`, `adapters/*.ts`)
   giving `npx waypoint install`, checksummed update/uninstall, and automated tests, per the
   user's explicit ask in points 6/7/10. *Alternative (Option B):* stay pure Markdown — no
   code, no CLI; pre-render `adapters/claude/` and `adapters/copilot/` by hand and keep the
   README's "copy this folder into your repo" instructions, just pointed at `adapters/*`
   instead of `.claude/`/`.github/`. Lower investment, but gets none of `npx install`,
   versioned update-safety, or automated cross-reference tests — rejected because those were
   explicitly asked for, but flagged here since it's a real, valid, much-cheaper alternative
   if the user doesn't want the CLI/test investment right now. **This is a decision I'm
   flagging for you, not one I've silently made** (see the question below).
2. **Renaming `docs/design/` → `.architecture/`.** *Rejected.* The generic template's
   `.architecture/` concern (separating application design artifacts from AI config) is
   already solved by `docs/design/` + `website-spec.md` in this repo; renaming would touch
   every skill/prompt/template's path references for no behavioral gain and would break any
   in-flight consumer project already using `docs/design/`.
3. **Committing `dist/` to git vs. gitignoring it.** *Recommended:* gitignore `dist/`, build
   it into the npm tarball only via `prepublishOnly`. *Alternative:* commit `dist/` so a
   plain `git clone` + manual copy still works without Node — rejected as the primary path
   (encourages hand-editing generated files) but worth keeping as a documented emergency
   fallback in the README.
4. **Preserving the existing global-vs-project install split** for
   `requirements-gathering`/`project-planning` vs. everything else. Not re-litigated — it's
   already a reasoned decision in the current README (those two are useful before a project
   repo exists; nothing else is).
5. **Auto-generating the Copilot prompt bodies from the fuller canonical prose** (this plan)
   **vs. keeping a hand-authored, separately-condensed Copilot voice.** Recommended:
   auto-generate — required by the "don't duplicate methodology across platforms" constraint.
   Tradeoff: today's Copilot prompts are noticeably terser than the Claude Skill bodies (e.g.
   no "What NOT to do" section); the generated versions will be longer/more thorough than
   what Copilot users see today. Alternative if that proves too verbose in practice: tag
   canonical paragraphs as core/detail and let the Copilot adapter emit only "core" — more
   machinery, deferred unless needed.
6. **Where the checklist's deep-dive references live for Copilot.** Today: duplicated by
   pointing Copilot prompts at a Claude-namespaced path (the bug in §2.4). Recommended: a
   shared, platform-neutral installed path, `.waypoint/checklist/references/`, that both the
   Claude Skill (which can point outside its own folder) and the Copilot prompts reference.
   Alternative: physically duplicate the three files into both `.claude/skills/.../references/`
   and a Copilot-side copy — rejected, recreates the exact duplication problem this plan
   exists to remove.
7. **Toolkit-repo dev-only slash commands.** Recommended: none — use plain `package.json`
   scripts, to avoid any naming collision between "a command for building Waypoint" and "a
   command Waypoint installs into a consumer's `.claude/commands/`."

## 12. Implementation phases

**Phase 0 — Decisions (blocking, no file changes).** Resolve the four flagged decision
points above (build pipeline vs. static, dist/ committed vs. gitignored, checklist reference
location, dev-only slash commands) before writing code. *Depends on:* nothing. *Tests:*
none. *Result:* a confirmed design to implement against.

**Phase 1 — Extract canonical methodology (pure move, no behavior change).** Create
`methodology/**` and `commands/**`; move prose verbatim out of the existing SKILL.md /
`.instructions.md` / prompt files, stripping only platform frontmatter (which relocates into
`manifest.yaml`). Leave the existing `.claude/**` and `.github/**` files in place and
untouched — the repo must keep working (manual copy still functions) until adapters exist.
*Depends on:* Phase 0. *Tests:* a content-diff check that canonical prose matches the
original files' bodies exactly. *Result:* `methodology/` and `commands/` exist as the
single source of truth; nothing consumer-facing has changed yet.

**Phase 2 — Build adapters + CLI.** Add `package.json`, `manifest.yaml`,
`adapters/{claude,copilot}/build.ts`, `adapters/lib/template.ts`, `scripts/build.ts`. Run
`pnpm build` and diff `dist/claude/**` + `dist/copilot/**` against the still-present original
`.claude/**`/`.github/**` content, to confirm the adapters reproduce equivalent behavior
(intentional differences: the two cross-reference bugs are now fixed, wording is
adapter-generated rather than hand-condensed for the two prompt-only skills). *Depends on:*
Phase 1. *Tests:* `build.test.ts`. *Result:* `dist/` is a faithful (bug-fixed) reproduction
of today's installed shape, generated rather than hand-maintained.

**Phase 3 — Installer + manifest tracking.** Add `scripts/{install,update,uninstall}.ts` and
the `.waypoint/install-manifest.json` writer/reader with checksum-based conflict detection.
*Depends on:* Phase 2. *Tests:* `install.test.ts`, `update.test.ts`, `uninstall.test.ts`
against `tests/fixtures/*`. *Result:* `npx waypoint install|update|uninstall` works
end-to-end against a fixture project.

**Phase 4 — Cutover.** Delete the now-superseded `.claude/skills/*`, `.claude/commands/*`,
`.github/instructions/*`, `.github/prompts/*` from the toolkit repo root; delete
`.claude/settings.local.json`; replace the toolkit-root `CLAUDE.md` and
`.github/copilot-instructions.md` with the dev-only versions (§9); rewrite `README.md`.
*Depends on:* Phase 3 (installer must exist before the manual-copy fallback is removed).
*Tests:* add `separation.test.ts` to the suite; full suite must pass. *Result:* the toolkit
repo no longer has any `.claude`/`.github` content that functions as its own distributable
payload — the self-interference problem is structurally closed.

**Phase 5 — Fixtures & platform-output coverage.** Add `tests/fixtures/{claude-only,copilot-only}-project/`,
`reference-resolution.test.ts`, `platform-output.test.ts`. *Depends on:* Phase 4. *Tests:*
themselves. *Result:* full coverage of §10's testing strategy.

**Phase 6 — Distribution polish (optional, lower priority).** `CHANGELOG.md`, npm publish
config, `prepublishOnly` build hook, CI workflow running `pnpm test` on PRs. *Depends on:*
Phase 5. *Tests:* CI green. *Result:* `npx waypoint@latest install` works for a real,
published package, without requiring a consumer to build anything themselves.

---

*One step, one reviewable diff still applies once implementation starts — each phase above
is sized to land as its own PR, and Phase 0's decisions should be confirmed before any code
is written.*
