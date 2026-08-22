# Reference: Asymmetric

A deliberately unbalanced composition of a small number of regions — an uneven split
(e.g. 60/40, a large hero item beside a stack of small ones) rather than the equal
weighting of `grid-normal.md` or the centered symmetry of `single-column.md`. The
imbalance itself is the point: it creates a visual focal point and a sense of
hierarchy that a uniform grid intentionally avoids.

Use for editorial and marketing sections that want visual tension — a hero next to
supporting content, a featured item beside a list of minor ones. Distinct from
`bento.md`, which is a *grid of several cells* with varied spans; this pattern is
usually just two or three major regions with deliberately unequal weight, not a
larger collage. Distinct from `sidebar-content.md`, which is also a two-region split
but where the split exists for a functional reason (persistent nav) rather than a
compositional/visual one — an asymmetric split's ratio is a design choice with no
functional minimum width the way a sidebar has.

## What this implementation covers

- An uneven `grid-template-columns` ratio (`2fr 1fr` as the default, adjustable) for
  the primary two-region case, with the larger region allowed to hold its own
  internal composition (e.g. a large image) independent of the smaller region's.
- A responsive collapse to a stacked single column below a breakpoint, with the
  larger/featured region ordered first — asymmetric splits generally don't survive
  a large width reduction any better than `bento.md`'s spans do.
- A three-region variant (`1fr 1fr 2fr` template areas naming a featured region
  explicitly) for the "one large item beside several small ones" case, using named
  `grid-template-areas` rather than raw column/row spans so the actual visual intent
  (which region is "featured") stays legible in the CSS itself.

## What it does *not* cover

- A general-purpose N-region asymmetric system — this reference covers the common
  2- and 3-region cases; a genuinely bespoke asymmetric composition (5+ irregular
  regions) is closer to `bento.md`'s explicit per-item span authoring than a fixed
  ratio template.

## Code

```html
<div class="asymmetric">
  <div class="asymmetric__primary">Featured content</div>
  <div class="asymmetric__secondary">Supporting content</div>
</div>
```

```css
.asymmetric {
  display: grid;
  /* ADAPT: the actual ratio is the design decision here — 2fr 1fr is a starting
     point, not a fixed rule. */
  grid-template-columns: 2fr 1fr;
  gap: 32px;
}

/* ADAPT: pick this project's actual narrow-viewport breakpoint. */
@media (max-width: 768px) {
  .asymmetric {
    grid-template-columns: 1fr;
  }
  .asymmetric__primary {
    order: -1;
  }
}
```

```html
<!-- Three-region variant: one featured item beside two smaller ones. -->
<div class="asymmetric-3">
  <div class="asymmetric-3__featured">Featured</div>
  <div class="asymmetric-3__minor-a">Minor A</div>
  <div class="asymmetric-3__minor-b">Minor B</div>
</div>
```

```css
.asymmetric-3 {
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: repeat(2, 1fr);
  grid-template-areas:
    "featured minor-a"
    "featured minor-b";
  gap: 24px;
}

.asymmetric-3__featured {
  grid-area: featured;
}
.asymmetric-3__minor-a {
  grid-area: minor-a;
}
.asymmetric-3__minor-b {
  grid-area: minor-b;
}
```

## Adapt to this project

- [ ] The column/area ratio (`2fr 1fr`, or the three-region template) — this is the
  actual design decision; tune it to what the content and hierarchy call for rather
  than keeping the placeholder ratio.
- [ ] `768px` breakpoint and the stacking order on collapse — replace with the
  project's responsive scale, and confirm which region should appear first once
  stacked (usually, but not always, the featured one).
- [ ] Gap and any per-region internal styling — replace with the project's tokens.
