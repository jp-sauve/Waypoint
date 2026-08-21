---
applyTo: "**/*.tsx"
---

# React / Next.js Component Conventions

- Functional components only; no class components.
- Server Components by default in `app/`; add `"use client"` only when the component needs state, effects, or browser APIs — state which and why in a comment only if it's non-obvious (e.g. "needs localStorage" is obvious; "needs client-side to avoid a hydration mismatch on X" is not).
- Every interactive element (button, input, link acting as a control) needs an accessible name — visible text, `aria-label`, or `aria-labelledby`. Don't add `aria-label` to elements that already have visible text conveying the same thing.
- Respect `prefers-reduced-motion` for any animation or transition beyond simple color/opacity — provide a static fallback.
- Focus must be visible and reach every interactive element via keyboard; do not remove focus outlines without replacing them.
- Mobile-first: base styles target the smallest breakpoint, larger breakpoints layer on via min-width media queries or the project's Tailwind/SCSS breakpoint tokens — not the reverse.
- Loading and empty states are part of the component, not an afterthought — if a component fetches or receives async data, it needs a loading state and an empty/zero-result state, not just a happy-path render.
- Wrap components that render untrusted or external data (iframes, markdown, user-submitted HTML) in an error boundary; don't let a render error in one panel take down the page.
- Props and exported component types live in `public-api.md` if the component is part of a published package's public surface — match them exactly, don't drift.

## React 19 features — use these instead of the pre-19 workarounds

Waypoint defaults to latest-stable React (React 19+, see `tradeoffs.md`). Prefer these over the older patterns they replace; don't reach for the old pattern out of habit.

- **Forms/mutations**: use Actions — pass a function directly to `<form action={fn}>` (or `formAction` on a button for multiple actions in one form) instead of manual `onSubmit` + `preventDefault` + hand-wired `useState` for pending/error. Pair with `useActionState` to get `[state, formAction, isPending]` instead of separate `useState` calls for result and pending.
- **Submit/pending UI inside a form**: use `useFormStatus` in a child component to read the parent `<form>`'s pending/data/action state — don't prop-drill an `isSubmitting` boolean down from the page component.
- **Optimistic UI**: use `useOptimistic` for anything that should appear to succeed immediately (posting a comment, toggling a like, sending a chat message) while the real mutation is in flight — don't hand-roll a shadow state variable that you reconcile manually.
- **Reading a promise or context conditionally**: use the `use()` API — it can be called inside conditionals/loops (unlike `useContext`/hooks) and can unwrap a promise with Suspense. Prefer it over `useEffect` + `useState` for consuming a promise passed from a Server Component.
- **Server Components passing data to Client Components**: pass promises down and unwrap with `use()` in the client boundary, rather than `await`-ing everything in the Server Component and blocking the initial render.
- **Server mutations**: Server Actions (`"use server"`) are the default for form submissions and mutations from Client Components — don't stand up a Next.js Route Handler for a mutation a Server Action can express directly, unless something external needs to call that endpoint too.
- **Refs on custom components**: accept `ref` as a normal prop — do not wrap components in `forwardRef`, it's no longer necessary.
- **Document metadata**: render `<title>`, `<meta>`, and `<link>` directly in the component that owns that data (React hoists them into `<head>` automatically) instead of a separate head-management library or a metadata-only parent component. In Next.js App Router, prefer the framework's `metadata`/`generateMetadata` export for route-level metadata; use inline metadata tags only for metadata that's genuinely component-local (e.g. a reusable card component that sets `<link rel="canonical">` for its own embedded content).
- **Preloading known-critical resources**: use `preload`/`preinit`/`preconnect`/`prefetchDNS` from `react-dom` for third-party fonts/scripts/connections you know you'll need, instead of hand-written `<link>` tags.
- **Context provider syntax**: write `<MyContext value={...}>` directly instead of `<MyContext.Provider value={...}>`.
- Do not use any of the above on a component explicitly marked as needing to run on React 18 or earlier (e.g. a shared package with a wider peer-dependency range) — check `tradeoffs.md` before assuming 19 is safe to target in a library package.
