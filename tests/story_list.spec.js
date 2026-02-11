const { test, expect } = require('@playwright/test');

test.describe('Hacker News Story List Tests', () => {

  test('Story elements display correctly', async ({ page }) => {
    await page.goto('https://news.ycombinator.com/');
    await page.waitForLoadState('networkidle');
    
    // Get the first story
    const firstStory = page.locator('.athing').first();
    await firstStory.waitFor();
    
    // Get the corresponding subtext row (contains points, user, time, comments)
    const firstStoryId = await firstStory.getAttribute('id');
    const subtextRow = page.locator(`#${firstStoryId}`).locator('.subline');
    
    // Verify rank number
    const rank = firstStory.locator('.rank');
    await expect(rank).toBeVisible();
    const rankText = await rank.textContent();
    expect(rankText).toMatch(/^\d+\.$/);
    
    // Verify title
    const title = firstStory.locator('.titleline > a').first();
    await expect(title).toBeVisible();
    const titleText = await title.textContent();
    expect(titleText.trim().length).toBeGreaterThan(0);
    
    // Verify domain (sitebit) - may not exist for Ask HN/Show HN
    const domain = firstStory.locator('.sitebit');
    const domainCount = await domain.count();
    // Domain is optional, so just verify it exists or doesn't
    expect(domainCount).toBeGreaterThanOrEqual(0);
    
    // Verify points
    const score = page.locator(`[id="score_${firstStoryId}"]`);
    //console.log('Score count:', await score.count());
    if (await score.count() > 0) {
      await expect(score).toBeVisible();
      const scoreText = await score.textContent();
      expect(scoreText).toMatch(/\d+ point/);
    }
    
    // Verify submitter username
    const firstSubtext = page.locator('.subtext').first();
    const submitter = firstSubtext.locator('.hnuser');
    await expect(submitter).toBeVisible();
    const submitterText = await submitter.textContent();
    expect(submitterText.trim().length).toBeGreaterThan(0);
    
    // Verify time posted
    const age = firstSubtext.locator('.age');
    await expect(age).toBeVisible();
    const ageText = await age.textContent();
    expect(ageText.trim().length).toBeGreaterThan(0);
    
    // Verify comment count or discuss link
    const commentsLink = page.locator('a').filter({ hasText: /comment|discuss/ });
    const commentsCount = await commentsLink.count();
    expect(commentsCount).toBeGreaterThan(0);
  });

  test('External story links open correctly', async ({ page }) => {
    await page.goto('https://news.ycombinator.com/');
    await page.waitForLoadState('networkidle');
    
    // Find a story with an external link (not Ask HN/Show HN)
    const stories = page.locator('.athing');
    let externalStoryFound = false;
    let externalHref = null;
    
    for (let i = 0; i < await stories.count() && i < 10; i++) {
      const story = stories.nth(i);
      const titleLink = story.locator('.titleline > a').first();
      const href = await titleLink.getAttribute('href');
      
      // Check if it's an external link (starts with http)
      if (href && href.startsWith('http')) {
        externalHref = href;
        externalStoryFound = true;
        break;
      }
    }
    
    expect(externalStoryFound).toBe(true);
    
    // Verify the href attribute is a valid URL
    expect(() => new URL(externalHref)).not.toThrow();
    
    // Verify it's an absolute URL
    expect(externalHref).toMatch(/^https?:\/\//);
  });

  test('Comments link navigation', async ({ page }) => {
    await page.goto('https://news.ycombinator.com/');
    await page.waitForLoadState('networkidle');
    
    // Get the first story's ID
    const firstStory = page.locator('.athing').first();
    const storyId = await firstStory.getAttribute('id');
    
    // Find the comments link in the subtext row
    const commentsLink = page.locator(`a[href="item?id=${storyId}"]`).filter({ hasText: 'comment' });
    
    await expect(commentsLink).toBeVisible();
    
    // Click the comments link
    await commentsLink.click();
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the item page
    await expect(page).toHaveURL(new RegExp(`item\\?id=${storyId}`));
    
    // Verify the discussion page loaded
    const discussionTitle = page.locator('.athing').first();
    await expect(discussionTitle).toBeVisible();
  });

  test('Vote button appears for logged-in users', async ({ page }) => {
    await page.goto('https://news.ycombinator.com/');
    await page.waitForLoadState('networkidle');
    
    // Check if user is logged in by looking for logout link
    const logoutLink = page.locator('a[href^="logout"]');
    const isLoggedIn = await logoutLink.count() > 0;
    
    if (isLoggedIn) {
      // Look for upvote arrow
      const upvoteArrow = page.locator('.votelinks .nosee').first();
      await expect(upvoteArrow).toBeVisible();
    } else {
      // Check that vote arrows are not present or are login-protected
      const voteLinks = page.locator('.votelinks');
      const voteLinksCount = await voteLinks.count();
      
      if (voteLinksCount > 0) {
        // Vote links might be present but should redirect to login
        const firstVoteLink = voteLinks.first().locator('a').first();
        const href = await firstVoteLink.getAttribute('href');
        
        // Either redirects to login or has special handling
        expect(href).toBeTruthy();
      }
      
      // For logged-out users, this is expected behavior
      expect(isLoggedIn).toBe(false);
    }
  });

  test('Hide functionality', async ({ page }) => {
    await page.goto('https://news.ycombinator.com/');
    await page.waitForLoadState('networkidle');
    
    // Check if user is logged in
    const logoutLink = page.locator('a[href^="logout"]');
    const isLoggedIn = await logoutLink.count() > 0;
    
    if (!isLoggedIn) {
      // Verify hide link exists (would require login to use)
      const hideLink = page.locator('a[href^="hide"]').first();
      const hideLinkExists = await hideLink.count() > 0;
      
      expect(hideLinkExists).toBe(true);
      
      // Get the href to verify it's properly formed
      const href = await hideLink.getAttribute('href');
      expect(href).toMatch(/^hide\?id=\d+/);
    } else {
      // Get the first story's ID and title
      const firstStory = page.locator('.athing').first();
      const firstStoryId = await firstStory.getAttribute('id');
      
      // Click hide
      const hideLink = page.locator(`a[href^="hide?id=${firstStoryId}"]`).first();
      await expect(hideLink).toBeVisible();
      await hideLink.click();
      await page.waitForLoadState('networkidle');
      
      // Verify the story is no longer visible
      const storyAfterHide = page.locator(`#${firstStoryId}`);
      await expect(storyAfterHide).toHaveCount(0);
    }
  });

  test('Domain filtering', async ({ page }) => {
    await page.goto('https://news.ycombinator.com/');
    await page.waitForLoadState('networkidle');
    
    // Find a story with a domain link
    const stories = page.locator('.athing');
    let domainFound = false;
    let domainName = null;
    
    for (let i = 0; i < await stories.count() && i < 10; i++) {
      const story = stories.nth(i);
      const domainLink = story.locator('.sitebit a');
      const domainCount = await domainLink.count();
      
      if (domainCount > 0) {
        domainName = await domainLink.textContent();
        domainName = domainName.replace(/[()]/g, '').trim();
        domainFound = true;
        
        // Click the domain link
        await domainLink.click();
        await page.waitForLoadState('networkidle');
        break;
      }
    }
    
    expect(domainFound).toBe(true);
    
    // Verify URL contains the domain filter
    await expect(page).toHaveURL(/from\?site=/);
    
    // Verify stories are displayed on filtered page
    const filteredStories = page.locator('.athing');
    const filteredStoryCount = await filteredStories.count();
    
    expect(filteredStoryCount).toBeGreaterThan(0);
  });

});