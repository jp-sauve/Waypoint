# Reference: Bento

A grid of *deliberately* different-sized cells — some spanning two columns, some two
rows, some a single cell — arranged to create visual hierarchy, named for its
resemblance to the compartments of a bento box. Unlike `grid-masonry.md`, cell sizes
here are explicitly authored per item (a design decision about which items deserve
more visual weight), not derived from each item's content height; unlike
`grid-normal.md`, cells are intentionally non-uniform rather than equal.

Use for a curated, fixed-count collection where some items genuinely matter more
than others (a features showcase, a small dashboard summary, a portfolio highlight
reel) — the size variation should track actual content importance, not be applied
for visual interest alone. Not a fit for an open-ended or user-generated collection,
where there's no principled way to decide which items get the larger cells.

## What this implementation covers

- An explicit `grid-template-columns`/`grid-template-rows` track grid with
  `grid-column: span N` / `grid-row: span N` set per item via a modifier class — the
  span values are the actual design decision here, authored per item rather than
  computed.
- A responsive fallback that collapses every item to a single uniform column on
  narrow viewports (spans reset to `span 1`) — a bento grid's irregular spans
  generally don't survive a large viewport-width reduction; collapsing to a plain
  single-column stack is simpler and more reliable than trying to maintain the
  irregular arrangement at every width.
- `grid-auto-flow: dense` so the auto-placement algorithm backfills gaps left by
  spanning items where possible, rather than leaving visible holes — this only
  minimizes gaps, it doesn't guarantee a gap-free layout with arbitrary spans, so the
  explicit span choices still need to be checked visually (see "Adapt" below).

## What it does *not* cover

- A layout that's automatically gap-free for any arbitrary set of span values — with
  irregular spans, some track/span combinations produce holes no matter what
  `grid-auto-flow` is used; the explicit spans need to be chosen (and checked at the
  actual breakpoint) with the grid's total column count in mind, not assigned
  independently per item.

## Code

```html
<div class="bento">
  <div class="bento__item bento__item--large">Featured</div>
  <div class="bento__item">…</div>
  <div class="bento__item">…</div>
  <div class="bento__item bento__item--tall">…</div>
  <div class="bento__item">…</div>
</div>
```

```css
.bento {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 160px;
  grid-auto-flow: dense;
  gap: 16px;
}

.bento__item {
  grid-column: span 1;
  grid-row: span 1;
}

.bento__item--large {
  grid-column: span 2;
  grid-row: span 2;
}

.bento__item--tall {
  grid-row: span 2;
}

/* ADAPT: pick this project's actual narrow-viewport breakpoint. */
@media (max-width: 640px) {
  .bento {
    grid-template-columns: 1fr;
  }
  .bento__item,
  .bento__item--large,
  .bento__item--tall {
    grid-column: span 1;
    grid-row: span 1;
  }
}
```

## Adapt to this project

- [ ] `grid-template-columns: repeat(4, 1fr)` and `grid-auto-rows: 160px` — replace
  with the project's actual column count and row height; the row height in
  particular needs to suit the shortest cell's real content.
- [ ] Which items get `--large`/`--tall` (or other span modifiers) — this is a
  content decision, not a styling default; assign spans based on which items the
  project actually wants to emphasize.
- [ ] Check the layout visually at the chosen breakpoint(s) for gaps `dense`
  auto-flow couldn't fill — adjust span values rather than relying on
  `grid-auto-flow` alone to guarantee a clean result.
- [ ] `640px` breakpoint — replace with the project's actual responsive scale.
