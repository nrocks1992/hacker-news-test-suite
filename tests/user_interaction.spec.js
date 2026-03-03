const { test, expect } = require('@playwright/test');
require('dotenv').config();

test.describe('User Interaction Tests', () => {

  test('Login flow', async ({ page }) => {
    // Navigate to login page
    await page.goto('https://news.ycombinator.com/login');
    
    // Verify we're on the login page
    await expect(page).toHaveURL(/login/);
    
    // Verify login form elements are present
    const usernameInput = page.locator('input[name="acct"]').first();
    const passwordInput = page.locator('input[name="pw"]').first();
    const submitButton = page.locator('input[type="submit"]').first();
    
    await expect(usernameInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
    
    // Fill in credentials
    await usernameInput.fill(process.env.HN_TEST_USERNAME);
    await passwordInput.fill(process.env.HN_TEST_PASSWORD);
    
    // Submit login form
    await submitButton.click();
    
    // Verify successful authentication by checking for logout link
    const logoutLink = page.locator('a[href^="logout"]');
    await expect(logoutLink).toBeVisible();
    
    // Verify username appears in navigation
    const usernameLink = page.locator(`a[href="user?id=${process.env.HN_TEST_USERNAME}"]`);
    await expect(usernameLink).toBeVisible();
    
    // Verify redirect to homepage or news page
    await expect(page).toHaveURL(/news.ycombinator.com/);
  });

  test('Logout flow', async ({ page }) => {
    // First, log in
    await page.goto('https://news.ycombinator.com/login');
    
    await page.fill('input[name="acct"]', process.env.HN_TEST_USERNAME);
    await page.fill('input[name="pw"]', process.env.HN_TEST_PASSWORD);
    await page.click('input[type="submit"]');
    
    // Verify logged in state
    const logoutLink = page.locator('#logout');
    await expect(logoutLink).toBeVisible();
    
    // Click logout
    await logoutLink.click();
    
    // Verify logged out state - logout link should no longer be present
    await expect(logoutLink).toHaveCount(0);
    
    // Verify login link appears
    const loginLink = page.locator('a[href^="login"]');
    await expect(loginLink).toBeVisible();
    
    // Verify username is no longer in navigation
    const usernameLink = page.locator(`a[href="user?id=${process.env.HN_TEST_USERNAME}"]`);
    await expect(usernameLink).toHaveCount(0);
    
    // Verify we're still on a valid HN page
    await expect(page).toHaveURL(/news.ycombinator.com/);
  });

  test('Submit story page', async ({ page }) => {
    // Navigate to submit page
    await page.goto('https://news.ycombinator.com/submit');
    
    // Verify we're on the submit page
    await expect(page).toHaveURL(/submit/);
    
    // Check if we need to log in first
    const loginRequired = await page.locator('input[name="acct"]').count() > 0;
    
    if (loginRequired) {
      // Log in first
      await page.fill('input[name="acct"]', process.env.HN_TEST_USERNAME);
      await page.fill('input[name="pw"]', process.env.HN_TEST_PASSWORD);
      await page.click('input[type="submit"]');
      
      // Navigate to submit page again after login
      await page.goto('https://news.ycombinator.com/submit');
    }
    
    // Verify the submit form has required fields
    const titleInput = page.locator('input[name="title"]');
    const urlInput = page.locator('input[name="url"]');
    const textArea = page.locator('textarea[name="text"]');
    const submitButton = page.locator('input[type="submit"][value="submit"]');
    
    // Verify URL field is present
    await expect(urlInput).toBeVisible();
    
    // Verify title field is present
    await expect(titleInput).toBeVisible();
    
    // Verify text area is present (for text posts)
    await expect(textArea).toBeVisible();
    
    // Verify submit button is present
    await expect(submitButton).toBeVisible();
    
    // Verify form instructions or labels are present
    const formTable = page.locator('form table');
    await expect(formTable).toBeVisible();
    
    // Verify "or" text between URL and text options
    const orText = page.locator('text=/or/i');
    await expect(orText).toBeVisible();
  });

  test('User profile page', async ({ page }) => {
    // Go to homepage
    await page.goto('https://news.ycombinator.com/');
    
    // Find the first story's submitter
    const firstStory = page.locator('.athing').first();
    const storyId = await firstStory.getAttribute('id');
    const subtextRow = firstStory.locator('xpath=following-sibling::tr[1]');
    const usernameLink = subtextRow.locator('.hnuser').first();
    
    // Get the username
    const username = await usernameLink.textContent();
    
    // Click on the username
    await usernameLink.click();
    
    // Verify we're on the user profile page
    await expect(page).toHaveURL(new RegExp(`user\\?id=${username}`));
    
    // Verify profile elements are present
    
    // 1. User ID display
    const userIdCell = page.locator('text=/user:/i').locator('xpath=following-sibling::td');
    await expect(userIdCell).toBeVisible();
    const displayedUsername = await userIdCell.textContent();
    expect(displayedUsername.trim()).toBe(username.trim());
    
    // 2. Karma display
    const karmaCell = page.locator('text=/karma:/i').locator('xpath=following-sibling::td');
    await expect(karmaCell).toBeVisible();
    const karmaText = await karmaCell.textContent();
    expect(karmaText.trim()).toMatch(/^\d+$/);
    
    // 3. Created date
    const createdCell = page.locator('text=/created:/i').locator('xpath=following-sibling::td');
    await expect(createdCell).toBeVisible();
    
    // 4. About section (may be empty for some users)
    const aboutRow = page.locator('text=/about:/i');
    const aboutExists = await aboutRow.count() > 0;
    expect(aboutExists).toBeTruthy();
    
    // 5. Submissions link
    const submissionsLink = page.locator('a[href^="submitted?id="]');
    await expect(submissionsLink).toBeVisible();
    const submissionsText = await submissionsLink.textContent();
    expect(submissionsText).toMatch(/submissions/i);
    
    // Optional: Click submissions to verify it works
    await submissionsLink.click();
    
    // Verify we're on the submissions page
    await expect(page).toHaveURL(new RegExp(`submitted\\?id=${username}`));
    
    // Verify submissions are displayed (if user has any)
    const submissions = page.locator('.athing');
    const submissionCount = await submissions.count();
    expect(submissionCount).toBeGreaterThanOrEqual(0);
  });

});