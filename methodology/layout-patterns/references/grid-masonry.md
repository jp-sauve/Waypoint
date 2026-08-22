# Reference: Grid — masonry

Items of varying height packed tightly with minimal gaps, like a Pinterest board —
each column's next item starts right where the shortest column currently ends,
rather than every row being pinned to the height of its tallest item (which is what
a plain CSS grid does). Native CSS support for this (`grid-template-rows: masonry`)
is real but not yet broadly available across browsers, so this reference uses a
JS-computed layout as the reliable default, with the native property layered on top
via `@supports` as a progressive enhancement.

Use only when items genuinely have varying, content-driven heights (photos of
different aspect ratios, cards with different amounts of text) and packing them
tightly is the actual goal — for a staggered-but-uniform look, prefer
`grid-offset.md`, which is simpler and needs no JS.

## What this implementation covers

- A JS layout pass that measures each item's rendered height, tracks a running
  height per column, and places each item into the currently-shortest column via
  absolute positioning — the standard masonry-packing algorithm.
- `@supports (grid-template-rows: masonry)` guards a CSS-only path for browsers that
  support the native property, skipping the JS measurement entirely there — check for
  support rather than assuming; this property's availability varies by browser.
- A `ResizeObserver` on the container re-runs the layout pass when the container's
  width changes (a responsive column-count change, a sidebar toggling), since column
  count and item placement both depend on available width.

## What it does *not* cover

- **Reading order for assistive tech.** Because masonry packs items into whichever
  column has room, the *visual* order (top-to-bottom, left-to-right in whichever
  column) can diverge from DOM order once items have different heights — a screen
  reader still reads DOM order, which may not match what's visually adjacent. This is
  fine when items are genuinely order-independent (a photo gallery, unordered
  cards) — it's the wrong pattern if the collection has a meaningful sequence,
  where `grid-normal.md` or `grid-offset.md` (both of which preserve row-major visual
  order) should be used instead.
- Infinite/lazy-loaded masonry content — combine with `feed.md`'s load-more pattern
  if the item collection grows over time; re-run the layout pass after each batch of
  new items is measured, not on every individual image load.

## Code

```html
<div class="masonry">
  <div class="masonry__item">…</div>
  <div class="masonry__item">…</div>
  <div class="masonry__item">…</div>
</div>
```

```css
.masonry {
  position: relative;
}

.masonry__item {
  position: absolute;
  width: var(--masonry-col-width);
  /* top/left set by JS per item */
}

/* Progressive enhancement: browsers with native masonry support skip the JS
   entirely and use plain grid flow instead. */
@supports (grid-template-rows: masonry) {
  .masonry {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    grid-template-rows: masonry;
    gap: 24px;
  }
  .masonry__item {
    position: static;
    width: auto;
  }
}
```

```js
// masonry.js — skipped entirely if the browser supports native CSS masonry.
function layoutMasonry(container, { columnWidth = 240, gap = 24 } = {}) {
  if (CSS.supports("grid-template-rows: masonry")) return;

  const items = [...container.querySelectorAll(".masonry__item")];
  const containerWidth = container.clientWidth;
  const columnCount = Math.max(1, Math.floor((containerWidth + gap) / (columnWidth + gap)));
  const colHeights = new Array(columnCount).fill(0);

  container.style.setProperty("--masonry-col-width", `${columnWidth}px`);

  for (const item of items) {
    const col = colHeights.indexOf(Math.min(...colHeights));
    item.style.left = `${col * (columnWidth + gap)}px`;
    item.style.top = `${colHeights[col]}px`;
    colHeights[col] += item.offsetHeight + gap;
  }

  container.style.height = `${Math.max(...colHeights)}px`;
}

const container = document.querySelector(".masonry");
layoutMasonry(container);
new ResizeObserver(() => layoutMasonry(container)).observe(container);
```

## Adapt to this project

- [ ] `columnWidth`/`gap` in the JS call — keep in sync with the CSS `@supports`
  block's `minmax`/`gap` values so both code paths produce the same visual result.
- [ ] Confirm the content is genuinely order-independent before choosing this over
  `grid-offset.md` — masonry's visual/DOM order mismatch is a real accessibility
  tradeoff, not a cosmetic detail.
- [ ] If items load images asynchronously, re-run `layoutMasonry` after each image's
  `load` event (its height isn't known until then) — the reference above assumes
  item heights are already stable at layout time (e.g. text cards, or images with a
  reserved aspect-ratio box).
