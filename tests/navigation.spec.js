const { test, expect } = require('@playwright/test');
const selectors = require('../utils/HNSelectors');
const { navLinks , URLS } = require('../utils/HNConstants');

test.use({ storageState: { cookies: [], origins: [] } });
test.describe('Hacker News Navigation Tests', () => {
  
  test('Homepage loads successfully', async ({ page }) => {
    // Navigate to Hacker News homepage
    await page.goto(URLS.HOME);
    
    // Verify the logo is present
    const logo = selectors.news.logo(page);
    await expect(logo).toBeVisible();
    await expect(logo).toHaveText('Hacker News');
    
    // Verify all navigation links are present and visible
    for (const link of navLinks) {
      const navLink = selectors.news.navLink(page, link.href).first();
      await expect(navLink).toBeVisible();
      await expect(navLink).toHaveText(link.text);
    }
    
    // Verify 30 stories are displayed
    const stories = selectors.news.stories(page);
    const storyCount = await stories.count();
    expect(storyCount).toBe(30);
    
    // Verify first story has expected elements
    const firstStory = selectors.news.stories(page).first();
    await expect(selectors.stories.storyRank(firstStory)).toBeVisible();
    await expect(selectors.stories.storyTitle(firstStory)).toBeVisible();
  });

  test('Navigation links work', async ({ page }) => {
    // Navigate to homepage
    await page.goto(URLS.HOME);
    
    // Test each navigation link
    for (const link of navLinks) {
      // Click the navigation link
      await selectors.news.navLink(page, link.href).first().click();
      
      // Verify URL changed to expected page
      await expect(page).toHaveURL(link.expectedUrl);
      
      // Navigate back to homepage for next test
      await page.goto(URLS.HOME);
    }
  });

  test('Pagination works', async ({ page }) => {
    // Navigate to homepage
    await page.goto(URLS.HOME);
    
    // Get the first story title on page 1 for comparison
    const firstStory = selectors.news.stories(page).first();
    const storyTitle = selectors.stories.storyTitle(firstStory).first();
    const firstStoryPage1 = await storyTitle.textContent();
    
    // Click "More" link at the bottom
    const moreLink = selectors.news.moreLink(page).first();
    await expect(moreLink).toBeVisible();
    await expect(moreLink).toHaveText('More');
    await moreLink.click();
    
    // Verify URL changed to page 2
    await expect(page).toHaveURL(/\?p=2$/);
    
    // Verify stories are loaded on page 2
    const storiesPage2 = selectors.news.stories(page).first();
    const storyCountPage2 = await storiesPage2.count();
    expect(storyCountPage2).toBeGreaterThan(0);
    
    // Get the first story title on page 2
    const firstStoryPage2 = await selectors.stories.storyTitle(storiesPage2).textContent();
    
    // Verify the stories are different between page 1 and page 2
    expect(firstStoryPage1).not.toBe(firstStoryPage2);
  });

  test('Logo click returns to homepage', async ({ page }) => {
    // Start at a different page (e.g., "newest")
    await page.goto(URLS.NEW);
    
    // Verify we're on the "newest" page
    await expect(page).toHaveURL(/newest$/);
    
    // Click the "Hacker News" logo
    const logo = selectors.news.logo(page);
    await expect(logo).toBeVisible();
    await logo.click();
    
    // Verify we're back on the homepage
    await expect(page).toHaveURL(/news.ycombinator.com\/news\/?$/);
    
    // Verify homepage content is displayed (30 stories)
    const stories = selectors.news.stories(page);
    const storyCount = await stories.count();
    expect(storyCount).toBe(30);
    
    // Test from another page (jobs)
    await page.goto(URLS.JOBS);
    await expect(page).toHaveURL(/jobs$/);
    
    // Click logo again
    await logo.click();
    
    // Verify back on homepage
    await expect(page).toHaveURL(/news.ycombinator.com\/news\/?$/);
  });

});