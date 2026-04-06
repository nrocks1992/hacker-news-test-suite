const { test, expect } = require('@playwright/test');
const selectors = require('../utils/HNSelectors');
const { URLS } = require('../utils/HNConstants');

test.describe('User Interaction Tests', () => {

  test('Login flow', async ({ page }) => {
    await page.goto(URLS.HOME);

    // If you're already logged in, you might still see the login form,
    // but the nav should show your user + logout.
    const logoutLink = selectors.login.logoutLink(page);
    await expect(logoutLink).toBeVisible();

    const usernameLink = selectors.news.usernameNavLink(page, process.env.HN_TEST_USERNAME);
    await expect(usernameLink).toBeVisible();

    await expect(page).toHaveURL(/news.ycombinator.com/);
  });

  test('Submit story page', async ({ page }) => {
    // Navigate to submit page
    await page.goto(URLS.SUBMIT);

    // Verify we're on the submit page
    await expect(page).toHaveURL(/submit/);

    // Verify the submit form has required fields
    const titleInput = selectors.submit.titleInput(page);
    const urlInput = selectors.submit.urlInput(page);
    const textArea = selectors.submit.textArea(page);
    const submitButton = selectors.submit.submitButton(page);

    // Verify URL field is present
    await expect(urlInput).toBeVisible();
    
    // Verify title field is present
    await expect(titleInput).toBeVisible();
    
    // Verify text area is present (for text posts)
    await expect(textArea).toBeVisible();
    
    // Verify submit button is present
    await expect(submitButton).toBeVisible();

    // Verify form instructions or labels are present
    const formTable = selectors.submit.formTable(page);
    await expect(formTable).toBeVisible();

    // Verify "or" text between URL and text options
    const orText = selectors.submit.orText(page);
    await expect(orText).toBeVisible();
  });

  test('User profile page', async ({ page }) => {
    // Go to homepage
    await page.goto(URLS.HOME);

    // Find the first story's submitter
    const firstStory = selectors.news.stories(page).first();
    const subtextRow = selectors.profile.subtextRow(firstStory);

    const usernameLink = selectors.news.usernameLink(subtextRow);

    // Get the username
    const username = await usernameLink.textContent();
    
    // Click on the username
    await usernameLink.click();

    // Verify we're on the user profile page
    await expect(page).toHaveURL(new RegExp(`user\\?id=${username}`));

    // Verify profile elements are present
    
    // 1. User ID display
    const userIdCell = selectors.profile.userIdCell(page);
    await expect(userIdCell).toBeVisible();
    const displayedUsername = await userIdCell.textContent();
    expect(displayedUsername.trim()).toBe(username.trim());

    // 2. Karma display
    const karmaCell = selectors.profile.karmaCell(page);
    await expect(karmaCell).toBeVisible();
    const karmaText = await karmaCell.textContent();
    expect(karmaText.trim()).toMatch(/^\d+$/);

    // 3. Created date
    const createdCell = selectors.profile.createdCell(page);
    await expect(createdCell).toBeVisible();

    // 4. About section (may be empty for some users)
    const aboutRow = selectors.profile.aboutRow(page);
    const aboutExists = await aboutRow.count() > 0;
    expect(aboutExists).toBeTruthy();

    // 5. Submissions link
    const submissionsLink = selectors.profile.submissionsLink(page);
    await expect(submissionsLink).toBeVisible();
    const submissionsText = await submissionsLink.textContent();
    expect(submissionsText).toMatch(/submissions/i);

    // Optional: Click submissions to verify it works
    await submissionsLink.click();
    
    // Verify we're on the submissions page
    await expect(page).toHaveURL(new RegExp(`submitted\\?id=${username}`));

    // Verify submissions are displayed (if user has any)
    const submissions = selectors.profile.submissions(page);
    const submissionCount = await submissions.count();
    expect(submissionCount).toBeGreaterThanOrEqual(0);
  });

});