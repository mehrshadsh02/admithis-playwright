import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './tests',

  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  workers: process.env.CI ? 2 : undefined,

  timeout: 60_000,

  expect: {
    timeout: 10_000,
  },

  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],

  use: {
    baseURL: process.env.ADMITHIS_APP_URL,

    trace: 'off',

    screenshot: 'off',

    video: 'off',

    actionTimeout: 15_000,

    navigationTimeout: 30_000,

    ignoreHTTPSErrors: true,

    viewport: {
      width: 1920,
      height: 1080
    }
  },

  projects: [
  {
    name: 'chrome',
    use: {
      ...devices['Desktop Chrome'],
      channel: 'chrome',
    },
  },
],

  outputDir: 'test-results'
});