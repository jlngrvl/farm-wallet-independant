// @ts-check
import { test, expect } from '@playwright/test';

const TEST_MNEMONIC = 'your test mnemonic phrase here with twelve words total for testing purposes only';

test.describe('QR Code Scanner', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('input[placeholder*="mnemonic"]', TEST_MNEMONIC);
    await page.click('button:has-text("Connect")');
    await expect(page.locator('text=Disconnect')).toBeVisible({ timeout: 30000 });
  });

  test('should display QR scan button on send page', async ({ page }) => {
    await page.goto('/send');
    
    // QR scan button should be visible
    await expect(page.locator('button:has-text("QR"), button:has-text("Scan")')).toBeVisible();
  });

  test('should open QR scanner modal when scan button is clicked', async ({ page }) => {
    await page.goto('/send');
    
    // Click QR scan button
    await page.click('button:has-text("QR"), button:has-text("Scan")');
    
    // Modal should open
    await expect(page.locator('[role="dialog"], .modal, .qr-scanner-modal')).toBeVisible({ timeout: 2000 });
  });

  test('should have close button in QR scanner modal', async ({ page }) => {
    await page.goto('/send');
    
    // Open QR scanner
    await page.click('button:has-text("QR"), button:has-text("Scan")');
    
    // Close button should be visible
    await expect(page.locator('button:has-text("Close"), button:has-text("Cancel"), button[aria-label*="close"]')).toBeVisible();
  });

  test('should close QR scanner when close button is clicked', async ({ page }) => {
    await page.goto('/send');
    
    // Open QR scanner
    await page.click('button:has-text("QR"), button:has-text("Scan")');
    await expect(page.locator('[role="dialog"], .modal, .qr-scanner-modal')).toBeVisible();
    
    // Click close
    await page.click('button:has-text("Close"), button:has-text("Cancel"), button[aria-label*="close"]');
    
    // Modal should close
    await expect(page.locator('[role="dialog"], .modal, .qr-scanner-modal')).not.toBeVisible({ timeout: 2000 });
  });

  test('should close QR scanner when clicking outside modal', async ({ page }) => {
    await page.goto('/send');
    
    // Open QR scanner
    await page.click('button:has-text("QR"), button:has-text("Scan")');
    await expect(page.locator('[role="dialog"], .modal, .qr-scanner-modal')).toBeVisible();
    
    // Click backdrop (outside modal)
    await page.locator('.modal-backdrop, [role="dialog"]').first().click({ position: { x: 5, y: 5 } });
    
    // Modal should close (or remain open depending on your UX choice)
    // Adjust expectation based on your implementation
  });

  test('should request camera permissions', async ({ page, context }) => {
    // Grant camera permissions
    await context.grantPermissions(['camera']);
    
    await page.goto('/send');
    
    // Open QR scanner
    await page.click('button:has-text("QR"), button:has-text("Scan")');
    
    // Camera view should initialize
    await expect(page.locator('video, canvas')).toBeVisible({ timeout: 5000 });
  });

  test('should show error when camera permissions are denied', async ({ page, context }) => {
    // Deny camera permissions
    await context.grantPermissions([]);
    
    await page.goto('/send');
    
    // Open QR scanner
    await page.click('button:has-text("QR"), button:has-text("Scan")');
    
    // Should show permission error (may vary based on your error handling)
    await expect(page.locator('text*="permission", text*="camera", text*="denied"')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('QR Code Display (Receive)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('input[placeholder*="mnemonic"]', TEST_MNEMONIC);
    await page.click('button:has-text("Connect")');
    await expect(page.locator('text=Disconnect')).toBeVisible({ timeout: 30000 });
  });

  test('should display wallet address QR code on dashboard', async ({ page }) => {
    await page.goto('/wallet');
    
    // QR code should be visible (as SVG or canvas)
    await expect(page.locator('svg[role="img"], canvas, .qr-code')).toBeVisible();
  });

  test('should show wallet address below QR code', async ({ page }) => {
    await page.goto('/wallet');
    
    // Address should be displayed
    await expect(page.locator('text*="ecash:"')).toBeVisible();
  });

  test('should have copy button for wallet address', async ({ page }) => {
    await page.goto('/wallet');
    
    // Copy button should be visible
    await expect(page.locator('button:has-text("Copy"), button[aria-label*="copy"]')).toBeVisible();
  });

  test('should copy address to clipboard when copy button is clicked', async ({ page }) => {
    await page.goto('/wallet');
    
    // Click copy button
    await page.click('button:has-text("Copy"), button[aria-label*="copy"]');
    
    // Should show success feedback
    await expect(page.locator('text*="Copied", text*="✓"')).toBeVisible({ timeout: 2000 });
  });
});
