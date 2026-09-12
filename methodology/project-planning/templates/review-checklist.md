# Review Checklist

Copy this verbatim to `docs/design/reference/review-checklist.md` in the target project. Run through it after completing every implementation step — this is what `/review-step` checks against.

For a deeper pass (new component library, auth/payments work, pre-launch review) than this condensed checklist covers, see the `web-engineering-checklist` Claude Skill and its `references/owasp-top10.md` / `references/wcag-checklist.md` / `references/privacy-checklist.md` under `.claude/skills/` — Claude Code sessions trigger it automatically on matching diffs; from the Copilot side, read those files directly.

Before hand-rolling a modal, dropdown, toast, or header, see the `ui-component-references` Claude Skill (or `.waypoint/ui-components/references/` directly on the Copilot side) for a verified starting implementation to adapt.

Before hand-rolling a new page/route's scroll or navigation behavior (snapped viewport sections, a paged/slide sequence, an SPA content region, a sticky split-scroll narrative, a pan/zoom canvas, or a progressively-loaded feed) or a region's spatial composition (a grid, bento, sidebar + content, layered, asymmetric), see the `layout-pattern-references` Claude Skill (or `.waypoint/layout-patterns/references/` directly on the Copilot side).

For a diff that touches game state, legal actions, transitions, multiplayer synchronization, or in-game UI, see the `game-engineering-checklist` Claude Skill (or `.waypoint/game-engineering/references/` directly on the Copilot side) — confirm rule changes live only in the rules engine.

- **Security**: no unsafe HTML rendering (unsanitized `dangerouslySetInnerHTML` / iframe `srcdoc`), no secrets in code or logs, rate limits in place on any mutating or unauthenticated endpoint (HTTP and WebSocket alike), new dependencies have a license compatible with this project's (see `tradeoffs.md`).
- **Privacy**: only necessary personal-data fields are collected, no PII in logs, a deletion/export path exists for user data, non-essential cookies/trackers require consent before loading.
- **Types**: no implicit `any`, strict null checks pass, request/response/message shapes match `public-api.md` exactly.
- **Tests**: new functionality covered — happy path plus at least one error path. No snapshot bloat.
- **Accessibility**: every interactive element reachable by keyboard and has an accessible name, focus visible, motion has a `prefers-reduced-motion` fallback. Colors have at least WCAG AA contrast.
- **Performance**: no large synchronous blocks on render or on the request path; heavy dependencies lazy-loaded.
- **Responsive**: works at mobile, tablet, and desktop breakpoints — verified, not assumed.
- **Error handling**: user-facing errors have a message and a recovery path, not a blank screen or a swallowed exception.
- **Realtime (if applicable)**: connection lifecycle handled (connect/disconnect/reconnect with backoff), messages validated against a schema before use, reconnection doesn't duplicate or drop state.
- **Game rules (if applicable)**: rule/transition/terminal-condition logic lives only in the rules engine, not duplicated in UI/server/AI/replay code; the server (not the client) is authoritative for validating and applying actions; duplicate/out-of-order actions and reconnects are handled explicitly.
- **Scope**: the diff matches the step's "Files to create/modify" list; nothing outside "Out of scope" was touched without flagging it first.
- **DX**: function and file names are clear without needing a comment to explain them; `docs/design/STATUS.md` was updated as the last step.
