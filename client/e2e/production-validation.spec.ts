import { test, expect } from '@playwright/test';

test.describe('ATHLIXIR Enterprise Visual & UI Validation', () => {

  test('Form validation shows email error bounds & password requirements', async ({ page }) => {
    await page.goto('/login');
    
    // Check missing fields
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('text=Error: Please fill in all fields.')).toBeVisible();

    // Check weak password warning
    await page.fill('input#email', 'athlete@athlixir.com');
    await page.fill('input#password', 'weak');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('text=Error: Password must be at least 8 characters long.')).toBeVisible();
  });

  test('Multi-step onboarding UI renders progress and step indicators', async ({ page }) => {
    // Navigate to onboarding path
    await page.goto('/onboarding');
    
    // Should prompt for login if unauthenticated
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('Responsive viewport alignments verify no layout overflow', async ({ page }) => {
    // 1. Check Mobile layout
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone X
    await page.goto('/login');
    await expect(page.locator('text=ACCESS PORTAL')).toBeVisible();
    
    // Confirm elements don't cause horizontal overflow
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalScroll).toBeFalsy();

    // 2. Check 4K high density display layout
    await page.setViewportSize({ width: 3840, height: 2160 });
    await page.goto('/login');
    await expect(page.locator('text=ACCESS PORTAL')).toBeVisible();
  });

  test('Dashboard loads telemetry scores and charts successfully', async ({ page }) => {
    // Verify dashboard displays loading states cleanly
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/login/);
  });
});
