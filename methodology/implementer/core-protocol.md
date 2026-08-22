# Implementer Protocol

A project built with Waypoint is implemented incrementally by a lightweight model (cheap
API model, local model, or GitHub Copilot) from a planning package under `docs/design/`,
written by a separate, more capable planning pass (the `project-planning` artifact). The
implementer's job is to execute that plan one step at a time, not to re-plan it.

## Before touching any code

1. Read `docs/design/STATUS.md`. Find the first unchecked step.
2. Read only that step's entry in `docs/design/mvp-implementation-plan.md`, plus any doc it names by name (e.g. `public-api.md`, `data-model.md`). Do not read the entire `docs/design/` corpus — it isn't necessary and wastes context.
3. If `STATUS.md` or the named step doesn't exist, or the repo has no `docs/design/` directory:
   - If the user is asking to start a new project or plan first, run {{artifact:requirements-gathering}} (to produce `website-spec.md`) and then {{artifact:project-planning}} (to produce `docs/design/`).
   - Otherwise stop and say the planning package is missing rather than guessing at scope.

## While implementing

- **Patch minimally.** Only change what the current step requires. If a larger rewrite seems warranted, say so and ask — don't do it unprompted.
- Match every signature, type, and file path to what's specified in `public-api.md` / `data-model.md` exactly. If the step's instructions and a referenced doc disagree, the referenced doc wins — flag the discrepancy instead of silently picking one.
- Stay inside the step's declared "Files to create/modify" list and "Out of scope" boundary. If the step is impossible without touching a file outside that list, stop and explain why rather than expanding scope silently.
- Add tests for new functionality: at minimum the happy path and one error path, per the test conventions. Do not add snapshot tests or exhaustive edge-case suites unless the step asks for it.
- Include error handling and loading/empty states for anything user-facing; do not add speculative error handling for cases that can't occur.
- Responsive/accessible by default for anything UI-facing: labels on interactive elements, focus visible, reduced-motion fallback for animation, mobile-first layout. Run {{artifact:engineering-checklist}} on route/DB/auth/UI diffs rather than re-deriving its checks by hand.

## After implementing a step

1. Verify the step's acceptance criteria concretely (run the named test file/command; don't eyeball it).
2. Run through `docs/design/reference/review-checklist.md` if present.
3. Check the box for this step in `docs/design/STATUS.md`, update "Last updated" and "Current step," and log any deviation from the plan in the Notes section.
4. Commit: one commit per step, message `Step N: <short title>` matching the step's title in `mvp-implementation-plan.md`. Include the STATUS.md update in the same commit.
5. Stop. Do not cascade into the next step in the same session unless explicitly asked to — one step, one session, one reviewable diff.

## After the MVP is complete

Once every step in `docs/design/STATUS.md` is checked, further small additions or fixes go through {{command:small-change}}, not a full re-run of {{artifact:project-planning}}. It follows the same patch-minimally discipline as {{command:next-step}}, but for one-off post-MVP work: it updates `public-api.md`/`data-model.md` if the change touches them, adds tests, and logs itself in `STATUS.md`'s "Post-MVP Changes" section instead of the phase checklist.

## Golden rule

If asked for more than one step at once, implement only the first and say why you stopped there. If information needed to proceed is missing from `STATUS.md` and the referenced docs, ask rather than inventing a decision that should have been made during planning.
