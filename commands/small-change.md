---
description: Make one small, self-contained addition or fix to a project whose MVP is already complete, without a full project-planning replan.
---

Use this after `docs/design/STATUS.md` shows every MVP step checked. For anything that needs new architecture, a new entity, or touches more than a couple of files, say so and suggest running {{artifact:project-planning}} again instead — this command is for genuinely small, incremental work.

1. Open `docs/design/STATUS.md` and confirm every step is checked. If it isn't, stop and say {{command:next-step}} is the right one instead.
2. If the user hasn't already described the change in this message, ask what they want added or fixed — keep it to one change per run.
3. If the change touches an existing signature, endpoint, component prop, or schema, check it against `docs/design/public-api.md` / `docs/design/data-model.md` first. If the change alters either, update the doc in the same commit — don't let them drift.
4. Implement the change, patching minimally per the implementer's conventions (stack, error handling, accessibility, API route, React component, and test conventions all still apply).
5. Add tests for the change (happy path plus at least one error path), per the test conventions.
6. If the change touches an API route, DB query, auth, or user-facing UI, run {{artifact:engineering-checklist}} before considering it done. For a new modal, dropdown, toast, or header, check {{artifact:ui-components}} before writing the interaction logic from scratch. For a new page/route's scroll or navigation behavior (snapped sections, a paged sequence, a canvas, a feed, etc.) or a new region's spatial composition (a grid, bento, sidebar + content, etc.), check {{artifact:layout-patterns}} before writing the layout mechanics from scratch.
7. Run the change's tests and confirm they pass. Do not mark it done on an assumption.
8. Add a one-line entry (date + short description) to the "Post-MVP Changes" section of `docs/design/STATUS.md`, and commit with message `Change: <short title>` — a distinct prefix from `Step N:` commits, since this isn't part of the original plan.
9. Stop. One change per session, same discipline as {{command:next-step}}.

If the requested change turns out to need new design decisions (a new entity, a new integration, a structural change), stop and say so rather than forcing it through this command.
