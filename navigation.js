const { chromium } = require('playwright');

async function testHomepageLoadsSuccessfully(page) {
  console.log('\n🧪 Test: Homepage loads successfully');
  
  await page.goto('https://news.ycombinator.com/');
  await page.waitForLoadState('networkidle');
  
  // Verify the logo
  const logo = page.locator('a[href="news"]').first();
  const logoVisible = await logo.isVisible();
  const logoText = await logo.textContent();
  
  if (!logoVisible || logoText !== 'Hacker News') {
    throw new Error('Logo not found or incorrect');
  }
  
  // Verify navigation links
  const navLinks = [
    { text: 'new', href: 'newest' },
    { text: 'past', href: 'front' },
    { text: 'comments', href: 'newcomments' },
    { text: 'ask', href: 'ask' },
    { text: 'show', href: 'show' },
    { text: 'jobs', href: 'jobs' },
    { text: 'submit', href: 'submit' }
  ];
  
  for (const link of navLinks) {
    const navLink = page.locator(`a[href="${link.href}"]`).first();
    const visible = await navLink.isVisible();
    const text = await navLink.textContent();
    
    if (!visible || text !== link.text) {
      throw new Error(`Navigation link "${link.text}" not found or incorrect`);
    }
  }
  
  // Verify 30 stories
  const stories = page.locator('.athing');
  const storyCount = await stories.count();
  
  if (storyCount !== 30) {
    throw new Error(`Expected 30 stories, found ${storyCount}`);
  }
  
  console.log('✅ PASSED: Homepage loads successfully with all elements');
}

async function testNavigationLinksWork(page) {
  console.log('\n🧪 Test: Navigation links work');
  
  const navLinks = [
    { text: 'new', href: 'newest', expectedUrl: 'newest' },
    { text: 'past', href: 'front', expectedUrl: 'front' },
    { text: 'comments', href: 'newcomments', expectedUrl: 'newcomments' },
    { text: 'ask', href: 'ask', expectedUrl: 'ask' },
    { text: 'show', href: 'show', expectedUrl: 'show' },
    { text: 'jobs', href: 'jobs', expectedUrl: 'jobs' }
  ];
  
  for (const link of navLinks) {
    await page.goto('https://news.ycombinator.com/');
    await page.waitForLoadState('networkidle');
    
    await page.locator(`a[href="${link.href}"]`).first().click();
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    if (!currentUrl.includes(link.expectedUrl)) {
      throw new Error(`Expected URL to contain "${link.expectedUrl}", got ${currentUrl}`);
    }
    
    console.log(`  ✓ ${link.text} link works`);
  }
  
  console.log('✅ PASSED: All navigation links work');
}

async function testPaginationWorks(page) {
  console.log('\n🧪 Test: Pagination works');
  
  await page.goto('https://news.ycombinator.com/');
  await page.waitForLoadState('networkidle');
  
  // Get first story on page 1
  const firstStoryPage1 = await page.locator('.athing').first().locator('.titleline > a').first().textContent();
  
  // Click More
  const moreLink = page.locator('a.morelink').first();
  const moreLinkVisible = await moreLink.isVisible();
  
  if (!moreLinkVisible) {
    throw new Error('More link not found');
  }
  
  await moreLink.click();
  await page.waitForLoadState('networkidle');
  
  // Verify URL
  const currentUrl = page.url();
  if (!currentUrl.includes('?p=2')) {
    throw new Error(`Expected URL to contain "?p=2", got ${currentUrl}`);
  }
  
  // Verify stories on page 2
  const storiesPage2 = page.locator('.athing');
  const storyCountPage2 = await storiesPage2.count();
  
  if (storyCountPage2 === 0) {
    throw new Error('No stories found on page 2');
  }
  
  const firstStoryPage2 = await storiesPage2.first().locator('.titleline > a').first().textContent();
  
  if (firstStoryPage1 === firstStoryPage2) {
    throw new Error('Stories on page 2 are the same as page 1');
  }
  
  console.log('✅ PASSED: Pagination works correctly');
}

async function testLogoClickReturnsToHomepage(page) {
  console.log('\n🧪 Test: Logo click returns to homepage');
  
  // Go to newest page
  await page.goto('https://news.ycombinator.com/newest');
  await page.waitForLoadState('networkidle');
  
  if (!page.url().includes('newest')) {
    throw new Error('Failed to navigate to newest page');
  }
  
  // Click logo
  const logo = page.locator('a[href="news"]').first();
  await logo.click();
  await page.waitForLoadState('networkidle');
  
  // Verify back on homepage
  const currentUrl = page.url();
  if (!currentUrl.match(/news\.ycombinator\.com\/news\/?$/)) {
    throw new Error(`Expected to be on homepage, got ${currentUrl}`);
  }
  
  // Verify 30 stories
  const stories = page.locator('.athing');
  const storyCount = await stories.count();
  
  if (storyCount !== 30) {
    throw new Error(`Expected 30 stories on homepage, found ${storyCount}`);
  }
  
  // Test from jobs page
  await page.goto('https://news.ycombinator.com/jobs');
  await page.waitForLoadState('networkidle');
  
  await logo.click();
  await page.waitForLoadState('networkidle');
  
  const finalUrl = page.url();
  if (!finalUrl.match(/news\.ycombinator\.com\/news\/?$/)) {
    throw new Error(`Expected to be on homepage after second click, got ${finalUrl}`);
  }
  
  console.log('✅ PASSED: Logo click returns to homepage');
}

async function runTests() {
  console.log('🚀 Starting Hacker News Tests\n');
  console.log('='.repeat(50));
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  let passed = 0;
  let failed = 0;
  const testResults = [];
  const startTime = new Date();
  
  const tests = [
    { name: 'Homepage loads successfully', fn: testHomepageLoadsSuccessfully },
    { name: 'Navigation links work', fn: testNavigationLinksWork },
    { name: 'Pagination works', fn: testPaginationWorks },
    { name: 'Logo click returns to homepage', fn: testLogoClickReturnsToHomepage }
  ];
  
  for (const test of tests) {
    const testStartTime = new Date();
    try {
      await test.fn(page);
      const duration = new Date() - testStartTime;
      testResults.push({
        name: test.name,
        status: 'passed',
        duration: duration,
        error: null
      });
      passed++;
    } catch (error) {
      const duration = new Date() - testStartTime;
      console.log(`❌ FAILED: ${error.message}`);
      testResults.push({
        name: test.name,
        status: 'failed',
        duration: duration,
        error: error.message
      });
      failed++;
    }
  }
  
  const endTime = new Date();
  const totalDuration = endTime - startTime;
  
  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed\n`);
  
  // Generate HTML report
  await generateHtmlReport(testResults, passed, failed, totalDuration, startTime);
  
  await browser.close();
  
  // Exit with error code if any tests failed
  process.exit(failed > 0 ? 1 : 0);
}

async function generateHtmlReport(testResults, passed, failed, totalDuration, startTime) {
  const fs = require('fs');
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Results - Hacker News Tests</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 40px 20px;
    }
    
    .container {
      max-width: 1000px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }
    
    .header h1 {
      font-size: 2.5em;
      margin-bottom: 10px;
    }
    
    .header p {
      font-size: 1.1em;
      opacity: 0.9;
    }
    
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      padding: 40px;
      background: #f8f9fa;
    }
    
    .summary-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      text-align: center;
    }
    
    .summary-card h3 {
      color: #666;
      font-size: 0.9em;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
    }
    
    .summary-card .value {
      font-size: 2.5em;
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .summary-card.passed .value {
      color: #10b981;
    }
    
    .summary-card.failed .value {
      color: #ef4444;
    }
    
    .summary-card.total .value {
      color: #667eea;
    }
    
    .summary-card.duration .value {
      color: #f59e0b;
      font-size: 2em;
    }
    
    .tests {
      padding: 40px;
    }
    
    .test-item {
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      transition: all 0.3s ease;
    }
    
    .test-item:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }
    
    .test-item.passed {
      border-left: 4px solid #10b981;
    }
    
    .test-item.failed {
      border-left: 4px solid #ef4444;
    }
    
    .test-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    
    .test-name {
      font-size: 1.2em;
      font-weight: 600;
      color: #1f2937;
    }
    
    .test-status {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      font-size: 0.9em;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .test-status.passed {
      color: #10b981;
    }
    
    .test-status.failed {
      color: #ef4444;
    }
    
    .test-status::before {
      content: '';
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
    }
    
    .test-duration {
      color: #6b7280;
      font-size: 0.9em;
      margin-top: 5px;
    }
    
    .test-error {
      background: #fee2e2;
      border: 1px solid #fecaca;
      border-radius: 4px;
      padding: 12px;
      margin-top: 10px;
      color: #991b1b;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }
    
    .footer {
      background: #f8f9fa;
      padding: 20px 40px;
      text-align: center;
      color: #6b7280;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧪 Test Report</h1>
      <p>Hacker News Automation Tests</p>
    </div>
    
    <div class="summary">
      <div class="summary-card total">
        <h3>Total Tests</h3>
        <div class="value">${passed + failed}</div>
      </div>
      <div class="summary-card passed">
        <h3>Passed</h3>
        <div class="value">${passed}</div>
      </div>
      <div class="summary-card failed">
        <h3>Failed</h3>
        <div class="value">${failed}</div>
      </div>
      <div class="summary-card duration">
        <h3>Duration</h3>
        <div class="value">${(totalDuration / 1000).toFixed(2)}s</div>
      </div>
    </div>
    
    <div class="tests">
      ${testResults.map(test => `
        <div class="test-item ${test.status}">
          <div class="test-header">
            <div class="test-name">${test.name}</div>
            <div class="test-status ${test.status}">${test.status}</div>
          </div>
          <div class="test-duration">Duration: ${test.duration}ms</div>
          ${test.error ? `<div class="test-error">Error: ${test.error}</div>` : ''}
        </div>
      `).join('')}
    </div>
    
    <div class="footer">
      <p>Test run completed at ${startTime.toLocaleString()}</p>
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync('test-results.html', html);
  console.log('✅ HTML report generated: test-results.html\n');
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});