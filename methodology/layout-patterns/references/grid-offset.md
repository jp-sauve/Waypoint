# Reference: Grid — offset

A grid of equal-sized cells, like `grid-normal.md`, but with alternating columns
(or rows) shifted vertically by a fixed amount — a staggered, brick-like rhythm.
Unlike `grid-masonry.md`, cell heights stay uniform and predictable; only the
*position* is offset, by a fixed value rather than by each item's actual content
height. This keeps the layout's DOM order, row structure, and per-item height all
simple and predictable while still reading as more dynamic than a plain grid.

Use for portfolio/gallery-style sections that want visual rhythm without masonry's
unpredictable per-item heights — reach for `grid-masonry.md` instead only if items
genuinely have varying content length and packing them tightly (not just staggering
them) is the actual goal.

## What this implementation covers

- A plain `auto-fill`/`minmax` grid, same track sizing as `grid-normal.md`, with a
  `translateY` offset applied to alternating columns via `nth-child` — the offset is
  purely visual (a transform), so it doesn't affect the grid's own row-tracking or
  cause items to overlap in the layout algorithm's eyes.
- The offset is applied per-*column position* (`nth-child(4n+2)`,
  `nth-child(4n+3)`, assuming a 4-column layout) rather than simple odd/even, since
  odd/even only staggers correctly for a fixed 2-column grid — at any other column
  count it produces an inconsistent zigzag. See the "Adapt" note below: this value
  must be kept in sync with the grid's actual responsive column count.
- Extra bottom padding on the grid container equal to the offset amount, so the
  shifted-down items don't get visually clipped at the container's bottom edge.

## What it does *not* cover

- A column count that changes responsively while keeping the offset pattern
  correct — the `nth-child` selectors here assume a fixed column count; see "Adapt"
  for how to handle a grid whose column count actually changes at breakpoints.

## Code

```html
<ul class="grid grid--offset">
  <li class="grid__item">…</li>
  <li class="grid__item">…</li>
  <li class="grid__item">…</li>
  <li class="grid__item">…</li>
</ul>
```

```css
.grid--offset {
  list-style: none;
  margin: 0;
  padding: 0 0 40px; /* bottom padding equal to the offset, so shifted items aren't clipped */
  display: grid;
  /* ADAPT: a fixed column count (not auto-fill) makes the nth-child offset math
     predictable — see "Adapt to this project" for the responsive tradeoff. */
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

/* Offsets every other column in a 3-column grid: items 2, 5, 8… */
.grid--offset .grid__item:nth-child(3n+2) {
  transform: translateY(40px);
}
```

## Adapt to this project

- [ ] This reference uses a **fixed column count** (`repeat(3, 1fr)`) rather than
  `auto-fill`, specifically because the `nth-child` offset selector needs to know the
  column count to target the right items. If the grid must reflow to a different
  column count at breakpoints, add a matching `nth-child` rule per breakpoint (e.g.
  `nth-child(2n+2)` for a 2-column breakpoint) rather than trying to make one
  selector work for every column count.
- [ ] `translateY(40px)` — tune the offset amount, and keep the container's bottom
  padding equal to it.
- [ ] `grid-template-columns: repeat(3, 1fr)` and `gap` — replace with the project's
  actual column count and spacing token.
