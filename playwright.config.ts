import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;
const BASE_URL = `http://localhost:${PORT}`;

const config = defineConfig({
  testDir: './e2e/tests',
  globalSetup: './e2e/coverage/global-setup.ts',
  globalTeardown: './e2e/coverage/global-teardown.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 30_000,
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }], ['list']],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `bunx vite --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      // All /api calls are mocked with page.route; the proxy target only needs to be defined.
      VITE_API_BASE_URL: 'http://localhost:5228',
      VITE_DEMO_EMAIL: '',
      VITE_DEMO_PASSWORD: '',
    },
  },
});

export default config;
