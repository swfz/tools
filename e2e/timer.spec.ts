import { test, expect, Page } from '@playwright/test';

const installCanvasMock = async (page: Page) => {
  await page.addInitScript(() => {
    const calls: string[] = [];
    Object.defineProperty(window, '__timerTextCalls', { value: calls });
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      configurable: true,
      value: () => ({
        clearRect() {},
        fillRect() {},
        strokeRect() {},
        fillText(value: string) {
          calls.push(value);
        },
        createLinearGradient: () => ({ addColorStop() {} }),
      }),
    });
  });
};

test.describe('Timer ページ', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
    await installCanvasMock(page);
  });

  test('開始・一時停止・再開・タイムアップ・リセットを処理する', async ({ page }) => {
    await page.goto('/timer');
    await page.locator('select').nth(2).selectOption('3');
    await page.getByRole('button', { name: 'Start' }).click();
    await page.clock.runFor(1100);
    await expect.poll(() => page.evaluate(() => (window as any).__timerTextCalls.at(-1))).toBe('00:00:02');

    await page.getByRole('button', { name: 'Pause' }).click();
    await page.clock.runFor(2000);
    await expect.poll(() => page.evaluate(() => (window as any).__timerTextCalls.at(-1))).toBe('00:00:02');

    await page.getByRole('button', { name: 'Replay' }).click();
    await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();
    await page.clock.runFor(2100);
    await expect.poll(() => page.evaluate(() => (window as any).__timerTextCalls.at(-1))).toBe('00:00:00');

    await page.getByRole('button', { name: 'Reset' }).click();
    await expect(page.locator('select').nth(2)).toHaveValue('0');
    await expect.poll(() => page.evaluate(() => (window as any).__timerTextCalls.at(-1))).toBe('00:00:00');
  });

  test('通常PiPの非対応環境では操作を無効化する', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(HTMLCanvasElement.prototype, 'captureStream', { value: undefined, configurable: true });
      Object.defineProperty(HTMLVideoElement.prototype, 'requestPictureInPicture', {
        value: undefined,
        configurable: true,
      });
    });
    await page.goto('/timer');
    await expect(page.getByRole('button', { name: 'Picture in Picture', exact: true })).toBeDisabled();
  });

  test('通常PiPの対応環境では映像を生成してPiPを開く', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, '__pipRequests', { value: 0, writable: true });
      HTMLCanvasElement.prototype.captureStream = () => ({}) as MediaStream;
      HTMLMediaElement.prototype.play = async () => {};
      HTMLVideoElement.prototype.requestPictureInPicture = async function () {
        (window as any).__pipRequests += 1;
        return {} as PictureInPictureWindow;
      };
    });
    await page.goto('/timer');
    await page.getByRole('button', { name: 'Picture in Picture', exact: true }).click();
    await page.locator('video').dispatchEvent('loadedmetadata');
    await expect.poll(() => page.evaluate(() => (window as any).__pipRequests)).toBe(1);
  });
});

test.describe('Document Picture in Picture', () => {
  test('非対応環境では両ページの操作を無効化する', async ({ page }) => {
    await page.addInitScript(() => delete (window as any).documentPictureInPicture);

    await page.goto('/timer-dpip');
    await expect(page.getByRole('button', { name: 'Picture in Picture' })).toBeDisabled();
    await page.goto('/document-pinp-react-portal');
    await expect(page.getByRole('button', { name: 'Document PinP' })).toBeDisabled();
  });

  test('対応環境ではウィンドウを開閉する', async ({ page }) => {
    await page.addInitScript(() => {
      let closeCount = 0;
      let requestCount = 0;
      Object.defineProperty(window, '__documentPipCloseCount', { get: () => closeCount });
      Object.defineProperty(window, '__documentPipRequestCount', { get: () => requestCount });
      Object.defineProperty(window, 'documentPictureInPicture', {
        configurable: true,
        value: {
          requestWindow: async () => {
            requestCount += 1;
            const body = document.createElement('div');
            body.id = 'mock-pip-window';
            document.body.appendChild(body);
            return {
              document: { body, head: document.head },
              addEventListener() {},
              close() {
                closeCount += 1;
                body.remove();
              },
            };
          },
        },
      });
    });
    await page.goto('/document-pinp-react-portal');
    const button = page.getByRole('button', { name: 'Document PinP' });
    await expect(button).toBeEnabled();
    await button.click();
    await expect.poll(() => page.evaluate(() => (window as any).__documentPipRequestCount)).toBe(1);
    await button.click();
    await expect.poll(() => page.evaluate(() => (window as any).__documentPipCloseCount)).toBe(1);
    await expect(page.locator('#mock-pip-window')).toHaveCount(0);
  });
});
