---
description: Review the current diff (the most recently completed implementation step) against the project's review checklist.
---

Review only — do not implement fixes unless explicitly asked to in a follow-up.

1. Identify the diff to review: the uncommitted working-tree changes, or if the tree is clean, the most recent commit.
2. Open `docs/design/reference/review-checklist.md`. If it doesn't exist, use the implementer's stack-conventions checklist as a fallback and note that the project-specific checklist is missing. For a diff that touches auth, payments, or a new UI component library, also run {{artifact:engineering-checklist}} for the fuller version of the same checks. For a diff that touches accounts, profiles, payments, or any personal/user data, also check it against its privacy-checklist reference. For a diff that adds a modal, dropdown, toast, or header, check it against {{artifact:ui-components}} — confirm it started from an applicable pattern there rather than reinventing the interaction logic, and flag it if it didn't with no stated reason why. For a diff that adds new page/route scroll or navigation behavior (snapped sections, a paged sequence, an app shell, a canvas, a feed) or a new region's spatial composition (a grid, bento, sidebar + content, etc.), check it against {{artifact:layout-patterns}} the same way.
3. Go through the checklist category by category against the actual diff. For each category, report pass, or a specific finding with file:line and what's wrong — no vague findings like "could be improved."
4. Cross-check the diff against the step's declared "Files to create/modify" and "Out of scope" boundaries in `docs/design/mvp-implementation-plan.md`. Flag any file touched that wasn't declared.
5. Confirm the step's acceptance criteria were actually run, not just claimed — re-run them if a test command is named.
6. Report findings as a list, most severe first. If everything passes, say so plainly rather than inventing minor nitpicks to fill space.

Patch minimally if asked to fix findings afterward — only touch what the finding requires, per the implementer's patch-minimally rule.
