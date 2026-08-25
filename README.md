# YouTube Search Grid + Recency Filter

A small Manifest V3 Chrome extension for YouTube search results
(`youtube.com/results`). It replaces YouTube's default single-column
results list with a tunable grid, and can optionally hide videos older
than N days. Both are configurable from the toolbar popup.

## What it does

- **Grid view.** Overrides `youtube.com/results` layout with a CSS grid
  (`repeat(auto-fill, minmax(cardWidth, 1fr))`), stacking each result's
  thumbnail over its text like the YouTube homepage grid instead of the
  default side-by-side list rows.
- **Recency filter.** Parses YouTube's relative-time text ("3 days ago",
  "2 weeks ago", etc.) on each result and hides anything older than a
  configured number of days. A `MutationObserver` re-applies the filter
  as more results load in on scroll. Off by default (`0` = show all ages).

Settings are stored via `chrome.storage.sync` and applied by a content
script — no options page, no background service worker, no permissions
beyond `storage`.

YouTube is a single-page app: navigating to a search results page via
YouTube's own search box is a client-side route change
(`history.pushState`), not a real browser navigation, and content scripts
only ever inject on real navigations. `content.js` listens for YouTube's
own `yt-navigate-finish` event (fired on `document` after every internal
route change) and re-applies both settings — without it, the extension
would only ever work on the very first full page load of a session and
silently stop working on every subsequent in-app search until a manual
reload.

That fix only helps once the script has loaded at all, though — and the
manifest's `matches` pattern covers all of `youtube.com`, not just
`/results*`, specifically so it does. If it were scoped to `/results*`
only, starting a session anywhere else on YouTube (the home page, a watch
page) and then searching in-app would never inject the script in the
first place, since content scripts only evaluate `matches` against real
navigations — no amount of in-page-navigation handling helps if the
script never ran to begin with. `content.js`'s selectors (`ytd-video-renderer`,
`ytd-search #contents...`) are specific enough to search-results markup
that this broader injection has no effect on other YouTube pages
(confirmed live: zero matches on the home page and a watch page).

## Installing (unpacked)

1. Open `chrome://extensions`.
2. Enable **Developer mode** (top-right toggle).
3. Click **Load unpacked** and select this repo's folder.
4. Visit any YouTube search results page — the grid applies immediately.

There's no build step. `manifest.json`, `content.js`, `grid.css`,
`popup.html`, `popup.js`, and `icons/` are the whole extension. The icons
are pre-generated static PNGs (a red 2×2 grid, at 16/32/48/128px) — no
image tooling is a dependency of this repo, so they're committed as-is
rather than built from source on install.

## Settings

Click the extension icon to open the popup:

| Setting | What it does | Default |
| --- | --- | --- |
| Card min width (px) | Lower values pack more columns per row (grid uses `auto-fill`, so column count adapts to window width automatically). | `320` |
| Hide videos older than (days) | `0` shows every result regardless of age. Any positive number hides results whose parsed age exceeds it. Results with no parsable relative-time text (e.g. live streams) are left alone. | `0` (off) |

Changes take effect immediately after **Save** — the content script
listens for `chrome.storage.onChanged` and re-applies both settings live,
no tab reload needed. (The popup's own status message says "refresh
YouTube to apply" — that's stale text left over from the original build;
the live-update listener already makes it unnecessary.)
