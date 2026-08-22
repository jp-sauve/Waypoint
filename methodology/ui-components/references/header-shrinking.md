# Reference: Header — shrinks on scroll

Starts "thick" (larger padding/logo) when the page is at the top, then transitions to
a more compact bar once the user scrolls past a threshold, and expands back on the
way up. Builds on `position: sticky` rather than `position: fixed` — sticky keeps the
header in normal document flow until it would scroll out of view, so unlike
`header-fixed.md`, **no height-compensating spacer/padding is needed**; the tradeoff
is that a sticky header can't be offset from the top of the viewport the way a fixed
one can.

Use for the common marketing-site pattern where a header should feel spacious on
first load but shouldn't keep eating vertical space once the user is scrolled into
the content.

## What this implementation covers

- Scroll-position detection via `IntersectionObserver` watching a 1px sentinel
  element near the top of the page, rather than a `scroll` event listener. A `scroll`
  listener fires continuously and needs manual throttling to avoid layout thrash;
  `IntersectionObserver` reports only the crossing itself, off the main thread's
  scroll handling, with no throttling code to write or get wrong.
- The compact/thick states are pure CSS (a class toggle + `transition`), so the
  visual states stay in one place instead of being computed and applied from JS on
  every scroll event.
- `prefers-reduced-motion` disables the size transition (the state still changes
  instantly, just without the animated shrink) — a size-morphing animation is exactly
  the kind of motion that preference exists to suppress.

## What it does *not* cover

- Because it's `position: sticky`, it still establishes a new stacking context once
  it starts sticking, and the same anchor-link-hidden-behind-the-header gotcha from
  `header-fixed.md` applies (`scroll-padding-top`) once the header is in its sticky
  state — include that if the page has in-page anchors.

## Code

```html
<div id="scroll-sentinel" aria-hidden="true"></div>
<header class="site-header site-header--shrink">
  <a href="/" class="site-header__logo">Brand</a>
  <nav class="site-header__nav" aria-label="Primary">
    <ul>
      <li><a href="/product">Product</a></li>
      <li><a href="/pricing">Pricing</a></li>
      <li><a href="/about">About</a></li>
    </ul>
  </nav>
</header>
```

```css
/* header.css */
#scroll-sentinel {
  position: absolute;
  top: 0;
  height: 1px;
  width: 1px;
}

.site-header--shrink {
  position: sticky;
  top: 0;
  /* ADAPT: pick a value above normal page content but below dropdown menus/modals
     opened from within the header — see ui-components.md "Why values are left
     generic". */
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  /* "Thick" state — the default. */
  padding: 32px 24px;
  /* ADAPT: replace with the project's surface/background token. */
  background: #fff;
  border-bottom: 1px solid rgb(0 0 0 / 0.08);
  transition: padding 200ms ease-out;
}

.site-header--shrink.is-compact {
  /* "Compact" state, applied once the sentinel scrolls out of view. */
  padding: 12px 24px;
}

.site-header__logo {
  font-weight: 700;
  font-size: 1.4rem;
  text-decoration: none;
  color: inherit;
  transition: font-size 200ms ease-out;
}

.site-header--shrink.is-compact .site-header__logo {
  font-size: 1.1rem;
}

.site-header__nav ul {
  display: flex;
  gap: 20px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.site-header__nav a {
  text-decoration: none;
  color: inherit;
}

@media (prefers-reduced-motion: reduce) {
  .site-header--shrink,
  .site-header__logo {
    transition: none;
  }
}
```

```js
// header.js
const header = document.querySelector(".site-header--shrink");
const sentinel = document.getElementById("scroll-sentinel");

new IntersectionObserver(
  ([entry]) => {
    header.classList.toggle("is-compact", !entry.isIntersecting);
  },
  { threshold: 0 },
).observe(sentinel);
```

## Adapt to this project

- [ ] `z-index: 10` — replace with a value from the project's actual stacking scale,
  keeping it below any dropdown/modal reference from this library that can open on
  top of the header.
- [ ] The sentinel's position controls the shrink threshold — move it down the page
  (e.g. `top: 200px`) if the header should stay "thick" for longer before compacting.
- [ ] The specific padding/font-size values for the thick vs. compact states are
  placeholders — replace with the project's actual design tokens.
- [ ] If the page has in-page anchor links, add `scroll-padding-top` as in
  `header-fixed.md` so jumping to a section doesn't land it underneath the sticky
  header.
