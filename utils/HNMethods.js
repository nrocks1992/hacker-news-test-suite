const selectors = require('../utils/HNSelectors');
const { URLS } = require('../utils/HNConstants');

module.exports = {
    async login(page, username, password) {
        await page.goto(URLS.LOGIN);

        await page.fill('input[name="acct"]', username);
        await page.fill('input[name="pw"]', password);
        await page.click('input[type="submit"]');
    },
}