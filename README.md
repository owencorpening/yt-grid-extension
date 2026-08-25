# YouTube Search Grid + Recency Filter

A small Manifest V3 Chrome extension for YouTube. On search results
(`youtube.com/results`) it replaces YouTube's default single-column list
with a tunable grid. On both search results and the homepage it can
optionally hide videos older than N days. Both are configurable from the
toolbar popup.

## What it does

- **Grid view.** Overrides `youtube.com/results` layout with a CSS grid
  (`repeat(auto-fill, minmax(cardWidth, 1fr))`), stacking each result's
  thumbnail over its text like the YouTube homepage grid instead of the
  default side-by-side list rows. Search-results-only — the homepage
  already uses a grid layout natively.
- **Recency filter.** Parses YouTube's relative-time text ("3 days ago",
  "1h ago", "3y ago", etc.) on each video card and hides anything older
  than a configured number of days. Runs on both search results
  (`ytd-video-renderer` / `span.inline-metadata-item`, the legacy
  metadata markup) and the homepage (`ytd-rich-item-renderer` /
  `span.ytContentMetadataViewModelMetadataText`, YouTube's newer "lockup"
  component — confirmed live against the real homepage DOM, 2026-08-25).
  A `MutationObserver` re-applies the filter as more cards load in on
  scroll, on both pages. Off by default (`0` = show all ages).

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
script never ran to begin with. `grid.css`'s selectors (`ytd-search
#contents...`) are specific enough to search-results markup that the grid
itself has no effect on other YouTube pages (confirmed live: zero matches
on the home page and a watch page). The recency filter's selectors are
deliberately broader, since it's meant to apply on the homepage too — see
above.

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
| Hide videos older than (days) | Applies on both search results and the homepage. `0` shows every result regardless of age. Any positive number hides results whose parsed age exceeds it. Results with no parsable relative-time text (e.g. live streams, homepage shorts-shelf cards) are left alone. | `0` (off) |

Changes take effect immediately after **Save** — the content script
listens for `chrome.storage.onChanged` and re-applies both settings live,
no tab reload needed. (The popup's own status message says "refresh
YouTube to apply" — that's stale text left over from the original build;
the live-update listener already makes it unnecessary.)
