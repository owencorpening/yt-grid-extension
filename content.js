const DEFAULTS = { cardWidth: 320, maxAgeDays: 0 }; // maxAgeDays: 0 = filter off

let settings = { ...DEFAULTS };

function applyCardWidth(width) {
  document.documentElement.style.setProperty('--yt-grid-card-width', width + 'px');
}

// Parses YouTube's relative-time text into an approximate age in days.
// Returns null if the text doesn't match. Confirmed live against real
// search results (2026-08-25): YouTube renders abbreviated units ("1y
// ago", "4mo ago", "22h ago", "4d ago"), not the full words ("1 year
// ago") this originally only matched — meaning the filter never matched
// anything, on any page, ever. Full words kept too in case they show up
// in some other context.
function ageInDays(text) {
  const m = text.trim().match(/^(\d+)\s*(second|sec|s|minute|min|m|hour|hr|h|day|d|week|w|month|mo|year|y)s?\s+ago$/i);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  switch (m[2].toLowerCase()) {
    case 'second':
    case 'sec':
    case 's':
    case 'minute':
    case 'min':
    case 'm':
    case 'hour':
    case 'hr':
    case 'h':
      return 0;
    case 'day':
    case 'd':   return n;
    case 'week':
    case 'w':   return n * 7;
    case 'month':
    case 'mo':  return n * 30;
    case 'year':
    case 'y':   return n * 365;
  }
  return null;
}

// Search results may also come as yt-lockup-view-model (the newer
// component, which uses the same metadata span as the homepage); playlist
// and course lockups have no "N ago" text and are left alone.
// Search results (ytd-video-renderer) use the legacy metadata markup
// (span.inline-metadata-item). The homepage (ytd-rich-item-renderer) uses
// YouTube's newer "lockup" component instead, where the same relative-time
// text lives in span.ytContentMetadataViewModelMetadataText — confirmed
// live against the real homepage DOM (2026-08-25). Shorts-shelf items on
// the homepage carry a view count but no relative-time span at all; those
// fall through the existing "no parsable date, leave it alone" path below,
// same as live streams already did on search results.
function applyAgeFilter() {
  document.querySelectorAll('ytd-video-renderer, ytd-rich-item-renderer, ytd-search yt-lockup-view-model').forEach((renderer) => {
    const spans = renderer.querySelectorAll(
      'span.inline-metadata-item, span.ytContentMetadataViewModelMetadataText'
    );
    let age = null;
    spans.forEach((span) => {
      const a = ageInDays(span.textContent);
      if (a !== null) age = a;
    });
    if (age === null) return; // no parsable date found, leave it alone
    const tooOld = settings.maxAgeDays > 0 && age > settings.maxAgeDays;
    gridCellFor(renderer).style.display = tooOld ? 'none' : '';
  });
}

// The element to hide is the grid's own child (the cell), not necessarily the
// renderer. If YouTube wraps a result in another element, hiding only the
// inner renderer leaves an empty wrapper that still takes a grid slot, which
// shows up as a blank hole in the grid (seen 2026-11-22). Outside the search
// grid (e.g. the homepage), the renderer itself is hidden as before.
const SEARCH_GRID = 'ytd-search #contents.ytd-item-section-renderer';
function gridCellFor(renderer) {
  const grid = renderer.closest(SEARCH_GRID);
  if (!grid) return renderer;
  let el = renderer;
  while (el.parentElement && el.parentElement !== grid) el = el.parentElement;
  return el.parentElement === grid ? el : renderer;
}

// Vertical spacing between grid items is a bottom margin, not row-gap
// (see grid.css). An item that renders nothing (empty ad slot, section
// header, collapsed shelf) gets no margin, so a run of them between two
// rows of videos no longer stacks up into a big empty band (seen
// 2026-11-22: ~170px between row 1 and row 2 on a "soccer" search).
const GRID_ITEMS = [
  'ytd-search #contents.ytd-item-section-renderer > *',
  'ytd-search ytd-section-list-renderer > #contents > *',
  'ytd-search ytd-section-list-renderer > #contents > ytd-item-section-renderer > *'
].join(', ');
function collapseEmptyItems() {
  document.querySelectorAll(GRID_ITEMS).forEach((el) => {
    const display = getComputedStyle(el).display;
    if (display === 'contents' || display === 'none') return;
    if (el.getBoundingClientRect().height === 0) {
      el.style.setProperty('margin-bottom', '0', 'important');
    } else {
      el.style.removeProperty('margin-bottom');
    }
  });
}

function applyAll() {
  applyCardWidth(settings.cardWidth);
  applyAgeFilter();
  collapseEmptyItems();
}

// Coalesce bursts of DOM changes into one pass per animation frame.
let pending = false;
function scheduleApply() {
  if (pending) return;
  pending = true;
  requestAnimationFrame(() => {
    pending = false;
    applyAgeFilter();
    collapseEmptyItems();
  });
}

chrome.storage.sync.get(DEFAULTS, (stored) => {
  settings = { ...DEFAULTS, ...stored };
  applyAll();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'sync') return;
  if (changes.cardWidth) settings.cardWidth = changes.cardWidth.newValue;
  if (changes.maxAgeDays) settings.maxAgeDays = changes.maxAgeDays.newValue;
  applyAll();
});

// Re-apply the age filter as more results load in (infinite scroll)
const observer = new MutationObserver(scheduleApply);
observer.observe(document.body, { childList: true, subtree: true });

// YouTube is a single-page app: navigating between pages by using its own
// search box or nav links is a client-side route change (history.pushState),
// not a real browser navigation. Content scripts only ever inject on real
// navigations, so without this listener the grid/filter would apply once on
// the very first full page load and never again until a manual reload —
// even though the extension is working correctly. YouTube fires this event
// on `document` after every internal route change finishes.
document.addEventListener('yt-navigate-finish', applyAll);
