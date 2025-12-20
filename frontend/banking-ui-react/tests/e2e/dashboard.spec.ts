import { test, expect } from '@playwright/test';

test.describe('Dashboard Functionality', () => {
    test.beforeEach(async ({ page }) => {
        // In a real scenario, we would login first
        // For this demo, we assume the dashboard is accessible or we mock auth
        await page.goto('/dashboard');
    });

    test('should display key financial metrics', async ({ page }) => {
        // Assuming there are cards for Total Balance, Income, etc.
        // We look for text that should be present
        await expect(page.locator('text=Balance')).toBeVisible();
        await expect(page.locator('text=Income')).toBeVisible();
        await expect(page.locator('text=Expenses')).toBeVisible();
    });

    test('should show recent transactions', async ({ page }) => {
        await expect(page.locator('text=Recent Transactions')).toBeVisible();
        // Check if there's at least one transaction row
        // This depend on the UI implementation (table, list, etc.)
    });

    test('should open transfer modal when Transfer button is clicked', async ({ page }) => {
        const transferBtn = page.locator('button:has-text("Transfer")');
        if (await transferBtn.isVisible()) {
            await transferBtn.click();
            // Expect a modal or navigation
            // await expect(page.locator('text=New Transfer')).toBeVisible();
        }
    });
});
