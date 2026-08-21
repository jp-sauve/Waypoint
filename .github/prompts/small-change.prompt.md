---
agent: agent
description: Make one small, self-contained addition or fix to a project whose MVP is already complete, without a full project-planner replan.
---

Use this after `docs/design/STATUS.md` shows every MVP step checked. For anything that needs new architecture, a new entity, or touches more than a couple of files, say so and suggest running the `project-planner` skill again instead — this prompt is for genuinely small, incremental work.

1. Open `docs/design/STATUS.md` and confirm every step is checked. If it isn't, stop and say `/next-step` (`.github/prompts/next-step.prompt.md`) is the right prompt instead.
2. If the user hasn't already described the change in this message, ask what they want added or fixed — keep it to one change per run.
3. If the change touches an existing signature, endpoint, component prop, or schema, check it against `docs/design/public-api.md` / `docs/design/data-model.md` first. If the change alters either, update the doc in the same commit — don't let them drift.
4. Implement the change, patching minimally per `.github/copilot-instructions.md`'s conventions and the relevant `.github/instructions/*.instructions.md` files for anything it touches (API routes, React components, tests).
5. Add tests per `.github/instructions/tests.instructions.md` covering the change (happy path plus at least one error path).
6. If the change touches auth, payments, or a new UI component library, also read `.claude/skills/web-engineering-checklist/references/owasp-top10.md`, `references/wcag-checklist.md`, and (for personal/user data) `references/privacy-checklist.md` before considering it done.
7. Run the change's tests and confirm they pass. Do not mark it done on an assumption.
8. Add a one-line entry (date + short description) to the "Post-MVP Changes" section of `docs/design/STATUS.md`, and commit with message `Change: <short title>` — a distinct prefix from `Step N:` commits, since this isn't part of the original plan.
9. Stop. One change per session, same discipline as `/next-step`.

If the requested change turns out to need new design decisions (a new entity, a new integration, a structural change), stop and say so rather than forcing it through this prompt.
