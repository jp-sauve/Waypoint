# Deterministic Engine: Design, Testing, Replay, AI Boundary

Reference this when designing or reviewing the rules engine itself, its test
strategy, or the replay/AI boundaries around it. The main `game-engineering-checklist`
SKILL.md covers the everyday checks; this is the deeper-dive rationale and technique
list.

## Core model

Treat every game as one function: `GameState + Action -> GameState'`, plus a
`legalActions(GameState) -> Action[]` (or `isLegal(GameState, Action) -> boolean`)
query and an `isTerminal(GameState) -> Outcome | null` check. Everything else in the
system — UI, server, AI, replay — is a client of these three functions, never a
reimplementation of what they do.

- **Pure and framework-free.** The engine package/module has zero imports from a UI
  framework, HTTP/WebSocket library, or ORM. This is what makes it possible to unit
  test in milliseconds and reuse identically on client (for prediction/rendering) and
  server (for authority) without drift between two "similar" implementations.
- **Explicit randomness.** If the game has any chance element (a shuffled deck, a
  dice roll), the RNG is a seeded, injectable dependency — `transition(state, action,
  rng)` — not `Math.random()` called inline. This is what makes replay and
  simulation possible at all: same seed + same actions = same outcome.
- **One authoritative implementation.** Before writing a rule check anywhere outside
  the engine (a UI "can I click this?" guard, a server pre-check, an AI legality
  filter), search the engine for an existing export that already answers the
  question. A duplicated check is a future bug the moment one copy is updated and
  the other isn't.

## Testing techniques, in increasing depth

Use whichever combination the game's complexity actually earns — a tic-tac-toe
engine doesn't need all four, a Go engine likely does.

1. **Example-based**: specific known positions and their expected legal
   moves/outcomes. Cheapest, catches regressions on named scenarios, but says
   nothing about positions nobody thought to write down.
2. **Property-based**: generate random (or randomly-mutated) states/actions and
   assert invariants that must hold universally (e.g. "the engine never returns a
   state with two simultaneously-active turns," "the sum of resources before and
   after a transfer transition is conserved"). Catches classes of bugs example tests
   can't, because it doesn't require anticipating the specific failing input.
3. **Exhaustive**: for small enough state spaces (a small board, early-game
   positions), enumerate every legal action from every reachable state and assert an
   invariant over all of them — a stronger guarantee than sampling, where the state
   space permits it.
4. **Simulation / self-play**: run many complete games with random or scripted
   agents making legal moves, checking invariants and terminal-condition reachability
   at every step, not just at the end. This is what surfaces bugs that only manifest
   many turns deep, which neither example nor property tests reliably reach on their
   own.
5. **Adversarial**: deliberately try what a rules-breaker or malicious client would
   attempt — acting out of turn, resubmitting a stale action, sending an action that
   was legal one state ago but no longer is, sending a malformed or out-of-range
   payload. These are the cases most likely to matter once the engine is exposed to
   an untrusted network client (see `multiplayer-authority.md`), so they're worth
   writing even before networking exists.

## Replay and simulation

- Store the **action history**, not only the current state, whenever replay,
  spectating, undo, or post-game analysis matters. An opaque "current state" column
  in a database can't answer "how did we get here" or feed a replay viewer.
- A replay is just: initial state + recorded action sequence, fed back through the
  same `transition` function. If replaying doesn't reproduce the original final
  state exactly, either the engine has hidden non-determinism (fix it) or the
  history is incomplete (log more).
- Where a standard interchange format already fits the domain — SGF for Go and
  related games is the common example — consider emitting it, since it buys
  interoperability with existing analysis/viewer tools for free. This is a
  per-project decision based on the actual game, not a default every Waypoint
  project should assume; don't add SGF-specific code to generic engine code that
  isn't actually a Go-family game.

## The AI-player boundary

Design the action-submission interface as if a bot will eventually use it, even
when no AI player is planned yet:

- A human client and an AI client should call the *same* function to submit an
  action (locally in a single-player game, or the same server endpoint in a
  networked one). Neither gets a shortcut that skips legality validation.
- This doesn't require building an AI now — it requires not building an
  AI-shaped hole later. If adding a bot player would require new engine entry
  points beyond "submit this action, get validated/applied," that's a sign the
  action interface leaked implementation details instead of staying at the
  `GameState + Action -> GameState'` level.
