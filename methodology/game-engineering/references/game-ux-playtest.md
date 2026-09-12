# Game UX & Playtesting

Reference this for the player-facing side of a game — interaction feedback, turn
state, and playtest criteria — as a distinct concern from ordinary web-app UX (the
`ui-component-references` and `layout-pattern-references` Skills still apply for
generic modals/layout; this covers what's specific to *playing a game*).

## Interaction feedback

- **Turn state is always visible.** Whose turn it is, and whether it's the local
  player's turn, must be legible at a glance — a color/label change, not something
  the player has to infer from context. For a real-time (non-turn-based) game,
  show the equivalent "you can currently act" state instead.
- **Legal actions are discoverable.** A player shouldn't have to guess what's
  clickable/playable; affordances (highlighting, cursor state, enabled/disabled
  controls) should reflect what `legalActions()` actually returns for the current
  state — driven by the engine's answer, not a separately-maintained UI guess.
- **Illegal-action feedback is immediate and specific.** A rejected action gets a
  visible, specific reason where feasible ("not your turn," "that square is
  occupied") rather than a silent no-op that leaves the player unsure whether their
  input registered at all.
- **Latency is acknowledged.** For any networked action, give immediate local
  feedback (a pending/optimistic state) rather than a frozen UI while waiting on the
  server round-trip — but make clear when a predicted result is provisional if the
  server might still reject it.

## Termination

- Game-over state states, unambiguously: the outcome (who won/lost/drew and why —
  reference the specific terminal condition, not just "game over"), and the
  available next actions (rematch, return to lobby, spectate, review/replay).
- A game that ends due to abandonment/forfeit/timeout (see
  `multiplayer-authority.md`) should say so explicitly, distinctly from a normal
  win/loss — a player shouldn't have to guess whether they actually lost the game or
  the other side just vanished.

## Responsive & touch interaction

- Every interactive game element works with touch (tap, and drag if the game uses
  drag-based moves) as a first-class input, not a degraded fallback — test on an
  actual touch-sized viewport, not just a resized desktop browser window.
- Keyboard interaction remains available where feasible for accessibility, even for
  a primarily pointer/touch-driven game (e.g. arrow keys + confirm for a grid-based
  game).
- Board/board-like layouts scale down to small viewports without losing legibility
  of whose-turn/legal-action affordances — a layout that only "works" at desktop
  width isn't done.

## Playtest criteria

Before considering game UX done, run at least one real playtest session:

- [ ] A human plays a **complete** game start to finish (not a truncated demo click-
  through) using the actual input method (touch/mouse/keyboard) end users will use.
- [ ] They can, unprompted, correctly state whose turn it is and what they're
  allowed to do at any point without being told.
- [ ] At least one illegal action was attempted (intentionally, as part of the
  test) and produced clear feedback rather than confusion.
- [ ] The game reached a terminal state and the player correctly understood the
  outcome and their next options without being told.
- [ ] If multiplayer: at least one reconnect/refresh was exercised mid-game and the
  player resumed without confusion or state loss.

Log playtest findings the same way any other review finding is logged — file:line
or screen name plus what was confusing, not a vague "felt clunky."
