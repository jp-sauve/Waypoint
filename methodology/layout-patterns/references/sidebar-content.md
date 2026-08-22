# Reference: Sidebar + content

A two-region composition: a fixed-or-bounded-width sidebar alongside a fluid content
area that takes up the remaining space. This is a composition pattern, not a
page-flow one — it describes how the sidebar and content are sized relative to each
other within whatever region contains them, and composes with either
`document-flow.md` (sidebar and content scroll together as one page) or
`spa-shell.md` (the sidebar is the shell's persistent nav and only the content region
scrolls) depending on which page-flow pattern the project is using.

Use for docs sites, settings pages, and app layouts with persistent secondary
navigation or filters alongside primary content — not to be confused with
`spa-shell.md`, which this pattern is commonly nested inside but which is itself
about the *scroll/viewport* mechanics, not the column sizing.

## What this implementation covers

- `grid-template-columns: minmax(200px, 240px) 1fr` — the sidebar gets a flexible-
  but-bounded width (won't shrink below 200px or grow past 240px), the content area
  takes the rest via `1fr`. This is more robust than a fixed-width sidebar plus
  `flex: 1` content, since `minmax` keeps the sidebar usable at its own natural
  content width without needing a separate `min-width` rule on the content side.
- A responsive collapse to a stacked, single-column layout below a breakpoint, with
  the sidebar becoming a toggleable off-canvas drawer — the standard mobile
  adaptation for this pattern, since a fixed side-by-side split doesn't fit a phone
  width.
- The drawer toggle traps focus while open and returns focus to the toggle button on
  close, and closes on `Escape` — same focus-management discipline as
  `ui-components/references/modal.md`, since an off-canvas drawer is functionally a
  modal on narrow viewports.

## What it does *not* cover

- Whether the sidebar itself scrolls independently of the content (that's
  `spa-shell.md`'s concern, if this composition is nested inside an app shell) or
  scrolls along with the page (the default here, appropriate inside
  `document-flow.md`).

## Code

```html
<div class="sidebar-layout">
  <button type="button" class="sidebar-layout__toggle" aria-expanded="false" aria-controls="sidebar">Menu</button>
  <nav id="sidebar" class="sidebar-layout__sidebar" aria-label="Secondary">
    <!-- nav / filters -->
  </nav>
  <main class="sidebar-layout__content">
    <!-- primary content -->
  </main>
</div>
```

```css
.sidebar-layout {
  display: grid;
  grid-template-columns: minmax(200px, 240px) 1fr;
  gap: 32px;
}

.sidebar-layout__toggle {
  display: none;
}

/* ADAPT: pick this project's actual narrow-viewport breakpoint. */
@media (max-width: 768px) {
  .sidebar-layout {
    grid-template-columns: 1fr;
  }

  .sidebar-layout__toggle {
    display: block;
  }

  .sidebar-layout__sidebar {
    position: fixed;
    inset: 0 25% 0 0;
    transform: translateX(-100%);
    transition: transform 200ms ease-out;
    /* ADAPT: pick a value above page content — see ui-components.md "Why values
       are left generic". */
    z-index: 100;
    overflow-y: auto;
    background: #fff;
  }

  .sidebar-layout__sidebar.is-open {
    transform: translateX(0);
  }

  @media (prefers-reduced-motion: reduce) {
    .sidebar-layout__sidebar {
      transition: none;
    }
  }
}
```

```js
// sidebar-drawer.js — only needed once the responsive breakpoint turns the sidebar
// into an off-canvas drawer; on wide viewports the toggle stays hidden and unused.
const toggle = document.querySelector(".sidebar-layout__toggle");
const sidebar = document.querySelector(".sidebar-layout__sidebar");

function openDrawer() {
  sidebar.classList.add("is-open");
  toggle.setAttribute("aria-expanded", "true");
  sidebar.querySelector("a, button")?.focus();
}

function closeDrawer() {
  sidebar.classList.remove("is-open");
  toggle.setAttribute("aria-expanded", "false");
  toggle.focus();
}

toggle.addEventListener("click", () => {
  sidebar.classList.contains("is-open") ? closeDrawer() : openDrawer();
});

sidebar.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeDrawer();
});
```

## Adapt to this project

- [ ] `minmax(200px, 240px)` — replace with the project's actual sidebar width
  range.
- [ ] `768px` breakpoint and the drawer's `inset`/width — replace with the project's
  responsive scale and desired drawer width.
- [ ] `z-index: 100` — replace with a value from the project's stacking scale,
  consistent with any modal/dropdown from `ui-components.md` that might also be open.
- [ ] If the project already has a scroll-lock or focus-trap utility (from
  `ui-components/references/modal.md`), reuse it for the drawer instead of the
  minimal open/close logic above — the JS here covers only `Escape` and initial
  focus, not a full focus trap.
