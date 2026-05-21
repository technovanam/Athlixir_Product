import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  // Use a base URL assuming the frontend runs on localhost:3000
  // and the backend is running properly.
  
  test('unauthenticated user is redirected to login', async ({ page }) => {
    // Navigate to a protected route
    await page.goto('/dashboard');
    // It should redirect to login page or show login form
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.locator('text=ACCESS PORTAL')).toBeVisible();
  });

  test('shows validation errors for empty fields', async ({ page }) => {
    await page.goto('/login');
    // Click submit without filling anything
    await page.locator('button[type="submit"]').click();
    
    // Expect error message
    await expect(page.locator('text=Error: Please fill in all fields.')).toBeVisible();
  });

  test('shows validation errors for weak passwords', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input#email', 'test@example.com');
    await page.fill('input#password', 'weak');
    await page.locator('button[type="submit"]').click();
    
    // Expect error message
    await expect(page.locator('text=Error: Password must be at least 8 characters long.')).toBeVisible();
  });

  // These tests require a running backend to actually succeed in login,
  // we will test the UI logic handles the login submission.
  test('attempts login and shows loading state', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input#email', 'test@example.com');
    await page.fill('input#password', 'Password123!');
    
    // Start waiting for request before clicking
    const requestPromise = page.waitForRequest(request => request.url().includes('/auth/login') && request.method() === 'POST', { timeout: 5000 }).catch(() => null);
    
    await page.locator('button[type="submit"]').click();
    
    // The button should change to "Verifying..."
    await expect(page.locator('text=Verifying...')).toBeVisible();
    
    // If backend isn't running, it'll eventually show an error from AuthContext
    // This just verifies the form submits properly.
  });
});
