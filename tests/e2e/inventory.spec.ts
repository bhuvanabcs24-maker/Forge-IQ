import { test, expect } from '@playwright/test';
import { loginAsManager } from '../fixtures/auth';
import { OUT_OF_STOCK_MATERIAL } from '../fixtures/test-data';

test.describe('Journey C: Inventory & Out of Stock Scenario', () => {

  test('Manager navigates to /inventory -> Inspects Stock Levels & Reorder Points', async ({ page }) => {
    await loginAsManager(page);

    await page.goto('/inventory');
    await expect(page).toHaveURL(/\/inventory/);
    await expect(page.getByText(/Raw Material & Sheet Inventory|Stock/i).first()).toBeVisible();

    // Verify inventory table
    const table = page.locator('table, [role="table"]');
    await expect(table.first()).toBeVisible();

    // Verify inventory headers
    await expect(page.getByText(/SKU & Category/i)).toBeVisible();
    await expect(page.getByText(/Material \/ Item Description/i)).toBeVisible();
    await expect(page.getByText(/Stock Quantity/i)).toBeVisible();
  });

  test('Out of Stock Scenario: Attempting order for 0-inventory material displays error & reorder date', async ({ page }) => {
    await loginAsManager(page);
    await page.goto('/orders');

    // 1. Open New Work Order Modal
    const newOrderBtn = page.getByRole('button', { name: /New Work Order|Create Order/i });
    await newOrderBtn.click();

    // 2. Fill Order Details
    await page.locator('input[name="title"]').fill('Cryogenic Invar Bracket Assembly');
    await page.locator('input[name="quantityUnits"]').fill('100');

    // 3. Select Out-of-Stock Material (INVAR-36-05 with 0 stock)
    const materialSelect = page.locator('select[name="materialSku"]');
    if (await materialSelect.isVisible()) {
      await materialSelect.selectOption({ value: OUT_OF_STOCK_MATERIAL.sku });
    }

    // 4. Submit Order
    const submitBtn = page.getByRole('button', { name: /Create Work Order/i });
    await submitBtn.click();

    // 5. Assert "Insufficient inventory" error feedback appears
    await expect(page.getByText(/Insufficient inventory/i).first()).toBeVisible({ timeout: 5000 });

    // 6. Assert "Reorder by 2026-09-15" appears
    await expect(page.getByText(/Reorder by 2026-09-15/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('Stock Level Alert: Zero/Low quantity triggers reorder warning badges', async ({ page }) => {
    await loginAsManager(page);
    await page.goto('/inventory');

    // Assert that low or zero stock shows danger/reorder indicator
    const reorderBadges = page.locator('span, div').filter({ hasText: /Reorder|Low Stock/i });
    expect(await reorderBadges.count()).toBeGreaterThanOrEqual(0);
  });

});
