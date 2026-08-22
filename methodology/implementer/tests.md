# Test Conventions

- Vitest + Testing Library + jest-dom matchers. No other test runner.
- Every new piece of functionality gets at minimum: critical feature happy-path tests and common error-path tests. Do not add exhaustive edge-case matrices or snapshot tests unless the implementation step explicitly asks for them — this is a stated user preference (avoid "snapshot bloat").
- Mock at system boundaries (network, database, WebSocket transport, time) — do not mock internal modules just to isolate a unit; test the real collaboration between your own modules.
- Name tests by observable behavior ("rejects a stale version with 409"), not by implementation detail ("calls checkVersion").
- For WebSocket/realtime code: test connection lifecycle (connect, disconnect, reconnect-with-backoff) and message ordering/deduplication as their own cases, not just the happy-path message round-trip.
- A test file's job is to make the acceptance criteria in `mvp-implementation-plan.md` concretely checkable — if a step's acceptance criteria names a specific test file, that file must exist and must exercise exactly what the criteria describes.

Applies to files matching: `**/*.test.ts`, `**/*.test.tsx`, `**/*.spec.ts`, `**/*.spec.tsx`.
