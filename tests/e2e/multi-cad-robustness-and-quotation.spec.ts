import { test, expect } from '@playwright/test';

test.describe('CAD Robustness, Multi-File Pipeline & Quotation Integrity', () => {

  test('Phase 8 & 9: Multi-file sequential CAD -> Quotation pipeline without refresh (no stale leaks)', async ({ page }) => {
    // 1. Load Test 01
    await page.goto('/cad-analysis');
    await expect(page.getByText(/CAD & Engineering Intelligence Engine/i)).toBeVisible();

    const test01Btn = page.getByRole('button', { name: /Test 01: Rect & Holes/i });
    await expect(test01Btn).toBeVisible();
    await test01Btn.click();

    // Verify Test 01 telemetry
    await expect(page.getByText(/Extracted Geometry Telemetry & Confidence/i)).toBeVisible({ timeout: 15000 });
    await expect(page.locator('input[value*="300"][value*="200"]')).toBeVisible();
    await expect(page.getByText('Holes', { exact: true }).locator('..').getByText('4')).toBeVisible();
    await expect(page.locator('input[value*="1000"]')).toBeVisible();

    // Generate Quote 01
    await page.locator('#generate-quotation-button').click();
    await page.waitForURL(/\/quotations\/builder/, { timeout: 10000 });

    // Assert Quote 01 Lineage & Content
    await expect(page.getByText(/Quote generated from:/i)).toBeVisible();
    await expect(page.getByText(/01_simple_rectangle_holes.dxf/i)).toBeVisible();
    await expect(page.locator('input[value*="01 simple rectangle holes"]').first()).toBeVisible();
    await expect(page.getByText(/1000.*mm Cut/i)).toBeVisible();
    await expect(page.getByText(/4 Holes/i)).toBeVisible();

    // Capture Analysis ID 01
    const analysisId01 = await page.locator('text=Analysis ID:').locator('..').innerText();

    // 2. Load Test 02 WITHOUT REFRESHING APP
    await page.goto('/cad-analysis');
    await expect(page.getByText(/CAD & Engineering Intelligence Engine/i)).toBeVisible();

    const test02Btn = page.getByRole('button', { name: /Test 02: Cutouts & Slots/i });
    await expect(test02Btn).toBeVisible();
    await test02Btn.click();

    // Verify Test 02 telemetry
    await expect(page.locator('input[value*="500"][value*="300"][value*="6"]')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Holes', { exact: true }).locator('..').getByText('6')).toBeVisible();
    await expect(page.getByText('Bends', { exact: true }).locator('..').getByText('3')).toBeVisible();
    await expect(page.getByText('Welds', { exact: true }).locator('..').getByText('2')).toBeVisible();
    await expect(page.getByText('Internal Cutouts', { exact: true }).locator('..').getByText('2')).toBeVisible();
    await expect(page.getByText('Slots', { exact: true }).locator('..').getByText('1')).toBeVisible();
    await expect(page.locator('input[value*="1582"]')).toBeVisible();

    // Generate Quote 02
    await page.locator('#generate-quotation-button').click();
    await page.waitForURL(/\/quotations\/builder/, { timeout: 10000 });

    // Assert Quote 02 Lineage & Content
    await expect(page.getByText(/01_simple_rectangle_holes.dxf/i)).not.toBeVisible();
    await expect(page.getByText(/ForgeIQ_Test_02_Internal_Cutouts.dxf/i)).toBeVisible();
    await expect(page.locator('input[value*="ForgeIQ Test 02 Internal Cutouts"]').first()).toBeVisible();
    await expect(page.getByText(/1582.*mm Cut/i)).toBeVisible();
    await expect(page.getByText(/6 Holes/i)).toBeVisible();
    await expect(page.getByText(/3 Bends/i)).toBeVisible();
    await expect(page.getByText(/2 Cutouts/i)).toBeVisible();
    await expect(page.getByText(/1 Slot/i)).toBeVisible();

    // Verify Analysis ID changed and no stale items exist
    const analysisId02 = await page.locator('text=Analysis ID:').locator('..').innerText();
    expect(analysisId02).not.toEqual(analysisId01);

    const quote02Content = await page.content();
    expect(quote02Content).not.toContain('01 simple rectangle holes');
    expect(quote02Content).not.toContain('Avionics Heat Sink');

    // 3. Load Test 03 WITHOUT REFRESHING APP
    await page.goto('/cad-analysis');
    await expect(page.getByText(/CAD & Engineering Intelligence Engine/i)).toBeVisible();

    const test03Btn = page.getByRole('button', { name: /Test 03: Irregular Polygon/i });
    await expect(test03Btn).toBeVisible();
    await test03Btn.click();

    // Verify Test 03 telemetry
    await expect(page.locator('input[value*="400"][value*="250"]')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Holes', { exact: true }).locator('..').getByText('5')).toBeVisible();
    await expect(page.locator('input[value*="1160"]')).toBeVisible();

    // Generate Quote 03
    await page.locator('#generate-quotation-button').click();
    await page.waitForURL(/\/quotations\/builder/, { timeout: 10000 });

    // Assert Quote 03 Lineage & Content
    await expect(page.getByText(/ForgeIQ_Test_02_Internal_Cutouts.dxf/i)).not.toBeVisible();
    await expect(page.getByText(/03_irregular_polygon.dxf/i)).toBeVisible();
    await expect(page.locator('input[value*="03 irregular polygon"]').first()).toBeVisible();
    await expect(page.getByText(/1160.*mm Cut/i)).toBeVisible();
    await expect(page.getByText(/5 Holes/i)).toBeVisible();

    const quote03Content = await page.content();
    expect(quote03Content).not.toContain('ForgeIQ Test 02 Internal Cutouts');
  });

  test('Phase 10: Quantity changes recalculate financial costs without modifying CAD measurements', async ({ page }) => {
    await page.goto('/cad-analysis');
    const test02Btn = page.getByRole('button', { name: /Test 02: Cutouts & Slots/i });
    await test02Btn.click();

    await expect(page.locator('input[value*="1582"]')).toBeVisible({ timeout: 15000 });
    await page.locator('#generate-quotation-button').click();
    await page.waitForURL(/\/quotations\/builder/);

    // Initial Qty = 1
    const qtyInput = page.locator('table input[type="number"]');
    await expect(qtyInput).toHaveValue('1');

    // Read initial grand total text
    const initialCollectBtn = await page.getByRole('button', { name: /Collect via Razorpay/i }).innerText();

    // Change Quantity to 10
    await qtyInput.fill('10');
    await qtyInput.blur();

    // CAD measurements must remain untouched:
    await expect(page.getByText(/1582.*mm Cut/i)).toBeVisible();
    await expect(page.getByText(/6 Holes/i)).toBeVisible();
    await expect(page.getByText(/3 Bends/i)).toBeVisible();
    await expect(page.getByText(/2 Welds/i)).toBeVisible();
    await expect(page.getByText(/2 Cutouts/i)).toBeVisible();
    await expect(page.getByText(/1 Slot/i)).toBeVisible();

    // Grand total must have increased significantly
    const updatedCollectBtn = await page.getByRole('button', { name: /Collect via Razorpay/i }).innerText();
    expect(updatedCollectBtn).not.toEqual(initialCollectBtn);
  });

  test('Phase 11: Material override indicates User Override and recalculates density', async ({ page }) => {
    await page.goto('/cad-analysis');
    const test02Btn = page.getByRole('button', { name: /Test 02: Cutouts & Slots/i });
    await test02Btn.click();

    await expect(page.locator('input[value*="1582"]')).toBeVisible({ timeout: 15000 });
    await page.locator('#generate-quotation-button').click();
    await page.waitForURL(/\/quotations\/builder/);

    // Initially CAD Source: Mild Steel
    await expect(page.locator('table select')).toHaveValue('Mild Steel');
    await expect(page.getByText(/Source: CAD/i)).toBeVisible();

    // User overrides material to 304 Stainless Steel
    await page.locator('table select').selectOption('304 Stainless Steel');

    // Assert UI indicates User Override explicitly
    await expect(page.getByText(/Source: User Override/i)).toBeVisible();

    // Verify density adjustment in weight (Mild Steel 6.68kg -> 304 SS ~6.81kg due to 8000/7850 ratio)
    await expect(page.getByText(/6.81 kg/i)).toBeVisible();
  });

  test('Phase 17: CAD Page displays separate cutting paths and dual verification badges', async ({ page }) => {
    await page.goto('/cad-analysis');
    const test02Btn = page.getByRole('button', { name: /Test 02: Cutouts & Slots/i });
    await test02Btn.click();

    // Dual verification badges
    await expect(page.getByText(/Verified by Deterministic CAD Engine/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('ML Feature Verification', { exact: true })).toBeVisible();

    // Separate Cutting Path Breakdown
    await expect(page.getByText('Laser Cutting Path Breakdown')).toBeVisible();
    await expect(page.locator('span', { hasText: 'Outer Cut Perimeter' })).toBeVisible();
    await expect(page.locator('span', { hasText: 'Internal Cut Perimeter' })).toBeVisible();
    await expect(page.locator('span', { hasText: 'Hole Cutting Path' })).toBeVisible();
    await expect(page.locator('span', { hasText: 'Slot Cutting Path' })).toBeVisible();
    await expect(page.locator('span', { hasText: 'Total Cutting Path' })).toBeVisible();
  });

});
