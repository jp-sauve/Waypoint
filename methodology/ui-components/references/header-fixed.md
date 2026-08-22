# Reference: Header — fixed to the top

The header is taken out of normal document flow (`position: fixed`) so it stays
visible at the top of the viewport while the rest of the page scrolls underneath it.
Because it's removed from flow, the content that used to start where the header was
now renders *underneath* it and gets visually covered — the page has to be pushed
down by the header's own height to compensate. That push is the part this reference
exists to get right, since it's easy to hardcode a pixel value that quietly drifts
out of sync with the header's actual rendered height.

Use when the user wants persistent access to navigation/search/actions while
scrolling, and is fine with the header never scrolling away.

## What this implementation covers

- The header's rendered height is measured with `ResizeObserver` and written to a
  `--header-height` custom property on the root element, rather than hardcoded — so
  it stays correct if the header's height changes at a breakpoint, with a different
  logo, or after a content change, without a second value to keep in sync by hand.
- `scroll-padding-top` is set to the same variable on `html`, so both mouse-driven
  anchor clicks (`<a href="#section">`) and keyboard/programmatic focus scrolling
  land the target *below* the fixed header instead of underneath it. This is a
  commonly-missed gotcha with any fixed/sticky header — without it, jumping to an
  in-page anchor scrolls the target flush to the top of the viewport, right behind
  the header.
- A CSS fallback value on `padding-top` covers the instant before JS runs on first
  paint, avoiding a flash of content sliding down once the real value is set.

## What it does *not* cover

- If the header's height is a genuinely fixed constant that will never change (one
  breakpoint, fixed font sizes, no dynamic content), the `ResizeObserver` can be
  skipped in favor of a single hardcoded `padding-top` — simpler, but it will
  silently drift if the header's height ever does change later.

## Code

```html
<header class="site-header site-header--fixed">
  <a href="/" class="site-header__logo">Brand</a>
  <nav class="site-header__nav" aria-label="Primary">
    <ul>
      <li><a href="/product">Product</a></li>
      <li><a href="/pricing">Pricing</a></li>
      <li><a href="/about">About</a></li>
    </ul>
  </nav>
</header>
<main>
  <!-- page content -->
</main>
```

```css
/* header.css */
:root {
  /* Fallback for the instant before JS measures the real height. */
  --header-height: 64px;
}

html {
  scroll-padding-top: var(--header-height);
}

.site-header--fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  /* ADAPT: pick a value above normal page content but below dropdown menus/modals
     opened from within the header — see ui-components.md "Why values are left
     generic". */
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 24px;
  /* ADAPT: replace with the project's surface/background token. */
  background: #fff;
  border-bottom: 1px solid rgb(0 0 0 / 0.08);
}

main {
  padding-top: var(--header-height);
}

.site-header__logo {
  font-weight: 700;
  font-size: 1.1rem;
  text-decoration: none;
  color: inherit;
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
```

```js
// header.js
const header = document.querySelector(".site-header--fixed");

const setHeaderHeightVar = () => {
  document.documentElement.style.setProperty("--header-height", `${header.offsetHeight}px`);
};

setHeaderHeightVar();
new ResizeObserver(setHeaderHeightVar).observe(header);
```

## Adapt to this project

- [ ] `z-index: 10` — replace with a value from the project's actual stacking scale,
  keeping it below any dropdown/modal reference from this library that can open on
  top of the header.
- [ ] If the project already sets `scroll-behavior: smooth` or has its own anchor-
  offset handling, don't add a second `scroll-padding-top` mechanism on top of it.
- [ ] Check for other fixed elements competing for the same viewport edge (cookie
  banners, chat widgets) before assuming the header can own `top: 0`.
- [ ] Colors, spacing, font — replace with the project's design tokens.
