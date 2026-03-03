// user-interaction.logout.spec.js
const { test, expect } = require('@playwright/test');
require('dotenv').config();

test.describe('User Interaction Tests - Logout', () => {
  test('Logout flow', async ({ page }) => {
    // First, log in
    await page.goto('https://news.ycombinator.com/login');

    await page.fill('input[name="acct"]', process.env.HN_TEST_USERNAME);
    await page.fill('input[name="pw"]', process.env.HN_TEST_PASSWORD);
    await page.click('input[type="submit"]');

    // Verify logged in state
    const logoutLink = page.locator('a#logout');
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
});