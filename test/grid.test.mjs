// Fixture-based layout test for the search grid.
//
// Loads each fixture in real Chrome, injects the extension's grid.css, and
// checks that every result lands where it should: videos / playlists / courses
// / mixes as grid CELLS, and shelves / ads / channels as full ROWS. The
// fixtures reproduce the signed-out layout (results as yt-lockup-view-model,
// including yt-collections-stack playlists and courses) and the signed-in one
// (results as ytd-video-renderer plus legacy playlist/mix rows), so the same
// CSS is held to both. No network, no live YouTube — the markup is checked in.
//
// Run: node test/grid.test.mjs   (needs Chrome at /usr/bin/google-chrome and
// playwright-core; see resolvePlaywright below.)

import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function resolvePlaywright() {
  const require = createRequire(import.meta.url);
  // Prefer a locally installed playwright-core; fall back to the copy bundled
  // with @playwright/mcp, which this machine already has globally.
  const candidates = [
    'playwright-core',
    '@playwright/mcp/node_modules/playwright-core',
  ];
  for (const id of candidates) {
    try { return require(id); } catch { /* try next */ }
  }
  for (const base of (process.env.NODE_PATH || '').split(path.delimiter).filter(Boolean)) {
    try { return require(path.join(base, 'playwright-core')); } catch { /* next */ }
  }
  // Last resort: scan the global npm root for the bundled copy.
  try {
    const { execSync } = require('node:child_process');
    const globalRoot = execSync('npm root -g', { encoding: 'utf8' }).trim();
    const p = path.join(globalRoot, '@playwright/mcp/node_modules/playwright-core');
    return require(p);
  } catch { /* fall through */ }
  throw new Error(
    'playwright-core not found. Install it with `npm i -D playwright-core`, ' +
    'or set NODE_PATH to a node_modules dir that has it.'
  );
}

const CHROME = process.env.CHROME_PATH || '/usr/bin/google-chrome';
const GRID_CSS = fs.readFileSync(path.join(ROOT, 'grid.css'), 'utf8');

async function checkFixture(page, file) {
  await page.goto(pathToFileURL(path.join(__dirname, 'fixtures', file)).href, {
    waitUntil: 'load',
  });
  await page.addStyleTag({ content: GRID_CSS });

  return page.evaluate(() => {
    const items = [...document.querySelectorAll('[data-test]')];
    // The grid container is the nearest display:grid ancestor of a cell.
    const anyItem = items[0];
    let grid = anyItem;
    while (grid && getComputedStyle(grid).display !== 'grid') grid = grid.parentElement;
    const gridWidth = grid ? grid.getBoundingClientRect().width : 0;
    const threshold = gridWidth * 0.6;

    const results = items.map((el) => {
      const w = el.getBoundingClientRect().width;
      const actual = w >= threshold ? 'row' : 'cell';
      const row = {
        test: el.getAttribute('data-test'),
        expect: el.getAttribute('data-expect'),
        actual,
        width: Math.round(w),
      };
      // Lockup results must stack (thumbnail over text), not sit side-by-side.
      if (el.tagName.toLowerCase() === 'yt-lockup-view-model' && row.expect === 'cell') {
        const h = el.querySelector('.ytLockupViewModelHorizontal');
        row.stacked = h ? getComputedStyle(h).flexDirection === 'column' : null;
      }
      return row;
    });
    return { gridFound: !!grid, gridWidth: Math.round(gridWidth), results };
  });
}

async function measureColumns(page, widthPx) {
  await page.evaluate((w) => {
    document.documentElement.style.setProperty('--yt-grid-card-width', w + 'px');
  }, widthPx);
  return page.evaluate(() => {
    const cells = [...document.querySelectorAll('[data-expect="cell"]')];
    const lefts = new Set(cells.map((c) => Math.round(c.getBoundingClientRect().left)));
    return lefts.size; // distinct left offsets == columns in use
  });
}

async function main() {
  const { chromium } = resolvePlaywright();
  const browser = await chromium.launch({ headless: true, executablePath: CHROME });
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();

  const failures = [];
  let checks = 0;

  for (const file of ['signed-out.html', 'signed-in.html']) {
    const { gridFound, gridWidth, results } = await checkFixture(page, file);
    console.log(`\n${file}  (grid ${gridFound ? gridWidth + 'px' : 'NOT FOUND'})`);
    if (!gridFound) failures.push(`${file}: no display:grid container found`);

    for (const r of results) {
      checks++;
      const ok = r.actual === r.expect;
      const stackNote =
        r.stacked === undefined ? '' : r.stacked ? '  stacked✓' : '  NOT-STACKED✗';
      console.log(
        `  ${ok ? 'PASS' : 'FAIL'}  ${r.test.padEnd(18)} expect ${r.expect.padEnd(4)} ` +
        `got ${r.actual.padEnd(4)} (${r.width}px)${stackNote}`
      );
      if (!ok) failures.push(`${file}: ${r.test} expected ${r.expect}, got ${r.actual}`);
      if (r.stacked === false) {
        checks++;
        failures.push(`${file}: ${r.test} lockup did not stack vertically`);
      }
    }

    // The grid must reflow: narrower cards => more columns. Use a wide vs
    // narrow setting far enough apart that the fixture's handful of cells
    // shows the change (at 1000px: 500px cards => 1 col, 150px => many).
    await checkFixture(page, file); // reset CSS var to default via re-inject
    const colsWide = await measureColumns(page, 500);
    const colsNarrow = await measureColumns(page, 150);
    checks++;
    const reflowOk = colsNarrow > colsWide;
    console.log(
      `  ${reflowOk ? 'PASS' : 'FAIL'}  reflow             500px=${colsWide}col 150px=${colsNarrow}col`
    );
    if (!reflowOk) failures.push(`${file}: grid did not add columns as cards narrow (${colsWide} -> ${colsNarrow})`);
  }

  await browser.close();

  console.log(`\n${checks - failures.length}/${checks} checks passed.`);
  if (failures.length) {
    console.error('\nFAILURES:');
    for (const f of failures) console.error('  - ' + f);
    process.exit(1);
  }
  console.log('All checks passed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
