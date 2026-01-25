// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { chromium } = require("playwright");

async function sortHackerNewsArticles(article_count) {
  // launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // go to Hacker News
  await page.goto("https://news.ycombinator.com/newest");

  let timestamps = [];

  while (timestamps.length < article_count) {
    // Extract timestamps using page.evaluate
    const pageTimestamps = await page.evaluate(() => {
      return Array.from(document.querySelectorAll(".age"))
        .map(el => el.getAttribute("title"));
    });

    timestamps.push(...pageTimestamps);

    if (timestamps.length < article_count) {
      // Click "More" safely from Node context
      await Promise.all([
        page.waitForNavigation(),
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

  console.log("✅ Success: The first "+article_count+" articles are sorted newest → oldest.");

  await browser.close();
}

(async () => {
  await sortHackerNewsArticles(100);
})();
