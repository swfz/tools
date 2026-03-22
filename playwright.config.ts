import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3333',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'node e2e/mock-server.mjs',
      url: 'http://localhost:4444',
      reuseExistingServer: !process.env.CI,
      timeout: 10000,
    },
    {
      command: 'npx next dev -p 3333',
      url: 'http://localhost:3333',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      env: {
        CONTRIBUTION_API_URL: 'http://localhost:4444',
      },
    },
  ],
});
