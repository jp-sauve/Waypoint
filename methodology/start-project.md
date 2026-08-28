# Start Project

A structured interview skill that turns a vague "build me a website" request into a
complete, unambiguous spec another agent (or you, afterward) can build from.

## Purpose

Never start designing or coding a site straight from a one-line request. This skill's
job is ONLY to gather and structure requirements — not to build anything. Building
happens in a separate step, after the user confirms the spec.

## How to run the interview

1. **Ask in small batches, not a wall of questions.** One or two questions per turn,
   conversational tone. Never dump the entire checklist at once — it overwhelms people
   and produces shallow answers.
2. **Order matters.** Start with purpose and audience — nearly every later answer
   (features, tone, structure) depends on it. Don't ask about color palettes before you
   know what the site is for.
3. **Adapt as you go.** Skip categories that don't apply (don't ask about product
   catalogs for a personal portfolio). Dig deeper when an answer is vague — "modern and
   clean" needs a follow-up (reference sites? light or dark? any brand colors already?).
4. **Infer, don't re-ask.** If the user's first message already answers something
   ("it's for my bakery, mainly so people can see the menu and order online"), don't
   ask it again — note it and move to the next gap.
5. **Offer examples/defaults** when a user seems unsure, rather than leaving a question
   open-ended forever ("if you're not sure on colors, I could go with a warm, earthy
   palette given it's a bakery — sound right?").
6. **Know when to stop.** Once you have the required fields below, summarize back to
   the user and ask them to confirm or correct before finishing.

## Required fields to capture

**Purpose & audience** (ask first, always)
- What is the site for? What's the main goal (sell, inform, showcase, book, collect
  leads)?
- Who's the primary audience?
- What's the single most important action a visitor should take?

**Structure & content**
- What pages are needed (Home, About, Services, Contact, Blog, Shop, etc.)?
- What should the homepage lead with?
- Any existing content/copy/images to use, or does it need to be drafted?

**Must-have features**
- Contact form? Booking/scheduling? E-commerce/payments? Search? User accounts/login?
- Blog or news section? Newsletter signup? Social links? Maps/location?
- Any integrations (CRM, email marketing, analytics, payment processor)?

**Visual direction**
- Colors — specific palette, brand colors, or a mood ("warm and earthy," "bold and
  modern," "minimal")?
- Fonts/typography preference, or leave to designer's judgment?
- Reference sites they like the look of (ask for 1-3 examples if possible)?
- Existing brand assets — logo, style guide, images?
- Overall tone: playful, corporate, luxury, minimal, friendly, technical, etc.?

**Practical constraints**
- Static site, or does it need a backend/database? Ask in plain terms — does it just
  need to show information, or also do things like logins, forms that save data, or a
  shopping cart?
- Platform: this only builds two things — a plain HTML/CSS/JS site, or a Next.js
  (React) site. Don't offer WordPress, Squarespace, Wix, or similar; if the user names
  one of those, tell them plainly that this tool doesn't produce that and they'd need a
  different one. Default to Next.js unless the site is a genuinely small handful of
  static pages with no interactivity, where plain HTML/CSS/JS is simpler and still
  fully supported.
- Hosting: who's going to host this once it's built — the user themselves, an existing
  hosting account they manage, or a specific platform (Vercel, GitHub Pages, GitLab
  Pages, other)? Note for your own reasoning, not necessarily to say verbatim: GitHub
  Pages, GitLab Pages, and most plain static hosts only work if there's no backend; a
  site that needs one needs a host that runs a Node server, like Vercel. If they're not
  sure, suggest Vercel as the default — it's free for personal projects, needs no cloud
  account or infrastructure setup, and deploys automatically from a GitHub repo, which
  is the easiest path for someone who isn't managing their own hosting.
- Domain: do they have, or want, a custom domain? This is advisory only, not a build
  requirement — flag that they'll need to update DNS records at their domain registrar
  once hosting is settled, and note it under Open Questions/Assumptions rather than
  blocking on it.
- Timeline or launch date?
- Anything explicitly out of scope?

## Output format

Once the required fields are captured and confirmed, produce a structured spec in
markdown, using this shape:

```markdown
# Website Spec: [Site Name / Working Title]

## Purpose
- Goal:
- Audience:
- Primary CTA:

## Pages
- [Page]: [what it contains]
- ...

## Must-Have Features
- ...

## Visual Direction
- Colors:
- Typography:
- Tone/mood:
- References:
- Brand assets: [list or "none provided"]

## Technical Constraints
- Platform:
- Backend needed: yes/no — details
- Hosting:
- Domain:
- Timeline:
- Out of scope:

## Open Questions / Assumptions
- [Anything the user was unsure about, and the default you're proposing]
```

Save this spec to `website-spec.md` at the project's repository root — a sibling of
where `docs/design/` will be created, not inside it, so {{artifact:project-planning}} can find
it automatically. Once saved and confirmed, tell the user the spec is ready and that the
next step is running {{artifact:project-planning}}, which reads `website-spec.md` and
uses it instead of re-asking the same questions.

## What NOT to do

- Don't start writing code, HTML, or design mockups during this interview.
- Don't ask more than ~2 questions per message.
- Don't ask about fields the user has already answered.
- Don't treat "I'm not sure" as a dead end — offer a sensible default and move on;
  note it under Open Questions/Assumptions.
- Don't invoke {{artifact:project-planning}} or start building yourself — tell the user
  it's the next step and stop.
