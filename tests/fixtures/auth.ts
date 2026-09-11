import { Page, expect } from '@playwright/test';
import { TEST_USERS } from './test-data';

/**
 * Logs in via the Customer Self-Service Portal (/portal/login).
 */
export async function loginAsCustomer(page: Page) {
  try {
    await page.context().addCookies([{
      name: 'forgeiq_customer_session',
      value: 'true',
      url: 'http://localhost:3000',
    }]);
  } catch (e) {
    // Ignore if context not yet initialized with base URL
  }
  await page.goto('/portal/login');

  const demoCustBtn = page.locator('button').filter({ hasText: 'Apex Aerospace' }).first();
  if (await demoCustBtn.isVisible()) {
    await demoCustBtn.click({ force: true });
    try {
      await page.waitForURL(/\/portal\/dashboard/, { timeout: 5000 });
      return;
    } catch {
      // Fall through to manual login if demo button didn't redirect
    }
  }
  
  // Fill email and password inputs
  const emailInput = page.locator('input[type="email"]');
  const passwordInput = page.locator('input[type="password"]');

  await emailInput.fill(TEST_USERS.customer.email);
  await passwordInput.fill(TEST_USERS.customer.password);

  // Click sign in button
  const submitBtn = page.getByRole('button', { name: /Sign In to Customer Portal|Authenticating/i }).first();
  await submitBtn.click({ force: true });

  // Wait for redirect to /portal/dashboard
  await page.waitForURL(/\/portal\/dashboard/, { timeout: 15000 });
  await expect(page).toHaveURL(/\/portal\/dashboard/);
}

/**
 * Logs in via the Enterprise Management Portal (/login) with Manager credentials.
 */
export async function loginAsManager(page: Page) {
  await page.goto('/login');

  // Check if 1-click demo manager profile is present
  const demoManagerBtn = page.locator('button').filter({ hasText: 'Sarah' }).filter({ hasText: 'Manager' }).first();
  if (await demoManagerBtn.isVisible()) {
    await demoManagerBtn.click({ force: true });
    try {
      await page.waitForURL(/\/(dashboard|orders)/, { timeout: 5000 });
      return;
    } catch {
      // Fall through
    }
  }

  const emailInput = page.locator('input[type="email"]');
  const passwordInput = page.locator('input[type="password"]');

  await emailInput.fill(TEST_USERS.manager.email);
  await passwordInput.fill(TEST_USERS.manager.password);

  const submitBtn = page.getByRole('button', { name: /Access Workspace|Sign in|Continue to Dashboard|Authenticating/i }).first();
  await submitBtn.click({ force: true });

  // Wait for navigation to dashboard or orders
  await page.waitForURL(/\/(dashboard|orders)/, { timeout: 15000 });
}

/**
 * Logs in as Owner.
 */
export async function loginAsOwner(page: Page) {
  await page.goto('/login');

  const demoOwnerBtn = page.locator('button').filter({ hasText: 'Alex' }).filter({ hasText: 'Owner' }).first();
  if (await demoOwnerBtn.isVisible()) {
    await demoOwnerBtn.click();
    await page.waitForURL(/\/(dashboard|orders)/, { timeout: 15000 });
    return;
  }

  const emailInput = page.locator('input[type="email"]');
  const passwordInput = page.locator('input[type="password"]');

  await emailInput.fill(TEST_USERS.owner.email);
  await passwordInput.fill(TEST_USERS.owner.password);

  const submitBtn = page.getByRole('button', { name: /Access Workspace|Sign in|Continue to Dashboard|Authenticating/i }).first();
  await submitBtn.click();

  await page.waitForURL(/\/(dashboard|orders)/, { timeout: 15000 });
}
