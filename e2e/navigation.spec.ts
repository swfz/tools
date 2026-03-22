import { test, expect } from '@playwright/test';

test.describe('ナビゲーション', () => {
  test('トップページが表示される', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/tools/i);
  });

  test('サイドバーからTimerページに遷移できる', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Picture in Piscture Timer');
    await expect(page).toHaveURL(/\/timer/);
  });

  test('サイドバーからKusaページに遷移できる', async ({ page }) => {
    await page.goto('/');
    await page.click('text=GitHub kusa');
    await expect(page).toHaveURL(/\/kusa/);
  });

  test('サイドバーからTimelineページに遷移できる', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Hourly Timeline Editor');
    await expect(page).toHaveURL(/\/timeline/);
  });

  test('サイドバーからArrow Flow Generatorページに遷移できる', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Arrow Flow Generator');
    await expect(page).toHaveURL(/\/arrow-flow-generator/);
  });

  test('サイドバーからAnsi Text Displayページに遷移できる', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Ansi Text Display');
    await expect(page).toHaveURL(/\/ansi-text-display/);
  });
});
