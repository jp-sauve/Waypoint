# Reference: Viewport sections — soft snap

The same full-height (`100svh`) sequence of sections as `viewport-sections-hard-snap.md`,
but built on `scroll-snap-type: y proximity` instead of `mandatory`: the browser only
snaps a section into alignment if the scroll *already came to rest* near a snap
point — it never pulls a scroll back to force alignment, and never blocks the user
from stopping partway through a section. The result reads as a normal scrollable page
that happens to settle nicely on section boundaries, rather than a page that
controls where the user is allowed to stop.

Use when sections are full-height compositionally (each one *should* usually occupy
a viewport) but the content within a section is long-form or unpredictable in length
— proximity snap doesn't fight a user who needs to scroll within a section to read
it or who has zoomed in, which is exactly the case where `hard-snap`'s mandatory
behavior becomes a genuine accessibility problem (see that reference's note). This is
the safer default of the two snap variants; reach for `hard-snap` specifically only
when the content is short, self-contained "slides" where partial scroll genuinely
looks broken.

## What this implementation covers

- `scroll-snap-type: y proximity` on the container, `scroll-snap-align: start` on
  each section, and deliberately **no** `scroll-snap-stop` — proximity snap doesn't
  need the stop-skipping guard that mandatory snap does, since it never forces a
  landing the user didn't scroll to on their own.
- `min-height: 100svh` rather than a hard `height`, same rationale as the hard-snap
  reference: sections whose content overflows one viewport grow and stay internally
  scrollable instead of clipping.
- The same optional IntersectionObserver-driven active-section indicator as
  hard-snap, since it's a purely visual aid independent of which snap mode is used.

## What it does *not* cover

- Any guarantee that a section will actually end up full-bleed on screen — with
  proximity snap a user can legitimately stop mid-section, which is the point, not a
  bug to work around.

## Code

```html
<div class="snap-container" tabindex="0" aria-label="Article sections">
  <section class="snap-section" id="section-1">
    <h2>Section one</h2>
    <p>… potentially long-form content …</p>
  </section>
  <section class="snap-section" id="section-2">
    <h2>Section two</h2>
    <p>…</p>
  </section>
</div>
```

```css
.snap-container {
  height: 100svh;
  overflow-y: scroll;
  scroll-snap-type: y proximity;
}

.snap-section {
  min-height: 100svh;
  scroll-snap-align: start;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 48px 24px;
  overflow-y: auto;
}
```

## Adapt to this project

- [ ] If sections turn out to consistently need mandatory alignment after all (e.g.
  design review wants it to feel more "slide"-like), switch to
  `viewport-sections-hard-snap.md` rather than adding `scroll-snap-stop` here — a
  `proximity` type with `stop: always` is a confusing hybrid that behaves
  inconsistently across browsers.
- [ ] Same header-height interaction as the hard-snap reference: if a fixed/sticky
  header is present, subtract its height from `min-height` on the first section.
- [ ] Colors, spacing, and the optional section-indicator UI — same generic
  placeholders as `viewport-sections-hard-snap.md`; resolve against the project's
  actual tokens.
