# Chrome Web Store listing

Copy these into the developer dashboard. Keep them in sync with
`manifest.json` when either changes.

## Store listing tab

**Name** (from the manifest, can't be edited in the dashboard)
Search Grid & Recency Filter for YouTube™

**Summary** (from the manifest `description`, max 132 characters)
Shows YouTube search results as a grid you can size, and can hide videos older than a number of days you choose.

**Description**

Search results on YouTube come as one long list. This extension lays them out as a grid instead, so you can see many more videos at once.

What it does
• Grid view for search results. Pick a card width; the number of columns follows your window size.
• Recency filter. Hide videos older than a number of days you choose, on search results and on the home page. Off until you turn it on.

How to use it
Click the toolbar icon, set the card width and the number of days, and press Save. Changes apply right away.

Privacy
It collects nothing and sends nothing anywhere. Your two settings are saved with Chrome's own settings storage, which Chrome may sync to your other computers if you have Chrome sync turned on.

Limits
The recency filter reads YouTube's English date text, so it works when YouTube is set to English. Videos with no date, such as live streams and Shorts shelves, are always shown.

Free, open source (MIT): https://github.com/owencorpening/yt-grid-extension
Support: https://owencorpening.github.io/oat-web/tools/search-grid/

YouTube is a trademark of Google LLC. This extension is not made, endorsed, or sponsored by Google or YouTube.

**Category:** Tools (or the closest match in the dashboard list)

**Language:** English

## Graphics

- Store icon 128×128: `icons/icon128.png`
- Small promo tile 440×280: `store/promo-440x280.png`
- Screenshots, 1280×800: take these yourself on real YouTube (see
  "Screenshots" below). At least one is required; up to five.

### Screenshots

1. Search results as a grid, card width around 260 px, window at least
   1280 px wide.
2. The settings popup open over a search results page.
3. Optional: the home page with "Hide videos older than 30 days".

Crop or resize each to exactly 1280×800.

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
https://owencorpening.github.io/oat-web/tools/search-grid/privacy/

## Distribution tab

Free. Visibility: Public. Regions: all.

## Support

**Support URL / homepage:** https://owencorpening.github.io/oat-web/tools/search-grid/
