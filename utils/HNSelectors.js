module.exports = {
  login: {

    logoutLink: (page) => page.locator('a#logout'),
    loginLink: (page) => page.locator('a[href^="login"]'),
    
  },
  
  submit: {
    titleInput: (page) => page.locator('input[name="title"]'),
    urlInput: (page) => page.locator('input[name="url"]'),
    textArea: (page) => page.locator('textarea[name="text"]'),
    submitButton: (page) => page.locator('input[type="submit"][value="submit"]'),
    formTable: (page) => page.locator('form table'),
    orText: (page) => page.locator('text=/or/i')
  },
  
  profile: {
    subtextRow: (page) => page.locator('xpath=following-sibling::tr[1]'),
    userIdCell: (page) => page.locator('text=/user:/i').locator('xpath=following-sibling::td'),
    karmaCell: (page) => page.locator('text=/karma:/i').locator('xpath=following-sibling::td'),
    createdCell: (page) => page.locator('text=/created:/i').locator('xpath=following-sibling::td'),
    aboutRow: (page) => page.locator('text=/about:/i'),
    submissionsLink: (page) => page.locator('a[href^="submitted?id="]'),
    submissions: (page) => page.locator('.athing')
  },

  news:{
    usernameNavLink: (page, username) => page.locator(`a[href="user?id=${username}"]`),
    navLink: (page,href) => page.locator(`a[href="${href}"]`),
    logo: (page) => page.getByRole('link', { name: 'Hacker News' }),
    stories: (page) => page.locator('.athing'),
    subtextRow: (page, storyId) => page.locator(`#${storyId}`).locator('xpath=following-sibling::tr[1]'),
    usernameLink: (subtextRow) => subtextRow.locator('.hnuser'),
    moreLink: (page) => page.locator('a.morelink'),
  },

  stories: {
    storyID: (page) => page.getAttribute('id'),
    storyTitle: (page) => page.locator('.titleline > a').first(),
    storyRank: (page) => page.locator('.rank'),
    storySubtext: (page) => page.locator('.subtext'),
    storyScore: (page,storyId) => page.locator(`[id="score_${storyId}"]`),
    storyAge: (subtextRow) => subtextRow.locator('.age'),
    storyCommentsLink: (subtextRow) => subtextRow.locator('a').filter({ hasText: /comment|discuss/i }),
    idCommentsLink: (page, storyId) => page.locator(`a[href="item?id=${storyId}"]`).filter({ hasText: 'comments' }),
    hideLink: (page) => page.locator(`a[href^="hide"]`),
    hideLinkID: (storyId) => page.locator(`a[href^="hide?id=${storyId}"]`),
    domainLink: (page) => page.locator('.sitebit a'),
    voteLinks: (page) => page.locator('.votelink')
  }
};