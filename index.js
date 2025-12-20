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
    // Extract timestamps on the current page
    const pageTimestamps = await page.$$eval(".age", els =>
      els.map(e => e.getAttribute("title"))
    );

    timestamps.push(...pageTimestamps);

    // If we still need more, click to next page
    if (timestamps.length < article_count) {
      const moreLink = await page.$("a.morelink");
      if (!moreLink) {
        throw new Error("Couldn't load enough articles (no more pages).");
      }
      await Promise.all([
        page.waitForNavigation(),
        moreLink.click()
      ]);
    }
  }

  // Keep only the first 100 timestamps
  timestamps = timestamps.slice(0, article_count);

  // Convert timestamps into comparable numbers (milliseconds)
  const times = timestamps.map(t => new Date(t).getTime());

  // Validate sorted newest → oldest (descending)
  for (let i = 0; i < times.length - 1; i++) {
    if (times[i] < times[i + 1]) {
      throw new Error(
        `Sorting error at article ${i} → ${i + 1}\n` +
        `${timestamps[i]} should be >= ${timestamps[i + 1]}`
      );
    }
  }

  console.log("✅ Success: The first "+article_count+" articles are sorted newest → oldest.");

  await browser.close();
}

(async () => {
  await sortHackerNewsArticles(100);
})();
