# STATUS.md Template

`STATUS.md` is how a future session with zero memory of this one figures out what's done and what's next. It must always be updated as the *last* action of completing a step — never left stale. Copy this skeleton into the target project's `docs/design/STATUS.md`, matching phases/steps to `mvp-implementation-plan.md` exactly.

```markdown
# Implementation Status

Last updated: <ISO date, updated every time a step completes>
Current step: <Step N — short title, or "None — MVP complete">

## How to use this file

1. Find the first unchecked step below.
2. Read ONLY that step's entry in `mvp-implementation-plan.md`, plus any doc it names by name.
3. Implement, run tests, verify acceptance criteria.
4. Check the box, update "Last updated" and "Current step" above, commit — one commit per step, message `Step N: <short title>` matching the step's title in `mvp-implementation-plan.md`, with the STATUS.md update included in the same commit.
5. Stop. Do not cascade into the next step in the same session unless explicitly asked to.

## Phase 0: Tooling & Scaffolding

- [ ] Step 1: <title>
- [ ] Step 2: <title>

## Phase 1: <name>

- [ ] Step 3: <title>
- [ ] Step 4: <title>

<!-- one phase section per phase in mvp-implementation-plan.md, in the same order -->

## Notes / deviations

<!-- If a step was implemented differently than specified, log it here with a one-line reason.
     This is the ONLY place a future stateless session will see that the plan and the code diverged. -->

## Post-MVP Changes

<!-- Once every step above is checked, log further small additions/fixes here (one line each:
     date, short description) instead of reopening the phase checklist above. Use the
     `/small-change` command (`.claude/commands/small-change.md`) or
     `.github/prompts/small-change.prompt.md` for these — not `project-planner` or `/next-step`. -->
```
