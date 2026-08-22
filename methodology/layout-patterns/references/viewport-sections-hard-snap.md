# Reference: Viewport sections — hard snap

Full-height (`100svh`) sections that the page scrolls through one at a time — once a
scroll gesture crosses a threshold, the browser finishes the scroll and lands exactly
on the next (or previous) section; the user can't stop halfway between two. Built on
native CSS scroll-snap (`scroll-snap-type: y mandatory`), not JS-driven scroll
hijacking, so it stays smooth, interruptible, and doesn't fight the browser's own
scroll physics or fling a fast swipe past a section.

Use for content that's genuinely a sequence of discrete, self-contained "slides" —
a product feature walkthrough, a single-story case study — where landing on a partial
view of a section would look broken rather than merely mid-scroll.

## What this implementation covers

- `scroll-snap-type: y mandatory` on the scroll container with `scroll-snap-align:
  start` + `scroll-snap-stop: always` on each section — `scroll-snap-stop: always` is
  the part that's easy to miss and is what actually prevents a fast scroll/swipe from
  skipping a section entirely; without it, mandatory snap still lets a strong fling
  fly past intermediate sections to the next snap point it can reach.
- `100svh` rather than `100vh` for each section's height — `svh` (small viewport
  height) accounts for mobile browser chrome (address bar) showing/hiding, so a
  section doesn't get taller than the actually-visible viewport and clip its own
  bottom edge when the chrome is visible.
- A `min-height: 100svh` instead of a hard `height: 100svh`, so a section whose
  content genuinely doesn't fit in one viewport (a long paragraph, a zoomed-in user)
  can still grow and scroll internally rather than clipping content with no way to
  reach it — see the accessibility note below for why this matters more than it looks.
- Optional keyboard support (`Page Down`/`Page Up`/arrow keys call `scrollIntoView`
  on the next/previous section) for users who scroll by keyboard rather than
  wheel/touch, since native snap only engages on an actual scroll gesture.
- A small IntersectionObserver-driven "which section is active" indicator (dots),
  common in this pattern, purely as a visual aid — it's not required for the snap
  behavior itself.

## What it does *not* cover

- **Accessibility escape hatch.** Mandatory scroll-snap combined with a fixed-height
  section is a known low-vision issue: a user who zooms the page (200%+) can end up
  with content taller than the viewport, and mandatory snap can make it hard or
  impossible to scroll to see the clipped part, since every scroll attempt gets
  pulled back to the section's snap point. This reference mitigates it with
  `min-height` instead of `height` (so the section itself grows and internal content
  stays reachable), but if the project's content is long-form or zoom is expected to
  be heavily used, prefer `viewport-sections-soft-snap.md` instead — proximity snap
  doesn't fight the user's scroll the same way.
- Section transition animations/parallax — this reference is the snap mechanism only;
  layer in motion separately, gated by `prefers-reduced-motion`.

## Code

```html
<div class="snap-container" tabindex="0" aria-label="Feature walkthrough">
  <section class="snap-section" id="section-1">
    <h2>Feature one</h2>
    <p>…</p>
  </section>
  <section class="snap-section" id="section-2">
    <h2>Feature two</h2>
    <p>…</p>
  </section>
  <section class="snap-section" id="section-3">
    <h2>Feature three</h2>
    <p>…</p>
  </section>
</div>
<nav class="snap-dots" aria-label="Section navigation">
  <a href="#section-1" class="snap-dot" aria-current="true"></a>
  <a href="#section-2" class="snap-dot"></a>
  <a href="#section-3" class="snap-dot"></a>
</nav>
```

```css
.snap-container {
  height: 100svh;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  overscroll-behavior-y: contain;
}

.snap-section {
  min-height: 100svh;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 48px 24px;
  /* ADAPT: replace with the project's actual background/token per section if they
     differ visually. */
}

.snap-dots {
  position: fixed;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 12px;
  /* ADAPT: pick a value above section content — see ui-components.md "Why values
     are left generic". */
  z-index: 10;
}

.snap-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgb(0 0 0 / 0.2);
}

.snap-dot[aria-current="true"] {
  background: rgb(0 0 0 / 0.8);
}
```

```js
// snap-sections.js
const container = document.querySelector(".snap-container");
const sections = [...container.querySelectorAll(".snap-section")];
const dots = [...document.querySelectorAll(".snap-dot")];

const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const index = sections.indexOf(entry.target);
        dots.forEach((dot, i) => dot.toggleAttribute("aria-current", i === index));
      }
    }
  },
  { root: container, threshold: 0.6 },
);
sections.forEach((section) => observer.observe(section));

container.addEventListener("keydown", (event) => {
  const currentIndex = sections.findIndex((s) => dots[sections.indexOf(s)]?.getAttribute("aria-current") === "true");
  if (event.key === "PageDown" || event.key === "ArrowDown") {
    sections[Math.min(currentIndex + 1, sections.length - 1)].scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  } else if (event.key === "PageUp" || event.key === "ArrowUp") {
    sections[Math.max(currentIndex - 1, 0)].scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }
});
```

## Adapt to this project

- [ ] Confirm the content in every section actually fits (or is fine growing past)
  one viewport at the project's realistic zoom/font-size settings — this pattern
  degrades badly for sections with unpredictable-length content.
- [ ] `z-index: 10` on `.snap-dots` — replace with a value from the project's actual
  stacking scale.
- [ ] The dot-navigation UI is optional scaffolding, not part of the snap mechanism —
  drop it if the project doesn't want a visible section indicator.
- [ ] If the page has a fixed/sticky header from `ui-components/references/header-*`,
  account for its height in each section's effective visible area (e.g. `min-height:
  calc(100svh - var(--header-height))`), or the header will cover part of the first
  section on load.
