---
agent: agent
description: Implement the next unchecked step from docs/design/mvp-implementation-plan.md, per the STATUS.md protocol.
---

Implement exactly one step:

1. Open `docs/design/STATUS.md` and find the first unchecked box. If every box is checked, report that the MVP plan is complete and stop.
2. Open `docs/design/mvp-implementation-plan.md` and find that step's entry. Read only this step's entry, not the whole file.
3. Read only the specific reference doc(s) this step names by name (e.g. `docs/design/public-api.md`, `docs/design/data-model.md`) — not the rest of `docs/design/`.
4. Implement exactly what the step's "Files to create/modify" and "Details" sections specify. Stay inside the "Out of scope" boundary — if you find you need to touch a file outside the declared list to make this step work, stop and explain why instead of expanding scope.
5. Add tests per `.github/instructions/tests.instructions.md` covering the step's acceptance criteria.
6. Run the acceptance criteria concretely (the exact test command / behavior named in the step) and confirm they pass. Do not mark the step done on an assumption.
7. Update `docs/design/STATUS.md`: check this step's box, update "Last updated" and "Current step," and log any deviation from the plan in the Notes section.
8. Commit: one commit per step, message `Step N: <short title>` matching the step's title in `mvp-implementation-plan.md`, with the STATUS.md update included in the same commit.
9. Stop. Do not continue to the next step in this same run — report what was done and let the next `/next-step` invocation pick up from there.

If `STATUS.md` or `mvp-implementation-plan.md` is missing, or the next step's instructions are ambiguous enough that you'd be guessing at a decision the planning pass should have made, stop and ask rather than proceeding.
