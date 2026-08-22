# UI Component References

A small library of verified, accessible reference implementations for UI patterns
that are easy to get wrong from scratch: focus management, keyboard interaction, and
screen-reader announcements. The goal is to stop re-deriving the same modal or
dropdown logic (and re-introducing the same a11y bugs) on every project — adapt a
known-good implementation instead of inventing one.

This is a reference library, not a component package. Nothing here is meant to be
imported as-is from a shared dependency — each reference is a self-contained example
you copy in and adapt, because the parts that need adapting (styling, positioning,
portal target) are genuinely project-specific and can't be pre-decided here.

## Order of operations

1. **Check the table below first.** If the UI pattern the user wants matches an
   existing reference, start from it rather than writing the interaction logic from
   scratch.
2. **Adapt, don't paste blindly.** Every reference has an "Adapt to this project"
   section listing the values that were left generic on purpose (see below) — resolve
   those against the current project's conventions before treating the component as
   done.
3. **Compose when the user asks for a combination** (e.g. a dropdown menu inside a
   modal) — the references are independent and can nest, but re-check focus handling
   at the seam, since two independent focus traps must not fight each other.
4. **Only write new interaction logic from scratch** when no reference fits. If what
   you build is generically reusable (not project-specific), tell the user it could be
   worth adding to this library as a new reference — don't add it yourself without
   asking, since a reference here is meant to already be vetted.

Pick the reference matching the project's actual stack — check whether it's a React
project or a plain HTML/CSS/JS one with no build step (per `stack-conventions.md`'s
"no build step" allowance) before choosing a row below.

| Pattern | Stack | Reference | Use when |
|---|---|---|---|
| Modal / dialog | React | `ui-components/references/modal.md` | Blocking overlay that demands a response before the user can interact with the rest of the page. |
| Modal / dialog | Vanilla HTML/CSS/JS | `ui-components/references/modal-vanilla.md` | Same use case, no framework. |
| Dropdown / menu | React | `ui-components/references/dropdown-menu.md` | A button that reveals a list of actions or options, not full page navigation. |
| Dropdown / menu | Vanilla HTML/CSS/JS | `ui-components/references/dropdown-menu-vanilla.md` | Same use case, no framework. |
| Toast / notification | React | `ui-components/references/toast.md` | A transient, non-blocking status message the user doesn't have to dismiss to keep working. |
| Toast / notification | Vanilla HTML/CSS/JS | `ui-components/references/toast-vanilla.md` | Same use case, no framework — a static page with a `fetch()`-backed form or action still needs to report success/failure. |
| Header — scrolls with the page | Any | `ui-components/references/header-static.md` | Default; no persistent nav needed while scrolling. |
| Header — fixed to the top | Any | `ui-components/references/header-fixed.md` | Persistent nav/search/actions must stay visible while scrolling. |
| Header — shrinks on scroll | Any | `ui-components/references/header-shrinking.md` | Persistent header, but shouldn't keep its full first-load size once the user has scrolled into the content. |

The header references are markup + CSS + a small vanilla JS snippet regardless of
stack, since a header's scroll behavior isn't framework-specific — port the JS into a
`useEffect` for a React project rather than looking for a separate React version.

## Why values are left generic

Every reference includes CSS with a few properties — most commonly `z-index`,
sometimes a color or spacing token — set to a clearly-marked placeholder rather than
a real value. These are the properties whose correct value depends on the rest of the
application (the existing stacking context, the design system's actual scale) and
picking a value here would be a guess that happens to work in isolation and conflicts
in the real page. Resolve these against the current project before considering the
component finished:

- **`z-index`** — check what the project's highest existing stacking context is (nav
  bars, sticky headers, other overlays) and pick a value that sits above it, using the
  project's z-index scale/tokens if one exists rather than an arbitrary number. As a
  starting *relative* ordering, this library's own placeholders assume
  header (10) < dropdown menu (100) < modal backdrop (1000) < toast (1100) — still
  verify that ordering against the project's real stacking context rather than
  trusting it blindly. The vanilla modal and dropdown references sidestep this
  entirely by rendering into the browser's top layer (`<dialog>`/`popover`), which
  has no `z-index` to resolve at all — prefer that where the project's browser
  support allows it.
- **Colors, spacing, radius, font** — replace with the project's design tokens
  (Tailwind classes, SCSS variables, CSS custom properties) per its actual conventions
  — don't leave the reference's placeholder values in place next to the rest of the
  app's real styling.
- **Portal target** — the references render via `createPortal` into `document.body`;
  if the project already has a designated portal root (common when multiple overlay
  types need to share stacking order), use that instead.
- **Scroll lock** (modal only) — if the project already has a global scroll-lock
  mechanism, use it instead of the reference's local one; two independent scroll locks
  will fight when a second overlay opens on top of the first.

## Accessibility contract

Each reference satisfies the relevant items in {{artifact:engineering-checklist}}'s
Accessibility section (keyboard operability, focus management, labels, live-region
announcements) — that checklist is still the source of truth for *what* "accessible"
requires; these references are one *implementation* of it, not a replacement for
checking against it.

## Stack assumptions

React references are functional React 19 components in TypeScript (`ref` as a plain
prop, no `forwardRef`), matching this project's React/Next.js conventions. Vanilla
references are plain HTML/CSS/JS with no build step, for a project scoped that way
per `stack-conventions.md`. Both ship plain CSS — port it into the project's actual
styling approach (Tailwind or SCSS modules, not both) rather than shipping a bare
`<style>`/CSS file into a project that doesn't otherwise have one.
