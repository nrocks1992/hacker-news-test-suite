// user-interaction.logout.spec.js
const { test, expect } = require('@playwright/test');
const selectors = require('../utils/HNSelectors');
const methods = require('../utils/HNMethods');
require('dotenv').config();

test.describe('User Interaction Tests - Logout', () => {
  test('Logout flow', async ({ page }) => {
    // First, log in
    methods.login(page, process.env.HN_TEST_USERNAME, process.env.HN_TEST_PASSWORD);

    // Verify logged in state
    const logoutLink = selectors.login.logoutLink(page);
    await expect(logoutLink).toBeVisible();

    // Click logout
    await logoutLink.click();

    // Verify logged out state - logout link should no longer be present
    await expect(logoutLink).toHaveCount(0);

    // Verify login link appears
    const loginLink = selectors.login.loginLink(page);
    await expect(loginLink).toBeVisible();

    // Verify username is no longer in navigation
    const usernameLink = selectors.news.usernameNavLink(page, process.env.HN_TEST_USERNAME);
    await expect(usernameLink).toHaveCount(0);

    // Verify we're still on a valid HN page
    await expect(page).toHaveURL(/news.ycombinator.com/);
  });
});