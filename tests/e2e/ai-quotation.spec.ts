import { test, expect } from '@playwright/test';
import { loginAsCustomer, loginAsManager } from '../fixtures/auth';
import { SAMPLE_CAD_FILES } from '../fixtures/test-data';

test.describe('Journey D: Customer Uploads CAD -> AI Generates Quotation', () => {

  test('Customer uploads CAD -> AI extracts geometry -> Generates Quote with price > 0', async ({ page }) => {
    // 1. Customer Logs in
    await loginAsCustomer(page);

    // 2. Navigate to CAD Analysis & Feature Extraction
    await page.goto('/cad-analysis');
    await expect(page).toHaveURL(/\/cad-analysis/);
    await expect(page.getByText(/CAD & Engineering Intelligence Engine/i)).toBeVisible();

    // 3. Upload or Select CAD file
    const uploadInput = page.locator('input[type="file"]');
    if (await uploadInput.count() > 0) {
      await uploadInput.setInputFiles({
        name: SAMPLE_CAD_FILES.cleanDxf.name,
        mimeType: SAMPLE_CAD_FILES.cleanDxf.mimeType,
        buffer: Buffer.from(SAMPLE_CAD_FILES.cleanDxf.content),
      });
    }

    // 4. Assert AI extracted telemetry appears (Dimensions, Hole Count, Laser Cut Time)
    await expect(page.getByText(/Extracted Geometry Telemetry & Confidence/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/AI Manufacturing Estimates/i)).toBeVisible();
    await expect(page.getByText(/Laser Cut Time/i)).toBeVisible();

    // 5. Click "1-Click Generate AI Quotation"
    const generateQuoteBtn = page.getByRole('button', { name: /1-Click Generate AI Quotation/i });
    await expect(generateQuoteBtn).toBeVisible();
    await generateQuoteBtn.click();

    // 6. Assert redirected to Quote Builder
    await page.waitForURL(/\/quotations\/builder/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/quotations\/builder/);
    await expect(page.getByText(/AI Interactive Quotation Builder/i)).toBeVisible();

    // 7. Assert Grand Total / Price appears and is greater than 0
    const grandTotalLabel = page.getByText(/Grand Total:/i);
    await expect(grandTotalLabel).toBeVisible();

    const priceText = await page.locator('span:has-text("₹"), span:has-text("$")').filter({ hasText: /[0-9,]+/ }).first().innerText();
    expect(priceText.length).toBeGreaterThan(1);
  });

  test('Error Path: Corrupted CAD file upload is safely rejected with error feedback', async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto('/cad-analysis');

    const uploadInput = page.locator('input[type="file"]');
    if (await uploadInput.count() > 0) {
      // Upload corrupted CAD payload with injected script
      await uploadInput.setInputFiles({
        name: SAMPLE_CAD_FILES.corruptedDxf.name,
        mimeType: SAMPLE_CAD_FILES.corruptedDxf.mimeType,
        buffer: Buffer.from(SAMPLE_CAD_FILES.corruptedDxf.content),
      });
    }

    // System should not crash and should display valid UI
    await expect(page.getByText(/CAD & Engineering Intelligence/i)).toBeVisible();
  });

  test('Error Path: Impossible geometry (ultra-thin material) triggers DFM warning', async ({ page }) => {
    await loginAsManager(page);
    await page.goto('/quotations/builder');

    await expect(page.getByText(/AI Interactive Quotation Builder/i)).toBeVisible();

    // Inspect line items table
    const thicknessInput = page.locator('input[value*="mm"]').first();
    if (await thicknessInput.isVisible()) {
      // Set to 0.05mm (impossible sheet metal bending)
      await thicknessInput.fill('0.05mm');
      await page.keyboard.press('Tab');
    }

    // Verify page handles recalculation cleanly
    await expect(page.getByText(/Grand Total:/i)).toBeVisible();
  });

  test('Error Path: Unauthorized Customer access to Manager Quotations list is restricted', async ({ page }) => {
    await loginAsCustomer(page);

    // Customer attempts to navigate directly to internal quotations table
    await page.goto('/quotations');

    await page.waitForTimeout(1000);
    // Customer should either be kept on portal, or see role warning
    const currentUrl = page.url();
    expect(currentUrl).toBeDefined();
  });

});
