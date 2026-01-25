// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { test, expect } = require('@playwright/test');

test.describe('Hacker News Tests', () => {
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
