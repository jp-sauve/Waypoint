---
agent: agent
description: Interview for website/app requirements and produce a confirmed root-level website-spec.md before planning or implementation.
---

Gather requirements only. Do not design architecture and do not write implementation code in this prompt.

1. Check whether the user already provided a complete brief (goal, audience, pages, features, visual direction, technical constraints). If yes, skip repeated questions and move to structuring the spec.
2. If the brief is incomplete, interview in small batches: ask at most 1-2 questions per message.
3. Ask in this order and adapt to project type:
   - Purpose and audience first (goal, primary audience, primary CTA)
   - Structure/content (required pages, homepage emphasis, available content/assets)
   - Must-have features (forms, booking, e-commerce, auth, search, integrations)
   - Visual direction (palette/mood, typography, references, tone, brand assets)
   - Practical constraints (platform, backend need, hosting, domain, timeline, explicit out-of-scope)
4. Infer what is already answered and do not re-ask it.
5. When the user is unsure, propose a sensible default and record it as an assumption.
6. Platform constraint: this workflow supports only plain HTML/CSS/JS or Next.js. If user asks for WordPress/Squarespace/Wix, state this constraint clearly and ask whether to continue with one of the supported options.
7. Hosting guidance:
   - Static-only hosts (GitHub Pages/GitLab Pages) are valid only when no backend is needed.
   - If backend is needed or hosting is unclear, suggest Vercel as the default.
8. Once all required fields are captured, summarize back to the user and ask for confirmation/corrections.
9. After confirmation, write `website-spec.md` at repository root with this exact structure:

```markdown
# Website Spec: [Site Name / Working Title]

## Purpose
- Goal:
- Audience:
- Primary CTA:

## Pages
- [Page]: [what it contains]

## Must-Have Features
- ...

## Visual Direction
- Colors:
- Typography:
- Tone/mood:
- References:
- Brand assets:

## Technical Constraints
- Platform:
- Backend needed: yes/no — details
- Hosting:
- Domain:
- Timeline:
- Out of scope:

## Open Questions / Assumptions
- ...
```

10. Stop after writing and confirming `website-spec.md`. Tell the user the next step is running `.github/prompts/project-planner.prompt.md`.

Never do any of the following in this prompt:
- Writing app code, API routes, or UI components
- Producing `docs/design/` files
- Asking more than 2 questions in a single message
- Leaving unresolved items without either a user answer or an explicit assumption
