# Search Grid & Recency Filter for YouTube™

A free Chrome extension that does two things on YouTube:

- **Grid view for search results.** Shows search results as a grid of
  cards instead of one long list. You choose how wide each card is, so you
  choose how many columns you get.
- **Recency filter.** Hides videos older than a number of days you pick,
  on search results and on the home page. Off by default.

Both settings live in the toolbar popup and apply as soon as you press
**Save**.

- Install: Chrome Web Store (listing coming soon), or load unpacked (below).
- Support and questions: <https://owencorpening.github.io/oat-web/tools/search-grid/>
- Privacy policy: <https://owencorpening.github.io/oat-web/tools/search-grid/privacy/>

**Privacy in one line:** it collects nothing, sends nothing anywhere, and
asks only for permission to save its own two settings.

**Limits:** the recency filter reads YouTube's English date text ("3d ago",
"2 weeks ago"), so it only works with YouTube set to English. Cards with no
date, such as live streams and Shorts shelves, are always left alone.

## Installing (unpacked, for development)

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
no tab reload needed.

## How it works

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

## Packaging for the Chrome Web Store

```sh
./scripts/package.sh
```

Writes `dist/search-grid-<version>.zip` holding only the files Chrome
needs (manifest, scripts, CSS, popup, icons), with the version read from
`manifest.json`. Upload that zip in the Chrome Web Store developer
dashboard. Bump `version` in `manifest.json` before each upload; the store
rejects a version it has already seen. Listing text lives in
`store/listing.md`.

## Development history

Short log of scope decisions, not a commit-by-commit changelog (see
`git log` for that) — kept mainly so a scope choice doesn't get
mistaken for an oversight later.

- v1: grid view + width control, search results page only
  (`ytd-search` / `ytd-video-renderer` selectors).
- v2: added date-based recency filtering, search results only.
- v3 (`d76fd48`): extended the recency filter to the homepage feed
  (`ytd-rich-item-renderer`, `span.ytContentMetadataViewModelMetadataText`
  — different DOM than search results). Width control deliberately
  **not** extended — the homepage already has its own native grid,
  so there was nothing to override.
- v1.1.0: renamed from "YouTube Search Grid + Recency Filter" to
  "Search Grid & Recency Filter for YouTube™" for the Chrome Web Store.
  Store branding rules don't allow a Google trademark as the start of an
  extension name; "… for YouTube™" is the allowed form. The new name
  also names both features, which closes the old gap where "Search Grid"
  didn't mention the homepage filter. Removed the stale "refresh YouTube
  to apply" popup text.

## Trademark

YouTube is a trademark of Google LLC. This extension is not made,
endorsed, or sponsored by Google or YouTube.
