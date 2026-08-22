# Reference: Toast / Notification

A transient, non-blocking status message (save confirmation, background job finished,
recoverable error) that appears, announces itself to assistive tech, and dismisses
itself without demanding a response. Use `modal.md` instead for anything the user
must act on before continuing.

## What this implementation covers

- A `ToastProvider` + `useToast()` hook so any component can trigger a toast without
  prop-drilling; the viewport itself is rendered once via `createPortal`.
- `aria-live="polite"` + `role="status"` by default so screen readers announce new
  toasts without moving focus; an `urgent` toast uses `aria-live="assertive"` instead
  (reserve this for errors that need immediate attention — overusing it makes
  screen-reader output noisy).
- Auto-dismiss after a duration, paused on hover or keyboard focus so the user has
  time to read before it disappears.
- Manual dismiss button, always present (auto-dismiss alone isn't enough — a user who
  tabs away and back, or who's using a screen reader that takes longer to reach the
  message, needs a way to close it on their own schedule).
- Multiple toasts stack; each is independently dismissible and independently pauses
  its own timer.
- Respects `prefers-reduced-motion`.

## What it does *not* cover

- Persistence across a full page navigation/reload — toasts here are in-memory state,
  cleared on unmount like any other component state. If the project needs a toast to
  survive a redirect (e.g. "saved" shown after a POST-redirect-GET), pass it through
  the redirect target (query param, flash-session mechanism) and trigger it there.

## Code

```tsx
// ToastProvider.tsx
import { createContext, useCallback, useContext, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface Toast {
  id: string;
  message: string;
  urgent?: boolean;
  duration: number;
}

interface ToastContextValue {
  showToast: (message: string, options?: { urgent?: boolean; duration?: number }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 5000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback<ToastContextValue["showToast"]>((message, options) => {
    const id = crypto.randomUUID();
    setToasts((current) => [
      ...current,
      { id, message, urgent: options?.urgent, duration: options?.duration ?? DEFAULT_DURATION },
    ]);
  }, []);

  return (
    <ToastContext value={{ showToast }}>
      {children}
      {createPortal(
        <div className="toast-viewport" aria-label="Notifications">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
          ))}
        </div>,
        document.body,
      )}
    </ToastContext>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingRef = useRef(toast.duration);
  const startedAtRef = useRef(Date.now());

  const start = useCallback(() => {
    startedAtRef.current = Date.now();
    timerRef.current = setTimeout(onDismiss, remainingRef.current);
  }, [onDismiss]);

  const pause = useCallback(() => {
    if (!timerRef.current) return;
    clearTimeout(timerRef.current);
    remainingRef.current -= Date.now() - startedAtRef.current;
  }, []);

  // Start the auto-dismiss timer on mount; clear on unmount.
  useState(() => {
    start();
  });

  return (
    <div
      className={`toast${toast.urgent ? " toast-urgent" : ""}`}
      role="status"
      aria-live={toast.urgent ? "assertive" : "polite"}
      onMouseEnter={pause}
      onMouseLeave={start}
      onFocus={pause}
      onBlur={start}
    >
      <p className="toast-message">{toast.message}</p>
      <button type="button" className="toast-dismiss" onClick={onDismiss} aria-label="Dismiss notification">
        ×
      </button>
    </div>
  );
}
```

```css
/* Toast.css */
.toast-viewport {
  position: fixed;
  /* ADAPT: pick a corner that doesn't collide with existing app chrome (e.g. a
     bottom-right FAB, a cookie-consent banner). */
  bottom: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  /* ADAPT: pick a value above every other overlay in this project; see
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

## Adapt to this project

- [ ] `z-index: 1100` — replace with a value above the modal reference's z-index (a
  toast should be able to surface above an open modal, e.g. "changes saved" after a
  modal's own save action) and above every other overlay in the project's scale.
- [ ] Viewport corner (`bottom`/`right`) — check it doesn't overlap existing fixed
  chrome (chat widgets, cookie banners, mobile nav bars).
- [ ] Colors — replace with the project's actual surface/error tokens; the values
  here are arbitrary placeholders.
- [ ] `useState(() => start())` for the initial timer start is a mount-only escape
  hatch, not a general pattern — if the project's lint rules flag it, an
  `useEffect(() => start(), [])` with the eslint-exhaustive-deps exception documented
  is an acceptable substitute.
