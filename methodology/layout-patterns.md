# Layout & Page Pattern References

A library of verified reference implementations for page-level layout architecture —
the structural decisions about how a page or app behaves as a whole, as distinct
from the individual interactive widgets covered by {{artifact:ui-components}}. The
goal is the same: stop re-deriving (and re-introducing the same bugs into) scroll
mechanics, snap behavior, and pan/zoom handling on every project — adapt a known-good
structural implementation instead of inventing one.

This library covers two independent axes of layout decisions:

- **Page flow** — how the page or route behaves as the user scrolls or navigates
  through it: plain document flow, snapped viewport sections, a paged/slide sequence,
  an application shell, a pinned-panel narrative, a pan/zoom canvas, or a
  progressively-loaded feed. This is the *macro* structure — what "scrolling" or
  "navigating" even means on this page.
- **Spatial composition** — how content is arranged within a given region: single or
  multi-column, a grid, a bento layout, a sidebar-plus-content split, and so on. This
  is the *micro* structure within whatever region page flow has established.

The two compose freely — a `document-flow.md` page commonly uses a `sidebar-content`
composition inside it; an `spa-shell.md` content region commonly uses a `grid`
composition for its cards. Pick one pattern from each axis independently rather than
treating them as a single combined choice.

## Order of operations

1. **Check the tables below first.** If the page's scroll/navigation behavior, or a
   region's spatial arrangement, matches an existing reference, start from it rather
   than writing the layout mechanics from scratch.
2. **Adapt, don't paste blindly.** Every reference has an "Adapt to this project"
   section listing the values left generic on purpose (breakpoints, z-index, design
   tokens, content-specific thresholds) — resolve those against the current project's
   conventions before treating the pattern as done.
3. **Default to `document-flow.md` and `single-column.md`** unless the content
   genuinely calls for a departure from either. Every other reference here trades
   away some native browser behavior, or introduces visual complexity, for a
   specific effect — that trade should be justified by the content, not chosen
   because it looks more "designed."
4. **Only write new layout mechanics from scratch** when no reference fits. If what
   you build is generically reusable, tell the user it could be worth adding to this
   library as a new reference — don't add it yourself without asking, since a
   reference here is meant to already be vetted.

### Page flow

| Pattern | Reference | Use when |
|---|---|---|
| Document flow | `layout-patterns/references/document-flow.md` | Default — content reads top-to-bottom, page height grows naturally, no scroll-hijacking. |
| Viewport sections — hard snap | `layout-patterns/references/viewport-sections-hard-snap.md` | Short, self-contained full-height "slides" where landing mid-section would look broken; scroll is forced to land on a section boundary. |
| Viewport sections — soft snap | `layout-patterns/references/viewport-sections-soft-snap.md` | Full-height sections whose content may be long-form or zoomed; sections align on scroll-end without ever blocking free scrolling. |
| Viewport sections — overlapping | `layout-patterns/references/viewport-sections-overlapping.md` | A sequence of full-height sections meant to visually stack/layer over each other while scrolling, not stay separate. |
| Paged / slides | `layout-patterns/references/paged-slides.md` | Discrete pages advanced explicitly by the user (button/keyboard/swipe) — onboarding, carousels, presentations. No scrolling involved at all. |
| SPA / application shell | `layout-patterns/references/spa-shell.md` | Persistent chrome (header/nav/sidebar) around a content region that swaps per route; the region can itself be static, independently scrolled, or paged. |
| Sticky panel + scrolling narrative (split screen) | `layout-patterns/references/sticky-split-scroll.md` | A pinned visual panel that updates as narrative text scrolls past beside it — "scrollytelling." Needs real screen width; collapses on mobile. |
| Canvas | `layout-patterns/references/canvas.md` | Free-form pan/zoom 2D surface (whiteboard, node graph) — content has real spatial relationships worth preserving, not a scrolling document at all. |
| Feed | `layout-patterns/references/feed.md` | A vertically stacked list of unbounded/open-ended length, loaded progressively rather than rendered all at once. |

### Spatial composition

| Pattern | Reference | Use when |
|---|---|---|
| Single column | `layout-patterns/references/single-column.md` | Default — one linear content column, no side-by-side regions. |
| Multi-column | `layout-patterns/references/multi-column.md` | Long-form flowing text that should reflow across newspaper-style columns on wide viewports. |
| Grid — normal | `layout-patterns/references/grid-normal.md` | A collection of same-importance, same-shape items (cards, thumbnails) that should reflow responsively with no manual breakpoints. |
| Grid — offset | `layout-patterns/references/grid-offset.md` | A uniform grid that wants a staggered, brick-like visual rhythm without unpredictable per-item heights. |
| Grid — masonry | `layout-patterns/references/grid-masonry.md` | Items with genuinely varying content-driven heights that should pack tightly with minimal gaps. |
| Uniform flex row | `layout-patterns/references/uniform-flex-row.md` | A fixed, small count of equal-weight items that must stay in one row (a stat bar, a segmented control), not wrap. |
| Bento | `layout-patterns/references/bento.md` | A curated, fixed-count collection where some items deliberately carry more visual weight than others. |
| Sidebar + content | `layout-patterns/references/sidebar-content.md` | A persistent secondary nav/filter region beside a primary content area. |
| Layered | `layout-patterns/references/layered.md` | Elements deliberately overlapping within one region (a text card over an image) — a static composition, not scroll-driven. |
| Asymmetric | `layout-patterns/references/asymmetric.md` | A small number of regions with a deliberately unequal visual weight (a featured item beside minor ones), for hierarchy/tension rather than uniformity. |

## Why values are left generic

As with {{artifact:ui-components}}, each reference leaves a few properties as
clearly-marked placeholders rather than real values, because the correct value
depends on the rest of the application:

- **`z-index`** — for any pattern using `position: sticky`/`fixed` (overlapping
  sections, sticky split-scroll, section-indicator dots, a collapsed sidebar drawer,
  layered elements with a non-default stacking order), check it against the
  project's existing stacking context and any header from {{artifact:ui-components}}
  — verify the ordering explicitly rather than trusting the placeholder.
- **Breakpoints** — patterns that need a narrow-viewport fallback (sticky
  split-scroll's mobile stack, an app shell's collapsible sidebar, a sidebar-content
  or bento or asymmetric composition's stacked collapse) use a placeholder
  breakpoint; replace with the project's actual responsive scale.
- **Colors, spacing, tokens** — replace with the project's design tokens, same as
  every reference in {{artifact:ui-components}}.
- **Content-specific thresholds** — scroll-snap proximity feel, IntersectionObserver
  `rootMargin`/`threshold` values, zoom min/max on the canvas reference, a grid's
  `minmax`/column-width floor, an offset grid's stagger amount — these are tuned
  against the project's actual content, not a value that transfers correctly between
  projects.

## Accessibility contract

Several patterns here carry real accessibility failure modes that are easy to miss —
mandatory scroll-snap trapping a zoomed-in user, autoplaying carousels with no pause
control, infinite auto-load disorienting screen-reader users, a pointer-only canvas
with no keyboard path, a masonry grid's visual order diverging from DOM order for a
screen-reader user, an off-canvas sidebar drawer that isn't a proper focus trap. Each
reference's "What this implementation covers" section calls out the specific risk and
how the reference addresses it; check a reference's own notes in addition to
{{artifact:engineering-checklist}}'s general Accessibility section, since these are
pattern-specific failure modes that checklist's general items won't individually
name.

## Stack assumptions

All references here ship as plain HTML/CSS/JS with no build step and no framework
dependency, unlike {{artifact:ui-components}}'s React/vanilla split — layout
mechanics (scroll containers, sticky positioning, pointer events, grid/flex
composition) aren't component-shaped the way a modal or dropdown is, so there's one
version to port into the project's actual templating/component approach rather than
separate React and vanilla variants.
