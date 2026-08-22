# Reference: Toast / Notification (vanilla HTML/CSS/JS)

The framework-free counterpart to `toast.md`. A static page still runs JavaScript —
a `fetch()`-backed form submission, a "copy link" button, a client-validated sign-up
form — and any of those need a way to report success or failure without a full page
reload. That's exactly what a toast is for; "static page" doesn't mean "no client-side
interaction," just no framework.

## What this implementation covers

- A single global `Toast.show(message, options)` function and one shared viewport
  element, created once and reused — the vanilla equivalent of the React version's
  provider/hook pair, without needing a component tree to provide it through.
- `aria-live="polite"` + `role="status"` by default; `{ urgent: true }` switches to
  `aria-live="assertive"` for errors that need immediate attention (reserve it for
  those — overusing `assertive` makes screen-reader output noisy).
- Auto-dismiss after a duration, paused on hover or keyboard focus.
- Manual dismiss button, always present, for the same reason as the React version: a
  user who tabs away and back, or whose screen reader takes longer to reach the
  message, needs to close it on their own schedule rather than relying on the timer.
- Multiple toasts stack; each is independently dismissible and pauses its own timer.
- Respects `prefers-reduced-motion`.

## What it does *not* cover

- Persistence across a full page navigation/reload — same caveat as the React
  version. If a toast needs to survive a redirect (e.g. "saved" after a
  POST-redirect-GET on a form with no JS fallback), pass it through the redirect
  target instead (query param, flash-session mechanism) and trigger it there.

## Code

```html
<!-- No markup needed up front — the viewport is created by toast.js on load. -->
```

```css
/* toast.css */
.toast-viewport {
  position: fixed;
  /* ADAPT: pick a corner that doesn't collide with existing page chrome (e.g. a
     bottom-right FAB, a cookie-consent banner). */
  bottom: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  /* ADAPT: pick a value above every other overlay on the page; see
     ui-components.md "Why values are left generic". */
  z-index: 1100;
  max-width: 360px;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  /* ADAPT: replace with the project's surface/background token. */
  background: #1f2937;
  color: #fff;
  border-radius: 6px;
  padding: 12px 16px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.2);
  animation: toast-slide-in 200ms ease-out;
}

.toast-urgent {
  /* ADAPT: replace with the project's error/danger token. */
  background: #7f1d1d;
}

.toast-message {
  margin: 0;
  flex: 1;
  font-size: 0.9rem;
}

.toast-dismiss {
  background: none;
  border: none;
  color: inherit;
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
  opacity: 0.8;
}

.toast-dismiss:hover {
  opacity: 1;
}

@keyframes toast-slide-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .toast {
    animation: none;
  }
}
```

```js
// toast.js
const DEFAULT_DURATION = 5000;

const viewport = document.createElement("div");
viewport.className = "toast-viewport";
viewport.setAttribute("aria-label", "Notifications");
document.body.appendChild(viewport);

function showToast(message, { urgent = false, duration = DEFAULT_DURATION } = {}) {
  const toast = document.createElement("div");
  toast.className = urgent ? "toast toast-urgent" : "toast";
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", urgent ? "assertive" : "polite");

  const messageEl = document.createElement("p");
  messageEl.className = "toast-message";
  messageEl.textContent = message;

  const dismissButton = document.createElement("button");
  dismissButton.type = "button";
  dismissButton.className = "toast-dismiss";
  dismissButton.setAttribute("aria-label", "Dismiss notification");
  dismissButton.textContent = "×";
  dismissButton.addEventListener("click", () => dismiss());

  toast.append(messageEl, dismissButton);
  viewport.appendChild(toast);

  let remaining = duration;
  let startedAt = Date.now();
  let timer = null;

  function start() {
    startedAt = Date.now();
    timer = setTimeout(dismiss, remaining);
  }

  function pause() {
    clearTimeout(timer);
    remaining -= Date.now() - startedAt;
  }

  function dismiss() {
    clearTimeout(timer);
    toast.remove();
  }

  toast.addEventListener("mouseenter", pause);
  toast.addEventListener("mouseleave", start);
  toast.addEventListener("focusin", pause);
  toast.addEventListener("focusout", start);

  start();
}

window.Toast = { show: showToast };
```

## Usage

```js
// Example: a form submitted via fetch() instead of a full-page POST, common on an
// otherwise static page (a newsletter sign-up, a contact form).
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const response = await fetch(form.action, { method: "POST", body: new FormData(form) });
    if (!response.ok) throw new Error("Request failed");
    Toast.show("You're subscribed.");
  } catch {
    Toast.show("Something went wrong — try again.", { urgent: true });
  }
});
```

## Adapt to this project

- [ ] `z-index: 1100` — replace with a value above the modal reference's z-index (a
  toast should be able to surface above an open modal, e.g. "changes saved" after a
  modal's own save action) and above every other overlay on the page.
- [ ] Viewport corner (`bottom`/`right`) — check it doesn't overlap existing fixed
  chrome (chat widgets, cookie banners, mobile nav bars).
- [ ] Colors — replace with the project's actual surface/error tokens; the values
  here are arbitrary placeholders.
- [ ] `window.Toast` is a plain global for a no-build-step page with no module
  system — if the project does use ES modules, export `showToast` instead of
  attaching it to `window`.
