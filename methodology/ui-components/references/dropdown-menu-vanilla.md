# Reference: Dropdown / Menu (vanilla HTML/CSS/JS)

The framework-free counterpart to `dropdown-menu.md`. Same use case — a button that
reveals a list of one-shot actions — and the same keyboard contract (arrow keys
between items, `Home`/`End` to jump, `Escape` and outside-click to close and return
focus to the trigger).

This version uses the `popover` attribute (with `popovertarget` on the trigger)
instead of manually tracking open/closed state:

- **No z-index at all.** Like `<dialog>`, a popover renders into the top layer —
  above everything else regardless of stacking context.
- **Outside-click and `Escape` close it automatically** (the browser's built-in
  "light dismiss" behavior for the default `popover="auto"` mode) — no manual
  document-click listener or keydown handler needed for those two cases.
- **Still manual:** arrow-key/Home/End navigation between menu items (the popover API
  has no opinion on menu semantics) and closing the popover after an item is selected.

Baseline support for `popover` is recent enough that it's worth checking against the
current project's actual browser support requirements before defaulting to it — if
the project needs to support browsers old enough to lack it, use `position: absolute`
plus a manual outside-click/`Escape` listener instead (the same technique the React
reference uses, ported to vanilla JS), and resolve `z-index` per `ui-components.md`
the way the React reference does.

## Code

```html
<div class="dropdown">
  <button type="button" popovertarget="example-menu" aria-haspopup="menu">
    Actions
  </button>
  <div id="example-menu" popover role="menu" class="dropdown-menu">
    <button type="button" role="menuitem" class="dropdown-item" data-action="rename">Rename</button>
    <button type="button" role="menuitem" class="dropdown-item" data-action="duplicate">Duplicate</button>
    <button type="button" role="menuitem" class="dropdown-item" data-action="delete">Delete</button>
  </div>
</div>
```

```css
/* dropdown-menu.css */
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-menu {
  /* Popovers are display:none until shown; position-anchor to the trigger via
     normal document flow since this markup keeps the menu right after the button. */
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  margin: 0;
  border: 1px solid rgb(0 0 0 / 0.1);
  border-radius: 6px;
  /* ADAPT: replace with the project's surface/background token. */
  background: #fff;
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.15);
  padding: 4px;
  min-width: 180px;
}

.dropdown-item {
  display: block;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font: inherit;
}

.dropdown-item:hover,
.dropdown-item:focus-visible {
  background: rgb(0 0 0 / 0.06);
}
```

```js
// dropdown-menu.js
const menu = document.getElementById("example-menu");
const trigger = document.querySelector('[popovertarget="example-menu"]');
const items = () => Array.from(menu.querySelectorAll('[role="menuitem"]'));

// Keep aria-expanded in sync with the popover's actual open state.
menu.addEventListener("toggle", (event) => {
  trigger.setAttribute("aria-expanded", String(event.newState === "open"));
  if (event.newState === "open") items()[0]?.focus();
});

menu.addEventListener("keydown", (event) => {
  const list = items();
  const currentIndex = list.indexOf(document.activeElement);

  const focusAt = (index) => list[(index + list.length) % list.length].focus();

  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      focusAt(currentIndex + 1);
      break;
    case "ArrowUp":
      event.preventDefault();
      focusAt(currentIndex - 1);
      break;
    case "Home":
      event.preventDefault();
      focusAt(0);
      break;
    case "End":
      event.preventDefault();
      focusAt(list.length - 1);
      break;
    // Escape and outside-click are handled by the popover's own light-dismiss
    // behavior — nothing to do here.
  }
});

menu.querySelectorAll('[role="menuitem"]').forEach((item) => {
  item.addEventListener("click", () => {
    // Wire item.dataset.action into the project's actual command dispatch here.
    menu.hidePopover();
  });
});
```

## Adapt to this project

- [ ] Confirm the project's target browsers actually support `popover` — if not, fall
  back to the manual `position: absolute` + outside-click/`Escape` approach from
  `dropdown-menu.md`, including its `z-index` placeholder.
- [ ] The menu is positioned via normal document flow directly under the trigger; if
  it needs to avoid overflowing the viewport near a screen edge, add collision
  handling or the project's existing positioning library — same caveat as the React
  reference.
- [ ] Colors, radius, shadow — replace with the project's design tokens.
