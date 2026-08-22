# Reference: Viewport sections — overlapping

A sequence of full-height (`100svh`) sections where each new section slides up and
visually covers the previous one instead of pushing it off screen — the "stacking
cards" effect: as the user scrolls, the current section stays pinned in place while
the next one rises over it, so for a moment both are visible with the incoming
section layered on top. Built on `position: sticky` plus increasing `z-index` per
section, not JS-driven scroll transforms, so it's cheap to render and still scrolls
at native speed.

Use for a sequence that's meant to feel like layered reveals building on each other
(a story with a visual "stack" of ideas, a portfolio of stacked case studies) —
distinct from the two snap references, which keep sections visually separate and
just control *where scrolling stops*; this pattern controls how sections *visually
relate to each other* while scrolling.

## What this implementation covers

- Each `.stack-section` is `position: sticky; top: 0` with `height: 100svh`, so once
  it reaches the top of the viewport it stays pinned there while the container
  continues to scroll underneath it — the mechanism that produces the "next section
  covers the previous one" effect, since a later section in DOM order paints on top.
- `z-index` assigned in ascending DOM order (later section = higher stacking), which
  is what makes the incoming section actually cover the outgoing one instead of
  appearing beneath it — this is easy to get backwards.
- A subtle `box-shadow` on each section's top edge so the overlap reads as one
  section physically sliding over another, rather than an abrupt hard cut.

## What it does *not* cover

- **Reduced motion.** This pattern's overlap effect is purely a byproduct of native
  sticky positioning and scroll — there's no JS-driven animation to gate behind
  `prefers-reduced-motion`. If a project layers in additional transform/opacity
  effects tied to scroll position (parallax) on top of this base, that additional
  motion does need a reduced-motion fallback; the base overlap mechanism here does
  not.
- An exit point: the *last* section in the stack has nothing to scroll under it and
  needs either a trailing spacer/footer after the stack, or to be the intentional
  final visual state of the page — without one, the last section's sticky positioning
  can leave it pinned oddly against a hard page end.

## Code

```html
<div class="stack-container">
  <section class="stack-section" style="--stack-index: 0;">
    <h2>First</h2>
    <p>…</p>
  </section>
  <section class="stack-section" style="--stack-index: 1;">
    <h2>Second</h2>
    <p>…</p>
  </section>
  <section class="stack-section" style="--stack-index: 2;">
    <h2>Third</h2>
    <p>…</p>
  </section>
</div>
<footer><!-- trailing content so the last stacked section has somewhere to scroll under --></footer>
```

```css
.stack-container {
  position: relative;
}

.stack-section {
  position: sticky;
  top: 0;
  height: 100svh;
  /* ADAPT: replace with the project's actual per-section background tokens —
     distinct backgrounds are what makes the overlap visually legible. */
  background: #fff;
  box-shadow: 0 -12px 24px rgb(0 0 0 / 0.08);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 48px 24px;
  /* Later sections stack above earlier ones — do not reverse this order. */
  z-index: calc(var(--stack-index) + 1);
}
```

## Adapt to this project

- [ ] Distinct backgrounds per section are load-bearing here, not decorative — with
  matching backgrounds the overlap is invisible and the pattern just looks like a
  layout bug. Replace the placeholder background with the project's real per-section
  tokens before treating this as done.
- [ ] Add a trailing element (footer, spacer, or a genuinely final section without
  `position: sticky`) after the stack so the last section can scroll away normally.
- [ ] If a fixed/sticky header from `ui-components/references/header-*` is present,
  it and this pattern are both using `position: sticky`/`fixed` with `top: 0` —
  verify the header's `z-index` stays above every `.stack-section` (whose z-index
  here only goes up to the section count) so it isn't itself covered by a stacked
  section scrolling past.
- [ ] `box-shadow` value — cosmetic, tune or remove per the project's actual visual
  language.
