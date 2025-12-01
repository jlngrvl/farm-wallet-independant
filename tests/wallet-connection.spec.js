// @ts-check
import { test, expect } from '@playwright/test';

const TEST_MNEMONIC = 'your test mnemonic phrase here with twelve words total for testing purposes only';

test.describe('Wallet Connection Flow', () => {
  test('should display wallet connection screen on initial load', async ({ page }) => {
    await page.goto('/');
    
    // Verify connection form is visible
    await expect(page.locator('input[placeholder*="mnemonic"]')).toBeVisible();
    await expect(page.locator('button:has-text("Connect")')).toBeVisible();
  });

  test('should connect wallet with valid mnemonic', async ({ page }) => {
    await page.goto('/');
    
    // Fill mnemonic
    await page.fill('input[placeholder*="mnemonic"]', TEST_MNEMONIC);
    
    // Click connect
    await page.click('button:has-text("Connect")');
    
    // Wait for wallet to be connected
    await expect(page.locator('text=Disconnect')).toBeVisible({ timeout: 30000 });
  });

  test('should show error for invalid mnemonic', async ({ page }) => {
    await page.goto('/');
    
    // Fill invalid mnemonic
    await page.fill('input[placeholder*="mnemonic"]', 'invalid mnemonic phrase');
    
    // Click connect
    await page.click('button:has-text("Connect")');
    
    // Should show error message
    await expect(page.locator('text*=invalid')).toBeVisible({ timeout: 5000 });
  });

  test('should persist wallet connection on page reload', async ({ page }) => {
    await page.goto('/');
    
    // Connect wallet
    await page.fill('input[placeholder*="mnemonic"]', TEST_MNEMONIC);
    await page.click('button:has-text("Connect")');
    await expect(page.locator('text=Disconnect')).toBeVisible({ timeout: 30000 });
    
    // Reload page
    await page.reload();
    
    // Wallet should remain connected
    await expect(page.locator('text=Disconnect')).toBeVisible({ timeout: 10000 });
  });

  test('should disconnect wallet when disconnect button is clicked', async ({ page }) => {
    await page.goto('/');
    
    // Connect wallet
    await page.fill('input[placeholder*="mnemonic"]', TEST_MNEMONIC);
    await page.click('button:has-text("Connect")');
    await expect(page.locator('text=Disconnect')).toBeVisible({ timeout: 30000 });
    
    // Click disconnect
    await page.click('button:has-text("Disconnect")');
    
    // Should return to connection screen
    await expect(page.locator('input[placeholder*="mnemonic"]')).toBeVisible();
  });
});
