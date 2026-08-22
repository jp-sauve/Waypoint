# Reference: Uniform flex row

A single row of equally-sized items, distributed across the available width — unlike
`grid-normal.md`, this pattern is explicitly one row, not a wrapping multi-row grid.
On narrow viewports where all items genuinely can't fit, the row either scrolls
horizontally (with scroll-snap for a controlled feel) or the items shrink together,
rather than wrapping to a second row — wrapping would defeat the point of a
fixed-count row of equal-weight items (a stat bar, a segmented control, a fixed set
of category tabs).

Use for a known, fixed-count set of same-importance items that should read as one
row (KPI/stat tiles, a button group, a small fixed set of category filters) — for a
collection whose count varies or that should wrap across multiple rows, use
`grid-normal.md` instead.

## What this implementation covers

- `display: flex` with `flex: 1 1 0` on each item, which divides the row's width
  evenly regardless of each item's own content width — this is what makes the items
  genuinely *uniform*, as opposed to `justify-content: space-between`, which spaces
  items apart but leaves their individual widths content-dependent and uneven.
- A horizontal-scroll fallback (`overflow-x: auto` + `scroll-snap-type: x proximity`)
  for viewports too narrow to fit every item at a reasonable minimum width, so items
  shrink only down to a floor (`min-width`) and then the row scrolls instead of
  cramming them further or wrapping.
- `scrollbar-gutter: stable` on the scroll container so the row doesn't shift when
  a scrollbar appears/disappears as content changes.

## What it does *not* cover

- An unbounded or user-editable item count — past roughly 5-7 items this pattern
  starts to feel cramped even with the scroll fallback; a genuinely variable-length
  collection is a better fit for `grid-normal.md`.

## Code

```html
<ul class="flex-row">
  <li class="flex-row__item">Stat one</li>
  <li class="flex-row__item">Stat two</li>
  <li class="flex-row__item">Stat three</li>
</ul>
```

```css
.flex-row {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-snap-type: x proximity;
  scrollbar-gutter: stable;
}

.flex-row__item {
  flex: 1 1 0;
  min-width: 160px;
  scroll-snap-align: start;
}
```

## Adapt to this project

- [ ] `min-width: 160px` — the floor below which items stop shrinking and the row
  starts scrolling instead; tune to the actual item content's minimum comfortable
  width.
- [ ] If the project never expects this row to overflow on any supported viewport
  (a fixed 3-item stat bar on a desktop-only dashboard), the scroll fallback can be
  dropped in favor of `flex-wrap: wrap` — but confirm that assumption against the
  project's actual minimum supported viewport width first.
- [ ] `gap` — replace with the project's spacing token.
