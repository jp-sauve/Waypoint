# Reference: Feed

A vertically stacked list of discrete items whose total count is unbounded or
open-ended — loaded progressively as the user scrolls, rather than all rendered up
front like a normal document-flow page. Distinct from `document-flow.md` in that the
content isn't a fixed, known set of sections; distinct from `spa-shell.md`'s "paged"
content mode in that items append to a continuous list rather than being replaced
page-by-page.

Use for social/activity feeds, search results, notification lists — any list whose
length isn't known ahead of time and would be wasteful or slow to render entirely at
once.

## What this implementation covers

- A manual **"Load more" button as the accessible default**, with auto-loading via
  IntersectionObserver layered on top as progressive enhancement — not the other way
  around. Fully automatic infinite scroll is a known accessibility and usability
  problem: it can disorient screen-reader and keyboard users (new content keeps
  appearing with no clear boundary, and reaching a page's footer becomes impossible
  since more content always loads first), and it removes a user's ability to control
  when more content — and more network/battery usage — loads. Auto-loading here only
  fires the *same* load path the button triggers, so keyboard-only and
  reduced-motion users always have the button as a working fallback.
- `aria-live="polite"` status region announcing "Loading more…" and then "N more
  items loaded," so the append isn't silent to screen-reader users.
- Focus is deliberately **not** moved when new items load — moving focus
  automatically on a background content change is disorienting; the newly loaded
  items simply become reachable by continuing to tab/scroll forward, which matches
  how a sighted user experiences the load (nothing jumps).
- A skeleton/loading state for the in-flight request, with `aria-hidden="true"`
  since it conveys no information beyond what the live region already announces.

## What it does *not* cover

- Virtualization (unmounting off-screen items to cap DOM size) — needed once a feed
  grows into the thousands of items; this reference keeps every loaded item in the
  DOM, which is fine for feeds of a few hundred items but will degrade past that.
  Add virtualization (e.g. `react-virtual`) as a separate concern once the feed's
  real scale is known, rather than pre-optimizing here.
- Pull-to-refresh or new-item-at-top notifications (common in social feeds when new
  items arrive above the loaded set) — a distinct, separate interaction from
  loading-more-at-the-bottom, which is what this reference covers.

## Code

```html
<div class="feed">
  <ul class="feed__list" aria-label="Activity feed">
    <li class="feed__item">…</li>
    <li class="feed__item">…</li>
    <!-- more items appended here -->
  </ul>
  <div class="feed__skeleton" aria-hidden="true" hidden>Loading skeleton…</div>
  <button type="button" class="feed__load-more">Load more</button>
  <p class="sr-only" aria-live="polite" data-feed-status></p>
  <div class="feed__sentinel" aria-hidden="true"></div>
</div>
```

```css
.feed__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feed__load-more {
  margin: 24px auto;
  display: block;
}

.feed__sentinel {
  height: 1px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
```

```js
// feed.js
const list = document.querySelector(".feed__list");
const loadMoreButton = document.querySelector(".feed__load-more");
const sentinel = document.querySelector(".feed__sentinel");
const status = document.querySelector("[data-feed-status]");
let isLoading = false;
let hasMore = true;

async function loadMore() {
  if (isLoading || !hasMore) return;
  isLoading = true;
  status.textContent = "Loading more…";

  const { items, hasMore: more } = await fetchNextPage(); // project-specific
  hasMore = more;

  for (const item of items) {
    const li = document.createElement("li");
    li.className = "feed__item";
    li.textContent = item.text; // project-specific rendering
    list.append(li);
  }

  status.textContent = `${items.length} more item${items.length === 1 ? "" : "s"} loaded.`;
  loadMoreButton.hidden = !hasMore;
  isLoading = false;
}

loadMoreButton.addEventListener("click", loadMore);

// Progressive enhancement: auto-trigger the same loadMore() when the sentinel
// scrolls into view, so most users never need to find the button.
new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting) loadMore();
  },
  { rootMargin: "200px" },
).observe(sentinel);
```

## Adapt to this project

- [ ] `fetchNextPage()` and item rendering — replace with the project's actual data
  fetching (REST page param, GraphQL cursor, etc.) and item markup/component.
- [ ] Once the feed's realistic max length is known, add virtualization if it can
  grow past a few hundred items — don't add it preemptively for a feed that's
  bounded in practice (e.g. "this week's notifications").
- [ ] If the design wants the Load More button hidden entirely in favor of pure
  auto-load, keep it in the DOM but visually hidden (not `display: none` /
  `hidden`) rather than removed — it must stay keyboard-reachable as the fallback
  for users whose IntersectionObserver trigger is impractical to use (e.g. switch
  / single-switch scanning access).
- [ ] `rootMargin: "200px"` on the sentinel observer — tune so the next page starts
  loading before the user hits the literal bottom, avoiding a visible loading
  stall.
