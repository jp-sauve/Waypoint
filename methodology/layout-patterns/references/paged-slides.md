# Reference: Paged / slides

A sequence of discrete, full-screen "pages" or "slides" shown one at a time, advanced
explicitly by the user (a Next/Previous control, arrow keys, or swipe) — not by
scrolling at all. Unlike the viewport-section snap patterns, there is no continuous
scroll gesture involved; the container's scroll position doesn't move, and slides are
positioned with a `transform: translateX()` that snaps directly to the active slide's
final position (or transitions between them) rather than tracking a scrollbar.

Use for onboarding flows, image/testimonial carousels, and presentation-style content
where "one thing visible at a time, advanced on request" is the actual content model
— not for content that's meant to be skimmed by scrolling, which is what the viewport-
section references are for.

## What this implementation covers

- A `role="group"` + `aria-roledescription="slide"` per slide and a live region
  announcing "Slide X of N" on change — the ARIA Authoring Practices pattern for
  carousels, since a purely visual slide transition tells a screen-reader user
  nothing about what just happened or how many slides exist.
- Keyboard support (`ArrowLeft`/`ArrowRight`) on the slide container, and visible
  Previous/Next buttons — this pattern must not be pointer/swipe-only.
- `prefers-reduced-motion` disables the slide transition (the active slide still
  changes instantly; only the animated slide-over motion is suppressed).
- No autoplay by default — an auto-advancing carousel is a common WCAG failure
  (2.2.2, Pause/Stop/Hide) unless it ships with an accessible pause control and never
  auto-advances faster than 5 seconds; if the project needs autoplay, add an explicit
  pause button before treating it as done, not as an afterthought.

## What it does *not* cover

- Infinite looping (wrapping from the last slide back to the first) — straightforward
  to add (`(index + 1) % slideCount`) but omitted here since not every use of this
  pattern wants it, and it changes what "Slide X of N" should announce.
- Touch/swipe gesture handling — commonly desired for this pattern on mobile, but
  is a separate, nontrivial pointer-event concern; add it as a progressive
  enhancement on top of the button/keyboard controls here, never as a replacement for
  them.

## Code

```html
<div class="slides" aria-roledescription="carousel" aria-label="Onboarding">
  <div class="slides__viewport">
    <div class="slides__track" style="transform: translateX(0%);">
      <section class="slides__slide" role="group" aria-roledescription="slide" aria-label="1 of 3">
        <h2>Welcome</h2>
        <p>…</p>
      </section>
      <section class="slides__slide" role="group" aria-roledescription="slide" aria-label="2 of 3">
        <h2>Step two</h2>
        <p>…</p>
      </section>
      <section class="slides__slide" role="group" aria-roledescription="slide" aria-label="3 of 3">
        <h2>Step three</h2>
        <p>…</p>
      </section>
    </div>
  </div>
  <div class="slides__controls">
    <button type="button" class="slides__prev" aria-label="Previous slide">‹</button>
    <button type="button" class="slides__next" aria-label="Next slide">›</button>
  </div>
  <p class="sr-only" aria-live="polite" data-slides-status></p>
</div>
```

```css
.slides__viewport {
  overflow: hidden;
}

.slides__track {
  display: flex;
  transition: transform 300ms ease-out;
}

.slides__slide {
  flex: 0 0 100%;
  min-height: 100svh;
  padding: 48px 24px;
}

.slides__controls {
  display: flex;
  justify-content: space-between;
}

@media (prefers-reduced-motion: reduce) {
  .slides__track {
    transition: none;
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
```

```js
// slides.js
const root = document.querySelector(".slides");
const track = root.querySelector(".slides__track");
const slides = [...root.querySelectorAll(".slides__slide")];
const status = root.querySelector("[data-slides-status]");
let index = 0;

function render() {
  track.style.transform = `translateX(-${index * 100}%)`;
  status.textContent = `Slide ${index + 1} of ${slides.length}`;
}

root.querySelector(".slides__next").addEventListener("click", () => {
  index = Math.min(index + 1, slides.length - 1);
  render();
});
root.querySelector(".slides__prev").addEventListener("click", () => {
  index = Math.max(index - 1, 0);
  render();
});
root.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") root.querySelector(".slides__next").click();
  if (event.key === "ArrowLeft") root.querySelector(".slides__prev").click();
});

render();
```

## Adapt to this project

- [ ] If autoplay is required, add a visible pause/play toggle before shipping it —
  don't ship an auto-advancing carousel with no way to stop it.
- [ ] Disable/hide the Previous button on the first slide and Next on the last (or
  wire up looping) — the code above lets `index` clamp but doesn't yet disable the
  now-inert button, which leaves a focusable control that does nothing.
- [ ] Colors, spacing, and control styling — replace with the project's tokens.
- [ ] If slides need to be reachable by direct link (e.g. `#slide-2`), add
  URL-hash syncing — omitted here since not every use case wants deep-linkable
  slides.
