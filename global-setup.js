// global-setup.js
const { chromium } = require('@playwright/test');
const selectors = require('./utils/HNSelectors');
const methods = require('./utils/HNMethods');
require('dotenv').config();

module.exports = async () => {
  if (!process.env.HN_TEST_USERNAME || !process.env.HN_TEST_PASSWORD) {
    throw new Error('HN_TEST_USERNAME and HN_TEST_PASSWORD must be set in your environment/.env');
  }

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Login once
  methods.login(page, process.env.HN_TEST_USERNAME, process.env.HN_TEST_PASSWORD);

  // Verify logged in (keep it simple + robust)
  await page.waitForSelector('a[href^="logout"]');

  // Save auth state
  await context.storageState({ path: '.auth/storageState.json' });

  await browser.close();
};