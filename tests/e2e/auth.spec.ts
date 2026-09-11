import { test, expect } from '@playwright/test';
import { loginAsCustomer, loginAsManager } from '../fixtures/auth';
import { TEST_USERS } from '../fixtures/test-data';

test.describe('Journey A: Customer & Role Authentication Flow', () => {

  test('Customer logs in -> Views Dashboard -> Sees Active Orders', async ({ page }) => {
    // 1. Navigate to Customer Portal Login
    await page.goto('/portal/login');
    await expect(page.getByText('ForgeIQ Customer Portal').first()).toBeVisible();

    // 2. Perform Customer Login
    await loginAsCustomer(page);

    // 3. Assert redirected to Customer Dashboard
    await expect(page).toHaveURL(/\/portal\/dashboard/);
    await expect(page.getByText(/Active Orders|Production Progress|Manufacturing/i).first()).toBeVisible();

    // 4. Assert customer active order FG-2042 is visible
    const orderNumber = page.getByText(/FG-2042/i).first();
    await expect(orderNumber).toBeVisible();

    // 5. Assert live status appears
    await expect(page.getByText(/In Production|Welding/i).first()).toBeVisible();
  });

  test('Enterprise Manager Login -> Redirects to Management Dashboard', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText(/Sign in to your account|ForgeIQ|Manufacturing Intelligence/i).first()).toBeVisible();

    // Fill credentials
    await page.locator('input[type="email"]').fill(TEST_USERS.manager.email);
    await page.locator('input[type="password"]').fill(TEST_USERS.manager.password);

    const submitBtn = page.getByRole('button', { name: /Access Workspace|Sign in|Continue to Dashboard/i }).first();
    await submitBtn.click();

    // Expect navigation to dashboard or management panel
    await page.waitForURL(/\/(dashboard|orders)/, { timeout: 30000 });
    await expect(page).toHaveURL(/\/(dashboard|orders)/);
  });

  test('Access Control: Customer cannot access protected Manager Settings panel', async ({ page }) => {
    // Customer logs into portal
    await loginAsCustomer(page);

    // Customer attempts to directly navigate to Manager Settings
    await page.goto('/settings/organization');

    // Should redirect away from restricted manager settings or prompt for enterprise login
    await page.waitForTimeout(1000);
    const currentUrl = page.url();
    const isBlocked = currentUrl.includes('/login') || currentUrl.includes('/portal') || currentUrl.includes('/dashboard');
    expect(isBlocked).toBeTruthy();
  });

  test('Mobile Responsiveness: Login Form renders cleanly on iPhone (375x667)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/portal/login');

    const card = page.locator('form');
    await expect(card).toBeVisible();

    // Check submit button is clickable and visible without clipping
    const submitBtn = page.getByRole('button', { name: /Sign In to Customer Portal/i });
    await expect(submitBtn).toBeVisible();

    // Assert no horizontal body overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
  });

  test('Mobile Responsiveness: Dashboard renders cleanly on iPad (768x1024)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/portal/login');
    await loginAsCustomer(page);

    await expect(page).toHaveURL(/\/portal\/dashboard/);
    const mainContent = page.locator('main, [role="main"], body');
    await expect(mainContent.first()).toBeVisible();

    // Assert buttons remain interactive
    const interactiveButtons = page.locator('button');
    expect(await interactiveButtons.count()).toBeGreaterThan(0);
  });

  test('Accessibility: Keyboard navigation & Accessible form inputs', async ({ page }) => {
    await page.goto('/portal/login');

    // Focus email input and Tab to password input
    const emailInput = page.locator('input[type="email"]');
    await emailInput.focus();
    await page.keyboard.press('Tab');

    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeFocused();

    // Tab to Submit button
    await page.keyboard.press('Tab');
    const submitBtn = page.getByRole('button', { name: /Sign In to Customer Portal/i });
    await expect(submitBtn).toBeFocused();

    // Check button has accessible text name
    const buttonName = await submitBtn.getAttribute('aria-label') || await submitBtn.innerText();
    expect(buttonName.length).toBeGreaterThan(0);
  });

});
