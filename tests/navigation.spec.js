const { test, expect } = require('@playwright/test');

test.describe('Hacker News Tests', () => {
  
  test('Homepage loads successfully', async ({ page }) => {
    // Navigate to Hacker News homepage
    await page.goto('https://news.ycombinator.com/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Verify the logo is present
    const logo = page.locator('a[href="news"]').first();
    await expect(logo).toBeVisible();
    await expect(logo).toHaveText('Hacker News');
    
    // Verify all navigation links are present and visible
    const navLinks = [
      { text: 'new', href: 'newest' },
      { text: 'past', href: 'front' },
      { text: 'comments', href: 'newcomments' },
      { text: 'ask', href: 'ask' },
      { text: 'show', href: 'show' },
      { text: 'jobs', href: 'jobs' },
      { text: 'submit', href: 'submit' }
    ];
    
    for (const link of navLinks) {
      const navLink = page.locator(`a[href="${link.href}"]`).first();
      await expect(navLink).toBeVisible();
      await expect(navLink).toHaveText(link.text);
    }
    
    // Verify 30 stories are displayed
    const stories = page.locator('.athing');
    const storyCount = await stories.count();
    expect(storyCount).toBe(30);
    
    // Verify first story has expected elements
    const firstStory = stories.first();
    await expect(firstStory.locator('.rank')).toBeVisible();
    await expect(firstStory.locator('.titleline > a').first()).toBeVisible();
  });

  test('Navigation links work', async ({ page }) => {
    // Navigate to homepage
    await page.goto('https://news.ycombinator.com/');
    await page.waitForLoadState('networkidle');
    
    // Test each navigation link
    const navLinks = [
      { text: 'new', href: 'newest', expectedUrl: /newest$/ },
      { text: 'past', href: 'front', expectedUrl: /front$/ },
      { text: 'comments', href: 'newcomments', expectedUrl: /newcomments$/ },
      { text: 'ask', href: 'ask', expectedUrl: /ask$/ },
      { text: 'show', href: 'show', expectedUrl: /show$/ },
      { text: 'jobs', href: 'jobs', expectedUrl: /jobs$/ }
    ];
    
    for (const link of navLinks) {
      // Click the navigation link
      await page.locator(`a[href="${link.href}"]`).first().click();
      
      // Wait for navigation
      await page.waitForLoadState('networkidle');
      
      // Verify URL changed to expected page
      await expect(page).toHaveURL(link.expectedUrl);
      
      // Navigate back to homepage for next test
      await page.goto('https://news.ycombinator.com/');
      await page.waitForLoadState('networkidle');
    }
  });

  test('Pagination works', async ({ page }) => {
    // Navigate to homepage
    await page.goto('https://news.ycombinator.com/');
    await page.waitForLoadState('networkidle');
    
    // Get the first story title on page 1 for comparison
    const firstStoryPage1 = await page.locator('.athing').first().locator('.titleline > a').first().textContent();
    
    // Click "More" link at the bottom
    const moreLink = page.locator('a.morelink').first();
    await expect(moreLink).toBeVisible();
    await expect(moreLink).toHaveText('More');
    await moreLink.click();
    
    // Wait for page 2 to load
    await page.waitForLoadState('networkidle');
    
    // Verify URL changed to page 2
    await expect(page).toHaveURL(/\?p=2$/);
    
    // Verify stories are loaded on page 2
    const storiesPage2 = page.locator('.athing');
    const storyCountPage2 = await storiesPage2.count();
    expect(storyCountPage2).toBeGreaterThan(0);
    
    // Get the first story title on page 2
    const firstStoryPage2 = await storiesPage2.first().locator('.titleline > a').first().textContent();
    
    // Verify the stories are different between page 1 and page 2
    expect(firstStoryPage1).not.toBe(firstStoryPage2);
  });

  test('Logo click returns to homepage', async ({ page }) => {
    // Start at a different page (e.g., "newest")
    await page.goto('https://news.ycombinator.com/newest');
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the "newest" page
    await expect(page).toHaveURL(/newest$/);
    
    // Click the "Hacker News" logo
    const logo = page.locator('a[href="news"]').first();
    await expect(logo).toBeVisible();
    await logo.click();
    
    // Wait for navigation
    await page.waitForLoadState('networkidle');
    
    // Verify we're back on the homepage
    await expect(page).toHaveURL(/news.ycombinator.com\/news\/?$/);
    
    // Verify homepage content is displayed (30 stories)
    const stories = page.locator('.athing');
    const storyCount = await stories.count();
    expect(storyCount).toBe(30);
    
    // Test from another page (jobs)
    await page.goto('https://news.ycombinator.com/jobs');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/jobs$/);
    
    // Click logo again
    await logo.click();
    await page.waitForLoadState('networkidle');
    
    // Verify back on homepage
    await expect(page).toHaveURL(/news.ycombinator.com\/news\/?$/);
  });

});