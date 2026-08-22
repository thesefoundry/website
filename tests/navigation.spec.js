// Regression tests for thesefoundry.com
//
// These run against the Jekyll-built site (the same output GitHub Pages
// deploys) across desktop and mobile viewports. They guard the things that
// have actually broken or could break on a site update: the shared nav/footer
// building correctly, the mobile menu working, and every page reaching the
// Resources page.
//
// Projects (viewports) are defined in playwright.config.js.

const { test, expect } = require('@playwright/test');

// Every page that should render the shared shell. Add new pages here.
const PAGES = [
  { path: '/', title: /The SE Foundry/ },
  { path: '/resources/', title: /Resources/ },
  { path: '/resources/poc-success-plan.html', title: /Success Plan/ },
  { path: '/resources/meddpicc-analysis-worksheet.html', title: /MEDDPICC/ },
  { path: '/resources/demo-review-coaching-guide.html', title: /Demo Review/ },
];

function isMobile(page) {
  const width = page.viewportSize()?.width ?? 1280;
  return width < 800;
}

for (const { path, title } of PAGES) {
  test.describe(`page ${path}`, () => {
    test('loads, renders nav + footer, and has no unbuilt template tags', async ({ page }) => {
      const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
      expect(response, 'a response was returned').toBeTruthy();
      expect(response.status(), 'HTTP status is OK').toBeLessThan(400);

      await expect(page).toHaveTitle(title);
      await expect(page.locator('nav'), 'nav renders').toBeVisible();
      await expect(page.locator('footer'), 'footer renders')
        .toContainText('Build the function. Win the deal.');

      // If Jekyll failed to expand the shared includes, the raw Liquid tags
      // would show up in the HTML. Catch that.
      const html = await page.content();
      expect(html, 'no unrendered {% include %}').not.toContain('{% include');
      expect(html, 'no leftover Liquid tag').not.toContain('{%');
      expect(html, 'no leftover Liquid output').not.toContain('{{');
    });

    test('navigation adapts to viewport and Resources is reachable', async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' });

      const burger = page.locator('.nav-burger');
      const links = page.locator('nav .links');
      const resources = page.locator('nav .links a[href="/resources/"]');

      if (isMobile(page)) {
        // Collapsed: hamburger shown, links hidden until tapped.
        await expect(burger, 'hamburger visible on mobile').toBeVisible();
        await expect(links, 'links hidden until menu opens').toBeHidden();
        await burger.click();
        await expect(links, 'menu opens on tap').toBeVisible();
        await expect(resources, 'Resources visible in open menu').toBeVisible();
      } else {
        // Desktop: full link row shown, no hamburger.
        await expect(burger, 'hamburger hidden on desktop').toBeHidden();
        await expect(links, 'links visible on desktop').toBeVisible();
        await expect(resources, 'Resources link visible').toBeVisible();
      }

      // The bug this whole thing started with: Resources must be reachable.
      await resources.click();
      await expect(page, 'Resources link lands on /resources/').toHaveURL(/\/resources\/$/);
      await expect(page.locator('nav'), 'nav still present after navigation').toBeVisible();
    });

    test('does not scroll horizontally', async ({ page }) => {
      await page.goto(path, { waitUntil: 'load' });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow, 'page content fits the viewport width').toBeLessThanOrEqual(1);
    });
  });
}
