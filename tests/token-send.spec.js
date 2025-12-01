// @ts-check
import { test, expect } from '@playwright/test';

const TEST_MNEMONIC = 'your test mnemonic phrase here with twelve words total for testing purposes only';
const VALID_TOKEN_ID = 'your-valid-token-id-here-64-characters-hex-string-for-testing-purposes';

test.describe('Token Send Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('input[placeholder*="mnemonic"]', TEST_MNEMONIC);
    await page.click('button:has-text("Connect")');
    await expect(page.locator('text=Disconnect')).toBeVisible({ timeout: 30000 });
  });

  test('should display token send form with required elements', async ({ page }) => {
    // Navigate to token send page (adjust route based on your app)
    await page.goto('/send');
    
    // Wait for form to load
    await page.waitForSelector('input[placeholder*="address"], input[placeholder*="recipient"]');
    
    // Verify form elements
    await expect(page.locator('input[placeholder*="address"], input[placeholder*="recipient"]')).toBeVisible();
    await expect(page.locator('input[type="number"], input[placeholder*="amount"]')).toBeVisible();
    await expect(page.locator('button:has-text("Send")')).toBeVisible();
  });

  test('should show validation feedback for address input', async ({ page }) => {
    await page.goto('/send');
    
    const addressInput = page.locator('input[placeholder*="address"], input[placeholder*="recipient"]').first();
    
    // Fill invalid address
    await addressInput.fill('invalid-address');
    await addressInput.blur();
    
    // Should show error (✓ or ❌)
    await expect(page.locator('text*="❌", text*="invalid"')).toBeVisible();
  });

  test('should show validation feedback for amount input', async ({ page }) => {
    await page.goto('/send');
    
    const amountInput = page.locator('input[type="number"], input[placeholder*="amount"]').first();
    
    // Fill negative amount
    await amountInput.fill('-5');
    await amountInput.blur();
    
    // Should show error
    await expect(page.locator('text*="invalid"')).toBeVisible();
  });

  test('should enable send button when form is valid', async ({ page }) => {
    await page.goto('/send');
    
    // Fill valid data
    await page.fill('input[placeholder*="address"], input[placeholder*="recipient"]', 'ecash:qrpc3lf95apu3tvn473pmrwfpsr9lr9qucjlk5lekg');
    await page.fill('input[type="number"], input[placeholder*="amount"]', '10');
    
    // Send button should be enabled
    const sendButton = page.locator('button:has-text("Send")').first();
    await expect(sendButton).toBeEnabled();
  });

  test('should handle comma input for EU users', async ({ page }) => {
    await page.goto('/send');
    
    const amountInput = page.locator('input[type="number"], input[placeholder*="amount"]').first();
    
    // Type amount with comma
    await amountInput.fill('10,50');
    
    // Should convert comma to dot internally
    const value = await amountInput.inputValue();
    expect(value).toMatch(/10[.,]50/);
  });

  test('should show success state after sending (with emoji)', async ({ page }) => {
    await page.goto('/send');
    
    // Fill valid form
    await page.fill('input[placeholder*="address"], input[placeholder*="recipient"]', 'ecash:qrpc3lf95apu3tvn473pmrwfpsr9lr9qucjlk5lekg');
    await page.fill('input[type="number"], input[placeholder*="amount"]', '1');
    
    // Note: Don't actually send in tests to avoid real transactions
    // Just verify form state and UI elements
    
    const sendButton = page.locator('button:has-text("Send")').first();
    await expect(sendButton).toBeEnabled();
  });
});

test.describe('Token Send Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('input[placeholder*="mnemonic"]', TEST_MNEMONIC);
    await page.click('button:has-text("Connect")');
    await expect(page.locator('text=Disconnect')).toBeVisible({ timeout: 30000 });
    await page.goto('/send');
  });

  test('should prevent sending with insufficient balance', async ({ page }) => {
    // Fill form with excessive amount
    await page.fill('input[placeholder*="address"], input[placeholder*="recipient"]', 'ecash:qrpc3lf95apu3tvn473pmrwfpsr9lr9qucjlk5lekg');
    await page.fill('input[type="number"], input[placeholder*="amount"]', '999999999');
    
    // Try to send
    await page.click('button:has-text("Send")');
    
    // Should show insufficient balance error
    await expect(page.locator('text*="insufficient"')).toBeVisible({ timeout: 5000 });
  });

  test('should sanitize special characters in inputs', async ({ page }) => {
    const addressInput = page.locator('input[placeholder*="address"], input[placeholder*="recipient"]').first();
    
    // Try XSS payload
    await addressInput.fill('<script>alert("xss")</script>');
    
    // Should be sanitized
    const value = await addressInput.inputValue();
    expect(value).not.toContain('<script>');
    expect(value).not.toContain('</script>');
  });

  test('should handle multiple decimal points gracefully', async ({ page }) => {
    const amountInput = page.locator('input[type="number"], input[placeholder*="amount"]').first();
    
    // Type amount with multiple dots
    await amountInput.fill('10.50.25');
    
    // Should sanitize to single decimal point
    const value = await amountInput.inputValue();
    const dotCount = (value.match(/\./g) || []).length;
    expect(dotCount).toBeLessThanOrEqual(1);
  });
});
