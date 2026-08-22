# Reference: Grid — normal

A uniform CSS Grid of equal-sized cells that reflows its column count responsively —
the standard card/product/image grid. Each item occupies one cell of the same size;
the grid decides how many fit per row based on available width, with no manual
per-item sizing and no media-query breakpoints needed to change the column count.

Use for any collection of same-importance, same-shape items (product cards, article
previews, image thumbnails) where visual weight should be equal across items. For a
grid where cells are deliberately different sizes, see `bento.md`; for one where
row heights vary by content rather than being fixed, see `grid-masonry.md`.

## What this implementation covers

- `repeat(auto-fill, minmax(...))` for the column track, which is what produces the
  "reflow without breakpoints" behavior — the browser fits as many `minmax`-sized
  columns as the container width allows, wrapping to a new row once it can't fit
  another. `auto-fill` (not `auto-fit`) is the deliberate choice when the grid is
  meant to keep a stable cell size and simply show fewer/more cells per row, rather
  than stretching existing cells to fill leftover space — see the "Adapt" note below
  for when to switch to `auto-fit` instead.
- A single `gap` value for both row and column spacing, rather than separate margins
  per item — keeps spacing consistent without every item needing its own margin
  logic, and without the doubled-gap issue that per-item margins produce at the
  grid's outer edge.

## What it does *not* cover

- Items of intentionally different sizes — that's `bento.md`. Mixing explicit
  `grid-column: span 2` overrides into an otherwise uniform `auto-fill` grid usually
  produces layout gaps, since the auto-placement algorithm doesn't backfill around
  irregular spans the way masonry does.

## Code

```html
<ul class="grid">
  <li class="grid__item">…</li>
  <li class="grid__item">…</li>
  <li class="grid__item">…</li>
</ul>
```

```css
.grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
}
```

## Adapt to this project

- [ ] `minmax(240px, 1fr)` — the `240px` minimum is the value that determines column
  count at any given width; tune it to the actual card content's minimum comfortable
  width.
- [ ] Switch `auto-fill` to `auto-fit` if the grid should stretch its existing items
  to fill the row when there are fewer items than would fill a full row (e.g. a grid
  of exactly 2 cards on a row that could fit 4) — `auto-fill` instead leaves the
  extra track space empty, which is usually preferable once real content wraps to
  multiple rows but can look like a bug with very few items.
- [ ] `gap: 24px` — replace with the project's spacing token.
