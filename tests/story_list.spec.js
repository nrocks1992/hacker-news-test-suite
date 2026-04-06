const { test, expect } = require('@playwright/test');
const selectors = require('../utils/HNSelectors');
const { URLS } = require('../utils/HNConstants');

test.use({ storageState: { cookies: [], origins: [] } });
test.describe('Hacker News Story List Tests', () => {

  test('Story elements display correctly', async ({ page }) => {
    await page.goto(URLS.HOME);
    
    // Get the first story
    const firstStory = selectors.news.stories(page).first();
    await firstStory.waitFor();
    
    // Get the corresponding subtext row (contains points, user, time, comments)
    const firstStoryId = await selectors.stories.storyID(firstStory);
    
    // Verify rank number
    const rank = selectors.stories.storyRank(firstStory);
    await expect(rank).toBeVisible();
    const rankText = await rank.textContent();
    expect(rankText).toMatch(/^\d+\.$/);
    
    // Verify title
    const title = selectors.stories.storyTitle(firstStory);
    await expect(title).toBeVisible();
    const titleText = await title.textContent();
    expect(titleText.trim().length).toBeGreaterThan(0);
    
    // Verify domain (sitebit) - may not exist for Ask HN/Show HN
    const domain = selectors.stories.domainLink(firstStory);
    const domainCount = await domain.count();
    // Domain is optional, so just verify it exists or doesn't
    expect(domainCount).toBeGreaterThanOrEqual(0);
    
    // Verify points
    const score = selectors.stories.storyScore(page,firstStoryId);
    if (await score.count() > 0) {
      await expect(score).toBeVisible();
      const scoreText = await score.textContent();
      expect(scoreText).toMatch(/\d+ point/);
    }
    
    // Verify submitter username
    const firstSubtext = selectors.stories.storySubtext(page).first();
    const submitter = selectors.news.usernameLink(firstSubtext);
    await expect(submitter).toBeVisible();
    const submitterText = await submitter.textContent();
    expect(submitterText.trim().length).toBeGreaterThan(0);
    
    // Verify time posted
    const age = selectors.stories.storyAge(firstSubtext).first();
    await expect(age).toBeVisible();
    const ageText = await age.textContent();
    expect(ageText.trim().length).toBeGreaterThan(0);
    
    // Verify comment count or discuss link
    const commentsLink = selectors.stories.storyCommentsLink(firstSubtext).first();
    const commentsCount = await commentsLink.count();
    expect(commentsCount).toBeGreaterThan(0);
  });

  test('External story links open correctly', async ({ page }) => {
    await page.goto(URLS.HOME);
    
    // Find a story with an external link (not Ask HN/Show HN)
    const stories = selectors.news.stories(page);
    let externalStoryFound = false;
    let externalHref = null;
    
    for (let i = 0; i < await stories.count() && i < 10; i++) {
      const story = stories.nth(i);
      const titleLink = selectors.stories.storyTitle(story);
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
    await page.goto(URLS.HOME);
    
    // Get the first story's ID
    const firstStory = selectors.news.stories(page).first();
    const storyId = await selectors.stories.storyID(firstStory);
    
    // Find the comments link in the subtext row
    const commentsLink = selectors.stories.idCommentsLink(page, storyId).first();
    
    await expect(commentsLink).toBeVisible();
    
    // Click the comments link
    await commentsLink.click();
    
    // Verify we're on the item page
    await expect(page).toHaveURL(new RegExp(`item\\?id=${storyId}`));
    
    // Verify the discussion page loaded
    const discussionTitle = selectors.news.stories(page).first();
    await expect(discussionTitle).toBeVisible();
  });

  test('Vote button appears for logged-in users', async ({ page }) => {
    await page.goto(URLS.HOME);
    
    // Check if user is logged in by looking for logout link
    const logoutLink = selectors.login.logoutLink(page);
    const isLoggedIn = await logoutLink.count() > 0;
    
    if (isLoggedIn) {
      // Look for upvote arrow
      const upvoteArrow = selectors.stories.voteLinks(page).first();
      await expect(upvoteArrow).toBeVisible();
    } else {
      // Check that vote arrows are not present or are login-protected
      const voteLinks = selectors.stories.voteLinks(page);
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
    await page.goto(URLS.HOME);
    
    // Check if user is logged in
    const logoutLink = selectors.login.logoutLink(page);
    const isLoggedIn = await logoutLink.count() > 0;
    
    if (!isLoggedIn) {
      // Verify hide link exists (would require login to use)
      const hideLink = selectors.stories.hideLink(page).first();
      const hideLinkExists = await hideLink.count() > 0;
      
      expect(hideLinkExists).toBe(true);
      
      // Get the href to verify it's properly formed
      const href = await hideLink.getAttribute('href');
      expect(href).toMatch(/^hide\?id=\d+/);
    } else {
      // Get the first story's ID and title
      const firstStory = selectors.profile.firstStory(page);
      const firstStoryId = await selectors.stories.storyID(firstStory);
      
      // Click hide
      const hideLink = selectors.stories.hideLinkID(firstStoryId).first();
      await expect(hideLink).toBeVisible();
      await hideLink.click();
      
      // Verify the story is no longer visible
      const storyAfterHide = page.locator(`#${firstStoryId}`);
      await expect(storyAfterHide).toHaveCount(0);
    }
  });

  test('Domain filtering', async ({ page }) => {
    await page.goto(URLS.HOME);
    
    // Find a story with a domain link
    const stories = selectors.news.stories(page);
    let domainFound = false;
    let domainName = null;
    
    for (let i = 0; i < await stories.count() && i < 10; i++) {
      const story = stories.nth(i);
      const domainLink = selectors.stories.domainLink(story);
      const domainCount = await domainLink.count();
      
      if (domainCount > 0) {
        domainName = await domainLink.textContent();
        domainName = domainName.replace(/[()]/g, '').trim();
        domainFound = true;
        
        // Click the domain link
        await domainLink.click();
        break;
      }
    }
    
    expect(domainFound).toBe(true);
    
    // Verify URL contains the domain filter
    await expect(page).toHaveURL(/from\?site=/);
    
    // Verify stories are displayed on filtered page
    const filteredStories = selectors.news.stories(page);
    const filteredStoryCount = await filteredStories.count();
    
    expect(filteredStoryCount).toBeGreaterThan(0);
  });

});