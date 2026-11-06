import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';
import dotenv from 'dotenv';
import { getLoggerConfig, getPlaywrightArtifactSettings } from './helpers/logger';

dotenv.config();

const isCI = ['true', '1', 'yes'].includes((process.env.CI ?? '').trim().toLowerCase());

const parseNumber = (
  value: string | undefined,
  fallback: number | undefined,
): number | undefined => {
  if (value === undefined || value.trim() === '') {
    return fallback;
  }

  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
};

const workers = parseNumber(
  process.env.PW_WORKERS,
  isCI ? 2 : undefined,
);

const retries = parseNumber(
  process.env.PW_RETRIES,
  isCI ? 2 : 0,
);

const outputDir = resolve(process.env.PW_OUTPUT_DIR?.trim() || 'test-results');

const loggerConfig = getLoggerConfig(process.env);
const artifactMode = isCI && loggerConfig.mode === 'NORMAL' ? 'FAILURE' : loggerConfig.mode;
const artifactSettings = getPlaywrightArtifactSettings(artifactMode, {
  trace: 'off',
  screenshot: 'off',
  video: 'off',
});

export default defineConfig({
  testDir: './tests',

  fullyParallel: true,

  forbidOnly: isCI,

  retries,

  workers,

  timeout: 600_000,

  expect: {
    timeout: 100_000,
  },

  reporter: [
    ['./helpers/logger/PlaywrightLoggerReporter.ts'],
    ['html', { open: 'never' }],
    [
      'allure-playwright',
      {
        resultsDir: 'allure-results',
        detail: true,
        suiteTitle: true,
      },
    ],
    [
      'monocart-reporter',
      {
        name: 'HIS Automation Report',
        outputFile: 'monocart-report/index.html',
      },
    ],
  ],

  use: {
    baseURL: process.env.ADMITHIS_APP_URL,
    ...artifactSettings,
    actionTimeout: parseNumber(process.env.PW_ACTION_TIMEOUT, 15_000),
    navigationTimeout: parseNumber(
      process.env.PW_NAVIGATION_TIMEOUT,
      300_000,
    ),
    ignoreHTTPSErrors: true,
    headless: !['true', '1', 'yes'].includes(
      (process.env.PW_HEADED ?? '').trim().toLowerCase(),
    ),
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      use: {
        browserName: 'chromium',
        channel: 'chrome', // <--- اضافه‌کردن این خط برای استفاده از کروم نصب‌شده روی سیستم
      },
    },
    {
      name: 'chrome',
      dependencies: ['setup'],
      use: {
        browserName: 'chromium',
        channel: 'chrome',
        viewport: null,
        launchOptions: { args: ['--start-maximized'] },
        // storageState: '.auth/state.json', // استفاده از Storage State استاندارد پلی‌رایت
      },
    },
  ],

  outputDir,
  preserveOutput: 'failures-only',
});
