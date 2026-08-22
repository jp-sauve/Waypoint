# Reference: Modal / Dialog

Blocking overlay that traps focus until the user responds or dismisses it. Use for
confirmations, forms that must be completed or explicitly cancelled, and content that
genuinely needs the rest of the page to be inert while it's open.

Don't use this for non-blocking messages (see `toast.md` instead) or for content the
user might want to reference alongside the rest of the page — a blocking modal for
something dismissible is a common overuse of this pattern.

## What this implementation covers

- Renders via `createPortal` so it isn't clipped by an ancestor's `overflow: hidden`
  or trapped inside a `transform`ed stacking context.
- Traps focus inside the dialog while open; Tab/Shift+Tab cycle only through its
  focusable elements.
- Restores focus to the element that opened the modal when it closes.
- Closes on `Escape` and on backdrop click; both call the same `onClose`.
- Locks background scroll while open.
- `role="dialog"` + `aria-modal="true"` + `aria-labelledby` pointing at the title.
- Respects `prefers-reduced-motion` (fades instead of scaling/sliding).

## What it does *not* cover

- Nested modals (a modal opening another modal) — the focus trap and scroll lock here
  are both singletons; two at once will fight over both. If the user needs a modal to
  open another modal, treat that as a from-scratch case per `ui-components.md` §1.
- Form validation/submission — the example's body is a placeholder; wire in whatever
  the project already uses for forms.

## Code

```tsx
// Modal.tsx
import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Restore focus to the trigger element on close.
  useEffect(() => {
    if (!isOpen) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    return () => previouslyFocused.current?.focus();
  }, [isOpen]);

  // Move focus into the dialog when it opens.
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;
    const first = dialogRef.current.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    (first ?? dialogRef.current).focus();
  }, [isOpen]);

  // Lock background scroll while open.
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  // Escape to close, and a focus trap that cycles Tab within the dialog.
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className="modal-header">
          <h2 id={titleId} className="modal-title">
            {title}
          </h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close dialog">
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
```

```css
/* Modal.css */
.modal-backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 0.5);
  /* ADAPT: pick a value above every other overlay/sticky element in this project;
     see ui-components.md "Why values are left generic". */
  z-index: 1000;
  animation: modal-fade-in 150ms ease-out;
}

.modal-dialog {
  /* ADAPT: replace with the project's surface/background token. */
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  max-width: 480px;
  width: calc(100% - 32px);
  max-height: calc(100vh - 64px);
  overflow-y: auto;
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.2);
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
  /* Focus outline intentionally left at browser default — do not remove without a
     replacement that meets the contrast requirement in the engineering checklist. */
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
  .modal-backdrop {
    animation: none;
  }
}
```

## Adapt to this project

- [ ] `z-index: 1000` — replace with a value from the project's actual stacking scale.
- [ ] Background/surface colors, radius, shadow — replace with the project's design
  tokens.
- [ ] If the project already has a global scroll-lock utility, use it instead of the
  local `useEffect` here — don't stack two.
- [ ] If the project has a shared portal root element, target that instead of
  `document.body`.
