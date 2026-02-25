// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { test, expect } = require('@playwright/test');
const { parseHNTimestamp } = require('../utils/timestampParser');

// Number of articles we want to validate.
// Change this value to validate 25, 50, 200, etc.
const ARTICLE_COUNT = 100;

// Safety guard to prevent infinite pagination loops
// If the site structure changes, this prevents runaway tests.
const MAX_PAGES = 10;

test.describe('Hacker News - Newest Sorting', () => {

  test(`First ${ARTICLE_COUNT} articles are sorted newest → oldest`, async ({ page }) => {

    // Navigate to the "newest" page of Hacker News
    await page.goto('https://news.ycombinator.com/newest', {
      waitUntil: 'domcontentloaded'
    });

    // This will accumulate articles across pagination
    let collectedArticles = [];

    // Track pagination depth for safety
    let pagesVisited = 0;

    /**
     * PAGINATION LOOP
     *
     * Continue clicking "More" until we have collected
     * at least ARTICLE_COUNT articles.
     */
    while (collectedArticles.length < ARTICLE_COUNT) {
      pagesVisited++;

      // Guard against infinite loops
      expect(
        pagesVisited,
        `Exceeded MAX_PAGES=${MAX_PAGES}. Possible pagination loop.`
      ).toBeLessThanOrEqual(MAX_PAGES);

      /**
       * Capture the ID of the first article before clicking "More".
       * We'll use this to detect when the page has changed.
       */
      const previousFirstId = await page.evaluate(() => {
        const first = document.querySelector('tr.athing');
        return first ? first.getAttribute('id') : null;
      });

      /**
       * Extract visible articles from the current page.
       *
       * Hacker News structure:
       * - Each article row has class "athing"
       * - The next row contains metadata including timestamp
       */
      const pageArticles = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('tr.athing'));

        return rows.map(row => {
          const id = row.getAttribute('id') || null;
          const title = row.querySelector('.titleline a')?.innerText || '';

          // Metadata row (contains timestamp)
          const subRow = row.nextElementSibling;

          // Timestamp is usually stored on span.age
          const ageSpan = subRow?.querySelector('.age') || null;
          const ageLink = subRow?.querySelector('.age a') || null;

          // Extract title attribute containing timestamp data
          const isoTimestamp =
            ageSpan?.getAttribute('title') ||
            ageLink?.getAttribute('title') ||
            null;

          return { id, title, isoTimestamp };
        });
      });

      // Sanity check: ensure articles were found
      expect(pageArticles.length, 'No articles found on page.')
        .toBeGreaterThan(0);

      // Append results to master list
      collectedArticles.push(...pageArticles);

      // Stop paginating if we have enough
      if (collectedArticles.length >= ARTICLE_COUNT) break;

      /**
       * Click "More" to load the next page.
       * Use locator-based visibility check to ensure stability.
       */
      const moreLink = page.locator('a.morelink');
      await expect(moreLink,
        'More link missing before reaching target count.'
      ).toBeVisible();

      await moreLink.click();

      /**
       * Wait until the first article ID changes,
       * which confirms navigation completed.
       */
      await page.waitForFunction(
        (prevId) => {
          const first = document.querySelector('tr.athing');
          const currentId = first ? first.getAttribute('id') : null;
          return currentId && currentId !== prevId;
        },
        previousFirstId,
        { timeout: 15000 }
      );
    }

    // Ensure we collected at least the requested number
    expect(
      collectedArticles.length,
      `Only collected ${collectedArticles.length} articles.`
    ).toBeGreaterThanOrEqual(ARTICLE_COUNT);

    // Slice exactly the number we want to validate
    const articlesToValidate =
      collectedArticles.slice(0, ARTICLE_COUNT);

    /**
     * Convert raw timestamp strings into numeric millisecond values.
     * These numbers are directly comparable for sorting validation.
     */
    const timestamps = articlesToValidate.map(article =>
      parseHNTimestamp(article.isoTimestamp)
    );

    //INTENTIONAL FAILURE (for testing only)
    //timestamps[5] = timestamps[0] + 999999999;

    /**
     * SORT VALIDATION STEP
     *
     * Confirm that each article is newer than or equal to
     * the article immediately after it.
     *
     * We allow equality because multiple posts may share
     * the same second-level timestamp.
     */
    await test.step(
      `Validate order for first ${ARTICLE_COUNT} articles`,
      async () => {
        for (let i = 0; i < timestamps.length - 1; i++) {

          if (timestamps[i] < timestamps[i + 1]) {

            // Attach structured debugging info if failure occurs
            await test.info().attach('sorting-error', {
              body: Buffer.from(JSON.stringify({
                index: i,
                current: articlesToValidate[i],
                next: articlesToValidate[i + 1],
                currentMs: timestamps[i],
                nextMs: timestamps[i + 1],
              }, null, 2)),
              contentType: 'application/json',
            });

            throw new Error(
              `Sorting failed at ${i} → ${i + 1}:\n` +
              `"${articlesToValidate[i].title}" (${articlesToValidate[i].isoTimestamp}) is older than\n` +
              `"${articlesToValidate[i + 1].title}" (${articlesToValidate[i + 1].isoTimestamp})`
            );
          }
        }
      }
    );

    /**
     * Optional summary attachment.
     * Makes successful runs clearer in HTML report.
     */
    await test.info().attach('summary', {
      body: Buffer.from(
        `PASS: First ${ARTICLE_COUNT} articles are sorted newest → oldest.`
      ),
      contentType: 'text/plain',
    });

  });
});