# Reference: Dropdown / Menu

A button that reveals a list of actions (not a navigation menu — use a `<nav>` with
plain links for that). Implements the WAI-ARIA menu button pattern: arrow-key
navigation between items, `Home`/`End` to jump, `Escape` and outside-click to close
and return focus to the trigger.

Don't use this for a set of options where only one can be *selected and persist as
the field's value* (that's a `<select>` or a listbox/combobox pattern, which has
different keyboard semantics) — this is for a list of one-shot actions.

## What this implementation covers

- `aria-haspopup="menu"` + `aria-expanded` on the trigger; `role="menu"` /
  `role="menuitem"` on the popup and its items.
- Opening the menu (via click or `ArrowDown`) moves focus to the first item;
  `ArrowUp` from a closed trigger opens it with focus on the last item.
- `ArrowUp`/`ArrowDown` move between items and wrap at the ends; `Home`/`End` jump to
  the first/last item.
- `Escape`, outside click, or selecting an item closes the menu and returns focus to
  the trigger.
- Positioned directly under the trigger via a simple offset — see the adaptation note
  below on viewport-edge collision.

## What it does *not* cover

- Automatic flip/shift when the menu would overflow the viewport (e.g. near the
  bottom or right edge of the screen). This example uses a fixed below-and-left-aligned
  position. If the project already depends on a positioning library (Floating UI,
  Popper), use its collision detection instead of hand-rolling it — don't add a new
  positioning dependency just for this component.
- Submenus (a menu item that opens another menu) — treat that as a from-scratch case.

## Code

```tsx
// DropdownMenu.tsx
import { useEffect, useRef, useState } from "react";

interface MenuItem {
  label: string;
  onSelect: () => void;
  disabled?: boolean;
}

interface DropdownMenuProps {
  label: string;
  items: MenuItem[];
}

export function DropdownMenu({ label, items }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const enabledIndexes = items
    .map((item, index) => (item.disabled ? -1 : index))
    .filter((index) => index !== -1);

  const openAt = (index: number) => {
    setIsOpen(true);
    setActiveIndex(index);
  };

  const close = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const select = (item: MenuItem) => {
    if (item.disabled) return;
    item.onSelect();
    close();
  };

  // Focus the active item whenever it changes while open.
  useEffect(() => {
    if (isOpen) itemRefs.current[activeIndex]?.focus();
  }, [isOpen, activeIndex]);

  // Close on outside click.
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) close();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  const moveTo = (direction: 1 | -1) => {
    const currentPosition = enabledIndexes.indexOf(activeIndex);
    const nextPosition =
      (currentPosition + direction + enabledIndexes.length) % enabledIndexes.length;
    setActiveIndex(enabledIndexes[nextPosition]);
  };

  const handleTriggerKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      openAt(enabledIndexes[0]);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      openAt(enabledIndexes[enabledIndexes.length - 1]);
    }
  };

  const handleMenuKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        moveTo(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveTo(-1);
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(enabledIndexes[0]);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(enabledIndexes[enabledIndexes.length - 1]);
        break;
      case "Escape":
        event.preventDefault();
        close();
        break;
      case "Tab":
        // Don't trap Tab — let it leave the menu and close naturally.
        setIsOpen(false);
        break;
    }
  };

  return (
    <div className="dropdown" ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        className="dropdown-trigger"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => (isOpen ? close() : openAt(enabledIndexes[0]))}
        onKeyDown={handleTriggerKeyDown}
      >
        {label}
      </button>
      {isOpen && (
        <div className="dropdown-menu" role="menu" onKeyDown={handleMenuKeyDown}>
          {items.map((item, index) => (
            <button
              key={item.label}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              role="menuitem"
              type="button"
              className="dropdown-item"
              disabled={item.disabled}
              tabIndex={index === activeIndex ? 0 : -1}
              onClick={() => select(item)}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

```css
/* DropdownMenu.css */
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 180px;
  /* ADAPT: replace with the project's surface/background token. */
  background: #fff;
  border: 1px solid rgb(0 0 0 / 0.1);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.15);
  padding: 4px;
  /* ADAPT: pick a value above whatever this trigger sits inside (a sticky header,
     a card with its own stacking context); see ui-components.md. */
  z-index: 100;
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

.dropdown-item:hover:not(:disabled),
.dropdown-item:focus-visible {
  background: rgb(0 0 0 / 0.06);
}

.dropdown-item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

## Adapt to this project

- [ ] `z-index: 100` — replace with a value from the project's actual stacking scale,
  checked against every ancestor (a card, a sticky nav) that establishes its own
  stacking context.
- [ ] The fixed below-and-left position doesn't flip when it would overflow the
  viewport — if this trigger can appear near a screen edge (e.g. in a data table's
  last column), either add collision handling or use the project's existing
  positioning library instead of this example's plain CSS offset.
- [ ] Colors, radius, shadow — replace with the project's design tokens.
