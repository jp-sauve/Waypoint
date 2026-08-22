# Reference: Header — scrolls with the page

The default: the header sits in normal document flow and scrolls away with the rest
of the page like any other element. No positioning trick, no JS, no z-index to
resolve — this is the simplest of the three header references and the one to reach
for unless the user specifically wants the header to stay visible while scrolling.

Use when the header itself isn't something the user needs constant access to while
reading — marketing pages, articles, documentation — and reclaiming that vertical
space while scrolling matters more than a persistent nav.

## Code

```html
<header class="site-header">
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
.site-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 24px;
  /* ADAPT: replace with the project's surface/background token. */
  background: #fff;
  border-bottom: 1px solid rgb(0 0 0 / 0.08);
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

.site-header__nav a:hover,
.site-header__nav a:focus-visible {
  text-decoration: underline;
}
```

## Adapt to this project

- [ ] Colors, spacing, font — replace with the project's design tokens.
- [ ] If the nav list needs to collapse on narrow viewports, add that independently —
  this reference intentionally covers scroll behavior only, not responsive nav
  patterns.
