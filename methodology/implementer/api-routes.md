# API Route Conventions (Next API routes, Fastify, Express)

- Validate every request body, query param, and path param with a Zod schema before touching it. Reject with a 400 and a structured error body on failure — never trust `any`-typed input past the boundary.
- Authorization checks (session validity, role/permission) happen before any data access, not interleaved with business logic. Prefer a shared middleware/utility (e.g. `requireRole()`) over inline checks repeated per route.
- Never leak internal error details (stack traces, DB error messages) in the response body — log them server-side, return a generic message plus an error code the client can key off of.
- Rate limiting on any route that's unauthenticated, mutates data, or could be abused for enumeration (login, password verification, invite/join-by-code flows).
- Return consistent status codes: 400 validation, 401 unauthenticated, 403 unauthorized, 404 not found, 409 conflict (e.g. optimistic concurrency version mismatch), 429 rate limited, 500 unexpected.
- Idempotency: if a route can plausibly be retried by a client (network blip, double-submit), make it safe to call twice or document why it isn't.
- Match every request/response shape to `public-api.md` exactly — if a route needs to diverge from the documented shape, update `public-api.md` in the same change, don't let them drift apart.

Applies to files matching: `**/api/**/*.ts`, `**/routes/**/*.ts`, `**/*.route.ts`.
