# Reference: Document flow

The baseline page-flow pattern: content stacks vertically in natural reading order,
the page's height grows with its content, and the browser's native scrollbar/scroll
behavior is left alone — no scroll-hijacking, no viewport-locked sections, no custom
scroll container. This is the *default*; every other page-flow reference in this
library is a deliberate departure from it, justified by a specific content need
(a slideshow, a pinned narrative panel, a free-form canvas). Reach for one of those
only when the content genuinely calls for it, not because a plain scrolling page
feels less "designed."

Use for articles, marketing pages, docs, forms, dashboards with a fixed set of
sections — anything where the user reading top-to-bottom and stopping wherever they
like is the correct interaction model.

## What this implementation covers

- Semantic landmark structure (`header` / `main` / `section` / `footer`) so the page
  is navigable by assistive tech's landmark/heading navigation, not just visually.
- A `.prose` content container with a `max-width` and horizontal auto-margins, so line
  length stays readable on wide viewports instead of text stretching edge to edge.
- `content-visibility: auto` on off-screen sections of a long page, which lets the
  browser skip layout/paint work for content not yet scrolled into view — a real
  performance win on long documents with no behavior change for the user.

## What it does *not* cover

- Any of the departures from plain flow (snap sections, sticky panels, pagination,
  infinite feeds, a pan/zoom canvas) — see the other references in this library for
  those.

## Code

```html
<body>
  <header class="site-header"><!-- see ui-components.md's header references --></header>
  <main>
    <article class="prose">
      <h1>Page title</h1>
      <section>
        <h2>Section one</h2>
        <p>…</p>
      </section>
      <section class="long-section" style="content-visibility: auto; contain-intrinsic-size: 0 800px;">
        <h2>Section two</h2>
        <p>…</p>
      </section>
    </article>
  </main>
  <footer><!-- site footer --></footer>
</body>
```

```css
.prose {
  /* ADAPT: replace with the project's actual measure/line-length token. */
  max-width: 65ch;
  margin-inline: auto;
  padding-inline: 24px;
}

.long-section {
  content-visibility: auto;
  /* Reserves an estimated height so the scrollbar/layout doesn't jump once the
     section's real content is measured — replace with a realistic estimate for the
     section's actual content, not this placeholder. */
  contain-intrinsic-size: 0 800px;
}
```

## Adapt to this project

- [ ] `max-width: 65ch` on `.prose` — replace with the project's design-system measure
  token if one exists.
- [ ] `contain-intrinsic-size` — only worth adding on genuinely long, off-screen-heavy
  pages; skip it on short pages where there's nothing expensive to defer.
- [ ] Confirm heading levels (`h1`/`h2`/…) are sequential and don't skip a level —
  screen-reader users navigate by heading level, and a skipped level reads as a
  structural gap.
