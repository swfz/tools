import { test, expect } from '@playwright/test';

test.describe('Timer ページ', () => {
  test('/timer ページが表示される', async ({ page }) => {
    await page.goto('/timer');
    await expect(page).toHaveURL(/\/timer/);
  });

  test('タイマーの開始ボタンが存在する', async ({ page }) => {
    await page.goto('/timer');
    const startButton = page.locator('button', { hasText: /start/i });
    await expect(startButton).toBeVisible();
  });
});
