const { defineConfig, devices } = require('@playwright/test');

// Serve the Jekyll build output (../_site) and test it across desktop and
// mobile. The build is produced by the CI workflow before this runs; to run
// locally, build the site first (see ../README.md) so ../_site exists.
module.exports = defineConfig({
  testDir: './',
  timeout: 30 * 1000,
  expect: { timeout: 5 * 1000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:4000',
    trace: 'on-first-retry',
    // Save a screenshot of the page whenever a test fails, so a red run
    // shows the broken rendering, not just which assertion tripped.
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'python3 -m http.server 4000 --directory ../_site',
    url: 'http://localhost:4000/',
    reuseExistingServer: !process.env.CI,
    timeout: 30 * 1000,
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 13'] } },
  ],
});
