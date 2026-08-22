# Reference: Single column

The simplest spatial composition: one content column, centered in the available
width with a capped measure, no side-by-side regions. This is the composition-axis
counterpart to `document-flow.md`'s page-flow default — the two commonly pair
together, but they're independent choices (a single column can also sit inside an
`spa-shell.md` content region, and document flow can just as easily use
`sidebar-content.md` instead).

Use for reading-focused content (articles, docs), forms, and any flow where a single
linear sequence is the actual content model — the default composition; reach for a
multi-region pattern only when the content genuinely has parallel/side-by-side
regions worth showing at once.

## What this implementation covers

- A capped `max-width` (measured in `ch`, which scales with the font rather than a
  fixed pixel value) with horizontal auto-margins to center it, plus responsive
  inline padding so the column doesn't touch the viewport edge on narrow screens.
- `clamp()` on the outer padding so the gutter scales smoothly between mobile and
  desktop instead of jumping at a breakpoint.

## What it does *not* cover

- Anything about how the page scrolls (that's `document-flow.md` / the page-flow
  references) — this is purely the horizontal composition of the content region
  itself.

## Code

```html
<div class="col">
  <h1>Title</h1>
  <p>…</p>
</div>
```

```css
.col {
  /* ADAPT: replace with the project's actual measure/line-length token. */
  max-width: 65ch;
  margin-inline: auto;
  padding-inline: clamp(16px, 4vw, 48px);
}
```

## Adapt to this project

- [ ] `max-width: 65ch` — replace with the project's design-system measure token if
  one exists; a wider measure suits UI-dense content (forms, tables), a narrower one
  suits long-form prose.
- [ ] The `clamp()` padding range — tune the min/max to the project's actual spacing
  scale rather than the placeholder values.
