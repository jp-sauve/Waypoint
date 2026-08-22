# Reference: Sticky panel + scrolling narrative (split screen)

A two-column layout where one column (typically visual: an image, chart, or diagram)
stays pinned in the viewport via `position: sticky` while the other column scrolls
past it with narrative text broken into discrete "steps." As each step scrolls
through a trigger zone, the pinned panel updates to match — a chart highlights a
different series, an image changes, a diagram animates a stage. Commonly called
"scrollytelling." The scroll itself is entirely native (no scroll-hijacking); only
the *pinned panel's content* reacts to scroll position, via IntersectionObserver on
each step.

Use for explanatory long-form content where a visual needs to stay in view while the
prose that explains it advances — data journalism pieces, product feature deep-dives,
step-by-step explainers. Needs real screen width for two columns side by side; see
the mobile fallback below for narrow viewports.

## What this implementation covers

- CSS Grid two-column layout; the pinned column uses `position: sticky; top: 0;
  height: 100svh` (the same sticky mechanism as `viewport-sections-overlapping.md`,
  but here only one column is sticky — the narrative column scrolls normally beside
  it rather than being another sticky/stacking section).
- Each narrative "step" is observed via IntersectionObserver with a trigger zone
  centered in the viewport (`rootMargin: "-45% 0px -45% 0px"`), so a step is
  considered "active" only once it crosses the vertical middle of the screen — this
  avoids the jumpy, easy-to-get-wrong math of computing trigger points from raw
  `scroll` event positions.
- The pinned panel's content swap is driven by a `data-active-step` attribute set
  from JS, with the actual visual change (which image shows, which chart series
  highlights) left as CSS (`[data-active-step="2"] .panel__slide-2 { opacity: 1; }`)
  rather than JS toggling inline styles, so the transition can be styled/animated in
  one place.
- `prefers-reduced-motion` disables the panel's content-swap transition (the swap
  still happens, just as a hard cut rather than a cross-fade).

## What it does *not* cover

- **Narrow viewports.** This pattern fundamentally needs a real side-by-side split;
  below the project's chosen breakpoint, stack the panel above the narrative and drop
  `position: sticky` (revert to normal flow) rather than trying to force two columns
  into a phone-width screen — a squeezed sticky panel on mobile usually eats most of
  the visible screen and makes the narrative text hard to read.
- The specific visual content of the pinned panel (chart library, image set, canvas
  drawing) — this reference only wires up *which* step is active; rendering the
  panel's actual content per step is the project's own concern.

## Code

```html
<div class="split-scroll">
  <div class="split-scroll__panel" data-active-step="0">
    <div class="panel__slide panel__slide--0">Visual for step 0</div>
    <div class="panel__slide panel__slide--1">Visual for step 1</div>
    <div class="panel__slide panel__slide--2">Visual for step 2</div>
  </div>
  <div class="split-scroll__narrative">
    <section class="split-scroll__step" data-step="0">
      <p>First narrative beat…</p>
    </section>
    <section class="split-scroll__step" data-step="1">
      <p>Second narrative beat…</p>
    </section>
    <section class="split-scroll__step" data-step="2">
      <p>Third narrative beat…</p>
    </section>
  </div>
</div>
```

```css
.split-scroll {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
}

.split-scroll__panel {
  position: sticky;
  top: 0;
  height: 100svh;
  display: grid;
}

.panel__slide {
  grid-area: 1 / 1;
  opacity: 0;
  transition: opacity 300ms ease-out;
}

.split-scroll__panel[data-active-step="0"] .panel__slide--0,
.split-scroll__panel[data-active-step="1"] .panel__slide--1,
.split-scroll__panel[data-active-step="2"] .panel__slide--2 {
  opacity: 1;
}

.split-scroll__step {
  min-height: 80svh;
  display: flex;
  align-items: center;
}

@media (prefers-reduced-motion: reduce) {
  .panel__slide {
    transition: none;
  }
}

/* ADAPT: pick this project's actual narrow-viewport breakpoint. */
@media (max-width: 768px) {
  .split-scroll {
    grid-template-columns: 1fr;
  }
  .split-scroll__panel {
    position: static;
    height: auto;
  }
  .panel__slide {
    display: none;
  }
  .panel__slide[data-mobile-visible] {
    display: block;
  }
}
```

```js
// split-scroll.js
const panel = document.querySelector(".split-scroll__panel");
const steps = [...document.querySelectorAll(".split-scroll__step")];

const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        panel.dataset.activeStep = entry.target.dataset.step;
      }
    }
  },
  { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
);
steps.forEach((step) => observer.observe(step));
```

## Adapt to this project

- [ ] The `768px` breakpoint and its mobile fallback — replace with the project's
  actual breakpoint, and decide how the panel's slides render on mobile (the CSS
  above only hides all but a marked slide; wire that marking to the same
  IntersectionObserver logic, or render a simpler static image stack instead).
- [ ] `rootMargin: "-45% 0px -45% 0px"` — tune the trigger zone if steps feel like
  they activate too early/late; centering it (`-45%`/`-45%`) is a reasonable default,
  not a fixed requirement.
- [ ] The panel's actual visual content per step (chart, image, canvas) — build per
  the project's needs; this reference only wires up the active-step state.
- [ ] Colors, spacing, gap — replace with the project's tokens.
