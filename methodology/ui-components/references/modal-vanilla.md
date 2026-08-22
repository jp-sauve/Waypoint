# Reference: Modal / Dialog (vanilla HTML/CSS/JS)

The framework-free counterpart to `modal.md`, for a plain HTML/CSS/JS project with no
build step. Same use case: a blocking overlay that demands a response before the rest
of the page is interactive again.

This version is built on the native `<dialog>` element rather than hand-rolled `div`s,
which changes what needs implementing:

- **No z-index at all.** `showModal()` renders the dialog into the browser's top
  layer — a stacking context above *everything* else on the page, regardless of any
  element's `z-index` or stacking context. This sidesteps the whole "what value is
  safe" problem described in `ui-components.md` entirely; there's no placeholder to
  resolve here because there's nothing to resolve it against.
- **No manual focus trap.** While a dialog is open via `showModal()`, the rest of the
  document becomes inert (unfocusable, unclickable) per the HTML spec — the browser
  enforces the trap, not this code.
- **Escape-to-close is automatic.** `showModal()` wires `Escape` to fire a `cancel`
  event and close the dialog without any keydown listener.
- **Focus restoration is automatic** in current browsers (focus returns to whatever
  triggered the dialog once it closes), but the code below still tracks and restores
  it manually as a defensive fallback — cheap to keep, and it means the component
  degrades gracefully if that ever isn't true in some environment.

What's still manual: backdrop-click-to-close (there's no built-in event for it) and
background scroll lock (`showModal()` doesn't prevent the page behind it from
scrolling on its own).

Baseline browser support for `<dialog>` and `showModal()` is broad enough to default
to for a new project; confirm against the current project's actual support
requirements if it targets unusually old browsers.

## Code

```html
<button id="open-modal-btn" type="button">Open dialog</button>

<dialog id="example-dialog" aria-labelledby="example-dialog-title">
  <div class="modal-header">
    <h2 id="example-dialog-title" class="modal-title">Dialog title</h2>
    <button type="button" class="modal-close" data-close-dialog aria-label="Close dialog">×</button>
  </div>
  <div class="modal-body">
    <p>Dialog content goes here.</p>
  </div>
</dialog>
```

```css
/* modal.css */
#example-dialog {
  /* ADAPT: replace with the project's surface/background token. */
  background: #fff;
  border: none;
  border-radius: 8px;
  padding: 24px;
  max-width: 480px;
  width: calc(100% - 32px);
  max-height: calc(100vh - 64px);
  animation: modal-fade-in 150ms ease-out;
}

#example-dialog::backdrop {
  background: rgb(0 0 0 / 0.5);
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  padding: 4px;
}

@keyframes modal-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  #example-dialog {
    animation: none;
  }
}
```

```js
// modal.js
const dialog = document.getElementById("example-dialog");
const openButton = document.getElementById("open-modal-btn");
let previouslyFocused = null;

openButton.addEventListener("click", () => {
  previouslyFocused = document.activeElement;
  dialog.showModal();
  document.body.style.overflow = "hidden";
});

dialog.addEventListener("close", () => {
  document.body.style.overflow = "";
  // Defensive fallback — most current browsers already do this automatically.
  previouslyFocused?.focus();
});

dialog.querySelectorAll("[data-close-dialog]").forEach((el) => {
  el.addEventListener("click", () => dialog.close());
});

// Backdrop click: a click lands on the <dialog> element itself only when it's
// outside the dialog's own rendered box (the box's padding still "belongs" to the
// dialog, so checking event.target === dialog is not enough on its own).
dialog.addEventListener("click", (event) => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  const clickedInsideBox =
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom;
  if (!clickedInsideBox) dialog.close();
});
```

## Adapt to this project

- [ ] Background/surface colors, radius, shadow — replace with the project's design
  tokens.
- [ ] If the project already has a global scroll-lock utility, use it in place of the
  `document.body.style.overflow` toggle here.
- [ ] If the project needs to support a browser old enough to lack `<dialog>` /
  `showModal()`, either add the well-known polyfill or fall back to the manual
  `div`-based approach in `modal.md`, ported to vanilla JS — don't ship both.
