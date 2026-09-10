import { Page, expect } from '@playwright/test';
import { TEST_USERS } from './test-data';

/**
 * Logs in via the Customer Self-Service Portal (/portal/login).
 */
export async function loginAsCustomer(page: Page) {
  await page.goto('/portal/login');
  
  // Fill email and password inputs
  const emailInput = page.locator('input[type="email"]');
  const passwordInput = page.locator('input[type="password"]');

  await emailInput.fill(TEST_USERS.customer.email);
  await passwordInput.fill(TEST_USERS.customer.password);

  // Click sign in button
  const submitBtn = page.getByRole('button', { name: /Sign In to Customer Portal|Authenticating/i });
  await submitBtn.click();

  // Wait for redirect to /portal/dashboard
  await page.waitForURL('**/portal/dashboard', { timeout: 10000 });
  await expect(page).toHaveURL(/\/portal\/dashboard/);
}

/**
 * Logs in via the Enterprise Management Portal (/login) with Manager credentials.
 */
export async function loginAsManager(page: Page) {
  await page.goto('/login');

  // Select Manager role tab if available
  const managerTab = page.getByRole('button', { name: /Manager/i });
  if (await managerTab.isVisible()) {
    await managerTab.click();
  }

  const emailInput = page.locator('input[type="email"]');
  const passwordInput = page.locator('input[type="password"]');

  await emailInput.fill(TEST_USERS.manager.email);
  await passwordInput.fill(TEST_USERS.manager.password);

  const submitBtn = page.getByRole('button', { name: /Sign in|Continue to Dashboard/i });
  await submitBtn.click();

  // Wait for navigation to dashboard or orders
  await page.waitForURL(/\/(dashboard|orders)/, { timeout: 15000 });
}

/**
 * Logs in as Owner.
 */
export async function loginAsOwner(page: Page) {
  await page.goto('/login');

  const ownerTab = page.getByRole('button', { name: /Owner/i });
  if (await ownerTab.isVisible()) {
    await ownerTab.click();
  }

  const emailInput = page.locator('input[type="email"]');
  const passwordInput = page.locator('input[type="password"]');

  await emailInput.fill(TEST_USERS.owner.email);
  await passwordInput.fill(TEST_USERS.owner.password);

  const submitBtn = page.getByRole('button', { name: /Sign in|Continue to Dashboard/i });
  await submitBtn.click();

  await page.waitForURL(/\/(dashboard|orders)/, { timeout: 15000 });
}
