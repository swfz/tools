import { test, expect } from '@playwright/test';

test.describe('Arrow Flow Generator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/arrow-flow-generator');
  });

  test('項目の追加と設定変更をSVGへ反映する', async ({ page }) => {
    const svg = page.locator('svg:has(polygon#middle)');
    await expect(svg.locator('use')).toHaveCount(3);

    await page.getByRole('button', { name: '+Add Item' }).click();
    await expect(svg.locator('use')).toHaveCount(4);

    await page.locator('#width').fill('640');
    await page.locator('#height').fill('240');
    await page.locator('#itemWidth').fill('120');
    await page.locator('#itemHeight').fill('80');
    await page.locator('#space').fill('5');
    await page.locator('#first-is-arrow').check();
    await page.locator('#last-is-arrow').check();

    await expect(svg).toHaveAttribute('width', '640');
    await expect(svg).toHaveAttribute('height', '240');
    await expect(svg.locator('use').first()).toHaveAttribute('xlink:href', '#middle');
    await expect(svg.locator('use').last()).toHaveAttribute('xlink:href', '#middle');
    await expect(svg.locator('polygon#middle')).toHaveAttribute('points', /120,0 150,40/);
    await expect(svg.locator('use').nth(1)).toHaveAttribute('x', '135');
  });

  test('一括設定と個別設定をSVGへ反映する', async ({ page }) => {
    const svg = page.locator('svg:has(polygon#middle)');
    const textInputs = page.getByPlaceholder('Text');

    await textInputs.first().fill('all');
    await expect(svg.locator('text')).toHaveText(['all', 'all', 'all']);

    await textInputs.nth(2).fill('only-second');
    await expect(svg.locator('text')).toHaveText(['all', 'only-second', 'all']);
  });
});

test.describe('Ansi Text Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ansi-text-display');
  });

  test('生形式の色と改行を表示する', async ({ page }) => {
    const input = page.getByPlaceholder('エスケープシーケンス付きのテキストを入力してください...');
    await input.fill('[31mError[0m\\nDone');

    const result = page.locator('div.min-h-50');
    await expect(result).toContainText('Error');
    await expect(result).toContainText('Done');
    await expect(result.locator('span').filter({ hasText: 'Error' })).toHaveCSS('color', 'rgb(220, 50, 47)');
    await expect(result.locator('br')).toHaveCount(1);
  });

  test('JSON・YAML形式へ変換して表示する', async ({ page }) => {
    const input = page.getByPlaceholder('エスケープシーケンス付きのテキストを入力してください...');
    await input.fill('[32mOK[0m');

    await page.getByText('フォーマット変換').click();
    await page.getByRole('button', { name: 'JSON形式に変換' }).click();
    await expect(input).toHaveValue('\\u001b[32mOK\\u001b[0m');
    await page.locator('select').selectOption('json');
    await expect(page.locator('div.min-h-50')).toContainText('OK');

    await page.getByRole('button', { name: 'YAML形式に変換' }).click();
    await expect(input).toHaveValue('\\e[32mOK\\e[0m');
    await page.locator('select').selectOption('yaml');
    await expect(page.locator('div.min-h-50')).toContainText('OK');
  });

  test('空入力でも結果領域を表示する', async ({ page }) => {
    await expect(page.locator('div.min-h-50')).toBeVisible();
    await expect(page.locator('div.min-h-50')).toBeEmpty();
  });
});

test.describe('Hourly Timeline Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/timeline');
  });

  test('行を追加し開始以上・終了未満の範囲を描画する', async ({ page }) => {
    await page.getByRole('button', { name: '+' }).click();
    const row = page.locator('tbody tr');
    await expect(row).toHaveCount(1);

    await row.locator('.input-name').fill('作業');
    await row.locator('.input-start').fill('01:00');
    await row.locator('.input-end').fill('01:30');
    await expect(row.locator('span').nth(5)).toHaveText('□');
    await expect(row.locator('span').nth(6)).toHaveText('■');
    await expect(row.locator('span').nth(8)).toHaveText('■');
    await expect(row.locator('span').nth(9)).toHaveText('□');
  });

  test('単位時間を変更すると目盛り数を更新する', async ({ page }) => {
    const unit = page.locator('select');
    await expect(page.locator('thead tr').nth(1).locator('td').last().locator('div')).toHaveCount(144);
    await unit.selectOption('60');
    await expect(page.locator('thead tr').nth(1).locator('td').last().locator('div')).toHaveCount(24);
    await unit.selectOption('1');
    await expect(page.locator('thead tr').nth(1).locator('td').last().locator('div')).toHaveCount(1440);
  });
});
