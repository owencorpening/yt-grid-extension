const DEFAULTS = { cardWidth: 320, maxAgeDays: 0 }; // maxAgeDays: 0 = filter off

let settings = { ...DEFAULTS };

function applyCardWidth(width) {
  document.documentElement.style.setProperty('--yt-grid-card-width', width + 'px');
}

// Parses YouTube's relative-time text ("3 days ago", "2 weeks ago", etc.)
// into an approximate age in days. Returns null if the text doesn't match.
function ageInDays(text) {
  const m = text.trim().match(/^(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago$/i);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  switch (m[2].toLowerCase()) {
    case 'second':
    case 'minute':
    case 'hour':
      return 0;
    case 'day':   return n;
    case 'week':  return n * 7;
    case 'month': return n * 30;
    case 'year':  return n * 365;
  }
  return null;
}

function applyAgeFilter() {
  document.querySelectorAll('ytd-video-renderer').forEach((renderer) => {
    const spans = renderer.querySelectorAll('span.inline-metadata-item');
    let age = null;
    spans.forEach((span) => {
      const a = ageInDays(span.textContent);
      if (a !== null) age = a;
    });
    if (age === null) return; // no parsable date found, leave it alone
    const tooOld = settings.maxAgeDays > 0 && age > settings.maxAgeDays;
    renderer.style.display = tooOld ? 'none' : '';
  });
}

function applyAll() {
  applyCardWidth(settings.cardWidth);
  applyAgeFilter();
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
const observer = new MutationObserver(() => applyAgeFilter());
observer.observe(document.body, { childList: true, subtree: true });

// YouTube is a single-page app: navigating between pages by using its own
// search box or nav links is a client-side route change (history.pushState),
// not a real browser navigation. Content scripts only ever inject on real
// navigations, so without this listener the grid/filter would apply once on
// the very first full page load and never again until a manual reload —
// even though the extension is working correctly. YouTube fires this event
// on `document` after every internal route change finishes.
document.addEventListener('yt-navigate-finish', applyAll);
