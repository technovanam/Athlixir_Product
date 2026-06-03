import { test, expect } from '@playwright/test';

const PAGES = ['/', '/login', '/signup', '/dashboard'];

const VIEWPORTS = [
  { name: 'Mobile Small', width: 320, height: 568 },
  { name: 'Mobile Standard', width: 375, height: 812 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Laptop', width: 1024, height: 768 },
  { name: 'Desktop', width: 1440, height: 900 }
];

test.describe('ATHLIXIR Responsive Layout & Viewport Tests', () => {
  for (const viewport of VIEWPORTS) {
    test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
      test.use({ viewport: { width: viewport.width, height: viewport.height } });

      for (const path of PAGES) {
        test(`Page "${path}" has zero horizontal scroll overflow`, async ({ page }) => {
          await page.goto(path);
          // Wait for page layout to mount and settle
          await page.waitForTimeout(500);

          const overflowDetails = await page.evaluate(() => {
            const docWidth = document.documentElement.scrollWidth;
            const winWidth = window.innerWidth;
            return {
              overflow: docWidth > winWidth,
              docWidth,
              winWidth
            };
          });

          if (overflowDetails.overflow) {
            console.warn(`Overflow detected on page ${path} for ${viewport.name}: scrollWidth (${overflowDetails.docWidth}) > innerWidth (${overflowDetails.winWidth})`);
          }

          expect(overflowDetails.overflow).toBeFalsy();
        });
      }
    });
  }
});
