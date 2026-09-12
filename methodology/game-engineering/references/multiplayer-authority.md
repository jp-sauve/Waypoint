# Multiplayer Authority & Synchronization

Reference this when designing or reviewing anything where more than one participant
(human or AI) submits actions against shared game state over a network. The main
`game-engineering-checklist` SKILL.md covers the everyday checks; this is the
deeper-dive rationale.

## The authority model

- **The server holds the one authoritative `GameState`.** Every client — including
  the one whose turn it is — holds, at best, a copy it believes is current. Clients
  never write directly to shared state; they **request** an action, and only the
  server-side engine instance validates and applies it (same engine as
  `deterministic-engine.md` — the server doesn't get a separate implementation).
- **Never trust a client-supplied claim about legality, identity, or outcome.**
  "This move is legal," "I am player 2," and "the game is now over" are all
  server-computed facts, not client-asserted ones. A client that says otherwise is
  either buggy or hostile — the server can't tell which, so it validates either way.
- **Optimistic client rendering is a UX technique, not a trust boundary.** A client
  may render its own predicted result immediately for responsiveness, but must
  reconcile with (and defer to) the server's actual response — including rolling
  back a prediction the server rejects.

## Race conditions, duplicates, and ordering

- Give every submitted action an identifier the server can use to detect a resend
  (a monotonically increasing per-client sequence number, or a client-generated
  idempotency key) — a flaky connection *will* cause a client to resend an action it
  isn't sure was received, and the server must apply it once, not twice.
- Reject (or explicitly no-op) an action that targets a state the server has already
  moved past — e.g. an action stamped for turn 4 arriving after the server is on
  turn 6. Silently applying it against current state instead can desync the game in
  a way that's hard to detect until much later.
- If two players can submit near-simultaneously (a real-time game, not strictly
  turn-based), define an explicit resolution order (arrival order at the server,
  a fixed-tick simulation step, etc.) and make it deterministic — "whichever request
  happened to arrive first" is fine as a rule only if it's actually deterministic
  given the transport, not an accident of scheduling.

## Reconnect, refresh, and abandonment

- A client that reconnects (dropped WebSocket, browser refresh, new tab) must be
  able to fetch the current authoritative state directly — not rely solely on
  future incremental deltas, which it may have missed entirely while disconnected.
- Define what "the player left" means operationally: a grace/reconnect window before
  treating a disconnect as abandonment, then an explicit resolution (forfeit,
  pause-and-wait, replace with a bot) — an undefined middle state where the game is
  neither active nor resolved is the actual bug, not any specific choice among these.
- Persist enough server-side state (current `GameState`, and the action history if
  replay/audit matters) that a server process restart doesn't silently lose
  in-progress games — an in-memory-only authoritative store is a single point of
  data loss, not just a scaling limitation.

## What to actually implement, roughly in order

1. Server holds `GameState` and applies actions only through the shared engine.
2. Clients submit actions via request/response (or an ack'd message over a
   persistent connection); the server's applied result — not the client's own
   optimistic guess — is the source of truth once it arrives.
3. Sequence numbers/idempotency keys to de-dupe retries.
4. Reconnect: a "give me current state" fetch path, independent of the
   incremental-update stream.
5. Abandonment handling: timeout/forfeit/pause policy, stated explicitly rather than
   left as an edge case nobody decided on.
6. Persistence of state (and action history, if replay/spectating/audit is a goal)
   outside process memory.

This ordering mirrors how `project-planning.md`'s game-feature decomposition expects
these to land as separate, independently testable atomic steps — not one
"implement multiplayer" step.
