# OWASP Top 10 (2021) — Next.js + Database Examples

Reference this when doing a deeper security review, not for routine checks (the
main SKILL.md checklist covers the common cases).

## A01: Broken Access Control
Most common real-world vuln. In Next.js this usually looks like:
- A route handler that checks `session.user` exists but not that the user *owns*
  the resource being fetched/modified (`/api/documents/[id]` should filter by
  `where: { id, ownerId: session.user.id }`, not just `where: { id }`).
- Client-side-only route protection (hiding a nav link) with no server-side check
  behind it — anyone can still POST to the API route directly.
- Middleware that protects page routes but not the API routes those pages call.

## A02: Cryptographic Failures
- Storing passwords with a fast hash (MD5/SHA1) instead of bcrypt/argon2/scrypt.
- Sending secrets over the wire in query params (they end up in logs, browser
  history, referer headers).
- Missing `Secure`/`HttpOnly`/`SameSite` on session cookies.

## A03: Injection
- String-concatenated raw SQL: `` `SELECT * FROM users WHERE email = '${email}'` ``.
  Use parameterized queries or an ORM query builder instead.
- NoSQL injection: passing a raw object from `req.body` directly into a Mongo/Prisma
  filter without validating shape first (`{ $ne: null }` style attacks).
- Command injection if shelling out based on user input anywhere (rare in Next.js,
  but check any `exec`/`spawn` usage).

## A04: Insecure Design
- No rate limiting on login/signup/password-reset — enables brute force and
  credential stuffing.
- Trusting a client-supplied price/quantity/discount in a checkout flow instead of
  recomputing server-side.

## A05: Security Misconfiguration
- Verbose error pages/stack traces reaching production responses.
- Default/example credentials left in seed scripts that also run against prod.
- Missing security headers (CSP, X-Content-Type-Options, Referrer-Policy) — Next.js
  config (`next.config.js` `headers()`) is the place to set these.
- CORS configured with `*` on routes that handle authenticated requests.

## A06: Vulnerable and Outdated Components
- Stale lockfile with known CVEs in transitive deps. Worth an occasional
  `npm audit`/`pnpm audit` pass, especially before a release.

## A07: Identification and Authentication Failures
- No account lockout / backoff after repeated failed logins.
- Session tokens that don't expire or rotate.
- Password reset tokens that are guessable or don't expire.

## A08: Software and Data Integrity Failures
- Installing packages from an untrusted registry/mirror without lockfile
  verification.
- Deserializing untrusted data (e.g. `eval`-ing JSON-like input) without validation.

## A09: Security Logging and Monitoring Failures
- Auth failures, permission-denied events, and admin actions aren't logged anywhere,
  making incident response impossible after the fact.
- Logging too much (full request bodies with PII/secrets) is its own failure mode —
  log enough to debug, not everything.

## A10: Server-Side Request Forgery (SSRF)
- An endpoint that fetches a URL supplied by the user (e.g. "import from URL",
  webhook testers, image proxies) without restricting the target — can be used to
  hit internal services/metadata endpoints (`169.254.169.254` on cloud providers).
  Validate/allowlist target hosts, or route through a proxy that blocks internal IPs.
