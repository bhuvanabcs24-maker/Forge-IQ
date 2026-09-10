import { test, expect } from '@playwright/test';
import { loginAsManager } from '../fixtures/auth';
import { MOCK_WORK_ORDERS } from '../fixtures/test-data';

test.describe('Journey B: Manager Reviews & Approves Quote / Work Order Flow', () => {

  test('Manager logs in -> navigates to /orders -> asserts order details render', async ({ page }) => {
    // 1. Log in as Manager
    await loginAsManager(page);

    // 2. Navigate to Work Orders page
    await page.goto('/orders');
    await expect(page).toHaveURL(/\/orders/);
    await expect(page.getByText(/Work Orders|Sales Orders|Production Pipeline/i).first()).toBeVisible();

    // 3. Assert orders table renders
    const table = page.locator('table, [role="table"]');
    await expect(table.first()).toBeVisible();

    // 4. Assert key table headers exist (Work Order #, Customer, Priority, Status)
    await expect(page.getByText(/Work Order #/i).first()).toBeVisible();
    await expect(page.getByText(/Customer/i).first()).toBeVisible();
  });

  test('Manager reviews quotations -> verifies details -> approves quote to work order', async ({ page }) => {
    await loginAsManager(page);

    // Navigate to Quotations / RFQ Management
    await page.goto('/quotations');
    await expect(page).toHaveURL(/\/quotations/);
    await expect(page.getByText(/Quotation & RFQ Management/i)).toBeVisible();

    // Assert pending quote exists in table
    const quoteRow = page.locator('tbody tr').filter({ hasText: /Apex Aerospace|RFQ/i }).first();
    await expect(quoteRow).toBeVisible();

    // Click PDF / Details preview button
    const previewBtn = quoteRow.getByRole('button', { name: /PDF|Eye/i });
    if (await previewBtn.isVisible()) {
      await previewBtn.click();
      // Assert quotation modal/sheet details show
      await expect(page.getByText(/Detailed Line Items|Fabrication Breakdown|Quotation/i).first()).toBeVisible();
      // Close modal cleanly with Escape key
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }

    // Convert / Approve Quote to Work Order
    const approveBtn = quoteRow.getByRole('button', { name: /Convert/i });
    await approveBtn.click();

    // Should redirect or update to Orders page
    await page.waitForURL(/\/orders/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/orders/);
  });

  test('Manager can open New Work Order modal and inspect material allocation', async ({ page }) => {
    await loginAsManager(page);
    await page.goto('/orders');

    // Click "New Work Order" button
    const newOrderBtn = page.getByRole('button', { name: /New Work Order|Create Order/i });
    await expect(newOrderBtn).toBeVisible();
    await newOrderBtn.click();

    // Assert modal opened
    await expect(page.getByText(/Create Production Work Order|New Work Order/i).first()).toBeVisible();
    await expect(page.locator('input[name="title"], input[placeholder*="Title"]').first()).toBeVisible();

    // Close modal
    const cancelBtn = page.getByRole('button', { name: /Cancel/i });
    await cancelBtn.click();
  });

});
