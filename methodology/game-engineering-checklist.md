# Game Engineering Checklist

Pre-flight and pre-commit checklist for deterministic, interactive games: rule
correctness, one authoritative rules engine, multiplayer authority and
synchronization, replay/simulation, and game-specific UX. Applies whenever a diff
touches game state, actions, transitions, a multiplayer session, or in-game UI — a
project with no game-shaped domain simply never matches a trigger row below.

## How to use this

1. Identify what kind of surface you're touching using the trigger table below.
2. Walk the matching section(s) before considering the task complete.
3. If something fails a check, fix it or explicitly flag it to the user with why —
   don't silently ship a known gap.
4. For anything marked **(deep dive)**, read the linked reference file instead of
   relying on memory.

| You touched...                                                        | Run these sections                      |
|-------------------------------------------------------------------------|-------------------------------------------|
| Game state shape, legal-action logic, or the transition function        | Rules Engine                              |
| Any test for game rules                                                 | Rules Review & Adversarial Testing        |
| Server-side action handling, session/room state, reconnect logic        | Multiplayer Authority & Synchronization   |
| Turn indicators, illegal-action feedback, game-over UI, touch controls  | Game UX & Playtesting                     |
| Action history, save/load, spectating, or a game-record format          | Simulation & Replay                       |
| An AI/bot opponent                                                      | Future AI Players                         |

---

## Rules Engine

> Game rules must have one authoritative implementation. Other layers (UI, server,
> AI, replay) consume the game engine; they must not independently reimplement a
> rule. If the same win-condition or legality check shows up twice, that duplication
> is the bug — collapse it back into the engine.

- [ ] The engine models `GameState + Action -> GameState'` as a pure function: no
  I/O, no framework imports (no DOM, no React, no HTTP/WebSocket, no ORM), no hidden
  mutable global state, no non-deterministic input except an explicitly supplied or
  seeded RNG.
- [ ] Legal-action generation, transition logic, and terminal/victory conditions
  each live in exactly one place in the engine — grep for the check before adding a
  second copy of it in UI, server, AI, or replay code.
- [ ] Invariants (things that must always hold — e.g. "exactly one player's turn is
  active," "piece count never exceeds N") are checked in tests, and ideally as
  runtime assertions in development builds.
- [ ] Illegal actions are rejected by the engine itself, not filtered out earlier by
  the UI or server — the UI graying out an illegal move is a UX nicety, not the
  actual legality check.

**(deep dive)**: see `game-engineering/references/deterministic-engine.md` for engine
design, determinism, and the AI-player boundary.

## Rules Review & Adversarial Testing

- [ ] The engine has property-based or exhaustive tests for its core invariants
  (e.g. "no transition ever produces two active turns"), not just example-based
  happy-path tests.
- [ ] At least one adversarial test suite tries what a rules-breaker or malicious
  client would attempt: acting out of turn, replaying a stale action, submitting an
  action that was legal one state ago but isn't now, submitting a malformed or
  out-of-range action payload.
- [ ] Terminal/victory conditions are tested from more than one path to the same
  outcome (e.g. two different ways to win), not just the first one implemented.
- [ ] A full self-play simulation (random or scripted agents playing many games to
  completion) exists and can run in CI or on demand; any invariant violation it
  finds fails the build rather than being logged and ignored.

**(deep dive)**: see `game-engineering/references/deterministic-engine.md`.

## Multiplayer Authority & Synchronization

- [ ] Clients **request** actions; only the server-side engine instance validates
  and applies them. A client never treats its own optimistic state as authoritative
  — it renders a prediction, then reconciles against the server's response.
- [ ] The server re-validates legality itself (turn order, action shape, current
  state) even if the client already checked — never trust a client-supplied "this
  move is legal" claim.
- [ ] Duplicate and out-of-order actions are handled explicitly: each action carries
  a sequence number or idempotency key, and the server rejects or de-dupes
  stale/replayed actions instead of applying them twice.
- [ ] Reconnect and page-refresh are covered: a client can rejoin an in-progress
  game and receive the current authoritative state (not just future deltas)
  without desyncing.
- [ ] Abandoned games (a player disconnects and never returns) have a defined
  resolution — timeout, forfeit, or a pause-and-resume window — rather than
  persisting forever in an ambiguous state.
- [ ] Game state (and, where replay matters, the action history) is persisted
  server-side, not held only in server process memory that a restart or crash
  would lose.

**(deep dive)**: see `game-engineering/references/multiplayer-authority.md`.

## Game UX & Playtesting

- [ ] Whose turn it is, and what actions are currently legal, is always visually
  clear — not left for the player to infer.
- [ ] An illegal action attempt gives immediate, specific feedback (why it's
  illegal), not a silent no-op.
- [ ] Game-over/termination state is unambiguous: who won, why, and what to do next
  (rematch, leave, spectate).
- [ ] Touch and keyboard input both work for any interactive game surface, not just
  mouse/pointer — test on a touch viewport, not just a resized browser window.
- [ ] At least one real playtest (a human playing a full game, not just clicking
  through a mock) has happened before considering game UX done.

**(deep dive)**: see `game-engineering/references/game-ux-playtest.md`.

## Simulation & Replay

- [ ] The action history (not just the current state) is retained wherever replay,
  spectating, or post-game review is a goal — an opaque "current state only" store
  can't reconstruct how a game got there.
- [ ] Given the same initial state and the same recorded action sequence, replaying
  produces an identical final state — this is what makes bug reports and replays
  trustworthy.
- [ ] Where an existing interchange format fits (e.g. SGF for Go-like games),
  consider exporting to it for interoperability with existing tools — don't invent
  a bespoke format if a standard one already covers the domain, but don't force-fit
  one where it doesn't apply either.

**(deep dive)**: see `game-engineering/references/deterministic-engine.md`.

## Future AI Players

- [ ] An AI/bot player submits actions through the exact same entry point as a
  human client (the same request-an-action / server-validates path) — it is never
  given a privileged shortcut into the engine's internals.
- [ ] This boundary is real even before any AI player exists: the engine's action
  interface should be the only way any actor (human, AI, or replay) causes a state
  transition, so a bot can be added later without touching the engine.

**(deep dive)**: see `game-engineering/references/deterministic-engine.md`.

---

## When you find a violation

Fix it if it's small and clearly in scope. If it's pre-existing and out of scope
for the current change, flag it to the user by name (e.g. "the win check is
duplicated in both the engine and the UI — worth a follow-up to remove the UI
copy") rather than silently leaving it or silently fixing unrelated code without
mentioning it.
