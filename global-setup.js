// global-setup.js
const { chromium } = require('@playwright/test');
require('dotenv').config();

module.exports = async () => {
  if (!process.env.HN_TEST_USERNAME || !process.env.HN_TEST_PASSWORD) {
    throw new Error('HN_TEST_USERNAME and HN_TEST_PASSWORD must be set in your environment/.env');
  }

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Login once
  await page.goto('https://news.ycombinator.com/login');

  await page.fill('input[name="acct"]', process.env.HN_TEST_USERNAME);
  await page.fill('input[name="pw"]', process.env.HN_TEST_PASSWORD);
  await page.click('input[type="submit"]');

  // Verify logged in (keep it simple + robust)
  await page.waitForSelector('a[href^="logout"]');

  // Save auth state
  await context.storageState({ path: '.auth/storageState.json' });

  await browser.close();
};