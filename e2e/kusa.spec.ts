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
});
