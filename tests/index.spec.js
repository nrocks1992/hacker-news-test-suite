// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
/*const { test, expect } = require('@playwright/test');

test.describe('QA Wolf Take Home Assignment', () => {
  test('Verify that the first 100 articles are sorted newest → oldest', async ({ page }) => { 
    await page.goto("https://news.ycombinator.com/newest");

    let timestamps = [];
    let article_count = 100;

    while (timestamps.length < article_count) {
      // Extract timestamps from the current page
      const pageTimestamps = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".age"))
          .map(el => el.getAttribute("title"));
      });

      timestamps.push(...pageTimestamps);

      if (timestamps.length < article_count) {
        // Click "More" safely from Node context
        await Promise.all([
          page.waitForLoadState('networkidle'),
          page.evaluate(() => {
            document.querySelector("a.morelink").click();
          })
        ]);
      }
    }

    timestamps = timestamps.slice(0, article_count);

    // Convert to milliseconds and validate order
    const times = timestamps.map(t => new Date(t).getTime());

    for (let i = 0; i < times.length - 1; i++) {
      if (times[i] < times[i + 1]) {
        throw new Error(
          `❌ Sorting error at index ${i} → ${i + 1}\n` +
          `${timestamps[i]} should be newer than ${timestamps[i + 1]}`
        );
      }
    }
  });
});
*/
const { test, expect } = require('@playwright/test');

const TARGET_COUNT = 100;
const MAX_PAGES = 5;

test.describe('Hacker News - Newest Sorting', () => {

  test('First 100 articles are sorted newest → oldest', async ({ page }) => {

    await page.goto('https://news.ycombinator.com/newest', {
      waitUntil: 'domcontentloaded'
    });

    await expect(page).toHaveURL(/newest/);

    let timestamps = [];
    let ids = [];
    let pagesVisited = 0;

    while (timestamps.length < TARGET_COUNT) {
      pagesVisited++;
      expect(pagesVisited).toBeLessThanOrEqual(MAX_PAGES);

      const pageData = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('tr.athing'));

        const timestamps = [];
        const ids = [];

        rows.forEach(row => {
          const id = row.getAttribute('id');
          const ageEl = row.nextElementSibling?.querySelector('.age');

          if (id && ageEl) {
            ids.push(id);
            timestamps.push(ageEl.getAttribute('title'));
          }
        });

        return { timestamps, ids };
      });

      expect(pageData.timestamps.length).toBeGreaterThan(0);

      timestamps.push(...pageData.timestamps);
      ids.push(...pageData.ids);

      if (timestamps.length >= TARGET_COUNT) break;

      const moreLink = page.locator('a.morelink');
      await expect(moreLink).toBeVisible();

      await Promise.all([
        page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
        moreLink.click()
      ]);
    }

    // Trim to exactly 100
    timestamps = timestamps.slice(0, TARGET_COUNT);
    ids = ids.slice(0, TARGET_COUNT);

    // Ensure exactly 100 collected
    expect(timestamps.length).toBe(TARGET_COUNT);

    // Ensure unique articles
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(TARGET_COUNT);

    // Parse timestamps safely
    const times = timestamps.map((t, i) => {
      const parsed = new Date(t).getTime();
      expect(Number.isNaN(parsed)).toBeFalsy();
      return parsed;
    });

    // Pairwise descending check (allow equality)
    for (let i = 0; i < times.length - 1; i++) {
      expect(times[i]).toBeGreaterThanOrEqual(times[i + 1]);
    }

    // Deterministic order validation
    const sortedCopy = [...times].sort((a, b) => b - a);
    expect(times).toEqual(sortedCopy);

  });

});

