import { test, expect } from '@playwright/test';

test.describe('Test 03 End-to-End: Robust Bend Detection & Quotation Generation', () => {
  test('Load Test 03 DXF -> verify 500x360x8mm, 7 holes, 4 bends (4 x 90 deg), 2 welds, 3 cutouts, bending time > 0 -> Generate Quote -> verify data lineage', async ({ page }) => {
    // 1. Navigate directly to CAD analysis page
    await page.goto('/cad-analysis');
    await expect(page).toHaveURL(/\/cad-analysis/);
    await expect(page.getByText(/CAD & Engineering Intelligence Engine/i)).toBeVisible();

    // 2. Select Test 03 Preset
    const presetBtn = page.getByRole('button', { name: /Test 03: Bracket Profile/i });
    await expect(presetBtn).toBeVisible();
    await presetBtn.click();

    // 3. Verify telemetry appears
    await expect(page.getByText(/Extracted Geometry Telemetry & Confidence/i)).toBeVisible({ timeout: 15000 });

    // Assert Dimensions: 500 x 360 x 8mm
    await expect(page.locator('input[value*="500"][value*="360"][value*="8"]')).toBeVisible();

    // Assert Feature counts in summary grid
    await expect(page.getByText('Holes', { exact: true }).locator('..').getByText('7')).toBeVisible();
    await expect(page.getByText('Bends', { exact: true }).locator('..').getByText('4')).toBeVisible();
    await expect(page.getByText('Bends (4)').first()).toBeVisible();
    await expect(page.getByText('Welds', { exact: true }).locator('..').getByText('2')).toBeVisible();
    await expect(page.getByText('Internal Cutouts', { exact: true }).locator('..').getByText('3')).toBeVisible();

    // Assert Press Brake Bends input value = 4
    await expect(page.locator('input[type="number"][value="4"]')).toBeVisible();

    // Assert Bend Angles display (4 x 90 deg)
    await expect(page.getByText(/4 × 90°/i).first()).toBeVisible();

    // Assert Bending Setup Time is NOT 0 mins
    const bendingTimeLocator = page.getByText(/Bending Setup Time/i).locator('..').locator('span.font-bold');
    await expect(bendingTimeLocator).toBeVisible();
    const bendingTimeText = await bendingTimeLocator.textContent();
    expect(bendingTimeText).not.toContain('0 mins');
    expect(bendingTimeText).toContain('mins');

    // Assert Outer Cut Perimeter (~1576.5 mm)
    await expect(page.locator('input[value*="1576.5"]')).toBeVisible();

    // Assert Estimated Net Weight (~10.16 kg)
    await expect(page.locator('input[value*="10.16"]')).toBeVisible();

    // 4. Click "1-Click Generate AI Quotation"
    const generateQuoteBtn = page.locator('#generate-quotation-button');
    await expect(generateQuoteBtn).toBeVisible();
    await generateQuoteBtn.click();

    // 5. Assert redirection to Quote Builder
    await page.waitForURL(/\/quotations\/builder/, { timeout: 10000 });
    await expect(page.getByText(/AI Interactive Quotation Builder/i)).toBeVisible();

    // 6. Verify Data Lineage banner
    await expect(page.getByText(/Quote generated from:/i)).toBeVisible();
    await expect(page.getByText(/ForgeIQ_Test_03_Complex_Profile.dxf/i)).toBeVisible();
    await expect(page.getByText(/Analysis ID:/i)).toBeVisible();

    // 7. Verify Line Item features and details
    await expect(page.locator('input[value*="ForgeIQ Test 03 Complex Profile"]').first()).toBeVisible();
    await expect(page.locator('input[value="1"]').first()).toBeVisible(); // Qty 1

    // Assert badges on line item
    await expect(page.getByText(/1576.*mm Cut/i)).toBeVisible();
    await expect(page.getByText(/7 Holes/i)).toBeVisible();
    await expect(page.getByText(/4 Bends/i)).toBeVisible();
    await expect(page.getByText(/2 Welds/i)).toBeVisible();
    await expect(page.getByText(/3 Cutouts/i)).toBeVisible();
  });
});
