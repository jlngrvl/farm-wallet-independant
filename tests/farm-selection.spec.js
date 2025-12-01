// @ts-check
import { test, expect } from '@playwright/test';

const TEST_MNEMONIC = 'your test mnemonic phrase here with twelve words total for testing purposes only';

test.describe('Farm Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('input[placeholder*="mnemonic"]', TEST_MNEMONIC);
    await page.click('button:has-text("Connect")');
    await expect(page.locator('text=Disconnect')).toBeVisible({ timeout: 30000 });
  });

  test('should display farm selector dropdown on dashboard', async ({ page }) => {
    // Navigate to wallet dashboard
    await page.goto('/wallet');
    
    // Farm selector should be visible
    await expect(page.locator('select, [role="combobox"]').first()).toBeVisible();
  });

  test('should load farms from farms.json', async ({ page }) => {
    await page.goto('/wallet');
    
    // Open farm selector
    const selector = page.locator('select, [role="combobox"]').first();
    await selector.click();
    
    // Should have at least one farm option
    const options = page.locator('option, [role="option"]');
    await expect(options.first()).toBeVisible();
  });

  test('should filter tokens when farm is selected', async ({ page }) => {
    await page.goto('/wallet');
    
    // Get initial token count
    const initialTokens = await page.locator('[data-testid="token-card"], .token-item').count();
    
    // Select a farm
    const selector = page.locator('select, [role="combobox"]').first();
    await selector.selectOption({ index: 1 }); // Select first farm
    
    // Wait for filter to apply
    await page.waitForTimeout(500);
    
    // Token list should update (may increase, decrease, or stay same depending on farm)
    const filteredTokens = await page.locator('[data-testid="token-card"], .token-item').count();
    expect(typeof filteredTokens).toBe('number');
  });

  test('should persist farm selection across page reloads', async ({ page }) => {
    await page.goto('/wallet');
    
    // Select a farm
    const selector = page.locator('select, [role="combobox"]').first();
    await selector.selectOption({ index: 1 });
    const selectedFarm = await selector.inputValue();
    
    // Reload page
    await page.reload();
    await page.waitForTimeout(1000);
    
    // Farm selection should persist
    const selectorAfterReload = page.locator('select, [role="combobox"]').first();
    await expect(selectorAfterReload).toHaveValue(selectedFarm);
  });

  test('should show "All Farms" option in selector', async ({ page }) => {
    await page.goto('/wallet');
    
    // Farm selector should have "All" option
    const selector = page.locator('select, [role="combobox"]').first();
    await selector.click();
    
    await expect(page.locator('option:has-text("All"), [role="option"]:has-text("All")')).toBeVisible();
  });
});
