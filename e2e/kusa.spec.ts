import { test, expect, Page } from '@playwright/test';
import sampleEvents from '../sample-github-public-event.json';

const mockGitHubEventsApi = async (page: Page) => {
  await page.route('**/api.github.com/users/*/events*', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(sampleEvents),
    });
  });
};

test.describe('Kusa ページ', () => {
  test('Kusaインデックスページが表示される', async ({ page }) => {
    await page.goto('/kusa');
    await expect(page).toHaveURL(/\/kusa/);
  });

  test('/kusa/swfz にアクセスしてページが表示される', async ({ page }) => {
    await mockGitHubEventsApi(page);
    await page.goto('/kusa/swfz');
    await expect(page.locator('text=swfz\'s kusa')).toBeVisible();
  });

  test('OGメタタグが設定されている', async ({ page }) => {
    await mockGitHubEventsApi(page);
    await page.goto('/kusa/swfz');
    const ogTitle = await page.getAttribute('meta[property="og:title"]', 'content');
    expect(ogTitle).toContain('swfz');
  });

  test('Simple ListタブとGroup By Repoタブが表示される', async ({ page }) => {
    await mockGitHubEventsApi(page);
    await page.goto('/kusa/swfz');
    await expect(page.locator('button:has-text("Simple List")')).toBeVisible();
    await expect(page.locator('button:has-text("Group By Repo")')).toBeVisible();
  });

  test('データロード後にイベント一覧が表示される', async ({ page }) => {
    await mockGitHubEventsApi(page);
    await page.goto('/kusa/swfz');
    await expect(page.locator('text=Recent swfz Events')).toBeVisible({ timeout: 15000 });
  });

  test('excludeチェックボックスが機能する', async ({ page }) => {
    await mockGitHubEventsApi(page);
    await page.goto('/kusa/swfz');
    const checkbox = page.locator('#exclude');
    await expect(checkbox).toBeVisible();
    await checkbox.check();
    await expect(checkbox).toBeChecked();
  });

  test('SSRで計算された貢献統計がページに表示される', async ({ page }) => {
    await mockGitHubEventsApi(page);
    await page.goto('/kusa/swfz');
    // モックサーバーの固定データから算出される期待値:
    // Today=5, Yesterday=3, Streak=7, Coverage=85%
    const statsText = page.locator('text=Today: 5, Yesterday: 3, Streak: 7, Coverage: 85%');
    await expect(statsText).toBeVisible();
  });

  test('OGメタタグのdescriptionに貢献統計が含まれる', async ({ page }) => {
    await mockGitHubEventsApi(page);
    await page.goto('/kusa/swfz');
    const ogDesc = await page.getAttribute('meta[property="og:description"]', 'content');
    expect(ogDesc).toBe('Today: 5, Yesterday: 3, Streak: 7, Coverage: 85%');
  });
});
