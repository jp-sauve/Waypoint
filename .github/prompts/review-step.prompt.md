---
agent: agent
description: Review the current diff (the most recently completed implementation step) against the project's review checklist. Reports findings; does not rewrite wholesale.
---

Review only — do not implement fixes unless explicitly asked to in a follow-up.

1. Identify the diff to review: the uncommitted working-tree changes, or if the tree is clean, the most recent commit.
2. Open `docs/design/reference/review-checklist.md`. If it doesn't exist, use the checklist in `.github/copilot-instructions.md`'s "Stack conventions" section as a fallback and note that the project-specific checklist is missing. For a diff that touches auth, payments, or a new UI component library, also read `.claude/skills/web-engineering-checklist/references/owasp-top10.md` and `references/wcag-checklist.md` for the fuller version of the same checks. For a diff that touches accounts, profiles, payments, or any personal/user data, also read `references/privacy-checklist.md`.
3. Go through the checklist category by category against the actual diff. For each category, report pass, or a specific finding with file:line and what's wrong — no vague findings like "could be improved."
4. Cross-check the diff against the step's declared "Files to create/modify" and "Out of scope" boundaries in `docs/design/mvp-implementation-plan.md`. Flag any file touched that wasn't declared.
5. Confirm the step's acceptance criteria were actually run, not just claimed — re-run them if a test command is named.
6. Report findings as a list, most severe first. If everything passes, say so plainly rather than inventing minor nitpicks to fill space.

Patch minimally if asked to fix findings afterward — only touch what the finding requires, per `.github/copilot-instructions.md`.
