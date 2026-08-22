# Web Engineering Checklist (Next.js + Database)

This artifact is a pre-flight and pre-commit checklist, not a style guide. Its job is to
catch the categories of bugs that don't show up in normal testing: security holes,
accessibility failures, and reliability gaps. These are easy to skip under time
pressure because the code "works" — it just fails for an attacker, a screen-reader
user, or the first spike in traffic.

Run the relevant section(s) below based on what the diff actually touches. Not every
task needs every section — a copy change to a static page doesn't need the database
checklist. Use judgment, but err toward checking rather than skipping.

## How to use this

1. Identify what kind of surface you're touching (route handler, DB query, form,
   auth, UI component) using the trigger table below.
2. Walk the matching checklist(s) before considering the task complete.
3. If something fails a check, fix it or explicitly flag it to the user with why —
   don't silently ship a known gap.
4. For anything marked **(deep dive)**, read the linked reference file instead of
   relying on memory — these are areas where the specific wording of a rule matters.

| You touched...                          | Run these sections                    |
|------------------------------------------|----------------------------------------|
| API route / route handler / server action | Security → Input & Auth, Reliability   |
| Any DB query (Prisma/Drizzle/raw SQL)     | Security → Data Layer                  |
| Login, sessions, permissions              | Security → Auth & Access Control       |
| Forms, modals, nav, custom components     | Accessibility                          |
| Anything rendering user-supplied content  | Security → XSS/Injection               |
| New dependency                            | Security → Supply Chain                |
| Anything handling personal/user data (accounts, profiles, payments, analytics) | Privacy & Data |
| Anything on the hot path / list pages     | Performance                            |

---

## Security

### Input & Auth (every API route / server action)
- [ ] Validate and parse all input at the boundary (e.g. Zod) — never trust `req.body`,
  query params, or headers as already-shaped correctly.
- [ ] Re-check auth/authorization **inside** the handler, even if middleware also
  checks it. Middleware can be bypassed or misconfigured; the handler is the last line
  of defense.
- [ ] Never trust a client-supplied user ID / org ID / role. Derive identity from the
  verified session, not from the request payload.
- [ ] Rate-limit or otherwise protect endpoints that are expensive, send email/SMS, or
  guess secrets (login, password reset, invite codes).

### Data Layer (every DB query)
- [ ] No raw string-interpolated SQL. Use parameterized queries or an ORM's query
  builder — this is the #1 OWASP injection vector and it's completely avoidable.
- [ ] Scope every query to the current tenant/user where multi-tenancy applies. A
  query that "forgets" the `where userId = ...` clause is a data leak, not just a bug.
- [ ] Don't return more fields than the client needs (e.g. `select` explicit columns
  instead of returning a full row that happens to include `passwordHash`).
- [ ] Migrations are additive/reversible where possible; destructive migrations
  (drop column, drop table) get flagged explicitly, not run silently.

### Auth & Access Control
- [ ] Passwords hashed with bcrypt/argon2, never stored or logged in plaintext.
- [ ] Session tokens are httpOnly, secure, SameSite-appropriate cookies — not
  localStorage (XSS-readable).
- [ ] Authorization checks are "default deny": explicitly check the user *can* do the
  thing, rather than checking for reasons they can't.
- [ ] Object-level access control: fetching `/api/orders/123` checks that order 123
  belongs to the requesting user, not just that the user is logged in.

### XSS / Injection (anything rendering user content)
- [ ] Never use `dangerouslySetInnerHTML` on unsanitized user input. If you must,
  sanitize with a library (e.g. DOMPurify) first.
- [ ] Escape user content in emails, PDFs, and any non-React rendering path — React
  auto-escapes JSX by default, but that protection doesn't extend elsewhere.
- [ ] Set a Content-Security-Policy header for anything handling sensitive data.

### Supply Chain (new dependency)
- [ ] Check the package isn't a typosquat of a popular name, has recent maintenance
  activity, and isn't pulling in an unreasonable number of transitive deps for what
  it does.
- [ ] Pin versions in lockfile; don't install with a loose range for security-relevant
  packages (auth, crypto).
- [ ] Never commit secrets/API keys — use environment variables, and confirm `.env*`
  is gitignored.
- [ ] Check the package's license is compatible with this project's license (see
  `tradeoffs.md`) — a GPL/AGPL dependency pulled into a closed-source or
  permissively-licensed project is a legal problem, not a lint warning. Flag it
  rather than silently installing.

**(deep dive)**: See `engineering-checklist/references/owasp-top10.md` (alongside this file)
for the full OWASP Top 10 mapped to Next.js-specific examples.

---

## Privacy & Data (GDPR/CCPA-style)

Run this for anything that collects, stores, displays, or transmits personal data —
account fields, profiles, payment info, analytics/tracking, uploaded content. Privacy
failures are usually scope creep (a field collected "just in case") rather than a
single obvious bug.

- [ ] **Data minimization.** Collect only the fields the current feature actually
  needs. Don't add a personal-data field to a schema speculatively.
- [ ] **Purpose limitation.** Personal data collected for one purpose (e.g. shipping
  address) isn't silently reused for another (e.g. marketing) without new consent.
- [ ] **PII never lands in logs.** Emails, names, addresses, payment details — mask
  or hash before logging if you need to correlate; never log the raw value.
- [ ] **Encryption.** Personal data is encrypted in transit (TLS) always, and at rest
  for especially sensitive fields (payment info, government IDs, health data).
- [ ] **Deletion/export path.** There's a way to actually delete or anonymize a
  user's data on request, not just deactivate the account — even if it's a manual
  admin action for the MVP, it must exist and be documented.
- [ ] **Cookie/tracking consent.** Non-essential cookies (analytics, marketing,
  third-party trackers) are set only after consent, not on page load by default.
- [ ] **Third-party data sharing is inventoried.** Don't silently add a script or SDK
  that sends user data to a third party without it being a known, reviewed decision.

**(deep dive)**: See `engineering-checklist/references/privacy-checklist.md` for the fuller
GDPR/CCPA-oriented checklist (data subject rights, retention, breach notification,
processor agreements).

---

## Accessibility (WCAG 2.2 AA)

Run this for any new or modified UI component, not just "accessibility work" — a11y
regressions usually come from ordinary feature PRs, not dedicated a11y tickets.

- [ ] **Semantic HTML first.** Use `<button>` for actions, `<a>` for navigation,
  real `<form>`/`<label>`/`<input>` elements — not `<div onClick>`. ARIA is a patch
  for when semantic HTML genuinely can't express the pattern, not a default.
- [ ] **Keyboard operability.** Every interactive element must be reachable and
  operable via Tab/Enter/Space/Escape alone. Test by unplugging your mouse mentally
  (or literally) for anything new.
- [ ] **Focus management.** Modals trap focus and return it on close; route changes
  don't strand focus on a removed element; focus outlines are never removed
  (`outline: none` without a replacement is a common regression).
- [ ] **Labels on every input.** `<label htmlFor>` or `aria-label`, not just a
  placeholder (placeholders disappear on input and aren't reliably read by all
  screen readers).
- [ ] **Color contrast.** 4.5:1 for normal text, 3:1 for large text/UI components.
  Check this especially for muted/secondary text, which is where contrast most often
  fails.
- [ ] **Images and icons.** Meaningful images get descriptive `alt`; decorative
  images/icons get `alt=""` or `aria-hidden="true"` so screen readers skip them.
- [ ] **Don't rely on color alone** to convey state (e.g. error fields need a border/
  icon/text change, not just red text).
- [ ] **Dynamic content announces itself.** Toasts, form errors, and live-updating
  regions use `aria-live` so screen-reader users know something changed without
  refocusing.

**(deep dive)**: See `engineering-checklist/references/wcag-checklist.md` for the fuller WCAG 2.2 AA
success-criteria checklist.

---

## Reliability & Data Integrity

- [ ] Handlers that mutate data (create/update/delete) are safe to retry — either
  naturally idempotent or protected with an idempotency key, especially for
  payment-adjacent actions.
- [ ] Errors are caught and return a proper status code + safe message — never leak
  stack traces, SQL errors, or internal paths to the client.
- [ ] Loading, empty, and error states are all handled in the UI — not just the happy
  path.
- [ ] External calls (DB, third-party API) have a timeout; nothing hangs forever on a
  slow dependency.
- [ ] Structured logs on the server for failures (enough to debug later) without
  logging PII or secrets.

## Performance (hot paths, list/detail pages)

- [ ] No N+1 queries — check that a list page isn't issuing one DB query per row
  (common with ORMs doing lazy relation loads in a loop).
- [ ] Pagination or limits on any query that could return an unbounded result set.
- [ ] Expensive computations or fetches use `cache`/`revalidate`/ISR where the data
  doesn't need to be real-time on every request.
- [ ] Images use `next/image` (automatic sizing/lazy-loading) rather than raw `<img>`
  for anything above a trivial size.
- [ ] Client components are used only where interactivity is actually needed — default
  to Server Components to keep JS bundle size down.

---

## When you find a violation

Fix it if it's small and clearly in scope. If it's pre-existing and out of scope for
the current change, flag it to the user by name (e.g. "this endpoint doesn't re-check
authorization server-side — worth a follow-up") rather than silently leaving it or
silently fixing unrelated code without mentioning it.
