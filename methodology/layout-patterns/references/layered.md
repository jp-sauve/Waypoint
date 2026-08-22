# Reference: Layered

Content composed on the z-axis — elements deliberately overlapping within a single
region, such as a text card overlapping the corner of an image, or a badge pinned
over a thumbnail. This is a *static* composition choice, unrelated to scroll: don't
confuse it with `viewport-sections-overlapping.md`, which is a page-flow pattern
where full-height sections overlap each other *as the user scrolls*. This reference
is for layering elements within one region that doesn't itself scroll-drive the
overlap.

Use for hero sections with a background image and a foreground text card, image
badges/labels, or any composition where one element intentionally sits on top of
another rather than beside it.

## What this implementation covers

- The CSS Grid stacking technique: every layered child is placed in the *same* named
  grid area (`grid-template-areas: "stack"`), which makes them occupy the same box
  and stack in DOM order — simpler and more robust than `position: absolute`, since
  the stacked children still participate in normal grid sizing (the container's
  height is determined by its content, not fixed/guessed), and don't need a
  `position: relative` wrapper with manually matched dimensions.
- `z-index` assigned in ascending DOM order by default (later child paints on top),
  overridable per child when the desired stacking order doesn't match DOM/source
  order (e.g. a badge that should visually sit above an image even though accessible
  reading order puts the image's caption first).
- `place-self`/`justify-self`/`align-self` per child to position each layer within
  the shared stack area (e.g. a badge pinned to the top-right corner rather than
  filling the whole area).

## What it does *not* cover

- Ensuring sufficient contrast between a text layer and whatever's beneath it — text
  over an image needs its own scrim/gradient or shadow to stay legible and meet
  contrast requirements; that's project-specific to the actual image content, not
  something this structural reference can pre-decide.

## Code

```html
<div class="layered">
  <img class="layered__image" src="…" alt="…" />
  <div class="layered__badge">New</div>
  <div class="layered__card">
    <h3>Title</h3>
    <p>…</p>
  </div>
</div>
```

```css
.layered {
  display: grid;
  grid-template-areas: "stack";
}

.layered > * {
  grid-area: stack;
}

.layered__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.layered__badge {
  place-self: start end;
  margin: 12px;
  z-index: 2;
}

.layered__card {
  place-self: end stretch;
  /* ADAPT: replace with the project's actual scrim/gradient so text stays legible
     over the image beneath it. */
  background: linear-gradient(to top, rgb(0 0 0 / 0.7), transparent);
  color: #fff;
  padding: 24px;
  z-index: 1;
}
```

## Adapt to this project

- [ ] The scrim/gradient behind `.layered__card` — tune to the actual image content;
  a single fixed gradient won't guarantee contrast against every possible image, so
  verify against the real assets, not just this placeholder.
- [ ] `z-index` per layer — only needed when the desired visual stacking order
  doesn't already match DOM order; if it does, the default ascending order needs no
  explicit values at all.
- [ ] `place-self` per layer — replace with the actual desired position for each
  overlapping element.
