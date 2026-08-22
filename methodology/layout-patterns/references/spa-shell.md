# Reference: SPA / application shell

A persistent application chrome — header, primary nav, sidebar — that never reloads
or re-scrolls as the user navigates, wrapped around a single content region that
swaps per route. The chrome and the content region scroll (or don't) independently:
the shell itself is viewport-locked (`height: 100dvh`, no body scroll), and only the
content region scrolls internally. This is the structural pattern underneath most
"app-like" products (dashboards, admin panels, tools), as opposed to a marketing site
or article, which should generally use `document-flow.md` instead and let the whole
page scroll.

The content region can itself be in one of three modes, and different routes in the
same app commonly use different ones:

- **Static** — content fits within the region with no scrolling at all (a short
  settings form, a single-screen tool). No special handling beyond `overflow: hidden`
  on the region.
- **Scrolled** — content overflows the region and scrolls independently within it
  (`overflow-y: auto` on the region, not the page) while the chrome stays fixed. The
  default for most content-heavy routes.
- **Paged** — content within the region paginates (page-by-page controls) rather than
  scrolling — e.g. a data table with page numbers. Combine with the project's own
  pagination UI; this reference only establishes that the region is the pagination
  boundary, not the whole viewport.

## What this implementation covers

- A CSS Grid shell (`grid-template-areas`) with `height: 100dvh` on the root and
  `overflow: hidden` on the grid, so the shell itself never produces a page-level
  scrollbar — only the designated content region can scroll.
- `main` (the content region) gets its own `overflow-y: auto`, independent of the
  sidebar/header, which is what keeps the chrome pinned while content scrolls.
- A `data-content-mode` attribute on `main` (`static` / `scrolled` / `paged`) purely
  as a documentation/styling hook for which mode the current route is using — it
  doesn't change the CSS mechanism itself, since `overflow-y: auto` is harmless on
  content that doesn't overflow (the static case) and pagination UI is the route's
  own concern.
- `100dvh` (dynamic viewport height) rather than `100vh` for the shell root, so it
  accounts for mobile browser chrome the same way `100svh` does for individual
  sections in the viewport-section references — `dvh` is the right choice here
  specifically because the shell is meant to always fill the *current* visible
  viewport, not underscoot it.

## What it does *not* cover

- Client-side routing itself (React Router, Next.js App Router, etc.) — this
  reference is the CSS/structural shell only; wire the actual route-to-content
  mapping through the project's router.
- Scroll-position restoration between route changes — if the project's router
  doesn't already handle this, a route change into the content region should
  generally reset its scroll to top; add that in the router's navigation handler,
  not here.

## Code

```html
<div class="app-shell">
  <header class="app-shell__header"><!-- persistent header --></header>
  <nav class="app-shell__sidebar" aria-label="Primary"><!-- persistent nav --></nav>
  <main class="app-shell__main" data-content-mode="scrolled">
    <!-- swapped per route -->
  </main>
</div>
```

```css
.app-shell {
  height: 100dvh;
  overflow: hidden;
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    "sidebar header"
    "sidebar main";
}

.app-shell__header {
  grid-area: header;
  /* ADAPT: replace with the project's real header styling — this shell doesn't
     assume fixed/sticky since it's already outside document flow via the grid. */
}

.app-shell__sidebar {
  grid-area: sidebar;
  overflow-y: auto;
  /* ADAPT: width and background per the project's design. */
  width: 240px;
}

.app-shell__main {
  grid-area: main;
  overflow-y: auto;
  padding: 24px;
}

.app-shell__main[data-content-mode="static"] {
  overflow-y: hidden;
}
```

## Adapt to this project

- [ ] `width: 240px` on the sidebar — replace with the project's actual value, or
  make it collapsible if the product needs that.
- [ ] Confirm the router resets `main`'s scroll position on route change (`main.
  scrollTop = 0` or the framework's equivalent) — without it, navigating to a new,
  shorter route can leave the content region scrolled to a position with nothing
  there.
- [ ] For the `paged` content mode, use the project's own pagination component inside
  `main` — this reference only establishes that `main` is the scroll/pagination
  boundary, not a pagination UI itself.
- [ ] On narrow viewports, the sidebar commonly needs to collapse into a
  toggleable drawer rather than staying a fixed grid column — that's a separate,
  project-specific responsive decision this reference doesn't prescribe.
