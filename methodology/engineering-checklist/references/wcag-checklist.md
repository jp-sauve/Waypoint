# WCAG 2.2 AA — Practical Checklist for React/Next.js UI

Reference this for a thorough accessibility pass (new component library, design
system, or pre-launch review). The main SKILL.md covers the everyday checks.

## Perceivable
- [ ] Text alternatives for all non-text content (`alt`, `aria-label`, captions for
  video/audio).
- [ ] Content isn't conveyed by color, shape, or position alone.
- [ ] Text contrast ≥ 4.5:1 (normal), ≥ 3:1 (large text ≥18pt or ≥14pt bold).
  Non-text UI elements (icon buttons, input borders) ≥ 3:1 against background.
- [ ] Text can be resized to 200% without loss of content or function (avoid fixed
  pixel heights that clip scaled text).
- [ ] Content reflows at 400% zoom / narrow viewport without horizontal scroll
  (responsive layout, not just "works on desktop").
- [ ] No content that flashes more than 3 times per second (seizure risk).

## Operable
- [ ] All functionality available via keyboard alone — no mouse-only interactions
  (drag-and-drop needs a keyboard-accessible alternative).
- [ ] No keyboard traps — user can Tab into and out of every widget, including
  custom modals/dropdowns.
- [ ] Visible focus indicator on every focusable element (don't remove `:focus`
  outline without a replacement that meets contrast requirements).
- [ ] Logical tab order that matches visual/reading order.
- [ ] Skip link to bypass repeated navigation on every page.
- [ ] Page titles are descriptive and unique per route (`<title>` via Next.js
  metadata API).
- [ ] Touch targets are at least 24x24px (WCAG 2.2 new criterion) with adequate
  spacing — relevant for mobile-responsive components.
- [ ] No time limits on tasks (session timeouts, form completion) without a way to
  extend, or make it generous enough not to matter.

## Understandable
- [ ] `lang` attribute set on `<html>` (and on any inline content in a different
  language).
- [ ] Form errors are specific, programmatically associated with their field
  (`aria-describedby`), and don't rely on color alone.
- [ ] Labels/instructions precede inputs; required fields are marked in a way
  assistive tech announces (not just a red asterisk).
- [ ] Navigation and component patterns are consistent across the app (a "search"
  icon behaves the same way everywhere).
- [ ] Unexpected context changes don't happen automatically (e.g. don't
  auto-submit a form or navigate away on a mere input change without warning).

## Robust
- [ ] Valid, well-formed HTML — no duplicate IDs, no interactive elements nested
  inside other interactive elements (`<button>` inside `<a>`, etc.).
- [ ] Custom components (dropdowns, tabs, comboboxes) follow the relevant WAI-ARIA
  Authoring Practices pattern for name/role/value/state, so they announce
  correctly on screen readers.
- [ ] Status messages (form success, loading, errors) use `role="status"` /
  `aria-live="polite"` (or `"assertive"` for urgent errors) so they're announced
  without requiring focus to move.

## Fast manual checks worth doing
- Tab through the page/component with a mouse unplugged.
- Zoom to 200% and check nothing clips or overlaps.
- Run axe DevTools or Lighthouse's accessibility audit — catches ~30-40% of issues
  automatically; the rest need manual review (contrast in context, focus order,
  meaningful reading order for screen readers).
