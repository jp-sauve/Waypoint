# Reference: Multi-column

Continuous text flowing across multiple newspaper-style columns via CSS multi-column
layout (`column-count`/`column-width`), not a grid of independent boxes — content
reads top-to-bottom within a column, then continues at the top of the next column,
same as a printed newspaper or magazine. The browser handles the column-breaking
itself; there's no manual per-item placement the way a grid needs.

Use for long-form text content specifically (a long article, a glossary, a list of
short terms) where multiple columns keep line length readable on wide viewports
without the vertical scroll of a single column growing excessively long. Not a
substitute for `grid-normal.md` — a grid is for a collection of independent boxes
(cards, images); multi-column is for one continuous flow of text that happens to
wrap across columns.

## What this implementation covers

- `column-width` (not `column-count`) as the primary control — this lets the browser
  choose how many columns fit responsively, down to a minimum readable width, rather
  than a fixed column count that gets cramped on medium viewports. It behaves like
  `grid-template-columns: repeat(auto-fit, minmax(...))` but for flowing text.
- `column-fill: balance`, so the browser distributes content evenly across columns
  rather than filling the first column completely before starting the next — the
  standard expectation for this pattern.
- `break-inside: avoid` on atomic child elements (a blockquote, a figure, a heading
  plus its immediately following paragraph) so the column break doesn't split a
  single visual unit across two columns.
- No fixed height on the container — content grows downward and columns balance to
  roughly equal height, then the page continues below. A *height-constrained*
  multi-column region (each column scrolls independently, or new columns appear
  horizontally once the height fills) is a substantially different, more complex
  pattern and isn't what this reference covers.

## What it does *not* cover

- Reading order for assistive tech: DOM order stays the actual reading order
  regardless of visual column — a screen reader reads straight through the content
  as written, not column-by-column, so no special handling is needed there. But a
  *sighted* reader visually scans column-by-column, so make sure the DOM order and
  the intended visual reading order actually agree (they do automatically for plain
  flowing text; they can silently disagree if the content contains interactive
  elements laid out in a grid-like way inside the columns — don't mix the two
  patterns in one container).

## Code

```html
<div class="multi-col">
  <h2>Glossary</h2>
  <p>…</p>
  <blockquote>…</blockquote>
  <p>…</p>
</div>
```

```css
.multi-col {
  column-width: 320px;
  column-gap: 32px;
  column-fill: balance;
  /* ADAPT: replace with the project's actual divider token, or remove entirely. */
  column-rule: 1px solid rgb(0 0 0 / 0.1);
}

.multi-col blockquote,
.multi-col figure {
  break-inside: avoid;
}
```

## Adapt to this project

- [ ] `column-width: 320px` — tune to the project's actual readable-line-length
  target; this is the value that determines how many columns appear at a given
  viewport width.
- [ ] `column-gap` / `column-rule` — replace with the project's spacing and divider
  tokens, or drop the rule entirely for a plainer look.
- [ ] Confirm the content is genuinely one continuous flow (not a set of
  independently-orderable items) before choosing this over `grid-normal.md` — forcing
  card-like content into multi-column layout produces an unpredictable reading order.
