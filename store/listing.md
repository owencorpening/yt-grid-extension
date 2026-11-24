# Chrome Web Store listing

Copy these into the developer dashboard. Keep them in sync with
`manifest.json` when either changes.

## Store listing tab

**Name** (from the manifest, can't be edited in the dashboard)
Search Grid & Recency Filter for YouTube™: Grid View, Hide Old Videos

**Summary** (from the manifest `description`, max 132 characters)
Turns YouTube™ search results into a grid you can size, and can hide old videos by upload date. Free, no tracking.

**Description**

Search results on YouTube come as one long list, a few videos per screen. Search Grid lays them out as a grid you can size, so a wide monitor shows a full row of videos instead of one.

It can also hide old videos. Set a number of days and anything uploaded longer ago disappears from search results and the home page. That helps with news, game updates, software tutorials, or any search where last year's video is the wrong answer.

What it does
• Grid view for YouTube search results. Pick a card width; the number of columns follows your window, so big monitors fill up instead of leaving empty space.
• Titles and chapter rows stay inside their card, even with narrow cards.
• Recency filter by upload date. Hide videos older than 1, 7, 30 or any number of days you choose, on search results and the home page. Off until you turn it on.
• Works signed in or signed out, and keeps working as more results load while you scroll.

How to use it
Click the toolbar icon, set the card width and the number of days, and press Save. Changes apply right away, with no reload.

Privacy
It collects nothing and sends nothing anywhere. Its only permission is to save its own two settings, which Chrome may sync to your other computers if Chrome sync is on.

Limits
The recency filter reads YouTube's English date text ("3 days ago"), so it works when YouTube's language is English. Videos with no date, such as live streams and Shorts shelves, are always shown.

Free and open source (MIT): https://github.com/owencorpening/yt-grid-extension
Support: https://owensappliedthinking.com/tools/search-grid/

YouTube is a trademark of Google LLC. This extension is not made, endorsed, or sponsored by Google or YouTube.

**Category:** Tools (or the closest match in the dashboard list)

**Language:** English

## Graphics

- Store icon 128×128: `icons/icon128.png`
- Small promo tile 440×280: `store/promo-440x280.png`
- Screenshots, 1280×800: take these yourself on real YouTube (see
  "Screenshots" below). At least one is required; up to five.

### Screenshots

Each 1280×800, taken in a real 1280-wide Chrome window, with one short
caption in large type along the top.

1. The grid: a search like "guitar lesson", card width about 260, 4-5
   columns. Caption: "YouTube search results as a grid"
2. The popup open over that grid. Caption: "Two settings. Press Save and
   it applies."
3. Recency filter: a fast-moving search (game patch or news) with "Hide
   videos older than 7 days", every card showing days, not years.
   Caption: "Hide videos older than the days you pick"
4. Card width about 220, many columns. Caption: "Smaller cards, more
   columns"
5. Home page with a 30-day filter. Caption: "Works on the home page too"

## Privacy practices tab

**Single purpose**
Changes how YouTube shows lists of videos: a grid layout for search results and an optional filter that hides videos older than a chosen number of days.

**Permission justification: storage**
Saves the user's two settings (card width and maximum video age) so they persist between visits.

**Host permission justification: https://www.youtube.com/***
The extension's only job is to change the layout of YouTube pages. Its content script runs only on youtube.com, reads the date text shown on each video card, and hides cards older than the user's setting. Nothing is read from or sent to anywhere else.

**Remote code:** No, I am not using remote code.

**Data usage:** tick none of the data types. Then certify all three:
does not sell or transfer user data to third parties, does not use it
for unrelated purposes, does not use it for creditworthiness or lending.

**Privacy policy URL**
https://owensappliedthinking.com/tools/search-grid/privacy/

## Distribution tab

Free. Visibility: Public. Regions: all.

## Support

**Support URL / homepage:** https://owensappliedthinking.com/tools/search-grid/
