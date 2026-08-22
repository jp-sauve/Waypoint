# Reference: Canvas

A free-form, pannable and zoomable 2D surface — content is positioned in its own
coordinate space ("world" coordinates) rather than document flow, and the user
navigates by dragging to pan and scrolling/pinching to zoom, not by scrolling the
page. This is the structural pattern behind whiteboards, node/graph editors, and
spatial canvas tools. It has essentially nothing in common with the other page-flow
references in this library — there's no scroll container, no snap points, no
sections; the "page" is a single fixed viewport onto an arbitrarily large/small
world.

Use only when content genuinely has 2D spatial relationships worth preserving
(a diagram, a whiteboard, a map-like layout) — not as a stylistic alternative to a
normal scrolling page, since it trades away every native scroll/keyboard affordance
the browser gives you for free.

## What this implementation covers

- A `viewport` element (`overflow: hidden`, fixed size) containing a `world` element
  transformed via `translate()` + `scale()`, updated from pointer events — the
  standard structure for this pattern in any framework.
- Pan via `pointerdown`/`pointermove`/`pointerup` (not separate mouse/touch handlers
  — Pointer Events unify mouse, touch, and pen), and zoom via the `wheel` event with
  the zoom centered on the cursor position, not the world's origin — zooming toward
  the cursor is what makes the interaction feel physically correct; a naive scale-
  from-origin zoom makes the content appear to slide out from under the cursor.
- `touch-action: none` on the viewport, which stops the browser's own touch
  gesture handling (page scroll/pinch-zoom) from fighting the canvas's own pan/zoom
  — without it, touch panning on mobile scrolls the *page* instead of the canvas.
- Zoom clamped to a sane min/max range so content can't be scaled into
  imperceptibility or absurdity.
- A keyboard alternative (arrow keys pan, `+`/`-` zoom) on the viewport, since the
  core interaction is pointer-only by nature — without this, the canvas is entirely
  unusable without a mouse/touch input, which is a hard accessibility failure for
  this pattern specifically, not an edge case to skip.

## What it does *not* cover

- The actual content rendered inside the world (nodes, shapes, images, an actual
  `<canvas>`/SVG drawing surface) — this reference is the pan/zoom viewport mechanism
  only.
- Multi-touch pinch-to-zoom gesture math — the `wheel` handler covers
  trackpad/mouse-wheel zoom; a dedicated pinch gesture (two-pointer distance
  tracking) is a separate addition layered on the same pointer-event plumbing if the
  project needs first-class touch support.
- Persisting/restoring pan-zoom state across reloads — add if the project needs it
  (URL params, localStorage); state here is in-memory only.

## Code

```html
<div class="canvas-viewport" tabindex="0" aria-label="Canvas — arrow keys to pan, +/- to zoom">
  <div class="canvas-world">
    <!-- content positioned in world coordinates -->
  </div>
</div>
```

```css
.canvas-viewport {
  position: relative;
  overflow: hidden;
  touch-action: none;
  width: 100%;
  height: 100%;
  cursor: grab;
}

.canvas-viewport.is-panning {
  cursor: grabbing;
}

.canvas-world {
  transform-origin: 0 0;
  will-change: transform;
}
```

```js
// canvas.js
const viewport = document.querySelector(".canvas-viewport");
const world = document.querySelector(".canvas-world");

let x = 0, y = 0, scale = 1;
const MIN_SCALE = 0.25, MAX_SCALE = 4;

function applyTransform() {
  world.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
}

let isPanning = false;
let lastX = 0, lastY = 0;

viewport.addEventListener("pointerdown", (event) => {
  isPanning = true;
  viewport.classList.add("is-panning");
  lastX = event.clientX;
  lastY = event.clientY;
  viewport.setPointerCapture(event.pointerId);
});

viewport.addEventListener("pointermove", (event) => {
  if (!isPanning) return;
  x += event.clientX - lastX;
  y += event.clientY - lastY;
  lastX = event.clientX;
  lastY = event.clientY;
  applyTransform();
});

viewport.addEventListener("pointerup", () => {
  isPanning = false;
  viewport.classList.remove("is-panning");
});

viewport.addEventListener("wheel", (event) => {
  event.preventDefault();
  const rect = viewport.getBoundingClientRect();
  const cursorX = event.clientX - rect.left;
  const cursorY = event.clientY - rect.top;

  const prevScale = scale;
  const delta = -event.deltaY * 0.001;
  scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale + delta));

  // Keep the point under the cursor fixed while scale changes.
  x = cursorX - ((cursorX - x) / prevScale) * scale;
  y = cursorY - ((cursorY - y) / prevScale) * scale;

  applyTransform();
}, { passive: false });

viewport.addEventListener("keydown", (event) => {
  const PAN_STEP = 40;
  const ZOOM_STEP = 0.1;
  if (event.key === "ArrowLeft") x += PAN_STEP;
  else if (event.key === "ArrowRight") x -= PAN_STEP;
  else if (event.key === "ArrowUp") y += PAN_STEP;
  else if (event.key === "ArrowDown") y -= PAN_STEP;
  else if (event.key === "+" || event.key === "=") scale = Math.min(MAX_SCALE, scale + ZOOM_STEP);
  else if (event.key === "-") scale = Math.max(MIN_SCALE, scale - ZOOM_STEP);
  else return;
  event.preventDefault();
  applyTransform();
});
```

## Adapt to this project

- [ ] `MIN_SCALE`/`MAX_SCALE` and `PAN_STEP`/`ZOOM_STEP` — tune to the actual content
  scale (a diagram and a whiteboard of large sticky notes want very different ranges).
- [ ] The `wheel` handler zooms on every wheel event; if the project wants plain
  two-finger trackpad scroll to *pan* instead of zoom (a common expectation),
  distinguish pinch-zoom from scroll via `event.ctrlKey` (browsers set this on
  pinch gestures) rather than treating all wheel input as zoom.
- [ ] Add pinch-to-zoom for first-class touch support if the project targets
  touch devices as a primary input, not just a fallback.
- [ ] `cursor: grab`/`grabbing` — cosmetic, adjust or remove per the project's
  actual interaction affordance style.
