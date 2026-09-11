import { test, expect } from '@playwright/test';

test.describe('Test 02 End-to-End: CAD Analysis -> Quotation Generation', () => {
  test('Load Test 02 DXF -> verify 500x300x6mm, 6 holes, 3 bends, 2 welds, 2 cutouts, 1 slot -> Generate Quote -> verify data lineage & no Avionics mock', async ({ page }) => {
    page.on('console', (msg) => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
    page.on('pageerror', (err) => console.log('BROWSER PAGEERROR:', err.message));
    page.on('response', (response) => {
      if (!response.ok()) {
        console.log('RESPONSE ERROR:', response.status(), response.url());
      }
    });

    // 1. Navigate directly to CAD analysis page
    await page.goto('/cad-analysis');
    await expect(page).toHaveURL(/\/cad-analysis/);
    await expect(page.getByText(/CAD & Engineering Intelligence Engine/i)).toBeVisible();

    // 2. Select Test 02 Preset
    const presetBtn = page.getByRole('button', { name: /Test 02: Cutouts & Slots/i });
    await expect(presetBtn).toBeVisible();
    await presetBtn.click();

    // 3. Verify telemetry appears
    await expect(page.getByText(/Extracted Geometry Telemetry & Confidence/i)).toBeVisible({ timeout: 15000 });

    // Assert Dimensions: 500 x 300 x 6mm
    await expect(page.locator('input[value*="500"][value*="300"][value*="6"]')).toBeVisible();

    // Assert Feature counts in summary grid
    await expect(page.getByText('Holes', { exact: true }).locator('..').getByText('6')).toBeVisible();
    await expect(page.getByText('Bends', { exact: true }).locator('..').getByText('3')).toBeVisible();
    await expect(page.getByText('Welds', { exact: true }).locator('..').getByText('2')).toBeVisible();
    await expect(page.getByText('Internal Cutouts', { exact: true }).locator('..').getByText('2')).toBeVisible();
    await expect(page.getByText('Slots', { exact: true }).locator('..').getByText('1')).toBeVisible();

    // Assert Outer Cut Perimeter (~1582.43 mm)
    await expect(page.locator('input[value*="1582"]')).toBeVisible();

    // 5. Click "1-Click Generate AI Quotation"
    const generateQuoteBtn = page.locator('#generate-quotation-button');
    await expect(generateQuoteBtn).toBeVisible();
    await generateQuoteBtn.click();

    // 6. Assert redirection to Quote Builder
    await page.waitForURL(/\/quotations\/builder/, { timeout: 10000 });
    await expect(page.getByText(/AI Interactive Quotation Builder/i)).toBeVisible();

    // 7. Verify Data Lineage banner
    await expect(page.getByText(/Quote generated from:/i)).toBeVisible();
    await expect(page.getByText(/ForgeIQ_Test_02_Internal_Cutouts.dxf/i)).toBeVisible();
    await expect(page.getByText(/Analysis ID:/i)).toBeVisible();

    // 8. Verify Line Item features and details
    await expect(page.locator('input[value*="ForgeIQ Test 02 Internal Cutouts"]').first()).toBeVisible();
    await expect(page.locator('input[value="1"]').first()).toBeVisible(); // Qty 1

    // Assert badges on line item
    await expect(page.getByText(/1582.*mm Cut/i)).toBeVisible();
    await expect(page.getByText(/6 Holes/i)).toBeVisible();
    await expect(page.getByText(/3 Bends/i)).toBeVisible();
    await expect(page.getByText(/2 Welds/i)).toBeVisible();
    await expect(page.getByText(/2 Cutouts/i)).toBeVisible();
    await expect(page.getByText(/1 Slot/i)).toBeVisible();

    // 9. CRITICAL ASSERTION: Line item is Mild Steel, no stale Avionics mock data on quotation page
    await expect(page.locator('table select')).toHaveValue('Mild Steel');
    const pageContent = await page.content();
    expect(pageContent).not.toContain('Avionics Heat Sink');
    expect(pageContent).not.toContain('Mounting Support Flange');
    expect(pageContent).not.toContain('400mm x 400mm');
    expect(pageContent).not.toContain('7.54 kg');
  });
});
